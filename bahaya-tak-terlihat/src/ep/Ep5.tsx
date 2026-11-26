import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, random, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode } from "../Episode";
import { BigStat, Pop, Scanner, Sticker, useShake } from "../Kit";
import { Bubble, CheckRow, InfoCard, Room } from "../Props";
import { Scene } from "./Ep1";
import { Grinder } from "./Ep2";
import { words } from "./ep5.words";

/** Waktu = detik VO final EP5 (data/ep5_words.json), tanpa warp */
export const EP5 = { dur: 65.0, endStart: 60.41, revealAt: 62.75 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const S = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/* ------------------------------------------------------------ gambar lokal */

/** Awan debu putih yang membesar dari titik potong */
const DustCloud: React.FC<{ x: number; y: number; from: number; fadeAt?: number; fadeDur?: number; scale?: number }> = ({
  x,
  y,
  from,
  fadeAt = 999,
  fadeDur = 0.8,
  scale = 1,
}) => {
  const t = useT();
  if (t < from) return null;
  const fade = interpolate(t, [fadeAt, fadeAt + fadeDur], [1, 0], clamp);
  if (fade <= 0.01) return null;
  return (
    <svg width={900} height={700} style={{ position: "absolute", left: x - 450, top: y - 500, overflow: "visible", opacity: fade }}>
      {new Array(26).fill(0).map((_, i) => {
        const p = ((t - from) * 0.45 + random(`dc-p-${i}`)) % 1;
        const ang = -Math.PI / 2 + (random(`dc-a-${i}`) - 0.5) * 2.4;
        const dist = 40 + p * 360 * scale;
        const r = (30 + 70 * p) * scale * (0.6 + random(`dc-r-${i}`) * 0.7);
        return (
          <circle
            key={i}
            cx={450 + Math.cos(ang) * dist}
            cy={500 + Math.sin(ang) * dist * 0.8}
            r={r}
            fill="#F4F1EA"
            opacity={0.55 * Math.sin(p * Math.PI) + 0.1}
          />
        );
      })}
    </svg>
  );
};

/** Partikel silika kecil berkilau (hanya terlihat lewat scanner) */
const Sparkles: React.FC<{ x: number; y: number; w: number; h: number; n?: number; color?: string }> = ({ x, y, w, h, n = 60, color = "#F5E6B8" }) => {
  const t = useT();
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      {new Array(n).fill(0).map((_, i) => {
        const px = random(`sp-x-${i}`) * w + Math.sin(t * 0.9 + i) * 18;
        const py = ((random(`sp-y-${i}`) * h - t * 22 * (0.4 + random(`sp-s-${i}`))) % h + h) % h;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 4 + i * 1.7));
        return <circle key={i} cx={px} cy={py} r={2.5 + random(`sp-r-${i}`) * 4} fill={color} opacity={tw} />;
      })}
    </svg>
  );
};

