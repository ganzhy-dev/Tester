import React from "react";
import {
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT } from "./fonts";
import { clamp, easeInOut, easeOut } from "./timeline";

/** Termometer; `temp` 20..40 */
export const Thermometer: React.FC<{ temp: number; h?: number; style?: React.CSSProperties }> = ({
  temp,
  h = 760,
  style,
}) => {
  const w = h * 0.3;
  const p = interpolate(temp, [20, 40], [0.08, 0.95], clamp);
  const col = interpolateColors(temp, [24, 30, 35], ["#4FC3FF", "#FFB020", "#FF3B1F"]);
  const tubeTop = h * 0.04;
  const tubeBottom = h * 0.78;
  const level = tubeBottom - (tubeBottom - tubeTop) * p;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={style}>
      <rect
        x={w * 0.3}
        y={0}
        width={w * 0.4}
        height={h * 0.85}
        rx={w * 0.2}
        fill="rgba(255,255,255,0.92)"
      />
      <circle cx={w / 2} cy={h * 0.84} r={w * 0.42} fill="rgba(255,255,255,0.92)" />
      <rect
        x={w * 0.39}
        y={level}
        width={w * 0.22}
        height={h * 0.84 - level}
        rx={w * 0.11}
        fill={col}
      />
      <circle cx={w / 2} cy={h * 0.84} r={w * 0.32} fill={col} />
      <circle cx={w * 0.42} cy={h * 0.81} r={w * 0.08} fill="rgba(255,255,255,0.55)" />
      {new Array(9).fill(0).map((_, i) => {
        const y = tubeTop + 20 + i * ((tubeBottom - tubeTop - 20) / 8);
        return (
          <rect
            key={i}
            x={w * 0.72}
            y={y}
            width={i % 2 ? w * 0.08 : w * 0.14}
            height={5}
            rx={2}
            fill="rgba(255,255,255,0.8)"
          />
        );
      })}
    </svg>
  );
};

/** Kalender kecil yang "membalik" */
export const Calendar: React.FC<{ month: string; day: string }> = ({ month, day }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  return (
    <div
      style={{
        width: 330,
        height: 360,
        borderRadius: 48,
        overflow: "hidden",
        background: "#FFFFFF",
        boxShadow: "0 22px 0 rgba(0,0,0,0.18), 0 40px 80px rgba(0,0,0,0.25)",
        rotate: `${interpolate(s, [0, 1], [-25, -6])}deg`,
        scale: String(interpolate(s, [0, 1], [0.3, 1])),
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 110,
          background: "#FF3D2E",
          color: "#fff",
          fontWeight: 900,
          fontSize: 66,
          letterSpacing: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {month}
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 190,
          color: "#1B1B1F",
          letterSpacing: -8,
        }}
      >
        {day}
      </div>
    </div>
  );
};

/** Cincin progres dengan angka persen */
export const Ring: React.FC<{ value: number; size?: number; color?: string }> = ({
  value,
  size = 480,
  color = "#7FD3FF",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [0.15 * fps, 1.6 * fps], [0, value], { ...clamp, easing: easeOut });
  const r = size * 0.4;
  const C = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ rotate: "-90deg" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.22)" strokeWidth={size * 0.08} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={size * 0.08}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - p / 100)}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size * 0.32,
          color: "#fff",
          letterSpacing: -6,
          fontVariantNumeric: "tabular-nums",
          textShadow: "0 8px 0 rgba(0,0,0,0.25)",
        }}
      >
        {Math.round(p)}%
      </div>
    </div>
  );
};

/** Bar jadwal: blok "HUJAN" bergeser dari OKT ke NOV-DES */
export const DelayBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame, fps, config: { damping: 14 } });
  const shift = interpolate(frame, [2.0 * fps, 3.2 * fps], [0, 1], { ...clamp, easing: easeInOut });
  const W = 900;
  const months = ["SEP", "OKT", "NOV", "DES"];
  const cell = W / months.length;
  return (
    <div
      style={{
        width: W,
        fontFamily: FONT,
        opacity: inS,
        translate: `0px ${interpolate(inS, [0, 1], [60, 0])}px`,
      }}
    >
      <div style={{ display: "flex" }}>
        {months.map((m) => (
          <div
            key={m}
            style={{
              width: cell,
              textAlign: "center",
              color: "rgba(255,255,255,0.85)",
              fontWeight: 800,
              fontSize: 40,
              letterSpacing: 3,
            }}
          >
            {m}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "relative",
          height: 110,
          marginTop: 16,
          borderRadius: 30,
          background: "rgba(0,0,0,0.2)",
          border: "3px solid rgba(255,255,255,0.3)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            bottom: 10,
            left: interpolate(shift, [0, 1], [cell * 1 + 10, cell * 2 + 10]),
            width: cell * 2 - 20,
            borderRadius: 22,
            background: interpolateColors(shift, [0, 1], ["rgba(127,211,255,0.55)", "#2F8CFF"]),
            border: "3px dashed rgba(255,255,255,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 900,
            fontSize: 44,
            letterSpacing: 2,
          }}
        >
          MUSIM HUJAN
        </div>
      </div>
      <div
        style={{
          marginTop: 22,
          textAlign: "right",
          color: "#FFF3B0",
          fontWeight: 900,
          fontSize: 48,
          opacity: shift,
        }}
      >
        mundur ± 1 bulan →
      </div>
    </div>
  );
};

