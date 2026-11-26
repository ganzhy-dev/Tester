import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut, easeOut } from "../brand";
import { Expr, Pose, SiHalus, Worker } from "../Characters";
import { Episode } from "../Episode";
import { Pop, Scanner, Sticker, useShake } from "../Kit";
import { Badge, Bubble, CheckRow, InfoCard, Room } from "../Props";
import { Scene } from "./Ep1";
import { words } from "./ep4.words";

/** Semua waktu = detik VO final (data/ep4_words.json), tanpa warp */
export const EP4 = { dur: 65.33, endStart: 60.81, revealAt: 63.04 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const S = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const KITCHEN = { wall: "#5A2E22", floor: "#3A1C14" };

/* ----------------------------------------------------------- gambar lokal */
const ChefHat: React.FC<{ w: number }> = ({ w }) => (
  <svg width={w} height={w * 0.8} viewBox="0 0 260 208" style={{ overflow: "visible" }}>
    <path d="M40 150 Q0 120 30 80 Q40 30 95 45 Q120 0 165 40 Q225 20 232 80 Q262 120 220 150 Z" fill={C.white} {...S} />
    <rect x={44} y={140} width={172} height={60} rx={14} fill={C.white} {...S} />
    <path d="M90 150 L90 196 M130 150 L130 196 M170 150 L170 196" stroke="#D9D3E6" strokeWidth={8} />
  </svg>
);

/** Bang Jo versi juru masak (topi koki digambar di atas kepala) */
const CookJo: React.FC<{
  size: number;
  expr?: Expr;
  pose?: Pose;
  red?: number;
  sweat?: boolean;
  steam?: boolean;
  seed?: number;
  flip?: boolean;
  hat?: boolean;
  shirt?: string;
  pants?: string;
  helmet?: boolean;
}> = ({ size, expr = "normal", pose = "idle", red = 0, sweat = false, steam = false, seed = 0, flip = false, hat = true, shirt = C.white, pants = "#2A2140", helmet = false }) => {
  const t = useT();
  const k = size / 660;
  const skin = interpolateColors(red, [0, 1], [C.skin, "#E0674F"]);
  const bob = Math.sin((t + seed * 1.7) * Math.PI * 1.8) * 5;
  return (
    <div style={{ position: "relative", width: size * (400 / 620), height: size }}>
      <Worker size={size} expr={expr} pose={pose} shirt={shirt} pants={pants} skin={skin} seed={seed} flip={flip} helmet={helmet} />
      {hat && (
        <div style={{ position: "absolute", left: (200 + 30 - 130 * 1.15) * k, top: (52 + 20 - 175 * 1.15) * k + bob }}>
          <ChefHat w={260 * 1.15 * k} />
        </div>
      )}
      {sweat &&
        [0, 1, 2].map((i) => {
          const p = (t * 1.1 + i / 3) % 1;
          return (
            <svg
              key={i}
              width={40 * k * 1.6}
              height={56 * k * 1.6}
              viewBox="0 0 40 56"
              style={{ position: "absolute", left: (i === 1 ? 80 : i === 0 ? 300 : 330) * k + 20 * k, top: (150 + p * 160) * k + bob, opacity: 1 - p }}
            >
              <path d="M20 2 Q38 30 34 40 Q30 54 20 54 Q10 54 6 40 Q2 30 20 2 Z" fill={C.cyan} stroke={C.ink} strokeWidth={4} />
            </svg>
          );
        })}
      {steam &&
        [0, 1, 2].map((i) => {
          const p = (t * 0.8 + i / 3) % 1;
          let d = `M${150 + i * 50} ${40 - p * 150}`;
          for (let j = 0; j < 4; j++) d += ` q14 -14 0 -28`;
          return (
            <svg key={i} width={size} height={size} viewBox="0 0 660 660" style={{ position: "absolute", left: 0, top: -260 * k, overflow: "visible" }}>
              <path d={d} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={14} strokeLinecap="round" opacity={1 - p} />
            </svg>
          );
        })}
    </div>
  );
};

/** Kompor + panci dengan api bergoyang */
const Stove: React.FC<{ w?: number; steam?: boolean }> = ({ w = 420, steam = true }) => {
  const t = useT();
  return (
    <svg width={w} height={w * 0.95} viewBox="0 0 420 400" style={{ overflow: "visible" }}>
      {steam &&
        [0, 1, 2].map((i) => {
          const p = (t * 0.7 + i / 3) % 1;
          let d = `M${150 + i * 60} ${110 - p * 140}`;
          for (let j = 0; j < 3; j++) d += ` q16 -16 0 -32`;
          return <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={12} strokeLinecap="round" opacity={1 - p} />;
        })}
      {/* panci */}
      <rect x={90} y={120} width={240} height={130} rx={24} fill="#9AA0B5" {...S} />
      <rect x={70} y={108} width={280} height={28} rx={14} fill="#B8BDD0" {...S} />
      <rect x={40} y={150} width={50} height={22} rx={11} fill="#5B6275" {...S} />
      <rect x={330} y={150} width={50} height={22} rx={11} fill="#5B6275" {...S} />
      {/* api */}
      {[130, 210, 290].map((x, i) => {
        const h = 46 + Math.sin(t * 14 + i * 2) * 10;
        return <path key={x} d={`M${x - 24} 280 Q${x - 26} ${280 - h * 0.6} ${x} ${280 - h} Q${x + 26} ${280 - h * 0.6} ${x + 24} 280 Z`} fill={C.orange} stroke={C.ink} strokeWidth={5} />;
      })}
      {[130, 210, 290].map((x, i) => {
        const h = 26 + Math.sin(t * 17 + i) * 6;
        return <path key={`i${x}`} d={`M${x - 12} 280 Q${x - 12} ${280 - h * 0.6} ${x} ${280 - h} Q${x + 12} ${280 - h * 0.6} ${x + 12} 280 Z`} fill={C.yellow} />;
      })}
      {/* badan kompor */}
      <rect x={30} y={280} width={360} height={110} rx={20} fill="#2A2140" {...S} />
      <circle cx={110} cy={335} r={18} fill={C.pink} {...S} strokeWidth={5} />
      <circle cx={310} cy={335} r={18} fill={C.pink} {...S} strokeWidth={5} />
    </svg>
  );
};

/** Termometer sederhana; value 34..42 */
const Thermo: React.FC<{ value: number; h?: number }> = ({ value, h = 560 }) => {
  const w = h * 0.3;
  const p = interpolate(value, [34, 42], [0.08, 0.95], clamp);
  const col = interpolateColors(value, [36.5, 38.5, 40], ["#FFB020", C.orange, "#FF2E2E"]);
  const top = h * 0.04;
  const bottom = h * 0.78;
  const level = bottom - (bottom - top) * p;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect x={w * 0.3} y={0} width={w * 0.4} height={h * 0.85} rx={w * 0.2} fill={C.cream} {...S} />
      <circle cx={w / 2} cy={h * 0.84} r={w * 0.42} fill={C.cream} {...S} />
      <rect x={w * 0.39} y={level} width={w * 0.22} height={h * 0.84 - level} rx={w * 0.11} fill={col} />
      <circle cx={w / 2} cy={h * 0.84} r={w * 0.32} fill={col} />
      {new Array(8).fill(0).map((_, i) => (
        <rect key={i} x={w * 0.72} y={top + 30 + i * ((bottom - top - 30) / 7)} width={i % 2 ? w * 0.08 : w * 0.14} height={5} rx={2} fill={C.ink} />
      ))}
    </svg>
  );
};

