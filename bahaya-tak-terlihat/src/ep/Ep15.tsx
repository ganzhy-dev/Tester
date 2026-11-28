import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode, warpOldToNew } from "../Episode";
import { Pop, Scanner, Sticker, useShake } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep15.words";
import { warp } from "./ep15.warp";

/**
 * EP15 "Air Panas di Dapur" — versi MENYEMANGATI: gagang panci & air panas itu gampang dikalahin.
 * Semua waktu = detik isi utama (data/ep15_words.json). Tema HANGAT (rose-krem) — teks gelap di latar terang.
 * Kasus Ponorogo disebut lembut & simbolis (rumah + pin), tanpa anak tersiram, luka, atau tangisan.
 */
export const EP15 = { endStart: 64.65, revealAt: 66.66 };

const ROSE = "#E0566F";
const DEEP = "#7A3B48"; // teks sekunder rose tua
const SOFT = "#FFF0EC";
const MINT = "#3FAE5A";
const SH = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const SH4 = { stroke: C.ink, strokeWidth: 4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const IBU = { hijab: "#8A3B4A", shirt: "#F2A65A", pants: "#3B3B4F" } as const;
const ANAK = { hair: "#2A1B12", shirt: "#6FB3E0", pants: "#3B4E8A" } as const;

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const pop = (t: number, at: number, fps: number, damping = 13, stiffness = 190) =>
  spring({ frame: Math.max(0, (t - at) * fps), fps, config: { damping, stiffness } });

/* ----------------------------------------------------------- label & bingkai */

const Tag: React.FC<{ children: React.ReactNode; bg?: string; size?: number; rot?: number }> = ({ children, bg = C.cream, size = 40, rot = -2 }) => (
  <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: size, color: C.ink, background: bg, padding: "8px 22px 10px", borderRadius: 20, border: `6px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, rotate: `${rot}deg`, whiteSpace: "nowrap" }}>{children}</div>
);

/** Pop yang otomatis di tengah layar */
const CPop: React.FC<{ at: number; y: number; out?: number; children: React.ReactNode }> = ({ at, y, out, children }) => (
  <Pop at={at} out={out} x={0} y={y} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
    {children}
  </Pop>
);

const Source: React.FC<{ children: React.ReactNode; y?: number }> = ({ children, y = 1120 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: y, display: "flex", justifyContent: "center" }}>
    <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, color: DEEP, background: "rgba(255,248,244,0.92)", padding: "2px 18px 4px", borderRadius: 14 }}>{children}</div>
  </div>
);

/** Kartu putih bergaris tebal untuk ilustrasi */
const Panel: React.FC<{ y: number; h: number; at: number; out?: number; bg?: string; x?: number; w?: number; children: React.ReactNode }> = ({ y, h, at, out, bg = "#FFFAF6", x = 60, w = 960, children }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05 || (out !== undefined && t > out + 0.3)) return null;
  const s = pop(t, at, fps, 14, 170);
  const o = out !== undefined ? interpolate(t, [out, out + 0.25], [1, 0], clamp) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        boxSizing: "border-box",
        borderRadius: 40,
        overflow: "hidden",
        background: bg,
        border: `7px solid ${C.ink}`,
        boxShadow: `0 10px 0 ${C.ink}`,
        scale: String(interpolate(s, [0, 1], [0.85, 1]) * (1 - 0.1 * (1 - o))),
        opacity: interpolate(s, [0, 0.4], [0, 1], clamp) * o,
      }}
    >
      {children}
    </div>
  );
};

/** Lencana centang hijau (SVG) */
const Check: React.FC<{ size?: number; bg?: string }> = ({ size = 60, bg = MINT }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={{ display: "block", flex: "none" }}>
    <circle cx={30} cy={30} r={26} fill={bg} stroke={C.ink} strokeWidth={5} />
    <path d="M17 31 L26 40 L43 21" fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Tanda silang lembut (rose) */
const Cross: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: "block", flex: "none" }}>
    <circle cx={40} cy={40} r={34} fill={ROSE} stroke={C.ink} strokeWidth={6} />
    <path d="M26 26 L54 54 M54 26 L26 54" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
  </svg>
);

/** Lencana yang muncul memantul */
const PopMark: React.FC<{ at: number; x: number; y: number; kind: "ok" | "no"; size?: number }> = ({ at, x, y, kind, size = 90 }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.02) return null;
  const s = pop(t, at, fps, 9, 230);
  return (
    <div style={{ position: "absolute", left: x, top: y, scale: String(interpolate(s, [0, 1], [2.2, 1])), opacity: interpolate(s, [0, 0.25], [0, 1], clamp), rotate: `${interpolate(s, [0, 1], [-25, 0])}deg` }}>
      {kind === "ok" ? <Check size={size} /> : <Cross size={size} />}
    </div>
  );
};

/** Kilau bintang kecil */
const Glint: React.FC<{ x: number; y: number; s?: number; at?: number; ph?: number }> = ({ x, y, s = 1, at = 0, ph = 0 }) => {
  const t = useT();
  if (t < at) return null;
  const k = 0.55 + 0.45 * Math.sin((t - at) * 6 + ph);
  const grow = interpolate(t, [at, at + 0.3], [0, 1], clamp);
  return (
    <svg width={70 * s} height={70 * s} viewBox="-35 -35 70 70" style={{ position: "absolute", left: x - 35 * s, top: y - 35 * s, scale: String(k * grow), rotate: `${(t - at) * 40}deg`, overflow: "visible" }}>
      <path d="M0 -32 Q5 -5 32 0 Q5 5 0 32 Q-5 5 -32 0 Q-5 -5 0 -32 Z" fill="#FFF3A0" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    </svg>
  );
};

/* ----------------------------------------------------------- gambar lokal */

/** Dapur hangat: dinding krem-rose, meja dapur, lantai kayu. `zoom` memperbesar isi di sekitar (zx, zy). `door` = ruang main + pagar bayi di kiri */
const Kitchen: React.FC<{ children?: React.ReactNode; dim?: number; glow?: number; counter?: boolean; zoom?: number; zx?: number; zy?: number; wall?: string; door?: boolean; shelf?: boolean }> = ({ children, dim = 0, glow = 0, counter = true, zoom = 1, zx = 500, zy = 440, wall = "#FBEDE6", door = false, shelf = false }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 880, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: wall }}>
    <div style={{ position: "absolute", inset: 0, scale: String(zoom), transformOrigin: `${zx}px ${zy}px` }}>
      {/* ubin dinding */}
      {[0, 1, 2, 3].map((r) => (
        <div key={r} style={{ position: "absolute", left: 0, right: 0, top: 60 + r * 90, height: 2, background: "#EBCFC4" }} />
      ))}
      {door && (
        <>
          <div style={{ position: "absolute", left: 0, width: 300, top: 0, bottom: 0, background: "#EEF3E4" }} />
          <div style={{ position: "absolute", left: 286, width: 26, top: 90, bottom: 180, background: "#C98F6B", border: `6px solid ${C.ink}`, borderRadius: 8 }} />
          {/* bingkai foto kecil di ruang main */}
          <div style={{ position: "absolute", left: 70, top: 120, width: 140, height: 110, background: "#FFE08A", border: `6px solid ${C.ink}`, borderRadius: 12 }}>
            <div style={{ position: "absolute", left: 30, top: 34, fontSize: 40, lineHeight: 1 }}>💛</div>
          </div>
        </>
      )}
      {shelf && (
        <div style={{ position: "absolute", left: 520, width: 430, top: 170, height: 26, background: "#C98F6B", border: `6px solid ${C.ink}`, borderRadius: 10 }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 190, background: "#D9B38C", borderTop: `${OUTLINE}px solid ${C.ink}` }} />
      {counter && (
        <div style={{ position: "absolute", right: -10, width: 560, top: 420, height: 290, background: "#C98F6B", border: `${OUTLINE}px solid ${C.ink}`, borderRadius: "18px 0 0 0" }}>
          <div style={{ position: "absolute", left: -10, right: 0, top: -14, height: 34, background: "#F4E3D3", border: `${OUTLINE}px solid ${C.ink}`, borderRadius: 12 }} />
          <div style={{ position: "absolute", left: 60, top: 90, width: 180, height: 150, borderRadius: 14, border: `6px solid ${C.ink}`, background: "#B97E5B" }} />
          <div style={{ position: "absolute", left: 290, top: 90, width: 180, height: 150, borderRadius: 14, border: `6px solid ${C.ink}`, background: "#B97E5B" }} />
        </div>
      )}
      {children}
    </div>
    {glow > 0 && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(255,205,140,0.6), rgba(255,190,110,0) 70%)", opacity: glow }} />}
    {dim > 0 && <div style={{ position: "absolute", inset: 0, background: "#4A2F35", opacity: dim }} />}
  </div>
);

/**
 * Panci di atas kompor (tampak samping). `handle` 0 = gagang menjorok ke kiri (ke pinggir),
 * 1 = diputar lewat belakang ke kanan (ke dalam, di atas meja). `toy` = gagang warna permen berkilau.
 */
const Pot: React.FC<{ w?: number; handle?: number; steam?: number; t?: number; toy?: number }> = ({ w = 380, handle = 0, steam = 1, t = 0, toy = 0 }) => {
  const a = Math.PI * (1 - handle); // π = kiri, 0 = kanan
  const bx = 205 + 92 * Math.cos(a);
  const by = 128 - 14 * Math.sin(a);
  const ex = 205 + 240 * Math.cos(a);
  const ey = 128 - 34 * Math.sin(a);
  const col = interpolateColors(toy, [0, 1], ["#3A3F4B", "#FF7A93"]);
  return (
    <svg width={w} height={w * (260 / 380)} viewBox="0 0 380 260" style={{ overflow: "visible", display: "block" }}>
      {/* kompor */}
      <rect x={30} y={200} width={320} height={40} rx={12} fill="#555B66" {...SH} />
      {[110, 270].map((x) => (
        <ellipse key={x} cx={x} cy={200} rx={40} ry={8} fill="#F08A4B" opacity={0.85} />
      ))}
      {/* gagang (digambar di belakang badan panci) */}
      <line x1={bx} y1={by} x2={ex} y2={ey} stroke={C.ink} strokeWidth={26 + OUTLINE * 2} strokeLinecap="round" />
      <line x1={bx} y1={by} x2={ex} y2={ey} stroke={col} strokeWidth={26} strokeLinecap="round" />
      {toy > 0 && <line x1={bx + (ex - bx) * 0.35} y1={by + (ey - by) * 0.35 - 6} x2={bx + (ex - bx) * 0.9} y2={by + (ey - by) * 0.9 - 6} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.8 * toy} />}
      <rect x={100} y={70} width={210} height={135} rx={20} fill="#C9CED6" {...SH} />
      <path d="M118 96 L118 180" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" opacity={0.6} />
      <rect x={90} y={60} width={230} height={22} rx={10} fill="#AEB5C0" {...SH} />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${150 + i * 55} 50 q-16 -22 0 -44 q16 -22 0 -44`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={10}
          strokeLinecap="round"
          opacity={steam * (0.55 + 0.45 * Math.sin(t * 4 + i * 1.7))}
          transform={`translate(0 ${-((t * 30 + i * 12) % 14)})`}
        />
      ))}
    </svg>
  );
};

