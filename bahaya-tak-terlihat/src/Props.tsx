import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp } from "./brand";

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: frame / fps, fps, frame };
};

/** Balon ucapan komik */
export const Bubble: React.FC<{ children: React.ReactNode; w?: number; tail?: "left" | "right" | "down"; size?: number; bg?: string }> = ({
  children,
  w = 600,
  tail = "down",
  size = 54,
  bg = C.white,
}) => (
  <div style={{ position: "relative", width: w }}>
    <div
      style={{
        background: bg,
        border: `${OUTLINE}px solid ${C.ink}`,
        borderRadius: 48,
        padding: "26px 36px 30px",
        fontFamily: BODY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.1,
        color: C.ink,
        textAlign: "center",
        boxShadow: `0 10px 0 ${C.ink}`,
      }}
    >
      {children}
    </div>
    <svg
      width={80}
      height={70}
      viewBox="0 0 80 70"
      style={{
        position: "absolute",
        bottom: -56,
        left: tail === "left" ? 60 : tail === "right" ? w - 140 : w / 2 - 40,
        scale: tail === "left" ? "-1 1" : undefined,
      }}
    >
      <path d="M8 0 L40 62 L58 0" fill={bg} stroke={C.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <rect x={4} y={-12} width={60} height={14} fill={bg} />
    </svg>
  </div>
);

/** Ruangan sederhana: dinding, lantai, jendela opsional */
export const Room: React.FC<{ wall?: string; floor?: string; dark?: number; children?: React.ReactNode }> = ({
  wall = "#3B2A66",
  floor = "#251845",
  dark = 0,
  children,
}) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 900, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: wall }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 260, background: floor, borderTop: `${OUTLINE}px solid ${C.ink}` }} />
    {children}
    {dark > 0 && <div style={{ position: "absolute", inset: 0, background: "#05020c", opacity: dark }} />}
  </div>
);

export const Table: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 760 }) => (
  <svg width={w} height={150} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <rect x={0} y={0} width={w} height={46} rx={20} fill="#8B5E3C" stroke={C.ink} strokeWidth={OUTLINE} />
    <rect x={40} y={40} width={26} height={110} fill="#6B4528" stroke={C.ink} strokeWidth={OUTLINE} />
    <rect x={w - 66} y={40} width={26} height={110} fill="#6B4528" stroke={C.ink} strokeWidth={OUTLINE} />
  </svg>
);

/** Lingkaran ikon + label (gejala, dll) */
export const Badge: React.FC<{ icon: string; label: string; color?: string; at: number }> = ({ icon, label, color = C.pink, at }) => {
  const { t, fps } = useT();
  if (t < at - 0.05) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 10, stiffness: 220 } });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26, scale: String(interpolate(s, [0, 1], [0.3, 1])), opacity: interpolate(s, [0, 0.3], [0, 1], clamp) }}>
      <div
        style={{
          width: 170,
          height: 170,
          borderRadius: "50%",
          background: color,
          border: `${OUTLINE}px solid ${C.ink}`,
          boxShadow: `0 10px 0 ${C.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 100,
        }}
      >
        {icon}
      </div>
      <div style={{ fontFamily: HEAD, fontSize: 92, color: C.cream, WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill", textShadow: `0 10px 0 ${C.ink}` }}>{label}</div>
    </div>
  );
};

/** Baris checklist dengan centang animasi */
export const CheckRow: React.FC<{ icon: string; label: string; at: number }> = ({ icon, label, at }) => {
  const { t, fps } = useT();
  if (t < at - 0.05) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 13, stiffness: 200 } });
  const tick = interpolate(t, [at + 0.15, at + 0.45], [0, 1], clamp);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        width: 920,
        padding: "22px 30px",
        borderRadius: 40,
        background: C.cream,
        border: `${OUTLINE}px solid ${C.ink}`,
        boxShadow: `0 10px 0 ${C.ink}`,
        translate: `${interpolate(s, [0, 1], [900, 0])}px 0px`,
      }}
    >
      <div style={{ fontSize: 80 }}>{icon}</div>
      <div style={{ flex: 1, fontFamily: BODY, fontWeight: 800, fontSize: 56, color: C.ink, lineHeight: 1.05 }}>{label}</div>
      <svg width={90} height={90} viewBox="0 0 90 90">
        <circle cx={45} cy={45} r={38} fill={C.lime} stroke={C.ink} strokeWidth={6} />
        <path d="M26 46 L40 60 L66 32" fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={70} strokeDashoffset={70 * (1 - tick)} />
      </svg>
    </div>
  );
};

/** Kartu info (perbandingan / regulasi) */
export const InfoCard: React.FC<{ title: string; value: string; sub?: string; color?: string; w?: number; valueSize?: number }> = ({
  title,
  value,
  sub,
  color = C.lime,
  w = 440,
  valueSize = 110,
}) => (
  <div
    style={{
      width: w,
      padding: "30px 24px 34px",
      borderRadius: 44,
      background: C.bg1,
      border: `${OUTLINE}px solid ${C.ink}`,
      outline: `5px solid ${color}`,
      outlineOffset: -18,
      boxShadow: `0 14px 0 ${C.ink}`,
      textAlign: "center",
      fontFamily: BODY,
      fontWeight: 800,
      color: C.cream,
    }}
  >
    <div style={{ fontSize: 44, lineHeight: 1.1 }}>{title}</div>
    <div style={{ fontFamily: HEAD, fontSize: valueSize, color, lineHeight: 1.05, marginTop: 10 }}>{value}</div>
    {sub && <div style={{ fontSize: 38, opacity: 0.85, marginTop: 6 }}>{sub}</div>}
  </div>
);

/** Huruf Zzz melayang */
export const Zzz: React.FC<{ x: number; y: number; at?: number; until?: number }> = ({ x, y, at = 0, until = 999 }) => {
  const { t } = useT();
  if (t < at || t > until) return null;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const p = ((t - at) * 0.8 + i / 3) % 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + p * 90 + i * 10,
              top: y - p * 200,
              fontFamily: HEAD,
              fontSize: 60 + i * 20,
              color: C.cyan,
              opacity: Math.sin(p * Math.PI),
              WebkitTextStroke: `8px ${C.ink}`,
              paintOrder: "stroke fill",
            }}
          >
            Z
          </div>
        );
      })}
    </>
  );
};
