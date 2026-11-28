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
  /** ukuran font sub-hook; default 60 (pakai subFit() untuk teks panjang) */
  subSize?: number;
  children: React.ReactNode;
}> = ({ ep, accent, tint, line1, line2, sub, subSize = 60, children }) => (
  <AbsoluteFill
    style={{
      background: ep >= 10 ? `radial-gradient(ellipse 85% 60% at 50% 62%, #FFEFD9 0%, ${tint} 82%)` : `radial-gradient(ellipse 85% 60% at 50% 62%, ${tint} 0%, ${C.bg1} 78%)`,
      overflow: "hidden",
    }}
  >
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
      {/* "\n" di line1/line2 = pecah baris; tiap baris diukur sendiri (sedikit lebih ketat, 1500) supaya muat */}
      {line1.split("\n").map((l, i, all) => (
        <div key={`a${i}`} style={{ fontSize: Math.min(200, Math.floor((all.length > 1 ? 1500 : 1640) / l.length)), color: C.cream, whiteSpace: "nowrap" }}>
          {l}
        </div>
      ))}
      {line2.split("\n").map((l, i, all) => (
        <div key={`b${i}`} style={{ fontSize: Math.min(230, Math.floor((all.length > 1 ? 1500 : 1640) / l.length)), color: accent, whiteSpace: "nowrap", marginTop: i === 0 ? 10 : 0 }}>
          {l}
        </div>
      ))}
    </div>
    {/* sub-hook */}
    <div style={{ position: "absolute", top: 830, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: subSize,
          color: C.ink,
          background: C.cream,
          whiteSpace: "nowrap",
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
  <CoverFrame ep={10} accent="#FFB21A" tint="#F3C98B" line1="JANGAN LANGSUNG" line2="PEGANG!" sub="ada yang kesetrum? baca ini ⚡">
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
  <CoverFrame ep={11} accent="#A77BC9" tint="#E3C4D6" line1="100 JAM SEMINGGU," line2="TANPA GAJI" sub="kamu manggilnya: Ibu 🤍">
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
  <CoverFrame ep={12} accent="#2FA7B8" tint="#BFDCCB" line1="LANTAI KAMAR MANDI" line2="BASAH?" sub="orang tua kita taruhannya 🛁">
    <ScanLine y={1450} />
    <div style={{ position: "absolute", left: 80, top: 1010 }}>
      <Worker size={640} expr="shocked" pose="shrug" shirt="#7A9E7E" pants="#3B3B4F" hair="#D9D9E0" seed={7} />
    </div>
    <div style={{ position: "absolute", left: 640, top: 1000, rotate: "-6deg" }}>
      <SiHalus size={360} variant="slip" mood="grin" />
    </div>
  </CoverFrame>
);

const GasTank: React.FC = () => (
  <svg width={300} height={380} viewBox="0 0 300 380" style={{ overflow: "visible" }}>
    <rect x={60} y={70} width={180} height={290} rx={60} fill="#3FAE5A" stroke={C.ink} strokeWidth={OUTLINE} />
    <rect x={110} y={30} width={80} height={50} rx={10} fill="#C9CED6" stroke={C.ink} strokeWidth={OUTLINE} />
    <rect x={80} y={170} width={140} height={60} rx={12} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    <text x={150} y={212} textAnchor="middle" fontFamily="LilitaOne" fontSize={40} fill={C.ink}>LPG</text>
    <path d="M190 40 Q260 0 280 60" fill="none" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${250 + i * 18} ${30 - i * 20} q14 -16 0 -32 q-14 -16 0 -32`} fill="none" stroke="#C9A227" strokeWidth={7} strokeLinecap="round" />
    ))}
  </svg>
);

const BottleProp: React.FC = () => (
  <svg width={170} height={360} viewBox="0 0 170 360" style={{ overflow: "visible" }}>
    <rect x={55} y={0} width={60} height={34} rx={8} fill="#3F8FD6" stroke={C.ink} strokeWidth={OUTLINE} />
    <path d="M60 34 L110 34 L110 70 Q160 90 160 140 L160 330 Q160 356 134 356 L36 356 Q10 356 10 330 L10 140 Q10 90 60 70 Z" fill="#CFEFFF" stroke={C.ink} strokeWidth={OUTLINE} />
    <path d="M14 200 L156 200 L156 330 Q156 352 134 352 L36 352 Q14 352 14 330 Z" fill="#B7E36B" opacity={0.85} />
    <rect x={20} y={130} width={130} height={50} rx={8} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    <text x={85} y={165} textAnchor="middle" fontFamily="LilitaOne" fontSize={28} fill="#3F8FD6">AIR?</text>
  </svg>
);

const PotProp: React.FC = () => (
  <svg width={420} height={260} viewBox="0 0 420 260" style={{ overflow: "visible" }}>
    <rect x={40} y={190} width={340} height={30} rx={10} fill="#6B7280" stroke={C.ink} strokeWidth={OUTLINE} />
    <rect x={90} y={80} width={220} height={120} rx={18} fill="#C9CED6" stroke={C.ink} strokeWidth={OUTLINE} />
    <rect x={300} y={110} width={110} height={24} rx={12} fill="#3A3F4B" stroke={C.ink} strokeWidth={OUTLINE} />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${140 + i * 60} 70 q-16 -20 0 -40 q16 -20 0 -40`} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
    ))}
  </svg>
);