const BigText: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({ children, size = 200, color = C.orange }) => (
  <div
    style={{
      fontFamily: HEAD,
      fontSize: size,
      lineHeight: 1,
      color,
      WebkitTextStroke: `${size * 0.07}px ${C.ink}`,
      paintOrder: "stroke fill",
      textShadow: `0 ${size * 0.07}px 0 ${C.ink}`,
      fontVariantNumeric: "tabular-nums",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

const Label: React.FC<{ children: React.ReactNode; size?: number; color?: string; bg?: string }> = ({ children, size = 48, color = C.ink, bg = C.cream }) => (
  <div
    style={{
      fontFamily: BODY,
      fontWeight: 800,
      fontSize: size,
      color,
      background: bg,
      padding: "8px 26px 12px",
      borderRadius: 26,
      border: `6px solid ${C.ink}`,
      boxShadow: `0 8px 0 ${C.ink}`,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

/** Panah panas masuk ke badan */
const HeatArrow: React.FC<{ from: [number, number]; to: [number, number]; at: number; color?: string }> = ({ from, to, at, color = C.orange }) => {
  const t = useT();
  const p = interpolate(t, [at, at + 0.5], [0, 1], { ...clamp, easing: easeOut });
  if (p <= 0) return null;
  const x = from[0] + (to[0] - from[0]) * p;
  const y = from[1] + (to[1] - from[1]) * p;
  const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const h = 34;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <line x1={from[0]} y1={from[1]} x2={x} y2={y} stroke={C.ink} strokeWidth={30} strokeLinecap="round" />
      <line x1={from[0]} y1={from[1]} x2={x} y2={y} stroke={color} strokeWidth={16} strokeLinecap="round" strokeDasharray="30 18" strokeDashoffset={-t * 120} />
      <path
        d={`M${x + Math.cos(ang) * h} ${y + Math.sin(ang) * h} L${x + Math.cos(ang + 2.4) * h} ${y + Math.sin(ang + 2.4) * h} L${x + Math.cos(ang - 2.4) * h} ${y + Math.sin(ang - 2.4) * h} Z`}
        fill={color}
        stroke={C.ink}
        strokeWidth={6}
        strokeLinejoin="round"
      />
    </svg>
  );
};

const AlarmClock: React.FC<{ size?: number }> = ({ size = 260 }) => {
  const t = useT();
  const wob = Math.sin(t * 40) * 6;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ rotate: `${wob}deg`, overflow: "visible" }}>
      <circle cx={55} cy={45} r={26} fill={C.yellow} {...S} strokeWidth={6} />
      <circle cx={145} cy={45} r={26} fill={C.yellow} {...S} strokeWidth={6} />
      <circle cx={100} cy={110} r={74} fill={C.cream} {...S} />
      <path d="M100 110 L100 66 M100 110 L132 126" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      <path d="M60 180 L46 196 M140 180 L154 196" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      {[0, 1].map((i) => (
        <path key={i} d={i ? "M180 60 Q196 90 182 120" : "M20 60 Q4 90 18 120"} fill="none" stroke={C.pink} strokeWidth={8} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 30 + i)} />
      ))}
    </svg>
  );
};

