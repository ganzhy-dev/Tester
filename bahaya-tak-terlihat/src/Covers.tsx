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
      <div style={{ fontSize: Math.min(200, Math.floor(1640 / line1.length)), color: C.cream, whiteSpace: "nowrap" }}>{line1}</div>
      <div style={{ fontSize: Math.min(230, Math.floor(1640 / line2.length)), color: accent, whiteSpace: "nowrap", marginTop: 10 }}>{line2}</div>
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

/* ---------- gambar kecil khusus cover EP4–6 ---------- */
const Stove: React.FC = () => (
  <svg width={520} height={300} viewBox="0 0 520 300" style={{ overflow: "visible" }}>
    {[120, 260, 400].map((x, i) => (
      <path key={i} d={`M${x - 50} 120 Q${x - 40} 20 ${x} 60 Q${x + 10} -10 ${x + 30} 50 Q${x + 60} 10 ${x + 50} 120 Z`} fill={i === 1 ? C.yellow : C.orange} stroke={C.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
    ))}
    <rect x={20} y={110} width={480} height={60} rx={20} fill="#3B3F4E" stroke={C.ink} strokeWidth={OUTLINE} />
    <rect x={40} y={170} width={440} height={120} rx={16} fill="#2A2140" stroke={C.ink} strokeWidth={OUTLINE} />
    <circle cx={120} cy={230} r={18} fill={C.orange} stroke={C.ink} strokeWidth={5} />
    <circle cx={260} cy={230} r={18} fill={C.orange} stroke={C.ink} strokeWidth={5} />
    <circle cx={400} cy={230} r={18} fill={C.orange} stroke={C.ink} strokeWidth={5} />
  </svg>
);

const SweatDrops: React.FC = () => (
  <svg width={240} height={200} viewBox="0 0 240 200">
    {[[30, 40], [190, 20], [210, 120], [10, 140]].map(([x, y], i) => (
      <path key={i} d={`M${x} ${y} q16 26 0 40 q-16 -14 0 -40 Z`} fill={C.cyan} stroke={C.ink} strokeWidth={5} />
    ))}
  </svg>
);

const DustCloud: React.FC<{ w: number }> = ({ w }) => (
  <svg width={w} height={w * 0.7} viewBox="0 0 300 210" style={{ overflow: "visible" }}>
    {[[90, 120, 70], [160, 90, 85], [230, 125, 65], [130, 150, 60], [200, 160, 55]].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="rgba(240,232,214,0.92)" />
    ))}
    {new Array(26).fill(0).map((_, i) => (
      <circle key={`p${i}`} cx={20 + ((i * 53) % 280)} cy={20 + ((i * 37) % 190)} r={2 + (i % 3) * 2} fill="#FFF8E6" />
    ))}
  </svg>
);

const Car: React.FC = () => (
  <svg width={760} height={330} viewBox="0 0 760 330" style={{ overflow: "visible" }}>
    <path d="M60 200 Q70 140 140 130 L250 60 Q290 40 360 40 L500 40 Q560 40 600 90 L660 140 Q720 150 720 200 L720 240 L60 240 Z" fill="#3D7BFF" stroke={C.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
    <path d="M270 80 Q300 62 350 62 L420 62 L420 130 L200 130 Z" fill="#9FD8FF" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M440 62 L500 62 Q545 62 575 100 L600 130 L440 130 Z" fill="#9FD8FF" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={190} cy={245} r={58} fill={C.ink} />
    <circle cx={190} cy={245} r={24} fill="#9AA0B5" />
    <circle cx={590} cy={245} r={58} fill={C.ink} />
    <circle cx={590} cy={245} r={24} fill="#9AA0B5" />
    <rect x={20} y={205} width={50} height={22} rx={8} fill="#5C6478" stroke={C.ink} strokeWidth={5} />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={-20 - i * 55} cy={205 - i * 30} r={26 + i * 14} fill="#5C6478" opacity={0.55 - i * 0.12} />
    ))}
  </svg>
);

export const Cover4: React.FC = () => (
  <CoverFrame ep={4} accent={C.orange} tint="#5A2A12" line1="HARI PERTAMA" line2="PALING BAHAYA?" sub="kerja di tempat panas 🔥">
    <div style={{ position: "absolute", left: 600, top: 940, rotate: "10deg" }}>
      <SiHalus size={400} variant="heat" mood="laugh" />
    </div>
    <ScanLine y={1440} />
    <div style={{ position: "absolute", left: 300, top: 1380 }}>
      <Stove />
    </div>
    <div style={{ position: "absolute", left: 70, top: 1000 }}>
      <Worker size={660} expr="pain" pose="idle" shirt={C.cream} seed={1} />
    </div>
    <div style={{ position: "absolute", left: 60, top: 980 }}>
      <SweatDrops />
    </div>
  </CoverFrame>
);

export const Cover5: React.FC = () => (
  <CoverFrame ep={5} accent={C.yellow} tint="#4A3E22" line1="POTONG" line2="KERAMIK?" sub="bahayanya nggak keliatan 👀">
    <div style={{ position: "absolute", left: 380, top: 940 }}>
      <DustCloud w={640} />
    </div>
    <div style={{ position: "absolute", left: 660, top: 1000, rotate: "8deg" }}>
      <SiHalus size={360} variant="dust" mood="grin" />
    </div>
    <ScanLine y={1450} />
    <div style={{ position: "absolute", left: 60, top: 1010 }}>
      <Worker size={660} expr="shocked" pose="holdTool" helmet vest seed={1} />
    </div>
    <div style={{ position: "absolute", left: 300, top: 1340, rotate: "-6deg" }}>
      <Grinder size={300} spin={false} />
    </div>
  </CoverFrame>
);

export const Cover6: React.FC = () => (
  <CoverFrame ep={6} accent={C.cyan} tint="#1E2F45" line1="TIDUR DI MOBIL" line2="MESIN NYALA?" sub="ini bukan keracunan AC ⚠️">
    <div style={{ position: "absolute", left: 230, top: 1080 }}>
      <Car />
    </div>
    <Zzz x={560} y={1060} />
    <ScanLine y={1460} />
    <div style={{ position: "absolute", left: 20, top: 960, rotate: "-10deg" }}>
      <SiHalus size={380} variant="gas" mood="grin" />
    </div>
  </CoverFrame>
);