/** Panci tampak atas: meja + kompor; `handle` 0 = gagang keluar pinggir meja, 1 = ke dalam */
const PotTop: React.FC<{ w?: number; handle?: number; t?: number; edge?: boolean }> = ({ w = 520, handle = 0, t = 0, edge = true }) => {
  const ang = 90 - 150 * handle; // 90° = ke bawah (pinggir), -60° = ke dalam
  const out = 1 - handle;
  return (
    <svg width={w} height={w * (480 / 520)} viewBox="0 0 520 480" style={{ overflow: "visible", display: "block" }}>
      <rect x={6} y={6} width={508} height={404} rx={26} fill="#F4E3D3" stroke={C.ink} strokeWidth={8} />
      <rect x={6} y={396} width={508} height={52} rx={14} fill="#C98F6B" stroke={C.ink} strokeWidth={8} />
      {edge && <path d="M20 404 L500 404" stroke={ROSE} strokeWidth={10} strokeDasharray="18 16" strokeLinecap="round" opacity={0.35 + 0.65 * out} />}
      <rect x={56} y={56} width={410} height={290} rx={26} fill="#555B66" stroke={C.ink} strokeWidth={8} />
      {[
        [170, 220],
        [360, 220],
      ].map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r={70} fill="none" stroke="#2F333B" strokeWidth={12} />
          <circle cx={x} cy={y} r={40} fill="none" stroke="#F08A4B" strokeWidth={8} opacity={0.7} />
        </g>
      ))}
      <g transform={`rotate(${ang} 170 220)`}>
        <rect x={240} y={203} width={165} height={34} rx={17} fill="#3A3F4B" stroke={C.ink} strokeWidth={7} />
      </g>
      <circle cx={170} cy={220} r={96} fill="#C9CED6" stroke={C.ink} strokeWidth={8} />
      <circle cx={170} cy={220} r={74} fill="#AEB5C0" stroke={C.ink} strokeWidth={5} />
      <circle cx={170} cy={220} r={16} fill="#3A3F4B" stroke={C.ink} strokeWidth={5} />
      <path d="M118 176 Q132 160 152 154" fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
      {[0, 1].map((i) => (
        <path key={i} d={`M${150 + i * 40} ${150 - ((t * 40 + i * 20) % 30)} q-12 -16 0 -32 q12 -16 0 -32`} fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
      ))}
    </svg>
  );
};

/** Tangan mungil siluet (lucu, tanpa wajah) menjangkau ke kanan */
const LittleHand: React.FC<{ w?: number }> = ({ w = 260 }) => (
  <svg width={w} height={w * (150 / 260)} viewBox="0 0 260 150" style={{ overflow: "visible", display: "block" }}>
    <rect x={-40} y={50} width={130} height={62} rx={26} fill="#6FB3E0" {...SH} />
    <path d="M86 52 Q120 40 150 50 L200 48 Q220 48 220 62 Q220 74 200 74 L176 76 L214 80 Q232 82 230 96 Q228 108 210 106 L172 104 L198 110 Q212 114 208 126 Q204 136 188 132 L150 124 Q112 122 92 110 Z" fill="#C98B5E" {...SH} strokeWidth={6} />
    <path d="M140 52 Q150 30 168 28 Q182 28 178 42 L164 56" fill="#C98B5E" {...SH} strokeWidth={6} />
  </svg>
);

/** Rumah tampak depan; `warm` menyalakan jendela kuning hangat */
const House: React.FC<{ warm?: number }> = ({ warm = 0 }) => {
  const win = interpolateColors(warm, [0, 1], ["#CFEAF5", "#FFE08A"]);
  return (
    <svg width={520} height={440} viewBox="0 0 520 440" style={{ overflow: "visible", display: "block" }}>
      {warm > 0 && <circle cx={165} cy={295} r={115} fill="#FFE9A8" opacity={0.55 * warm} />}
      <rect x={360} y={70} width={44} height={90} fill="#A8505F" {...SH} />
      <path d="M30 200 L260 30 L490 200 Z" fill={ROSE} {...SH} />
      <rect x={70} y={195} width={380} height={230} fill="#F7EEDB" {...SH} />
      <rect x={110} y={250} width={110} height={90} rx={8} fill={win} {...SH} />
      <path d="M165 250 L165 340 M110 295 L220 295" stroke={C.ink} strokeWidth={5} />
      <rect x={290} y={270} width={110} height={155} rx={8} fill="#A8714C" {...SH} />
      <circle cx={380} cy={350} r={7} fill={C.ink} />
      <rect x={232} y={382} width={40} height={43} rx={6} fill="#F2A65A" {...SH4} />
      <circle cx={252} cy={366} r={22} fill="#6FBF5A" {...SH4} />
    </svg>
  );
};

const MapPin: React.FC = () => (
  <svg width={90} height={124} viewBox="0 0 90 124" style={{ display: "block" }}>
    <path d="M45 120 C30 92 6 72 6 45 A39 39 0 0 1 84 45 C84 72 60 92 45 120 Z" fill={ROSE} {...SH} strokeWidth={6} />
    <circle cx={45} cy={45} r={15} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
  </svg>
);