const Glass: React.FC<{ size?: number }> = ({ size = 260 }) => {
  const t = useT();
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 200 240" style={{ overflow: "visible" }}>
      <path d="M30 20 L170 20 L150 225 L50 225 Z" fill="rgba(255,255,255,0.25)" {...S} />
      <path d={`M42 ${80 + Math.sin(t * 5) * 4} Q100 ${70 + Math.sin(t * 5 + 1) * 6} 158 ${80 + Math.sin(t * 5) * 4} L148 218 L52 218 Z`} fill={C.cyan} />
      <path d="M30 20 L170 20 L150 225 L50 225 Z" fill="none" {...S} />
      <circle cx={80} cy={150} r={8} fill="rgba(255,255,255,0.7)" />
      <circle cx={120} cy={180} r={6} fill="rgba(255,255,255,0.6)" />
    </svg>
  );
};

const URINE = ["#FFF6C9", "#FCE98A", "#F4D35E", "#E0A93A", "#B9762A", "#8A4E1E"];


/* ---------------------------------------------- gambar baru: sehari-hari */
const HOT_SKY = { wall: "#B5502A", floor: "#6B3A22" };

/** Matahari terik berdenyut */
const BigSun: React.FC<{ size?: number }> = ({ size = 260 }) => {
  const t = useT();
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible", rotate: `${t * 20}deg` }}>
      {new Array(12).fill(0).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={100 + Math.cos(a) * 70} y1={100 + Math.sin(a) * 70} x2={100 + Math.cos(a) * 98} y2={100 + Math.sin(a) * 98} stroke={C.yellow} strokeWidth={14} strokeLinecap="round" />;
      })}
      <circle cx={100} cy={100} r={58} fill={C.yellow} {...S} />
      <circle cx={100} cy={100} r={58 + 4 * Math.sin(t * 6)} fill="none" stroke="rgba(255,240,150,0.6)" strokeWidth={10} />
    </svg>
  );
};

/** Gelombang panas di udara */
const HeatHaze: React.FC<{ top: number }> = ({ top }) => {
  const t = useT();
  return (
    <svg width={1000} height={200} style={{ position: "absolute", left: 40, top, opacity: 0.55 }}>
      {[0, 1, 2].map((i) => {
        let d = `M0 ${40 + i * 60}`;
        for (let x = 0; x <= 1000; x += 40) d += ` L${x} ${40 + i * 60 + Math.sin(x / 50 + t * 5 + i) * 12}`;
        return <path key={i} d={d} fill="none" stroke="#FFE9B0" strokeWidth={6} strokeLinecap="round" />;
      })}
    </svg>
  );
};

/** Halte angkot */
const BusStop: React.FC = () => (
  <svg width={420} height={520} viewBox="0 0 420 520" style={{ overflow: "visible" }}>
    <rect x={40} y={60} width={340} height={36} rx={12} fill="#2E8B57" {...S} />
    <rect x={60} y={96} width={18} height={400} fill="#5B6275" {...S} />
    <rect x={342} y={96} width={18} height={400} fill="#5B6275" {...S} />
    <rect x={120} y={0} width={180} height={64} rx={14} fill={C.cream} {...S} />
    <text x={210} y={44} textAnchor="middle" fontFamily="LilitaOne" fontSize={38} fill={C.ink}>
      HALTE
    </text>
    <rect x={90} y={380} width={240} height={24} rx={10} fill="#8B5E3C" {...S} />
  </svg>
);

