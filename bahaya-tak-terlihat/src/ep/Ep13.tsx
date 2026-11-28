import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut, easeOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode, warpOldToNew } from "../Episode";
import { Pop, Scanner, Sticker, useShake } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep13.words";
import { warp } from "./ep13.warp";

/**
 * EP13 "Gas Elpiji" — versi MENYEMANGATI: gas bocor itu gampang dikalahin.
 * Semua waktu = detik isi utama (data/ep13_words.json). Tema HANGAT (peach/koral) — teks gelap di latar terang.
 * Kasus Pekalongan disebut lembut & simbolis (rumah tenang), tanpa ledakan/api/korban.
 */
export const EP13 = { endStart: 61.0, revealAt: 62.88 };

const CORAL = "#E8663D";
const GASC = "#A9D98B"; // awan gas: hijau lembut
const BROWN = "#6B4A3A";
const SH = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const SH4 = { stroke: C.ink, strokeWidth: 4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const IBU = { hijab: "#7A3E2E", shirt: "#E8634A", pants: "#3B3B4F" } as const;
const BAPAK = { hair: "#2A1B12", shirt: "#3F8FD6", pants: "#2E3557" } as const;
const ANAK = { hair: "#2A1B12", shirt: "#F2B33D", pants: "#3B4E8A" } as const;
/** ikon "tarik napas" */
const BREATH = "😮‍💨";

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const pop = (t: number, at: number, fps: number, damping = 13, stiffness = 190) =>
  spring({ frame: Math.max(0, (t - at) * fps), fps, config: { damping, stiffness } });

/* ----------------------------------------------------------- bingkai & label */

/** Ruangan hangat (dinding krem, lantai kayu) */
const Room: React.FC<{ children?: React.ReactNode; dim?: number; wall?: string; floor?: string; glow?: number }> = ({
  children,
  dim = 0,
  wall = "#F6E3CF",
  floor = "#D9A77E",
  glow = 0,
}) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 880, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: wall }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 190, background: floor, borderTop: `${OUTLINE}px solid ${C.ink}` }} />
    {children}
    {glow > 0 && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(255,210,130,0.6), rgba(255,190,100,0) 70%)", opacity: glow }} />}
    {dim > 0 && <div style={{ position: "absolute", inset: 0, background: "#4A3346", opacity: dim }} />}
  </div>
);

const Cloud: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <svg width={220 * s} height={110 * s} viewBox="0 0 220 110" style={{ position: "absolute", left: x, top: y }}>
    <path d="M40 95 Q10 95 14 70 Q18 48 46 52 Q52 18 92 22 Q120 0 150 26 Q190 20 196 56 Q214 62 208 82 Q204 98 180 95 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);

/** Langit pagi yang tenang + rumput */
const Sky: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const t = useT();
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 880, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: "linear-gradient(180deg, #CDEBF3 0%, #EAF1E4 55%, #FBE6CC 100%)" }}>
      <div style={{ position: "absolute", left: 800, top: 70, width: 120, height: 120, borderRadius: "50%", background: "#FFD86B", border: `6px solid ${C.ink}`, boxShadow: "0 0 0 24px rgba(255,216,107,0.3)" }} />
      <Cloud x={((300 + t * 22) % 1300) - 240} y={190} />
      <Cloud x={((900 + t * 16) % 1300) - 240} y={300} s={0.8} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 110, background: "#A9D47F", borderTop: `${OUTLINE}px solid ${C.ink}` }} />
      {children}
    </div>
  );
};