/** Langit sore hangat + rumput */
const Sky: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 880, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: "linear-gradient(180deg, #FAD6D6 0%, #FDEDE4 60%, #F8EBD6 100%)" }}>
    <div style={{ position: "absolute", left: 790, top: 70, width: 120, height: 120, borderRadius: "50%", background: "#FFD86B", border: `6px solid ${C.ink}`, boxShadow: "0 0 0 24px rgba(255,216,107,0.3)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 110, background: "#A9D47F", borderTop: `${OUTLINE}px solid ${C.ink}` }} />
    {children}
  </div>
);

/** Lapisan kulit: dewasa (tebal) vs anak (tipis) */
const SkinCol: React.FC<{ x: number; label: string; layers: number; at: number; emoji: string }> = ({ x, label, layers, at, emoji }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps, 12, 180);
  const cols = ["#F6CBB0", "#EEB094", "#E59A80", "#D9846E"];
  return (
    <div style={{ position: "absolute", left: x, top: 450, width: 400, textAlign: "center", scale: String(interpolate(s, [0, 1], [0.4, 1])), opacity: interpolate(s, [0, 0.3], [0, 1], clamp) }}>
      <div style={{ fontSize: 110, lineHeight: 1.1 }}>{emoji}</div>
      <div style={{ fontFamily: HEAD, fontSize: 52, color: C.ink, margin: "6px 0 18px" }}>{label}</div>
      <div style={{ margin: "0 auto", width: 330, borderRadius: 26, overflow: "hidden", border: `7px solid ${C.ink}`, boxShadow: `0 9px 0 ${C.ink}` }}>
        {cols.slice(0, layers).map((c, i) => (
          <div key={i} style={{ height: layers > 2 ? 70 : 52, background: c, borderTop: i ? `4px dashed ${C.ink}` : undefined }} />
        ))}
        <div style={{ height: 70, background: "#E8A0A8" }} />
      </div>
    </div>
  );
};

/** Perisai hangat dengan hati */
const Shield: React.FC<{ w?: number }> = ({ w = 420 }) => (
  <svg width={w} height={w * (480 / 420)} viewBox="0 0 420 480" style={{ overflow: "visible", display: "block" }}>
    <path d="M210 14 L392 74 Q396 300 210 466 Q24 300 28 74 Z" fill="#FFD9DF" stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
    <path d="M210 52 L356 100 Q356 280 210 418 Q64 280 64 100 Z" fill="#FFF3F3" opacity={0.85} />
    <path d="M210 330 C110 260 120 170 172 170 Q200 170 210 200 Q220 170 248 170 C300 170 310 260 210 330 Z" fill={ROSE} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
  </svg>
);

/** Termos air panas */
const Thermos: React.FC<{ w?: number }> = ({ w = 120 }) => (
  <svg width={w} height={w * (200 / 120)} viewBox="0 0 120 200" style={{ overflow: "visible", display: "block" }}>
    <rect x={30} y={6} width={60} height={30} rx={10} fill="#3A3F4B" {...SH4} strokeWidth={6} />
    <path d="M90 20 Q116 22 116 56 Q116 84 92 88" fill="none" stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
    <path d="M90 20 Q116 22 116 56 Q116 84 92 88" fill="none" stroke="#3A3F4B" strokeWidth={6} strokeLinecap="round" />
    <rect x={14} y={32} width={92} height={160} rx={22} fill={ROSE} {...SH4} strokeWidth={6} />
    <rect x={14} y={92} width={92} height={34} fill="#FFD9DF" stroke={C.ink} strokeWidth={5} />
    <path d="M30 50 L30 80" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" opacity={0.7} />
  </svg>
);

/** Dispenser air panas mini */
const Dispenser: React.FC<{ w?: number }> = ({ w = 120 }) => (
  <svg width={w} height={w * (200 / 120)} viewBox="0 0 120 200" style={{ overflow: "visible", display: "block" }}>
    <path d="M30 6 L90 6 L96 62 L24 62 Z" fill="#BFE3F5" {...SH4} strokeWidth={6} />
    <rect x={10} y={60} width={100} height={134} rx={14} fill="#FFFFFF" {...SH4} strokeWidth={6} />
    <rect x={26} y={96} width={22} height={22} rx={5} fill={ROSE} {...SH4} />
    <rect x={72} y={96} width={22} height={22} rx={5} fill="#49B6E0" {...SH4} />
    <rect x={24} y={146} width={72} height={14} rx={5} fill="#9AA1AE" {...SH4} />
  </svg>
);

/** Pagar bayi (baby gate) */
const BabyGate: React.FC<{ w?: number }> = ({ w = 200 }) => (
  <svg width={w} height={w * (180 / 200)} viewBox="0 0 200 180" style={{ overflow: "visible", display: "block" }}>
    <rect x={6} y={10} width={188} height={20} rx={10} fill="#FFFFFF" {...SH4} strokeWidth={6} />
    <rect x={6} y={150} width={188} height={20} rx={10} fill="#FFFFFF" {...SH4} strokeWidth={6} />
    {[30, 62, 94, 126, 158].map((x) => (
      <rect key={x} x={x} y={28} width={14} height={124} rx={6} fill="#FFFFFF" {...SH4} strokeWidth={5} />
    ))}
    <circle cx={100} cy={20} r={8} fill={ROSE} stroke={C.ink} strokeWidth={4} />
  </svg>
);

/** Bola mainan */
const Ball: React.FC<{ size?: number }> = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 90 90" style={{ display: "block" }}>
    <circle cx={45} cy={45} r={38} fill="#FFB84D" {...SH4} strokeWidth={6} />
    <path d="M10 40 Q45 60 80 40" fill="none" stroke="#FFFFFF" strokeWidth={9} />
    <circle cx={45} cy={45} r={38} fill="none" {...SH4} strokeWidth={6} />
  </svg>
);

/** Kotak P3K */
const FirstAidKit: React.FC<{ w?: number }> = ({ w = 380 }) => (
  <svg width={w} height={w * (300 / 380)} viewBox="0 0 380 300" style={{ overflow: "visible", display: "block" }}>
    <path d="M130 70 L130 34 Q130 18 146 18 L234 18 Q250 18 250 34 L250 70" fill="none" stroke={C.ink} strokeWidth={22} strokeLinejoin="round" />
    <path d="M130 70 L130 34 Q130 18 146 18 L234 18 Q250 18 250 34 L250 70" fill="none" stroke="#FFFFFF" strokeWidth={9} strokeLinejoin="round" />
    <rect x={14} y={64} width={352} height={220} rx={34} fill="#FFFFFF" {...SH} strokeWidth={9} />
    <rect x={14} y={120} width={352} height={22} fill="#FFD9DF" />
    <rect x={150} y={118} width={80} height={140} rx={14} fill={ROSE} stroke={C.ink} strokeWidth={7} />
    <rect x={120} y={148} width={140} height={80} rx={14} fill={ROSE} stroke={C.ink} strokeWidth={7} />
    <rect x={157} y={152} width={66} height={72} fill={ROSE} />
    <rect x={14} y={64} width={352} height={220} rx={34} fill="none" {...SH} strokeWidth={9} />
  </svg>
);

/** Keran dengan air mengalir ke wastafel */
const Faucet: React.FC<{ flow: number }> = ({ flow }) => {
  const t = useT();
  return (
    <svg width={420} height={400} viewBox="0 0 420 400" style={{ overflow: "visible", display: "block" }}>
      <rect x={40} y={20} width={60} height={110} rx={12} fill="#AEB5C0" {...SH} />
      <path d="M70 60 L240 60 Q280 60 280 100 L280 120" fill="none" stroke={C.ink} strokeWidth={54} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M70 60 L240 60 Q280 60 280 100 L280 120" fill="none" stroke="#C9CED6" strokeWidth={38} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={140} y={12} width={70} height={26} rx={10} fill="#49B6E0" {...SH4} strokeWidth={6} />
      {/* aliran air */}
      <rect x={262} y={138} width={36} height={190 * flow} rx={18} fill="#9FD8F5" stroke="#49B6E0" strokeWidth={4} opacity={0.95} />
      {flow > 0.9 &&
        [0, 1, 2, 3].map((i) => {
          const p = (t * 1.6 + i / 4) % 1;
          return <rect key={i} x={272} y={150 + p * 160} width={10} height={26} rx={5} fill="#FFFFFF" opacity={0.85 * Math.sin(p * Math.PI)} />;
        })}
      {/* wastafel */}
      <path d="M100 300 L400 300 Q400 390 330 390 L170 390 Q100 390 100 300 Z" fill="#FFFFFF" {...SH} />
      <path d="M96 300 L404 300" stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
      {flow > 0.9 &&
        [0, 1, 2].map((i) => {
          const p = (t * 1.2 + i / 3) % 1;
          return <ellipse key={i} cx={280} cy={322} rx={20 + p * 70} ry={6 + p * 12} fill="none" stroke="#49B6E0" strokeWidth={5} opacity={1 - p} />;
        })}
    </svg>
  );
};