/** Petir yang "tergambar" dari atas */
export const Bolt: React.FC<{ progress: number; style?: React.CSSProperties }> = ({ progress, style }) => {
  const d = "M 300 0 L 230 260 L 330 280 L 210 560 L 300 575 L 170 900";
  const L = 1300;
  return (
    <svg width={500} height={920} viewBox="0 0 500 920" style={style}>
      <path d={d} stroke="rgba(190,225,255,0.5)" strokeWidth={46} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - progress)} />
      <path d={d} stroke="#FFFFFF" strokeWidth={16} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - progress)} />
    </svg>
  );
};

/* ---------------------------------------------------------------- ikon */
export const IconUmbrella: React.FC<{ size?: number }> = ({ size = 300 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <path d="M20 100 Q100 0 180 100 Q160 86 140 100 Q120 86 100 100 Q80 86 60 100 Q40 86 20 100 Z" fill="#FF5A3C" />
    <path d="M100 30 Q125 60 140 100 Q120 86 100 100 Z" fill="#FF8A5C" />
    <path d="M100 100 L100 165 Q100 182 84 182 Q70 182 70 168" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" />
    <rect x="95" y="14" width="10" height="20" rx="5" fill="#fff" />
  </svg>
);

export const IconBottle: React.FC<{ size?: number }> = ({ size = 300 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <rect x="78" y="10" width="44" height="24" rx="8" fill="#fff" />
    <path d="M70 40 h60 q14 0 14 14 v120 q0 18 -18 18 h-52 q-18 0 -18 -18 v-120 q0 -14 14 -14z" fill="rgba(255,255,255,0.92)" />
    <path d="M62 100 q20 -10 38 0 t38 0 v74 q0 12 -12 12 h-52 q-12 0 -12 -12z" fill="#3BA7FF" />
    <circle cx="86" cy="140" r="7" fill="rgba(255,255,255,0.7)" />
    <circle cx="110" cy="160" r="5" fill="rgba(255,255,255,0.6)" />
  </svg>
);

export const IconTreeNo: React.FC<{ size?: number }> = ({ size = 300 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <rect x="90" y="110" width="20" height="70" rx="6" fill="#8A5A3C" />
    <circle cx="100" cy="80" r="52" fill="#3FC37A" />
    <circle cx="66" cy="100" r="32" fill="#2FAA66" />
    <circle cx="136" cy="100" r="32" fill="#2FAA66" />
    <circle cx="100" cy="100" r="88" stroke="#FF3B30" strokeWidth={16} fill="none" />
    <line x1="38" y1="162" x2="162" y2="38" stroke="#FF3B30" strokeWidth={16} strokeLinecap="round" />
  </svg>
);

export const IconPhone: React.FC<{ size?: number }> = ({ size = 300 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <rect x="50" y="8" width="100" height="184" rx="20" fill="#1C2333" />
    <rect x="58" y="24" width="84" height="150" rx="10" fill="#2F8CFF" />
    <g transform="translate(66 60) scale(0.34)">
      <circle cx="58" cy="70" r="36" fill="#fff" />
      <circle cx="100" cy="52" r="46" fill="#fff" />
      <circle cx="146" cy="68" r="34" fill="#fff" />
      <rect x="30" y="68" width="146" height="40" rx="20" fill="#fff" />
    </g>
    {[0, 1, 2].map((i) => (
      <line key={i} x1={80 + i * 18} y1={112} x2={74 + i * 18} y2={130} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
    ))}
    <rect x="80" y="150" width="40" height="8" rx="4" fill="rgba(255,255,255,0.7)" />
    <rect x="86" y="182" width="28" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
  </svg>
);

export const IconWarning: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M50 6 L96 90 Q98 96 92 96 H8 Q2 96 4 90 Z" fill="#FFC531" />
    <rect x="45" y="32" width="10" height="36" rx="5" fill="#1A1206" />
    <circle cx="50" cy="80" r="6" fill="#1A1206" />
  </svg>
);

export const useSpringIn = (delay = 0, damping = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 170 } });
};
