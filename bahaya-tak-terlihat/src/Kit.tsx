import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BODY, C, HEAD, backOut, clamp, easeOut } from "./brand";

export type Word = { w: string; start: number; end: number; hl?: boolean };

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

/* ------------------------------------------------------------ latar */
export const Backdrop: React.FC<{ accent: string; tint?: string }> = ({ accent, tint = C.bg2 }) => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 42%, ${tint} 0%, ${C.bg1} 75%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.16 }}>
        {new Array(16).fill(0).map((_, r) =>
          new Array(10).fill(0).map((__, c) => (
            <circle key={`${r}-${c}`} cx={54 + c * 108 + (r % 2) * 54} cy={((r * 120 + t * 18) % 1920)} r={4} fill={accent} />
          )),
        )}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------- caption karaoke */
export const Captions: React.FC<{ words: Word[]; y?: number; maxWords?: number }> = ({ words, y = 1235, maxWords = 4 }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  // kelompokkan per 1-4 kata, potong di tanda baca
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const punct = /[.,!?…:]$/.test(w.w);
    const next = words[i + 1];
    const gap = next ? next.start - w.end : 1;
    if (cur.length >= maxWords || punct || gap > 0.35) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);
  const idx = chunks.findIndex((ch, i) => {
    const end = chunks[i + 1] ? chunks[i + 1][0].start : ch[ch.length - 1].end + 0.6;
    return t >= ch[0].start - 0.05 && t < end;
  });
  if (idx < 0) return null;
  const ch = chunks[idx];
  const inF = (t - ch[0].start + 0.05) * fps;
  const pop = spring({ frame: inF, fps, config: { damping: 12, stiffness: 260, mass: 0.6 } });
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 60,
        right: 60,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: 34,
        rowGap: 0,
        fontFamily: BODY,
        fontWeight: 800,
        fontSize: 92,
        lineHeight: 1.05,
        scale: String(interpolate(pop, [0, 1], [0.8, 1])),
        textTransform: "uppercase",
      }}
    >
      {ch.map((w, i) => {
        const active = t >= w.start - 0.03 && t < (ch[i + 1]?.start ?? w.end + 0.6);
        const said = t >= w.start - 0.03;
        return (
          <span
            key={i}
            style={{
              color: w.hl ? C.lime : active ? C.yellow : C.white,
              WebkitTextStroke: `14px ${C.ink}`,
              paintOrder: "stroke fill",
              opacity: said ? 1 : 0.55,
              scale: active ? "1.04" : "1",
              textShadow: "0 8px 0 rgba(0,0,0,0.35)",
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/* ----------------------------------------------- stiker judul/angka */
export const Sticker: React.FC<{
  children: React.ReactNode;
  at: number;
  y: number;
  bg?: string;
  color?: string;
  size?: number;
  rotate?: number;
  out?: number;
  x?: number;
}> = ({ children, at, y, bg = C.lime, color = C.ink, size = 80, rotate = -3, out, x }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05 || (out !== undefined && t > out + 0.3)) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 10, stiffness: 220 } });
  const o = out !== undefined ? interpolate(t, [out, out + 0.25], [1, 0], clamp) : 1;
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: x ?? 0,
        right: x === undefined ? 0 : undefined,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          fontFamily: HEAD,
          fontSize: size,
          lineHeight: 1.05,
          color,
          background: bg,
          padding: `${size * 0.16}px ${size * 0.36}px ${size * 0.2}px`,
          borderRadius: size * 0.3,
          border: `7px solid ${C.ink}`,
          boxShadow: `0 12px 0 ${C.ink}`,
          rotate: `${rotate}deg`,
          scale: String(interpolate(s, [0, 1], [0.2, 1]) * (1 - 0.3 * (1 - o))),
          textAlign: "center",
          whiteSpace: "pre-line",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* -------------------------------------------- angka besar menghitung */
export const BigStat: React.FC<{
  at: number;
  from: number;
  to: number;
  dur?: number;
  suffix?: string;
  label?: string;
  y: number;
  color?: string;
  out?: number;
  decimals?: number;
}> = ({ at, from, to, dur = 1, suffix = "", label, y, color = C.lime, out, decimals = 0 }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05 || (out !== undefined && t > out + 0.3)) return null;
  const v = interpolate(t, [at, at + dur], [from, to], { ...clamp, easing: easeOut });
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 11, stiffness: 200 } });
  const o = out !== undefined ? interpolate(t, [out, out + 0.25], [1, 0], clamp) : 1;
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", opacity: o, scale: String(interpolate(s, [0, 1], [0.5, 1])) }}>
      <div
        style={{
          fontFamily: HEAD,
          fontSize: 230,
          lineHeight: 1,
          color,
          WebkitTextStroke: `16px ${C.ink}`,
          paintOrder: "stroke fill",
          textShadow: `0 16px 0 ${C.ink}`,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {v.toLocaleString("id-ID", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
        {suffix}
      </div>
      {label && (
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 52, color: C.cream, marginTop: 8, textTransform: "uppercase", letterSpacing: 2 }}>
          {label}
        </div>
      )}
    </div>
  );
};