/** Tiang bendera merah putih */
const Flagpole: React.FC = () => {
  const t = useT();
  const wave = Math.sin(t * 6) * 8;
  return (
    <svg width={300} height={720} viewBox="0 0 300 720" style={{ overflow: "visible" }}>
      <rect x={40} y={20} width={16} height={690} rx={8} fill="#C9CEDA" {...S} strokeWidth={5} />
      <circle cx={48} cy={18} r={14} fill={C.yellow} {...S} strokeWidth={5} />
      <path d={`M56 40 Q130 ${30 + wave} 220 40 L220 90 Q130 ${80 + wave} 56 90 Z`} fill="#E5252A" stroke={C.ink} strokeWidth={5} />
      <path d={`M56 90 Q130 ${80 + wave} 220 90 L220 140 Q130 ${130 + wave} 56 140 Z`} fill={C.white} stroke={C.ink} strokeWidth={5} />
      <rect x={10} y={690} width={76} height={26} rx={8} fill="#8B8F9C" {...S} strokeWidth={5} />
    </svg>
  );
};

/** Motor tampak samping */
const Motorbike: React.FC<{ w?: number }> = ({ w = 520 }) => (
  <svg width={w} height={w * 0.55} viewBox="0 0 520 286" style={{ overflow: "visible" }}>
    <circle cx={100} cy={220} r={62} fill={C.ink} />
    <circle cx={100} cy={220} r={26} fill="#9AA0B5" />
    <circle cx={420} cy={220} r={62} fill={C.ink} />
    <circle cx={420} cy={220} r={26} fill="#9AA0B5" />
    <path d="M100 220 L200 150 L360 150 L420 220" fill="none" stroke="#2A2140" strokeWidth={22} strokeLinecap="round" />
    <path d="M170 160 Q200 90 300 95 L380 120 Q400 150 360 165 L200 175 Z" fill={C.pink} {...S} />
    <rect x={190} y={100} width={130} height={30} rx={14} fill="#2A2140" {...S} />
    <path d="M380 120 L430 60 L470 60" fill="none" stroke="#2A2140" strokeWidth={14} strokeLinecap="round" />
    <path d="M40 190 L10 205" stroke="#5C6478" strokeWidth={16} strokeLinecap="round" />
  </svg>
);

/** Deretan mobil macet di belakang */
const TrafficRow: React.FC = () => (
  <svg width={1000} height={160} viewBox="0 0 1000 160" style={{ overflow: "visible" }}>
    {[0, 1, 2, 3].map((i) => {
      const x = i * 250;
      const col = ["#5B6275", "#3D7BFF", "#7C5CFF", "#2E8B57"][i];
      return (
        <g key={i}>
          <path d={`M${x + 10} 110 Q${x + 20} 70 ${x + 60} 64 L${x + 90} 30 L${x + 170} 30 L${x + 205} 64 Q${x + 235} 70 ${x + 235} 110 Z`} fill={col} stroke={C.ink} strokeWidth={5} />
          <circle cx={x + 60} cy={116} r={22} fill={C.ink} />
          <circle cx={x + 185} cy={116} r={22} fill={C.ink} />
          <circle cx={x + 225} cy={90} r={8} fill="#FF2E2E" />
        </g>
      );
    })}
  </svg>
);

/** Wajan berisi gorengan */
const Wok: React.FC<{ w?: number }> = ({ w = 460 }) => {
  const t = useT();
  return (
    <svg width={w} height={w * 0.72} viewBox="0 0 460 330" style={{ overflow: "visible" }}>
      {[0, 1, 2].map((i) => {
        const p = (t * 0.8 + i / 3) % 1;
        let d = `M${150 + i * 70} ${110 - p * 120}`;
        for (let j = 0; j < 3; j++) d += ` q14 -14 0 -28`;
        return <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={10} strokeLinecap="round" opacity={1 - p} />;
      })}
      <path d="M40 140 Q230 330 420 140 Z" fill="#3B3F4E" {...S} />
      <path d="M420 150 L455 150" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
      <path d="M5 150 L40 150" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
      {/* gorengan: tempe, bakwan, pisang goreng */}
      <ellipse cx={150} cy={150} rx={56} ry={26} fill="#D9902F" {...S} strokeWidth={5} />
      <rect x={210} y={112} width={100} height={46} rx={14} fill="#E3A947" {...S} strokeWidth={5} />
      <path d="M300 150 Q340 110 370 150 Q340 172 300 150 Z" fill="#C97A22" {...S} strokeWidth={5} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={110 + i * 45} cy={180 + Math.sin(t * 20 + i) * 4} r={6} fill="rgba(255,240,200,0.8)" />
      ))}
      <rect x={60} y={240} width={340} height={60} rx={16} fill="#2A2140" {...S} />
    </svg>
  );
};

/** Bingkai panel montase (luar ruangan, panas) */
const HotPanel: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 900, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: "linear-gradient(180deg, #FF9E3D 0%, #FFC861 55%, #E0A45A 100%)" }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 210, background: "#7A5C46", borderTop: `${OUTLINE}px solid ${C.ink}` }} />
    {children}
  </div>
);

