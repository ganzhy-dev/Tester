import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut, easeOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode, warpOldToNew } from "../Episode";
import { Pop, Scanner, Sticker, useShake } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep12.words";
import { warp } from "./ep12.warp";

/**
 * EP12 "Lantai Kamar Mandi Basah?" — jatuh di rumah (lansia).
 * Semua waktu = detik isi utama (data/ep12_words.json). Timing masih PERKIRAAN (VO direkam user nanti, lalu di-warp),
 * jadi tiap beat berdiri sendiri dan berpatokan ke awal kalimat. Tema HANGAT/terang — teks gelap di latar terang.
 */
export const EP12 = { endStart: 56.75, revealAt: 59.85 };

const TEAL = "#2FA7B8";
const SAGE = "#7A9E7E";
const SH = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const KAKEK = { hair: "#D9D9E0", shirt: SAGE, pants: "#3B3B4F" } as const;
const NENEK = { hijab: "#8E7DBE", shirt: "#D98C6A", pants: "#4A3B5C" } as const;
const CUCU = { hair: "#2A1B12", shirt: "#49B6E8", pants: "#2E3557" } as const;
/** skala Worker: viewBox 400 x 620 */
const K = (size: number) => size / 620;

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

/* ----------------------------------------------------------- gambar lokal */

/** Ruangan hangat (dinding krem, lantai kayu) — `dim` menggelapkan lembut, bukan hitam */
const Room: React.FC<{ children?: React.ReactNode; dim?: number; wall?: string; floor?: string; tiles?: boolean }> = ({
  children,
  dim = 0,
  wall = "#F3E6D2",
  floor = "#D9AE86",
  tiles = false,
}) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 880, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: wall }}>
    {tiles && (
      <svg width={1000} height={880} style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        {[...Array(9)].map((_, i) => (
          <line key={`h${i}`} x1={0} x2={1000} y1={i * 96} y2={i * 96} stroke="#7FB3AC" strokeWidth={4} />
        ))}
        {[...Array(11)].map((_, i) => (
          <line key={`v${i}`} y1={0} y2={690} x1={i * 96} x2={i * 96} stroke="#7FB3AC" strokeWidth={4} />
        ))}
      </svg>
    )}
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 190, background: floor, borderTop: `${OUTLINE}px solid ${C.ink}` }} />
    {children}
    {dim > 0 && <div style={{ position: "absolute", inset: 0, background: "#3A3550", opacity: dim }} />}
  </div>
);