/* ---------------------------- scanner: memperlihatkan yang tak terlihat */
export const Scanner: React.FC<{
  at: number;
  dur?: number;
  top?: number;
  height?: number;
  children: React.ReactNode;
}> = ({ at, dur = 0.9, top = 520, height = 760, children }) => {
  const t = useT();
  const p = interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: easeOut });
  const lineY = top + p * height;
  const showLine = t >= at && t <= at + dur + 0.25;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${1920 - lineY}px 0)` }}>{children}</div>
      {showLine && (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: lineY - 140,
              height: 140,
              background: `linear-gradient(180deg, rgba(200,255,61,0) 0%, rgba(200,255,61,0.28) 100%)`,
              opacity: interpolate(t, [at + dur, at + dur + 0.25], [1, 0], clamp),
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: lineY - 5,
              height: 10,
              background: C.lime,
              boxShadow: `0 0 40px 10px rgba(200,255,61,0.7)`,
              opacity: interpolate(t, [at + dur, at + dur + 0.25], [1, 0], clamp),
            }}
          />
        </>
      )}
    </>
  );
};

/* ------------------------------------------------ elemen muncul pop */
export const Pop: React.FC<{
  at: number;
  out?: number;
  children: React.ReactNode;
  x?: number;
  y?: number;
  from?: "pop" | "left" | "right" | "bottom" | "top";
  style?: React.CSSProperties;
}> = ({ at, out, children, x = 0, y = 0, from = "pop", style }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05 || (out !== undefined && t > out + 0.35)) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 13, stiffness: 170 } });
  const o = out !== undefined ? interpolate(t, [out, out + 0.3], [0, 1], { ...clamp, easing: easeOut }) : 0;
  const off = { pop: [0, 0], left: [-900, 0], right: [900, 0], bottom: [0, 900], top: [0, -900] }[from];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: `${interpolate(s, [0, 1], [off[0], 0])}px ${interpolate(s, [0, 1], [off[1], 0]) + o * 60}px`,
        scale: String(from === "pop" ? interpolate(s, [0, 1], [0.3, 1]) : 1),
        opacity: (from === "pop" ? interpolate(s, [0, 0.3], [0, 1], clamp) : 1) * (1 - o),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ---------------------------------------------- tag akun di atas */
export const HandleTag: React.FC<{ ep: string }> = ({ ep }) => (
  <div
    style={{
      position: "absolute",
      top: 165,
      left: 60,
      right: 60,
      display: "flex",
      justifyContent: "space-between",
      fontFamily: BODY,
      fontWeight: 800,
      fontSize: 34,
      color: C.cream,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 22px", borderRadius: 999, background: "rgba(0,0,0,0.35)", border: `3px solid ${C.lime}` }}>
      <span style={{ fontSize: 34 }}>👁️</span>@bahayataktelihat
    </div>
    <div style={{ padding: "8px 22px", borderRadius: 999, background: C.lime, color: C.ink, border: `3px solid ${C.ink}` }}>{ep}</div>
  </div>
);

/* ---------------------------------------- guncangan kamera sederhana */
export const useShake = (hits: { t: number; a: number }[]) => {
  const t = useT();
  const frame = useCurrentFrame();
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const dt = t - h.t;
    if (dt >= 0 && dt < 0.5) {
      const e = Math.exp(-dt * 9) * h.a;
      x += (random(`sx${frame}`) - 0.5) * 2 * e;
      y += (random(`sy${frame}`) - 0.5) * 2 * e;
    }
  }
  return `${x}px ${y}px`;
};

export const flashAt = (t: number, times: number[]) => {
  let f = 0;
  for (const a of times) {
    const dt = t - a;
    if (dt >= 0 && dt < 0.4) f = Math.max(f, Math.exp(-dt * 14));
  }
  return f;
};

export const appear = (t: number, at: number, fps: number) =>
  spring({ frame: (t - at) * fps, fps, config: { damping: 12, stiffness: 200 } });

export { backOut, easeOut };