/** Paru-paru sederhana; stiff 0..1 = makin abu & berparut */
const Lungs: React.FC<{ stiff: number; particles: number; scars: number }> = ({ stiff, particles, scars }) => {
  const t = useT();
  const fill = interpolateColors(stiff, [0, 1], ["#FF8FB1", "#8E8590"]);
  const fill2 = interpolateColors(stiff, [0, 1], ["#FF6F9A", "#6E6672"]);
  const tips: [number, number][] = [
    [170, 420], [120, 330], [210, 280], [150, 500], [430, 420], [480, 330], [390, 280], [450, 500],
  ];
  return (
    <svg width={600} height={600} viewBox="0 0 600 600" style={{ overflow: "visible" }}>
      {/* paru kiri & kanan */}
      <path d="M270 150 Q150 130 95 260 Q55 420 110 540 Q200 580 270 520 Z" fill={fill} {...S} />
      <path d="M330 150 Q450 130 505 260 Q545 420 490 540 Q400 580 330 520 Z" fill={fill} {...S} />
      <path d="M250 200 Q160 230 140 330" fill="none" stroke={fill2} strokeWidth={18} strokeLinecap="round" />
      <path d="M350 200 Q440 230 460 330" fill="none" stroke={fill2} strokeWidth={18} strokeLinecap="round" />
      {/* trakea & bronkus */}
      <rect x={280} y={20} width={40} height={170} rx={18} fill="#F4E9E9" {...S} />
      <path d="M300 180 L210 280 L170 420 M210 280 L120 330 M210 280 L150 500 M300 180 L390 280 L430 420 M390 280 L480 330 M390 280 L450 500" fill="none" stroke="#F4E9E9" strokeWidth={10} strokeLinecap="round" />
      {/* alveoli di ujung */}
      {tips.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={16} fill={interpolateColors(stiff, [0, 1], ["#FFC2D4", "#A39AA6"])} stroke={C.ink} strokeWidth={4} />
      ))}
      {/* parut */}
      {scars > 0 &&
        new Array(18).fill(0).map((_, i) => {
          const side = i % 2 ? 1 : -1;
          const cx = 300 + side * (90 + random(`sc-x-${i}`) * 120);
          const cy = 250 + random(`sc-y-${i}`) * 270;
          const show = interpolate(scars, [i / 18, i / 18 + 0.1], [0, 1], clamp);
          return (
            <path key={i} d={`M${cx - 18} ${cy} l12 -10 l12 10 l12 -10`} fill="none" stroke="#3A3040" strokeWidth={5} strokeLinecap="round" opacity={show} />
          );
        })}
      {/* partikel silika menuju ujung paru */}
      {particles > 0 &&
        new Array(16).fill(0).map((_, i) => {
          const tip = tips[i % tips.length];
          const p = Math.min(1, ((t * 0.55 + random(`lp-${i}`)) % 1.3) * particles);
          const mid: [number, number] = tip[0] < 300 ? [210, 280] : [390, 280];
          const [x, y] =
            p < 0.4
              ? [300, 20 + (p / 0.4) * 160]
              : p < 0.7
                ? [300 + (mid[0] - 300) * ((p - 0.4) / 0.3), 180 + (mid[1] - 180) * ((p - 0.4) / 0.3)]
                : [mid[0] + (tip[0] - mid[0]) * ((p - 0.7) / 0.3), mid[1] + (tip[1] - mid[1]) * ((p - 0.7) / 0.3)];
          return <circle key={i} cx={x} cy={y} r={6} fill="#F5E6B8" stroke={C.ink} strokeWidth={2} />;
        })}
    </svg>
  );
};

/** Meja dapur batu (countertop) */
const Countertop: React.FC = () => (
  <svg width={520} height={300} viewBox="0 0 520 300" style={{ overflow: "visible" }}>
    <rect x={20} y={110} width={480} height={170} rx={14} fill="#C9A27A" {...S} />
    <rect x={60} y={150} width={180} height={110} rx={10} fill="#B08660" {...S} />
    <rect x={280} y={150} width={180} height={110} rx={10} fill="#B08660" {...S} />
    <circle cx={150} cy={205} r={9} fill={C.ink} />
    <circle cx={370} cy={205} r={9} fill={C.ink} />
    <rect x={0} y={70} width={520} height={50} rx={14} fill="#F1EEE8" {...S} />
    <path d="M60 85 l40 18 M200 80 l60 24 M360 86 l50 14" stroke="#C9C2B6" strokeWidth={5} strokeLinecap="round" />
    <rect x={380} y={20} width={60} height={50} rx={10} fill="#9AA0B5" {...S} />
  </svg>
);

/** Masker kain */
const ClothMask: React.FC<{ size?: number }> = ({ size = 380 }) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 380 236" style={{ overflow: "visible" }}>
    <path d="M40 70 Q-20 120 40 170" fill="none" stroke={C.ink} strokeWidth={10} />
    <path d="M340 70 Q400 120 340 170" fill="none" stroke={C.ink} strokeWidth={10} />
    <path d="M40 50 Q190 10 340 50 L340 180 Q190 230 40 180 Z" fill="#7FB3E6" {...S} />
    <path d="M60 95 Q190 70 320 95 M60 135 Q190 115 320 135" fill="none" stroke="#5C8FC2" strokeWidth={8} strokeLinecap="round" />
    {new Array(14).fill(0).map((_, i) => (
      <circle key={i} cx={70 + (i % 7) * 40} cy={78 + Math.floor(i / 7) * 80} r={4} fill="#5C8FC2" />
    ))}
  </svg>
);