export const Cover13: React.FC = () => (
  <CoverFrame ep={13} accent="#E8663D" tint="#F6C2A0" line1="CIUM BAU GAS?" line2="JANGAN NYALAIN LAMPU!" sub="ini yang harus kamu lakuin 🔥">
    <div style={{ position: "absolute", left: 620, top: 1020 }}>
      <GasTank />
    </div>
    <ScanLine y={1450} />
    <div style={{ position: "absolute", left: 80, top: 1010 }}>
      <Worker size={620} expr="shocked" pose="coverEars" shirt="#E8634A" pants="#3B3B4F" hijab="#7A3E2E" seed={8} />
    </div>
    <div style={{ position: "absolute", left: 440, top: 975, rotate: "-8deg" }}>
      <SiHalus size={280} variant="lpg" mood="grin" />
    </div>
  </CoverFrame>
);

export const Cover14: React.FC = () => (
  <CoverFrame ep={14} accent="#2E9E83" tint="#CDE8DC" line1="BOTOL AIR MINERAL" line2="BUKAN ISI AIR?" sub="anak cuma tahu: haus = minum 🍼">
    <div style={{ position: "absolute", left: 640, top: 1060, rotate: "6deg" }}>
      <BottleProp />
    </div>
    <ScanLine y={1450} />
    <div style={{ position: "absolute", left: 110, top: 1110 }}>
      <Worker size={520} expr="happy" pose="point" shirt="#F2B33D" pants="#3B4E8A" seed={9} />
    </div>
    <div style={{ position: "absolute", left: 800, top: 975, rotate: "10deg" }}>
      <SiHalus size={240} variant="bottle" mood="grin" />
    </div>
  </CoverFrame>
);

export const Cover15: React.FC = () => (
  <CoverFrame ep={15} accent="#E0566F" tint="#F3C1C8" line1="GAGANG PANCI" line2="NONGOL KELUAR?" sub="sedetik lengah, anak taruhannya 🫕">
    <div style={{ position: "absolute", left: 520, top: 1060 }}>
      <PotProp />
    </div>
    <ScanLine y={1450} />
    <div style={{ position: "absolute", left: 90, top: 1120 }}>
      <Worker size={500} expr="shocked" pose="point" shirt="#6FB3E0" pants="#3B3B4F" seed={10} />
    </div>
    <div style={{ position: "absolute", left: 790, top: 960, rotate: "-6deg" }}>
      <SiHalus size={240} variant="steam" mood="grin" />
    </div>
  </CoverFrame>
);

/* ===================== EP16–18 ===================== */
/** Teks cover — copywriter cukup ganti di sini. "\n" = pecah baris hook. */
export const COVER_COPY = {
  16: { line1: "SALAD SEHAT,", line2: "KOK MASUK RS?", sub: "yang bikin sakit bukan sayurnya 🥗" },
  17: { line1: "IKUT LARI\nKARENA FOMO?", line2: "JANTUNG BELUM SIAP", sub: "lari itu sehat, FOMO-nya yang bahaya 🏃" },
  18: { line1: "NGECAS DI KASUR?", line2: "POWERBANK\nBISA MELEDAK", sub: "kebakaran rumah bisa mulai dari bantal 🔥" },
};

