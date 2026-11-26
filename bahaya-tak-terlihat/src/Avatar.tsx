import "./brand";
import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "./brand";

/** Si Halus versi "master" untuk logo akun (krem, tanpa varian episode) */
const Ghost: React.FC<{ fill: string; stroke?: string; dashed?: boolean; mood?: "grin" | "peek" }> = ({ fill, stroke = C.ink, dashed, mood = "grin" }) => {
  const s = { stroke, strokeWidth: 14, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const body = "M60 250 Q60 50 250 50 Q440 50 440 250 L440 420 Q405 470 370 420 Q335 470 300 420 Q265 470 230 420 Q195 470 160 420 Q125 470 90 420 L60 420 Z";
  return (
    <svg viewBox="0 0 500 500" width="100%" height="100%" style={{ overflow: "visible" }}>
      <path d={body} fill={fill} {...s} strokeDasharray={dashed ? "28 22" : undefined} />
      {!dashed && (
        <>
          <path d="M120 170 Q135 100 215 88" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={22} strokeLinecap="round" />
          {/* alis jahil */}
          <path d="M140 165 L215 190" {...s} />
          <path d="M360 165 L285 190" {...s} />
          {/* mata */}
          <ellipse cx={180} cy={235} rx={40} ry={46} fill={C.white} {...s} />
          <ellipse cx={320} cy={235} rx={40} ry={46} fill={C.white} {...s} />
          <circle cx={mood === "peek" ? 196 : 192} cy={244} r={19} fill={C.ink} />
          <circle cx={mood === "peek" ? 336 : 332} cy={244} r={19} fill={C.ink} />
          {/* senyum jahil + gigi */}
          <path d="M160 300 Q250 390 340 300 Z" fill="#5A1030" {...s} />
          <path d="M190 308 L206 330 L222 310 L238 334 L254 312 L270 334 L286 310 L302 330 L318 308" fill={C.white} stroke="none" />
          <ellipse cx={128} cy={305} rx={26} ry={14} fill={C.pink} opacity={0.55} />
          <ellipse cx={372} cy={305} rx={26} ry={14} fill={C.pink} opacity={0.55} />
        </>
      )}
    </svg>
  );
};

/** Konsep A: Si Halus "ketahuan" scanner — atas kelihatan, bawah masih tak terlihat */
export const AvatarA: React.FC = () => {
  const scanY = 790; // garis scanner (dari 1080)
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, #3A2470 0%, ${C.bg1} 72%)` }}>
      {/* bagian tak terlihat: garis putus-putus */}
      <div style={{ position: "absolute", left: 140, top: 150, width: 800, height: 800, opacity: 0.55 }}>
        <Ghost fill="transparent" stroke={C.lime} dashed />
      </div>
      {/* bagian yang tersorot scanner */}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${1080 - scanY}px 0)` }}>
        <div style={{ position: "absolute", left: 140, top: 150, width: 800, height: 800 }}>
          <Ghost fill={C.cream} />
        </div>
      </div>
      {/* sinar scanner */}
      <div style={{ position: "absolute", left: 0, right: 0, top: scanY - 220, height: 220, background: "linear-gradient(180deg, rgba(200,255,61,0) 0%, rgba(200,255,61,0.28) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: scanY - 12, height: 24, background: C.lime, boxShadow: "0 0 70px 22px rgba(200,255,61,0.75)" }} />
    </AbsoluteFill>
  );
};

/** Konsep B: mata raksasa yang pupilnya Si Halus — "bahaya yang (akhirnya) terlihat" */
export const AvatarB: React.FC = () => (
  <AbsoluteFill style={{ background: C.lime }}>
    <svg viewBox="0 0 1080 1080" width={1080} height={1080} style={{ position: "absolute", inset: 0 }}>
      {/* bentuk mata */}
      <path d="M30 540 Q540 70 1050 540 Q540 1010 30 540 Z" fill={C.bg1} stroke={C.ink} strokeWidth={34} strokeLinejoin="round" />
      {/* iris */}
      <circle cx={540} cy={540} r={335} fill="#3A2470" stroke={C.ink} strokeWidth={26} />
      <circle cx={540} cy={540} r={335} fill="none" stroke={C.cyan} strokeWidth={10} opacity={0.6} strokeDasharray="6 26" />
    </svg>
    {/* pupil = Si Halus */}
    <div style={{ position: "absolute", left: 300, top: 290, width: 480, height: 480 }}>
      <Ghost fill={C.cream} mood="peek" />
    </div>
    {/* kilau mata */}
    <div style={{ position: "absolute", left: 720, top: 280, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.85)" }} />
  </AbsoluteFill>
);