/** Lingkaran centang / silang */
const Verdict: React.FC<{ ok: boolean; size?: number }> = ({ ok, size = 150 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={44} fill={ok ? C.lime : C.pink} stroke={C.ink} strokeWidth={6} />
    {ok ? (
      <path d="M28 52 L44 67 L73 35" fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M32 32 L68 68 M68 32 L32 68" stroke={C.white} strokeWidth={11} strokeLinecap="round" />
    )}
  </svg>
);

/** Batuk: kepulan kecil dari mulut */
const CoughPuffs: React.FC<{ x: number; y: number; from: number; until: number }> = ({ x, y, from, until }) => {
  const t = useT();
  if (t < from || t > until) return null;
  return (
    <svg width={300} height={200} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      {[0, 1, 2].map((i) => {
        const p = ((t - from) * 1.3 + i / 3) % 1;
        return <circle key={i} cx={20 + p * 180} cy={60 - p * 40 + i * 10} r={14 + p * 26} fill="#EEE8DC" opacity={0.85 * (1 - p)} />;
      })}
      <text x={120} y={10} fontFamily={HEAD} fontSize={52} fill={C.cream} stroke={C.ink} strokeWidth={8} paintOrder="stroke">
        UHUK!
      </text>
    </svg>
  );
};

const Label: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({ children, size = 50, color = C.cream }) => (
  <div style={{ fontFamily: HEAD, fontSize: size, color, WebkitTextStroke: `9px ${C.ink}`, paintOrder: "stroke fill", textShadow: `0 8px 0 ${C.ink}`, textAlign: "center", whiteSpace: "nowrap" }}>
    {children}
  </div>
);

/* ------------------------------------------------- ruang tamu (hook & punchline) */

const Sofa: React.FC = () => (
  <svg width={600} height={300} viewBox="0 0 600 300" style={{ overflow: "visible" }}>
    <rect x={40} y={10} width={520} height={150} rx={40} fill="#C2577A" {...S} />
    <rect x={30} y={130} width={540} height={110} rx={30} fill="#D96A8E" {...S} />
    <rect x={0} y={90} width={90} height={170} rx={36} fill="#B04D6E" {...S} />
    <rect x={510} y={90} width={90} height={170} rx={36} fill="#B04D6E" {...S} />
    <rect x={70} y={250} width={26} height={40} rx={8} fill={C.ink} />
    <rect x={504} y={250} width={26} height={40} rx={8} fill={C.ink} />
  </svg>
);

const Phone: React.FC = () => (
  <svg width={70} height={110} viewBox="0 0 70 110">
    <rect x={4} y={4} width={62} height={102} rx={12} fill="#1C2333" stroke={C.ink} strokeWidth={5} />
    <rect x={12} y={14} width={46} height={78} rx={6} fill={C.cyan} />
  </svg>
);

/** Debu yang hanyut dari pintu teras ke ruang tamu */
const DriftDust: React.FC<{ from: number; fadeAt?: number }> = ({ from, fadeAt = 999 }) => {
  const t = useT();
  if (t < from) return null;
  const fade = interpolate(t, [fadeAt, fadeAt + 0.8], [1, 0], clamp);
  if (fade <= 0.01) return null;
  const reach = interpolate(t, [from, from + 4.2], [0, 1], { ...clamp, easing: easeInOut });
  return (
    <svg width={1080} height={1000} style={{ position: "absolute", left: 0, top: 300, overflow: "visible", opacity: fade }}>
      {new Array(30).fill(0).map((_, i) => {
        const k = random(`dd-k-${i}`);
        if (k > reach + 0.15) return null;
        const p = ((t - from) * 0.35 + random(`dd-p-${i}`)) % 1;
        const x = 820 - k * 680 - p * 60;
        const y = 520 + (random(`dd-y-${i}`) - 0.5) * 360 - p * 40;
        const r = 30 + 60 * random(`dd-r-${i}`) + p * 20;
        return <circle key={i} cx={x} cy={y} r={r} fill="#F4F1EA" opacity={0.32 * Math.sin(p * Math.PI) + 0.08} />;
      })}
    </svg>
  );
};

/** Ruang tamu: dinding, figura, lampu, pintu teras dengan tukang di luar */
const LivingRoom: React.FC<{ dark?: number; worker?: boolean; grindUntil?: number }> = ({ dark = 0, worker = true, grindUntil = 0 }) => {
  const t = useT();
  const jit = t < grindUntil ? `${(random(`lr${Math.floor(t * 60)}`) - 0.5) * 6}px 0px` : "0px 0px";
  return (
    <>
      <Room wall="#3E3460" floor="#2A2140" dark={dark}>
        <div style={{ position: "absolute", left: 70, top: 90, width: 200, height: 140, background: "#2E8B9A", border: `${OUTLINE}px solid ${C.ink}`, borderRadius: 12 }}>
          <div style={{ position: "absolute", left: 30, top: 60, width: 60, height: 50, borderRadius: "50% 50% 0 0", background: C.yellow }} />
          <div style={{ position: "absolute", left: 100, top: 40, width: 70, height: 70, background: "#1F6B76", clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
        </div>
        <div style={{ position: "absolute", left: 470, top: 340, width: 16, height: 260, background: C.ink }} />
        <div style={{ position: "absolute", left: 420, top: 270, width: 120, height: 90, background: C.yellow, border: `${OUTLINE}px solid ${C.ink}`, clipPath: "polygon(20% 0, 80% 0, 100% 100%, 0 100%)" }} />
      </Room>
      {/* pintu teras */}
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 360,
          width: 360,
          height: 680,
          overflow: "hidden",
          border: `${OUTLINE}px solid ${C.ink}`,
          borderRadius: 16,
          background: "linear-gradient(180deg,#BFE3F2 0%,#BFE3F2 62%,#A8946E 62%,#A8946E 100%)",
          opacity: 1 - dark * 0.6,
        }}
      >
        {worker && (
          <>
            <div style={{ position: "absolute", left: 30, top: 200, translate: jit }}>
              <Worker size={400} expr="normal" pose="holdTool" helmet vest seed={3} />
            </div>
            <div style={{ position: "absolute", left: 90, top: 470, rotate: "-16deg", translate: jit }}>
              <Grinder size={200} spin={t < grindUntil} />
            </div>
          </>
        )}
      </div>
    </>
  );
};

/** Bang Jo santai di sofa (badan bawah tertutup sofa) */
const JoOnSofa: React.FC<{ expr: "happy" | "smirk" | "pain" | "shocked" | "normal"; phone?: boolean; shake?: boolean }> = ({ expr, phone = true, shake }) => {
  const t = useT();
  return (
    <>
      <div style={{ position: "absolute", left: 150, top: 560, translate: shake ? `${Math.sin(t * 40) * 6}px 0px` : "0px 0px" }}>
        <Worker size={520} expr={expr} pose="holdTool" shirt={C.lime} seed={1} />
      </div>
      {phone && (
        <div style={{ position: "absolute", left: 270, top: 860, rotate: "-8deg" }}>
          <Phone />
        </div>
      )}
      <div style={{ position: "absolute", left: 40, top: 930 }}>
        <Sofa />
      </div>
    </>
  );
};

/** Kartu kecil material (keramik/beton/batu) */
const Material: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      width: 400,
      padding: "14px 24px",
      borderRadius: 30,
      background: C.cream,
      border: `${OUTLINE}px solid ${C.ink}`,
      boxShadow: `0 10px 0 ${C.ink}`,
      fontFamily: HEAD,
      fontSize: 58,
      color: C.ink,
    }}
  >
    <span style={{ fontSize: 70 }}>{icon}</span>
    {label}
  </div>
);

