import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "./fonts";
import { clamp, easeOut } from "./timeline";

/**
 * Caption gaya TikTok, kata muncul satu-satu.
 *  - "/" = ganti baris
 *  - [kata kunci] = di-highlight (boleh lebih dari satu kata)
 */
type Token = { text: string; hl: boolean } | "br";

const parse = (s: string): Token[] => {
  const out: Token[] = [];
  const re = /\[([^\]]+)\]|(\/)|([^\s[\]/]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m[1]) out.push({ text: m[1], hl: true });
    else if (m[2]) out.push("br");
    else out.push({ text: m[3], hl: false });
  }
  return out;
};

export const Caption: React.FC<{
  text: string;
  /** durasi tampil (detik) supaya bisa animasi keluar */
  dur: number;
  size?: number;
  y?: number;
  color?: string;
  hlBg?: string;
  hlColor?: string;
  stagger?: number;
  weight?: number;
  shiver?: boolean;
}> = ({
  text,
  dur,
  size = 104,
  y = 760,
  color = "#FFFFFF",
  hlBg = "#FFE14D",
  hlColor = "#1A1206",
  stagger = 4,
  weight = 900,
  shiver = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tokens = parse(text);
  const outStart = dur * fps - 10;

  const exit = interpolate(frame, [outStart, outStart + 10], [0, 1], {
    ...clamp,
    easing: easeOut,
  });

  const lines: { text: string; hl: boolean; i: number }[][] = [[]];
  let wi = 0;
  for (const tk of tokens) {
    if (tk === "br") lines.push([]);
    else lines[lines.length - 1].push({ ...tk, i: wi++ });
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: y,
        translate: `${shiver ? Math.sin(frame * 2.1) * 5 : 0}px ${-60 * exit}px`,
        opacity: 1 - exit,
        scale: String(1 - 0.08 * exit),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: size * 0.16,
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: -size * 0.025,
        color,
        textAlign: "center",
      }}
    >
      {lines.map((line, li) => (
        <div
          key={li}
          style={{
            display: "flex",
            flexWrap: "nowrap",
            whiteSpace: "nowrap",
            justifyContent: "center",
            columnGap: size * 0.26,
            rowGap: size * 0.12,
          }}
        >
          {line.map((w) => {
            const s = spring({
              frame: frame - w.i * stagger,
              fps,
              config: { damping: 11, stiffness: 190, mass: 0.7 },
            });
            const appear = interpolate(frame - w.i * stagger, [0, 4], [0, 1], clamp);
            return (
              <span
                key={w.i}
                style={{
                  display: "inline-block",
                  opacity: appear,
                  scale: String(interpolate(s, [0, 1], [0.55, 1])),
                  translate: `0px ${interpolate(s, [0, 1], [40, 0])}px`,
                  rotate: w.hl ? "-2.5deg" : "0deg",
                  padding: w.hl ? `${size * 0.04}px ${size * 0.16}px ${size * 0.08}px` : 0,
                  borderRadius: size * 0.16,
                  background: w.hl ? hlBg : "transparent",
                  color: w.hl ? hlColor : color,
                  textShadow: w.hl
                    ? "none"
                    : "0 6px 0 rgba(0,0,0,0.28), 0 10px 40px rgba(0,0,0,0.35)",
                  boxShadow: w.hl ? "0 10px 0 rgba(0,0,0,0.22)" : "none",
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Label pil kecil (mis. "SIANG INI") */
export const Pill: React.FC<{
  children: React.ReactNode;
  bg?: string;
  color?: string;
  size?: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, bg = "#FFFFFF", color = "#E8431A", size = 46, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 13, stiffness: 200 } });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: `${size * 0.32}px ${size * 0.6}px`,
        borderRadius: 999,
        background: bg,
        color,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: size * 0.06,
        textTransform: "uppercase",
        boxShadow: "0 8px 0 rgba(0,0,0,0.2)",
        scale: String(interpolate(s, [0, 1], [0.4, 1])),
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        ...style,
      }}
    >
      {children}
    </div>
  );
};