/** Lampu bohlam redup (cahaya kuning hangat yang berkedip pelan) */
const Bulb: React.FC<{ x: number; y: number; level?: number }> = ({ x, y, level = 0.5 }) => {
  const t = useT();
  const fl = level * (0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 3.1));
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      <div style={{ position: "absolute", left: -160, top: -110, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,214,120,${0.75 * fl}) 0%, rgba(255,214,120,0) 70%)` }} />
      <svg width={80} height={130} viewBox="0 0 80 130" style={{ position: "relative" }}>
        <line x1={40} y1={0} x2={40} y2={40} stroke={C.ink} strokeWidth={6} />
        <rect x={26} y={36} width={28} height={20} rx={4} fill="#9AA1AE" {...SH} strokeWidth={5} />
        <circle cx={40} cy={82} r={30} fill={`rgba(255,${200 + 40 * fl},${110 + 60 * fl},1)`} {...SH} strokeWidth={5} />
      </svg>
    </div>
  );
};

/** Genangan air berkilau */
const Puddle: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 260 }) => {
  const t = useT();
  return (
    <svg width={w} height={70} viewBox={`0 0 ${w} 70`} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <ellipse cx={w / 2} cy={35} rx={w / 2 - 6} ry={26} fill="#A9E4F2" opacity={0.85} stroke="#5FBFD6" strokeWidth={5} />
      <ellipse cx={w * 0.35 + 10 * Math.sin(t * 2)} cy={28} rx={w * 0.12} ry={6} fill="#FFFFFF" opacity={0.8} />
    </svg>
  );
};

/** Tetes air jatuh dari keran */
const Drip: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const t = useT();
  const p = (t * 0.9) % 1;
  return (
    <div style={{ position: "absolute", left: x, top: y + p * 220, opacity: 1 - p * 0.6, fontSize: 40 }}>
      <svg width={30} height={42} viewBox="0 0 30 42">
        <path d="M15 2 Q2 22 4 30 A11 11 0 0 0 26 30 Q28 22 15 2 Z" fill="#8FD8EA" stroke={C.ink} strokeWidth={4} />
      </svg>
    </div>
  );
};

/** Sandal karet */
const Slipper: React.FC<{ size?: number; color?: string }> = ({ size = 150, color = "#E86A5B" }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 150 75">
    <path d="M10 40 Q10 14 50 14 L110 14 Q144 14 144 40 Q144 64 110 64 L50 64 Q10 64 10 40 Z" fill={color} {...SH} strokeWidth={6} />
    <path d="M60 18 Q80 44 100 18" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
  </svg>
);

/** Pintu kamar mandi */
const Door: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={230} height={500} viewBox="0 0 230 500" style={{ position: "absolute", left: x, top: y }}>
    <rect x={8} y={8} width={214} height={484} rx={14} fill="#C9A27E" {...SH} />
    <rect x={40} y={50} width={150} height={120} rx={10} fill="#BFE6E2" {...SH} strokeWidth={5} />
    <circle cx={186} cy={270} r={14} fill="#F2C14E" {...SH} strokeWidth={5} />
    <text x={115} y={124} textAnchor="middle" fontFamily="Baloo2" fontWeight={800} fontSize={44} fill={C.ink}>
      🚿
    </text>
  </svg>
);

/** Tulang panggul sederhana + retakan */
const HipBone: React.FC<{ crack: number }> = ({ crack }) => (
  <svg width={380} height={330} viewBox="0 0 380 330">
    <path d="M40 60 Q60 10 130 30 Q170 44 190 80 Q210 44 250 30 Q320 10 340 60 Q360 130 290 170 Q240 200 190 190 Q140 200 90 170 Q20 130 40 60 Z" fill="#FFF4E2" {...SH} />
    <circle cx={120} cy={118} r={26} fill="#F3E6D2" {...SH} strokeWidth={5} />
    <circle cx={260} cy={118} r={26} fill="#F3E6D2" {...SH} strokeWidth={5} />
    <path d="M100 160 L70 300 Q66 318 86 320 L110 320 Q126 318 122 300 L140 176" fill="#FFF4E2" {...SH} />
    <path d="M280 160 L310 300 Q314 318 294 320 L270 320 Q254 318 258 300 L240 176" fill="#FFF4E2" {...SH} />
    <path
      d="M84 214 L104 226 L90 240 L110 252"
      fill="none"
      stroke="#E0453A"
      strokeWidth={8}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={90}
      strokeDashoffset={90 * (1 - crack)}
    />
  </svg>
);

/** Walker (alat bantu jalan) */
const Walker: React.FC = () => (
  <svg width={260} height={330} viewBox="0 0 260 330">
    <path d="M40 40 L220 40" stroke="#9AA1AE" strokeWidth={18} strokeLinecap="round" />
    <path d="M50 40 L30 300 M210 40 L230 300 M42 150 L218 150" stroke="#9AA1AE" strokeWidth={14} strokeLinecap="round" />
    <path d="M40 40 L220 40 M50 40 L30 300 M210 40 L230 300 M42 150 L218 150" stroke={C.ink} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
    <circle cx={30} cy={306} r={16} fill="#5E6675" stroke={C.ink} strokeWidth={5} />
    <circle cx={230} cy={306} r={16} fill="#5E6675" stroke={C.ink} strokeWidth={5} />
  </svg>
);

/** Label kartu (teks gelap di latar terang) */
const Tag: React.FC<{ children: React.ReactNode; bg?: string; size?: number; rot?: number }> = ({ children, bg = C.cream, size = 40, rot = -2 }) => (
  <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: size, color: C.ink, background: bg, padding: "8px 22px 10px", borderRadius: 20, border: `6px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, rotate: `${rot}deg`, whiteSpace: "nowrap" }}>{children}</div>
);