/* ================================================================== adegan */
const Ep4Scenes: React.FC = () => {
  const t = useT();
  const cam = useShake([
    { t: 4.88, a: 12 },
    { t: 11.96, a: 26 },
    { t: 29.2, a: 20 },
    { t: 30.04, a: 14 },
    { t: 59.96, a: 14 },
  ]);
  return (
    <AbsoluteFill style={{ translate: cam }}>
      {/* 1a — HOOK: siang bolong nunggu angkot */}
      <Scene a={0} b={1.5} zoom={false}>
        <HotPanel>
          <div style={{ position: "absolute", right: 50, top: 40 }}>
            <BigSun size={240} />
          </div>
          <div style={{ position: "absolute", left: 470, top: 260 }}>
            <BusStop />
          </div>
        </HotPanel>
        <HeatHaze top={520} />
        <div style={{ position: "absolute", left: 120, top: 520 }}>
          <CookJo size={600} hat={false} shirt="#3D7BFF" expr="pain" sweat red={0.3} />
        </div>
        <Sticker at={0.08} y={290} bg={C.yellow} size={74}>
          SIANG BOLONG ☀️
        </Sticker>
      </Scene>

      {/* 1b — upacara di lapangan */}
      <Scene a={1.5} b={2.95} zoom={false}>
        <HotPanel>
          <div style={{ position: "absolute", left: 40, top: 40 }}>
            <BigSun size={220} />
          </div>
          <div style={{ position: "absolute", left: 640, top: 90 }}>
            <Flagpole />
          </div>
        </HotPanel>
        <HeatHaze top={540} />
        <div style={{ position: "absolute", left: 150, top: 520 }}>
          <CookJo size={600} hat={false} shirt={C.white} pants="#A3202F" expr="pain" sweat red={0.35} seed={1} />
        </div>
        <Sticker at={1.56} y={290} bg={C.cream} size={74}>
          UPACARA DI LAPANGAN 🇮🇩
        </Sticker>
      </Scene>

      {/* 1c — macet naik motor */}
      <Scene a={2.95} b={4.65} zoom={false}>
        <HotPanel>
          <div style={{ position: "absolute", right: 60, top: 30 }}>
            <BigSun size={220} />
          </div>
          <div style={{ position: "absolute", left: 0, top: 520, opacity: 0.9 }}>
            <TrafficRow />
          </div>
        </HotPanel>
        <HeatHaze top={600} />
        <div style={{ position: "absolute", left: 300, top: 620 }}>
          <CookJo size={460} hat={false} helmet shirt={C.orange} expr="pain" sweat red={0.4} seed={2} />
        </div>
        <div style={{ position: "absolute", left: 220, top: 860 }}>
          <Motorbike w={560} />
        </div>
        <Sticker at={3.0} y={290} bg={C.orange} size={74}>
          KEJEBAK MACET 🛵
        </Sticker>
      </Scene>

      {/* 2 — tiba-tiba pusing, mual, keringetan dingin */}
      <Scene a={4.65} b={8.55}>
        <div style={{ position: "absolute", left: 290, top: 340 }}>
          <CookJo size={700} hat={false} shirt="#3D7BFF" expr={t > 5.3 ? "dizzy" : "pain"} sweat red={interpolate(t, [4.7, 7], [0.3, 0.7], clamp)} />
        </div>
        <Pop at={5.33} x={50} y={430}>
          <Label size={58} bg="#B9A6FF">
            😵‍💫 PUSING
          </Label>
        </Pop>
        <Pop at={6.03} x={720} y={560}>
          <Label size={58} bg={C.lime}>
            🤢 MUAL
          </Label>
        </Pop>
        <Pop at={6.59} x={50} y={820}>
          <Label size={58} bg={C.cyan}>
            💦 KERINGAT DINGIN
          </Label>
        </Pop>
        <Sticker at={7.43} y={1050} bg={C.pink} color={C.white} size={70} rotate={-3}>
          JANGAN DIANGGEP SEPELE ⚠️
        </Sticker>
      </Scene>

      {/* 3 — ada makhluk halus (scanner) */}
      <Scene a={8.55} b={11.9}>
        <Room {...HOT_SKY} dark={interpolate(t, [8.6, 9.0], [0, 0.55], clamp)} />
        <div style={{ position: "absolute", left: 110, top: 620, opacity: 0.6 }}>
          <CookJo size={520} hat={false} shirt="#3D7BFF" expr="sleepy" sweat />
        </div>
        <Scanner at={9.3} dur={0.9} top={330} height={760}>
          <div style={{ position: "absolute", left: 450, top: 380 }}>
            <SiHalus size={440} variant="heat" />
          </div>
        </Scanner>
        <Sticker at={8.64} y={290} bg={C.bg1} color={C.lime} size={70}>
          ADA MAKHLUK HALUS 👻
        </Sticker>
      </Scene>

      {/* 4 — judul: tekanan panas */}
      <Scene a={11.9} b={13.6}>
        <div style={{ position: "absolute", left: 307, top: 400 }}>
          <Pop at={11.92}>
            <SiHalus size={560} variant="heat" mood="laugh" />
          </Pop>
        </div>
        <Sticker at={11.96} y={960} bg={C.orange} size={84} rotate={-5}>
          {"SI HALUS:\nTEKANAN PANAS"}
        </Sticker>
      </Scene>

      {/* 5 — badan kayak mesin */}
      <Scene a={13.6} b={18.15}>
        <Sticker at={13.66} y={290} bg={C.cream} size={72}>
          BADAN = MESIN ⚙️
        </Sticker>
        <div style={{ position: "absolute", left: 300, top: 470 }}>
          <CookJo size={600} hat={false} shirt="#3D7BFF" expr={t > 17.2 ? "dizzy" : "normal"} sweat={t > 16.0} red={interpolate(t, [15.1, 17.9], [0, 0.6], clamp)} />
        </div>
        <div style={{ position: "absolute", left: 820, top: 460 }}>
          <Thermo value={interpolate(t, [15.1, 17.9], [36.5, 39.3], { ...clamp, easing: easeInOut })} h={520} />
        </div>
        <Pop at={14.0} x={60} y={420}>
          <div style={{ fontSize: 120 }}>☀️</div>
        </Pop>
        <Pop at={14.1} x={60} y={560}>
          <Label size={38} bg={C.yellow}>PANAS LUAR</Label>
        </Pop>
        <HeatArrow from={[200, 640]} to={[360, 700]} at={14.2} />
        <Pop at={14.6} x={60} y={880}>
          <div style={{ fontSize: 110 }}>💪</div>
        </Pop>
        <Pop at={14.7} x={40} y={1010}>
          <Label size={38} bg={C.orange}>PANAS DARI BADAN</Label>
        </Pop>
        <HeatArrow from={[200, 950]} to={[380, 880]} at={14.8} />
        <Pop at={15.65} x={440} y={380}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 90, position: "relative" }}>
              💨
              <svg width={110} height={110} style={{ position: "absolute", left: -6, top: -4 }}>
                <path d="M15 15 L95 95 M95 15 L15 95" stroke={C.pink} strokeWidth={16} strokeLinecap="round" />
              </svg>
            </div>
            <Label size={34} bg={C.pink} color={C.white}>
              NGGAK BISA DIBUANG
            </Label>
          </div>
        </Pop>
        <Sticker at={16.56} y={1090} bg={C.pink} color={C.white} size={64}>
          SUHU TUBUH NAIK ⬆️🌡️
        </Sticker>
      </Scene>

      {/* 6 — gejala awal + masih bisa ditolong */}
      <Scene a={18.15} b={25.5}>
        {t < 21.3 ? (
          <>
            <Sticker at={18.2} y={290} bg={C.cream} size={64}>
              GEJALA AWAL 🥵
            </Sticker>
            <div style={{ position: "absolute", left: 120, top: 400 }}>
              <Badge icon="💦" label="KERINGETAN" at={18.62} color={C.cyan} />
            </div>
            <div style={{ position: "absolute", left: 120, top: 600 }}>
              <Badge icon="😵‍💫" label="PUSING" at={19.57} color="#B9A6FF" />
            </div>
            <div style={{ position: "absolute", left: 120, top: 800 }}>
              <Badge icon="🤢" label="MUAL" at={20.19} color={C.lime} />
            </div>
            <div style={{ position: "absolute", left: 120, top: 1000 }}>
              <Badge icon="🫠" label="LEMES" at={20.82} color={C.orange} />
            </div>
          </>
        ) : (
          <>
            <Sticker at={21.36} y={290} bg={C.lime} size={74}>
              MASIH BISA DITOLONG ✅
            </Sticker>
            <div style={{ position: "absolute", top: 440, left: 80 }}>
              <CheckRow icon="🌳" label="Neduh di tempat adem" at={22.79} />
            </div>
            <div style={{ position: "absolute", top: 600, left: 80 }}>
              <CheckRow icon="💧" label="Minum" at={24.04} />
            </div>
            <div style={{ position: "absolute", top: 760, left: 80 }}>
              <CheckRow icon="🧊" label="Dinginin badan" at={24.6} />
            </div>
            <Pop at={21.6} x={700} y={900} from="bottom">
              <CookJo size={330} hat={false} shirt="#3D7BFF" expr="happy" seed={2} />
            </Pop>
          </>
        )}
      </Scene>

      {/* 7 — heat stroke: darurat */}
      <Scene a={25.5} b={35.2}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,40,40,0.35), rgba(255,40,40,0) 70%)", opacity: 0.6 + 0.4 * Math.sin(t * 8) }} />
        {t < 28.9 ? (
          <>
            <Sticker at={25.57} y={290} bg={C.pink} color={C.white} size={70}>
              TAPI KALAU UDAH… ⚠️
            </Sticker>
            <div style={{ position: "absolute", left: 120, top: 430 }}>
              <Badge icon="😵" label="BINGUNG" at={26.22} color={C.pink} />
            </div>
            <div style={{ position: "absolute", left: 120, top: 640 }}>
              <Badge icon="🗯️" label="NGELANTUR" at={27.09} color={C.orange} />
            </div>
            <div style={{ position: "absolute", left: 120, top: 850 }}>
              <Badge icon="🫥" label="PINGSAN" at={28.1} color="#B9A6FF" />
            </div>
          </>
        ) : t < 33.0 ? (
          <>
            <Pop at={28.92} x={0} y={330} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
              <div style={{ border: `12px solid ${C.pink}`, borderRadius: 40, padding: "10px 40px 18px", rotate: "-6deg", background: "rgba(255,79,139,0.15)" }}>
                <BigText size={150} color={C.pink}>
                  HEAT STROKE
                </BigText>
              </div>
            </Pop>
            <Sticker at={30.04} y={570} bg="#FF2E2E" color={C.white} size={84} rotate={4}>
              DARURAT 🚨
            </Sticker>
            <div style={{ position: "absolute", left: 160, top: 720 }}>
              <Pop at={30.6}>
                <Thermo value={interpolate(t, [30.8, 32.2], [38, 41], { ...clamp, easing: easeOut })} h={430} />
              </Pop>
            </div>
            <Pop at={31.71} x={380} y={800}>
              <BigText size={170} color="#FF4A3D">
                40°C+
              </BigText>
            </Pop>
          </>
        ) : (
          <>
            <Sticker at={33.01} y={290} bg={C.lime} size={70}>
              LANGSUNG LAKUIN INI 👇
            </Sticker>
            <Pop at={33.43} x={70} y={440}>
              <InfoCard title="🧊 DINGININ" value="BADANNYA" sub="kompres, siram air" color={C.cyan} valueSize={74} />
            </Pop>
            <Pop at={34.4} x={570} y={440}>
              <InfoCard title="📞 PANGGIL" value="BANTUAN" sub="ambulans / medis" color={C.pink} valueSize={74} />
            </Pop>
          </>
        )}
      </Scene>

      {/* 8a — di tempat kerja lebih rawan */}
      <Scene a={35.2} b={39.85}>
        <Room {...KITCHEN} />
        <Pop at={35.6} x={220} y={900}>
          <Stove w={200} />
        </Pop>
        <Sticker at={35.27} y={290} bg={C.cream} size={68}>
          NAH, DI TEMPAT KERJA… 🏭
        </Sticker>
        <Pop at={35.45} x={60} y={520}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <CookJo size={420} expr="pain" sweat red={0.3} />
            <Label size={40} bg={C.orange}>
              DAPUR 🍳
            </Label>
          </div>
        </Pop>
        <Pop at={37.32} x={400} y={470}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ width: 240, height: 240, borderRadius: "50%", background: "#5B6275", border: `${OUTLINE}px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 140 }}>🏭</div>
            <Label size={40} bg={C.cream}>
              PABRIK
            </Label>
          </div>
        </Pop>
        <Pop at={37.91} x={720} y={420}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Worker size={420} expr="pain" helmet vest seed={4} />
            <Label size={40} bg={C.yellow}>
              PROYEK 🏗️
            </Label>
          </div>
        </Pop>
        <Sticker at={38.71} y={1040} bg={C.pink} color={C.white} size={70} rotate={-3}>
          LEBIH RAWAN LAGI ⚠️
        </Sticker>
      </Scene>

      {/* 8b — >70% kematian di minggu pertama kerja */}
      <Scene a={39.85} b={46.25}>
        <Pop at={39.95} x={0} y={380} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
          <BigText size={250}>
            {">"}
            {Math.round(interpolate(t, [40.4, 41.2], [0, 70], { ...clamp, easing: easeOut }))}%
          </BigText>
        </Pop>
        <Pop at={41.1} x={0} y={670} style={{ width: 1080, textAlign: "center" }}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 54, color: C.cream, lineHeight: 1.15 }}>
            kematian akibat panas
            <br />
            di tempat kerja terjadi di…
          </div>
        </Pop>
        <Sticker at={43.82} y={850} bg={C.orange} color={C.ink} size={80} rotate={-4}>
          MINGGU PERTAMA 📅
        </Sticker>
        <Pop at={44.1} x={0} y={1040} style={{ width: 1080, textAlign: "center" }}>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 34, color: C.cream, opacity: 0.8 }}>Data OSHA (AS) · badan belum adaptasi</div>
        </Pop>
        <Pop at={44.97} x={60} y={860}>
          <CookJo size={300} expr="dizzy" seed={1} />
        </Pop>
      </Scene>

      {/* 9 — minum tiap 15–20 menit, haus = alarm telat */}
      <Scene a={46.25} b={52.25}>
        <Sticker at={46.34} y={290} bg={C.cream} size={70}>
          JADI, BIAR AMAN 💧
        </Sticker>
        <Pop at={46.97} x={110} y={430}>
          <Glass size={280} />
        </Pop>
        <Pop at={47.24} x={430} y={470}>
          <div>
            <BigText size={110} color={C.cyan}>
              1 GELAS
            </BigText>
            <div style={{ marginTop: 18 }}>
              <Label size={46} bg={C.cyan}>
                tiap 15–20 menit ⏱️
              </Label>
            </div>
          </div>
        </Pop>
        {t > 49.5 && (
          <>
            <Pop at={49.54} x={140} y={830}>
              <AlarmClock size={230} />
            </Pop>
            <Pop at={50.81} x={420} y={880}>
              <div style={{ rotate: "-3deg" }}>
                <Label size={60} bg={C.yellow}>
                  HAUS = ALARM TELAT
                </Label>
              </div>
            </Pop>
          </>
        )}
      </Scene>

      {/* 10 — cek warna pipis */}
      <Scene a={52.25} b={56.1}>
        <Sticker at={52.33} y={290} bg={C.yellow} size={70}>
          CEK WARNA PIPIS 🚽
        </Sticker>
        <div style={{ position: "absolute", left: 90, top: 440, width: 900, display: "flex", gap: 14 }}>
          {URINE.map((c, i) => {
            const at = 52.6 + i * 0.12;
            const s = interpolate(t, [at, at + 0.25], [0, 1], { ...clamp, easing: easeOut });
            return (
              <div
                key={c}
                style={{
                  flex: 1,
                  height: 340,
                  borderRadius: 30,
                  background: c,
                  border: `${OUTLINE}px solid ${C.ink}`,
                  scale: `1 ${s}`,
                  transformOrigin: "50% 100%",
                  boxShadow: i >= 4 && t > 54.1 ? `0 0 0 10px ${C.pink}` : "none",
                }}
              />
            );
          })}
        </div>
        <Pop at={53.0} x={120} y={810}>
          <Label size={44} bg={C.lime}>
            ✅ kuning pucat = cukup
          </Label>
        </Pop>
        <Pop at={54.14} x={560} y={810}>
          <Label size={44} bg={C.pink} color={C.white}>
            ❌ kayak teh 🍵
          </Label>
        </Pop>
        <Sticker at={55.25} y={970} bg={C.orange} size={70} rotate={-3}>
          = KURANG MINUM!
        </Sticker>
      </Scene>

      {/* 11 — punchline: Indonesia emang panas… */}
      <Scene a={56.1} b={60.81}>
        <HotPanel>
          <div style={{ position: "absolute", right: 50, top: 40 }}>
            <BigSun size={230} />
          </div>
        </HotPanel>
        <Sticker at={56.17} out={58.4} y={290} bg={C.yellow} size={74}>
          INDONESIA EMANG PANAS ☀️
        </Sticker>
        <div style={{ position: "absolute", left: 80, top: 520 }}>
          <CookJo size={600} hat={false} shirt="#3D7BFF" expr={t < 57.6 ? "pain" : t < 59.9 ? "smirk" : "happy"} pose={t > 57.6 && t < 59.9 ? "shrug" : "idle"} sweat red={0.2} />
        </div>
        <Pop at={57.62} out={58.4} x={480} y={460}>
          <Bubble w={420} tail="left" size={58}>
            “Nggak apa-apa.” 👍
          </Bubble>
        </Pop>
        <Pop at={58.5} x={520} y={760} from="right">
          <Wok w={460} />
        </Pop>
        <Sticker at={59.16} y={290} bg={C.orange} size={56} rotate={-3}>
          {"YANG MATENG GORENGANNYA,\nBUKAN KAMU 🍤"}
        </Sticker>
        <Pop at={60.0} x={780} y={440}>
          <SiHalus size={220} variant="heat" mood="laugh" />
        </Pop>
      </Scene>
    </AbsoluteFill>
  );
};

export const Ep4: React.FC = () => (
  <Episode ep={4} accent={C.orange} tint="#4A2412" words={words} endStart={EP4.endStart} revealAt={EP4.revealAt} flashes={[11.96, 29.2]}>
    <Ep4Scenes />
  </Episode>
);
