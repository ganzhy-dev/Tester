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
      <circle cx={65} cy={205} r={26} fill={skin} {...s} />
      <circle cx={335} cy={205} r={26} fill={skin} {...s} />
      {earplug && (
        <>
          <circle cx={65} cy={205} r={13} fill={C.orange} {...s} strokeWidth={4} />
          <circle cx={335} cy={205} r={13} fill={C.orange} {...s} strokeWidth={4} />
        </>
      )}
      <circle cx={200} cy={190} r={138} fill={skin} {...s} />
      {!helmet && (
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
 */
export type HalusVariant = "co2" | "vibe" | "noise";

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
  const col = variant === "co2" ? "#B9A6FF" : variant === "vibe" ? C.cyan : C.pink;
  const col2 = variant === "co2" ? "#8E76F0" : variant === "vibe" ? "#1FB6D6" : "#D93370";
  const s = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const float = Math.sin(t * Math.PI * 1.2) * 12;
  const jit = variant === "vibe" ? (random(`hj${frame}`) - 0.5) * 10 : 0;

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
      <path d={d} fill={col} {...s} />
      <path d="M70 120 Q80 60 140 52" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={14} strokeLinecap="round" />
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
      {variant === "co2" && (
        <text x={150} y={276} textAnchor="middle" fontFamily="LilitaOne" fontSize={46} fill={C.ink}>
          CO₂
        </text>
      )}
      <ellipse cx={86} cy={178} rx={16} ry={9} fill={col2} opacity={0.6} />
      <ellipse cx={214} cy={178} rx={16} ry={9} fill={col2} opacity={0.6} />
    </svg>
  );
};