const Source: React.FC<{ children: React.ReactNode; y?: number }> = ({ children, y = 1130 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 28, color: "#3E5A55" }}>{children}</div>
);

/** Angka besar dengan pemisah ribuan Indonesia */
const Stat: React.FC<{ at: number; to: number; dur?: number; suffix?: string; label: string; y: number; color: string; size?: number }> = ({ at, to, dur = 1.3, suffix = "", label, y, color, size = 210 }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const v = interpolate(t, [at, at + dur], [0, to], { ...clamp, easing: easeOut });
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 11, stiffness: 200 } });
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", scale: String(interpolate(s, [0, 1], [0.5, 1])) }}>
      <div style={{ fontFamily: HEAD, fontSize: size, lineHeight: 1, color, WebkitTextStroke: `16px ${C.ink}`, paintOrder: "stroke fill", textShadow: `0 14px 0 ${C.ink}`, fontVariantNumeric: "tabular-nums" }}>
        {Math.round(v).toLocaleString("id-ID")}
        {suffix}
      </div>
      <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 48, color: C.ink, marginTop: 6, letterSpacing: 2 }}>{label}</div>
    </div>
  );
};

/** Baris ceklis ringkas (6 baris muat di zona utama) */
const Row: React.FC<{ icon: string; label: string; at: number; idx: number }> = ({ icon, label, at, idx }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 14, stiffness: 210 } });
  const tick = interpolate(t, [at + 0.15, at + 0.45], [0, 1], clamp);
  const active = t < at + 1.2;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        top: 440 + idx * 112,
        width: 940,
        height: 96,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 22px",
        borderRadius: 28,
        background: active ? "#FFF3D6" : "#FFFDF8",
        border: `6px solid ${C.ink}`,
        boxShadow: `0 7px 0 ${C.ink}`,
        translate: `${interpolate(s, [0, 1], [900, 0])}px 0px`,
        scale: active ? String(1 + 0.02 * Math.sin((t - at) * 8)) : "1",
      }}
    >
      <div style={{ fontSize: 54, width: 64, textAlign: "center" }}>{icon}</div>
      <div style={{ flex: 1, fontFamily: BODY, fontWeight: 800, fontSize: 40, color: C.ink, lineHeight: 1.05 }}>{label}</div>
      <svg width={70} height={70} viewBox="0 0 90 90">
        <circle cx={45} cy={45} r={38} fill={C.lime} stroke={C.ink} strokeWidth={7} />
        <path d="M26 46 L40 60 L66 32" fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={70} strokeDashoffset={70 * (1 - tick)} />
      </svg>
    </div>
  );
};

/** Hati melayang lembut */
const FloatHearts: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  if (t < at) return null;
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const p = ((t - at) * 0.35 + i / 6) % 1;
        return (
          <div key={i} style={{ position: "absolute", left: 140 + i * 140 + Math.sin(t * 1.5 + i) * 30, top: 1060 - p * 650, fontSize: 46 + (i % 3) * 14, opacity: Math.sin(p * Math.PI) * 0.85 }}>
            💛
          </div>
        );
      })}
    </>
  );
};

