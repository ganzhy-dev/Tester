import "./brand";
import React from "react";
import { AbsoluteFill } from "remotion";
import { BODY, C, HEAD, OUTLINE } from "./brand";
import { SiHalus, Worker } from "./Characters";
import { Grinder, Hand } from "./ep/Ep2";
import { ShoutBubble } from "./ep/Ep3";
import { Zzz } from "./Props";
import { Headline, Phone, S } from "./PropsStress";

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Stove: React.FC = () => (
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
  <CoverFrame ep={4} accent={C.orange} tint="#5A2A12" line1="SIANG BOLONG" line2="TIBA-TIBA PUSING?" sub="bukan sekadar kepanasan 🔥">
    <svg width={420} height={420} viewBox="0 0 420 420" style={{ position: "absolute", left: 610, top: 930 }}>
      {new Array(12).fill(0).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={210 + Math.cos(a) * 120} y1={210 + Math.sin(a) * 120} x2={210 + Math.cos(a) * 190} y2={210 + Math.sin(a) * 190} stroke={C.yellow} strokeWidth={22} strokeLinecap="round" />;
      })}
      <circle cx={210} cy={210} r={100} fill={C.yellow} stroke={C.ink} strokeWidth={OUTLINE} />
    </svg>
    <div style={{ position: "absolute", left: 600, top: 940, rotate: "10deg" }}>
      <SiHalus size={400} variant="heat" mood="laugh" />
    </div>
    <ScanLine y={1440} />
    <div style={{ position: "absolute", left: 70, top: 1000 }}>
      <Worker size={660} expr="pain" pose="idle" shirt={C.white} pants="#B23A3A" tie seed={1} />
    </div>
    <div style={{ position: "absolute", left: 60, top: 980 }}>
      <SweatDrops />
    </div>
  </CoverFrame>
);

export const Cover5: React.FC = () => (
  <CoverFrame ep={5} accent={C.yellow} tint="#4A3E22" line1="LAGI RENOVASI" line2="RUMAH?" sub="debu ini nggak keliatan 👀">
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

/** Kartu hasil lab "NORMAL" */
const LabCard: React.FC = () => (
  <div style={{ width: 380, background: C.white, border: `${OUTLINE}px solid ${C.ink}`, borderRadius: 26, boxShadow: `0 12px 0 ${C.ink}`, padding: "18px 26px", fontFamily: BODY, fontWeight: 800, color: C.ink, rotate: "8deg" }}>
    <div style={{ fontFamily: HEAD, fontSize: 44 }}>🧪 HASIL LAB</div>
    {["Darah", "Lambung", "Jantung"].map((k) => (
      <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 32, marginTop: 8, whiteSpace: "nowrap", gap: 12 }}>
        {k}
        <span style={{ color: C.white, background: "#1F9D55", borderRadius: 99, padding: "0 14px", fontSize: 28 }}>NORMAL ✓</span>
      </div>
    ))}
  </div>
);

export const Cover7: React.FC = () => (
  <CoverFrame ep={7} accent={S.red} tint="#4A1426" line1="SAKIT TERUS," line2="HASIL LAB NORMAL?" sub="sakitnya nyata, bukan lebay 😣">
    <div style={{ position: "absolute", left: 620, top: 1060 }}>
      <LabCard />
    </div>
    <ScanLine y={1450} />
    <div style={{ position: "absolute", left: 90, top: 1000 }}>
      <Worker size={660} expr="pain" pose="idle" shirt="#5B6BD8" pants="#2E3557" seed={3} />
    </div>
    <div style={{ position: "absolute", left: 330, top: 905, rotate: "-8deg" }}>
      <SiHalus size={300} variant="stress" mood="grin" />
    </div>
  </CoverFrame>
);

export const Cover8: React.FC = () => (
  <CoverFrame ep={8} accent={S.violet} tint="#231A4E" line1="NOTIF GRUP" line2="JAM 10 MALAM?" sub="badanmu ngira ini bahaya 📱">
    <div style={{ position: "absolute", left: 540, top: 990, rotate: "7deg" }}>
      <Phone
        w={360}
        time="22.07"
        notifs={[
          { app: "Grup Kantor", title: "Pak Bos", text: "Tolong dicek ya, besok pagi 🙏", at: -5 },
          { app: "Grup Kelas", title: "Ketua Kelas", text: "Tugas dikumpulin jam 7!", color: "#FFB020", at: -5 },
          { app: "Grup Kantor", title: "Pak Bos", text: "Udah dibaca kan? 👀", at: -5 },
        ]}
      />
    </div>
    <ScanLine y={1450} />
    <div style={{ position: "absolute", left: 60, top: 1010 }}>
      <Worker size={660} expr="shocked" pose="idle" shirt="#3FA7A0" pants="#2E3557" seed={2} />
    </div>
    <div style={{ position: "absolute", left: 340, top: 960, rotate: "-8deg" }}>
      <SiHalus size={270} variant="burnout" mood="grin" />
    </div>
  </CoverFrame>
);

