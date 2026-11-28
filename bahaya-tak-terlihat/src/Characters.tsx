import React from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { C, OUTLINE } from "./brand";

/* ================================================================ BANG JO
 * Tokoh utama: pekerja biasa yang sering apes. Desain orisinal:
 * kepala bulat besar, mata oval, pipi merah, garis tepi tebal.
 */
export type Expr = "normal" | "sleepy" | "shocked" | "happy" | "dizzy" | "pain" | "smirk";
export type Pose = "idle" | "wave" | "point" | "coverEars" | "holdTool" | "shrug";

export const Worker: React.FC<{
  size?: number;
  shirt?: string;
  pants?: string;
  expr?: Expr;
  pose?: Pose;
  helmet?: boolean;
  vest?: boolean;
  tie?: boolean;
  earplug?: boolean;
  shake?: number;
  hair?: string;
  /** warna hijab (tokoh Ibu); kosong = rambut biasa */
  hijab?: string;
  skin?: string;
  seed?: number;
  flip?: boolean;
  style?: React.CSSProperties;
}> = ({
  size = 600,
  shirt = "#3D7BFF",
  pants = "#2A2140",
  expr = "normal",
  pose = "idle",
  helmet = false,
  vest = false,
  tie = false,
  earplug = false,
  shake = 0,
  hair = "#1E1428",
  hijab,
  skin = C.skin,
  seed = 0,
  flip = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + seed * 1.7;
  const bob = Math.sin(t * Math.PI * 1.8) * 5;
  const blinkPhase = (t + seed) % 3.4;
  const blink = blinkPhase < 0.12 ? 1 : 0;
  const jx = shake ? (random(`jx${frame}-${seed}`) - 0.5) * shake : 0;
  const jy = shake ? (random(`jy${frame}-${seed}`) - 0.5) * shake : 0;
  const s = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  const arms: Record<Pose, [string, string, [number, number], [number, number]]> = {
    idle: ["M105 345 Q62 420 82 482", "M295 345 Q338 420 318 482", [82, 482], [318, 482]],
    wave: ["M105 345 Q62 420 82 482", "M295 345 Q365 285 352 205", [82, 482], [352, 205]],
    point: ["M105 345 Q62 420 82 482", "M295 350 Q365 352 405 328", [82, 482], [405, 328]],
    coverEars: ["M105 345 Q35 290 66 214", "M295 345 Q365 290 334 214", [66, 214], [334, 214]],
    holdTool: ["M105 345 Q118 430 172 452", "M295 345 Q282 430 228 452", [172, 452], [228, 452]],
    shrug: ["M105 345 Q40 360 52 298", "M295 345 Q360 360 348 298", [52, 298], [348, 298]],
  };
  const [aL, aR, hL, hR] = arms[pose];

  const eye = (cx: number, side: number) => {
    const cy = 192;
    switch (expr) {
      case "happy":
        return <path key={cx} d={`M${cx - 26} ${cy + 8} Q${cx} ${cy - 26} ${cx + 26} ${cy + 8}`} fill="none" {...s} />;
      case "dizzy":
        return (
          <path
            key={cx}
            d={`M${cx} ${cy} m-4 0 a4 4 0 1 1 8 0 a9 9 0 1 1 -18 0 a14 14 0 1 1 28 0 a19 19 0 1 1 -38 0`}
            fill="none"
            {...s}
            strokeWidth={5}
            style={{ rotate: `${frame * 9 * side}deg`, transformOrigin: `${cx}px ${cy}px` }}
          />
        );
      case "pain":
        return <path key={cx} d={`M${cx - 22 * side} ${cy - 18} L${cx + 18 * side} ${cy} L${cx - 22 * side} ${cy + 18}`} fill="none" {...s} />;
      default: {
        const big = expr === "shocked";
        const rx = big ? 36 : 30;
        const ry = big ? 44 : 36;
        const lid = blink ? 1 : expr === "sleepy" ? 0.62 : expr === "smirk" ? 0.35 : 0;
        return (
          <g key={cx}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.white} {...s} />
            <circle cx={cx + (expr === "smirk" ? 8 : 4)} cy={cy + (expr === "sleepy" ? 14 : 4)} r={big ? 8 : 14} fill={C.ink} />
            <circle cx={cx + 9} cy={cy - 4} r={big ? 3 : 5} fill={C.white} />
            {lid > 0 && (
              <path
                d={`M${cx - rx - 4} ${cy} A${rx + 4} ${ry + 4} 0 0 1 ${cx + rx + 4} ${cy} L${cx + rx + 4} ${cy - ry - 6 + (2 * ry + 12) * lid} L${cx - rx - 4} ${cy - ry - 6 + (2 * ry + 12) * lid}Z`}
                fill={skin}
                stroke="none"
              />
            )}
            {lid > 0 && (
              <line
                x1={cx - rx}
                x2={cx + rx}
                y1={cy - ry + 2 * ry * lid}
                y2={cy - ry + 2 * ry * lid}
                {...s}
              />
            )}
          </g>
        );
      }
    }
  };

  const mouth = () => {
    const y = 268;
    switch (expr) {
      case "happy":
        return <path d={`M160 ${y - 6} Q200 ${y + 48} 240 ${y - 6} Z`} fill="#7A1F3A" {...s} />;
      case "shocked":
        return <ellipse cx={200} cy={y + 10} rx={20} ry={26} fill="#7A1F3A" {...s} />;
      case "sleepy":
        return <ellipse cx={205} cy={y + 6} rx={12} ry={9} fill="#7A1F3A" {...s} />;
      case "dizzy":
      case "pain":
        return <path d={`M160 ${y + 8} q10 -12 20 0 t20 0 t20 0 t20 0`} fill="none" {...s} />;
      case "smirk":
        return <path d={`M170 ${y + 4} Q215 ${y + 22} 240 ${y - 8}`} fill="none" {...s} />;
      default:
        return <path d={`M170 ${y} Q200 ${y + 24} 230 ${y}`} fill="none" {...s} />;
    }
  };

  return (
    <svg
      width={size * (400 / 620)}
      height={size}
      viewBox="-30 -20 460 660"
      style={{ overflow: "visible", translate: `${jx}px ${bob + jy}px`, scale: flip ? "-1 1" : undefined, ...style }}
    >
      {/* bayangan */}
      <ellipse cx={200} cy={612} rx={130} ry={18} fill="rgba(0,0,0,0.28)" />
      {/* kaki */}
      <rect x={135} y={500} width={50} height={100} rx={20} fill={pants} {...s} />
      <rect x={215} y={500} width={50} height={100} rx={20} fill={pants} {...s} />
      <ellipse cx={155} cy={602} rx={36} ry={16} fill={C.ink} />
      <ellipse cx={245} cy={602} rx={36} ry={16} fill={C.ink} />
      {/* lengan belakang */}
      <path d={aL} fill="none" stroke={C.ink} strokeWidth={46} strokeLinecap="round" />
      <path d={aL} fill="none" stroke={shirt} strokeWidth={32} strokeLinecap="round" />
      {/* badan */}
      <rect x={95} y={310} width={210} height={215} rx={70} fill={shirt} {...s} />
      {vest && (
        <g>
          <path d="M112 330 Q150 318 170 330 L170 515 L112 505 Z" fill={C.orange} />
          <path d="M288 330 Q250 318 230 330 L230 515 L288 505 Z" fill={C.orange} />
          <rect x={112} y={420} width={58} height={16} fill="#E8EEF5" />
          <rect x={230} y={420} width={58} height={16} fill="#E8EEF5" />
        </g>
      )}
      {tie && <path d="M200 322 L186 350 L200 440 L214 350 Z" fill={C.pink} {...s} strokeWidth={5} />}
      {/* lengan depan */}
      <path d={aR} fill="none" stroke={C.ink} strokeWidth={46} strokeLinecap="round" />
      <path d={aR} fill="none" stroke={shirt} strokeWidth={32} strokeLinecap="round" />
      <circle cx={hL[0]} cy={hL[1]} r={24} fill={skin} {...s} />
      <circle cx={hR[0]} cy={hR[1]} r={24} fill={skin} {...s} />
      {/* kepala */}
      {hijab && <path d="M48 200 Q42 36 200 30 Q358 36 352 200 Q358 334 292 366 L108 366 Q42 334 48 200 Z" fill={hijab} {...s} />}
      {!hijab && <circle cx={65} cy={205} r={26} fill={skin} {...s} />}
      {!hijab && <circle cx={335} cy={205} r={26} fill={skin} {...s} />}
      {earplug && (
        <>
          <circle cx={65} cy={205} r={13} fill={C.orange} {...s} strokeWidth={4} />
          <circle cx={335} cy={205} r={13} fill={C.orange} {...s} strokeWidth={4} />
        </>
      )}
      {hijab ? <ellipse cx={200} cy={206} rx={116} ry={128} fill={skin} {...s} /> : <circle cx={200} cy={190} r={138} fill={skin} {...s} />}
      {hijab && !helmet && <path d="M82 178 Q86 72 200 66 Q314 72 318 178 Q292 120 200 118 Q108 120 82 178 Z" fill={hijab} {...s} />}
      {!helmet && !hijab && (
        <path d="M66 180 Q68 46 200 46 Q332 46 334 180 Q300 112 230 118 Q215 92 190 120 Q110 112 66 180Z" fill={hair} {...s} />
      )}
      {helmet && (
        <g>
          <path d="M66 150 Q66 34 200 34 Q334 34 334 150 Z" fill={C.yellow} {...s} />
          <rect x={44} y={142} width={312} height={26} rx={13} fill={C.yellow} {...s} />
          <path d="M200 40 L200 140" stroke="#E0B21F" strokeWidth={16} />
        </g>
      )}
      <ellipse cx={118} cy={248} rx={22} ry={13} fill={C.pink} opacity={0.55} />
      <ellipse cx={282} cy={248} rx={22} ry={13} fill={C.pink} opacity={0.55} />
      {eye(150, -1)}
      {eye(250, 1)}
      <path d="M195 222 Q206 236 194 242" fill="none" {...s} strokeWidth={5} />
      {mouth()}
    </svg>
  );
};

