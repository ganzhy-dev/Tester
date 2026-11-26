import "./brand";
import React from "react";
import { AbsoluteFill } from "remotion";
import { BODY, C, HEAD, OUTLINE } from "./brand";
import { SiHalus, Worker } from "./Characters";
import { Grinder, Hand } from "./ep/Ep2";
import { ShoutBubble } from "./ep/Ep3";
import { Zzz } from "./Props";

/**
 * Cover TikTok 1080x1920. Grid profil memotong ke 3:4 di tengah (y 240–1680),
 * jadi semua elemen penting ada di zona itu.
 */
const CoverFrame: React.FC<{
  ep: number;
  accent: string;
  tint: string;
  line1: string;
  line2: string;
  sub: string;
  children: React.ReactNode;
}> = ({ ep, accent, tint, line1, line2, sub, children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 85% 60% at 50% 62%, ${tint} 0%, ${C.bg1} 78%)`, overflow: "hidden" }}>
    {/* sinar burst */}
    <AbsoluteFill
      style={{
        background: `repeating-conic-gradient(from 0deg at 50% 66%, ${accent}22 0deg 9deg, transparent 9deg 22deg)`,
        maskImage: "radial-gradient(circle at 50% 66%, black 10%, transparent 62%)",
        WebkitMaskImage: "radial-gradient(circle at 50% 66%, black 10%, transparent 62%)",
      }}
    />
    {/* tag seri */}
    <div style={{ position: "absolute", top: 262, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 30px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.45)",
          border: `4px solid ${accent}`,
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: 40,
          color: C.cream,
          letterSpacing: 2,
        }}
      >
        👁️ BAHAYA TAK TERLIHAT
        <span style={{ background: accent, color: C.ink, borderRadius: 999, padding: "2px 18px", border: `3px solid ${C.ink}` }}>EP {ep}</span>
      </div>
    </div>
    {/* hook besar */}
    <div
      style={{
        position: "absolute",
        top: 350,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: HEAD,
        lineHeight: 0.92,
        WebkitTextStroke: `20px ${C.ink}`,
        paintOrder: "stroke fill",
        textShadow: `0 18px 0 ${C.ink}`,
        rotate: "-3deg",
      }}
    >
      <div style={{ fontSize: 200, color: C.cream, whiteSpace: "nowrap" }}>{line1}</div>
      <div style={{ fontSize: line2.length > 8 ? 168 : 230, color: accent, whiteSpace: "nowrap", marginTop: 10 }}>{line2}</div>
    </div>
    {/* sub-hook */}
    <div style={{ position: "absolute", top: 830, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: 60,
          color: C.ink,
          background: C.cream,
          padding: "10px 36px 14px",
          borderRadius: 30,
          border: `${OUTLINE}px solid ${C.ink}`,
          boxShadow: `0 10px 0 ${C.ink}`,
          rotate: "2deg",
        }}
      >
        {sub}
      </div>
    </div>
    {children}
  </AbsoluteFill>
);

/** Garis scanner yang "memergoki" Si Halus */
const ScanLine: React.FC<{ y: number }> = ({ y }) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: y - 160, height: 160, background: "linear-gradient(180deg, rgba(200,255,61,0) 0%, rgba(200,255,61,0.22) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: y - 6, height: 12, background: C.lime, boxShadow: "0 0 50px 14px rgba(200,255,61,0.7)" }} />
  </>
);

export const Cover1: React.FC = () => (
  <CoverFrame ep={1} accent={C.lime} tint="#3A2470" line1="NGANTUK" line2="PAS RAPAT?" sub="bukan salah bosmu 👀">
    <div style={{ position: "absolute", left: 600, top: 1010, rotate: "10deg" }}>
      <SiHalus size={440} variant="co2" mood="laugh" />
    </div>
    <ScanLine y={1440} />
    <div style={{ position: "absolute", left: 90, top: 990, rotate: "-8deg", transformOrigin: "50% 80%" }}>
      <Worker size={720} expr="sleepy" shirt="#7C5CFF" tie seed={1} />
    </div>
    <Zzz x={470} y={1080} />
  </CoverFrame>
);

export const Cover2: React.FC = () => (
  <CoverFrame ep={2} accent={C.cyan} tint="#14465A" line1="JARI JADI" line2="PUTIH?!" sub="ini bukan masuk angin 🙅">
    <div style={{ position: "absolute", left: 20, top: 990, rotate: "-12deg" }}>
      <Hand size={600} whiten={1} />
    </div>
    <div style={{ position: "absolute", left: 620, top: 1130 }}>
      <Worker size={600} expr="shocked" pose="coverEars" helmet vest seed={1} />
    </div>
    <div style={{ position: "absolute", left: 600, top: 1560, rotate: "-8deg" }}>
      <Grinder size={300} spin={false} />
    </div>
    <ScanLine y={1460} />
    <div style={{ position: "absolute", left: 470, top: 930, rotate: "12deg" }}>
      <SiHalus size={260} variant="vibe" mood="laugh" />
    </div>
  </CoverFrame>
);

export const Cover3: React.FC = () => (
  <CoverFrame ep={3} accent={C.pink} tint="#5A1E4C" line1="HARUS" line2="TERIAK?" sub="telingamu lagi dirusak 😬">
    <div style={{ position: "absolute", left: 560, top: 960 }}>
      <SiHalus size={470} variant="noise" mood="grin" />
    </div>
    <ScanLine y={1450} />
    <div style={{ position: "absolute", left: 40, top: 1010 }}>
      <Worker size={680} expr="shocked" pose="coverEars" helmet vest seed={1} />
    </div>
    <div style={{ position: "absolute", left: 545, top: 1400, rotate: "6deg" }}>
      <ShoutBubble text="HAH?! APA??" w={510} h={260} />
    </div>
  </CoverFrame>
);
