import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut, easeOut } from "../brand";
import { Pose, SiHalus, Worker } from "../Characters";
import { Episode, warpOldToNew } from "../Episode";
import { Pop, Scanner, Sticker, useShake } from "../Kit";
import { CheckRow } from "../Props";
import { BodySpot } from "../PropsStress";
import { Scene } from "./Ep1";
import { words } from "./ep11.words";
import { warp } from "./ep11.warp";

/** Semua waktu = detik isi utama (data/ep11_words.json). Tema HANGAT/terang — teks gelap di atas latar terang. */
export const EP11 = { endStart: 49.72, revealAt: 51.67 };

const MAUVE = "#A77BC9";
const PEACH = "#F2A07B";
const SH = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const IBU = { hijab: "#6D597A", shirt: "#B5838D", pants: "#4A3B5C" } as const;
const ANAK = { shirt: "#49B6E8", pants: "#2E3557", hair: "#2A1B12" } as const;
const SUAMI = { shirt: "#5E8C61", pants: "#2E3557", hair: "#1E1428" } as const;

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

/* ----------------------------------------------------------- gambar lokal */

/** Ruangan rumah hangat (dinding krem-mauve, lantai kayu) */
const Room: React.FC<{ children?: React.ReactNode; dim?: number; wall?: string }> = ({ children, dim = 0, wall = "#F6E3EA" }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 880, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: `linear-gradient(180deg, ${wall} 0%, #FBEFE6 70%)` }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 190, background: "#D9AE86", borderTop: `${OUTLINE}px solid ${C.ink}` }} />
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} style={{ position: "absolute", bottom: 0, left: i * 210, width: 4, height: 190, background: "#B88A62" }} />
    ))}
    {children}
    {dim > 0 && <div style={{ position: "absolute", inset: 0, background: "#3B2A3E", opacity: dim }} />}
  </div>
);

/** Jam dinding; `speed` = putaran jarum per detik */
const Clock: React.FC<{ x: number; y: number; size?: number; speed?: number; label?: string }> = ({ x, y, size = 200, speed = 0.15, label }) => {
  const t = useT();
  const a = t * speed * 360;
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      <svg width={size} height={size} viewBox="0 0 200 200">
        <circle cx={100} cy={100} r={90} fill="#FFF8EE" {...SH} />
        {[...Array(12)].map((_, i) => {
          const r = (i / 12) * Math.PI * 2;
          return <line key={i} x1={100 + Math.sin(r) * 72} y1={100 - Math.cos(r) * 72} x2={100 + Math.sin(r) * 82} y2={100 - Math.cos(r) * 82} stroke={C.ink} strokeWidth={6} />;
        })}
        <line x1={100} y1={100} x2={100 + Math.sin((a / 12) * (Math.PI / 180)) * 44} y2={100 - Math.cos((a / 12) * (Math.PI / 180)) * 44} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
        <line x1={100} y1={100} x2={100 + Math.sin(a * (Math.PI / 180)) * 66} y2={100 - Math.cos(a * (Math.PI / 180)) * 66} stroke={MAUVE} strokeWidth={8} strokeLinecap="round" />
        <circle cx={100} cy={100} r={9} fill={C.ink} />
      </svg>
      {label && <div style={{ textAlign: "center", fontFamily: HEAD, fontSize: 40, color: C.ink, marginTop: -6 }}>{label}</div>}
    </div>
  );
};

/** Galon air */
const Galon: React.FC<{ size?: number }> = ({ size = 160 }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 160 208">
    <rect x={56} y={4} width={48} height={26} rx={6} fill="#3F8FD6" {...SH} strokeWidth={6} />
    <path d="M40 30 L120 30 Q150 30 150 70 L150 180 Q150 204 126 204 L34 204 Q10 204 10 180 L10 70 Q10 30 40 30 Z" fill="#9FD8F5" {...SH} strokeWidth={6} />
    <path d="M10 110 L150 110 M10 150 L150 150" stroke="#6CB7E0" strokeWidth={6} />
    <path d="M34 60 Q30 100 34 150" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
  </svg>
);

/** Ember cucian */
const Ember: React.FC<{ size?: number }> = ({ size = 170 }) => (
  <svg width={size} height={size} viewBox="0 0 170 170">
    <path d="M20 40 Q85 -10 150 40" fill="none" stroke={C.ink} strokeWidth={7} />
    <path d="M14 46 L156 46 L138 160 L32 160 Z" fill={PEACH} {...SH} strokeWidth={6} />
    <path d="M22 46 Q50 18 80 40 Q110 14 148 46 Z" fill="#FFF3F8" {...SH} strokeWidth={5} />
  </svg>
);

