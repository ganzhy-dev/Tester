import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp } from "./brand";
import { HalusVariant, SiHalus } from "./Characters";
import type { Word } from "./Kit";

export type InsertData = {
  /** detik isi utama (timeline asli) tempat sisipan dimulai — adegan dibekukan, semua yang sesudahnya mundur `dur` detik */
  at: number;
  dur: number;
  words: Word[];
  badge: string;
  title: string;
  subtitle: string;
  quote?: string;
  bullets?: string[];
  note?: string;
  source: string;
  accent: string;
  ghost: HalusVariant;
  /** waktu (detik relatif sisipan) tiap elemen muncul */
  times?: { quote?: number; note?: number; bullets?: number[] };
};

/**
 * Kartu "KASUS VIRAL" / fakta: gaya kartu berita kartun, tanpa foto/wajah asli.
 * Ditampilkan di atas adegan yang dibekukan; karaoke caption tetap jalan di bawahnya.
 */
export const InsertCard: React.FC<{ d: InsertData }> = ({ d }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pop = (at: number, damping = 12) => spring({ frame: frame - Math.round(at * fps), fps, config: { damping, stiffness: 200 } });
  const inP = interpolate(t, [0, 0.25], [0, 1], clamp);
  const outP = interpolate(t, [d.dur - 0.25, d.dur], [0, 1], clamp);
  const sBadge = pop(0.05);
  const sTitle = pop(0.15, 10);
  const sQuote = pop(d.times?.quote ?? 0.6);
  const sNote = pop(d.times?.note ?? d.dur * 0.6);
  const push = 1 + 0.03 * (t / d.dur);
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - outP) }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 40%, ${d.accent}55 0%, ${C.bg1} 72%)`, backgroundColor: C.bg1 }} />
      {/* garis-garis "breaking news" */}
      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(-35deg, transparent 0 46px, ${d.accent}14 46px 92px)`,
          translate: `${(t * 60) % 130}px 0px`,
        }}
      />
      <AbsoluteFill style={{ scale: String(push) }}>
        <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              fontFamily: HEAD,
              fontSize: 64,
              color: C.white,
              background: "#E02424",
              border: `${OUTLINE}px solid ${C.ink}`,
              borderRadius: 18,
              padding: "6px 34px 12px",
              boxShadow: `0 10px 0 ${C.ink}`,
              rotate: "-3deg",
              scale: String(interpolate(sBadge, [0, 1], [0.3, 1]) * (1 + 0.04 * Math.sin(t * 9))),
              opacity: sBadge,
              WebkitTextStroke: `8px ${C.ink}`,
              paintOrder: "stroke fill",
            }}
          >
            {d.badge}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 420,
            left: 40,
            right: 40,
            textAlign: "center",
            fontFamily: HEAD,
            fontSize: Math.min(140, Math.floor(1700 / Math.max(8, d.title.length))),
            lineHeight: 0.95,
            color: d.accent,
            WebkitTextStroke: `16px ${C.ink}`,
            paintOrder: "stroke fill",
            textShadow: `0 12px 0 ${C.ink}`,
            scale: String(interpolate(sTitle, [0, 1], [1.6, 1])),
            opacity: interpolate(sTitle, [0, 0.4], [0, 1], clamp),
          }}
        >
          {d.title}
        </div>
        <div style={{ position: "absolute", top: 580, left: 0, right: 0, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 46, color: C.cream, opacity: sTitle }}>
          {d.subtitle}
        </div>
        {d.quote && (
          <div
            style={{
              position: "absolute",
              top: 720,
              left: 80,
              right: 80,
              background: C.cream,
              border: `${OUTLINE}px solid ${C.ink}`,
              borderRadius: 36,
              boxShadow: `0 14px 0 ${C.ink}`,
              padding: "34px 40px 38px",
              fontFamily: BODY,
              fontWeight: 800,
              fontSize: 64,
              lineHeight: 1.1,
              color: C.ink,
              textAlign: "center",
              rotate: "1.5deg",
              scale: String(interpolate(sQuote, [0, 1], [0.6, 1])),
              opacity: sQuote,
            }}
          >
            {d.quote}
          </div>
        )}
        {d.bullets && (
          <div style={{ position: "absolute", top: 720, left: 70, right: 70, display: "flex", flexDirection: "column", gap: 30 }}>
            {d.bullets.map((b, i) => {
              const s = pop(d.times?.bullets?.[i] ?? 0.6 + i * 1.2);
              return (
                <div
                  key={i}
                  style={{
                    background: C.cream,
                    border: `${OUTLINE}px solid ${C.ink}`,
                    borderRadius: 30,
                    boxShadow: `0 10px 0 ${C.ink}`,
                    padding: "22px 30px 26px",
                    fontFamily: BODY,
                    fontWeight: 800,
                    fontSize: 50,
                    lineHeight: 1.08,
                    color: C.ink,
                    translate: `${interpolate(s, [0, 1], [i % 2 ? 300 : -300, 0])}px 0px`,
                    opacity: s,
                  }}
                >
                  {b}
                </div>
              );
            })}
          </div>
        )}
        {d.note && (
          <div style={{ position: "absolute", top: 1000, left: 70, right: 300, display: "flex" }}>
            <div
              style={{
                background: d.accent,
                border: `6px solid ${C.ink}`,
                borderRadius: 26,
                boxShadow: `0 8px 0 ${C.ink}`,
                padding: "14px 24px 18px",
                fontFamily: BODY,
                fontWeight: 800,
                fontSize: 40,
                lineHeight: 1.1,
                color: C.ink,
                rotate: "-2deg",
                scale: String(interpolate(sNote, [0, 1], [0.5, 1])),
                opacity: sNote,
              }}
            >
              {d.note}
            </div>
          </div>
        )}
        <div style={{ position: "absolute", left: 780, top: 960, rotate: "8deg", opacity: sNote }}>
          <SiHalus size={250} variant={d.ghost} mood="grin" />
        </div>
        <div style={{ position: "absolute", top: 640, left: 70, right: 70, textAlign: "center", fontFamily: BODY, fontWeight: 600, fontSize: 26, lineHeight: 1.15, color: C.cream, opacity: 0.7 * sTitle }}>
          {d.source}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