/* ================================================================ SI HALUS
 * Maskot bahaya tak terlihat — "makhluk halus" versi K3.
 * Varian: co2 (kabut ngantuk), vibe (getaran), noise (bising).
 * EP16–18: salad (kuman di makanan segar), finish (lari FOMO, jantung), powerbank (baterai menggembung).
 */
export type HalusVariant = "co2" | "vibe" | "noise" | "heat" | "dust" | "gas" | "stress" | "burnout" | "doom" | "volt" | "load" | "slip" | "lpg" | "bottle" | "steam" | "salad" | "finish" | "powerbank";

export const SiHalus: React.FC<{
  size?: number;
  variant: HalusVariant;
  mood?: "grin" | "laugh" | "scared" | "busted";
  opacity?: number;
  style?: React.CSSProperties;
}> = ({ size = 420, variant, mood = "grin", opacity = 1, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const PAL: Record<HalusVariant, [string, string]> = {
    co2: ["#B9A6FF", "#8E76F0"],
    vibe: [C.cyan, "#1FB6D6"],
    noise: [C.pink, "#D93370"],
    heat: [C.orange, "#E0601F"],
    dust: ["#E3D3B0", "#B89E6E"],
    gas: ["#8A93A6", "#5C6478"],
    stress: ["#FF6B6B", "#D63C44"],
    burnout: ["#A89A90", "#7A6C63"],
    doom: ["#6C8CFF", "#3F5FE0"],
    volt: ["#FFE14D", "#F2B705"],
    load: ["#C9B6E8", "#9B83C9"],
    slip: ["#9BE8F7", "#4FC3E0"],
    lpg: ["#FF9E6B", "#E8663D"],
    bottle: ["#D7F0E8", "#9CCFC0"],
    steam: ["#FF8FA3", "#E0566F"],
    salad: ["#5FC25A", "#2E8B3E"],
    finish: ["#FF6A45", "#D9381F"],
    powerbank: ["#FFA62B", "#DB6414"],
  };
  const [col, col2] = PAL[variant];
  const s = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  /** kuman kecil lucu (varian salad) */
  const germ = (key: string, x: number, y: number, r: number, c: string, rot: number) => (
    <g key={key} transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const a = (k / 6) * Math.PI * 2;
        return <line key={k} x1={Math.cos(a) * r} y1={Math.sin(a) * r} x2={Math.cos(a) * (r + 7)} y2={Math.sin(a) * (r + 7)} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />;
      })}
      <circle r={r} fill={c} stroke={C.ink} strokeWidth={4} />
      <circle cx={-r * 0.36} cy={-r * 0.12} r={2.8} fill={C.ink} />
      <circle cx={r * 0.36} cy={-r * 0.12} r={2.8} fill={C.ink} />
      <path d={`M${-r * 0.3} ${r * 0.3} Q0 ${r * 0.62} ${r * 0.3} ${r * 0.3}`} fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
  const float = Math.sin(t * Math.PI * 1.2) * 12;
  const jit = variant === "vibe" ? (random(`hj${frame}`) - 0.5) * 10 : variant === "stress" ? (random(`hs${frame}`) - 0.5) * 4 : 0;

  // badan hantu dengan ujung bawah bergelombang
  const bumps = 5;
  let d = "M40 175 Q40 30 150 30 Q260 30 260 175 L260 290";
  for (let i = 0; i < bumps; i++) {
    const x0 = 260 - (220 / bumps) * i;
    const x1 = 260 - (220 / bumps) * (i + 1);
    const amp = 26 + Math.sin(t * 6 + i) * 8;
    d += ` Q${(x0 + x1) / 2} ${290 + (i % 2 ? -amp : amp)} ${x1} 290`;
  }
  d += " Z";

  const shout = variant === "noise" && mood !== "scared" && mood !== "busted";
  return (
    <svg
      width={size * (300 / 360)}
      height={size}
      viewBox="-40 -40 380 400"
      style={{ overflow: "visible", opacity, translate: `${jit}px ${float}px`, ...style }}
    >
      {variant === "vibe" &&
        [-1, 1].map((side) => (
          <path
            key={side}
            d={side < 0 ? "M10 120 l-20 15 l20 15 l-20 15 l20 15" : "M290 120 l20 15 l-20 15 l20 15 l-20 15"}
            fill="none"
            {...s}
            stroke={C.cyan}
            strokeWidth={8}
            opacity={0.6 + 0.4 * Math.sin(t * 30)}
          />
        ))}
      {variant === "noise" &&
        [0, 1, 2].map((i) => {
          const p = (t * 1.6 + i / 3) % 1;
          return (
            <path
              key={i}
              d={`M${270 + p * 60} ${130 - p * 40} Q${300 + p * 90} 190 ${270 + p * 60} ${250 + p * 40}`}
              fill="none"
              stroke={C.pink}
              strokeWidth={10}
              strokeLinecap="round"
              opacity={1 - p}
            />
          );
        })}
      {variant === "co2" &&
        [0, 1, 2, 3].map((i) => {
          const p = (t * 0.35 + i / 4) % 1;
          return (
            <circle
              key={i}
              cx={40 + i * 75 + Math.sin(t * 2 + i) * 10}
              cy={40 - p * 120}
              r={14 + p * 18}
              fill="#D9CCFF"
              opacity={0.7 * (1 - p)}
            />
          );
        })}
      {variant === "heat" &&
        [0, 1, 2].map((i) => {
          const p = (t * 0.9 + i / 3) % 1;
          let w = `M${70 + i * 80} ${10 - p * 90}`;
          for (let k = 1; k <= 6; k++) w += ` q8 -10 0 -20`;
          return <path key={i} d={w} fill="none" stroke={C.yellow} strokeWidth={9} strokeLinecap="round" opacity={0.9 * Math.sin(p * Math.PI)} />;
        })}
      {variant === "dust" &&
        new Array(14).fill(0).map((_, i) => {
          const a = (i / 14) * Math.PI * 2 + t * 0.8;
          const r = 175 + 25 * Math.sin(t * 3 + i);
          return <circle key={i} cx={150 + Math.cos(a) * r} cy={170 + Math.sin(a) * r * 0.9} r={4 + (i % 3) * 3} fill="#E3D3B0" opacity={0.75} />;
        })}
      {variant === "gas" &&
        [0, 1, 2, 3].map((i) => {
          const p = (t * 0.4 + i / 4) % 1;
          return <circle key={i} cx={20 + i * 85 + Math.sin(t * 1.5 + i) * 14} cy={300 - p * 360} r={22 + p * 30} fill="#5C6478" opacity={0.45 * Math.sin(p * Math.PI)} />;
        })}
      {variant === "stress" &&
        [0, 1, 2].map((i) => {
          const on = Math.sin(t * 9 + i * 2.1) > 0.2;
          const x = [20, 260, 140][i];
          const y = [40, 50, -30][i];
          return on ? <path key={i} d={`M${x} ${y} l-18 34 l16 0 l-14 34 l36 -44 l-17 0 l15 -24 Z`} fill={C.yellow} {...s} strokeWidth={5} /> : null;
        })}
      {variant === "burnout" &&
        [0, 1, 2].map((i) => {
          const p = (t * 0.5 + i / 3) % 1;
          return <circle key={i} cx={150 + Math.sin(t * 2 + i * 2) * 18} cy={0 - p * 120} r={12 + p * 22} fill="#B9B0AA" opacity={0.55 * Math.sin(p * Math.PI)} />;
        })}
      {variant === "doom" &&
        [0, 1, 2, 3].map((i) => {
          const p = (t * 0.8 + i / 4) % 1;
          return <path key={i} d={`M${i % 2 ? 290 : 0} ${40 + p * 220} l14 18 l14 -18`} fill="none" stroke="#9FB4FF" strokeWidth={8} strokeLinecap="round" opacity={Math.sin(p * Math.PI)} />;
        })}
      {variant === "lpg" &&
        [0, 1, 2].map((i) => {
          const p = (t * 0.7 + i / 3) % 1;
          return <path key={i} d={`M${60 + i * 90} ${60 - p * 110} q12 -14 0 -28 q-12 -14 0 -28`} fill="none" stroke="#C9A227" strokeWidth={7} strokeLinecap="round" opacity={0.8 * Math.sin(p * Math.PI)} />;
        })}
      {variant === "steam" &&
        [0, 1, 2].map((i) => {
          const p = (t * 0.6 + i / 3) % 1;
          return <path key={i} d={`M${80 + i * 70} ${40 - p * 120} q-16 -18 0 -36 q16 -18 0 -36`} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.85 * Math.sin(p * Math.PI)} />;
        })}
      {variant === "powerbank" &&
        [0, 1, 2].map((i) => {
          const p = (t * 0.9 + i / 3) % 1;
          return <path key={i} d={`M${85 + i * 65} ${22 - p * 110} q14 -14 0 -28 q-14 -14 0 -28`} fill="none" stroke="#FF5A2E" strokeWidth={8} strokeLinecap="round" opacity={0.9 * Math.sin((0.15 + p * 0.85) * Math.PI)} />;
        })}
      {variant === "finish" &&
        [-1, 1].map((side) => {
          const w = 8 * Math.sin(t * 5 + side);
          const dd = side < 0 ? `M62 196 Q12 ${186 + w} -34 ${232 + w}` : `M238 196 Q288 ${186 - w} 334 ${232 - w}`;
          return (
            <g key={side}>
              <path d={dd} fill="none" stroke={C.ink} strokeWidth={30} strokeLinecap="round" />
              <path d={dd} fill="none" stroke="#FFFFFF" strokeWidth={18} strokeLinecap="round" />
              <path d={dd} fill="none" stroke="#E8323C" strokeWidth={18} strokeDasharray="14 14" />
            </g>
          );
        })}
      {variant === "slip" && <ellipse cx={150} cy={318} rx={150 + 8 * Math.sin(t * 3)} ry={26} fill="#4FC3E0" opacity={0.45} />}
      {variant === "volt" && (
        <g>
          <path d={`M250 250 Q320 ${280 + 10 * Math.sin(t * 4)} 330 340`} fill="none" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
          <path d={`M250 250 Q320 ${280 + 10 * Math.sin(t * 4)} 330 340`} fill="none" stroke="#3A3A44" strokeWidth={6} strokeLinecap="round" />
          <rect x={312} y={336} width={38} height={30} rx={6} fill="#F4F4F6" {...s} strokeWidth={5} />
          <path d="M322 366 L322 382 M340 366 L340 382" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        </g>
      )}
      <path d={d} fill={col} {...s} opacity={variant === "slip" ? 0.88 : 1} />
      {variant === "doom" && <path d={d} fill="url(#doomGlow)" stroke="none" />}
      <path d="M70 120 Q80 60 140 52" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={14} strokeLinecap="round" />
      {variant === "heat" && (
        <path d="M95 52 Q100 10 125 30 Q130 -10 150 12 Q172 -10 176 30 Q200 10 205 52" fill={C.yellow} {...s} />
      )}
      {variant === "doom" && (
        <defs>
          <radialGradient id="doomGlow" cx="0.5" cy="0.75" r="0.6">
            <stop offset="0" stopColor="#E8F0FF" stopOpacity={0.55 + 0.15 * Math.sin(t * 5)} />
            <stop offset="1" stopColor="#E8F0FF" stopOpacity={0} />
          </radialGradient>
        </defs>
      )}
      {variant === "stress" && (
        <g transform={`translate(205 50) scale(${1 + 0.12 * Math.abs(Math.sin(t * 6))})`}>
          <path d="M-22 -6 Q-8 -8 -6 -22 M6 -22 Q8 -8 22 -6 M22 6 Q8 8 6 22 M-6 22 Q-8 8 -22 6" fill="none" stroke="#B0182A" strokeWidth={8} strokeLinecap="round" />
        </g>
      )}
      {variant === "volt" && (
        <path d={`M80 52 L100 ${-4 - 6 * Math.abs(Math.sin(t * 9))} L120 40 L140 ${-14 - 6 * Math.abs(Math.sin(t * 11))} L160 38 L182 ${-6 - 6 * Math.abs(Math.sin(t * 8))} L200 44 L220 ${4 - 6 * Math.abs(Math.sin(t * 10))} L226 56`} fill="#FFE14D" {...s} />
      )}
      {variant === "lpg" && (
        <g>
          <rect x={112} y={-8} width={76} height={44} rx={10} fill="#3A3F4B" {...s} strokeWidth={5} />
          <circle cx={150} cy={14} r={11} fill="#FF4F4F" {...s} strokeWidth={4} />
          <path d={`M188 14 Q230 ${0 + 6 * Math.sin(t * 5)} 262 24`} fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
        </g>
      )}
      {variant === "bottle" && (
        <g>
          <rect x={126} y={-30} width={48} height={40} rx={8} fill="#8FD0F0" {...s} strokeWidth={5} />
          <rect x={120} y={-48} width={60} height={22} rx={6} fill="#3F8FD6" {...s} strokeWidth={5} />
          <rect x={92} y={250} width={116} height={38} rx={8} fill="#FFFFFF" {...s} strokeWidth={4} />
          <text x={150} y={278} textAnchor="middle" fontFamily="LilitaOne" fontSize={26} fill="#E0566F">AIR?</text>
        </g>
      )}
      {variant === "salad" && (
        <g transform={`rotate(${4 * Math.sin(t * 2)} 150 30)`}>
          <path d="M94 0 Q80 -38 116 -34 Q122 -64 150 -46 Q172 -68 186 -36 Q222 -42 208 0 Z" fill="#9BE36A" {...s} strokeWidth={5} />
          <path d="M120 -4 Q116 -26 132 -30 M182 -4 Q186 -24 170 -32" fill="none" stroke="#3E9A3A" strokeWidth={5} strokeLinecap="round" />
          <circle cx={126} cy={-14} r={13} fill="#FF5A4F" {...s} strokeWidth={4} />
          <circle cx={180} cy={-16} r={12} fill="#FF5A4F" {...s} strokeWidth={4} />
          <ellipse cx={153} cy={-8} rx={15} ry={10} fill="#E8F5C8" {...s} strokeWidth={4} />
          <path d="M82 -4 L218 -4 Q214 48 150 50 Q86 48 82 -4 Z" fill="#FFFFFF" {...s} strokeWidth={5} />
          <path d="M92 14 L208 14" stroke={col2} strokeWidth={8} />
        </g>
      )}
      {variant === "finish" && (
        <g>
          <path d="M58 -4 L112 -4 L126 -34 L142 26 L158 -26 L170 -4 L214 -4" fill="none" stroke={C.ink} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M58 -4 L112 -4 L126 -34 L142 26 L158 -26 L170 -4 L214 -4" fill="none" stroke="#FF3B5C" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          <g transform={`translate(246 -6) scale(${1 + 0.18 * Math.abs(Math.sin(t * 7))})`}>
            <path d="M0 14 C-30 -6 -18 -34 0 -16 C18 -34 30 -6 0 14 Z" fill="#FF3B5C" {...s} strokeWidth={5} />
          </g>
          <path d="M248 62 q12 18 0 28 q-12 -10 0 -28 Z" fill={C.cyan} {...s} strokeWidth={4} />
        </g>
      )}
      {variant === "steam" && <path d="M110 40 Q150 -10 190 40" fill="none" stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" opacity={0.9} />}
      {variant === "slip" && <path d="M150 -40 Q118 6 120 26 A30 30 0 0 0 180 26 Q182 6 150 -40 Z" fill="#9BE8F7" {...s} strokeWidth={5} />}
      {variant === "load" && (
        <g transform={`rotate(${3 * Math.sin(t * 2)} 150 20)`}>
          <rect x={86} y={-2} width={128} height={46} rx={12} fill="#E9D3A8" {...s} strokeWidth={5} />
          <path d="M96 10 L204 10 M96 24 L204 24" stroke="#C9A86E" strokeWidth={5} />
          <rect x={118} y={-60} width={64} height={62} rx={14} fill="#9FD8F5" {...s} strokeWidth={5} />
          <rect x={136} y={-74} width={28} height={16} rx={4} fill="#3F8FD6" {...s} strokeWidth={4} />
        </g>
      )}
      {variant === "burnout" && (
        <g>
          <rect x={146} y={-4} width={8} height={40} rx={3} fill="#3A2E28" />
          <path d={`M150 -4 Q${138 + Math.sin(t * 12) * 3} -24 150 ${-46 - Math.sin(t * 9) * 4} Q${162 + Math.sin(t * 10) * 3} -24 150 -4 Z`} fill={C.orange} {...s} strokeWidth={4} opacity={0.9} />
        </g>
      )}
      {variant === "noise" && (
        <path d="M95 48 L110 8 L135 42 L150 0 L165 42 L190 8 L205 48" fill={col2} {...s} />
      )}
      {/* mata */}
      {mood === "scared" || mood === "busted" ? (
        <>
          <ellipse cx={110} cy={135} rx={28} ry={34} fill={C.white} {...s} />
          <ellipse cx={190} cy={135} rx={28} ry={34} fill={C.white} {...s} />
          <circle cx={110} cy={138} r={7} fill={C.ink} />
          <circle cx={190} cy={138} r={7} fill={C.ink} />
        </>
      ) : mood === "laugh" ? (
        <>
          <path d="M86 140 Q110 112 134 140" fill="none" {...s} />
          <path d="M166 140 Q190 112 214 140" fill="none" {...s} />
        </>
      ) : (
        <>
          <ellipse cx={110} cy={138} rx={24} ry={28} fill={C.white} {...s} />
          <ellipse cx={190} cy={138} rx={24} ry={28} fill={C.white} {...s} />
          <circle cx={118} cy={142} r={11} fill={C.ink} />
          <circle cx={198} cy={142} r={11} fill={C.ink} />
          <path d="M82 104 L136 118" {...s} />
          <path d="M218 104 L164 118" {...s} />
        </>
      )}
      {/* mulut */}
      {shout ? (
        <ellipse cx={150} cy={210} rx={42} ry={36 + Math.sin(t * 24) * 6} fill="#5A1030" {...s} />
      ) : mood === "scared" || mood === "busted" ? (
        <path d="M120 215 q15 -14 30 0 t30 0" fill="none" {...s} />
      ) : (
        <g>
          <path d="M100 195 Q150 250 200 195 Z" fill="#5A1030" {...s} />
          <path d="M118 200 L128 214 L138 202 L148 216 L158 202 L168 214 L178 200" fill={C.white} stroke="none" />
        </g>
      )}
      {(variant === "dust" || variant === "gas") && (
        <text x={150} y={276} textAnchor="middle" fontFamily="LilitaOne" fontSize={44} fill={C.ink}>
          {variant === "dust" ? "SiO" : "CO"}
          {variant === "dust" && (
            <tspan fontSize={28} dy={10}>
              2
            </tspan>
          )}
        </text>
      )}
      {variant === "burnout" && (
        <g transform="translate(112 240)">
          <rect x={0} y={0} width={70} height={36} rx={6} fill={C.cream} {...s} strokeWidth={5} />
          <rect x={70} y={11} width={8} height={14} rx={2} fill={C.ink} />
          <rect x={6} y={6} width={Math.max(4, 14 * (0.6 + 0.4 * Math.sin(t * 4)))} height={24} rx={3} fill="#FF3B3B" />
        </g>
      )}
      {variant === "doom" && (
        <g transform={`translate(196 196) rotate(-12)`}>
          <rect x={0} y={0} width={62} height={104} rx={12} fill="#1B1F3A" {...s} strokeWidth={5} />
          <rect x={7} y={9} width={48} height={84} rx={6} fill="#CFE0FF" />
          {[0, 1, 2, 3, 4].map((k) => {
            const yy = 12 + (((k * 18 - t * 60) % 90) + 90) % 90;
            return <rect key={k} x={12} y={yy} width={38} height={10} rx={3} fill={k % 2 ? C.pink : "#6C8CFF"} opacity={yy < 82 ? 1 : 0} />;
          })}
        </g>
      )}
      {variant === "co2" && (
        <text x={150} y={276} textAnchor="middle" fontFamily="LilitaOne" fontSize={46} fill={C.ink}>
          CO
          <tspan fontSize={28} dy={10}>
            2
          </tspan>
        </text>
      )}
      {variant === "salad" && (
        <g>
          <rect x={80} y={250} width={140} height={38} rx={8} fill="#FFFFFF" {...s} strokeWidth={4} />
          <text x={150} y={278} textAnchor="middle" fontFamily="LilitaOne" fontSize={26} fill="#E0566F">SEGAR?</text>
        </g>
      )}
      {variant === "salad" &&
        [0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2 + t * 0.7 + 0.4;
          const r = 172 + 14 * Math.sin(t * 3 + i);
          return germ(`g${i}`, 150 + Math.cos(a) * r, 165 + Math.sin(a) * r * 0.92, 15 + (i % 3) * 4, i % 2 ? "#B48CF0" : "#F2C94C", 15 * Math.sin(t * 4 + i));
        })}
      {variant === "finish" && (
        <g transform="translate(150 266) rotate(-4)">
          <rect x={-56} y={-27} width={112} height={54} rx={7} fill="#FFFFFF" {...s} strokeWidth={4} />
          <rect x={-52} y={-23} width={104} height={9} rx={3} fill={col2} />
          {[[-46, -9], [46, -9], [-46, 19], [46, 19]].map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r={3.2} fill={C.ink} />
          ))}
          <text x={0} y={20} textAnchor="middle" fontFamily="LilitaOne" fontSize={28} fill={C.ink}>FOMO</text>
        </g>
      )}
      {variant === "powerbank" && (
        <g transform={`translate(150 276) rotate(${-6 + 1.5 * Math.sin(t * 22)})`}>
          <path d="M-50 -34 Q0 -50 50 -34 Q76 0 50 34 Q0 50 -50 34 Q-76 0 -50 -34 Z" fill="#3A3F4B" {...s} strokeWidth={5} />
          <path d="M-40 -26 Q0 -36 40 -26" fill="none" stroke="#6B7385" strokeWidth={5} strokeLinecap="round" />
          <path d="M6 -24 L-14 4 L-2 4 L-8 26 L14 -6 L2 -6 Z" fill="#FFE14D" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
          <circle cx={30} cy={20} r={4} fill="#FF3B3B" opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 6))} />
          <circle cx={40} cy={18} r={4} fill="#FF3B3B" opacity={0.5 + 0.5 * Math.abs(Math.cos(t * 6))} />
          <circle cx={-64} cy={2} r={15} fill={col} {...s} strokeWidth={5} />
          <circle cx={64} cy={2} r={15} fill={col} {...s} strokeWidth={5} />
          {[[-66, -46, 0], [70, -42, 1.7], [-76, 42, 3.1]].map(([x, y, ph], k) => (
            <path
              key={k}
              d="M0 -19 L5 -5 L19 0 L5 5 L0 19 L-5 5 L-19 0 L-5 -5 Z"
              transform={`translate(${x} ${y}) scale(${0.7 + 0.45 * Math.abs(Math.sin(t * 9 + ph))})`}
              fill="#FFE14D"
              stroke={C.ink}
              strokeWidth={3}
              strokeLinejoin="round"
            />
          ))}
        </g>
      )}
      <ellipse cx={86} cy={178} rx={16} ry={9} fill={col2} opacity={0.6} />
      <ellipse cx={214} cy={178} rx={16} ry={9} fill={col2} opacity={0.6} />
    </svg>
  );
};