/** Font sub-hook otomatis mengecil kalau kalimatnya panjang (maks 60). */
const subFit = (sub: string) => Math.min(60, Math.floor(1900 / Array.from(sub).length));

/** Kuman kecil lucu */
const Germ: React.FC<{ x: number; y: number; r: number; c: string; rot?: number }> = ({ x, y, r, c, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {[0, 1, 2, 3, 4, 5].map((k) => {
      const a = (k / 6) * Math.PI * 2;
      return <line key={k} x1={Math.cos(a) * r} y1={Math.sin(a) * r} x2={Math.cos(a) * (r + 9)} y2={Math.sin(a) * (r + 9)} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />;
    })}
    <circle r={r} fill={c} stroke={C.ink} strokeWidth={5} />
    <circle cx={-r * 0.36} cy={-r * 0.12} r={3.6} fill={C.ink} />
    <circle cx={r * 0.36} cy={-r * 0.12} r={3.6} fill={C.ink} />
    <path d={`M${-r * 0.3} ${r * 0.3} Q0 ${r * 0.62} ${r * 0.3} ${r * 0.3}`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
  </g>
);

const SaladBowl: React.FC = () => (
  <svg width={420} height={300} viewBox="0 0 420 300" style={{ overflow: "visible" }}>
    <defs>
      <clipPath id="saladBowlClip">
        <path d="M30 124 L390 124 Q380 270 210 276 Q40 270 30 124 Z" />
      </clipPath>
    </defs>
    <path d="M56 132 Q34 72 96 70 Q104 20 168 40 Q208 -2 252 38 Q314 18 324 70 Q386 70 364 132 Z" fill="#8EDB5A" stroke={C.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
    <path d="M100 128 Q100 92 130 80 M300 128 Q304 96 280 76 M200 120 Q198 80 214 56" fill="none" stroke="#3E9A3A" strokeWidth={6} strokeLinecap="round" />
    <path d="M128 132 Q116 86 166 90 Q196 66 226 94 Q268 84 272 132 Z" fill="#5DBB4A" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <rect x={316} y={60} width={22} height={70} rx={8} fill="#FF9A3C" stroke={C.ink} strokeWidth={5} transform="rotate(24 327 95)" />
    <circle cx={134} cy={104} r={24} fill="#FF5A4F" stroke={C.ink} strokeWidth={5} />
    <path d="M124 82 L134 90 L144 82" fill="none" stroke="#2E8B3E" strokeWidth={5} strokeLinecap="round" />
    <circle cx={292} cy={100} r={22} fill="#FF5A4F" stroke={C.ink} strokeWidth={5} />
    <ellipse cx={214} cy={84} rx={28} ry={19} fill="#E8F5C8" stroke={C.ink} strokeWidth={5} />
    <ellipse cx={214} cy={84} rx={16} ry={10} fill="none" stroke="#7CC46A" strokeWidth={4} />
    <ellipse cx={210} cy={282} rx={74} ry={13} fill="#E6D8C3" stroke={C.ink} strokeWidth={5} />
    <path d="M30 124 L390 124 Q380 270 210 276 Q40 270 30 124 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
    <g clipPath="url(#saladBowlClip)">
      <rect x={0} y={168} width={420} height={18} fill="#3FA34D" />
      <rect x={0} y={196} width={420} height={8} fill="#3FA34D" />
    </g>
    <Germ x={86} y={58} r={16} c="#B48CF0" rot={-12} />
    <Germ x={176} y={22} r={13} c="#F2C94C" rot={8} />
    <Germ x={262} y={48} r={18} c="#B48CF0" rot={14} />
    <Germ x={352} y={84} r={13} c="#F2C94C" rot={-6} />
    <Germ x={238} y={118} r={12} c="#B48CF0" />
  </svg>
);

const FinishProp: React.FC = () => (
  <svg width={460} height={520} viewBox="0 0 460 520" style={{ overflow: "visible" }}>
    <rect x={26} y={70} width={24} height={450} rx={8} fill="#C9CED6" stroke={C.ink} strokeWidth={OUTLINE} />
    <rect x={410} y={70} width={24} height={450} rx={8} fill="#C9CED6" stroke={C.ink} strokeWidth={OUTLINE} />
    <rect x={6} y={10} width={448} height={120} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={OUTLINE} />
    {new Array(16).fill(0).map((_, i) => (
      <g key={i}>
        <rect x={14 + i * 27} y={18} width={13.5} height={13.5} fill={C.ink} />
        <rect x={27.5 + i * 27} y={31.5} width={13.5} height={13.5} fill={C.ink} />
        <rect x={14 + i * 27} y={95} width={13.5} height={13.5} fill={C.ink} />
        <rect x={27.5 + i * 27} y={108.5} width={13.5} height={13.5} fill={C.ink} />
      </g>
    ))}
    <text x={230} y={90} textAnchor="middle" fontFamily="LilitaOne" fontSize={50} fill="#E8743B" letterSpacing={4}>
      FINISH
    </text>
    {/* pita finis putus */}
    {["M50 330 Q130 350 196 396", "M410 330 Q330 352 268 410"].map((dd, i) => (
      <g key={i}>
        <path d={dd} fill="none" stroke={C.ink} strokeWidth={34} strokeLinecap="round" />
        <path d={dd} fill="none" stroke="#FFFFFF" strokeWidth={20} strokeLinecap="round" />
        <path d={dd} fill="none" stroke="#E8323C" strokeWidth={20} strokeDasharray="16 16" />
      </g>
    ))}
  </svg>
);

/** Nomor dada (bib) untuk ditempel ke Worker */
const Bib: React.FC<{ text: string; w?: number }> = ({ text, w = 130 }) => (
  <div
    style={{
      width: w,
      height: w * 0.62,
      background: C.white,
      border: `5px solid ${C.ink}`,
      borderRadius: 10,
      borderTop: `16px solid #E8743B`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: HEAD,
      fontSize: w * 0.34,
      color: C.ink,
      rotate: "-5deg",
      boxSizing: "border-box",
    }}
  >
    {text}
  </div>
);

/** Kartu detak jantung ala jam pintar */
const BpmBadge: React.FC<{ bpm: number }> = ({ bpm }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: C.white,
      border: `${OUTLINE}px solid ${C.ink}`,
      borderRadius: 24,
      boxShadow: `0 8px 0 ${C.ink}`,
      padding: "6px 22px 6px 14px",
      fontFamily: HEAD,
      fontSize: 50,
      color: "#E8323C",
      rotate: "-6deg",
      whiteSpace: "nowrap",
    }}
  >
    <svg width={64} height={40} viewBox="0 0 64 40">
      <path d="M2 22 L18 22 L24 6 L32 36 L40 14 L44 22 L62 22" fill="none" stroke="#E8323C" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {bpm}
    <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 28, color: C.ink }}>BPM</span>
  </div>
);