/** Timer melingkar 20:00 */
const Timer: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps, 11, 200);
  const sweep = interpolate(t, [at, at + 1.4], [0, 1], { ...clamp, easing: easeInOut });
  const r = 150;
  const L = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 380, height: 380, scale: String(interpolate(s, [0, 1], [0.4, 1])), opacity: interpolate(s, [0, 0.3], [0, 1], clamp) }}>
      <svg width={380} height={380} viewBox="0 0 380 380" style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={190} cy={190} r={176} fill="#FFFFFF" stroke={C.ink} strokeWidth={9} />
        <circle cx={190} cy={190} r={r} fill="none" stroke="#DCEFF8" strokeWidth={26} />
        <circle cx={190} cy={190} r={r} fill="none" stroke="#49B6E0" strokeWidth={26} strokeLinecap="round" strokeDasharray={`${L * sweep} ${L}`} transform="rotate(-90 190 190)" />
        <rect x={170} y={-10} width={40} height={26} rx={8} fill="#3A3F4B" stroke={C.ink} strokeWidth={5} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div style={{ fontFamily: HEAD, fontSize: 104, lineHeight: 1, color: C.ink, fontVariantNumeric: "tabular-nums" }}>20:00</div>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 36, color: DEEP, marginTop: 6 }}>±20 menit</div>
        </div>
      </div>
    </div>
  );
};