const Tag: React.FC<{ children: React.ReactNode; bg?: string; size?: number; rot?: number }> = ({ children, bg = C.cream, size = 40, rot = -2 }) => (
  <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: size, color: C.ink, background: bg, padding: "8px 22px 10px", borderRadius: 20, border: `6px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, rotate: `${rot}deg`, whiteSpace: "nowrap" }}>{children}</div>
);

/** Pop yang otomatis di tengah layar */
const CPop: React.FC<{ at: number; y: number; out?: number; children: React.ReactNode }> = ({ at, y, out, children }) => (
  <Pop at={at} out={out} x={0} y={y} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
    {children}
  </Pop>
);

const Source: React.FC<{ children: React.ReactNode; y?: number }> = ({ children, y = 1120 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: y, display: "flex", justifyContent: "center" }}>
    <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, color: BROWN, background: "rgba(255,248,236,0.92)", padding: "2px 18px 4px", borderRadius: 14 }}>{children}</div>
  </div>
);

/* ----------------------------------------------------------- gambar lokal */

/** Rumah tampak depan; `warm` menyalakan jendela kuning hangat */
const House: React.FC<{ warm?: number }> = ({ warm = 0 }) => {
  const win = interpolateColors(warm, [0, 1], ["#CFEAF5", "#FFE08A"]);
  return (
    <svg width={520} height={440} viewBox="0 0 520 440" style={{ overflow: "visible" }}>
      {warm > 0 && <circle cx={165} cy={295} r={115} fill="#FFE9A8" opacity={0.55 * warm} />}
      <rect x={360} y={70} width={44} height={90} fill="#B5573A" {...SH} />
      <path d="M30 200 L260 30 L490 200 Z" fill="#D9774F" {...SH} />
      <rect x={70} y={195} width={380} height={230} fill="#F7E4C6" {...SH} />
      <rect x={110} y={250} width={110} height={90} rx={8} fill={win} {...SH} />
      <path d="M165 250 L165 340 M110 295 L220 295" stroke={C.ink} strokeWidth={5} />
      <rect x={290} y={270} width={110} height={155} rx={8} fill="#A8714C" {...SH} />
      <circle cx={380} cy={350} r={7} fill={C.ink} />
      <rect x={232} y={382} width={40} height={43} rx={6} fill={CORAL} {...SH4} />
      <circle cx={252} cy={366} r={22} fill="#6FBF5A" {...SH4} />
    </svg>
  );
};

const MapPin: React.FC = () => (
  <svg width={90} height={124} viewBox="0 0 90 124">
    <path d="M45 120 C30 92 6 72 6 45 A39 39 0 0 1 84 45 C84 72 60 92 45 120 Z" fill={CORAL} {...SH} strokeWidth={6} />
    <circle cx={45} cy={45} r={15} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
  </svg>
);

/** Tabung + regulator + selang + kompor (mati); `leak` = uap gas hijau lembut di regulator */
const TankRig: React.FC<{ leak?: number }> = ({ leak = 0 }) => {
  const t = useT();
  return (
    <svg width={760} height={520} viewBox="0 0 760 520" style={{ overflow: "visible" }}>
      <rect x={430} y={330} width={300} height={120} rx={16} fill="#C9CED6" {...SH} />
      <rect x={470} y={300} width={100} height={30} rx={8} fill="#3A3F4B" {...SH} />
      <rect x={590} y={300} width={100} height={30} rx={8} fill="#3A3F4B" {...SH} />
      {[500, 580, 660].map((x) => (
        <circle key={x} cx={x} cy={400} r={14} fill="#3A3F4B" {...SH4} />
      ))}
      <path d="M250 150 Q350 120 380 230 Q400 320 470 330" fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
      <path d="M250 150 Q350 120 380 230 Q400 320 470 330" fill="none" stroke="#E2603A" strokeWidth={12} strokeLinecap="round" />
      <rect x={60} y={150} width={200} height={330} rx={70} fill="#3FAE5A" {...SH} />
      <rect x={95} y={270} width={130} height={60} rx={12} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
      <text x={160} y={312} textAnchor="middle" fontFamily="LilitaOne" fontSize={40} fill={C.ink}>
        LPG
      </text>
      <rect x={120} y={92} width={100} height={64} rx={14} fill="#C9CED6" {...SH} />
      <circle cx={170} cy={124} r={20} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
      <path d="M170 124 L182 112" stroke="#E0566F" strokeWidth={5} strokeLinecap="round" />
      <rect x={210} y={110} width={46} height={28} rx={8} fill="#9AA1AE" {...SH} strokeWidth={5} />
      {leak > 0 &&
        [0, 1, 2].map((i) => {
          const p = (t * 0.6 + i / 3) % 1;
          return (
            <path
              key={i}
              d={`M${256 + p * 70} ${120 - p * 55} q12 -10 0 -20 q-12 -10 0 -20`}
              fill="none"
              stroke="#6FAE52"
              strokeWidth={8}
              strokeLinecap="round"
              opacity={leak * 0.85 * Math.sin(p * Math.PI)}
            />
          );
        })}
    </svg>
  );
};

/** Awan gas lembut yang mengendap di lantai */
const GasPool: React.FC<{ level: number; h?: number }> = ({ level, h = 300 }) => {
  const t = useT();
  if (level <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h * level }}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: -60 + i * 150 + Math.sin(t * 0.9 + i) * 22,
            bottom: -60 + (i % 2) * 24,
            width: 260,
            height: h * level + 90,
            borderRadius: "50%",
            background: GASC,
            opacity: 0.5,
            filter: "blur(10px)",
          }}
        />
      ))}
    </div>
  );
};

/** Kepulan gas kecil yang turun pelan ke lantai */
const FallingPuffs: React.FC<{ x: number; y: number; floor: number; at: number }> = ({ x, y, floor, at }) => {
  const t = useT();
  if (t < at) return null;
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const p = ((t - at) * 0.55 + i / 6) % 1;
        const px = x + p * 380 + Math.sin(p * 6 + i) * 20;
        const py = y + (floor - y) * Math.min(1, p * 1.15);
        const sz = 60 + p * 70;
        return <div key={i} style={{ position: "absolute", left: px - sz / 2, top: py - sz / 2, width: sz, height: sz * 0.7, borderRadius: "50%", background: GASC, opacity: 0.8 * Math.sin(p * Math.PI), filter: "blur(3px)" }} />;
      })}
    </>
  );
};

/** Jendela; `p` 0..1 membuka daun jendela + angin keluar */
const OpenWindow: React.FC<{ p: number }> = ({ p }) => {
  const t = useT();
  const pw = 78 * (1 - 0.72 * p);
  return (
    <svg width={220} height={180} viewBox="0 0 220 180" style={{ overflow: "visible" }}>
      <rect x={24} y={10} width={172} height={150} rx={10} fill="#BFE6EF" stroke={C.ink} strokeWidth={7} />
      <circle cx={150} cy={52} r={18} fill="#FFD86B" />
      <rect x={30} y={16} width={pw} height={138} fill="#E8F6FA" stroke={C.ink} strokeWidth={5} />
      <rect x={190 - pw} y={16} width={pw} height={138} fill="#E8F6FA" stroke={C.ink} strokeWidth={5} />
      {p > 0.4 &&
        [0, 1, 2].map((i) => {
          const q = (t * 0.8 + i / 3) % 1;
          return <path key={i} d={`M${70 + q * 120} ${50 + i * 36} q14 -10 28 0 t28 0`} fill="none" stroke="#3E93B8" strokeWidth={6} strokeLinecap="round" opacity={(Math.sin(q * Math.PI) * (p - 0.4)) / 0.6} />;
        })}
      <rect x={14} y={156} width={192} height={16} rx={6} fill="#C98F6B" stroke={C.ink} strokeWidth={5} />
    </svg>
  );
};

/** Timbangan: elpiji (kiri) vs udara (kanan); `tilt` derajat, positif = kiri turun */
const BalanceScale: React.FC<{ tilt: number }> = ({ tilt }) => {
  const a = (tilt * Math.PI) / 180;
  const P = [450, 110];
  const L = 330;
  const lx = P[0] - L * Math.cos(a);
  const ly = P[1] + L * Math.sin(a);
  const rx = P[0] + L * Math.cos(a);
  const ry = P[1] - L * Math.sin(a);
  const pan = (x: number, y: number, fill: string, label: string, dashed: boolean) => (
    <g>
      <path d={`M${x} ${y} L${x - 120} ${y + 190} M${x} ${y} L${x + 120} ${y + 190}`} stroke={C.ink} strokeWidth={5} />
      {[
        [-62, 140, 52],
        [0, 112, 62],
        [62, 140, 52],
        [0, 156, 56],
      ].map(([dx, dy, r], i) => (
        <circle key={i} cx={x + dx} cy={y + dy} r={r} fill={fill} stroke={C.ink} strokeWidth={5} strokeDasharray={dashed ? "14 10" : undefined} />
      ))}
      {[
        [-62, 140, 47],
        [0, 112, 57],
        [62, 140, 47],
        [0, 156, 51],
      ].map(([dx, dy, r], i) => (
        <circle key={`f${i}`} cx={x + dx} cy={y + dy} r={r} fill={fill} />
      ))}
      <text x={x} y={y + 160} textAnchor="middle" fontFamily="LilitaOne" fontSize={46} fill={C.ink}>
        {label}
      </text>
      <path d={`M${x - 150} ${y + 190} Q${x} ${y + 260} ${x + 150} ${y + 190} Z`} fill="#E9C46A" {...SH} />
    </g>
  );
  return (
    <svg width={900} height={600} viewBox="0 0 900 600" style={{ overflow: "visible" }}>
      <rect x={330} y={540} width={240} height={40} rx={14} fill="#8A5A3C" {...SH} />
      <rect x={432} y={110} width={36} height={440} fill="#B5793F" {...SH} />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={C.ink} strokeWidth={28} strokeLinecap="round" />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#D9A05B" strokeWidth={14} strokeLinecap="round" />
      {pan(lx, ly, GASC, "ELPIJI", false)}
      {pan(rx, ry, "#E4F4FB", "UDARA", true)}
      <circle cx={P[0]} cy={P[1]} r={22} fill={CORAL} {...SH} />
    </svg>
  );
};

/** Saklar lampu */
const Switch: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80">
    <rect x={14} y={6} width={52} height={68} rx={10} fill="#FFFFFF" {...SH4} strokeWidth={5} />
    <rect x={28} y={18} width={24} height={44} rx={6} fill="#E3E6EC" {...SH4} />
    <rect x={31} y={21} width={18} height={19} rx={4} fill="#9AA1AE" />
  </svg>
);

/** Kipas angin (diam) */
const Fan: React.FC<{ size?: number }> = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x={44} y={60} width={12} height={28} fill="#9AA1AE" {...SH4} />
    <rect x={24} y={86} width={52} height={10} rx={5} fill="#6B7280" {...SH4} />
    <circle cx={50} cy={42} r={36} fill="#E3F2FA" stroke={C.ink} strokeWidth={5} />
    {[0, 120, 240].map((a) => (
      <ellipse key={a} cx={50} cy={24} rx={9} ry={16} fill="#49B6E0" stroke={C.ink} strokeWidth={3} transform={`rotate(${a + 20} 50 42)`} />
    ))}
    <circle cx={50} cy={42} r={6} fill={C.ink} />
  </svg>
);

/** Ikon regulator kecil */
const MiniReg: React.FC<{ size?: number }> = ({ size = 84 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x={32} y={8} width={36} height={22} rx={6} fill="#E2603A" {...SH4} strokeWidth={5} />
    <rect x={12} y={26} width={76} height={50} rx={14} fill="#C9CED6" {...SH4} strokeWidth={5} />
    <circle cx={50} cy={51} r={15} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
    <path d="M50 51 L58 44" stroke="#E0566F" strokeWidth={4} strokeLinecap="round" />
    <rect x={40} y={74} width={20} height={16} fill="#9AA1AE" {...SH4} />
  </svg>
);

/** Ikon selang melingkar */
const MiniHose: React.FC<{ size?: number }> = ({ size = 100 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    {[32, 15].map((r) => (
      <g key={r}>
        <circle cx={46} cy={52} r={r} fill="none" stroke={C.ink} strokeWidth={15} />
        <circle cx={46} cy={52} r={r} fill="none" stroke="#E2603A" strokeWidth={7} />
      </g>
    ))}
    <rect x={76} y={40} width={18} height={24} rx={4} fill="#9AA1AE" {...SH4} />
  </svg>
);

/** Kartu langkah bernomor (ikon + judul + sub) */
const StepCard: React.FC<{ n: number; icon: React.ReactNode; title: string; sub?: string; at: number; next?: number; y: number; color: string }> = ({ n, icon, title, sub, at, next, y, color }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps);
  const active = next === undefined ? true : t < next;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        width: 960,
        top: y,
        height: 190,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 30,
        padding: "0 34px",
        borderRadius: 36,
        background: active ? "#FFF0DC" : "#FFFDF8",
        border: `7px solid ${C.ink}`,
        boxShadow: `0 10px 0 ${C.ink}`,
        translate: `${interpolate(s, [0, 1], [-1000, 0])}px 0px`,
        scale: active ? String(1 + 0.012 * Math.sin((t - at) * 7)) : "0.97",
        opacity: active ? 1 : 0.85,
      }}
    >
      <div style={{ position: "relative", flex: "none", width: 120, height: 120, boxSizing: "border-box", borderRadius: 30, background: color, border: `6px solid ${C.ink}`, display: "grid", placeItems: "center", fontSize: 66, lineHeight: 1 }}>
        {icon}
        <div
          style={{
            position: "absolute",
            left: -28,
            top: -28,
            width: 58,
            height: 58,
            boxSizing: "border-box",
            borderRadius: "50%",
            background: CORAL,
            border: `5px solid ${C.ink}`,
            display: "grid",
            placeItems: "center",
            fontFamily: HEAD,
            fontSize: 34,
            color: C.white,
            WebkitTextStroke: `6px ${C.ink}`,
            paintOrder: "stroke fill",
          }}
        >
          {n}
        </div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: HEAD, fontSize: 52, lineHeight: 1, color: C.ink }}>{title}</div>
        {sub && <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 33, color: BROWN, marginTop: 8, lineHeight: 1.1 }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Hidung mengendus: garis bau gas hijau mengalir ke hidung */
const Sniff: React.FC = () => {
  const t = useT();
  return (
    <div style={{ position: "relative", width: 560, height: 200 }}>
      <svg width={400} height={200} viewBox="0 0 400 200" style={{ position: "absolute", left: 0, top: 0 }}>
        {[0, 1, 2].map((i) => {
          const q = (t * 0.7 + i / 3) % 1;
          return (
            <path
              key={i}
              d={`M${20 + q * 200} ${60 + i * 40} q25 -18 50 0 t50 0 t50 0`}
              fill="none"
              stroke="#6FAE52"
              strokeWidth={10}
              strokeLinecap="round"
              opacity={0.85 * Math.sin(q * Math.PI)}
            />
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 370, top: 10, fontSize: 160, lineHeight: 1, rotate: `${4 * Math.sin(t * 5)}deg` }}>👃</div>
    </div>
  );
};

/** Panel langkah 3: pintu & jendela kebuka, gas ngalir keluar */
const AirOut: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  const p = interpolate(t, [at + 0.2, at + 1.0], [0, 1], { ...clamp, easing: easeInOut });
  const leaf = 150 * (1 - 0.78 * p);
  return (
    <div style={{ position: "relative", width: 960, height: 390, boxSizing: "border-box", borderRadius: 36, overflow: "hidden", background: "#F6E3CF", border: `7px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}` }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: "#D9A77E", borderTop: `6px solid ${C.ink}` }} />
      <svg width={946} height={376} viewBox="0 0 946 376" style={{ position: "absolute", left: 0, top: 0 }}>
        {/* pintu */}
        <rect x={80} y={50} width={170} height={262} fill="#BFE6EF" stroke={C.ink} strokeWidth={7} />
        <rect x={84} y={240} width={162} height={70} fill="#A9D47F" />
        <rect x={86} y={56} width={leaf} height={252} fill="#A8714C" stroke={C.ink} strokeWidth={6} />
        <circle cx={86 + leaf - 22} cy={190} r={8} fill={C.ink} />
        {/* gas mengalir ke pintu & jendela */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const q = (t * 0.6 + i / 6) % 1;
          const toDoor = i % 2 === 0;
          const sx = 480;
          const sy = 240;
          const ex = toDoor ? 140 : 760;
          const ey = toDoor ? 200 : 150;
          const r = 34 + 14 * Math.sin(i);
          return <ellipse key={i} cx={sx + (ex - sx) * q} cy={sy + (ey - sy) * q} rx={r} ry={r * 0.7} fill={GASC} opacity={0.85 * p * Math.sin(q * Math.PI)} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 640, top: 60, scale: "1.15" }}>
        <OpenWindow p={p} />
      </div>
    </div>
  );
};

/** Panel langkah 4: regulator diangkat pelan-pelan */
const RegLift: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  const lift = interpolate(t, [at + 0.3, at + 1.5], [0, 46], { ...clamp, easing: easeInOut });
  return (
    <div style={{ position: "relative", width: 960, height: 190, boxSizing: "border-box", borderRadius: 36, overflow: "hidden", background: "#FFF8EE", border: `7px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}` }}>
      <svg width={946} height={176} viewBox="0 0 946 176" style={{ position: "absolute", left: 0, top: 0 }}>
        <ellipse cx={250} cy={220} rx={170} ry={110} fill="#3FAE5A" {...SH} />
        <rect x={190} y={118} width={120} height={40} rx={12} fill="#2E8B47" {...SH} />
        <rect x={228} y={98} width={44} height={26} rx={5} fill="#AEB5C0" {...SH} strokeWidth={5} />
        <g transform={`translate(0 ${-lift})`}>
          <rect x={226} y={44} width={48} height={22} rx={7} fill="#E2603A" {...SH} strokeWidth={5} />
          <rect x={196} y={62} width={108} height={42} rx={14} fill="#C9CED6" {...SH} strokeWidth={6} />
          <circle cx={250} cy={83} r={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
        </g>
        <path d="M352 120 L352 40" stroke={CORAL} strokeWidth={9} strokeLinecap="round" strokeDasharray="4 16" />
        <path d="M336 56 L352 36 L368 56" fill="none" stroke={CORAL} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left: 440, top: 0, bottom: 0, display: "flex", alignItems: "center", gap: 14, fontFamily: HEAD, fontSize: 50, color: C.ink }}>
        <span style={{ fontSize: 72, lineHeight: 1 }}>🐢</span> pelan-pelan…
      </div>
    </div>
  );
};

/** Chip kecil "biarin aja dulu" (lampu, kipas, colokan) */
const Chip: React.FC<{ icon: React.ReactNode; label: string; at: number; x: number; y: number }> = ({ icon, label, at, x, y }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps, 11, 210);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 290,
        height: 160,
        boxSizing: "border-box",
        borderRadius: 32,
        background: "#FFF8EE",
        border: `6px solid ${C.ink}`,
        boxShadow: `0 8px 0 ${C.ink}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        scale: String(interpolate(s, [0, 1], [0.3, 1])),
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
      }}
    >
      <div style={{ fontSize: 66, lineHeight: 1, height: 84, display: "grid", placeItems: "center" }}>{icon}</div>
      <div style={{ fontFamily: HEAD, fontSize: 40, color: C.ink, lineHeight: 1 }}>{label}</div>
      <div style={{ position: "absolute", right: -18, top: -18, width: 60, height: 60, boxSizing: "border-box", borderRadius: "50%", background: "#FFE3D3", border: `5px solid ${C.ink}`, display: "grid", placeItems: "center", fontSize: 30 }}>✋</div>
    </div>
  );
};

