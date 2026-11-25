import React from "react";
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT } from "./fonts";
import {
  HEIGHT,
  WIDTH,
  beatPulse,
  clamp,
  coldness,
  flash,
  rainAmount,
  temperature,
} from "./timeline";

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

/** Langit: gradasi oranye terik -> biru malam badai */
export const Sky: React.FC = () => {
  const t = useT();
  const c = coldness(t);
  const top = interpolateColors(c, [0, 1], ["#FF4A1C", "#060F26"]);
  const mid = interpolateColors(c, [0, 1], ["#FF8A26", "#14305A"]);
  const bot = interpolateColors(c, [0, 1], ["#FFD45E", "#3D6A99"]);
  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(180deg, ${top} 0%, ${mid} 52%, ${bot} 100%)` }}
    />
  );
};

/** Matahari dengan sinar berputar dan glow, berdenyut di tiap ketukan */
export const Sun: React.FC<{ x?: number; y?: number; r?: number; opacity?: number }> = ({
  x = 870,
  y = 400,
  r = 120,
  opacity,
}) => {
  const t = useT();
  const o = opacity ?? 1 - coldness(t);
  if (o <= 0.001) return null;
  const pulse = 1 + 0.045 * beatPulse(t);
  const rays = 14;
  return (
    <div
      style={{
        position: "absolute",
        left: x - r * 4,
        top: y - r * 4,
        width: r * 8,
        height: r * 8,
        opacity: o,
        scale: String(pulse),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,246,200,0.85) 0%, rgba(255,214,110,0.45) 18%, rgba(255,160,60,0.15) 38%, rgba(255,120,40,0) 60%)",
        }}
      />
      <svg
        width={r * 8}
        height={r * 8}
        style={{ position: "absolute", inset: 0, rotate: `${t * 14}deg` }}
      >
        {new Array(rays).fill(0).map((_, i) => {
          const a = (i / rays) * Math.PI * 2;
          const r1 = r * 1.28;
          const r2 = r * (i % 2 ? 1.75 : 2.05);
          const cx = r * 4;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * r1}
              y1={cx + Math.sin(a) * r1}
              x2={cx + Math.cos(a) * r2}
              y2={cx + Math.sin(a) * r2}
              stroke="#FFF3B0"
              strokeWidth={r * 0.16}
              strokeLinecap="round"
              opacity={0.9}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: r * 3,
          top: r * 3,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          background: "radial-gradient(circle at 38% 35%, #FFFBE0 0%, #FFE066 45%, #FFB627 100%)",
          boxShadow: "0 0 80px rgba(255,230,120,0.9)",
        }}
      />
    </div>
  );
};

/** Gelombang fatamorgana yang naik pelan */
export const HeatWaves: React.FC = () => {
  const t = useT();
  const o = (1 - coldness(t)) * 0.9;
  if (o <= 0.01) return null;
  const n = 7;
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0, opacity: o }}>
      {new Array(n).fill(0).map((_, i) => {
        const prog = (i / n + t * 0.06) % 1;
        const y = HEIGHT * 1.05 - prog * HEIGHT * 0.9;
        const amp = 14 + 10 * random(`hw-a-${i}`);
        const ph = t * 2.2 + i;
        let d = `M -40 ${y}`;
        for (let xx = -40; xx <= WIDTH + 40; xx += 30) {
          d += ` L ${xx} ${y + Math.sin(xx / 70 + ph) * amp}`;
        }
        const fade = Math.sin(prog * Math.PI);
        return (
          <path
            key={i}
            d={d}
            stroke="#FFF6D8"
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
            opacity={0.22 * fade}
          />
        );
      })}
    </svg>
  );
};

/** Partikel debu hangat yang naik */
export const Embers: React.FC = () => {
  const t = useT();
  const o = 1 - coldness(t);
  if (o <= 0.01) return null;
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0, opacity: o }}>
      {new Array(34).fill(0).map((_, i) => {
        const sp = 60 + 90 * random(`e-s-${i}`);
        const x0 = random(`e-x-${i}`) * WIDTH;
        const y = HEIGHT + 40 - ((random(`e-y-${i}`) * HEIGHT + t * sp) % (HEIGHT + 80));
        const x = x0 + Math.sin(t * 1.3 + i) * 26;
        const r = 3 + 6 * random(`e-r-${i}`);
        return <circle key={i} cx={x} cy={y} r={r} fill="#FFF1C2" opacity={0.35 + 0.35 * random(`e-o-${i}`)} />;
      })}
    </svg>
  );
};

/** Bentuk awan (gabungan lingkaran) */
export const CloudShape: React.FC<{
  w: number;
  color: string;
  shade?: string;
  style?: React.CSSProperties;
}> = ({ w, color, shade = "rgba(0,0,0,0.18)", style }) => {
  const h = w * 0.58;
  return (
    <svg width={w} height={h} viewBox="0 0 200 116" style={style}>
      <g fill={color}>
        <circle cx="58" cy="70" r="36" />
        <circle cx="100" cy="52" r="46" />
        <circle cx="146" cy="68" r="34" />
        <rect x="30" y="68" width="146" height="40" rx="20" />
      </g>
      <rect x="30" y="92" width="146" height="16" rx="8" fill={shade} />
    </svg>
  );
};

/** Awan badai yang masuk dari kiri-kanan saat dingin */
export const StormClouds: React.FC = () => {
  const t = useT();
  const c = coldness(t);
  if (c <= 0.01) return null;
  const col = interpolateColors(c, [0, 1], ["#F3E9E0", "#2A3B57"]);
  const col2 = interpolateColors(c, [0, 1], ["#FFFFFF", "#3A5175"]);
  const drift = Math.sin(t * 0.4) * 20;
  const layer = (
    key: string,
    x: number,
    y: number,
    w: number,
    from: number,
    color: string,
  ) => (
    <CloudShape
      key={key}
      w={w}
      color={color}
      style={{
        position: "absolute",
        left: interpolate(c, [0, 1], [from, x]) + drift,
        top: y,
        opacity: interpolate(c, [0, 0.4], [0, 1], clamp),
      }}
    />
  );
  return (
    <AbsoluteFill>
      {layer("a", -160, 120, 760, -900, col2)}
      {layer("b", 420, 60, 820, 1200, col)}
      {layer("c", 120, 300, 640, -900, col)}
      {layer("d", 560, 330, 600, 1200, col2)}
    </AbsoluteFill>
  );
};

/** Hujan miring */
export const Rain: React.FC<{ amount?: number }> = ({ amount }) => {
  const t = useT();
  const a = amount ?? rainAmount(t);
  if (a <= 0.01) return null;
  const n = 150;
  const slant = 0.22;
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}>
      {new Array(n).fill(0).map((_, i) => {
        if (random(`r-k-${i}`) > a) return null;
        const sp = 2600 + 1400 * random(`r-s-${i}`);
        const len = 60 + 70 * random(`r-l-${i}`);
        const span = HEIGHT + 300;
        const y = ((random(`r-y-${i}`) * span + t * sp) % span) - 150;
        const x = random(`r-x-${i}`) * (WIDTH + 400) - 200 - y * slant;
        const near = random(`r-n-${i}`);
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x - len * slant}
            y2={y + len}
            stroke="#D6E8FF"
            strokeWidth={2 + near * 3}
            strokeLinecap="round"
            opacity={(0.25 + near * 0.45) * a}
          />
        );
      })}
    </svg>
  );
};

/** Vinyet: hangat saat panas, embun beku biru saat dingin */
export const Vignettes: React.FC = () => {
  const t = useT();
  const c = coldness(t);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          opacity: (1 - c) * 0.7,
          background:
            "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(170,30,0,0.55) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: c,
          background:
            "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 50%, rgba(170,215,255,0.38) 88%, rgba(225,245,255,0.6) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: c * 0.55,
          background: "linear-gradient(0deg, rgba(210,230,255,0.35) 0%, rgba(210,230,255,0) 28%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const Flash: React.FC = () => {
  const t = useT();
  const f = flash(t);
  if (f <= 0.01) return null;
  return <AbsoluteFill style={{ background: "#EAF4FF", opacity: f }} />;
};

/** HUD di atas: lokasi + suhu live */
export const Hud: React.FC = () => {
  const t = useT();
  const c = coldness(t);
  const temp = temperature(t);
  const o = interpolate(t, [0.2, 0.6, 25.7, 25.75, 26.1, 26.5, 55.7, 56], [0, 1, 1, 0, 0, 1, 1, 0], clamp);
  const chip: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 24px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.22)",
    border: "2px solid rgba(255,255,255,0.28)",
    color: "#fff",
    fontFamily: FONT,
    fontWeight: 800,
    fontSize: 32,
    letterSpacing: 1.5,
  };
  return (
    <div
      style={{
        position: "absolute",
        top: 190,
        left: 70,
        right: 70,
        display: "flex",
        justifyContent: "space-between",
        opacity: o,
      }}
    >
      <div style={chip}>
        <svg width="26" height="34" viewBox="0 0 24 32">
          <path
            d="M12 0C5.4 0 0 5.2 0 11.7 0 20.5 12 32 12 32s12-11.5 12-20.3C24 5.2 18.6 0 12 0z"
            fill="#FF5A3C"
          />
          <circle cx="12" cy="11.5" r="4.6" fill="#fff" />
        </svg>
        INDONESIA · AKHIR NOV 2026
      </div>
      <div
        style={{
          ...chip,
          background: interpolateColors(c, [0, 1], ["rgba(200,40,0,0.45)", "rgba(20,80,160,0.5)"]),
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {temp}°C
      </div>
    </div>
  );
};