/** Bangku kecil */
const Stool: React.FC = () => (
  <svg width={200} height={120} viewBox="0 0 200 120">
    <rect x={10} y={10} width={180} height={30} rx={10} fill="#E7B074" {...SH} strokeWidth={6} />
    <path d="M40 40 L30 112 M160 40 L170 112" stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
  </svg>
);

/** Laptop kecil */
const Laptop: React.FC = () => (
  <svg width={250} height={170} viewBox="0 0 250 170">
    <rect x={30} y={10} width={190} height={120} rx={12} fill="#2E3557" {...SH} strokeWidth={6} />
    <rect x={44} y={24} width={162} height={92} rx={6} fill="#CFE8FF" />
    <path d="M60 44 L150 44 M60 64 L190 64 M60 84 L130 84" stroke="#7FA7D6" strokeWidth={8} strokeLinecap="round" />
    <path d="M6 134 L244 134 L226 160 L24 160 Z" fill="#C3C8D6" {...SH} strokeWidth={6} />
  </svg>
);

/** Label kartu (teks gelap di latar terang) */
const Tag: React.FC<{ children: React.ReactNode; bg?: string; size?: number; rot?: number }> = ({ children, bg = C.cream, size = 40, rot = -2 }) => (
  <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: size, color: C.ink, background: bg, padding: "8px 22px 10px", borderRadius: 20, border: `6px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, rotate: `${rot}deg`, whiteSpace: "nowrap" }}>{children}</div>
);

const Source: React.FC<{ children: React.ReactNode; y?: number }> = ({ children, y = 1140 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 28, color: "#5A3E5E" }}>{children}</div>
);

/** Angka besar (teks gelap/aksen di latar terang) */
const Stat: React.FC<{ at: number; from: number; to: number; dur?: number; suffix?: string; label: string; y: number; color: string }> = ({ at, from, to, dur = 1.2, suffix = "", label, y, color }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const v = interpolate(t, [at, at + dur], [from, to], { ...clamp, easing: easeOut });
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 11, stiffness: 200 } });
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", scale: String(interpolate(s, [0, 1], [0.5, 1])) }}>
      <div style={{ fontFamily: HEAD, fontSize: 230, lineHeight: 1, color, WebkitTextStroke: `16px ${C.ink}`, paintOrder: "stroke fill", textShadow: `0 14px 0 ${C.ink}`, fontVariantNumeric: "tabular-nums" }}>
        {Math.round(v)}
        {suffix}
      </div>
      <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 50, color: C.ink, marginTop: 6, letterSpacing: 2 }}>{label}</div>
    </div>
  );
};

/** Ikon orang sederhana untuk statistik 4 dari 5 */
const Person: React.FC<{ lit: boolean; s: number }> = ({ lit, s }) => (
  <svg width={150} height={230} viewBox="0 0 150 230" style={{ scale: String(s) }}>
    <circle cx={75} cy={52} r={40} fill={lit ? MAUVE : "#E6DDE6"} {...SH} strokeWidth={6} />
    <path d="M18 220 Q18 112 75 112 Q132 112 132 220 Z" fill={lit ? MAUVE : "#E6DDE6"} {...SH} strokeWidth={6} />
  </svg>
);

/** Diagram lingkaran 76% */
const Pie: React.FC<{ p: number }> = ({ p }) => {
  const a = p * 2 * Math.PI;
  const x = 160 + Math.sin(a) * 140;
  const y = 160 - Math.cos(a) * 140;
  const large = p > 0.5 ? 1 : 0;
  return (
    <svg width={320} height={320} viewBox="0 0 320 320">
      <circle cx={160} cy={160} r={140} fill="#E9F0F7" {...SH} />
      {p > 0.001 && <path d={`M160 160 L160 20 A140 140 0 ${large} 1 ${x} ${y} Z`} fill={MAUVE} {...SH} />}
    </svg>
  );
};

/** Hati melayang lembut */
const FloatHearts: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  if (t < at) return null;
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const p = ((t - at) * 0.35 + i / 6) % 1;
        return (
          <div key={i} style={{ position: "absolute", left: 140 + i * 140 + Math.sin(t * 1.5 + i) * 30, top: 1050 - p * 650, fontSize: 46 + (i % 3) * 14, opacity: Math.sin(p * Math.PI) * 0.85 }}>
            💛
          </div>
        );
      })}
    </>
  );
};

const CHORES: { at: number; icon: string; label: string; x: number; y: number }[] = [
  { at: 0.25, icon: "🌅", label: "subuh", x: 90, y: 380 },
  { at: 0.95, icon: "🍳", label: "masak", x: 700, y: 380 },
  { at: 1.5, icon: "🧺", label: "nyuci", x: 90, y: 560 },
  { at: 2.05, icon: "🎒", label: "antar anak", x: 700, y: 560 },
  { at: 2.6, icon: "🛒", label: "belanja", x: 90, y: 740 },
  { at: 3.2, icon: "🧹", label: "beresin", x: 700, y: 740 },
  { at: 3.75, icon: "🤒", label: "ngurus yg sakit", x: 340, y: 920 },
];
const MONTAGE_POSES: Pose[] = ["holdTool", "point", "wave", "holdTool", "point", "shrug", "holdTool"];

/* ----------------------------------------------------------------- adegan */
const Ep11Scenes: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const shake = useShake([
    { t: 9.6, a: 12 },
    { t: 15.3, a: 10 },
    { t: 32.7, a: 18 },
  ]);
  const choreIdx = Math.max(0, CHORES.filter((c) => t >= c.at).length - 1);
  const pie = interpolate(t, [18.3, 19.6], [0, 0.762], { ...clamp, easing: easeOut });
  const lineUp = interpolate(t, [15.4, 16.4], [0, 1], { ...clamp, easing: easeOut });
  const lift = interpolate(t, [36.4, 37.4], [0, 1], { ...clamp, easing: easeInOut });
  const glow = interpolate(t, [46.1, 47.4], [0, 1], { ...clamp, easing: easeInOut });
  const hug = spring({ frame: (t - 46.5) * fps, fps, config: { damping: 16, stiffness: 90 } });

  return (
    <AbsoluteFill style={{ translate: shake }}>
      {/* 1 — montase pagi: semua kerjaan ibu */}
      <Scene a={0} b={4.5} zoom={false}>
        <Room>
          <div style={{ position: "absolute", left: 330, top: 300, translate: `${Math.sin(t * 9) * 6}px 0px` }}>
            <Worker size={480} pose={MONTAGE_POSES[choreIdx]} expr={t > 3.2 ? "dizzy" : "normal"} {...IBU} seed={6} flip={choreIdx % 2 === 1} />
          </div>
        </Room>
        <Clock x={400} y={320} size={170} speed={2.4} />
        {CHORES.map((c) => (
          <Pop key={c.label} at={c.at} x={c.x} y={c.y}>
            <Tag bg="#FFF6EA" size={42} rot={c.x < 400 ? -3 : 3}>
              {c.icon} {c.label}
            </Tag>
          </Pop>
        ))}
      </Scene>

      {/* 2 — "kerja apa?" … "cuma ibu rumah tangga" */}
      <Scene a={4.5} b={7.4}>
        <Room>
          <div style={{ position: "absolute", left: 40, top: 330 }}>
            <Worker size={440} pose="point" expr="normal" {...SUAMI} seed={8} />
          </div>
          <div style={{ position: "absolute", left: 470, top: 300 }}>
            <Worker size={480} pose="shrug" expr={t > 6.2 ? "smirk" : "normal"} {...IBU} seed={6} flip />
          </div>
        </Room>
        <Pop at={4.6} x={70} y={350}>
          <Tag bg="#E8F4FF" size={44} rot={-3}>
            💬 Kerja apa, Bu?
          </Tag>
        </Pop>
        <Pop at={6.25} x={560} y={350}>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 34, color: "#5A3E5E", background: "#FFF6EA", padding: "10px 20px", borderRadius: 20, border: `5px solid ${C.ink}`, rotate: "2deg" }}>“cuma ibu rumah tangga…”</div>
        </Pop>
      </Scene>

      {/* 3 — eksperimen ILO × Magdalene: 100+ jam */}
      <Scene a={7.4} b={12.6}>
        <Pop at={7.5} x={110} y={330}>
          <div style={{ width: 860, padding: "22px 30px", borderRadius: 36, background: "#FFF6EA", border: `${OUTLINE}px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}`, textAlign: "center" }}>
            <div style={{ fontFamily: HEAD, fontSize: 56, color: C.ink }}>🔬 EKSPERIMEN ILO × MAGDALENE</div>
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 34, color: "#5A3E5E" }}>perempuan mencatat jam kerja ngurus keluarga</div>
          </div>
        </Pop>
        <Stat at={9.6} from={0} to={100} dur={1.4} suffix="+" label="JAM / MINGGU" y={590} color={MAUVE} />
        <Pop at={10.9} x={760} y={640}>
          <Tag bg="#FFD8C9" size={38} rot={6}>
            tanpa gaji 💸
          </Tag>
        </Pop>
        <Source y={1110}>Eksperimen sosial ILO × Magdalene, 2024</Source>
      </Scene>

      {/* 4 — 4 dari 5 peserta di atas 40 jam */}
      <Scene a={12.6} b={15.1}>
        <Sticker at={12.7} y={340} bg="#FFF6EA" size={60} rotate={-2}>
          {"4 DARI 5 PESERTA"}
        </Sticker>
        <div style={{ position: "absolute", left: 60, right: 60, top: 560, display: "flex", justifyContent: "center", gap: 18 }}>
          {[0, 1, 2, 3, 4].map((i) => {
            const at = 12.85 + i * 0.25;
            const s = t >= at ? spring({ frame: (t - at) * fps, fps, config: { damping: 12, stiffness: 200 } }) : 0;
            return <Person key={i} lit={i < 4 && t > 13.9} s={0.4 + 0.6 * s} />;
          })}
        </div>
        <Pop at={14.0} x={0} y={860} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
          <Tag bg="#E9D8F5" size={52} rot={0}>
            {"> 40 JAM / MINGGU"}
          </Tag>
        </Pop>
      </Scene>

      {/* 5 — lewat batas jam kerja undang-undang */}
      <Scene a={15.1} b={17.0}>
        <svg width={1000} height={720} style={{ position: "absolute", left: 40, top: 380, overflow: "visible" }}>
          <rect x={140} y={720 - 220} width={260} height={220} rx={16} fill="#BFE6D2" {...SH} />
          <rect x={560} y={720 - 600 * lineUp} width={260} height={600 * lineUp} rx={16} fill={MAUVE} {...SH} />
          <line x1={60} y1={500} x2={940} y2={500} stroke="#E8463A" strokeWidth={10} strokeDasharray="30 18" />
          <text x={270} y={480} textAnchor="middle" fontFamily={HEAD} fontSize={46} fill={C.ink}>40 jam</text>
          <text x={690} y={720 - 600 * lineUp - 20} textAnchor="middle" fontFamily={HEAD} fontSize={52} fill={C.ink} opacity={lineUp}>100+ jam</text>
          <text x={270} y={770} textAnchor="middle" fontFamily={BODY} fontWeight={800} fontSize={34} fill={C.ink}>kerja kantor</text>
          <text x={690} y={770} textAnchor="middle" fontFamily={BODY} fontWeight={800} fontSize={34} fill={C.ink}>kerja ibu</text>
        </svg>
        <Sticker at={15.25} y={310} bg="#FFD8C9" size={52} rotate={-2}>
          {"LEWAT BATAS JAM KERJA UU ⚖️"}
        </Sticker>
      </Scene>

      {/* 6 — di seluruh dunia >¾ dikerjakan perempuan */}
      <Scene a={17.0} b={22.45}>
        <Sticker at={17.15} y={320} bg="#FFF6EA" size={56} rotate={-2}>
          {"🌍 DI SELURUH DUNIA"}
        </Sticker>
        <div style={{ position: "absolute", left: 120, top: 520 }}>
          <Pie p={pie} />
        </div>
        <div style={{ position: "absolute", left: 480, top: 560, width: 520 }}>
          <div style={{ fontFamily: HEAD, fontSize: 150, lineHeight: 1, color: MAUVE, WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill", fontVariantNumeric: "tabular-nums" }}>{Math.round(pie * 1000) / 10}%</div>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 40, lineHeight: 1.1, color: C.ink, opacity: interpolate(t, [19.2, 19.6], [0, 1], clamp) }}>kerja ngurus keluarga tak dibayar dikerjakan perempuan</div>
        </div>
        <Source y={1110}>ILO: 76,2% kerja perawatan tak dibayar dikerjakan perempuan</Source>
      </Scene>

      {/* 7 — bahayanya nyata, cuma nggak kelihatan */}
      <Scene a={22.45} b={24.3}>
        <Room>
          <div style={{ position: "absolute", left: 300, top: 300, opacity: 0.95 }}>
            <Worker size={500} pose="idle" expr="sleepy" {...IBU} seed={6} />
          </div>
        </Room>
        <Sticker at={22.55} y={340} bg="#FFF6EA" size={58} rotate={-2}>
          {"BAHAYANYA NYATA 👀\nCUMA NGGAK KELIHATAN"}
        </Sticker>
      </Scene>

      {/* 8 — peta badan: pinggang, lutut, tidur */}
      <Scene a={24.3} b={30.6}>
        <Room>
          <div style={{ position: "absolute", left: 60, top: 290 }}>
            <Worker size={500} pose={t < 26.5 ? "holdTool" : "shrug"} expr={t > 28.5 ? "sleepy" : "pain"} {...IBU} seed={6} />
          </div>
          {t >= 24.3 && t < 26.6 && (
            <div style={{ position: "absolute", left: 20, top: 560 }}>
              <Galon size={130} />
            </div>
          )}
          {t >= 26.5 && t < 28.6 && (
            <div style={{ position: "absolute", left: 330, top: 600 }}>
              <Ember size={150} />
            </div>
          )}
          {t >= 28.6 && (
            <div style={{ position: "absolute", left: 380, top: 120, fontFamily: HEAD, fontSize: 70, color: "#5A3E5E" }}>🌙 z z… ⏰</div>
          )}
        </Room>
        <div style={{ position: "absolute", left: 540, top: 380, display: "flex", flexDirection: "column", gap: 26 }}>
          <BodySpot at={24.45} icon="💢" label="Pinggang" color={PEACH} />
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, color: "#5A3E5E", marginTop: -14, opacity: t > 24.6 ? 1 : 0 }}>angkat galon & ember</div>
          <BodySpot at={26.6} icon="🦵" label="Lutut" color={PEACH} />
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, color: "#5A3E5E", marginTop: -14, opacity: t > 26.7 ? 1 : 0 }}>jongkok nyuci berjam-jam</div>
          <BodySpot at={28.7} icon="🪫" label="Nggak pulih" color={MAUVE} />
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, color: "#5A3E5E", marginTop: -14, opacity: t > 28.8 ? 1 : 0 }}>tidur kepotong tiap malam</div>
        </div>
      </Scene>

      {/* 9 — Si Halus: Beban yang nggak kelihatan */}
      <Scene a={30.6} b={34.0}>
        <Room dim={interpolate(t, [30.7, 31.1], [0, 0.28], clamp)}>
          <div style={{ position: "absolute", left: 120, top: 330 }}>
            <Worker size={460} pose="idle" expr="dizzy" {...IBU} seed={6} />
          </div>
        </Room>
        <Scanner at={31.2} dur={0.8} top={360} height={760}>
          <div style={{ position: "absolute", left: 560, top: 420 }}>
            <SiHalus size={420} variant="load" mood={t > 33.2 ? "laugh" : "grin"} />
          </div>
        </Scanner>
        <Sticker at={32.7} y={1010} bg={MAUVE} color={C.white} size={56} rotate={-2}>
          {"SI HALUS: BEBAN YANG NGGAK KELIHATAN"}
        </Sticker>
      </Scene>

      {/* 10 — terus gimana? angkat berdua */}
      <Scene a={34.0} b={37.85}>
        <Sticker at={34.1} y={330} bg="#FFF6EA" size={60} rotate={-2}>
          {"TERUS GIMANA? 💡"}
        </Sticker>
        <Room wall="#FBEADF">
          <div style={{ position: "absolute", left: 40, top: 330 }}>
            <Worker size={430} pose="holdTool" expr="happy" {...SUAMI} seed={8} />
          </div>
          <div style={{ position: "absolute", left: 520, top: 330 }}>
            <Worker size={430} pose="holdTool" expr="happy" {...IBU} seed={6} flip />
          </div>
          <div style={{ position: "absolute", left: 370, top: 600 - 120 * lift }}>
            <Galon size={150} />
          </div>
        </Room>
        <Pop at={35.2} x={90} y={470}>
          <Tag bg="#E8F4FF" size={40} rot={-3}>
            galon · ember · belanjaan
          </Tag>
        </Pop>
        <Sticker at={37.15} y={1010} bg="#BFE6D2" size={60} rotate={2}>
          {"ANGKAT BERDUA 🤝"}
        </Sticker>
      </Scene>

      {/* 11 — tips: bangku kecil, tidur siang */}
      <Scene a={37.85} b={42.05}>
        <Sticker at={37.9} y={330} bg="#FFF6EA" size={56} rotate={-2}>
          {"BIAR BADAN IBU PULIH 🌿"}
        </Sticker>
        <div style={{ position: "absolute", left: 80, top: 520, display: "flex", flexDirection: "column", gap: 34 }}>
          <CheckRow icon="🪑" label="Nyuci pakai bangku kecil, jangan jongkok lama" at={38.0} />
          <CheckRow icon="😴" label="Kasih waktu tidur siang, 1 jam aja" at={40.15} />
        </div>
        <div style={{ position: "absolute", left: 760, top: 900, opacity: interpolate(t, [38.3, 38.7], [0, 1], clamp) }}>
          <Stool />
        </div>
      </Scene>

      {/* 12 — kerja kantor + rumah = dua shift */}
      <Scene a={42.05} b={46.05}>
        <div style={{ position: "absolute", left: 40, top: 300, width: 490, height: 640, borderRadius: 48, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: "#E8F1FB" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 20, textAlign: "center", fontFamily: HEAD, fontSize: 48, color: C.ink }}>💼 SHIFT 1</div>
          <div style={{ position: "absolute", left: 40, top: 150 }}>
            <Worker size={360} pose="point" expr="normal" {...IBU} seed={6} shirt="#6C8CC9" />
          </div>
          <div style={{ position: "absolute", left: 200, top: 460 }}>
            <Laptop />
          </div>
        </div>
        <div style={{ position: "absolute", left: 550, top: 300, width: 490, height: 640, borderRadius: 48, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: "#F6E3EA", opacity: interpolate(t, [42.8, 43.2], [0, 1], clamp) }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 20, textAlign: "center", fontFamily: HEAD, fontSize: 48, color: C.ink }}>🏠 SHIFT 2</div>
          <div style={{ position: "absolute", left: 40, top: 150 }}>
            <Worker size={360} pose="holdTool" expr="sleepy" {...IBU} seed={6} />
          </div>
          <div style={{ position: "absolute", left: 280, top: 440 }}>
            <Ember size={150} />
          </div>
        </div>
        <Sticker at={43.6} y={980} bg="#FFF6EA" size={56} rotate={-2}>
          {"KERJA KANTOR + RUMAH = 2 SHIFT"}
        </Sticker>
        <Pop at={45.25} x={0} y={1080} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
          <Tag bg="#E9D8F5" size={46} rot={2}>
            wajar kalau capek 💛
          </Tag>
        </Pop>
      </Scene>

      {/* 13 — penutup haru: dibantu & dibilang makasih */}
      <Scene a={46.05} b={EP11.endStart + 0.2}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,214,140,${0.95 * glow}) 0%, rgba(255,190,140,${0.5 * glow}) 45%, rgba(255,240,220,0) 75%)` }} />
        <div style={{ position: "absolute", left: 250, top: 420, scale: String(0.96 + 0.04 * hug) }}>
          <Worker size={600} pose="holdTool" expr="happy" {...IBU} seed={6} />
        </div>
        <div style={{ position: "absolute", left: 420, top: 690, translate: `${interpolate(hug, [0, 1], [120, 0])}px 0px` }}>
          <Worker size={380} pose="idle" expr="happy" {...ANAK} seed={3} />
        </div>
        <FloatHearts at={46.4} />
        <Pop at={48.5} x={620} y={420}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 44, color: "#5A3E5E", background: "#FFF6EA", padding: "16px 26px", borderRadius: 18, border: `5px solid ${C.ink}`, rotate: "5deg", boxShadow: `0 8px 0 ${C.ink}` }}>
            makasih, Bu 💛
          </div>
        </Pop>
        <Sticker at={46.3} y={330} bg="#FFF6EA" size={50} rotate={-2}>
          {"DIBANTU & DIBILANG MAKASIH"}
        </Sticker>
      </Scene>
    </AbsoluteFill>
  );
};

const W = warp.length ? warp : undefined;

export const Ep11: React.FC = () => (
  <Episode ep={11} accent="#A77BC9" tint="#E3C4D6" words={words} endStart={W ? warpOldToNew(EP11.endStart, W) : EP11.endStart} revealAt={W ? warpOldToNew(EP11.revealAt, W) : EP11.revealAt} warp={W} flashes={[32.7]}>
    <Ep11Scenes />
  </Episode>
);
