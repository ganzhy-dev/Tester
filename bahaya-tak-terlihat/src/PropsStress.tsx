import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp } from "./brand";

/** Warna tambahan untuk seri stres (EP7–9) */
export const S = {
  red: "#FF5A5F",
  violet: "#9D7BFF",
  blue: "#6C8CFF",
  night: "#0E1230",
  screen: "#EAF1FF",
};

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

export type Notif = { app?: string; title: string; text: string; color?: string; at?: number };

/**
 * HP kartun. `glow` = cahaya layar ke wajah, `notifs` muncul satu per satu (at = detik relatif scene),
 * `feed` = timeline yang di-scroll otomatis (doomscroll), `time` = jam di status bar.
 */
export const Phone: React.FC<{
  w?: number;
  time?: string;
  notifs?: Notif[];
  feed?: { tag: string; text: string; color: string }[];
  scrollSpeed?: number;
  buzz?: number[];
  rotate?: number;
  dark?: boolean;
}> = ({ w = 420, time = "22.00", notifs = [], feed, scrollSpeed = 220, buzz = [], rotate = 0, dark = false }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const h = w * 2.02;
  const k = w / 420;
  const shake = buzz.reduce((acc, b) => {
    const d = t - b;
    return d >= 0 && d < 0.5 ? acc + Math.sin(d * 90) * 9 * (1 - d / 0.5) : acc;
  }, 0);
  const cardH = 150 * k;
  return (
    <div style={{ position: "relative", width: w, height: h, rotate: `${rotate + shake * 0.25}deg`, translate: `${shake}px 0px` }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 64 * k,
          background: "#1B1F3A",
          border: `${OUTLINE}px solid ${C.ink}`,
          boxShadow: `0 ${14 * k}px 0 ${C.ink}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 22 * k,
          right: 22 * k,
          top: 22 * k,
          bottom: 22 * k,
          borderRadius: 46 * k,
          background: dark ? "linear-gradient(180deg,#232a5c,#101433)" : `linear-gradient(180deg, ${S.screen}, #C9D8FF)`,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 16 * k, left: 0, right: 0, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 30 * k, color: dark ? C.cream : C.ink }}>
          {time}
        </div>
        <div style={{ position: "absolute", top: 18 * k, left: "50%", width: 110 * k, height: 30 * k, translate: "-50% 0", borderRadius: 99, background: C.ink, opacity: 0 }} />
        {feed && (
          <div style={{ position: "absolute", top: 70 * k, left: 18 * k, right: 18 * k, translate: `0px ${-((t * scrollSpeed * k) % (feed.length * (cardH + 16 * k)))}px` }}>
            {[...feed, ...feed, ...feed].map((f, i) => (
              <div
                key={i}
                style={{
                  height: cardH,
                  marginBottom: 16 * k,
                  borderRadius: 22 * k,
                  background: C.white,
                  border: `${4 * k}px solid ${C.ink}`,
                  padding: `${12 * k}px ${16 * k}px`,
                  boxSizing: "border-box",
                  fontFamily: BODY,
                  fontWeight: 800,
                  color: C.ink,
                }}
              >
                <span style={{ fontSize: 22 * k, background: f.color, color: C.white, padding: `${2 * k}px ${12 * k}px`, borderRadius: 99 }}>{f.tag}</span>
                <div style={{ fontSize: 30 * k, lineHeight: 1.05, marginTop: 8 * k }}>{f.text}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ position: "absolute", top: 70 * k, left: 16 * k, right: 16 * k, display: "flex", flexDirection: "column", gap: 14 * k }}>
          {notifs.map((n, i) => {
            const at = n.at ?? 0;
            if (t < at - 0.02) return null;
            const s = spring({ frame: (t - at) * fps, fps, config: { damping: 13, stiffness: 220 } });
            return (
              <div
                key={i}
                style={{
                  opacity: s,
                  translate: `0px ${interpolate(s, [0, 1], [-60 * k, 0])}px`,
                  borderRadius: 24 * k,
                  background: "rgba(255,255,255,0.97)",
                  border: `${4 * k}px solid ${C.ink}`,
                  padding: `${12 * k}px ${16 * k}px`,
                  fontFamily: BODY,
                  color: C.ink,
                  boxShadow: `0 ${6 * k}px 0 rgba(0,0,0,0.25)`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 * k, fontSize: 22 * k, fontWeight: 800, opacity: 0.75 }}>
                  <span style={{ width: 28 * k, height: 28 * k, borderRadius: 8 * k, background: n.color ?? "#25D366", display: "inline-block", border: `${3 * k}px solid ${C.ink}` }} />
                  {n.app ?? "Chat"} · sekarang
                </div>
                <div style={{ fontSize: 30 * k, fontWeight: 800, lineHeight: 1.05, marginTop: 4 * k }}>{n.title}</div>
                <div style={{ fontSize: 26 * k, fontWeight: 600, lineHeight: 1.1 }}>{n.text}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/** Kartu judul berita (untuk doomscroll / dunia luar) */
export const Headline: React.FC<{ tag: string; text: string; color?: string; w?: number; rotate?: number; at?: number }> = ({
  tag,
  text,
  color = S.red,
  w = 520,
  rotate = 0,
  at = 0,
}) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.02) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 11, stiffness: 200 } });
  return (
    <div
      style={{
        width: w,
        rotate: `${rotate}deg`,
        scale: String(interpolate(s, [0, 1], [0.4, 1])),
        opacity: s,
        background: C.cream,
        border: `${OUTLINE}px solid ${C.ink}`,
        borderRadius: 26,
        boxShadow: `0 10px 0 ${C.ink}`,
        padding: "18px 26px 22px",
        fontFamily: BODY,
        fontWeight: 800,
        color: C.ink,
      }}
    >
      <span style={{ fontFamily: HEAD, fontSize: 30, background: color, color: C.white, padding: "2px 16px 4px", borderRadius: 99, border: `4px solid ${C.ink}` }}>{tag}</span>
      <div style={{ fontSize: 46, lineHeight: 1.02, marginTop: 10 }}>{text}</div>
    </div>
  );
};

/** Kasur sederhana (tampak samping) */
export const Bed: React.FC<{ w?: number; color?: string }> = ({ w = 900, color = "#5B6BD8" }) => (
  <svg width={w} height={w * 0.36} viewBox="0 0 900 320" style={{ overflow: "visible" }}>
    <rect x={20} y={60} width={40} height={250} rx={12} fill="#7A4E2D" stroke={C.ink} strokeWidth={OUTLINE} />
    <rect x={840} y={150} width={40} height={160} rx={12} fill="#7A4E2D" stroke={C.ink} strokeWidth={OUTLINE} />
    <rect x={50} y={170} width={810} height={90} rx={24} fill={C.cream} stroke={C.ink} strokeWidth={OUTLINE} />
    <rect x={70} y={120} width={200} height={70} rx={34} fill={C.white} stroke={C.ink} strokeWidth={OUTLINE} />
    <path d="M300 150 Q560 110 850 160 L850 230 Q560 250 300 240 Z" fill={color} stroke={C.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
  </svg>
);

/** Ikon badan: lambung, kepala, leher, jantung — buat peta keluhan psikosomatik */
export const BodySpot: React.FC<{ label: string; icon: string; at: number; color?: string }> = ({ label, icon, at, color = S.red }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.02) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 10, stiffness: 240 } });
  const pulse = 1 + 0.06 * Math.sin((t - at) * 8);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 24px 12px 14px",
        borderRadius: 999,
        background: C.cream,
        border: `6px solid ${C.ink}`,
        boxShadow: `0 8px 0 ${C.ink}`,
        fontFamily: BODY,
        fontWeight: 800,
        fontSize: 44,
        color: C.ink,
        scale: String(interpolate(s, [0, 1], [0.3, 1]) * pulse),
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
      }}
    >
      <span style={{ width: 62, height: 62, borderRadius: 99, background: color, border: `5px solid ${C.ink}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{icon}</span>
      {label}
    </div>
  );
};