export const Cover9: React.FC = () => (
  <CoverFrame ep={9} accent={S.blue} tint="#16204F" line1="SCROLL BERITA" line2="SAMPAI SUBUH?" sub="otakmu nggak bisa bedain 😵">
    <div style={{ position: "absolute", left: 600, top: 1010 }}>
      <Headline tag="PHK" text="Ribuan pekerja dirumahkan" w={410} rotate={6} at={-5} />
    </div>
    <div style={{ position: "absolute", left: 640, top: 1240 }}>
      <Headline tag="HARGA" text="Semua naik lagi" color={C.orange} w={360} rotate={-5} at={-5} />
    </div>
    <ScanLine y={1450} />
    <div style={{ position: "absolute", left: 60, top: 1000 }}>
      <Worker size={660} expr="dizzy" pose="idle" shirt={C.pink} pants="#2E3557" seed={4} />
    </div>
    <div style={{ position: "absolute", left: 340, top: 1210, rotate: "-6deg" }}>
      <Phone w={220} dark time="02.13" feed={[{ tag: "VIRAL", text: "Bencana lagi 😢", color: C.pink }, { tag: "PHK", text: "PHK massal", color: S.red }, { tag: "FYP", text: "Umur 22 udah kaya", color: S.blue }]} />
    </div>
    <div style={{ position: "absolute", left: 20, top: 880, rotate: "-12deg" }}>
      <SiHalus size={300} variant="doom" mood="grin" />
    </div>
  </CoverFrame>
);

/* ===================== Season 3: Bahaya di Rumah Sendiri (EP10–12) ===================== */
const Clothesline: React.FC = () => (
  <svg width={980} height={260} viewBox="0 0 980 260" style={{ overflow: "visible" }}>
    <rect x={20} y={20} width={22} height={240} fill="#8A6A4A" stroke={C.ink} strokeWidth={OUTLINE} />
    <rect x={938} y={20} width={22} height={240} fill="#8A6A4A" stroke={C.ink} strokeWidth={OUTLINE} />
    <path d="M30 40 Q490 90 950 40" fill="none" stroke="#B9C0CC" strokeWidth={8} />
    <path d="M300 62 l20 -36 l-6 30 l22 -6 l-26 44 l6 -30 z" fill="#FFE14D" stroke={C.ink} strokeWidth={4} />
    <path d="M640 62 l20 -36 l-6 30 l22 -6 l-26 44 l6 -30 z" fill="#FFE14D" stroke={C.ink} strokeWidth={4} />
    <path d="M120 52 L120 130 L200 130 L200 58 Z" fill={C.pink} stroke={C.ink} strokeWidth={5} />
    <path d="M760 50 L760 150 L840 150 L840 46 Z" fill={C.cyan} stroke={C.ink} strokeWidth={5} />
  </svg>
);

export const Cover10: React.FC = () => (
  <CoverFrame ep={10} accent="#FFE14D" tint="#3A3410" line1="JANGAN LANGSUNG" line2="PEGANG!" sub="ada yang kesetrum? baca ini ⚡">
    <div style={{ position: "absolute", left: 50, top: 1000 }}>
      <Clothesline />
    </div>
    <ScanLine y={1450} />
    <div style={{ position: "absolute", left: 110, top: 1040 }}>
      <Worker size={600} expr="shocked" pose="point" shirt="#E85D75" pants="#2E3557" hijab="#3D4E8A" seed={5} />
    </div>
    <div style={{ position: "absolute", left: 640, top: 1000, rotate: "8deg" }}>
      <SiHalus size={360} variant="volt" mood="grin" />
    </div>
  </CoverFrame>
);

export const Cover11: React.FC = () => (
  <CoverFrame ep={11} accent="#C9B6E8" tint="#2E2048" line1="100 JAM SEMINGGU," line2="TANPA GAJI" sub="kamu manggilnya: Ibu 🤍">
    <ScanLine y={1450} />
    <div style={{ position: "absolute", left: 90, top: 1010 }}>
      <Worker size={640} expr="dizzy" pose="shrug" shirt="#B5838D" pants="#4A3B5C" hijab="#6D597A" seed={6} />
    </div>
    <div style={{ position: "absolute", left: 640, top: 960, rotate: "6deg" }}>
      <SiHalus size={360} variant="load" mood="grin" />
    </div>
  </CoverFrame>
);

export const Cover12: React.FC = () => (
  <CoverFrame ep={12} accent="#9BE8F7" tint="#12384A" line1="LANTAI KAMAR MANDI" line2="BASAH?" sub="orang tua kita taruhannya 🛁">
    <ScanLine y={1450} />
    <div style={{ position: "absolute", left: 80, top: 1010 }}>
      <Worker size={640} expr="shocked" pose="shrug" shirt="#7A9E7E" pants="#3B3B4F" hair="#D9D9E0" seed={7} />
    </div>
    <div style={{ position: "absolute", left: 640, top: 1000, rotate: "-6deg" }}>
      <SiHalus size={360} variant="slip" mood="grin" />
    </div>
  </CoverFrame>
);
