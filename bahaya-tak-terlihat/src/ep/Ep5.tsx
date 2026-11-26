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
export const EP5 = { dur: 63.8, endStart: 59.2, revealAt: 61.53 };

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

/** Ubin keramik di lantai */
const Tile: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={420} height={90} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <path d="M30 10 L390 10 L420 70 L0 70 Z" fill="#E8E2D6" {...S} />
    <path d="M140 10 L130 70 M260 10 L270 70" stroke="#B8AE9C" strokeWidth={6} />
    <path d="M205 10 L198 70" stroke={C.ink} strokeWidth={5} strokeDasharray="10 8" />
  </svg>
);

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

/* ----------------------------------------------------------------- adegan */

const Ep5Scenes: React.FC = () => {
  const t = useT();
  const cam = useShake([
    { t: 0.05, a: 8 },
    { t: 8.95, a: 26 },
    { t: 21.12, a: 18 },
    { t: 35.47, a: 12 },
    { t: 55.31, a: 12 },
  ]);
  const grind = (from: number, to: number) => (t >= from && t < to ? `${(random(`g${Math.floor(t * 60)}`) - 0.5) * 6}px ${(random(`h${Math.floor(t * 60)}`) - 0.5) * 6}px` : "0px 0px");
  return (
    <AbsoluteFill style={{ translate: cam }}>
      {/* 1 — HOOK: potong keramik kering, debu ngebul */}
      <Scene a={0} b={5.95} zoom={false}>
        <Room wall="#4A3A2A" floor="#2E2418" />
        <Tile x={330} y={1020} />
        <div style={{ position: "absolute", left: 90, top: 520, translate: grind(0, 5.95) }}>
          <Worker size={620} expr={t < 3.42 ? "shocked" : "smirk"} pose="holdTool" helmet vest seed={1} />
        </div>
        <div style={{ position: "absolute", left: 360, top: 870, rotate: "-18deg", translate: grind(0, 5.95) }}>
          <Grinder size={330} />
        </div>
        <DustCloud x={640} y={1010} from={0.0} scale={1.15} />
        <Sticker at={0.1} out={3.3} y={290} bg={C.cream} size={68}>
          DEBU KERAMIK NGEBUL 💨
        </Sticker>
        <Sticker at={3.45} y={290} bg={C.yellow} size={56}>
          YANG KELIATAN MASIH MENDING 👌
        </Sticker>
      </Scene>

      {/* 2 — yang bahaya justru yang nggak kelihatan: scanner */}
      <Scene a={5.95} b={8.62}>
        <Room wall="#4A3A2A" floor="#2E2418" dark={interpolate(t, [5.95, 6.4], [0, 0.6], clamp)}>
          <div />
        </Room>
        <Tile x={330} y={1020} />
        <div style={{ position: "absolute", left: 90, top: 520, opacity: 0.55 }}>
          <Worker size={620} expr="normal" pose="holdTool" helmet vest seed={1} />
        </div>
        <DustCloud x={640} y={1010} from={0} fadeAt={5.95} fadeDur={0.9} scale={1.15} />
        <Scanner at={6.85} dur={0.9} top={330} height={850}>
          <Sparkles x={60} y={340} w={960} h={820} n={90} />
          <div style={{ position: "absolute", left: 560, top: 420 }}>
            <SiHalus size={420} variant="dust" />
          </div>
        </Scanner>
        <Sticker at={6.0} y={290} bg={C.bg1} color={C.yellow} size={64}>
          YANG BAHAYA NGGAK KELIATAN 👁️
        </Sticker>
      </Scene>

      {/* 3 — title card */}
      <Scene a={8.62} b={9.9}>
        <Sparkles x={60} y={330} w={960} h={860} n={70} />
        <div style={{ position: "absolute", left: 250, top: 380 }}>
          <Pop at={8.66}>
            <SiHalus size={700} variant="dust" mood="laugh" />
          </Pop>
        </div>
        <Sticker at={8.95} y={1060} bg={C.yellow} size={78} rotate={-5}>
          SI HALUS: DEBU SILIKA
        </Sticker>
      </Scene>

      {/* 4 — 100x lebih kecil dari pasir */}
      <Scene a={9.9} b={13.08}>
        <BigStat at={10.6} from={1} to={100} dur={0.7} suffix="×" label="LEBIH KECIL DARI PASIR PANTAI" y={330} color={C.yellow} />
        <Pop at={12.15} x={110} y={720}>
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
        <Pop at={12.4} x={640} y={720}>
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
        <Pop at={12.6} x={0} y={1180} style={{ width: 1080, textAlign: "center" }}>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 30, color: C.cream, opacity: 0.8 }}>sumber: OSHA</div>
        </Pop>
      </Scene>

      {/* 5 — masuk ujung paru, nggak bisa keluar; paru kaku & berparut */}
      <Scene a={13.08} b={20.4}>
        <Sticker at={13.15} out={17.1} y={290} bg={C.cream} size={64}>
          MASUK SAMPAI UJUNG PARU 🫁
        </Sticker>
        <Sticker at={17.25} y={290} bg={C.pink} color={C.white} size={64}>
          LAMA-LAMA PARU JADI KAKU
        </Sticker>
        <div style={{ position: "absolute", left: 240, top: 420 }}>
          <Lungs
            stiff={interpolate(t, [17.3, 19.0], [0, 1], { ...clamp, easing: easeInOut })}
            particles={interpolate(t, [13.2, 14.0], [0, 1], clamp)}
            scars={interpolate(t, [19.3, 20.2], [0, 1], clamp)}
          />
        </div>
        <Pop at={15.9} out={17.1} x={70} y={600}>
          <div style={{ rotate: "-8deg" }}>
            <Label size={46} color={C.yellow}>
              NGGAK BISA
              <br />
              KELUAR 🔒
            </Label>
          </div>
        </Pop>
        <Pop at={18.71} x={770} y={560}>
          <div style={{ rotate: "6deg" }}>
            <Label size={52} color={C.pink}>
              KAKU
            </Label>
          </div>
        </Pop>
        <Pop at={19.64} x={710} y={900}>
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
      <Scene a={20.4} b={24.4}>
        <div style={{ position: "absolute", left: 240, top: 420, opacity: 0.45 }}>
          <Lungs stiff={1} particles={0} scars={1} />
        </div>
        <Pop at={21.1} x={0} y={560} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
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
        <Sticker at={20.45} out={23.5} y={290} bg={C.cream} size={64}>
          NAMANYA… 🩻
        </Sticker>
        <Sticker at={23.6} y={290} bg={C.pink} color={C.white} size={64}>
          ❌ NGGAK BISA DISEMBUHIN
        </Sticker>
      </Scene>

      {/* 7 — Australia melarang batu buatan */}
      <Scene a={24.4} b={33.28}>
        <Sticker at={24.45} y={290} bg={C.yellow} size={64}>
          SAKING BAHAYANYA… 😳
        </Sticker>
        {t < 30.35 ? (
          <>
            <Pop at={25.5} x={0} y={410} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
              <div style={{ fontFamily: HEAD, fontSize: 96, color: C.cream, WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill", textShadow: `0 10px 0 ${C.ink}` }}>
                🇦🇺 AUSTRALIA
              </div>
            </Pop>
            <Pop at={26.8} x={280} y={560}>
              <Countertop />
            </Pop>
            <Pop at={27.05} x={600} y={560}>
              <Verdict ok={false} size={170} />
            </Pop>
            <Pop at={26.38} x={0} y={890} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
              <div style={{ padding: "14px 40px", borderRadius: 28, background: C.pink, border: `${OUTLINE}px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}`, fontFamily: HEAD, fontSize: 64, color: C.white }}>
                BATU BUATAN DILARANG
              </div>
            </Pop>
            <Pop at={28.55} x={0} y={1040} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
              <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 44, color: C.cream, background: "rgba(0,0,0,0.4)", padding: "8px 28px", borderRadius: 20 }}>
                📅 mulai 1 Juli 2024 · Safe Work Australia
              </div>
            </Pop>
          </>
        ) : (
          <>
            <div style={{ position: "absolute", left: 120, top: 470 }}>
              <Worker size={640} expr="pain" pose="idle" vest shirt="#3D7BFF" seed={2} />
            </div>
            <CoughPuffs x={420} y={560} from={30.5} until={33.3} />
            <Pop at={31.3} x={600} y={640}>
              <div style={{ rotate: "4deg" }}>
                <Label size={56} color={C.yellow}>
                  KENA DI
                  <br />
                  USIA MUDA
                </Label>
              </div>
            </Pop>
            <Pop at={31.3} x={640} y={860}>
              <div style={{ fontFamily: HEAD, fontSize: 110 }}>😢</div>
            </Pop>
          </>
        )}
      </Scene>

      {/* 8 — mitos masker kain */}
      <Scene a={33.28} b={39.68}>
        <Sticker at={33.35} y={290} bg={C.cream} size={64}>
          MASKER KAIN CUKUP? 🤔
        </Sticker>
        <Pop at={33.84} x={330} y={430}>
          <div style={{ rotate: "-6deg" }}>
            <ClothMask size={420} />
          </div>
        </Pop>
        <Pop at={34.2} x={760} y={400}>
          <div style={{ scale: t >= 35.47 ? String(1 + 0.25 * Math.exp(-(t - 35.47) * 8)) : "1" }}>
            <Verdict ok={t < 35.47} size={170} />
          </div>
        </Pop>
        <Pop at={36.59} x={150} y={790}>
          <InfoCard title="😷 MASKER KAIN & BEDAH" value="≠ RESPIRATOR" sub="partikelnya lolos" color={C.pink} w={780} valueSize={96} />
        </Pop>
      </Scene>

      {/* 9 — solusi */}
      <Scene a={39.68} b={50.45}>
        <Sticker at={39.72} y={290} bg={C.yellow} size={76}>
          YANG BENER 👇
        </Sticker>
        <div style={{ position: "absolute", top: 440, left: 80, display: "flex", flexDirection: "column", gap: 34 }}>
          <CheckRow icon="💧" label="Potong basah: air ngalir terus" at={40.58} />
          <CheckRow icon="🌀" label="Alat yang ada penyedot debunya" at={44.27} />
          <CheckRow icon="😷" label="Respirator minimal N95, rapet" at={46.67} />
        </div>
        <div
          style={{
            position: "absolute",
            left: interpolate(t, [41.2, 50.4], [700, 1400], { ...clamp, easing: (x: number) => x * x }),
            top: 980,
            rotate: `${interpolate(t, [41.2, 50.4], [0, 40], clamp)}deg`,
          }}
        >
          <SiHalus size={240} variant="dust" mood="scared" />
        </div>
      </Scene>

      {/* 10 — punchline */}
      <Scene a={50.45} b={EP5.endStart}>
        <Room wall="#4A3A2A" floor="#2E2418" />
        <Tile x={560} y={1020} />
        <div style={{ position: "absolute", left: 70, top: 540, translate: t > 52.1 && t < 53.6 ? `${Math.sin(t * 40) * 6}px 0px` : "0px 0px" }}>
          <Worker size={600} expr={t < 55.3 ? "pain" : "shocked"} pose={t < 53.7 ? "idle" : "shrug"} helmet vest seed={1} />
        </div>
        <CoughPuffs x={330} y={640} from={52.1} until={53.7} />
        <Pop at={53.75} x={330} y={340} out={55.15}>
          <Bubble w={600} tail="left" size={58}>
            “Ah… cuma debu doang 😅”
          </Bubble>
        </Pop>
        <Sticker at={55.31} out={56.95} y={300} bg={C.pink} color={C.white} size={64}>
          JUSTRU ITU MASALAHNYA!
        </Sticker>
        <Scanner at={57.0} dur={0.8} top={330} height={850}>
          <Sparkles x={60} y={340} w={960} h={820} n={70} />
          <div style={{ position: "absolute", left: 640, top: 520 }}>
            <SiHalus size={360} variant="dust" mood="laugh" />
          </div>
        </Scanner>
        <Sticker at={57.05} y={300} bg={C.yellow} size={48}>
          BAHAYANYA YANG NGGAK KELIATAN 👁️
        </Sticker>
      </Scene>
    </AbsoluteFill>
  );
};

export const Ep5: React.FC = () => (
  <Episode ep={5} accent={C.yellow} tint="#3D3422" words={words} endStart={EP5.endStart} revealAt={EP5.revealAt} flashes={[8.95]}>
    <Ep5Scenes />
  </Episode>
);

// dipakai cover (opsional)
export { DustCloud, Lungs, ClothMask };