/** Kartu besar kelemahan Si Halus */
const WeakCard: React.FC<{ icon: React.ReactNode; title: string; sub: string; at: number; x: number; y: number; bg: string; rot?: number }> = ({ icon, title, sub, at, x, y, bg, rot = 0 }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps, 11, 200);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 450,
        height: 400,
        boxSizing: "border-box",
        borderRadius: 40,
        background: bg,
        border: `7px solid ${C.ink}`,
        boxShadow: `0 12px 0 ${C.ink}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 20px",
        rotate: `${rot}deg`,
        scale: String(interpolate(s, [0, 1], [0.3, 1])),
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
      }}
    >
      <div style={{ height: 200, display: "grid", placeItems: "center", fontSize: 150, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontFamily: HEAD, fontSize: 52, color: C.ink, lineHeight: 1, marginTop: 6 }}>{title}</div>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 32, color: BROWN, marginTop: 8, lineHeight: 1.1 }}>{sub}</div>
    </div>
  );
};

/** Konfeti perayaan */
const Confetti: React.FC<{ at: number; x?: number; y?: number; n?: number }> = ({ at, x = 540, y = 640, n = 44 }) => {
  const t = useT();
  const dt = t - at;
  if (dt < 0 || dt > 3) return null;
  const cols = [CORAL, "#FFD23F", "#3FAE5A", "#49B6E0", "#E0566F", "#B48CF2"];
  const k = 2.6;
  const d = (1 - Math.exp(-k * dt)) / k;
  const o = interpolate(dt, [2.2, 3.0], [1, 0], clamp);
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const ang = -Math.PI / 2 + (random(`cfa${i}`) - 0.5) * 2.8;
        const sp = 700 + random(`cfs${i}`) * 650;
        const px = x + Math.cos(ang) * sp * d + Math.sin(dt * 3 + i) * 14;
        const py = y + Math.sin(ang) * sp * d + 260 * dt * dt;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: 18,
              height: 30,
              borderRadius: 5,
              background: cols[i % cols.length],
              border: `3px solid ${C.ink}`,
              rotate: `${random(`cfr${i}`) * 360 + dt * (200 + random(`cfw${i}`) * 300)}deg`,
              opacity: o,
            }}
          />
        );
      })}
    </>
  );
};

/** Rekap 5 langkah dalam bulatan */
const RECAP: { icon: React.ReactNode; color: string }[] = [
  { icon: BREATH, color: "#BFE3F5" },
  { icon: <Switch size={72} />, color: "#FFE27A" },
  { icon: "🚪", color: "#CFEFDF" },
  { icon: <MiniReg size={78} />, color: "#F3D6C6" },
  { icon: "🌳", color: "#D7F0C2" },
];
const Recap: React.FC<{ at: number; y: number }> = ({ at, y }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  return (
    <>
      {RECAP.map((r, i) => {
        const a = at + i * 0.12;
        if (t < a - 0.05) return null;
        const s = pop(t, a, fps, 10, 220);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 118 + i * 176,
              top: y,
              width: 140,
              height: 140,
              boxSizing: "border-box",
              borderRadius: "50%",
              background: r.color,
              border: `6px solid ${C.ink}`,
              boxShadow: `0 8px 0 ${C.ink}`,
              display: "grid",
              placeItems: "center",
              fontSize: 64,
              lineHeight: 1,
              scale: String(interpolate(s, [0, 1], [0.2, 1])),
            }}
          >
            {r.icon}
            <div
              style={{
                position: "absolute",
                left: -12,
                top: -12,
                width: 50,
                height: 50,
                boxSizing: "border-box",
                borderRadius: "50%",
                background: CORAL,
                border: `5px solid ${C.ink}`,
                display: "grid",
                placeItems: "center",
                fontFamily: HEAD,
                fontSize: 30,
                color: C.white,
                WebkitTextStroke: `5px ${C.ink}`,
                paintOrder: "stroke fill",
              }}
            >
              {i + 1}
            </div>
          </div>
        );
      })}
    </>
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
          <div key={i} style={{ position: "absolute", left: 100 + i * 155 + Math.sin(t * 1.5 + i) * 30, top: 1060 - p * 650, fontSize: 46 + (i % 3) * 14, opacity: Math.sin(p * Math.PI) * 0.85 }}>
            💛
          </div>
        );
      })}
    </>
  );
};

/** Kubah pelindung rumah (Si Halus mental) */
const Shield: React.FC<{ at: number; hitAt: number; cx: number; cy: number; rx: number; ry: number }> = ({ at, hitAt, cx, cy, rx, ry }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps, 12, 140);
  const hit = t >= hitAt ? Math.exp(-(t - hitAt) * 5) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - rx,
        top: cy - ry,
        width: rx * 2,
        height: ry * 2,
        boxSizing: "border-box",
        borderRadius: "50%",
        border: "8px solid #5DB971",
        background: "radial-gradient(ellipse at 50% 35%, rgba(220,255,225,0.08) 40%, rgba(130,215,150,0.42) 100%)",
        boxShadow: `inset 0 0 50px rgba(120,210,140,${0.5 + 0.4 * hit})`,
        scale: String(s * (1 + 0.03 * hit * Math.sin((t - hitAt) * 40))),
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
      }}
    >
      {[
        [70, 160],
        [rx * 2 - 120, 110],
        [rx - 30, 20],
      ].map(([x, y], i) => (
        <div key={i} style={{ position: "absolute", left: x, top: y, fontSize: 52, opacity: 0.6 + 0.4 * Math.sin(t * 5 + i * 2) }}>
          ✨
        </div>
      ))}
    </div>
  );
};

/** Segel SNI yang "dicap" */
const Seal: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = spring({ frame: Math.max(0, (t - at) * fps), fps, config: { damping: 14, stiffness: 260 } });
  return (
    <div
      style={{
        position: "absolute",
        left: x - 66,
        top: y - 66,
        width: 132,
        height: 132,
        boxSizing: "border-box",
        borderRadius: "50%",
        background: "#3FAE5A",
        border: `7px solid ${C.ink}`,
        boxShadow: `0 8px 0 ${C.ink}`,
        display: "grid",
        placeItems: "center",
        scale: String(interpolate(s, [0, 1], [2.4, 1])),
        rotate: `${interpolate(s, [0, 1], [-30, -10])}deg`,
        opacity: interpolate(s, [0, 0.25], [0, 1], clamp),
      }}
    >
      <div style={{ position: "absolute", inset: 8, borderRadius: "50%", border: "4px dashed #FFFFFF" }} />
      <div style={{ fontFamily: HEAD, fontSize: 48, color: C.white, WebkitTextStroke: `7px ${C.ink}`, paintOrder: "stroke fill", lineHeight: 1 }}>SNI</div>
    </div>
  );
};

/** Kartu ilustrasi sambungan */
const RigCard: React.FC<{ y: number; at: number; children: React.ReactNode }> = ({ y, at, children }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const s = pop(t, at, fps, 14, 170);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        top: y,
        width: 960,
        height: 520,
        boxSizing: "border-box",
        borderRadius: 40,
        overflow: "hidden",
        background: "#FFF6EA",
        border: `7px solid ${C.ink}`,
        boxShadow: `0 10px 0 ${C.ink}`,
        scale: String(interpolate(s, [0, 1], [0.85, 1])),
        opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
      }}
    >
      {children}
    </div>
  );
};

/** sambungan regulator–selang (tempat gelembung muncul) & regulator–tabung */
const J1: [number, number] = [404, 183];
const J2: [number, number] = [230, 246];

const Foam: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) =>
  o <= 0.01 ? null : (
    <g opacity={o}>
      {[
        [-14, -6, 12],
        [8, -14, 14],
        [18, 4, 10],
        [-4, 10, 11],
        [-22, 8, 8],
      ].map(([dx, dy, r], i) => (
        <circle key={i} cx={x + dx} cy={y + dy} r={r * (0.6 + 0.4 * o)} fill="#FFFFFF" stroke="#8FB8C8" strokeWidth={3} />
      ))}
    </g>
  );

/** Tabung + regulator + selang, bisa di-zoom ke sambungan; spons air sabun & gelembung */
const JointRig: React.FC<{ zoom?: number; foam1?: number; foam2?: number; bubbles?: number; sponge?: [number, number] | null; bowl?: boolean }> = ({
  zoom = 0,
  foam1 = 0,
  foam2 = 0,
  bubbles = 0,
  sponge = null,
  bowl = false,
}) => {
  const t = useT();
  const z = 1 + 0.8 * zoom;
  const cx = 480 + (400 - 480) * zoom;
  const cy = 260 + (160 - 260) * zoom;
  const vw = 960 / z;
  const vh = 520 / z;
  const hose = "M404 183 Q600 183 690 290 Q770 380 1000 370";
  return (
    <svg width={946} height={506} viewBox={`${cx - vw / 2} ${cy - vh / 2} ${vw} ${vh}`} preserveAspectRatio="xMidYMid slice">
      <rect x={-200} y={-200} width={1400} height={1000} fill="#FFF6EA" />
      {/* tabung */}
      <rect x={90} y={300} width={280} height={330} rx={90} fill="#3FAE5A" {...SH} />
      <rect x={150} y={385} width={160} height={58} rx={12} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
      <text x={230} y={427} textAnchor="middle" fontFamily="LilitaOne" fontSize={40} fill={C.ink}>
        LPG
      </text>
      <rect x={150} y={262} width={160} height={58} rx={16} fill="#2E8B47" {...SH} />
      <rect x={202} y={232} width={56} height={38} rx={6} fill="#AEB5C0" {...SH} strokeWidth={5} />
      {/* regulator */}
      <rect x={196} y={84} width={68} height={44} rx={12} fill="#E2603A" {...SH} />
      <rect x={140} y={120} width={180} height={116} rx={26} fill="#C9CED6" {...SH} />
      <circle cx={230} cy={178} r={36} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
      <path d="M230 178 L248 162" stroke="#E0566F" strokeWidth={6} strokeLinecap="round" />
      <rect x={318} y={158} width={74} height={50} rx={10} fill="#9AA1AE" {...SH} strokeWidth={6} />
      {/* selang */}
      <path d={hose} fill="none" stroke={C.ink} strokeWidth={44} strokeLinecap="round" />
      <path d={hose} fill="none" stroke="#E2603A" strokeWidth={30} strokeLinecap="round" />
      <rect x={388} y={146} width={30} height={74} rx={8} fill="#6B7280" {...SH} strokeWidth={6} />
      {/* mangkuk air sabun */}
      {bowl && (
        <g>
          <path d="M732 432 Q740 500 830 504 Q920 500 928 432" fill="#7FC4E8" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <ellipse cx={830} cy={432} rx={98} ry={20} fill="#D6EEF8" stroke={C.ink} strokeWidth={6} />
          {[
            [784, 426, 12],
            [812, 420, 15],
            [846, 424, 11],
            [872, 430, 13],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" stroke="#8FB8C8" strokeWidth={3} />
          ))}
          <text x={830} y={482} textAnchor="middle" fontFamily="Baloo2" fontWeight={800} fontSize={26} fill={C.ink}>
            air sabun
          </text>
        </g>
      )}
      <Foam x={J1[0]} y={J1[1]} o={foam1} />
      <Foam x={J2[0]} y={J2[1]} o={foam2} />
      {/* gelembung = tanda bocor */}
      {bubbles > 0 &&
        [
          [-4, -40, 24],
          [30, -70, 18],
          [-30, -82, 15],
          [12, -112, 27],
          [-16, -150, 14],
          [36, -138, 12],
        ].map(([dx, dy, r], i) => {
          const g = Math.max(0, Math.min(1, bubbles * 1.4 - i * 0.08));
          const rr = r * g * (0.92 + 0.08 * Math.sin(t * 5 + i));
          if (rr < 1) return null;
          const bx = J1[0] + dx;
          const by = J1[1] + dy * (0.6 + 0.4 * g);
          return (
            <g key={i}>
              <circle cx={bx} cy={by} r={rr} fill="rgba(205,240,255,0.65)" stroke="#3E8FB0" strokeWidth={4} />
              <circle cx={bx - rr * 0.35} cy={by - rr * 0.35} r={rr * 0.22} fill="#FFFFFF" />
            </g>
          );
        })}
      {sponge && (
        <g transform={`translate(${sponge[0] - 55} ${sponge[1] - 36}) rotate(-12 55 36)`}>
          <rect x={0} y={0} width={110} height={72} rx={18} fill="#FFE27A" {...SH} strokeWidth={6} />
          <circle cx={30} cy={28} r={8} fill="#E9C24A" />
          <circle cx={72} cy={44} r={10} fill="#E9C24A" />
          <circle cx={56} cy={22} r={6} fill="#E9C24A" />
        </g>
      )}
    </svg>
  );
};

/** Stopwatch kecil, `p` 0..1 satu putaran */
const Stopwatch: React.FC<{ p: number; size?: number }> = ({ p, size = 110 }) => {
  const a = p * Math.PI * 2;
  const r = 38;
  const ex = 60 + r * Math.sin(a);
  const ey = 66 - r * Math.cos(a);
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <rect x={50} y={4} width={20} height={14} rx={4} fill={C.ink} />
      <rect x={88} y={18} width={14} height={10} rx={3} fill={C.ink} transform="rotate(40 95 23)" />
      <circle cx={60} cy={66} r={48} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} />
      {p >= 0.999 ? (
        <circle cx={60} cy={66} r={r} fill="#FFD9C9" />
      ) : p > 0.001 ? (
        <path d={`M60 66 L60 ${66 - r} A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${ex} ${ey} Z`} fill="#FFD9C9" />
      ) : null}
      <line x1={60} y1={66} x2={ex} y2={ey} stroke={CORAL} strokeWidth={7} strokeLinecap="round" />
      <circle cx={60} cy={66} r={6} fill={C.ink} />
    </svg>
  );
};

const TimerBadge: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  const p = interpolate(t, [at + 0.2, at + 3.2], [0, 1], clamp);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "8px 34px 8px 16px", background: "#FFF3D6", border: `7px solid ${C.ink}`, borderRadius: 999, boxShadow: `0 10px 0 ${C.ink}`, rotate: "-2deg" }}>
      <Stopwatch p={p} size={104} />
      <div style={{ fontFamily: HEAD, fontSize: 68, color: C.ink, lineHeight: 1 }}>30 DETIK AJA</div>
    </div>
  );
};

/** Baris umur pakai: ikon + nama + "tiap x–y tahun" + garis waktu 0–5 th */
const LifeRow: React.FC<{ icon: React.ReactNode; name: string; label: string; range: [number, number]; at: number; y: number; color: string }> = ({ icon, name, label, range, at, y, color }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps);
  const band = interpolate(t, [at + 0.25, at + 0.75], [0, 1], { ...clamp, easing: easeOut });
  const X = (yr: number) => 16 + yr * 118;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        top: y,
        width: 960,
        height: 262,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "0 30px",
        borderRadius: 36,
        background: "#FFF8EE",
        border: `7px solid ${C.ink}`,
        boxShadow: `0 10px 0 ${C.ink}`,
        translate: `${interpolate(s, [0, 1], [1000, 0])}px 0px`,
      }}
    >
      <div style={{ flex: "none", width: 150, height: 150, boxSizing: "border-box", borderRadius: 34, background: color, border: `6px solid ${C.ink}`, display: "grid", placeItems: "center" }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: HEAD, fontSize: 40, color: BROWN, lineHeight: 1 }}>{name}</div>
        <div style={{ fontFamily: HEAD, fontSize: 66, color: CORAL, lineHeight: 1.08, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill" }}>{label}</div>
        <svg width={640} height={64} viewBox="0 0 640 64" style={{ marginTop: 6, display: "block" }}>
          <rect x={X(0)} y={8} width={X(5) - X(0)} height={22} rx={11} fill="#EFE3D3" stroke={C.ink} strokeWidth={4} />
          {band > 0.01 && <rect x={X(range[0])} y={8} width={(X(range[1]) - X(range[0])) * band} height={22} rx={11} fill={CORAL} stroke={C.ink} strokeWidth={4} />}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <text key={i} x={X(i)} y={58} textAnchor="middle" fontFamily="Baloo2" fontWeight={800} fontSize={24} fill={BROWN}>
              {i === 5 ? "5 th" : i}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

/** Kompor dua tungku (mati) */
const Stove: React.FC = () => (
  <svg width={380} height={150} viewBox="0 0 380 150" style={{ overflow: "visible" }}>
    <rect x={0} y={44} width={380} height={106} rx={18} fill="#C9CED6" {...SH} />
    <rect x={14} y={30} width={352} height={24} rx={8} fill="#3A3F4B" {...SH} strokeWidth={5} />
    <ellipse cx={100} cy={30} rx={62} ry={12} fill="#555B66" {...SH} strokeWidth={5} />
    <ellipse cx={280} cy={30} rx={62} ry={12} fill="#555B66" {...SH} strokeWidth={5} />
    {[110, 190, 270].map((x) => (
      <circle key={x} cx={x} cy={100} r={16} fill="#3A3F4B" {...SH} strokeWidth={5} />
    ))}
  </svg>
);

/** Lemari dapur + meja */
const Counter: React.FC<{ left: number; top: number }> = ({ left, top }) => (
  <div style={{ position: "absolute", left, right: -10, top, height: 360, background: "#C98F6B", border: `${OUTLINE}px solid ${C.ink}`, borderRadius: "18px 0 0 0" }}>
    <div style={{ position: "absolute", left: -10, right: 0, top: -14, height: 34, background: "#F4E3D3", border: `${OUTLINE}px solid ${C.ink}`, borderRadius: 12 }} />
    <div style={{ position: "absolute", left: 50, top: 80, width: 200, height: 170, borderRadius: 14, border: `6px solid ${C.ink}`, background: "#B97E5B" }} />
    <div style={{ position: "absolute", left: 290, top: 80, width: 200, height: 170, borderRadius: 14, border: `6px solid ${C.ink}`, background: "#B97E5B" }} />
  </div>
);

/** Catatan tempel: tanggal pasang regulator & selang */
const StickyNote: React.FC<{ reveal: number[]; pin?: number }> = ({ reveal, pin = 0 }) => {
  const line = (k: number, node: React.ReactNode) => <div style={{ clipPath: `inset(-10px ${100 - 100 * reveal[k]}% -10px 0)`, opacity: reveal[k] > 0 ? 1 : 0 }}>{node}</div>;
  return (
    <div style={{ position: "relative", width: 500, height: 400, boxSizing: "border-box", padding: "54px 40px 0", background: "#FFE27A", border: `7px solid ${C.ink}`, borderRadius: 14, boxShadow: `0 12px 0 ${C.ink}` }}>
      {line(0, <div style={{ fontFamily: HEAD, fontSize: 48, color: BROWN, lineHeight: 1 }}>DIPASANG:</div>)}
      {line(1, <div style={{ fontFamily: HEAD, fontSize: 76, color: C.ink, lineHeight: 1.08 }}>1 DES 2026</div>)}
      {line(2, <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 36, color: C.ink, marginTop: 16, lineHeight: 1.15 }}>ganti selang: 2028</div>)}
      {line(3, <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 36, color: C.ink, lineHeight: 1.15 }}>ganti regulator: 2029</div>)}
      {pin > 0 && <div style={{ position: "absolute", left: 210, top: -58, fontSize: 84, lineHeight: 1, scale: String(pin) }}>📌</div>}
    </div>
  );
};

/** Panci mengepul di kompor (adegan keluarga) */
const CookPot: React.FC = () => {
  const t = useT();
  return (
    <svg width={300} height={240} viewBox="0 0 300 240" style={{ overflow: "visible" }}>
      {[0, 1, 2].map((i) => {
        const p = (t * 0.5 + i / 3) % 1;
        return <path key={i} d={`M${90 + i * 60} ${70 - p * 60} q-14 -16 0 -32 q14 -16 0 -32`} fill="none" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" opacity={Math.sin(p * Math.PI)} />;
      })}
      <rect x={40} y={80} width={220} height={110} rx={20} fill="#E8634A" {...SH} />
      <rect x={20} y={70} width={260} height={28} rx={12} fill="#C9503A" {...SH} />
      <rect x={10} y={190} width={280} height={40} rx={10} fill="#6B7280" {...SH} />
    </svg>
  );
};

/** Gelembung tawa kecil */
const Laugh: React.FC<{ at: number; x: number; y: number; text: string; rot?: number }> = ({ at, x, y, text, rot = -6 }) => {
  const t = useT();
  return (
    <Pop at={at} x={x} y={y + Math.sin((t - at) * 6) * 6}>
      <div style={{ fontFamily: HEAD, fontSize: 40, color: C.ink, background: "#FFFFFF", border: `5px solid ${C.ink}`, borderRadius: 999, padding: "2px 22px 6px", rotate: `${rot}deg`, boxShadow: `0 6px 0 ${C.ink}` }}>{text}</div>
    </Pop>
  );
};

/* ----------------------------------------------------------------- adegan */
const Ep13Scenes: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const shake = useShake([{ t: 9.91, a: 8 }]);

  // 1 — rumah tenang, pin lokasi jatuh
  const pinS = pop(t, 1.42, fps, 10, 170);
  const warm1 = interpolate(t, [3.6, 4.6], [0, 1], { ...clamp, easing: easeInOut });
  // 2 — uap gas kecil di regulator
  const leak2 = interpolate(t, [5.6, 6.4], [0, 1], clamp);
  const ring2 = pop(t, 6.63, fps, 11, 200);
  // 4 — Si Halus ketakutan, mengecil
  const shrink4 = 1 - 0.18 * pop(t, 11.71, fps, 10, 160);
  // 5 — Si Halus meringis tiap kelemahan disebut
  const bump = (at: number) => (t >= at ? Math.exp(-(t - at) * 6) : 0);
  const cringe5 = 1 - 0.1 * bump(13.24) - 0.1 * bump(13.88);
  const win5 = interpolate(t, [14.0, 14.6], [0, 1], { ...clamp, easing: easeInOut });
  // 6a — timbangan miring ke elpiji
  const tipS = pop(t, 16.0, fps, 9, 120);
  const tilt6 = 3 * Math.sin(t * 3) * (1 - tipS) + 14 * tipS;
  // 6b — gas turun & ngumpul di lantai
  const pool6 = interpolate(t, [17.2, 18.9], [0.15, 1], { ...clamp, easing: easeInOut });
  // 9 — Si Halus mental dari kubah rumah
  const approach9 = interpolate(t, [36.7, 38.0], [-260, 140], { ...clamp, easing: easeInOut });
  const bounce9 = t >= 38.04 ? pop(t, 38.04, fps, 9, 90) : 0;
  // 11a — spons air sabun ke sambungan
  const bowlPt: [number, number] = [830, 410];
  const j1Pt: [number, number] = [J1[0] + 22, J1[1] - 42];
  const j2Pt: [number, number] = [J2[0] + 70, J2[1] + 2];
  const arc = (a: [number, number], b: [number, number], k: number, h = 90): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k - h * Math.sin(Math.PI * k)];
  const go1 = interpolate(t, [44.02, 44.6], [0, 1], { ...clamp, easing: easeInOut });
  const go2 = interpolate(t, [45.1, 45.4], [0, 1], { ...clamp, easing: easeInOut });
  const dab = t > 44.6 ? 10 * Math.abs(Math.sin((t - 44.6) * 11)) : 0;
  const sp: [number, number] = t < 45.1 ? arc(bowlPt, j1Pt, go1) : arc(j1Pt, j2Pt, go2, 40);
  const sponge11: [number, number] = [sp[0], sp[1] + dab];
  const foam1 = interpolate(t, [44.6, 44.95], [0, 1], clamp);
  const foam2 = interpolate(t, [45.4, 45.7], [0, 1], clamp);
  // 11b — zoom ke sambungan, gelembung muncul
  const zoom11 = interpolate(t, [45.95, 46.7], [0, 1], { ...clamp, easing: easeInOut });
  const bub11 = interpolate(t, [47.35, 48.3], [0, 1], { ...clamp, easing: easeOut });
  // 13 — tulis catatan, lalu tempel dekat kompor
  const wr = (a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], clamp);
  const noteIn = pop(t, 52.6, fps, 12, 180);
  const stick = interpolate(t, [54.59, 55.2], [0, 1], { ...clamp, easing: easeInOut });
  const noteX = 540 + (700 - 540) * stick;
  const noteY = 700 + (610 - 700) * stick;
  const noteS = interpolate(noteIn, [0, 1], [0.3, 1]) * (1 - 0.58 * stick);
  const pin13 = pop(t, 55.05, fps, 9, 220);
  // 14 — cahaya keemasan
  const glow14 = interpolate(t, [56.0, 58.6], [0.3, 1], { ...clamp, easing: easeInOut });

  return (
    <AbsoluteFill style={{ translate: shake }}>
      {/* 1 — Pekalongan, disebut lembut */}
      <Scene a={0} b={5.2} zoom={false}>
        <Sky>
          <div style={{ position: "absolute", left: 250, top: 380 }}>
            <House warm={warm1} />
          </div>
          {t >= 1.38 && (
            <div style={{ position: "absolute", left: 465, top: interpolate(pinS, [0, 1], [-160, 290]) }}>
              <MapPin />
            </div>
          )}
        </Sky>
        <Pop at={0.3} x={70} y={340}>
          <Tag bg="#FFFFFF" size={42} rot={-3}>
            📍 Pekalongan · Nov 2025
          </Tag>
        </Pop>
        <Sticker at={3.94} y={460} bg="#FFF3D6" color={C.ink} size={54} rotate={2}>
          {"BIKIN KITA SEMUA BELAJAR 💛"}
        </Sticker>
      </Scene>

      {/* 2 — kata Pertamina: regulator bocor */}
      <Scene a={5.2} b={8.0}>
        <Room>
          <div style={{ position: "absolute", left: 80, top: 230 }}>
            <TankRig leak={leak2} />
          </div>
        </Room>
        {t >= 6.58 && (
          <div
            style={{
              position: "absolute",
              left: 190,
              top: 554,
              width: 200,
              height: 200,
              boxSizing: "border-box",
              borderRadius: "50%",
              border: `9px dashed ${CORAL}`,
              rotate: `${t * 40}deg`,
              scale: String(interpolate(ring2, [0, 1], [1.8, 1]) * (1 + 0.04 * Math.sin(t * 8))),
              opacity: interpolate(ring2, [0, 0.3], [0, 1], clamp),
            }}
          />
        )}
        <Pop at={5.3} x={70} y={340}>
          <Tag bg="#FFFFFF" size={40} rot={-2}>
            🗣️ kata Pertamina: regulator bocor
          </Tag>
        </Pop>
        <Pop at={6.63} x={110} y={462}>
          <Tag bg="#FFF0DC" size={36} rot={-4}>
            regulator 👇
          </Tag>
        </Pop>
        <Source y={1120}>sumber: keterangan Pertamina (detik.com, Nov 2025)</Source>
      </Scene>

      {/* 3 — Si Halus: Gas Bocor */}
      <Scene a={8.0} b={10.37}>
        <Room dim={0.12}>
          <GasPool level={0.45} />
        </Room>
        <Scanner at={8.2} dur={0.9} top={430} height={720}>
          <div style={{ position: "absolute", left: 373, top: 500 }}>
            <SiHalus size={400} variant="lpg" mood="laugh" />
          </div>
        </Scanner>
        <Pop at={8.84} x={80} y={1010}>
          <Tag bg="#FFFFFF" size={38} rot={-3}>
            nggak kelihatan 👀
          </Tag>
        </Pop>
        <Pop at={9.45} x={560} y={1075}>
          <Tag bg="#F1F8E6" size={38} rot={3}>
            …tapi kecium 👃
          </Tag>
        </Pop>
        <Sticker at={9.91} y={330} bg="#FFB48F" color={C.ink} size={62} rotate={-3}>
          {"SI HALUS: GAS BOCOR 👃"}
        </Sticker>
      </Scene>

      {/* 4 — tenang, gampang dikalahin */}
      <Scene a={10.37} b={12.45}>
        <Room wall="#FFF1DE">
          <div style={{ position: "absolute", left: 40, top: 230 }}>
            <Worker size={520} pose="point" expr="happy" {...IBU} seed={8} />
          </div>
          <div style={{ position: "absolute", left: 520, top: 250, scale: String(shrink4), translate: `${Math.sin(t * 40) * 3}px 0px` }}>
            <SiHalus size={380} variant="lpg" mood="scared" />
          </div>
          <div style={{ position: "absolute", left: 820, top: 230, fontSize: 64, opacity: 0.6 + 0.4 * Math.sin(t * 6) }}>💦</div>
        </Room>
        <Sticker at={10.37} y={330} bg="#CFEFDF" color={C.ink} size={54} rotate={-2}>
          {"TENANG, GAMPANG DIKALAHIN 💪"}
        </Sticker>
      </Scene>

      {/* 5 — kelemahannya: air sabun & jendela kebuka */}
      <Scene a={12.45} b={14.85}>
        <Sticker at={12.48} y={320} bg="#FFF3D6" color={C.ink} size={54} rotate={-2}>
          {"KELEMAHANNYA CUMA 2 👇"}
        </Sticker>
        <div style={{ position: "absolute", left: 432, top: 440, scale: String(cringe5), translate: `${(1 - cringe5) * 30 * Math.sin(t * 50)}px 0px` }}>
          <SiHalus size={260} variant="lpg" mood="busted" />
        </div>
        <WeakCard icon="🧼" title="AIR SABUN" sub="buat ngecek bocor" at={13.24} x={70} y={720} bg="#E3F2FA" rot={-2} />
        <WeakCard icon={<OpenWindow p={win5} />} title="JENDELA KEBUKA" sub="biar gasnya ngalir keluar" at={13.88} x={560} y={720} bg="#E7F4D9" rot={2} />
      </Scene>

      {/* 6a — kenalan: lebih berat dari udara */}
      <Scene a={14.85} b={17.05}>
        <Pop at={14.87} x={70} y={330}>
          <Tag bg="#FFFFFF" size={42} rot={-3}>
            👋 kenalan dulu: gas elpiji
          </Tag>
        </Pop>
        <div style={{ position: "absolute", left: 90, top: 450 }}>
          <BalanceScale tilt={tilt6} />
        </div>
        <Sticker at={16.07} y={1050} bg="#E7F4D9" color={C.ink} size={52} rotate={-2}>
          {"LEBIH BERAT DARI UDARA ⬇️"}
        </Sticker>
      </Scene>

      {/* 6b — ngumpul di bawah, deket lantai */}
      <Scene a={17.05} b={19.1}>
        <Room>
          <div style={{ position: "absolute", left: 640, top: 250, scale: "1.15" }}>
            <OpenWindow p={0} />
          </div>
          <div style={{ position: "absolute", left: 80, top: 420 }}>
            <svg width={220} height={300} viewBox="0 0 220 300">
              <rect x={20} y={40} width={180} height={250} rx={60} fill="#3FAE5A" {...SH} />
              <rect x={70} y={6} width={80} height={44} rx={10} fill="#C9CED6" {...SH} />
            </svg>
          </div>
          <FallingPuffs x={210} y={440} floor={760} at={17.1} />
          <GasPool level={pool6} h={260} />
          {t > 18.45 && <div style={{ position: "absolute", left: 30, right: 30, top: 880 - 260 * pool6 - 6, height: 0, borderTop: `6px dashed ${C.ink}`, opacity: interpolate(t, [18.45, 18.7], [0, 0.6], clamp) }} />}
        </Room>
        <Pop at={17.12} x={70} y={340}>
          <Tag bg="#FFFFFF" size={40} rot={-2}>
            ☁️ dia suka ngumpul di bawah
          </Tag>
        </Pop>
        <Pop at={18.48} x={390} y={830}>
          <Tag bg="#F1F8E6" size={40} rot={2}>
            deket lantai 👇
          </Tag>
        </Pop>
      </Scene>

      {/* 7a — kalau cium bau gas (kartu simpan) */}
      <Scene a={19.1} b={25.1}>
        <Sticker at={19.17} y={300} bg="#FFF3D6" color={C.ink} size={54} rotate={-2}>
          {"KALAU CIUM BAU GAS 👃"}
        </Sticker>
        <StepCard n={1} icon={BREATH} title="TARIK NAPAS DULU" sub="tenang, kamu pasti bisa" at={20.62} next={21.57} y={440} color="#BFE3F5" />
        <StepCard n={2} icon={<Switch size={88} />} title="JANGAN PENCET SAKLAR" sub="nyalain atau matiin, tahan dulu" at={21.57} y={660} color="#FFE27A" />
        <CPop at={19.35} out={22.95} y={900}>
          <Sniff />
        </CPop>
        <Chip icon="💡" label="LAMPU" at={23.19} x={60} y={890} />
        <Chip icon={<Fan size={82} />} label="KIPAS" at={23.54} x={395} y={890} />
        <Chip icon="🔌" label="COLOKAN" at={23.88} x={730} y={890} />
        <CPop at={24.29} y={1088}>
          <Tag bg="#FFFFFF" size={38} rot={-1}>
            biarin aja dulu 👌
          </Tag>
        </CPop>
      </Scene>

      {/* 7b — langkah 3-5 */}
      <Scene a={25.1} b={31.6}>
        <Sticker at={25.15} y={300} bg="#FFF3D6" color={C.ink} size={54} rotate={-2}>
          {"TERUS, PELAN-PELAN AJA 👇"}
        </Sticker>
        <StepCard n={3} icon="🚪" title="BUKA PINTU & JENDELA" sub="lebar-lebar, biar gasnya ngalir keluar" at={25.18} next={28.08} y={440} color="#CFEFDF" />
        <StepCard n={4} icon={<MiniReg size={92} />} title="LEPAS REGULATOR" sub="pelan-pelan aja, nggak usah buru-buru" at={28.08} next={30.16} y={660} color="#F3D6C6" />
        <StepCard n={5} icon="🌳" title="TABUNG KE TEMPAT TERBUKA" sub="bawa ke luar, yang anginnya lancar" at={30.16} y={880} color="#D7F0C2" />
        <Pop at={25.45} out={27.85} x={60} y={672}>
          <AirOut at={25.45} />
        </Pop>
        <Pop at={28.3} out={29.95} x={60} y={880}>
          <RegLift at={28.3} />
        </Pop>
        <CPop at={26.6} y={1100}>
          <Tag bg="#FFFFFF" size={36} rot={-2}>
            📌 simpan video ini
          </Tag>
        </CPop>
      </Scene>

      {/* 8a — udah, gitu aja! */}
      <Scene a={31.6} b={34.55}>
        <Confetti at={31.69} />
        <Sticker at={31.69} y={360} bg="#FFE27A" color={C.ink} size={78} rotate={-3}>
          {"UDAH, GITU AJA! 🎉"}
        </Sticker>
        <Recap at={31.95} y={560} />
        <CPop at={32.56} y={790}>
          <Tag bg="#FFFFFF" size={46} rot={-2}>
            ✅ nggak perlu panik
          </Tag>
        </CPop>
        <CPop at={33.43} y={910}>
          <Tag bg="#FFFFFF" size={46} rot={2}>
            ✅ nggak perlu alat khusus
          </Tag>
        </CPop>
      </Scene>

      {/* 8b — kamu udah keren */}
      <Scene a={34.55} b={36.65}>
        <Room wall="#FFF1DE" glow={0.9}>
          <div style={{ position: "absolute", left: 110, top: 180 }}>
            <Worker size={540} pose="wave" expr="happy" {...IBU} seed={8} />
          </div>
          <div style={{ position: "absolute", left: 560, top: 390 }}>
            <Worker size={330} pose="wave" expr="happy" {...ANAK} seed={4} />
          </div>
        </Room>
        <FloatHearts at={34.7} />
        <Sticker at={34.64} y={330} bg="#FFF3D6" color={C.ink} size={54} rotate={-2}>
          {"KAMU UDAH KEREN BANGET 💛"}
        </Sticker>
        <CPop at={35.65} y={1070}>
          <Tag bg="#FFFFFF" size={40} rot={-2}>
            ✨ hafal 5 langkah = siap!
          </Tag>
        </CPop>
      </Scene>

      {/* 9 — biar si Gas bocor nggak mampir lagi */}
      <Scene a={36.65} b={39.75}>
        <Sky>
          <div style={{ position: "absolute", left: 300, top: 380 }}>
            <House warm={1} />
          </div>
          <Shield at={37.8} hitAt={38.04} cx={560} cy={640} rx={300} ry={330} />
          <div style={{ position: "absolute", left: approach9 - 95 * bounce9, top: 370, rotate: `${-14 * bounce9}deg` }}>
            <SiHalus size={230} variant="lpg" mood={t < 38.04 ? "grin" : "scared"} />
          </div>
          {t > 38.1 && <div style={{ position: "absolute", left: 190, top: 330, fontSize: 56, opacity: interpolate(t, [38.1, 38.3], [0, 1], clamp) }}>💦</div>}
        </Sky>
        <CPop at={37.05} y={340}>
          <Tag bg="#FFFFFF" size={38} rot={-2}>
            biar si Gas bocor nggak mampir lagi 👋
          </Tag>
        </CPop>
        <Sticker at={38.87} y={460} bg="#E7F4D9" color={C.ink} size={56} rotate={-2}>
          {"INI KEBIASAAN KECILNYA 👇"}
        </Sticker>
      </Scene>

      {/* 10 — regulator & selang SNI */}
      <Scene a={39.75} b={42.2}>
        <Sticker at={39.82} y={320} bg="#E7F4D9" color={C.ink} size={54} rotate={-2}>
          {"REGULATOR & SELANG SNI ✅"}
        </Sticker>
        <RigCard y={470} at={39.85}>
          <JointRig />
        </RigCard>
        <Seal at={41.47} x={170} y={590} />
        <Seal at={41.62} x={780} y={670} />
        <CPop at={40.5} y={1040}>
          <Tag bg="#FFFFFF" size={38} rot={-2}>
            🔍 cek tanda SNI di kemasannya
          </Tag>
        </CPop>
      </Scene>

      {/* 11a — oles air sabun di sambungan */}
      <Scene a={42.2} b={45.95}>
        <Sticker at={42.28} y={320} bg="#E3F2FA" color={C.ink} size={52} rotate={-2}>
          {"RUTIN CEK PAKAI AIR SABUN 🧼"}
        </Sticker>
        <RigCard y={470} at={42.3}>
          <JointRig bowl sponge={sponge11} foam1={foam1} foam2={foam2} />
        </RigCard>
        <CPop at={44.3} y={1040}>
          <Tag bg="#FFFFFF" size={36} rot={-2}>
            oles di sambungan regulator & selang 👆
          </Tag>
        </CPop>
      </Scene>

      {/* 11b — 30 detik: gelembung = ada yang bocor */}
      <Scene a={45.95} b={49.85}>
        <CPop at={46.04} y={300}>
          <TimerBadge at={46.04} />
        </CPop>
        <RigCard y={470} at={44.0}>
          <JointRig zoom={zoom11} foam1={1} foam2={1} bubbles={bub11} />
        </RigCard>
        <CPop at={47.94} y={1008}>
          <Tag bg="#FFFFFF" size={38} rot={-2}>
            muncul gelembung = ada yang bocor
          </Tag>
        </CPop>
        <Sticker at={49.06} y={1090} bg="#CFEFDF" color={C.ink} size={46} rotate={2}>
          {"TINGGAL DIGANTI 👍"}
        </Sticker>
      </Scene>

      {/* 12 — umur pakai */}
      <Scene a={49.85} b={52.45}>
        <Sticker at={49.93} y={310} bg="#FFF3D6" color={C.ink} size={56} rotate={-2}>
          {"GANTI RUTIN 🔄"}
        </Sticker>
        <LifeRow icon={<MiniHose size={104} />} name="SELANG" label="tiap 2–3 tahun" range={[2, 3]} at={50.13} y={450} color="#FFD8B8" />
        <LifeRow icon={<MiniReg size={104} />} name="REGULATOR" label="tiap 3–5 tahun" range={[3, 5]} at={51.06} y={752} color="#D6E4F0" />
        <Source y={1070}>sumber: Ditjen Migas ESDM</Source>
      </Scene>

      {/* 13 — catat tanggal pasang, tempel dekat kompor */}
      <Scene a={52.45} b={55.85}>
        <Room wall="#FBE7CF" floor="#E2B48A">
          <Counter left={380} top={560} />
          <div style={{ position: "absolute", left: 470, top: 412 }}>
            <Stove />
          </div>
        </Room>
        {t >= 52.55 && (
          <div style={{ position: "absolute", left: noteX - 250, top: noteY - 200, width: 500, height: 400, scale: String(noteS), rotate: `${-3 + 8 * stick}deg`, opacity: interpolate(noteIn, [0, 0.3], [0, 1], clamp) }}>
            <StickyNote reveal={[wr(53.28), wr(53.51), wr(53.9, 0.4), wr(54.2, 0.4)]} pin={t >= 55.0 ? pin13 : 0} />
          </div>
        )}
        <CPop at={52.51} y={330}>
          <Tag bg="#FFFFFF" size={38} rot={-2}>
            📝 biar nggak lupa: catat tanggal pasang
          </Tag>
        </CPop>
        <CPop at={54.59} y={1090}>
          <Tag bg="#FFFFFF" size={40} rot={2}>
            📌 tempel deket kompor
          </Tag>
        </CPop>
      </Scene>

      {/* 14 — haru: dapur keluarga, penjaga rumah yang keren */}
      <Scene a={55.85} b={EP13.endStart}>
        <Room wall="#FBE7CF" floor="#E2B48A" glow={glow14}>
          <div style={{ position: "absolute", left: 640, top: 650, width: 420, height: 260, background: "#C98F6B", border: `${OUTLINE}px solid ${C.ink}`, borderRadius: "18px 0 0 0" }} />
          <div style={{ position: "absolute", left: 660, top: 420 }}>
            <CookPot />
          </div>
          <div style={{ position: "absolute", left: 560, top: 100, width: 500, height: 400, scale: "0.36", rotate: "5deg" }}>
            <StickyNote reveal={[1, 1, 1, 1]} pin={1} />
          </div>
          <div style={{ position: "absolute", left: 10, top: 270 }}>
            <Worker size={460} pose="wave" expr="happy" {...BAPAK} seed={2} />
          </div>
          <div style={{ position: "absolute", left: 240, top: 300 }}>
            <Worker size={430} pose="idle" expr="happy" {...IBU} seed={8} />
          </div>
          <div style={{ position: "absolute", left: 500, top: 430 }}>
            <Worker size={290} pose="wave" expr="happy" {...ANAK} seed={4} />
          </div>
        </Room>
        <FloatHearts at={57.98} />
        <Laugh at={57.23} x={70} y={500} text="haha!" rot={-8} />
        <Laugh at={57.4} x={420} y={530} text="hehe" rot={6} />
        <CPop at={56.28} y={340}>
          <Tag bg="#FFFFFF" size={40} rot={-2}>
            dapur = tempat kumpul & ketawa 💛
          </Tag>
        </CPop>
        <Sticker at={59.78} y={985} bg="#FFF3D6" color={C.ink} size={56} rotate={-2}>
          {"PENJAGA RUMAH\nYANG KEREN 🏠💛"}
        </Sticker>
      </Scene>
    </AbsoluteFill>
  );
};

const W = warp.length ? warp : undefined;

export const Ep13: React.FC = () => (
  <Episode ep={13} accent="#E8663D" tint="#F6C2A0" words={words} endStart={W ? warpOldToNew(EP13.endStart, W) : EP13.endStart} revealAt={W ? warpOldToNew(EP13.revealAt, W) : EP13.revealAt} warp={W} flashes={[9.91]}>
    <Ep13Scenes />
  </Episode>
);