/** Es batu */
const IceCubes: React.FC = () => (
  <svg width={300} height={230} viewBox="0 0 300 230" style={{ overflow: "visible", display: "block" }}>
    {[
      [20, 90, -8],
      [150, 100, 7],
      [86, 10, 3],
    ].map(([x, y, r], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${r} 65 60)`}>
        <rect width={130} height={120} rx={22} fill="#DDF3FF" stroke={C.ink} strokeWidth={7} />
        <path d="M22 26 L56 26" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
        <path d="M22 44 L36 44" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
      </g>
    ))}
  </svg>
);

/** Tetes air sejuk */
const Drop: React.FC<{ w?: number }> = ({ w = 170 }) => (
  <svg width={w} height={w * (220 / 170)} viewBox="0 0 170 220" style={{ overflow: "visible", display: "block" }}>
    <path d="M85 10 C120 70 160 110 160 145 A75 75 0 0 1 10 145 C10 110 50 70 85 10 Z" fill="#9FD8F5" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    <path d="M46 140 Q46 112 66 96" fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
  </svg>
);

/** Tube odol */
const Toothpaste: React.FC = () => (
  <svg width={220} height={170} viewBox="0 0 220 170" style={{ overflow: "visible", display: "block" }}>
    <path d="M20 40 L150 30 L150 140 L20 130 Z" fill="#FFFFFF" {...SH} />
    <path d="M14 34 L14 136" stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
    <path d="M20 70 L150 64 L150 106 L20 100 Z" fill="#49B6E0" stroke={C.ink} strokeWidth={5} />
    <rect x={150} y={60} width={26} height={50} rx={6} fill="#D9DDE4" {...SH4} strokeWidth={6} />
    <rect x={176} y={66} width={30} height={38} rx={10} fill={ROSE} {...SH4} strokeWidth={6} />
  </svg>
);

/** Mentega */
const Butter: React.FC = () => (
  <svg width={220} height={170} viewBox="0 0 220 170" style={{ overflow: "visible", display: "block" }}>
    <ellipse cx={110} cy={130} rx={100} ry={28} fill="#FFFFFF" {...SH} />
    <path d="M40 120 L40 70 L150 50 L190 70 L190 116 L80 136 Z" fill="#FFE27A" {...SH} />
    <path d="M40 70 L80 88 L190 70 M80 88 L80 136" fill="none" {...SH} strokeWidth={6} />
  </svg>
);

/** Botol kecap */
const Soy: React.FC = () => (
  <svg width={140} height={220} viewBox="0 0 140 220" style={{ overflow: "visible", display: "block" }}>
    <rect x={50} y={4} width={40} height={30} rx={8} fill={ROSE} {...SH4} strokeWidth={6} />
    <path d="M54 32 L86 32 L86 60 Q124 76 124 112 L124 196 Q124 214 106 214 L34 214 Q16 214 16 196 L16 112 Q16 76 54 60 Z" fill="#5A3324" {...SH} />
    <rect x={22} y={120} width={96} height={56} rx={10} fill="#FFE08A" stroke={C.ink} strokeWidth={5} />
    <text x={70} y={158} textAnchor="middle" fontFamily="LilitaOne" fontSize={26} fill={C.ink}>
      KECAP
    </text>
  </svg>
);

/** Kaos */
const Shirt: React.FC = () => (
  <svg width={200} height={180} viewBox="0 0 200 180" style={{ overflow: "visible", display: "block" }}>
    <path d="M70 14 Q100 38 130 14 L186 40 L166 86 L144 78 L144 168 L56 168 L56 78 L34 86 L14 40 Z" fill="#6FB3E0" {...SH} />
    <path d="M70 14 Q100 38 130 14" fill="none" {...SH} strokeWidth={6} />
  </svg>
);

/** Cincin */
const Ring: React.FC = () => (
  <svg width={170} height={170} viewBox="0 0 170 170" style={{ overflow: "visible", display: "block" }}>
    <circle cx={85} cy={104} r={56} fill="none" stroke={C.ink} strokeWidth={30} />
    <circle cx={85} cy={104} r={56} fill="none" stroke="#FFD23F" strokeWidth={16} />
    <path d="M60 46 L85 18 L110 46 L85 62 Z" fill="#BFE3F5" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

/** Jam tangan */
const Watch: React.FC = () => (
  <svg width={150} height={190} viewBox="0 0 150 190" style={{ overflow: "visible", display: "block" }}>
    <rect x={50} y={6} width={50} height={178} rx={16} fill="#A8714C" {...SH} />
    <circle cx={75} cy={95} r={52} fill="#FFFFFF" {...SH} />
    <path d="M75 95 L75 66 M75 95 L96 106" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
  </svg>
);

/** Kain bersih terlipat */
const Cloth: React.FC = () => (
  <svg width={380} height={260} viewBox="0 0 380 260" style={{ overflow: "visible", display: "block" }}>
    <path d="M30 120 L190 60 L350 120 L190 180 Z" fill="#FFFFFF" {...SH} />
    <path d="M30 120 L30 160 L190 220 L350 160 L350 120" fill="#F2F7FA" {...SH} />
    <path d="M30 140 L190 200 L350 140" fill="none" stroke="#BFE3F5" strokeWidth={8} />
    <path d="M110 90 L270 150" stroke="#BFE3F5" strokeWidth={8} strokeLinecap="round" />
  </svg>
);

/** Klinik */
const Clinic: React.FC = () => (
  <svg width={420} height={470} viewBox="0 0 420 470" style={{ overflow: "visible", display: "block" }}>
    <rect x={20} y={90} width={380} height={370} rx={14} fill="#FFFFFF" {...SH} />
    <rect x={120} y={20} width={180} height={90} rx={14} fill="#FFFFFF" {...SH} />
    <rect x={180} y={30} width={60} height={64} rx={8} fill={ROSE} stroke={C.ink} strokeWidth={5} />
    <path d="M210 42 L210 82 M190 62 L230 62" stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" />
    <rect x={90} y={130} width={240} height={70} rx={12} fill={ROSE} stroke={C.ink} strokeWidth={6} />
    <text x={210} y={182} textAnchor="middle" fontFamily="LilitaOne" fontSize={50} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} paintOrder="stroke">
      DOKTER
    </text>
    {[50, 160, 270].map((x) => (
      <rect key={x} x={x + 12} y={230} width={76} height={70} rx={8} fill="#CFEAF5" stroke={C.ink} strokeWidth={5} />
    ))}
    <rect x={150} y={330} width={120} height={130} rx={8} fill="#BFE6EF" stroke={C.ink} strokeWidth={6} />
    <path d="M210 334 L210 456" stroke={C.ink} strokeWidth={5} />
  </svg>
);

/** Telapak tangan (ukuran patokan) */
const Palm: React.FC<{ w?: number }> = ({ w = 90 }) => (
  <svg width={w} height={w} viewBox="0 0 100 100" style={{ display: "block", flex: "none" }}>
    <path d="M28 92 Q14 70 16 52 L18 36 Q20 28 27 30 Q32 32 32 40 L32 22 Q32 14 39 14 Q46 14 46 22 L46 14 Q46 6 53 6 Q60 6 60 14 L60 20 Q60 12 67 12 Q74 12 74 20 L74 50 L80 40 Q86 32 92 38 Q96 44 90 54 L74 82 Q66 94 52 94 Z" fill="#C98B5E" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

/** Langkah: kartu ikon + judul + sub, opsional nomor & lencana */
const RuleCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  sub?: string;
  subAt?: number;
  at: number;
  y: number;
  color: string;
  bg?: string;
  n?: number;
  mark?: "ok" | "no";
  markAt?: number;
  next?: number;
  h?: number;
  titleSize?: number;
}> = ({ icon, title, sub, subAt, at, y, color, bg = SOFT, n, mark, markAt, next, h = 190, titleSize }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps);
  const subO = subAt === undefined ? 1 : interpolate(t, [subAt, subAt + 0.25], [0, 1], clamp);
  const active = next === undefined ? true : t < next;
  const mAt = markAt ?? at + 0.35;
  const ms = pop(t, mAt, fps, 9, 230);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        width: 960,
        top: y,
        minHeight: h,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "20px 30px 20px 34px",
        borderRadius: 36,
        background: active ? bg : "#FFFBF8",
        border: `7px solid ${C.ink}`,
        boxShadow: `0 10px 0 ${C.ink}`,
        translate: `${interpolate(s, [0, 1], [-1000, 0])}px 0px`,
        scale: active ? String(1 + 0.01 * Math.sin((t - at) * 7)) : "0.97",
        opacity: active ? 1 : 0.9,
      }}
    >
      <div style={{ position: "relative", flex: "none", width: 124, height: 124, boxSizing: "border-box", borderRadius: 30, background: color, border: `6px solid ${C.ink}`, display: "grid", placeItems: "center", fontSize: 66, lineHeight: 1 }}>
        {icon}
        {n !== undefined && (
          <div style={{ position: "absolute", left: -28, top: -28, width: 58, height: 58, boxSizing: "border-box", borderRadius: "50%", background: ROSE, border: `5px solid ${C.ink}`, display: "grid", placeItems: "center", fontFamily: HEAD, fontSize: 34, color: C.white, WebkitTextStroke: `6px ${C.ink}`, paintOrder: "stroke fill" }}>{n}</div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: HEAD, fontSize: titleSize ?? (title.length > 22 ? 46 : 54), lineHeight: 1.02, color: C.ink, whiteSpace: "pre-line" }}>{title}</div>
        {sub && <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 33, color: DEEP, marginTop: 8, lineHeight: 1.12, opacity: subO }}>{sub}</div>}
      </div>
      {mark && t >= mAt - 0.02 && (
        <div style={{ flex: "none", scale: String(interpolate(ms, [0, 1], [2, 1])), opacity: interpolate(ms, [0, 0.25], [0, 1], clamp) }}>{mark === "ok" ? <Check size={76} /> : <Cross size={76} />}</div>
      )}
    </div>
  );
};

/** Ilustrasi item + label + lencana */
const Item: React.FC<{ at: number; x: number; y: number; label: string; markAt: number; kind: "ok" | "no"; children: React.ReactNode; w?: number }> = ({ at, x, y, label, markAt, kind, children, w = 280 }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps, 11, 210);
  const dimmed = kind === "no" && t >= markAt ? 0.55 : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: "center", scale: String(interpolate(s, [0, 1], [0.4, 1])), opacity: interpolate(s, [0, 0.3], [0, 1], clamp) }}>
      <div style={{ height: 230, display: "flex", alignItems: "flex-end", justifyContent: "center", opacity: dimmed, filter: dimmed < 1 ? "grayscale(0.5)" : undefined }}>{children}</div>
      <div style={{ marginTop: 14, fontFamily: HEAD, fontSize: 46, color: C.ink }}>{label}</div>
      <PopMark at={markAt} x={w / 2 - 50} y={70} kind={kind} size={100} />
    </div>
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
          <div key={i} style={{ position: "absolute", left: 90 + i * 160 + Math.sin(t * 1.5 + i) * 30, top: 1060 - p * 640, fontSize: 44 + (i % 3) * 14, opacity: Math.sin(p * Math.PI) * 0.85 * interpolate(t, [at, at + 0.5], [0, 1], clamp) }}>
            💛
          </div>
        );
      })}
    </>
  );
};

/** Konfeti perayaan */
const Confetti: React.FC<{ at: number; x?: number; y?: number; n?: number }> = ({ at, x = 540, y = 640, n = 40 }) => {
  const t = useT();
  const dt = t - at;
  if (dt < 0 || dt > 3) return null;
  const cols = [ROSE, "#FFD23F", MINT, "#49B6E0", "#F2A65A", "#B48CF2"];
  const k = 2.6;
  const d = (1 - Math.exp(-k * dt)) / k;
  const o = interpolate(dt, [2.2, 3.0], [1, 0], clamp);
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const ang = -Math.PI / 2 + (random(`c15a${i}`) - 0.5) * 2.8;
        const sp = 650 + random(`c15s${i}`) * 600;
        const px = x + Math.cos(ang) * sp * d + Math.sin(dt * 3 + i) * 14;
        const py = y + Math.sin(ang) * sp * d + 260 * dt * dt;
        return <div key={i} style={{ position: "absolute", left: px, top: py, width: 18, height: 30, borderRadius: 5, background: cols[i % cols.length], border: `3px solid ${C.ink}`, rotate: `${random(`c15r${i}`) * 360 + dt * (200 + random(`c15w${i}`) * 300)}deg`, opacity: o }} />;
      })}
    </>
  );
};

/* ----------------------------------------------------------------- adegan */
const Ep15Scenes: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const shake = useShake([{ t: 14.43, a: 6 }]);

  // 1 — tangan mungil mendekat lalu berhenti (tidak menyentuh)
  const handX = interpolate(t, [2.3, 5.1], [-300, 150], { ...clamp, easing: easeInOut }) + (t > 5.1 ? 4 * Math.sin((t - 5.1) * 5) : 0);
  const ring1 = pop(t, 1.0, fps, 11, 200);
  const zoom1 = interpolate(t, [4.15, 4.8], [1.3, 1.75], { ...clamp, easing: easeInOut });
  // 2a — pin Ponorogo
  const pinS = pop(t, 6.9, fps, 10, 170);
  const warm2 = interpolate(t, [7.6, 8.8], [0, 1], { ...clamp, easing: easeInOut });
  // 3b — gagang diputar ke dalam, Si Halus kabur
  const turn3 = interpolate(t, [17.8, 18.85], [0, 1], { ...clamp, easing: easeInOut });
  const hit3 = pop(t, 18.9, fps, 10, 160);
  const labelS = pop(t, 18.9, fps, 12, 260);
  // 4b — perisai
  const shield4 = pop(t, 22.7, fps, 11, 170);
  // 5a — centang besar
  const big5 = pop(t, 25.95, fps, 10, 200);
  // 6 — ikon kartu 1 berputar
  const turn6 = interpolate(t, [32.5, 33.1], [0, 1], { ...clamp, easing: easeInOut });
  // 7a — kotak P3K
  const kit7 = pop(t, 38.5, fps, 11, 180);
  // 7b — aliran air
  const flow7 = interpolate(t, [40.9, 41.3], [0, 1], clamp);
  // 8 — penutup hangat
  const glow8 = interpolate(t, [59.7, 61.8], [0.25, 1], { ...clamp, easing: easeInOut });

  return (
    <AbsoluteFill style={{ translate: shake }}>
      {/* 1a — buat si kecil, gagang panci kayak mainan */}
      <Scene a={0} b={4.15} zoom={false}>
        <Kitchen>
          <div style={{ position: "absolute", left: 470, top: 238 }}>
            <Pot w={420} t={t} toy={interpolate(t, [0.9, 1.5], [0, 1], clamp)} />
          </div>
          {t >= 0.95 && (
            <div
              style={{
                position: "absolute",
                left: 500 - 150,
                top: 380 - 95,
                width: 300,
                height: 190,
                boxSizing: "border-box",
                borderRadius: "50%",
                border: `9px dashed ${ROSE}`,
                rotate: `${t * 30}deg`,
                scale: String(interpolate(ring1, [0, 1], [1.8, 1]) * (1 + 0.04 * Math.sin(t * 8))),
                opacity: interpolate(ring1, [0, 0.3], [0, 1], clamp),
              }}
            />
          )}
          <Glint x={450} y={330} at={1.3} />
          <Glint x={570} y={425} s={0.7} at={1.5} ph={2} />
          <Glint x={640} y={335} s={0.55} at={1.7} ph={4} />
          <div style={{ position: "absolute", left: handX, top: 318, opacity: 0.92 }}>
            <LittleHand w={250} />
          </div>
        </Kitchen>
        <CPop at={0.25} y={330}>
          <Tag bg="#FFFFFF" size={42} rot={-2}>
            buat si kecil: kayak mainan 🧸
          </Tag>
        </CPop>
        <Pop at={2.62} x={330} y={1040}>
          <Tag bg="#FFE3E3" size={38} rot={2}>
            gagang nongol di pinggir 👀
          </Tag>
        </Pop>
      </Scene>

      {/* 1b — pengen dipegang, pengen ditarik… lalu berhenti */}
      <Scene a={4.15} b={5.88}>
        <Kitchen zoom={zoom1} zx={400} zy={390}>
          <div style={{ position: "absolute", left: 470, top: 238 }}>
            <Pot w={420} t={t} toy={1} />
          </div>
          <Glint x={450} y={335} s={0.8} />
          <Glint x={570} y={425} s={0.6} ph={2} />
          <div style={{ position: "absolute", left: handX, top: 318, opacity: 0.92 }}>
            <LittleHand w={250} />
          </div>
        </Kitchen>
        <Pop at={4.2} x={70} y={340}>
          <Tag bg="#FFFFFF" size={42} rot={-3}>
            pengen dipegang…
          </Tag>
        </Pop>
        <Pop at={5.07} x={500} y={1040}>
          <Tag bg="#FFFFFF" size={42} rot={3}>
            pengen ditarik…
          </Tag>
        </Pop>
      </Scene>

      {/* 2a — Ponorogo, disebut lembut */}
      <Scene a={5.88} b={9.05}>
        <Sky>
          <div style={{ position: "absolute", left: 240, top: 290 }}>
            <House warm={warm2} />
          </div>
          {t >= 6.86 && (
            <div style={{ position: "absolute", left: 455, top: interpolate(pinS, [0, 1], [-160, 180]) }}>
              <MapPin />
            </div>
          )}
        </Sky>
        <Pop at={6.92} x={70} y={340}>
          <Tag bg="#FFFFFF" size={44} rot={-3}>
            📍 Ponorogo
          </Tag>
        </Pop>
        <CPop at={7.6} y={1060}>
          <Tag bg="#FFF3D6" size={38} rot={-1}>
            💛 kejadian panci air panas
          </Tag>
        </CPop>
      </Scene>

      {/* 2b — dari situ kita semua belajar: dapur perlu sedikit diatur */}
      <Scene a={9.05} b={11.84}>
        <Kitchen glow={0.45}>
          <div style={{ position: "absolute", left: 470, top: 238 }}>
            <Pot w={420} t={t} />
          </div>
          <div style={{ position: "absolute", left: 880, top: 296 }}>
            <Thermos w={70} />
          </div>
          <div style={{ position: "absolute", left: 30, top: 250 }}>
            <Worker size={340} pose="point" expr="happy" {...IBU} seed={15} />
          </div>
          {[
            { x: 500, y: 380, at: 10.74 },
            { x: 915, y: 360, at: 11.0 },
            { x: 330, y: 760, at: 11.34 },
          ].map((p, i) => {
            if (t < p.at - 0.05) return null;
            const s = pop(t, p.at, fps, 9, 220);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: p.x - 70,
                  top: p.y - 70,
                  width: 140,
                  height: 140,
                  boxSizing: "border-box",
                  borderRadius: "50%",
                  border: `8px dashed ${ROSE}`,
                  rotate: `${t * 40 + i * 30}deg`,
                  scale: String(interpolate(s, [0, 1], [2, 1])),
                  opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
                }}
              />
            );
          })}
        </Kitchen>
        <Sticker at={9.1} y={330} bg="#FFF3D6" color={C.ink} size={52} rotate={-2}>
          {"BIKIN KITA SEMUA BELAJAR 💛"}
        </Sticker>
        <Sticker at={10.49} y={1045} bg="#FFFFFF" color={C.ink} size={48} rotate={2}>
          {"DAPUR PERLU SEDIKIT DIATUR 🛠️"}
        </Sticker>
      </Scene>

      {/* 3a — Si Halus: Air Panas */}
      <Scene a={11.84} b={15.05}>
        <Kitchen dim={0.16}>
          <div style={{ position: "absolute", left: 470, top: 238, opacity: 0.6 }}>
            <Pot w={420} t={t} />
          </div>
        </Kitchen>
        <Scanner at={12.0} dur={0.9} top={430} height={700}>
          <div style={{ position: "absolute", left: 330, top: 480 }}>
            <SiHalus size={420} variant="steam" mood="laugh" />
          </div>
        </Scanner>
        <Pop at={13.37} x={80} y={1040}>
          <Tag bg="#FFFFFF" size={38} rot={-2}>
            paling deket sama dapur kita 🏠
          </Tag>
        </Pop>
        <Sticker at={14.43} y={340} bg={ROSE} color={C.white} size={60} rotate={-3}>
          {"SI HALUS: AIR PANAS ♨️"}
        </Sticker>
      </Scene>

      {/* 3b — tenang, gampang dikalahin: gagang panci ke dalam */}
      <Scene a={15.05} b={19.34}>
        <Sticker at={15.1} y={310} bg="#FFF3D6" color={C.ink} size={54} rotate={-2}>
          {"TENANG, GAMPANG DIKALAHIN 💪"}
        </Sticker>
        <Panel y={450} h={520} at={15.2} bg="#FFF8F3">
          <div style={{ position: "absolute", left: 24, top: 18 }}>
            <PotTop w={500} handle={turn3} t={t} />
          </div>
          {t > 17.75 && t < 19.0 && (
            <svg width={200} height={200} viewBox="0 0 200 200" style={{ position: "absolute", left: 270, top: 330, opacity: interpolate(t, [17.75, 17.9, 18.8, 19.0], [0, 1, 1, 0], clamp) }}>
              <path d="M40 120 Q120 140 150 60" fill="none" stroke={MINT} strokeWidth={14} strokeLinecap="round" />
              <path d="M128 66 L152 52 L162 80" fill="none" stroke={MINT} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <div
            style={{
              position: "absolute",
              left: 570 + 140 * hit3,
              top: 70 - 40 * hit3,
              scale: String(1 - 0.25 * hit3),
              rotate: `${14 * hit3}deg`,
              translate: `${t > 18.9 ? Math.sin(t * 40) * 3 : 0}px 0px`,
            }}
          >
            <SiHalus size={330} variant="steam" mood={t < 16.92 ? "laugh" : t < 18.9 ? "scared" : "busted"} />
          </div>
          {t > 19.0 && <div style={{ position: "absolute", left: 830, top: 40, fontSize: 60, opacity: 0.6 + 0.4 * Math.sin(t * 6) }}>💦</div>}
        </Panel>
        {t >= 18.85 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1010, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "14px 36px 16px 30px",
                background: "#FFFFFF",
                border: `8px solid ${C.ink}`,
                borderRadius: 30,
                boxShadow: `0 12px 0 ${C.ink}`,
                rotate: `${interpolate(labelS, [0, 1], [-18, -3])}deg`,
                scale: String(interpolate(labelS, [0, 1], [2.2, 1])),
                opacity: interpolate(labelS, [0, 0.25], [0, 1], clamp),
              }}
            >
              <div style={{ fontFamily: HEAD, fontSize: 66, color: C.ink, lineHeight: 1 }}>GAGANG KE DALAM</div>
              <Check size={76} />
            </div>
          </div>
        )}
      </Scene>

      {/* 4a — kulit anak lebih tipis */}
      <Scene a={19.34} b={21.62}>
        <Sticker at={19.4} y={300} bg="#FFF3D6" color={C.ink} size={54} rotate={-2}>
          {"KULIT ANAK LEBIH TIPIS"}
        </Sticker>
        <SkinCol x={610} label="ANAK" layers={2} at={19.6} emoji="👶" />
        <SkinCol x={70} label="DEWASA" layers={4} at={20.6} emoji="🧑" />
        <Pop at={20.2} x={690} y={880}>
          <Tag bg="#FFE3E3" size={36} rot={3}>
            lebih tipis
          </Tag>
        </Pop>
      </Scene>

      {/* 4b — butuh perlindungan ekstra dari kita */}
      <Scene a={21.62} b={24.71}>
        <Kitchen counter={false} wall="#FDF1EA" glow={0.6}>
          {t >= 22.65 && (
            <div style={{ position: "absolute", left: 290, top: 60, scale: String(interpolate(shield4, [0, 1], [0.3, 1])), opacity: interpolate(shield4, [0, 0.3], [0, 0.95], clamp) }}>
              <Shield w={420} />
            </div>
          )}
          <div style={{ position: "absolute", left: 110, top: 200 }}>
            <Worker size={440} pose="idle" expr="happy" {...IBU} seed={15} />
          </div>
          <div style={{ position: "absolute", left: 560, top: 380 }}>
            <Worker size={290} pose="wave" expr="happy" {...ANAK} seed={14} flip />
          </div>
        </Kitchen>
        <CPop at={21.66} y={1060}>
          <Tag bg="#FFFFFF" size={40} rot={-2}>
            makanya si kecil butuh kita 💛
          </Tag>
        </CPop>
        <Sticker at={22.7} y={320} bg="#FFF3D6" color={C.ink} size={52} rotate={-2}>
          {"BUTUH PERLINDUNGAN EKSTRA 🛡️"}
        </Sticker>
      </Scene>

      {/* 5a — kabar baiknya: sebagian besar bisa dicegah (WHO) */}
      <Scene a={24.71} b={27.88}>
        <Sticker at={24.75} y={310} bg="#FFE27A" color={C.ink} size={64} rotate={-3}>
          {"KABAR BAIKNYA 🌟"}
        </Sticker>
        <CPop at={25.48} y={470}>
          <Tag bg="#FFFFFF" size={40} rot={-1}>
            🌍 kata WHO:
          </Tag>
        </CPop>
        <Panel y={590} h={420} at={25.9} bg="#F2FBF4">
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 40, padding: "0 50px" }}>
            <div style={{ flex: "none", scale: String(interpolate(big5, [0, 1], [0.3, 1]) * (1 + 0.03 * Math.sin(t * 5))), rotate: `${interpolate(big5, [0, 1], [-30, 0])}deg` }}>
              <Check size={230} />
            </div>
            <div>
              <div style={{ fontFamily: HEAD, fontSize: 74, lineHeight: 1, color: C.ink }}>
                SEBAGIAN BESAR
                <br />
                LUKA BAKAR
              </div>
              <div style={{ fontFamily: HEAD, fontSize: 84, lineHeight: 1.05, color: MINT, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill", marginTop: 10, opacity: interpolate(t, [27.1, 27.35], [0, 1], clamp) }}>BISA DICEGAH</div>
            </div>
          </div>
        </Panel>
        <Source y={1110}>sumber: WHO, Burns fact sheet</Source>
      </Scene>

      {/* 5b — kebanyakan di rumah: kita yang pegang kendali */}
      <Scene a={27.88} b={30.99}>
        <Sky>
          <div style={{ position: "absolute", left: 410, top: 300 }}>
            <House warm={1} />
          </div>
          <div style={{ position: "absolute", left: 40, top: 225 }}>
            <Worker size={380} pose="point" expr="happy" {...IBU} seed={15} />
          </div>
        </Sky>
        <CPop at={27.9} y={330}>
          <Tag bg="#FFFFFF" size={40} rot={-2}>
            kebanyakan kejadiannya di rumah
          </Tag>
        </CPop>
        <Sticker at={29.59} y={1035} bg="#FFF3D6" color={C.ink} size={54} rotate={-2}>
          {"KITA YANG PEGANG KENDALI 🏠"}
        </Sticker>
        <Source y={1146}>sumber: WHO, Burns fact sheet</Source>
      </Scene>

      {/* 6 — biasain 3 hal ini (kartu simpan) */}
      <Scene a={30.99} b={38.2}>
        <Sticker at={31.0} y={290} bg={ROSE} color={C.white} size={56} rotate={-2}>
          {"BIASAIN 3 HAL INI 👇"}
        </Sticker>
        {[
          { y: 430, at: 31.32 },
          { y: 650, at: 31.52 },
          { y: 895, at: 31.68 },
        ].map((p, i) => {
          if (t < p.at - 0.05) return null;
          const s = pop(t, p.at, fps, 11, 220);
          return (
            <div key={i} style={{ position: "absolute", left: 60, top: p.y, width: 960, height: 190, boxSizing: "border-box", borderRadius: 36, border: `7px dashed ${ROSE}`, background: "rgba(255,240,236,0.6)", display: "flex", alignItems: "center", gap: 30, padding: "0 40px", scale: String(interpolate(s, [0, 1], [0.6, 1])), opacity: interpolate(s, [0, 0.3], [0, 1], clamp) }}>
              <div style={{ width: 90, height: 90, borderRadius: "50%", background: ROSE, border: `6px solid ${C.ink}`, display: "grid", placeItems: "center", fontFamily: HEAD, fontSize: 52, color: C.white, WebkitTextStroke: `6px ${C.ink}`, paintOrder: "stroke fill" }}>{i + 1}</div>
              <div style={{ flex: 1, height: 26, borderRadius: 13, background: "#F6D3D3" }} />
            </div>
          );
        })}
        <RuleCard n={1} icon={<PotTop w={104} handle={turn6} t={t} edge={false} />} title="GAGANG PANCI KE DALAM" sub="jangan nongol di pinggir kompor" at={32.0} next={33.43} y={430} color="#FFE3DC" mark="ok" markAt={33.0} />
        <RuleCard
          n={2}
          icon={
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
              <Thermos w={46} />
              <Dispenser w={46} />
            </div>
          }
          title={"TERMOS & DISPENSER\nDI TEMPAT TINGGI"}
          sub="jauh dari jangkauan si kecil"
          at={33.43}
          next={36.12}
          y={650}
          color="#DCEFF8"
          mark="ok"
          markAt={35.75}
          titleSize={44}
        />
        <RuleCard n={3} icon={<BabyGate w={96} />} title="SI KECIL MAIN DI LUAR DAPUR" sub="pas kita lagi masak" at={36.12} y={895} color="#FFF3C4" mark="ok" markAt={37.73} />
        <CPop at={37.0} y={1100}>
          <Tag bg="#FFF3D6" size={34} rot={-2}>
            📌 simpan video ini
          </Tag>
        </CPop>
      </Scene>

      {/* 7a — kalau terlanjur kena: simpan langkah ini */}
      <Scene a={38.2} b={40.42}>
        <Sticker at={38.22} y={300} bg="#FFF3D6" color={C.ink} size={56} rotate={-2}>
          {"KALAU TERLANJUR KENA,\nSIMPAN INI 🚑"}
        </Sticker>
        {t >= 38.45 && (
          <div style={{ position: "absolute", left: 540 - 210, top: 540, scale: String(interpolate(kit7, [0, 1], [0.3, 1])), opacity: interpolate(kit7, [0, 0.3], [0, 1], clamp), translate: `0px ${6 * Math.sin(t * 3)}px` }}>
            <FirstAidKit w={420} />
          </div>
        )}
        <CPop at={39.2} y={1000}>
          <Tag bg="#FFFFFF" size={40} rot={-2}>
            tenang, ikutin urutannya 👇
          </Tag>
        </CPop>
      </Scene>

      {/* 7b — air mengalir sejuk ±20 menit */}
      <Scene a={40.42} b={43.39}>
        <RuleCard n={1} icon="💧" title="AIR MENGALIR SEJUK" sub="siram kira-kira 20 menit" at={40.45} y={310} color="#DCEFF8" mark="ok" markAt={41.67} />
        <Panel y={560} h={520} at={40.7} bg="#F4FAFD">
          <div style={{ position: "absolute", left: 20, top: 60 }}>
            <Faucet flow={flow7} />
          </div>
          <div style={{ position: "absolute", left: 520, top: 60 }}>
            <Timer at={42.45} />
          </div>
        </Panel>
      </Scene>

      {/* 7c — bukan es */}
      <Scene a={43.39} b={46.25}>
        <RuleCard n={2} icon="🧊" title="BUKAN ES" sub="terlalu dingin buat kulit yang lagi luka" subAt={44.15} at={43.42} y={310} color="#FFE3DC" bg="#FFF1EE" mark="no" markAt={43.89} />
        <Panel y={600} h={470} at={43.6} bg="#FFFAF6">
          <div style={{ position: "absolute", left: 70, top: 70 }}>
            <IceCubes />
          </div>
          <div style={{ position: "absolute", left: 150, top: 120 }}>
            <PopMark at={43.89} x={0} y={0} kind="no" size={140} />
          </div>
          <div style={{ position: "absolute", left: 110, top: 340, width: 260, textAlign: "center", fontFamily: HEAD, fontSize: 48, color: C.ink }}>es batu</div>
          <div style={{ position: "absolute", left: 470, top: 30, bottom: 30, width: 6, borderRadius: 3, background: "#EBCFC4" }} />
          <div style={{ position: "absolute", left: 610, top: 70 }}>
            <Drop w={170} />
          </div>
          <PopMark at={44.75} x={720} y={60} kind="ok" size={90} />
          <div style={{ position: "absolute", left: 520, top: 340, width: 360, textAlign: "center", fontFamily: HEAD, fontSize: 48, color: C.ink }}>air sejuk biasa</div>
        </Panel>
      </Scene>

      {/* 7d — skip odol, mentega, kecap */}
      <Scene a={46.25} b={50.8}>
        <RuleCard n={3} icon="🙅" title="SKIP ODOL, MENTEGA, KECAP" sub="malah nahan panas & bikin lukanya kotor" subAt={48.21} at={46.28} y={310} color="#FFE3DC" bg="#FFF1EE" mark="no" markAt={47.83} />
        <Panel y={600} h={470} at={46.4} bg="#FFFAF6">
          <Item at={46.45} x={30} y={60} label="odol" markAt={46.6} kind="no">
            <Toothpaste />
          </Item>
          <Item at={46.75} x={330} y={60} label="mentega" markAt={47.0} kind="no">
            <Butter />
          </Item>
          <Item at={47.3} x={630} y={60} label="kecap" markAt={47.55} kind="no">
            <Soy />
          </Item>
        </Panel>
      </Scene>

      {/* 7e — lepas baju & perhiasan, kecuali yang udah nempel */}
      <Scene a={50.8} b={54.49}>
        <RuleCard n={4} icon="💍" title="LEPAS BAJU & PERHIASAN" sub="di sekitar area yang kena" at={50.83} y={310} color="#FFF3C4" mark="ok" markAt={52.16} />
        <Panel y={560} h={400} at={51.0} bg="#FFFAF6">
          <Item at={51.08} x={30} y={40} label="baju" markAt={51.3} kind="ok">
            <Shirt />
          </Item>
          <Item at={51.55} x={330} y={40} label="cincin" markAt={51.8} kind="ok">
            <Ring />
          </Item>
          <Item at={51.9} x={630} y={40} label="jam / gelang" markAt={52.1} kind="ok">
            <Watch />
          </Item>
        </Panel>
        <CPop at={52.85} y={1005}>
          <Tag bg="#FFE3E3" size={38} rot={-2}>
            ✋ kecuali yang udah nempel: biarin aja
          </Tag>
        </CPop>
      </Scene>

      {/* 7f — tutup kain bersih */}
      <Scene a={54.49} b={55.73}>
        <RuleCard n={5} icon="🧺" title="TUTUP PAKAI KAIN BERSIH" sub="tutup longgar aja" at={54.5} y={310} color="#F3E6DC" mark="ok" markAt={55.05} />
        <Panel y={580} h={460} at={54.6} bg="#F4FAFD">
          <div style={{ position: "absolute", left: 270, top: 90 }}>
            <Cloth />
          </div>
          <Glint x={300} y={110} at={54.9} />
          <Glint x={660} y={150} s={0.7} at={55.0} ph={2} />
          <Glint x={610} y={360} s={0.6} at={55.1} ph={4} />
        </Panel>
      </Scene>

      {/* 7g — terus ke dokter */}
      <Scene a={55.73} b={59.7}>
        <RuleCard n={6} icon="🏥" title="TERUS KE DOKTER" sub="apalagi kalau lukanya…" at={55.76} y={310} color="#DDF3E6" mark="ok" markAt={56.12} />
        <Panel y={560} h={540} at={55.95} bg="#F2FBF4">
          <div style={{ position: "absolute", left: 20, top: 40, scale: "0.95", transformOrigin: "0 0" }}>
            <Clinic />
          </div>
          {[
            { at: 57.43, icon: <Palm w={86} />, text: "lebih besar dari telapak tangan", y: 90 },
            { at: 59.01, icon: <div style={{ fontSize: 70, lineHeight: 1 }}>🙂</div>, text: "kena wajah", y: 300 },
          ].map((c, i) => {
            if (t < c.at - 0.05) return null;
            const s = pop(t, c.at, fps, 12, 200);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 450,
                  top: c.y,
                  width: 460,
                  minHeight: 170,
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "14px 22px",
                  background: "#FFFFFF",
                  border: `6px solid ${C.ink}`,
                  borderRadius: 28,
                  boxShadow: `0 8px 0 ${C.ink}`,
                  translate: `${interpolate(s, [0, 1], [600, 0])}px 0px`,
                }}
              >
                {c.icon}
                <div style={{ fontFamily: HEAD, fontSize: 44, lineHeight: 1.05, color: C.ink }}>{c.text}</div>
              </div>
            );
          })}
        </Panel>
      </Scene>

      {/* 8 — penutup hangat: dapur yang ikut jagain */}
      <Scene a={59.7} b={EP15.endStart}>
        <Kitchen glow={glow8} door>
          <div style={{ position: "absolute", left: 540, top: 250 }}>
            <Pot w={380} handle={1} t={t} steam={0.7} />
          </div>
          <div style={{ position: "absolute", left: 340, top: 285 }}>
            <Worker size={400} pose="holdTool" expr="happy" {...IBU} seed={15} />
          </div>
          <div style={{ position: "absolute", left: 10, top: 440 }}>
            <Worker size={250} pose="wave" expr="happy" {...ANAK} seed={14} />
          </div>
          <div style={{ position: "absolute", left: 190, top: 730, rotate: `${t * 60}deg` }}>
            <Ball size={70} />
          </div>
          <div style={{ position: "absolute", left: 268, top: 640 }}>
            <BabyGate w={150} />
          </div>
          <PopMark at={60.6} x={880} y={260} kind="ok" size={80} />
        </Kitchen>
        <FloatHearts at={61.4} />
        <CPop at={59.72} y={330} out={61.25}>
          <Tag bg="#FFFFFF" size={38} rot={-2}>
            kita nggak harus jagain anak tiap detik
          </Tag>
        </CPop>
        <Sticker at={61.95} y={1040} bg="#FFF3D6" color={C.ink} size={54} rotate={-2} out={63.45}>
          {"DAPUR YANG IKUT JAGAIN 💛"}
        </Sticker>
        <Sticker at={63.67} y={1040} bg="#FFE27A" color={C.ink} size={58} rotate={-3}>
          {"KAMU UDAH KEREN BANGET 🌟"}
        </Sticker>
        <Confetti at={63.9} y={760} n={36} />
      </Scene>
    </AbsoluteFill>
  );
};

const W = warp.length ? warp : undefined;

export const Ep15: React.FC = () => (
  <Episode ep={15} accent="#E0566F" tint="#F3C1C8" words={words} endStart={W ? warpOldToNew(EP15.endStart, W) : EP15.endStart} revealAt={W ? warpOldToNew(EP15.revealAt, W) : EP15.revealAt} warp={W} flashes={[14.43]}>
    <Ep15Scenes />
  </Episode>
);