/* ----------------------------------------------------------------- adegan */

const Ep5Scenes: React.FC = () => {
  const t = useT();
  const cam = useShake([
    { t: 0.05, a: 8 },
    { t: 11.91, a: 26 },
    { t: 22.15, a: 18 },
    { t: 36.9, a: 12 },
    { t: 56.8, a: 12 },
  ]);
  return (
    <AbsoluteFill style={{ translate: cam }}>
      {/* 1 — HOOK: renovasi rumah, debu sampai ruang tamu, kamu santai aja */}
      <Scene a={0} b={9.32} zoom={false}>
        <LivingRoom grindUntil={9.32} />
        <JoOnSofa expr={t < 5.12 ? "normal" : "happy"} />
        <DriftDust from={0.3} />
        <Sticker at={0.1} out={4.35} y={290} bg={C.cream} size={68}>
          RENOVASI RUMAH 🏠🔨
        </Sticker>
        <Sticker at={4.43} out={5.05} y={290} bg={C.yellow} size={42}>
          DEBUNYA SAMPAI RUANG TAMU 💨
        </Sticker>
        <Sticker at={5.12} out={6.5} y={290} bg={C.pink} color={C.white} size={68}>
          KAMU SANTAI AJA? 😅
        </Sticker>
        <Sticker at={6.57} y={290} bg={C.yellow} size={56}>
          YANG KELIATAN MASIH MENDING 👌
        </Sticker>
      </Scene>

      {/* 2 — yang bahaya justru yang nggak kelihatan: scanner */}
      <Scene a={9.32} b={11.7}>
        <LivingRoom dark={interpolate(t, [9.32, 9.8], [0, 0.6], clamp)} grindUntil={11.7} />
        <div style={{ opacity: 0.55 }}>
          <JoOnSofa expr="happy" />
        </div>
        <DriftDust from={0.3} fadeAt={9.32} />
        <Scanner at={9.7} dur={0.9} top={330} height={850}>
          <Sparkles x={60} y={340} w={960} h={820} n={90} />
          <div style={{ position: "absolute", left: 560, top: 420 }}>
            <SiHalus size={420} variant="dust" />
          </div>
        </Scanner>
        <Sticker at={9.37} y={290} bg={C.bg1} color={C.yellow} size={64}>
          YANG BAHAYA NGGAK KELIATAN 👁️
        </Sticker>
      </Scene>

      {/* 3 — title card */}
      <Scene a={11.7} b={12.8}>
        <Sparkles x={60} y={330} w={960} h={860} n={70} />
        <div style={{ position: "absolute", left: 250, top: 380 }}>
          <Pop at={11.72}>
            <SiHalus size={700} variant="dust" mood="laugh" />
          </Pop>
        </div>
        <Sticker at={11.91} y={1060} bg={C.yellow} size={78} rotate={-5}>
          SI HALUS: DEBU SILIKA
        </Sticker>
      </Scene>

      {/* 4 — 100x lebih kecil dari pasir */}
      <Scene a={12.8} b={15.42}>
        <BigStat at={12.85} from={1} to={100} dur={0.9} suffix="×" label="LEBIH KECIL DARI PASIR PANTAI" y={330} color={C.yellow} />
        <Pop at={14.5} x={110} y={720}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <svg width={340} height={340} viewBox="0 0 340 340">
              <path d="M170 20 Q300 40 320 170 Q300 300 170 320 Q40 300 20 170 Q40 40 170 20 Z" fill="#E3C38A" {...S} />
              <circle cx={120} cy={120} r={14} fill="#F3DDB0" />
              <circle cx={210} cy={210} r={10} fill="#C9A66A" />
              <circle cx={230} cy={110} r={8} fill="#C9A66A" />
            </svg>
            <Label size={46}>🏖️ PASIR PANTAI</Label>
          </div>
        </Pop>
        <Pop at={14.75} x={640} y={720}>
          <div style={{ width: 340, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <div style={{ width: 340, height: 340, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.yellow, boxShadow: `0 0 30px 12px rgba(255,210,63,0.55)` }} />
              <div style={{ position: "absolute", top: 70, left: 175, fontFamily: HEAD, fontSize: 60, color: C.yellow, rotate: "20deg" }}>↙</div>
            </div>
            <Label size={46} color={C.yellow}>
              ✨ DEBU SILIKA
            </Label>
          </div>
        </Pop>
        <Pop at={14.9} x={0} y={1180} style={{ width: 1080, textAlign: "center" }}>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 30, color: C.cream, opacity: 0.8 }}>sumber: OSHA</div>
        </Pop>
      </Scene>

      {/* 5 — masuk ujung paru, nggak bisa keluar; paru kaku & berparut */}
      <Scene a={15.42} b={21.55}>
        <Sticker at={15.45} out={18.75} y={290} bg={C.cream} size={64}>
          MASUK SAMPAI UJUNG PARU 🫁
        </Sticker>
        <Sticker at={18.82} y={290} bg={C.pink} color={C.white} size={64}>
          LAMA-LAMA PARU JADI KAKU
        </Sticker>
        <div style={{ position: "absolute", left: 240, top: 420 }}>
          <Lungs
            stiff={interpolate(t, [18.9, 20.5], [0, 1], { ...clamp, easing: easeInOut })}
            particles={interpolate(t, [15.5, 16.3], [0, 1], clamp)}
            scars={interpolate(t, [20.8, 21.5], [0, 1], clamp)}
          />
        </div>
        <Pop at={17.56} out={18.75} x={70} y={600}>
          <div style={{ rotate: "-8deg" }}>
            <Label size={46} color={C.yellow}>
              NGGAK BISA
              <br />
              KELUAR 🔒
            </Label>
          </div>
        </Pop>
        <Pop at={20.04} x={770} y={560}>
          <div style={{ rotate: "6deg" }}>
            <Label size={52} color={C.pink}>
              KAKU
            </Label>
          </div>
        </Pop>
        <Pop at={20.87} x={710} y={900}>
          <div style={{ rotate: "-4deg" }}>
            <Label size={44} color={C.cream}>
              JARINGAN
              <br />
              PARUT
            </Label>
          </div>
        </Pop>
      </Scene>

      {/* 6 — SILIKOSIS, nggak bisa disembuhin */}
      <Scene a={21.55} b={25.05}>
        <div style={{ position: "absolute", left: 240, top: 420, opacity: 0.45 }}>
          <Lungs stiff={1} particles={0} scars={1} />
        </div>
        <Pop at={22.15} x={0} y={560} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              fontFamily: HEAD,
              fontSize: 150,
              color: C.pink,
              padding: "10px 50px 20px",
              border: `14px solid ${C.pink}`,
              borderRadius: 30,
              rotate: "-8deg",
              background: "rgba(20,11,36,0.75)",
              letterSpacing: 4,
            }}
          >
            SILIKOSIS
          </div>
        </Pop>
        <Sticker at={21.6} out={22.95} y={290} bg={C.cream} size={64}>
          NAMANYA… 🩻
        </Sticker>
        <Sticker at={23.02} y={290} bg={C.pink} color={C.white} size={64}>
          ❌ NGGAK BISA DISEMBUHIN
        </Sticker>
      </Scene>

      {/* 7 — yang paling kena: tukang & pekerja */}
      <Scene a={25.05} b={29.8}>
        <Sticker at={25.1} y={290} bg={C.yellow} size={50}>
          PALING KENA: TUKANG & PEKERJA 👷
        </Sticker>
        <div style={{ position: "absolute", left: 40, top: 470 }}>
          <Worker size={620} expr="pain" pose="holdTool" helmet vest shirt="#3D7BFF" seed={2} />
        </div>
        <div style={{ position: "absolute", left: 130, top: 860, rotate: "-14deg" }}>
          <Grinder size={240} spin />
        </div>
        <CoughPuffs x={300} y={560} from={26.0} until={29.8} />
        <Pop at={28.12} x={590} y={470}>
          <Material icon="🟫" label="KERAMIK" />
        </Pop>
        <Pop at={28.7} x={590} y={680}>
          <Material icon="🧱" label="BETON" />
        </Pop>
        <Pop at={29.23} x={590} y={890}>
          <Material icon="🪨" label="BATU" />
        </Pop>
      </Scene>

      {/* 8 — Australia melarang batu buatan */}
      <Scene a={29.8} b={35.02}>
        <Sticker at={29.84} y={290} bg={C.yellow} size={64}>
          SAKING BAHAYANYA… 😳
        </Sticker>
        <Pop at={31.16} x={0} y={410} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: HEAD, fontSize: 96, color: C.cream, WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill", textShadow: `0 10px 0 ${C.ink}` }}>
            🇦🇺 AUSTRALIA
          </div>
        </Pop>
        <Pop at={30.1} x={280} y={560}>
          <Countertop />
        </Pop>
        <Pop at={32.69} x={600} y={560}>
          <Verdict ok={false} size={170} />
        </Pop>
        <Pop at={31.68} x={0} y={890} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "14px 40px", borderRadius: 28, background: C.pink, border: `${OUTLINE}px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}`, fontFamily: HEAD, fontSize: 64, color: C.white }}>
            BATU BUATAN DILARANG
          </div>
        </Pop>
        <Pop at={33.7} x={0} y={1040} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 44, color: C.cream, background: "rgba(0,0,0,0.4)", padding: "8px 28px", borderRadius: 20 }}>
            📅 mulai 1 Juli 2024 · Safe Work Australia
          </div>
        </Pop>
      </Scene>

      {/* 9 — mitos masker kain */}
      <Scene a={35.02} b={40.72}>
        <Sticker at={35.07} y={290} bg={C.cream} size={64}>
          MASKER KAIN CUKUP? 🤔
        </Sticker>
        <Pop at={35.2} x={330} y={430}>
          <div style={{ rotate: "-6deg" }}>
            <ClothMask size={420} />
          </div>
        </Pop>
        <Pop at={36.2} x={760} y={400}>
          <div style={{ scale: t >= 36.9 ? String(1 + 0.25 * Math.exp(-(t - 36.9) * 8)) : "1" }}>
            <Verdict ok={t < 36.9} size={170} />
          </div>
        </Pop>
        <Pop at={37.91} x={150} y={790}>
          <InfoCard title="😷 MASKER KAIN & BEDAH" value="≠ RESPIRATOR" sub="partikelnya lolos" color={C.pink} w={780} valueSize={96} />
        </Pop>
      </Scene>

      {/* 10 — tips di rumah */}
      <Scene a={40.72} b={46.52}>
        <Sticker at={40.77} y={290} bg={C.yellow} size={72}>
          KALAU DI RUMAH 🏠
        </Sticker>
        <div style={{ position: "absolute", top: 450, left: 80, display: "flex", flexDirection: "column", gap: 34 }}>
          <CheckRow icon="🚪" label="Tutup pintunya" at={42.83} />
          <CheckRow icon="👶" label="Jauhin anak-anak" at={43.8} />
          <CheckRow icon="💧" label="Minta tukang motong pakai air" at={45.62} />
        </div>
        <Pop at={41.0} out={42.7} x={0} y={520} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
          <svg width={360} height={320} viewBox="0 0 360 320">
            <path d="M30 150 L180 30 L330 150 Z" fill={C.pink} {...S} />
            <rect x={60} y={150} width={240} height={150} fill={C.cream} {...S} />
            <rect x={150} y={200} width={60} height={100} fill="#8B5E3C" {...S} />
            <rect x={80} y={180} width={50} height={50} fill={C.cyan} {...S} />
            <rect x={230} y={180} width={50} height={50} fill={C.cyan} {...S} />
          </svg>
        </Pop>
      </Scene>

      {/* 11 — tips buat tukang */}
      <Scene a={46.52} b={52.4}>
        <Sticker at={46.58} y={290} bg={C.yellow} size={72}>
          BUAT TUKANGNYA 👷
        </Sticker>
        <div style={{ position: "absolute", top: 450, left: 80, display: "flex", flexDirection: "column", gap: 34 }}>
          <CheckRow icon="🌀" label="Alat yang ada penyedot debunya" at={48.27} />
          <CheckRow icon="😷" label="Respirator minimal N95, rapet" at={49.38} />
        </div>
        <Pop at={46.8} x={90} y={780}>
          <Worker size={420} expr="happy" pose="wave" helmet vest seed={4} />
        </Pop>
        <div
          style={{
            position: "absolute",
            left: interpolate(t, [48.6, 52.4], [640, 1400], { ...clamp, easing: (x: number) => x * x }),
            top: 860,
            rotate: `${interpolate(t, [48.6, 52.4], [0, 40], clamp)}deg`,
          }}
        >
          <SiHalus size={280} variant="dust" mood="scared" />
        </div>
      </Scene>

      {/* 12 — punchline: abis renovasi batuk-batuk */}
      <Scene a={52.4} b={EP5.endStart}>
        <LivingRoom worker={false} />
        <JoOnSofa expr={t < 56.8 ? "pain" : "shocked"} phone={false} shake={t > 53.9 && t < 54.9} />
        <CoughPuffs x={420} y={600} from={53.9} until={54.95} />
        <Pop at={54.92} x={300} y={350} out={56.7}>
          <Bubble w={620} tail="left" size={58}>
            “Ah… cuma debu doang 😅”
          </Bubble>
        </Pop>
        <Sticker at={56.8} out={58.25} y={300} bg={C.pink} color={C.white} size={64}>
          JUSTRU ITU MASALAHNYA!
        </Sticker>
        <Scanner at={58.32} dur={0.8} top={330} height={850}>
          <Sparkles x={60} y={340} w={960} h={820} n={70} />
          <div style={{ position: "absolute", left: 640, top: 520 }}>
            <SiHalus size={360} variant="dust" mood="laugh" />
          </div>
        </Scanner>
        <Sticker at={58.35} y={300} bg={C.yellow} size={48}>
          BAHAYANYA YANG NGGAK KELIATAN 👁️
        </Sticker>
      </Scene>
    </AbsoluteFill>
  );
};

export const Ep5: React.FC = () => (
  <Episode ep={5} accent={C.yellow} tint="#3D3422" words={words} endStart={EP5.endStart} revealAt={EP5.revealAt} flashes={[11.91]}>
    <Ep5Scenes />
  </Episode>
);

// dipakai cover (opsional)
export { DustCloud, Lungs, ClothMask };