const PowerbankProp: React.FC = () => (
  <svg width={460} height={330} viewBox="0 0 460 330" style={{ overflow: "visible" }}>
    {/* asap */}
    {[[200, 40, 26], [236, 0, 34], [196, -46, 40]].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#8A8F9C" opacity={0.55 - i * 0.12} />
    ))}
    {/* bantal */}
    <path d="M20 190 Q8 112 76 100 L384 90 Q452 100 440 190 Q452 286 384 296 L76 306 Q8 296 20 190 Z" fill="#E9E4F7" stroke={C.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
    <path d="M50 192 Q44 130 92 124 L370 116 Q418 126 410 192 Q418 262 370 270 L92 278 Q44 270 50 192 Z" fill="none" stroke="#B9AEDB" strokeWidth={5} strokeDasharray="12 10" />
    {/* bekas gosong */}
    <ellipse cx={226} cy={204} rx={118} ry={46} fill="#8B5A3C" opacity={0.45} />
    {/* kabel */}
    <path d="M300 180 Q370 160 380 220 Q392 280 460 270" fill="none" stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
    <path d="M300 180 Q370 160 380 220 Q392 280 460 270" fill="none" stroke="#F4F4F6" strokeWidth={8} strokeLinecap="round" />
    {/* powerbank menggembung */}
    <g transform="rotate(-8 222 170)">
      <path d="M130 120 Q222 92 314 120 Q338 170 314 220 Q222 248 130 220 Q106 170 130 120 Z" fill="#3A3F4B" stroke={C.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <path d="M146 128 Q222 106 298 128" fill="none" stroke="#6B7385" strokeWidth={7} strokeLinecap="round" />
      <path d="M230 128 L196 176 L218 176 L206 214 L246 160 L224 160 L242 128 Z" fill="#FFE14D" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      {[0, 1, 2, 3].map((k) => (
        <circle key={k} cx={150 + k * 16} cy={200} r={5} fill={k === 0 ? "#FF3B3B" : "#55596A"} />
      ))}
    </g>
    {/* api kecil */}
    <path d="M108 168 Q92 130 112 112 Q114 132 128 128 Q122 104 144 86 Q146 120 160 134 Q170 160 148 174 Q124 184 108 168 Z" fill={C.orange} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M124 166 Q118 146 132 138 Q134 152 146 156 Q148 170 136 172 Q128 172 124 166 Z" fill={C.yellow} />
    {/* percikan */}
    {[[340, 96, 1], [92, 236, 0.8], [330, 250, 0.7]].map(([x, y, k], i) => (
      <path key={i} d="M0 -22 L5 -6 L22 0 L5 6 L0 22 L-5 6 L-22 0 L-5 -6 Z" transform={`translate(${x} ${y}) scale(${k})`} fill="#FFE14D" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    ))}
  </svg>
);

export const Cover16: React.FC = () => (
  <CoverFrame ep={16} accent="#3FA34D" tint="#CFE8C6" {...COVER_COPY[16]} subSize={subFit(COVER_COPY[16].sub)}>
    <div style={{ position: "absolute", left: 590, top: 1225, rotate: "-4deg" }}>
      <SaladBowl />
    </div>
    <ScanLine y={1450} />
    <div style={{ position: "absolute", left: 80, top: 1030 }}>
      <Worker size={600} expr="pain" pose="holdTool" shirt="#F2B33D" pants="#3B3B4F" hijab="#3F6E5A" seed={11} />
    </div>
    <div style={{ position: "absolute", left: 60, top: 1010 }}>
      <SweatDrops />
    </div>
    <div style={{ position: "absolute", left: 700, top: 1000, rotate: "8deg" }}>
      <SiHalus size={300} variant="salad" mood="grin" />
    </div>
  </CoverFrame>
);

export const Cover17: React.FC = () => (
  <CoverFrame ep={17} accent="#E8743B" tint="#F7CDB0" {...COVER_COPY[17]} subSize={subFit(COVER_COPY[17].sub)}>
    <div style={{ position: "absolute", left: 560, top: 1000 }}>
      <FinishProp />
    </div>
    <ScanLine y={1450} />
    <div style={{ position: "absolute", left: 80, top: 1040 }}>
      <Worker size={600} expr="pain" pose="holdTool" shirt="#2FA7B8" pants="#2E3557" seed={12} />
    </div>
    <div style={{ position: "absolute", left: 216, top: 1362 }}>
      <Bib text="10K" w={116} />
    </div>
    <div style={{ position: "absolute", left: 60, top: 1020 }}>
      <SweatDrops />
    </div>
    <div style={{ position: "absolute", left: 90, top: 960 }}>
      <BpmBadge bpm={190} />
    </div>
    <div style={{ position: "absolute", left: 680, top: 1140, rotate: "-6deg" }}>
      <SiHalus size={270} variant="finish" mood="grin" />
    </div>
  </CoverFrame>
);

export const Cover18: React.FC = () => (
  <CoverFrame ep={18} accent="#E0A21F" tint="#F6DFA4" {...COVER_COPY[18]} subSize={subFit(COVER_COPY[18].sub)}>
    <div style={{ position: "absolute", left: 560, top: 1150 }}>
      <PowerbankProp />
    </div>
    <ScanLine y={1450} />
    <div style={{ position: "absolute", left: 80, top: 1030 }}>
      <Worker size={600} expr="shocked" pose="point" shirt="#7C5CFF" pants="#3B3B4F" seed={13} />
    </div>
    <div style={{ position: "absolute", left: 780, top: 1010, rotate: "8deg" }}>
      <SiHalus size={280} variant="powerbank" mood="laugh" />
    </div>
  </CoverFrame>
);