/** Kakek + cucu bergandengan: tangan kanan kakek (pose idle) bertemu tangan kiri cucu */
const HandInHand: React.FC<{ x: number; y: number; sizeA: number; sizeB: number; a: Record<string, unknown>; b: Record<string, unknown>; exprA?: "happy" | "normal"; walk?: number }> = ({
  x,
  y,
  sizeA,
  sizeB,
  a,
  b,
  exprA = "happy",
  walk = 0,
}) => {
  // tangan kanan pose idle ≈ (318, 482), tangan kiri ≈ (82, 482) dalam viewBox 400x620
  const hx = x + 318 * K(sizeA);
  const hy = y + 482 * K(sizeA);
  const bx = hx - 82 * K(sizeB);
  const by = hy - 482 * K(sizeB);
  const bob = Math.sin(walk * 6) * 6;
  return (
    <>
      <div style={{ position: "absolute", left: x, top: y + bob }}>
        <Worker size={sizeA} pose="idle" expr={exprA} {...(a as object)} seed={7} />
      </div>
      <div style={{ position: "absolute", left: bx, top: by - bob }}>
        <Worker size={sizeB} pose="idle" expr="happy" {...(b as object)} seed={3} />
      </div>
      <div style={{ position: "absolute", left: hx - 30, top: hy - 30 + bob * 0, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,210,120,0.55)", filter: "blur(6px)" }} />
    </>
  );
};

/* ----------------------------------------------------------------- adegan */
const Ep12Scenes: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const shake = useShake([
    { t: 5.75, a: 14 },
    { t: 17.5, a: 16 },
    { t: 9.4, a: 8 },
  ]);
  const walk1 = interpolate(t, [0, 2.9], [0, 1], clamp);
  const hurry = interpolate(t, [4.6, 5.6], [0, 1], clamp);
  const slip = interpolate(t, [5.73, 6.25], [0, 1], { ...clamp, easing: easeOut });
  const freeze = t >= 6.25 && t < 6.47;
  const crack = interpolate(t, [9.6, 10.3], [0, 1], clamp);
  const rank2 = spring({ frame: (t - 21.0) * fps, fps, config: { damping: 10, stiffness: 160 } });
  const glow = interpolate(t, [51.6, 52.8], [0, 1], { ...clamp, easing: easeInOut });
  const sepia = interpolate(t, [54.5, 55.3], [1, 0], { ...clamp, easing: easeInOut });
  const walkNow = interpolate(t, [55.0, 56.9], [0, 1], clamp);
  const kakekWalk = interpolate(t, [49.1, 51.4], [0, 1], { ...clamp, easing: easeInOut });

  return (
    <AbsoluteFill style={{ translate: shake }}>
      {/* 1 — tengah malam: kakek bangun mau ke kamar mandi */}
      <Scene a={0} b={2.9} zoom={false}>
        <Room wall="#E9DCC6" dim={0.12}>
          <Bulb x={460} y={-6} level={0.35} />
          <Door x={700} y={190} />
          <div style={{ position: "absolute", left: 60 + walk1 * 300, top: 300 + Math.abs(Math.sin(walk1 * 18)) * -8 }}>
            <Worker size={460} pose="idle" expr="sleepy" {...KAKEK} seed={7} />
          </div>
        </Room>
        <Pop at={0.15} x={80} y={340}>
          <Tag bg="#FFF6E5" size={44} rot={-3}>
            🌙 02.13
          </Tag>
        </Pop>
        <Pop at={1.2} x={540} y={420}>
          <Tag bg="#E3F2EF" size={38} rot={3}>
            mau ke kamar mandi…
          </Tag>
        </Pop>
      </Scene>

      {/* 2 — lampu redup, lantai basah, buru-buru */}
      <Scene a={2.9} b={5.6}>
        <Room wall="#DCEBE7" floor="#A9CFC8" tiles dim={0.1}>
          <Bulb x={460} y={-6} level={0.28} />
          <Drip x={846} y={120} />
          <svg width={120} height={80} viewBox="0 0 120 80" style={{ position: "absolute", left: 800, top: 70 }}>
            <path d="M10 20 L80 20 Q100 20 100 40 L100 60" fill="none" stroke="#9AA1AE" strokeWidth={16} strokeLinecap="round" />
          </svg>
          <Puddle x={180} y={740} w={300} />
          <Puddle x={600} y={760} w={220} />
          <div style={{ position: "absolute", left: 260 + hurry * 120, top: 330, rotate: `${hurry * 6}deg` }}>
            <Worker size={440} pose="idle" expr="normal" {...KAKEK} seed={7} />
          </div>
        </Room>
        <Pop at={3.0} x={70} y={360}>
          <Tag bg="#FFF3D6" size={40} rot={-3}>
            💡 lampu redup
          </Tag>
        </Pop>
        <Pop at={3.9} x={640} y={470}>
          <Tag bg="#D9F2F7" size={40} rot={3}>
            💧 lantai basah
          </Tag>
        </Pop>
        <Pop at={4.7} x={90} y={560}>
          <Tag bg="#FDE1D6" size={40} rot={-2}>
            ⏩ buru-buru…
          </Tag>
        </Pop>
      </Scene>

      {/* 3 — kepeleset (simbolis, tanpa luka) */}
      <Scene a={5.6} b={6.85} zoom={false}>
        <Room wall="#DCEBE7" floor="#A9CFC8" tiles>
          <Puddle x={300} y={740} w={360} />
          {t < 6.47 ? (
            <div style={{ position: "absolute", left: 300 + slip * 60, top: 330 + slip * 90, rotate: `${-slip * 38}deg`, transformOrigin: "50% 100%" }}>
              <Worker size={440} pose="shrug" expr="shocked" {...KAKEK} seed={7} />
            </div>
          ) : null}
          <div style={{ position: "absolute", left: 420 + slip * 260, top: 760 - Math.sin(slip * Math.PI) * 260, rotate: `${slip * 220}deg` }}>
            <Slipper />
          </div>
        </Room>
        {freeze && <AbsoluteFill style={{ background: "rgba(255,250,240,0.55)" }} />}
        <Sticker at={5.8} y={330} bg="#FDE1D6" size={64} rotate={-4}>
          {"KEPELESET…"}
        </Sticker>
      </Scene>

      {/* 4–5 — orang muda vs lansia */}
      <Scene a={6.85} b={11.15}>
        <div style={{ position: "absolute", left: 40, top: 320, width: 490, height: 760, borderRadius: 48, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: "#E8F1FB" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 22, textAlign: "center", fontFamily: HEAD, fontSize: 46, color: C.ink }}>🧑 ORANG MUDA</div>
          <div style={{ position: "absolute", left: 80, top: 130 }}>
            <Worker size={420} pose="shrug" expr="smirk" {...CUCU} seed={3} />
          </div>
          <Pop at={7.6} x={110} y={590}>
            <Tag bg="#FFF6E5" size={42} rot={-3}>
              cuma memar 🩹
            </Tag>
          </Pop>
        </div>
        <div style={{ position: "absolute", left: 550, top: 320, width: 490, height: 760, borderRadius: 48, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: "#FBEFE6", opacity: interpolate(t, [9.0, 9.35], [0, 1], clamp) }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 22, textAlign: "center", fontFamily: HEAD, fontSize: 46, color: C.ink }}>👴 LANSIA</div>
          <div style={{ position: "absolute", left: 55, top: 150 }}>
            <HipBone crack={crack} />
          </div>
          <Pop at={10.1} x={30} y={560}>
            <Tag bg="#FDE1D6" size={38} rot={2}>
              patah tulang panggul
            </Tag>
          </Pop>
        </div>
      </Scene>

      {/* 6 — banyak yang nggak bisa jalan normal lagi */}
      <Scene a={11.15} b={13.95}>
        <Room wall="#F3E6D2">
          <div style={{ position: "absolute", left: 200, top: 320 }}>
            <Worker size={460} pose="holdTool" expr="normal" {...KAKEK} seed={7} />
          </div>
          <div style={{ position: "absolute", left: 300, top: 470 }}>
            <Walker />
          </div>
        </Room>
        <Sticker at={11.35} y={330} bg="#FFF6E5" size={50} rotate={-2}>
          {"BANYAK YANG NGGAK BISA\nJALAN NORMAL LAGI"}
        </Sticker>
      </Scene>

      {/* 7 — reveal Si Halus: Lantai Licin */}
      <Scene a={13.95} b={18.45}>
        <Room wall="#DCEBE7" floor="#A9CFC8" tiles dim={interpolate(t, [14.0, 14.4], [0, 0.22], clamp)}>
          <Puddle x={250} y={740} w={480} />
        </Room>
        <Scanner at={14.6} dur={0.8} top={360} height={760}>
          <div style={{ position: "absolute", left: 330, top: 470 }}>
            <SiHalus size={460} variant="slip" mood={t > 17.6 ? "laugh" : "grin"} />
          </div>
        </Scanner>
        <Sticker at={17.5} y={1000} bg={TEAL} color={C.white} size={60} rotate={-2}>
          {"SI HALUS: LANTAI LICIN 💧"}
        </Sticker>
      </Scene>

      {/* 8 — WHO: penyebab kematian cedera tak disengaja #2 */}
      <Scene a={18.45} b={24.55}>
        <Sticker at={18.5} y={320} bg="#FFF6E5" size={56} rotate={-2}>
          {"📋 KATA WHO"}
        </Sticker>
        <Pop at={19.3} x={70} y={470} from="left">
          <div style={{ width: 940, display: "flex", alignItems: "center", gap: 24, padding: "22px 30px", borderRadius: 34, background: "#F1F3F7", border: `6px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}` }}>
            <div style={{ fontFamily: HEAD, fontSize: 80, color: "#9AA1AE" }}>#1</div>
            <div style={{ fontSize: 70 }}>🚗</div>
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 44, color: C.ink }}>Kecelakaan lalu lintas</div>
          </div>
        </Pop>
        {t >= 20.95 && (
          <div style={{ position: "absolute", left: 50, top: 690, scale: String(interpolate(rank2, [0, 1], [0.4, 1]) * (1 + 0.02 * Math.sin(t * 6))), opacity: interpolate(rank2, [0, 0.3], [0, 1], clamp) }}>
            <div style={{ width: 980, display: "flex", alignItems: "center", gap: 24, padding: "28px 34px", borderRadius: 38, background: "#D9F2F7", border: `8px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}` }}>
              <div style={{ fontFamily: HEAD, fontSize: 110, color: TEAL, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill" }}>#2</div>
              <div style={{ fontSize: 90 }}>🛁</div>
              <div style={{ fontFamily: HEAD, fontSize: 64, color: C.ink, lineHeight: 1 }}>
                JATUH
                <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, marginTop: 6 }}>penyebab kematian cedera tak disengaja di dunia</div>
              </div>
            </div>
          </div>
        )}
        <Source y={1060}>WHO, Falls fact sheet</Source>
      </Scene>

      {/* 9 — 684.000 per tahun */}
      <Scene a={24.55} b={28.1}>
        <Sticker at={24.6} y={330} bg="#FFF6E5" size={50} rotate={-2}>
          {"TIAP TAHUN, SEKITAR…"}
        </Sticker>
        <Stat at={24.9} to={684000} dur={1.5} label="ORANG MENINGGAL KARENA JATUH" y={520} color={TEAL} size={190} />
        <Pop at={26.6} x={0} y={890} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
          <Tag bg="#E3F2EF" size={40} rot={2}>
            🌍 di seluruh dunia
          </Tag>
        </Pop>
        <Source y={1060}>WHO, Falls fact sheet</Source>
      </Scene>

      {/* 10 — paling banyak usia 60+ */}
      <Scene a={28.1} b={30.45}>
        <Stat at={28.25} to={60} dur={0.8} suffix="+" label="USIA PALING RAWAN" y={330} color="#F5C451" size={200} />
        <div style={{ position: "absolute", left: 170, top: 640 }}>
          <Worker size={420} pose="wave" expr="happy" {...KAKEK} seed={7} />
        </div>
        <div style={{ position: "absolute", left: 560, top: 650 }}>
          <Worker size={410} pose="idle" expr="happy" {...NENEK} seed={9} flip />
        </div>
      </Scene>

      {/* 11 — kabar baiknya: bisa dicegah */}
      <Scene a={30.45} b={33.3}>
        <Sticker at={30.6} y={340} bg="#BFE6D2" size={70} rotate={-3}>
          {"KABAR BAIKNYA ✅"}
        </Sticker>
        <div style={{ position: "absolute", left: 330, top: 520 }}>
          <Worker size={480} pose="wave" expr="happy" {...KAKEK} seed={7} />
        </div>
        <Sticker at={31.6} y={1010} bg="#FFF6E5" size={54} rotate={2}>
          {"KEBANYAKAN BISA DICEGAH"}
        </Sticker>
      </Scene>

      {/* 12 — ceklis rumah aman lansia (bagian yang orang simpan) */}
      <Scene a={33.3} b={46.4}>
        <Sticker at={33.35} y={320} bg={TEAL} color={C.white} size={50} rotate={-2}>
          {"📌 CEKLIS RUMAH AMAN LANSIA"}
        </Sticker>
        <Row idx={0} at={33.47} icon="🧽" label="Keset anti-slip di kamar mandi" />
        <Row idx={1} at={34.82} icon="🪜" label="Pegangan di dinding kamar mandi" />
        <Row idx={2} at={36.9} icon="💡" label="Lampu kecil buat malam" />
        <Row idx={3} at={38.62} icon="🧶" label="Singkirin kabel & barang di jalan" />
        <Row idx={4} at={40.99} icon="🩴" label="Sandal karet yang nggak licin" />
        <Row idx={5} at={42.94} icon="🩺" label="Sering pusing pas berdiri? Periksa" />
        <Pop at={44.6} x={0} y={1120} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
          <Tag bg="#FFF3D6" size={38} rot={-2}>
            simpan biar nggak lupa 🔖
          </Tag>
        </Pop>
      </Scene>

      {/* 13 — ratusan ribu vs bisa jalan sendiri */}
      <Scene a={46.4} b={51.4}>
        <Pop at={46.6} x={300} y={340}>
          <div style={{ rotate: "-5deg", background: "#FFF3D6", border: `7px solid ${C.ink}`, borderRadius: 26, padding: "16px 34px 20px", boxShadow: `0 10px 0 ${C.ink}`, textAlign: "center" }}>
            <div style={{ fontFamily: HEAD, fontSize: 60, color: C.ink, lineHeight: 1 }}>🏷️ RATUSAN RIBU</div>
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, color: C.ink }}>keset · pegangan · lampu</div>
          </div>
        </Pop>
        <Sticker at={48.15} y={560} bg="#FFF6E5" size={50} rotate={2}>
          {"YANG DISELAMETIN:"}
        </Sticker>
        {t >= 48.9 && (
          <div style={{ position: "absolute", left: 200 + kakekWalk * 360, top: 690 + Math.abs(Math.sin(kakekWalk * 16)) * -10, opacity: interpolate(t, [48.9, 49.2], [0, 1], clamp) }}>
            <Worker size={380} pose="wave" expr="happy" {...KAKEK} seed={7} />
          </div>
        )}
        <Pop at={49.3} x={0} y={1080} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
          <Tag bg="#E3F2EF" size={42} rot={-2}>
            tahun-tahun masih bisa jalan sendiri 💛
          </Tag>
        </Pop>
      </Scene>

      {/* 14 — penutup haru: dulu mereka, sekarang giliran kita */}
      <Scene a={51.4} b={EP12.endStart + 0.2}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,214,140,${0.95 * glow}) 0%, rgba(255,190,140,${0.5 * glow}) 45%, rgba(255,240,220,0) 75%)` }} />
        {/* dulu: kakek (masih muda) menuntun anak kecil — sepia */}
        <div style={{ position: "absolute", inset: 0, opacity: sepia, filter: "sepia(0.75) saturate(0.9)" }}>
          <HandInHand x={230} y={420} sizeA={560} sizeB={300} a={{ hair: "#3A2A20", shirt: "#C98B5E", pants: "#4A3B2E" }} b={{ ...CUCU, shirt: "#F2C14E" }} />
          <Pop at={51.7} x={90} y={360}>
            <Tag bg="#F5E6CC" size={44} rot={-3}>
              dulu…
            </Tag>
          </Pop>
        </div>
        {/* sekarang: cucu dewasa menuntun kakek */}
        <div style={{ position: "absolute", inset: 0, opacity: 1 - sepia, translate: `${walkNow * 40}px 0px` }}>
          <HandInHand x={170} y={430} sizeA={540} sizeB={560} a={KAKEK} b={CUCU} walk={walkNow} />
        </div>
        <FloatHearts at={52.0} />
        <Sticker at={55.75} y={1010} bg="#FFF6E5" size={60} rotate={-2}>
          {"SEKARANG… GILIRAN KITA 💛"}
        </Sticker>
      </Scene>
    </AbsoluteFill>
  );
};

const W = warp.length ? warp : undefined;

export const Ep12: React.FC = () => (
  <Episode ep={12} accent="#2FA7B8" tint="#BFDCCB" words={words} endStart={W ? warpOldToNew(EP12.endStart, W) : EP12.endStart} revealAt={W ? warpOldToNew(EP12.revealAt, W) : EP12.revealAt} warp={W} flashes={[17.5]}>
    <Ep12Scenes />
  </Episode>
);
