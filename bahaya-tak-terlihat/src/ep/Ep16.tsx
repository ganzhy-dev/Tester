import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode, warpOldToNew } from "../Episode";
import { Pop, Scanner, Sticker, useShake } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep16.words";
import { warp } from "./ep16.warp";

/**
 * EP16 "Salad Licik" — versi MENYEMANGATI: sayurnya nggak salah, kuncinya kebersihan.
 * Semua waktu = detik isi utama (data/ep16_words.json, tanpa warp). Tema HANGAT (hijau-krem) — teks gelap di latar terang.
 * Kisah Enzy Storia hanya disebut lewat teks + ikon netral (salad, rumah sakit) — tanpa wajah/karikatur.
 * endStart = jeda sesudah "…kamu udah hebat." (84.72) sebelum "Follow" (85.24); revealAt = "jadi" (87.84).
 */
export const EP16 = { endStart: 85.05, revealAt: 87.84 };

const GREEN = "#3FA34D";
const DEEP = "#2F5B36"; // teks sekunder hijau tua
const SOFT = "#EEF8EA";
const MINT = "#3FAE5A";
const CORAL = "#E8604C";
const GOLD = "#FFD86B";
const SH = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const SH4 = { stroke: C.ink, strokeWidth: 4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const IBU = { hijab: "#3F6E5A", shirt: "#F2B33D", pants: "#3B3B4F" } as const;

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const pop = (t: number, at: number, fps: number, damping = 13, stiffness = 190) =>
  spring({ frame: Math.max(0, (t - at) * fps), fps, config: { damping, stiffness } });

/* ----------------------------------------------------------- label & bingkai */

const Tag: React.FC<{ children: React.ReactNode; bg?: string; size?: number; rot?: number }> = ({ children, bg = C.cream, size = 40, rot = -2 }) => (
  <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: size, color: C.ink, background: bg, padding: "8px 22px 10px", borderRadius: 20, border: `6px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, rotate: `${rot}deg`, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 12 }}>{children}</div>
);

/** Pop yang otomatis di tengah layar */
const CPop: React.FC<{ at: number; y: number; out?: number; children: React.ReactNode }> = ({ at, y, out, children }) => (
  <Pop at={at} out={out} x={0} y={y} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
    {children}
  </Pop>
);

const Source: React.FC<{ children: React.ReactNode; y?: number }> = ({ children, y = 1120 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: y, display: "flex", justifyContent: "center" }}>
    <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, color: DEEP, background: "rgba(250,255,246,0.92)", padding: "2px 18px 4px", borderRadius: 14 }}>{children}</div>
  </div>
);

/** Kartu putih bergaris tebal untuk ilustrasi */
const Panel: React.FC<{ y: number; h: number; at: number; out?: number; bg?: string; x?: number; w?: number; children: React.ReactNode }> = ({ y, h, at, out, bg = "#FBFEF8", x = 60, w = 960, children }) => {
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

/** Muncul memantul di posisi absolut (dalam Panel / latar) */
const At: React.FC<{ at: number; x: number; y: number; out?: number; children: React.ReactNode; from?: number }> = ({ at, x, y, out, children, from = 0.3 }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05 || (out !== undefined && t > out + 0.3)) return null;
  const s = pop(t, at, fps, 11, 200);
  const o = out !== undefined ? interpolate(t, [out, out + 0.25], [1, 0], clamp) : 1;
  return <div style={{ position: "absolute", left: x, top: y, scale: String(interpolate(s, [0, 1], [from, 1])), opacity: interpolate(s, [0, 0.3], [0, 1], clamp) * o }}>{children}</div>;
};

/** Lencana centang hijau (SVG) */
const Check: React.FC<{ size?: number; bg?: string }> = ({ size = 60, bg = MINT }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={{ display: "block", flex: "none" }}>
    <circle cx={30} cy={30} r={26} fill={bg} stroke={C.ink} strokeWidth={5} />
    <path d="M17 31 L26 40 L43 21" fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Tanda silang lembut */
const Cross: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: "block", flex: "none" }}>
    <circle cx={40} cy={40} r={34} fill={CORAL} stroke={C.ink} strokeWidth={6} />
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

/** Angka bulat di lencana */
const NumDot: React.FC<{ n: number | string; size?: number; bg?: string }> = ({ n, size = 58, bg = GREEN }) => (
  <div style={{ flex: "none", width: size, height: size, boxSizing: "border-box", borderRadius: "50%", background: bg, border: `5px solid ${C.ink}`, display: "grid", placeItems: "center", fontFamily: HEAD, fontSize: size * 0.58, color: C.white, WebkitTextStroke: `6px ${C.ink}`, paintOrder: "stroke fill", lineHeight: 1 }}>{n}</div>
);

/* ----------------------------------------------------------- gambar lokal */

/** Dapur hijau-krem: dinding, meja, lantai kayu. `glow` = cahaya keemasan */
const Kitchen: React.FC<{ children?: React.ReactNode; dim?: number; glow?: number; counter?: boolean; wall?: string }> = ({ children, dim = 0, glow = 0, counter = true, wall = "#F1F7E6" }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 880, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: wall }}>
    {[0, 1, 2, 3].map((r) => (
      <div key={r} style={{ position: "absolute", left: 0, right: 0, top: 60 + r * 90, height: 2, background: "#D7E6C4" }} />
    ))}
    {/* jendela */}
    <div style={{ position: "absolute", left: 640, top: 70, width: 260, height: 200, borderRadius: 18, background: "#DDF1F7", border: `6px solid ${C.ink}` }}>
      <div style={{ position: "absolute", left: 124, top: 0, bottom: 0, width: 6, background: C.ink }} />
      <div style={{ position: "absolute", top: 94, left: 0, right: 0, height: 6, background: C.ink }} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 190, background: "#D9B38C", borderTop: `${OUTLINE}px solid ${C.ink}` }} />
    {counter && (
      <div style={{ position: "absolute", right: -10, width: 600, top: 470, height: 240, background: "#C98F6B", border: `${OUTLINE}px solid ${C.ink}`, borderRadius: "18px 0 0 0" }}>
        <div style={{ position: "absolute", left: -10, right: 0, top: -14, height: 34, background: "#F4E3D3", border: `${OUTLINE}px solid ${C.ink}`, borderRadius: 12 }} />
        <div style={{ position: "absolute", left: 60, top: 80, width: 200, height: 120, borderRadius: 14, border: `6px solid ${C.ink}`, background: "#B97E5B" }} />
        <div style={{ position: "absolute", left: 310, top: 80, width: 200, height: 120, borderRadius: 14, border: `6px solid ${C.ink}`, background: "#B97E5B" }} />
      </div>
    )}
    {children}
    {glow > 0 && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(255,214,120,0.62), rgba(255,196,96,0) 72%)", opacity: glow }} />}
    {dim > 0 && <div style={{ position: "absolute", inset: 0, background: "#2E3B2C", opacity: dim }} />}
  </div>
);

/** Latar cahaya keemasan untuk bagian haru */
const Golden: React.FC<{ children?: React.ReactNode; k?: number }> = ({ children, k = 1 }) => {
  const t = useT();
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 880, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: "linear-gradient(180deg, #FFF2CF 0%, #FFE6B0 60%, #FCD995 100%)" }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 500 - 40,
            top: 380,
            width: 80,
            height: 900,
            transformOrigin: "40px 0px",
            rotate: `${i * 45 + t * 6}deg`,
            background: "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0))",
            opacity: 0.55 * k,
          }}
        />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(255,236,170,0.9), rgba(255,214,120,0) 70%)", opacity: k }} />
      {children}
    </div>
  );
};

/** Kuman kecil lucu */
const Germ: React.FC<{ r?: number; c?: string; rot?: number }> = ({ r = 18, c = "#B48CF0", rot = 0 }) => (
  <svg width={(r + 12) * 2} height={(r + 12) * 2} viewBox={`${-r - 12} ${-r - 12} ${(r + 12) * 2} ${(r + 12) * 2}`} style={{ display: "block", overflow: "visible", rotate: `${rot}deg` }}>
    {[0, 1, 2, 3, 4, 5].map((k) => {
      const a = (k / 6) * Math.PI * 2;
      return <line key={k} x1={Math.cos(a) * r} y1={Math.sin(a) * r} x2={Math.cos(a) * (r + 9)} y2={Math.sin(a) * (r + 9)} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />;
    })}
    <circle r={r} fill={c} stroke={C.ink} strokeWidth={5} />
    <circle cx={-r * 0.36} cy={-r * 0.12} r={Math.max(2.6, r * 0.14)} fill={C.ink} />
    <circle cx={r * 0.36} cy={-r * 0.12} r={Math.max(2.6, r * 0.14)} fill={C.ink} />
    <path d={`M${-r * 0.3} ${r * 0.3} Q0 ${r * 0.62} ${r * 0.3} ${r * 0.3}`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
  </svg>
);

/** Sekumpulan kuman yang mengambang */
const Germs: React.FC<{ pts: [number, number, number][]; at?: number; t: number }> = ({ pts, at = 0, t }) => (
  <>
    {pts.map(([x, y, r], i) => {
      const g = interpolate(t, [at + i * 0.08, at + i * 0.08 + 0.3], [0, 1], clamp);
      if (g <= 0) return null;
      return (
        <div key={i} style={{ position: "absolute", left: x - r - 12, top: y - r - 12 + 6 * Math.sin(t * 3 + i), scale: String(g) }}>
          <Germ r={r} c={i % 2 ? "#F2C94C" : "#B48CF0"} rot={10 * Math.sin(t * 2 + i)} />
        </div>
      );
    })}
  </>
);

/** Virus lucu (bulat, tonjolan) */
const Virus: React.FC<{ size?: number }> = ({ size = 150 }) => {
  const t = useT();
  return (
    <svg width={size} height={size} viewBox="-80 -80 160 160" style={{ display: "block", overflow: "visible", rotate: `${t * 30}deg` }}>
      {new Array(8).fill(0).map((_, k) => {
        const a = (k / 8) * Math.PI * 2;
        return (
          <g key={k}>
            <line x1={Math.cos(a) * 44} y1={Math.sin(a) * 44} x2={Math.cos(a) * 64} y2={Math.sin(a) * 64} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
            <circle cx={Math.cos(a) * 66} cy={Math.sin(a) * 66} r={9} fill="#FF9EB5" stroke={C.ink} strokeWidth={4} />
          </g>
        );
      })}
      <circle r={48} fill="#FF7A9A" stroke={C.ink} strokeWidth={6} />
      <g transform={`rotate(${-t * 30})`}>
        <circle cx={-15} cy={-6} r={6} fill={C.ink} />
        <circle cx={15} cy={-6} r={6} fill={C.ink} />
        <path d="M-12 12 Q0 22 12 12" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      </g>
    </svg>
  );
};

/** Amuba lucu: gumpalan lavender bergoyang dengan wajah ramah */
const Amoeba: React.FC<{ size?: number; wave?: boolean }> = ({ size = 220, wave = false }) => {
  const t = useT();
  const n = 9;
  const pts = new Array(n).fill(0).map((_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = 80 + 12 * Math.sin(t * 3 + i * 1.9) + (i % 3 === 0 ? 14 : 0);
    return [Math.cos(a) * r, Math.sin(a) * r * 0.85] as const;
  });
  let d = `M${(pts[0][0] + pts[n - 1][0]) / 2} ${(pts[0][1] + pts[n - 1][1]) / 2}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    d += ` Q${p[0]} ${p[1]} ${(p[0] + q[0]) / 2} ${(p[1] + q[1]) / 2}`;
  }
  return (
    <svg width={size} height={size} viewBox="-120 -120 240 240" style={{ display: "block", overflow: "visible" }}>
      {wave && <path d={`M70 -30 Q110 ${-70 + 14 * Math.sin(t * 8)} 100 -100`} fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />}
      {wave && <path d={`M70 -30 Q110 ${-70 + 14 * Math.sin(t * 8)} 100 -100`} fill="none" stroke="#C9B3F5" strokeWidth={10} strokeLinecap="round" />}
      <path d={d} fill="#C9B3F5" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <ellipse cx={-30} cy={-30} rx={18} ry={10} fill="#FFFFFF" opacity={0.6} />
      <circle cx={16} cy={26} r={14} fill="#A98BE8" opacity={0.8} />
      <circle cx={-24} cy={-4} r={8} fill={C.ink} />
      <circle cx={14} cy={-4} r={8} fill={C.ink} />
      <circle cx={-21} cy={-7} r={2.6} fill="#FFFFFF" />
      <circle cx={17} cy={-7} r={2.6} fill="#FFFFFF" />
      <path d="M-14 14 Q-5 24 4 14" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={-40} cy={10} rx={8} ry={5} fill="#FF9EB5" opacity={0.8} />
      <ellipse cx={30} cy={10} rx={8} ry={5} fill="#FF9EB5" opacity={0.8} />
    </svg>
  );
};

/** Mangkuk salad (tanpa clipPath supaya aman dipakai berkali-kali) */
const SaladBowl: React.FC<{ w?: number }> = ({ w = 420 }) => (
  <svg width={w} height={w * (300 / 420)} viewBox="0 0 420 300" style={{ overflow: "visible", display: "block" }}>
    <path d="M56 132 Q34 72 96 70 Q104 20 168 40 Q208 -2 252 38 Q314 18 324 70 Q386 70 364 132 Z" fill="#8EDB5A" {...SH} />
    <path d="M100 128 Q100 92 130 80 M300 128 Q304 96 280 76 M200 120 Q198 80 214 56" fill="none" stroke="#3E9A3A" strokeWidth={6} strokeLinecap="round" />
    <path d="M128 132 Q116 86 166 90 Q196 66 226 94 Q268 84 272 132 Z" fill="#5DBB4A" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <rect x={316} y={60} width={22} height={70} rx={8} fill="#FF9A3C" stroke={C.ink} strokeWidth={5} transform="rotate(24 327 95)" />
    <circle cx={134} cy={104} r={24} fill="#FF5A4F" stroke={C.ink} strokeWidth={5} />
    <path d="M124 82 L134 90 L144 82" fill="none" stroke="#2E8B3E" strokeWidth={5} strokeLinecap="round" />
    <circle cx={292} cy={100} r={22} fill="#FF5A4F" stroke={C.ink} strokeWidth={5} />
    <ellipse cx={214} cy={84} rx={28} ry={19} fill="#E8F5C8" stroke={C.ink} strokeWidth={5} />
    <ellipse cx={214} cy={84} rx={16} ry={10} fill="none" stroke="#7CC46A" strokeWidth={4} />
    <ellipse cx={210} cy={282} rx={74} ry={13} fill="#E6D8C3" stroke={C.ink} strokeWidth={5} />
    <path d="M30 124 L390 124 Q380 270 210 276 Q40 270 30 124 Z" fill="#FFFFFF" {...SH} />
    <path d="M42 170 Q210 186 378 170" fill="none" stroke={GREEN} strokeWidth={16} />
    <path d="M52 200 Q210 214 368 200" fill="none" stroke={GREEN} strokeWidth={7} />
    <path d="M30 124 L390 124 Q380 270 210 276 Q40 270 30 124 Z" fill="none" {...SH} />
  </svg>
);

/** Gedung rumah sakit netral */
const Hospital: React.FC<{ w?: number }> = ({ w = 420 }) => (
  <svg width={w} height={w * (470 / 420)} viewBox="0 0 420 470" style={{ overflow: "visible", display: "block" }}>
    <rect x={20} y={90} width={380} height={370} rx={14} fill="#FFFFFF" {...SH} />
    <rect x={120} y={20} width={180} height={90} rx={14} fill="#FFFFFF" {...SH} />
    <rect x={180} y={30} width={60} height={64} rx={8} fill={GREEN} stroke={C.ink} strokeWidth={5} />
    <path d="M210 42 L210 82 M190 62 L230 62" stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" />
    <rect x={70} y={130} width={280} height={70} rx={12} fill={GREEN} stroke={C.ink} strokeWidth={6} />
    <text x={210} y={182} textAnchor="middle" fontFamily="LilitaOne" fontSize={46} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} paintOrder="stroke">
      RUMAH SAKIT
    </text>
    {[50, 160, 270].map((x) => (
      <rect key={x} x={x + 12} y={230} width={76} height={70} rx={8} fill="#CFEAF5" stroke={C.ink} strokeWidth={5} />
    ))}
    <rect x={150} y={330} width={120} height={130} rx={8} fill="#BFE6EF" stroke={C.ink} strokeWidth={6} />
    <path d="M210 334 L210 456" stroke={C.ink} strokeWidth={5} />
  </svg>
);

/** Kalender kecil */
const Calendar: React.FC<{ text: string; w?: number; sub?: string }> = ({ text, w = 240, sub }) => (
  <div style={{ width: w, boxSizing: "border-box", borderRadius: 26, background: "#FFFFFF", border: `7px solid ${C.ink}`, boxShadow: `0 9px 0 ${C.ink}`, overflow: "hidden", textAlign: "center" }}>
    <div style={{ height: 54, background: CORAL, borderBottom: `6px solid ${C.ink}`, display: "flex", justifyContent: "space-around", alignItems: "center" }}>
      <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.white, border: `4px solid ${C.ink}` }} />
      <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.white, border: `4px solid ${C.ink}` }} />
    </div>
    <div style={{ fontFamily: HEAD, fontSize: w * 0.3, lineHeight: 1.1, color: C.ink, padding: "10px 6px 2px" }}>{text}</div>
    {sub && <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: w * 0.15, color: DEEP, paddingBottom: 10 }}>{sub}</div>}
  </div>
);

/** Kaca pembesar */
const Magnifier: React.FC<{ w?: number }> = ({ w = 220 }) => (
  <svg width={w} height={w} viewBox="0 0 220 220" style={{ overflow: "visible", display: "block" }}>
    <line x1={140} y1={140} x2={204} y2={204} stroke={C.ink} strokeWidth={40} strokeLinecap="round" />
    <line x1={140} y1={140} x2={204} y2={204} stroke="#A8714C" strokeWidth={24} strokeLinecap="round" />
    <circle cx={88} cy={88} r={74} fill="rgba(221,241,247,0.55)" stroke={C.ink} strokeWidth={14} />
    <circle cx={88} cy={88} r={74} fill="none" stroke="#C9CED6" strokeWidth={6} />
    <path d="M44 70 Q52 44 80 38" fill="none" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" />
  </svg>
);

/** Baterai badan (lemah) */
const Battery: React.FC<{ level: number; w?: number }> = ({ level, w = 360 }) => {
  const col = interpolateColors(level, [0.2, 0.6], ["#F2A65A", MINT]);
  return (
    <svg width={w} height={w * (200 / 360)} viewBox="0 0 360 200" style={{ overflow: "visible", display: "block" }}>
      <rect x={10} y={20} width={300} height={160} rx={30} fill="#FFFFFF" {...SH} strokeWidth={9} />
      <rect x={310} y={70} width={36} height={60} rx={10} fill="#FFFFFF" {...SH} strokeWidth={8} />
      <rect x={30} y={40} width={260 * level} height={120} rx={18} fill={col} stroke={C.ink} strokeWidth={5} />
    </svg>
  );
};

/** Hati SVG */
const Heart: React.FC<{ size?: number; fill?: string }> = ({ size = 300, fill = "#FF7A8A" }) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 200 180" style={{ overflow: "visible", display: "block" }}>
    <path d="M100 170 C20 110 0 70 20 38 Q44 4 80 18 Q94 24 100 40 Q106 24 120 18 Q156 4 180 38 C200 70 180 110 100 170 Z" fill={fill} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
    <path d="M46 46 Q56 30 74 30" fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.75} />
  </svg>
);

/** Hati SVG kecil yang melayang naik */
const FloatHearts: React.FC<{ at: number; fill?: string }> = ({ at, fill = "#FFB347" }) => {
  const t = useT();
  if (t < at) return null;
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const p = ((t - at) * 0.35 + i / 6) % 1;
        return (
          <div key={i} style={{ position: "absolute", left: 90 + i * 160 + Math.sin(t * 1.5 + i) * 30, top: 1060 - p * 640, opacity: Math.sin(p * Math.PI) * 0.85 * interpolate(t, [at, at + 0.5], [0, 1], clamp) }}>
            <Heart size={44 + (i % 3) * 14} fill={i % 2 ? fill : "#FF8FA3"} />
          </div>
        );
      })}
    </>
  );
};

/** Sayur berwajah ramah */
const Veg: React.FC<{ kind: "lettuce" | "tomato" | "carrot" | "cucumber"; size?: number }> = ({ kind, size = 200 }) => {
  const face = (cx: number, cy: number, k = 1) => (
    <g>
      <path d={`M${cx - 22 * k} ${cy} q${8 * k} ${-12 * k} ${16 * k} 0`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <path d={`M${cx + 6 * k} ${cy} q${8 * k} ${-12 * k} ${16 * k} 0`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <path d={`M${cx - 12 * k} ${cy + 16 * k} Q${cx} ${cy + 28 * k} ${cx + 12 * k} ${cy + 16 * k}`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible", display: "block" }}>
      {kind === "lettuce" && (
        <g>
          <path d="M30 140 Q10 90 50 70 Q50 30 96 34 Q130 14 156 50 Q196 64 176 120 Q186 170 130 180 L70 180 Q24 176 30 140 Z" fill="#8EDB5A" {...SH} />
          <path d="M70 176 Q80 120 100 90 M130 176 Q124 130 140 100" fill="none" stroke="#3E9A3A" strokeWidth={7} strokeLinecap="round" />
          {face(100, 120)}
        </g>
      )}
      {kind === "tomato" && (
        <g>
          <circle cx={100} cy={112} r={74} fill="#FF5A4F" {...SH} />
          <path d="M70 46 L100 60 L130 46 L118 70 L100 62 L82 70 Z" fill="#3FA34D" {...SH4} strokeWidth={5} />
          <path d="M56 92 Q62 72 80 64" fill="none" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" opacity={0.7} />
          {face(100, 116)}
        </g>
      )}
      {kind === "carrot" && (
        <g>
          <path d="M70 16 Q84 40 90 52 M100 8 Q102 36 100 52 M132 18 Q116 40 110 52" fill="none" stroke="#3FA34D" strokeWidth={12} strokeLinecap="round" />
          <path d="M60 60 Q100 44 140 60 Q130 130 100 194 Q70 130 60 60 Z" fill="#FF9A3C" {...SH} />
          <path d="M80 130 L92 128 M106 160 L116 158" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          {face(100, 86, 0.9)}
        </g>
      )}
      {kind === "cucumber" && (
        <g transform="rotate(-24 100 100)">
          <rect x={64} y={10} width={74} height={184} rx={37} fill="#5DBB4A" {...SH} />
          <path d="M84 40 L84 60 M112 70 L112 90 M88 140 L88 160" stroke="#3E9A3A" strokeWidth={6} strokeLinecap="round" />
          {face(100, 100, 0.85)}
        </g>
      )}
    </svg>
  );
};

/** Kunci emas */
const Key: React.FC<{ w?: number }> = ({ w = 420 }) => (
  <svg width={w} height={w * (220 / 420)} viewBox="0 0 420 220" style={{ overflow: "visible", display: "block" }}>
    <circle cx={100} cy={110} r={82} fill={GOLD} {...SH} strokeWidth={10} />
    <circle cx={100} cy={110} r={34} fill="#FFF7DA" {...SH} strokeWidth={8} />
    <path d="M180 92 L400 92 L400 128 L370 128 L370 170 L334 170 L334 128 L304 128 L304 156 L270 156 L270 128 L180 128 Z" fill={GOLD} {...SH} strokeWidth={10} />
    <path d="M56 70 Q70 50 94 46" fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.8} />
  </svg>
);

/** Noda kotoran (tak terlihat, digambar sebagai noda cokelat lembut) */
const Smudge: React.FC<{ w?: number }> = ({ w = 160 }) => (
  <svg width={w} height={w * 0.7} viewBox="0 0 160 112" style={{ overflow: "visible", display: "block" }}>
    <path d="M20 70 Q10 40 40 34 Q50 10 80 18 Q110 6 124 30 Q154 36 146 66 Q150 96 116 96 Q90 108 64 98 Q24 100 20 70 Z" fill="#B9926A" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" strokeDasharray="14 10" opacity={0.85} />
    <circle cx={60} cy={60} r={8} fill="#8C6A48" />
    <circle cx={98} cy={52} r={6} fill="#8C6A48" />
    <circle cx={84} cy={78} r={5} fill="#8C6A48" />
  </svg>
);

/** Bibir/mulut sederhana (ikon, bukan wajah) */
const Mouth: React.FC<{ w?: number; open?: number }> = ({ w = 170, open = 0.5 }) => (
  <svg width={w} height={w * 0.7} viewBox="0 0 170 120" style={{ overflow: "visible", display: "block" }}>
    <path d={`M14 60 Q50 ${20 - 10 * open} 85 36 Q120 ${20 - 10 * open} 156 60 Q120 ${100 + 14 * open} 85 ${100 + 14 * open} Q50 ${100 + 14 * open} 14 60 Z`} fill="#F07A8A" {...SH} />
    <path d={`M30 60 Q85 ${62 + 30 * open} 140 60 Q85 ${56 - 4 * open} 30 60 Z`} fill="#7A2B3A" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);

/** Kebun: tanah + sayur tumbuh */
const Garden: React.FC<{ t: number }> = ({ t }) => (
  <svg width={940} height={420} viewBox="0 0 940 420" style={{ overflow: "visible", display: "block" }}>
    <rect x={-10} y={0} width={960} height={260} fill="#DDF1F7" />
    <circle cx={810} cy={80} r={46} fill={GOLD} stroke={C.ink} strokeWidth={6} />
    <path d="M-10 250 Q470 220 950 250 L950 430 L-10 430 Z" fill="#9C6B45" stroke={C.ink} strokeWidth={7} />
    {[0, 1, 2, 3].map((r) => (
      <path key={r} d={`M${20 + r * 10} ${290 + r * 34} Q470 ${270 + r * 34} ${920 - r * 10} ${290 + r * 34}`} fill="none" stroke="#7E5434" strokeWidth={5} strokeDasharray="20 16" />
    ))}
    {[120, 300, 480].map((x, i) => (
      <g key={x} transform={`translate(${x} ${178}) rotate(${3 * Math.sin(t * 2 + i)} 50 90)`}>
        <path d="M10 90 Q-8 50 26 40 Q30 6 60 14 Q92 10 92 46 Q118 60 96 90 Z" fill="#8EDB5A" {...SH} strokeWidth={6} />
        <path d="M50 90 Q52 56 62 34" fill="none" stroke="#3E9A3A" strokeWidth={6} strokeLinecap="round" />
      </g>
    ))}
  </svg>
);

/** Karung pupuk kandang */
const Sack: React.FC<{ w?: number }> = ({ w = 220 }) => (
  <svg width={w} height={w * (240 / 220)} viewBox="0 0 220 240" style={{ overflow: "visible", display: "block" }}>
    <path d="M40 40 Q30 20 60 24 L160 24 Q190 20 180 40 Q206 130 190 210 Q186 232 160 232 L60 232 Q34 232 30 210 Q14 130 40 40 Z" fill="#E9D3A8" {...SH} />
    <path d="M52 30 L168 30" stroke={C.ink} strokeWidth={6} strokeDasharray="10 8" />
    <rect x={40} y={100} width={140} height={74} rx={10} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    <text x={110} y={133} textAnchor="middle" fontFamily="LilitaOne" fontSize={30} fill={C.ink}>
      PUPUK
    </text>
    <text x={110} y={163} textAnchor="middle" fontFamily="LilitaOne" fontSize={24} fill="#8C6A48">
      KANDANG
    </text>
  </svg>
);

/** Baskom air cucian keruh */
const Basin: React.FC<{ w?: number; t: number }> = ({ w = 520, t }) => (
  <svg width={w} height={w * (300 / 520)} viewBox="0 0 520 300" style={{ overflow: "visible", display: "block" }}>
    <ellipse cx={260} cy={90} rx={240} ry={60} fill="#FFFFFF" {...SH} />
    <ellipse cx={260} cy={96} rx={210} ry={44} fill="#B7A77C" stroke={C.ink} strokeWidth={5} />
    {[0, 1, 2].map((i) => {
      const p = (t * 0.8 + i / 3) % 1;
      return <ellipse key={i} cx={260} cy={96} rx={40 + p * 150} ry={8 + p * 30} fill="none" stroke="#8F7F55" strokeWidth={4} opacity={1 - p} />;
    })}
    <path d="M20 90 Q40 280 260 286 Q480 280 500 90" fill="#6FB3E0" {...SH} />
    <path d="M60 150 Q260 170 460 150" fill="none" stroke="#FFFFFF" strokeWidth={8} opacity={0.6} />
    {/* daun di air */}
    <path d="M150 90 Q170 60 210 74 Q230 96 196 108 Q162 112 150 90 Z" fill="#8EDB5A" stroke={C.ink} strokeWidth={5} />
    <circle cx={330} cy={92} r={20} fill="#FF5A4F" stroke={C.ink} strokeWidth={5} />
  </svg>
);

/** Talenan */
const Board: React.FC<{ w?: number; color?: string; children?: React.ReactNode }> = ({ w = 400, color = "#E2B587", children }) => (
  <div style={{ position: "relative", width: w, height: w * 0.62 }}>
    <svg width={w} height={w * 0.62} viewBox="0 0 400 248" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <rect x={6} y={20} width={330} height={220} rx={30} fill={color} {...SH} />
      <rect x={330} y={100} width={66} height={56} rx={22} fill={color} {...SH} />
      <circle cx={370} cy={128} r={10} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
      <path d="M40 60 L120 60" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.5} />
    </svg>
    {children}
  </div>
);

/** Paha ayam mentah */
const Drumstick: React.FC<{ w?: number }> = ({ w = 170 }) => (
  <svg width={w} height={w * 0.7} viewBox="0 0 170 120" style={{ overflow: "visible", display: "block" }}>
    <path d="M14 60 Q10 14 62 14 Q112 14 118 58 Q120 100 70 108 Q18 110 14 60 Z" fill="#F8B9B0" {...SH} />
    <path d="M110 62 L148 68" stroke={C.ink} strokeWidth={24} strokeLinecap="round" />
    <path d="M110 62 L148 68" stroke="#FFF7EC" strokeWidth={12} strokeLinecap="round" />
    <circle cx={152} cy={58} r={11} fill="#FFF7EC" stroke={C.ink} strokeWidth={5} />
    <circle cx={156} cy={78} r={11} fill="#FFF7EC" stroke={C.ink} strokeWidth={5} />
    <path d="M40 40 Q54 30 72 32" fill="none" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" opacity={0.7} />
  </svg>
);

/** Ikan mentah */
const Fish: React.FC<{ w?: number }> = ({ w = 170 }) => (
  <svg width={w} height={w * 0.55} viewBox="0 0 170 94" style={{ overflow: "visible", display: "block" }}>
    <path d="M14 47 Q60 0 120 40 L156 14 L150 47 L156 80 L120 54 Q60 94 14 47 Z" fill="#AFC6D9" {...SH} strokeWidth={6} />
    <circle cx={40} cy={42} r={6} fill={C.ink} />
  </svg>
);

/** Telur rebus potong */
const Egg: React.FC<{ w?: number }> = ({ w = 110 }) => (
  <svg width={w} height={w * 0.8} viewBox="0 0 110 88" style={{ overflow: "visible", display: "block" }}>
    <ellipse cx={55} cy={44} rx={48} ry={38} fill="#FFFFFF" {...SH} strokeWidth={6} />
    <circle cx={55} cy={46} r={18} fill="#FFC93C" stroke={C.ink} strokeWidth={5} />
  </svg>
);

/** Mangkuk buah potong */
const FruitCup: React.FC<{ w?: number }> = ({ w = 320 }) => (
  <svg width={w} height={w * (240 / 320)} viewBox="0 0 320 240" style={{ overflow: "visible", display: "block" }}>
    <path d="M70 100 L118 46 L150 100 Z" fill="#FF6F61" {...SH} strokeWidth={6} />
    <path d="M78 100 L118 56 L142 100" fill="#FFB0A8" />
    <rect x={150} y={44} width={70} height={60} rx={10} fill="#FFD23F" {...SH} strokeWidth={6} transform="rotate(14 185 74)" />
    <path d="M214 100 Q226 50 262 60 Q280 80 262 100 Z" fill="#8EDB5A" {...SH} strokeWidth={6} />
    <circle cx={110} cy={92} r={8} fill={C.ink} />
    <path d="M20 96 L300 96 Q290 220 160 226 Q30 220 20 96 Z" fill="#FFFFFF" {...SH} />
    <path d="M34 140 Q160 156 286 140" fill="none" stroke="#FF8FA3" strokeWidth={12} />
  </svg>
);

/** Jam dinding dengan sektor 2 jam */
const Clock: React.FC<{ sweep: number; size?: number }> = ({ sweep, size = 340 }) => {
  const r = 150;
  const a = -Math.PI / 2 + sweep * (Math.PI / 3); // 2 jam = 60°
  const large = 0;
  const x = 170 + r * Math.cos(a);
  const y = 170 + r * Math.sin(a);
  return (
    <svg width={size} height={size} viewBox="0 0 340 340" style={{ overflow: "visible", display: "block" }}>
      <circle cx={170} cy={170} r={164} fill="#FFFFFF" {...SH} strokeWidth={10} />
      {sweep > 0.01 && <path d={`M170 170 L170 20 A${r} ${r} 0 ${large} 1 ${x} ${y} Z`} fill="#FFE27A" stroke={C.ink} strokeWidth={4} />}
      {new Array(12).fill(0).map((_, i) => {
        const b = (i / 12) * Math.PI * 2;
        return <line key={i} x1={170 + 132 * Math.sin(b)} y1={170 - 132 * Math.cos(b)} x2={170 + 148 * Math.sin(b)} y2={170 - 148 * Math.cos(b)} stroke={C.ink} strokeWidth={i % 3 === 0 ? 9 : 5} strokeLinecap="round" />;
      })}
      <line x1={170} y1={170} x2={170 + 100 * Math.cos(a)} y2={170 + 100 * Math.sin(a)} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
      <line x1={170} y1={170} x2={170} y2={60} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
      <circle cx={170} cy={170} r={14} fill={CORAL} stroke={C.ink} strokeWidth={5} />
    </svg>
  );
};

/** Gelas berisi es batu */
const IceGlass: React.FC<{ w?: number; murky?: boolean }> = ({ w = 220, murky = false }) => (
  <svg width={w} height={w * (280 / 220)} viewBox="0 0 220 280" style={{ overflow: "visible", display: "block" }}>
    <path d="M20 20 L200 20 L180 264 L40 264 Z" fill={murky ? "#E8E1CC" : "#E4F5FC"} {...SH} />
    <path d="M30 96 L190 96 L180 264 L40 264 Z" fill={murky ? "#D9CFA8" : "#BFE6F5"} opacity={0.9} />
    {[
      [48, 104, -10],
      [112, 120, 12],
      [70, 172, 6],
    ].map(([x, y, r], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${r} 32 30)`}>
        <rect width={64} height={60} rx={12} fill={murky ? "#EFE8D2" : "#F2FBFF"} stroke={C.ink} strokeWidth={5} />
        <path d="M12 14 L30 14" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" />
      </g>
    ))}
    <path d="M20 20 L200 20 L180 264 L40 264 Z" fill="none" {...SH} />
  </svg>
);

/** Warung (tempat makan) */
const Stall: React.FC<{ w?: number }> = ({ w = 380 }) => (
  <svg width={w} height={w * (340 / 380)} viewBox="0 0 380 340" style={{ overflow: "visible", display: "block" }}>
    <rect x={40} y={110} width={20} height={220} fill="#A8714C" {...SH4} strokeWidth={6} />
    <rect x={320} y={110} width={20} height={220} fill="#A8714C" {...SH4} strokeWidth={6} />
    <path d="M10 110 L40 30 L340 30 L370 110 Z" fill="#FFFFFF" {...SH} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${40 + i * 75} 30 L${55 + i * 75} 30 L${10 + i * 90 + 45} 110 L${10 + i * 90} 110 Z`} fill={CORAL} opacity={0.9} />
    ))}
    <path d="M10 110 L40 30 L340 30 L370 110 Z" fill="none" {...SH} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${10 + i * 90} 110 q45 40 90 0`} fill={i % 2 ? CORAL : "#FFFFFF"} {...SH4} strokeWidth={5} />
    ))}
    <rect x={30} y={220} width={320} height={110} rx={12} fill="#F4E3D3" {...SH} />
    <rect x={70} y={180} width={90} height={44} rx={10} fill="#DDF1F7" stroke={C.ink} strokeWidth={5} />
    <rect x={200} y={180} width={110} height={44} rx={10} fill="#DDF1F7" stroke={C.ink} strokeWidth={5} />
  </svg>
);

/** Mangkuk masakan matang mengepul */
const HotBowl: React.FC<{ w?: number; t: number }> = ({ w = 300, t }) => (
  <svg width={w} height={w * (260 / 300)} viewBox="0 0 300 260" style={{ overflow: "visible", display: "block" }}>
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${100 + i * 50} ${70 - ((t * 30 + i * 10) % 14)} q-14 -20 0 -40 q14 -20 0 -40`} fill="none" stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(t * 4 + i * 1.7)} />
    ))}
    {[0, 1, 2].map((i) => (
      <path key={`o${i}`} d={`M${100 + i * 50} ${70 - ((t * 30 + i * 10) % 14)} q-14 -20 0 -40 q14 -20 0 -40`} fill="none" stroke="#B9C7CF" strokeWidth={3} strokeLinecap="round" opacity={0.5} />
    ))}
    <ellipse cx={150} cy={110} rx={130} ry={30} fill="#F6C454" {...SH} />
    <circle cx={110} cy={104} r={12} fill={MINT} stroke={C.ink} strokeWidth={4} />
    <circle cx={180} cy={110} r={14} fill="#FF9A3C" stroke={C.ink} strokeWidth={4} />
    <path d="M20 110 Q30 240 150 244 Q270 240 280 110" fill="#FFFFFF" {...SH} />
    <path d="M40 160 Q150 178 260 160" fill="none" stroke={GREEN} strokeWidth={12} />
  </svg>
);

/** Sabun batangan dengan gelembung */
const Soap: React.FC<{ w?: number }> = ({ w = 110 }) => (
  <svg width={w} height={w} viewBox="0 0 110 110" style={{ overflow: "visible", display: "block" }}>
    <rect x={10} y={46} width={90} height={50} rx={18} fill="#9FD8F5" {...SH4} strokeWidth={6} />
    <path d="M24 60 L52 60" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" />
    <circle cx={34} cy={28} r={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
    <circle cx={66} cy={18} r={10} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
    <circle cx={84} cy={34} r={7} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
  </svg>
);

/** Telapak tangan */
const Palm: React.FC<{ w?: number; flip?: boolean; rot?: number }> = ({ w = 90, flip = false, rot = 0 }) => (
  <svg width={w} height={w} viewBox="0 0 100 100" style={{ display: "block", flex: "none", scale: flip ? "-1 1" : undefined, rotate: `${rot}deg`, overflow: "visible" }}>
    <path d="M28 92 Q14 70 16 52 L18 36 Q20 28 27 30 Q32 32 32 40 L32 22 Q32 14 39 14 Q46 14 46 22 L46 14 Q46 6 53 6 Q60 6 60 14 L60 20 Q60 12 67 12 Q74 12 74 20 L74 50 L80 40 Q86 32 92 38 Q96 44 90 54 L74 82 Q66 94 52 94 Z" fill="#C98B5E" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);

/** Dua tangan saling menggosok dengan busa sabun */
const HandWash: React.FC<{ t: number; foam?: number; w?: number }> = ({ t, foam = 1, w = 420 }) => {
  const rub = Math.sin(t * 12) * 16;
  return (
    <div style={{ position: "relative", width: w, height: w * 0.86 }}>
      <div style={{ position: "absolute", left: w * 0.06 + rub, top: w * 0.12 }}>
        <Palm w={w * 0.5} rot={14} />
      </div>
      <div style={{ position: "absolute", left: w * 0.42 - rub, top: w * 0.12 }}>
        <Palm w={w * 0.5} flip rot={-14} />
      </div>
      {foam > 0 &&
        new Array(9).fill(0).map((_, i) => {
          const p = (t * 0.6 + i / 9) % 1;
          const r = (16 + (i % 3) * 10) * (w / 420);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: w * 0.5 + Math.cos(i * 2.3) * w * 0.3 - r,
                top: w * 0.5 - p * w * 0.42 + Math.sin(i * 1.7) * w * 0.08 - r,
                width: r * 2,
                height: r * 2,
                boxSizing: "border-box",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.85)",
                border: `4px solid ${C.ink}`,
                opacity: foam * Math.sin(p * Math.PI),
              }}
            />
          );
        })}
    </div>
  );
};

/** Keran dengan air mengalir; `children` diletakkan di bawah aliran */
const Faucet: React.FC<{ flow: number; children?: React.ReactNode }> = ({ flow, children }) => {
  const t = useT();
  return (
    <div style={{ position: "relative", width: 420, height: 400 }}>
      <svg width={420} height={400} viewBox="0 0 420 400" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <rect x={40} y={20} width={60} height={110} rx={12} fill="#AEB5C0" {...SH} />
        <path d="M70 60 L240 60 Q280 60 280 100 L280 120" fill="none" stroke={C.ink} strokeWidth={54} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M70 60 L240 60 Q280 60 280 100 L280 120" fill="none" stroke="#C9CED6" strokeWidth={38} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={140} y={12} width={70} height={26} rx={10} fill="#49B6E0" {...SH4} strokeWidth={6} />
        <rect x={262} y={138} width={36} height={190 * flow} rx={18} fill="#9FD8F5" stroke="#49B6E0" strokeWidth={4} opacity={0.95} />
        {flow > 0.9 &&
          [0, 1, 2, 3].map((i) => {
            const p = (t * 1.6 + i / 4) % 1;
            return <rect key={i} x={272} y={150 + p * 160} width={10} height={26} rx={5} fill="#FFFFFF" opacity={0.85 * Math.sin(p * Math.PI)} />;
          })}
        <path d="M100 300 L400 300 Q400 390 330 390 L170 390 Q100 390 100 300 Z" fill="#FFFFFF" {...SH} />
        <path d="M96 300 L404 300" stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
      </svg>
      {children}
    </div>
  );
};

/** Apel + pengupas + kulit yang memanjang */
const Peel: React.FC<{ p: number }> = ({ p }) => (
  <svg width={520} height={360} viewBox="0 0 520 360" style={{ overflow: "visible", display: "block" }}>
    <path d={`M300 150 Q${340 + 60 * p} ${190 + 40 * p} ${330 + 120 * p} ${250 + 60 * p} Q${380 + 80 * p} ${300 + 20 * p} ${300 + 180 * p} ${330}`} fill="none" stroke={C.ink} strokeWidth={30} strokeLinecap="round" />
    <path d={`M300 150 Q${340 + 60 * p} ${190 + 40 * p} ${330 + 120 * p} ${250 + 60 * p} Q${380 + 80 * p} ${300 + 20 * p} ${300 + 180 * p} ${330}`} fill="none" stroke="#E84B3C" strokeWidth={16} strokeLinecap="round" />
    <path d="M170 70 Q130 40 92 70 Q40 110 60 200 Q80 290 150 300 Q170 296 180 290 Q190 296 210 300 Q280 290 300 200 Q320 110 268 70 Q230 40 190 70 Z" fill="#FFF3C9" {...SH} strokeWidth={8} />
    <path d="M170 70 Q130 40 92 70 Q60 100 62 150 L120 150 Q140 110 200 110 L250 120 Q270 90 268 70 Q230 40 190 70 Z" fill="#E84B3C" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" opacity={1 - 0.7 * p} />
    <path d="M180 70 Q176 40 196 20" fill="none" stroke="#7A4A2A" strokeWidth={9} strokeLinecap="round" />
    <path d="M196 34 Q226 10 250 30 Q226 50 196 34 Z" fill="#5DBB4A" stroke={C.ink} strokeWidth={5} />
    {/* pengupas */}
    <g transform={`translate(${250 + 20 * Math.sin(p * 12)} 120) rotate(30)`}>
      <rect x={0} y={-14} width={70} height={28} rx={8} fill="#C9CED6" stroke={C.ink} strokeWidth={6} />
      <rect x={66} y={-18} width={120} height={36} rx={16} fill={GREEN} stroke={C.ink} strokeWidth={6} />
    </g>
  </svg>
);

/** Bola dunia netral */
const Globe: React.FC<{ size?: number; t: number }> = ({ size = 260, t }) => (
  <svg width={size} height={size} viewBox="0 0 260 260" style={{ overflow: "visible", display: "block" }}>
    <defs>
      <clipPath id="ep16globe">
        <circle cx={130} cy={130} r={116} />
      </clipPath>
    </defs>
    <circle cx={130} cy={130} r={116} fill="#9FD8F5" {...SH} strokeWidth={9} />
    <g clipPath="url(#ep16globe)">
      {[0, 1].map((k) => {
        const o = ((t * 40) % 260) - k * 260;
        return (
          <g key={k} transform={`translate(${o} 0)`}>
            <path d="M40 80 Q70 50 110 70 Q130 100 100 120 Q70 140 50 120 Z" fill={MINT} stroke={C.ink} strokeWidth={5} />
            <path d="M150 140 Q190 120 220 150 Q230 190 190 210 Q160 200 150 170 Z" fill={MINT} stroke={C.ink} strokeWidth={5} />
            <path d="M160 50 Q190 40 200 70 Q180 84 160 70 Z" fill={MINT} stroke={C.ink} strokeWidth={5} />
          </g>
        );
      })}
    </g>
    <circle cx={130} cy={130} r={116} fill="none" {...SH} strokeWidth={9} />
    <path d="M60 70 Q80 44 110 36" fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
  </svg>
);

/** Ikon orang sederhana (tanpa wajah) */
const PersonIcon: React.FC<{ w?: number; c?: string }> = ({ w = 70, c = "#F2A65A" }) => (
  <svg width={w} height={w * 1.3} viewBox="0 0 70 91" style={{ display: "block", overflow: "visible" }}>
    <circle cx={35} cy={20} r={16} fill={c} stroke={C.ink} strokeWidth={5} />
    <path d="M8 88 Q8 44 35 44 Q62 44 62 88 Z" fill={c} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);

/** Ikon termometer */
const Thermo: React.FC<{ w?: number; level?: number; c?: string }> = ({ w = 80, level = 0.8, c = CORAL }) => (
  <svg width={w} height={w * 1.6} viewBox="0 0 80 128" style={{ display: "block", overflow: "visible" }}>
    <rect x={26} y={6} width={28} height={90} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
    <rect x={34} y={6 + 80 * (1 - level)} width={12} height={80 * level + 10} rx={6} fill={c} />
    <circle cx={40} cy={100} r={22} fill={c} stroke={C.ink} strokeWidth={6} />
  </svg>
);

/** Ikon perut nyeri (ikon perut + kilat) */
const Tummy: React.FC<{ w?: number }> = ({ w = 90 }) => (
  <svg width={w} height={w} viewBox="0 0 100 100" style={{ display: "block", overflow: "visible" }}>
    <path d="M30 10 Q10 40 22 70 Q34 96 64 90 Q92 80 86 52 Q82 30 60 34 Q50 36 50 22 Q50 10 30 10 Z" fill="#FFB3A7" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M58 44 L46 62 L58 62 L48 80" fill="none" stroke={CORAL} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Tetes merah (simbol) */
const RedDrop: React.FC<{ w?: number }> = ({ w = 80 }) => (
  <svg width={w} height={w * 1.2} viewBox="0 0 80 96" style={{ display: "block", overflow: "visible" }}>
    <path d="M40 6 C56 34 72 50 72 64 A32 32 0 0 1 8 64 C8 50 24 34 40 6 Z" fill={CORAL} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M24 62 Q24 48 34 40" fill="none" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" opacity={0.7} />
  </svg>
);

/** Klinik */
const Clinic: React.FC<{ w?: number }> = ({ w = 160 }) => (
  <svg width={w} height={w} viewBox="0 0 160 160" style={{ display: "block", overflow: "visible" }}>
    <rect x={14} y={40} width={132} height={110} rx={10} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
    <rect x={56} y={8} width={48} height={48} rx={8} fill={GREEN} stroke={C.ink} strokeWidth={5} />
    <path d="M80 18 L80 46 M66 32 L94 32" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" />
    <rect x={30} y={70} width={32} height={30} rx={5} fill="#CFEAF5" stroke={C.ink} strokeWidth={4} />
    <rect x={98} y={70} width={32} height={30} rx={5} fill="#CFEAF5" stroke={C.ink} strokeWidth={4} />
    <rect x={62} y={104} width={36} height={46} rx={5} fill="#BFE6EF" stroke={C.ink} strokeWidth={5} />
  </svg>
);

/** Kartu langkah aman: nomor + ikon + judul + sub (besar, layak disimpan) */
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
  h?: number;
  titleSize?: number;
}> = ({ icon, title, sub, subAt, at, y, color, bg = SOFT, n, mark, markAt, h = 190, titleSize }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps);
  const subO = subAt === undefined ? 1 : interpolate(t, [subAt, subAt + 0.25], [0, 1], clamp);
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
        background: bg,
        border: `7px solid ${C.ink}`,
        boxShadow: `0 10px 0 ${C.ink}`,
        translate: `${interpolate(s, [0, 1], [-1000, 0])}px 0px`,
        scale: String(1 + 0.008 * Math.sin((t - at) * 7)),
      }}
    >
      <div style={{ position: "relative", flex: "none", width: 124, height: 124, boxSizing: "border-box", borderRadius: 30, background: color, border: `6px solid ${C.ink}`, display: "grid", placeItems: "center" }}>
        {icon}
        {n !== undefined && (
          <div style={{ position: "absolute", left: -28, top: -28 }}>
            <NumDot n={n} />
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: HEAD, fontSize: titleSize ?? (title.length > 22 ? 48 : 56), lineHeight: 1.02, color: C.ink, whiteSpace: "pre-line" }}>{title}</div>
        {sub && <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 34, color: DEEP, marginTop: 8, lineHeight: 1.12, opacity: subO }}>{sub}</div>}
      </div>
      {mark && t >= mAt - 0.02 && (
        <div style={{ flex: "none", scale: String(interpolate(ms, [0, 1], [2, 1])), opacity: interpolate(ms, [0, 0.25], [0, 1], clamp) }}>{mark === "ok" ? <Check size={76} /> : <Cross size={76} />}</div>
      )}
    </div>
  );
};

/** Label sumber penularan (nomor + teks) */
const SrcHead: React.FC<{ n: number; text: string; at: number; y?: number }> = ({ n, text, at, y = 316 }) => (
  <CPop at={at} y={y}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: HEAD, fontSize: 54, color: C.ink, background: "#FFFFFF", padding: "10px 30px 12px 14px", borderRadius: 26, border: `7px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}`, rotate: "-2deg", whiteSpace: "nowrap" }}>
      <NumDot n={n} size={66} bg={CORAL} />
      {text}
    </div>
  </CPop>
);

/** Kartu tanda bahaya (ke dokter) */
const SignCard: React.FC<{ at: number; x: number; y: number; icon: React.ReactNode; text: string }> = ({ at, x, y, icon, text }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps, 11, 210);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 470,
        height: 220,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "14px 22px",
        background: "#FFF6F2",
        border: `7px solid ${C.ink}`,
        borderRadius: 32,
        boxShadow: `0 9px 0 ${C.ink}`,
        scale: String(interpolate(s, [0, 1], [0.4, 1])),
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
      }}
    >
      <div style={{ flex: "none", width: 110, display: "grid", placeItems: "center" }}>{icon}</div>
      <div style={{ fontFamily: HEAD, fontSize: 46, lineHeight: 1.02, color: C.ink, whiteSpace: "pre-line" }}>{text}</div>
    </div>
  );
};

/** Lima kunci (WHO) */
const FIVE_KEYS = ["jaga\nkebersihan", "pisahin\nmentah-matang", "masak\nsampai matang", "suhu\naman", "air & bahan\naman"];

/** Konfeti lembut */
const Confetti: React.FC<{ at: number; x?: number; y?: number; n?: number }> = ({ at, x = 540, y = 640, n = 36 }) => {
  const t = useT();
  const dt = t - at;
  if (dt < 0 || dt > 3) return null;
  const cols = [GREEN, "#FFD23F", "#FF8FA3", "#49B6E0", "#F2A65A", "#B48CF2"];
  const k = 2.6;
  const d = (1 - Math.exp(-k * dt)) / k;
  const o = interpolate(dt, [2.2, 3.0], [1, 0], clamp);
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const ang = -Math.PI / 2 + (random(`c16a${i}`) - 0.5) * 2.8;
        const sp = 650 + random(`c16s${i}`) * 600;
        const px = x + Math.cos(ang) * sp * d + Math.sin(dt * 3 + i) * 14;
        const py = y + Math.sin(ang) * sp * d + 260 * dt * dt;
        return <div key={i} style={{ position: "absolute", left: px, top: py, width: 18, height: 30, borderRadius: 5, background: cols[i % cols.length], border: `3px solid ${C.ink}`, rotate: `${random(`c16r${i}`) * 360 + dt * (200 + random(`c16w${i}`) * 300)}deg`, opacity: o }} />;
      })}
    </>
  );
};

/** Label tetap "Kisah Enzy Storia" di atas adegan pembuka */
const StoryBadge: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const o = interpolate(t, [from, from + 0.25, to, to + 0.25], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 316, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 38, color: C.ink, background: "#FFFFFF", padding: "8px 26px 10px", borderRadius: 22, border: `6px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, rotate: "-1.5deg", whiteSpace: "nowrap" }}>
        Kisah Enzy Storia <span style={{ color: DEEP }}>(dari ceritanya sendiri)</span>
      </div>
    </div>
  );
};

/* ----------------------------------------------------------------- adegan */
const Ep16Scenes: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const shake = useShake([{ t: 18.11, a: 6 }]);

  // 2a — kaca pembesar menyusuri salad
  const magX = interpolate(t, [5.2, 7.4], [120, 520], { ...clamp, easing: easeInOut });
  // 2b — baterai badan turun
  const batt = interpolate(t, [7.8, 9.4], [0.7, 0.22], { ...clamp, easing: easeInOut });
  // 3 — hati keemasan
  const heart3 = pop(t, 10.2, fps, 10, 150);
  // 5b — Si Halus muncul
  const halus5 = pop(t, 18.05, fps, 9, 170);
  // 6b — kunci
  const key6 = pop(t, 21.99, fps, 10, 150);
  // 7a — amuba
  const amo7 = pop(t, 24.3, fps, 10, 160);
  // 10 — angka WHO
  const num = interpolate(t, [40.38, 41.5], [0, 600], { ...clamp, easing: easeInOut });
  const numS = pop(t, 40.3, fps, 11, 190);
  // T1 — timer cuci tangan 20 detik
  const sweep1 = interpolate(t, [51.0, 52.3], [0, 1], { ...clamp, easing: easeInOut });
  // T2 — air mengalir, lalu kupas sendiri
  const flow2 = interpolate(t, [52.9, 53.3], [0, 1], clamp);
  const peel2 = interpolate(t, [56.1, 57.1], [0, 1], { ...clamp, easing: easeInOut });
  // T4 — jam 2 jam
  const sweep4 = interpolate(t, [63.5, 64.6], [0, 1], { ...clamp, easing: easeInOut });
  // penutup — cahaya keemasan
  const glowEnd = interpolate(t, [79.6, 81.0], [0.3, 1], { ...clamp, easing: easeInOut });

  return (
    <AbsoluteFill style={{ translate: shake }}>
      {/* 1a — kena infeksi virus & parasit amuba */}
      <Scene a={0} b={2.72} zoom={false}>
        <Panel y={440} h={530} at={0} bg="#F4FBEF">
          <div style={{ position: "absolute", left: 260, top: 196 }}>
            <SaladBowl w={420} />
          </div>
          <At at={1.05} x={70} y={50}>
            <Virus size={190} />
          </At>
          <At at={2.15} x={640} y={30}>
            <Amoeba size={230} />
          </At>
        </Panel>
        <Pop at={1.2} x={80} y={1000}>
          <Tag bg="#FFE3EA" size={42} rot={-3}>
            virus
          </Tag>
        </Pop>
        <Pop at={2.25} x={560} y={1000}>
          <Tag bg="#EDE4FF" size={42} rot={3}>
            parasit amuba
          </Tag>
        </Pop>
      </Scene>

      {/* 1b — dirawat sekitar dua hari */}
      <Scene a={2.72} b={5.12}>
        <Panel y={440} h={530} at={2.74} bg="#F4FAFD">
          <div style={{ position: "absolute", left: 60, top: 30 }}>
            <Hospital w={400} />
          </div>
          <At at={4.15} x={570} y={110}>
            <Calendar text="±2" sub="HARI" w={290} />
          </At>
        </Panel>
        <CPop at={3.19} y={1000}>
          <Tag bg="#FFFFFF" size={42} rot={-2}>
            sempat dirawat ±2 hari
          </Tag>
        </CPop>
      </Scene>

      {/* 2a — dugaannya: salad mentah */}
      <Scene a={5.12} b={7.62}>
        <Panel y={440} h={530} at={5.14} bg="#F4FBEF">
          <div style={{ position: "absolute", left: 250, top: 180 }}>
            <SaladBowl w={420} />
          </div>
          <div style={{ position: "absolute", left: magX, top: 90, rotate: "-8deg" }}>
            <Magnifier w={230} />
          </div>
          <At at={6.76} x={720} y={40}>
            <div style={{ fontFamily: HEAD, fontSize: 150, color: GREEN, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill", lineHeight: 1, rotate: `${8 * Math.sin(t * 3)}deg` }}>?</div>
          </At>
        </Panel>
        <CPop at={5.5} y={1000}>
          <Tag bg="#FFFFFF" size={42} rot={-2}>
            dugaannya: dari salad mentah
          </Tag>
        </CPop>
      </Scene>

      {/* 2b — badan lagi kurang sehat */}
      <Scene a={7.62} b={10.0}>
        <Panel y={440} h={560} at={7.64} bg="#F7F4EE">
          <div style={{ position: "absolute", left: 120, top: 150 }}>
            <Battery level={batt} w={480} />
          </div>
          <At at={8.98} x={690} y={110}>
            <Thermo w={130} level={0.75} />
          </At>
        </Panel>
        <CPop at={8.14} y={1040}>
          <Tag bg="#FFF3D6" size={42} rot={-2}>
            pas badannya lagi kurang fit
          </Tag>
        </CPop>
      </Scene>

      {/* 3 — semoga sehat terus (haru, keemasan) */}
      <Scene a={10.0} b={12.62}>
        <Golden>
          {t >= 10.15 && (
            <div style={{ position: "absolute", left: 500 - 170, top: 150, scale: String(interpolate(heart3, [0, 1], [0.3, 1]) * (1 + 0.04 * Math.sin(t * 4))), opacity: interpolate(heart3, [0, 0.3], [0, 1], clamp) }}>
              <Heart size={340} fill="#FFB347" />
            </div>
          )}
          <Glint x={260} y={160} at={10.4} />
          <Glint x={760} y={220} s={0.8} at={10.6} ph={2} />
          <Glint x={300} y={520} s={0.6} at={10.8} ph={4} />
          <Glint x={720} y={560} s={0.7} at={11.0} ph={1} />
        </Golden>
        <FloatHearts at={10.3} />
        <Sticker at={10.5} y={880} bg="#FFFFFF" color={C.ink} size={58} rotate={-2}>
          {"SEMOGA SEHAT TERUS,\nKAK ENZY 💛"}
        </Sticker>
      </Scene>

      {/* 4 — lho, bukannya salad itu sehat? */}
      <Scene a={12.62} b={15.0}>
        <Kitchen>
          <div style={{ position: "absolute", left: 40, top: 240 }}>
            <Worker size={500} pose="shrug" expr={t < 13.9 ? "shocked" : "normal"} {...IBU} seed={11} />
          </div>
          <div style={{ position: "absolute", left: 520, top: 330 }}>
            <SaladBowl w={380} />
          </div>
          <Glint x={560} y={330} at={13.6} />
          <Glint x={860} y={360} s={0.7} at={13.8} ph={2} />
          <At at={12.8} x={330} y={60}>
            <div style={{ fontFamily: HEAD, fontSize: 170, color: GREEN, WebkitTextStroke: `11px ${C.ink}`, paintOrder: "stroke fill", lineHeight: 1, rotate: `${10 * Math.sin(t * 3)}deg` }}>?</div>
          </At>
        </Kitchen>
        <CPop at={12.8} y={330}>
          <Tag bg="#FFFFFF" size={46} rot={-3}>
            lho?
          </Tag>
        </CPop>
        <CPop at={13.57} y={1040}>
          <Tag bg="#FFF3D6" size={42} rot={2}>
            bukannya salad itu sehat?
          </Tag>
        </CPop>
      </Scene>

      {/* 5a — di akun ini, bahaya kayak gini kami sebut… */}
      <Scene a={15.0} b={17.95}>
        <Kitchen dim={0.12}>
          <div style={{ position: "absolute", left: 300, top: 300 }}>
            <SaladBowl w={400} />
          </div>
        </Kitchen>
        <Scanner at={16.2} dur={0.9} top={350} height={760}>
          <Germs t={t} at={16.4} pts={[
            [380, 560, 22],
            [700, 520, 18],
            [470, 470, 14],
            [780, 640, 20],
            [320, 700, 16],
            [610, 450, 15],
          ]} />
        </Scanner>
        <CPop at={15.36} y={330}>
          <Tag bg="#FFFFFF" size={42} rot={-2}>
            di akun ini…
          </Tag>
        </CPop>
        <CPop at={16.21} y={1040}>
          <Tag bg="#FFF3D6" size={40} rot={2}>
            bahaya yang nggak kelihatan ini…
          </Tag>
        </CPop>
      </Scene>

      {/* 5b — Si Halus Salad Licik */}
      <Scene a={17.95} b={19.88}>
        <Kitchen dim={0.08} counter={false} />
        {t >= 18.0 && (
          <div style={{ position: "absolute", left: 540 - 200, top: 470, scale: String(interpolate(halus5, [0, 1], [0.3, 1])), opacity: interpolate(halus5, [0, 0.3], [0, 1], clamp) }}>
            <SiHalus size={480} variant="salad" mood="laugh" />
          </div>
        )}
        <Sticker at={18.11} y={330} bg={GREEN} color={C.white} size={62} rotate={-3}>
          {"SI HALUS: SALAD LICIK"}
        </Sticker>
      </Scene>

      {/* 6a — sayurnya nggak salah */}
      <Scene a={19.88} b={21.85}>
        <Panel y={430} h={520} at={19.9} bg="#F4FBEF">
          {(["lettuce", "tomato", "carrot", "cucumber"] as const).map((k, i) => (
            <At key={k} at={19.95 + i * 0.12} x={30 + i * 225} y={120 + (i % 2) * 40}>
              <div style={{ translate: `0px ${8 * Math.sin(t * 4 + i)}px` }}>
                <Veg kind={k} size={210} />
              </div>
            </At>
          ))}
        </Panel>
        <Sticker at={20.65} y={1000} bg="#FFFFFF" color={C.ink} size={56} rotate={-2}>
          {"SAYURNYA NGGAK SALAH"}
        </Sticker>
        <PopMark at={21.05} x={880} y={380} kind="ok" size={120} />
      </Scene>

      {/* 6b — kuncinya: kebersihan */}
      <Scene a={21.85} b={24.2}>
        <Panel y={430} h={540} at={21.87} bg="#FFF9E8">
          {t >= 21.95 && (
            <div style={{ position: "absolute", left: 250, top: 140, rotate: `${interpolate(key6, [0, 1], [-60, -12])}deg`, scale: String(interpolate(key6, [0, 1], [0.3, 1])), opacity: interpolate(key6, [0, 0.3], [0, 1], clamp) }}>
              <Key w={460} />
            </div>
          )}
          <Glint x={200} y={130} at={22.3} />
          <Glint x={760} y={160} s={0.8} at={22.5} ph={2} />
          <Glint x={700} y={420} s={0.6} at={22.7} ph={4} />
        </Panel>
        <Sticker at={23.07} y={1010} bg={GREEN} color={C.white} size={60} rotate={-2}>
          {"KUNCINYA: KEBERSIHAN"}
        </Sticker>
        <CPop at={22.0} y={320}>
          <Tag bg="#FFFFFF" size={40} rot={-2}>
            kuncinya ada di…
          </Tag>
        </CPop>
      </Scene>

      {/* 7a — amuba nular lewat kotoran */}
      <Scene a={24.2} b={26.3}>
        <Panel y={430} h={560} at={24.22} bg="#F6F2FF">
          {t >= 24.25 && (
            <div style={{ position: "absolute", left: 90, top: 110, scale: String(interpolate(amo7, [0, 1], [0.3, 1])), opacity: interpolate(amo7, [0, 0.3], [0, 1], clamp) }}>
              <Amoeba size={330} wave />
            </div>
          )}
          <At at={25.64} x={560} y={170}>
            <Smudge w={300} />
          </At>
          <At at={25.7} x={570} y={390}>
            <div style={{ fontFamily: HEAD, fontSize: 44, color: DEEP }}>kotoran (nggak keliatan)</div>
          </At>
        </Panel>
        <CPop at={24.36} y={320}>
          <Tag bg="#FFFFFF" size={42} rot={-2}>
            amuba nular lewat…
          </Tag>
        </CPop>
      </Scene>

      {/* 7b — nggak sengaja ikut masuk ke mulut */}
      <Scene a={26.3} b={28.9}>
        <Panel y={430} h={500} at={26.32} bg="#FBFEF8">
          {[
            { at: 26.4, x: 30, el: <Smudge w={220} />, label: "kotoran" },
            { at: 27.28, x: 330, el: <Palm w={170} />, label: "tangan / makanan" },
            { at: 27.95, x: 640, el: <Mouth w={220} open={0.5 + 0.3 * Math.sin(t * 5)} />, label: "mulut" },
          ].map((c, i) => (
            <At key={i} at={c.at} x={c.x} y={90}>
              <div style={{ width: 270, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                <div style={{ height: 200, display: "flex", alignItems: "center" }}>{c.el}</div>
                <div style={{ fontFamily: HEAD, fontSize: 40, color: C.ink, textAlign: "center" }}>{c.label}</div>
              </div>
            </At>
          ))}
          {[
            { at: 27.1, x: 270 },
            { at: 27.8, x: 580 },
          ].map((a, i) => (
            <At key={i} at={a.at} x={a.x} y={160}>
              <svg width={80} height={60} viewBox="0 0 80 60">
                <path d="M6 30 L60 30 M42 12 L64 30 L42 48" fill="none" stroke={CORAL} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </At>
          ))}
        </Panel>
        <CPop at={26.8} y={1000}>
          <Tag bg="#FFF3D6" size={42} rot={-2}>
            nggak sengaja ikut ketelan
          </Tag>
        </CPop>
      </Scene>

      {/* 8 — sumber 1: tanah & pupuk kotoran */}
      <Scene a={28.9} b={32.15}>
        <SrcHead n={1} text="SAYUR KENA TANAH / PUPUK" at={29.04} />
        <Panel y={470} h={560} at={29.1} bg="#DDF1F7">
          <div style={{ position: "absolute", left: 0, top: 120 }}>
            <Garden t={t} />
          </div>
          <Germs t={t} at={30.69} pts={[
            [160, 470, 16],
            [330, 500, 14],
            [520, 470, 17],
          ]} />
          <At at={31.29} x={660} y={150}>
            <Sack w={230} />
          </At>
        </Panel>
      </Scene>

      {/* 9 — sumber 2: air cucian kotor */}
      <Scene a={32.15} b={34.02}>
        <SrcHead n={2} text="AIR CUCIAN YANG KOTOR" at={32.28} />
        <Panel y={470} h={560} at={32.3} bg="#FBFEF8">
          <div style={{ position: "absolute", left: 200, top: 170 }}>
            <Basin w={540} t={t} />
          </div>
          <Germs t={t} at={32.8} pts={[
            [310, 150, 17],
            [520, 120, 15],
            [690, 170, 18],
          ]} />
        </Panel>
      </Scene>

      {/* 10 — sumber 3: tangan yang nyiapin makanan */}
      <Scene a={34.02} b={36.78}>
        <SrcHead n={3} text="TANGAN YANG NYIAPIN" at={34.16} />
        <Panel y={470} h={560} at={34.2} bg="#FFF8F0">
          <div style={{ position: "absolute", left: 230, top: 290 }}>
            <Board w={480}>
              <div style={{ position: "absolute", left: 70, top: 40 }}>
                <Veg kind="lettuce" size={150} />
              </div>
              <div style={{ position: "absolute", left: 220, top: 70 }}>
                <Veg kind="tomato" size={120} />
              </div>
            </Board>
          </div>
          <div style={{ position: "absolute", left: 130, top: 40 + 10 * Math.sin(t * 4) }}>
            <Palm w={200} rot={160} />
          </div>
          <div style={{ position: "absolute", left: 620, top: 40 + 10 * Math.sin(t * 4 + 1) }}>
            <Palm w={200} rot={-160} flip />
          </div>
          <Germs t={t} at={35.04} pts={[
            [230, 90, 15],
            [330, 60, 13],
            [690, 80, 15],
            [790, 120, 13],
          ]} />
        </Panel>
      </Scene>

      {/* 11 — sumber 4: bahkan es batu */}
      <Scene a={36.78} b={38.48}>
        <SrcHead n={4} text="BAHKAN ES BATU" at={36.91} />
        <Panel y={470} h={560} at={36.95} bg="#F4FAFD">
          <div style={{ position: "absolute", left: 340, top: 80 }}>
            <IceGlass w={280} />
          </div>
          <Germs t={t} at={37.61} pts={[
            [400, 220, 14],
            [560, 260, 15],
            [470, 330, 13],
          ]} />
          <At at={37.7} x={690} y={60}>
            <div style={{ fontFamily: HEAD, fontSize: 160, color: CORAL, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill", lineHeight: 1 }}>!</div>
          </At>
        </Panel>
      </Scene>

      {/* 12a — menurut WHO: ±600 juta */}
      <Scene a={38.48} b={41.9}>
        <CPop at={38.62} y={320}>
          <Tag bg="#FFFFFF" size={44} rot={-2}>
            menurut WHO
          </Tag>
        </CPop>
        <div style={{ position: "absolute", left: 540 - 140, top: 450 }}>
          <Globe size={280} t={t} />
        </div>
        {t >= 40.3 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", scale: String(interpolate(numS, [0, 1], [0.4, 1])), opacity: interpolate(numS, [0, 0.3], [0, 1], clamp) }}>
            <div style={{ fontFamily: HEAD, fontSize: 210, lineHeight: 1, color: GREEN, WebkitTextStroke: `14px ${C.ink}`, paintOrder: "stroke fill", textShadow: `0 12px 0 ${C.ink}`, fontVariantNumeric: "tabular-nums" }}>±{Math.round(num)}</div>
            <div style={{ fontFamily: HEAD, fontSize: 70, color: C.ink, marginTop: 6, opacity: interpolate(t, [41.1, 41.3], [0, 1], clamp) }}>JUTA ORANG</div>
          </div>
        )}
        <Source y={1130}>sumber: WHO, fact sheet Food safety</Source>
      </Scene>

      {/* 12b — sakit tiap tahun karena makanan tercemar */}
      <Scene a={41.9} b={45.38}>
        <Sticker at={41.95} y={310} bg="#FFFFFF" color={C.ink} size={64} rotate={-2}>
          {"±600 JUTA ORANG / TAHUN"}
        </Sticker>
        <Panel y={470} h={430} at={42.0} bg="#FBFEF8">
          <div style={{ position: "absolute", left: 40, top: 30, display: "flex", flexWrap: "wrap", width: 880, gap: "14px 26px", justifyContent: "center" }}>
            {new Array(24).fill(0).map((_, i) => {
              const on = t >= 42.1 + i * 0.06;
              const sick = t >= 43.74 && i % 3 === 0;
              return (
                <div key={i} style={{ opacity: on ? 1 : 0, scale: on ? "1" : "0.4", translate: sick ? `${3 * Math.sin(t * 10 + i)}px 0px` : undefined }}>
                  <PersonIcon w={74} c={sick ? "#B9A6FF" : "#F2A65A"} />
                </div>
              );
            })}
          </div>
        </Panel>
        <CPop at={42.42} y={950}>
          <Tag bg="#FFF3D6" size={40} rot={-2}>
            sakit karena makanan tercemar
          </Tag>
        </CPop>
        <Source y={1100}>sumber: WHO, fact sheet Food safety (perkiraan global)</Source>
      </Scene>

      {/* 13a — 5 kunci keamanan pangan WHO */}
      <Scene a={45.38} b={47.98}>
        <Sticker at={45.54} y={310} bg={GREEN} color={C.white} size={58} rotate={-2}>
          {"5 KUNCI KEAMANAN PANGAN"}
        </Sticker>
        {FIVE_KEYS.map((k, i) => {
          const at = 46.38 + i * 0.16;
          if (t < at - 0.05) return null;
          const s = pop(t, at, fps, 11, 210);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 60,
                width: 960,
                top: 470 + i * 122,
                height: 104,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "0 26px",
                borderRadius: 28,
                background: "#FFFFFF",
                border: `6px solid ${C.ink}`,
                boxShadow: `0 7px 0 ${C.ink}`,
                translate: `${interpolate(s, [0, 1], [i % 2 ? 1000 : -1000, 0])}px 0px`,
              }}
            >
              <NumDot n={i + 1} size={62} />
              <svg width={70} height={40} viewBox="0 0 420 220" style={{ flex: "none" }}>
                <circle cx={100} cy={110} r={82} fill={GOLD} stroke={C.ink} strokeWidth={26} />
                <path d="M180 92 L400 92 L400 128 L370 128 L370 170 L334 170 L334 128 L180 128 Z" fill={GOLD} stroke={C.ink} strokeWidth={26} strokeLinejoin="round" />
              </svg>
              <div style={{ fontFamily: HEAD, fontSize: 46, color: C.ink, lineHeight: 1 }}>{k.replace("\n", " ")}</div>
            </div>
          );
        })}
        <Source y={1100}>sumber: WHO, Five Keys to Safer Food</Source>
      </Scene>

      {/* 13b — ini versi gampangnya */}
      <Scene a={47.98} b={49.7}>
        <Kitchen glow={0.35}>
          <div style={{ position: "absolute", left: 90, top: 230 }}>
            <Worker size={500} pose="point" expr="happy" {...IBU} seed={11} />
          </div>
          <div style={{ position: "absolute", left: 560, top: 360 }}>
            <SaladBowl w={360} />
          </div>
          <Glint x={600} y={360} at={48.4} />
          <Glint x={880} y={400} s={0.7} at={48.6} ph={2} />
        </Kitchen>
        <Sticker at={48.12} y={330} bg="#FFE27A" color={C.ink} size={60} rotate={-3}>
          {"VERSI GAMPANGNYA 👇"}
        </Sticker>
        <CPop at={48.7} y={1050}>
          <Tag bg="#FFFFFF" size={36} rot={-2}>
            📌 simpan video ini
          </Tag>
        </CPop>
      </Scene>

      {/* T1 — cuci tangan pakai sabun 20 detik */}
      <Scene a={49.7} b={52.58}>
        <RuleCard n={1} icon={<Soap w={96} />} title="CUCI TANGAN PAKAI SABUN" sub="gosok minimal 20 detik" at={49.75} y={310} color="#DCEFF8" mark="ok" markAt={51.9} />
        <Panel y={560} h={500} at={49.95} bg="#F4FAFD">
          <div style={{ position: "absolute", left: 30, top: 50 }}>
            <HandWash t={t} w={430} />
          </div>
          <div style={{ position: "absolute", left: 520, top: 50, width: 380, height: 380 }}>
            <svg width={380} height={380} viewBox="0 0 380 380" style={{ position: "absolute", left: 0, top: 0 }}>
              <circle cx={190} cy={190} r={176} fill="#FFFFFF" stroke={C.ink} strokeWidth={9} />
              <circle cx={190} cy={190} r={150} fill="none" stroke="#DCEFF8" strokeWidth={26} />
              <circle cx={190} cy={190} r={150} fill="none" stroke="#49B6E0" strokeWidth={26} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 150 * sweep1} ${2 * Math.PI * 150}`} transform="rotate(-90 190 190)" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
              <div>
                <div style={{ fontFamily: HEAD, fontSize: 130, lineHeight: 1, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{Math.round(20 * sweep1)}</div>
                <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 40, color: DEEP }}>detik</div>
              </div>
            </div>
          </div>
        </Panel>
      </Scene>

      {/* T2 — cuci sayur & buah di air mengalir, kupas sendiri */}
      <Scene a={52.58} b={57.42}>
        <RuleCard n={2} icon={<Veg kind="lettuce" size={100} />} title="CUCI DI AIR MENGALIR" sub="sayur & buah, sambil digosok" at={52.65} y={310} color="#E3F4DA" mark="ok" markAt={54.93} />
        <Panel y={560} h={470} at={52.85} bg="#F4FAFD">
          {t < 55.75 && (
            <div style={{ position: "absolute", left: 120, top: 40, opacity: interpolate(t, [55.4, 55.7], [1, 0], clamp) }}>
              <Faucet flow={flow2}>
                <div style={{ position: "absolute", left: 200, top: 210 + 6 * Math.sin(t * 9), rotate: `${10 * Math.sin(t * 9)}deg` }}>
                  <Veg kind="lettuce" size={150} />
                </div>
              </Faucet>
              <div style={{ position: "absolute", left: 470, top: 130, translate: `${t > 54.57 ? 22 * Math.sin(t * 14) : 0}px 0px` }}>
                <Palm w={160} rot={-70} />
              </div>
            </div>
          )}
          {t >= 55.45 && (
            <div style={{ position: "absolute", left: 200, top: 50, opacity: interpolate(t, [55.45, 55.75], [0, 1], clamp) }}>
              <Peel p={peel2} />
            </div>
          )}
        </Panel>
        <CPop at={55.75} y={1060}>
          <Tag bg="#FFF3D6" size={40} rot={-2}>
            kalau bisa, kupas sendiri
          </Tag>
        </CPop>
      </Scene>

      {/* T3 — pisahin talenan mentah & matang */}
      <Scene a={57.42} b={61.2}>
        <RuleCard n={3} icon={<Board w={104} color="#E2B587" />} title="PISAHIN TALENAN" sub="bahan mentah & bahan matang" at={57.5} y={310} color="#FFF0D9" mark="ok" markAt={60.5} />
        <Panel y={560} h={500} at={57.7} bg="#FFFAF4">
          <At at={58.07} x={20} y={110}>
            <Board w={420} color="#F6B1B1">
              <div style={{ position: "absolute", left: 40, top: 50 }}>
                <Drumstick w={170} />
              </div>
              <div style={{ position: "absolute", left: 170, top: 140 }}>
                <Fish w={150} />
              </div>
            </Board>
          </At>
          <At at={58.4} x={490} y={110}>
            <Board w={420} color="#B8E3A8">
              <div style={{ position: "absolute", left: 40, top: 40 }}>
                <Veg kind="tomato" size={120} />
              </div>
              <div style={{ position: "absolute", left: 170, top: 90 }}>
                <Egg w={120} />
              </div>
            </Board>
          </At>
          <At at={59.27} x={90} y={30}>
            <Tag bg="#FFE3E3" size={38} rot={-3}>
              MENTAH
            </Tag>
          </At>
          <At at={60.35} x={570} y={30}>
            <Tag bg="#E3F4DA" size={38} rot={3}>
              MATANG
            </Tag>
          </At>
          <div style={{ position: "absolute", left: 448, top: 60, bottom: 60, width: 8, borderRadius: 4, background: "repeating-linear-gradient(180deg, #E0CFC0 0 22px, transparent 22px 36px)" }} />
        </Panel>
      </Scene>

      {/* T4 — salad / potongan buah: maks 2 jam di suhu ruang */}
      <Scene a={61.2} b={65.5}>
        <RuleCard n={4} icon={<Clock sweep={1} size={100} />} title="MAKS 2 JAM DI SUHU RUANG" sub="salad & potongan buah: habisin" at={61.28} y={310} color="#FFF3C4" mark="ok" markAt={64.9} titleSize={50} />
        <Panel y={560} h={500} at={61.5} bg="#FFFBF0">
          <At at={61.96} x={40} y={130}>
            <FruitCup w={380} />
          </At>
          <div style={{ position: "absolute", left: 560, top: 30 }}>
            <Clock sweep={sweep4} size={310} />
          </div>
          <At at={64.09} x={590} y={355}>
            <div style={{ fontFamily: HEAD, fontSize: 64, color: C.ink, background: "#FFE27A", borderRadius: 22, padding: "0 22px", lineHeight: 1.2, border: `6px solid ${C.ink}`, boxShadow: `0 6px 0 ${C.ink}` }}>MAKS 2 JAM</div>
          </At>
          <At at={64.49} x={60} y={30}>
            <Tag bg="#FFFFFF" size={34} rot={-2}>
              di suhu ruang
            </Tag>
          </At>
        </Panel>
      </Scene>

      {/* T5 — hindari es batu yang nggak jelas asalnya */}
      <Scene a={65.5} b={68.53}>
        <RuleCard n={5} icon={<IceGlass w={74} />} title="ES BATU NGGAK JELAS? SKIP" sub="hindari yang nggak jelas asalnya" at={65.58} y={310} color="#DCEFF8" mark="no" markAt={67.65} titleSize={50} />
        <Panel y={560} h={500} at={65.8} bg="#F4FAFD">
          <At at={66.13} x={90} y={60}>
            <IceGlass w={240} murky />
          </At>
          <At at={66.9} x={290} y={40}>
            <div style={{ fontFamily: HEAD, fontSize: 130, color: CORAL, WebkitTextStroke: `9px ${C.ink}`, paintOrder: "stroke fill", lineHeight: 1 }}>?</div>
          </At>
          <PopMark at={67.65} x={140} y={170} kind="no" size={130} />
          <div style={{ position: "absolute", left: 470, top: 40, bottom: 40, width: 6, borderRadius: 3, background: "#D6E6EC" }} />
          <At at={66.6} x={600} y={60}>
            <IceGlass w={240} />
          </At>
          <PopMark at={67.3} x={780} y={40} kind="ok" size={90} />
          <div style={{ position: "absolute", left: 500, top: 390, width: 440, textAlign: "center", fontFamily: HEAD, fontSize: 40, color: C.ink, opacity: interpolate(t, [67.3, 67.6], [0, 1], clamp) }}>yang jelas: dari air matang</div>
        </Panel>
      </Scene>

      {/* T6 — tempat makan meragukan? pilih yang dimasak matang */}
      <Scene a={68.53} b={72.85}>
        <RuleCard n={6} icon={<HotBowl w={100} t={t} />} title={"RAGU? PILIH YANG\nDIMASAK MATANG"} sub="kalau tempat makannya meragukan" at={68.6} y={310} color="#FFE9C9" mark="ok" markAt={72.07} titleSize={48} />
        <Panel y={580} h={480} at={68.85} bg="#FFFAF4">
          <At at={69.02} x={40} y={70}>
            <Stall w={360} />
          </At>
          <At at={69.92} x={290} y={30}>
            <div style={{ fontFamily: HEAD, fontSize: 120, color: CORAL, WebkitTextStroke: `9px ${C.ink}`, paintOrder: "stroke fill", lineHeight: 1, rotate: `${8 * Math.sin(t * 3)}deg` }}>?</div>
          </At>
          <At at={70.71} x={430} y={190}>
            <svg width={90} height={60} viewBox="0 0 80 60">
              <path d="M6 30 L60 30 M42 12 L64 30 L42 48" fill="none" stroke={GREEN} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </At>
          <At at={71.05} x={560} y={110}>
            <HotBowl w={340} t={t} />
          </At>
          <At at={71.62} x={590} y={400}>
            <div style={{ fontFamily: HEAD, fontSize: 40, color: C.ink, width: 280, textAlign: "center" }}>panas & matang</div>
          </At>
        </Panel>
      </Scene>

      {/* D — tanda bahaya: langsung ke dokter */}
      <Scene a={72.85} b={79.55}>
        <Sticker at={72.9} y={300} bg={CORAL} color={C.white} size={56} rotate={-2}>
          {"KE DOKTER KALAU ADA INI"}
        </Sticker>
        <SignCard at={73.32} x={50} y={450} icon={<RedDrop w={80} />} text={"diare\nberdarah"} />
        <SignCard at={74.33} x={560} y={450} icon={<Thermo w={70} />} text="demam" />
        <SignCard at={74.87} x={50} y={700} icon={<Tummy w={100} />} text={"perut nyeri\nbanget"} />
        <SignCard at={76.09} x={560} y={700} icon={<Calendar text="3+" w={100} />} text={"lewat 3 hari\nbelum membaik"} />
        {t >= 78.1 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 960, display: "flex", justifyContent: "center" }}>
            {(() => {
              const s = pop(t, 78.17, fps, 11, 220);
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "10px 34px 12px 22px", background: "#E8F7E2", border: `8px solid ${C.ink}`, borderRadius: 32, boxShadow: `0 12px 0 ${C.ink}`, rotate: `${interpolate(s, [0, 1], [-14, -2])}deg`, scale: String(interpolate(s, [0, 1], [2, 1])), opacity: interpolate(s, [0, 0.25], [0, 1], clamp) }}>
                  <Clinic w={110} />
                  <div style={{ fontFamily: HEAD, fontSize: 64, color: C.ink, lineHeight: 1 }}>LANGSUNG KE DOKTER</div>
                </div>
              );
            })()}
          </div>
        )}
      </Scene>

      {/* C1 — sayur tetap bagus buat badan (hangat, keemasan) */}
      <Scene a={79.55} b={81.55}>
        <Kitchen glow={glowEnd} counter wall="#FFF4DD">
          <div style={{ position: "absolute", left: 60, top: 230 }}>
            <Worker size={500} pose="holdTool" expr="happy" {...IBU} seed={11} />
          </div>
          <div style={{ position: "absolute", left: 520, top: 330 }}>
            <SaladBowl w={400} />
          </div>
          <Glint x={560} y={330} at={80.0} />
          <Glint x={880} y={370} s={0.7} at={80.2} ph={2} />
          <Glint x={720} y={280} s={0.6} at={80.4} ph={4} />
        </Kitchen>
        <FloatHearts at={80.0} />
        <Sticker at={80.43} y={1030} bg="#FFF3D6" color={C.ink} size={54} rotate={-2}>
          {"SAYUR TETAP BAGUS BUAT BADAN 💛"}
        </Sticker>
      </Scene>

      {/* C2 — mulai dari cuci tangan aja, kamu udah hebat */}
      <Scene a={81.55} b={EP16.endStart}>
        <Golden>
          <div style={{ position: "absolute", left: 270, top: 170 }}>
            <HandWash t={t} w={460} foam={interpolate(t, [82.5, 82.9], [0, 1], clamp)} />
          </div>
          <Glint x={200} y={170} at={82.6} />
          <Glint x={800} y={200} s={0.8} at={82.8} ph={2} />
          <Glint x={780} y={560} s={0.6} at={83.0} ph={4} />
        </Golden>
        <FloatHearts at={82.0} />
        <CPop at={81.91} y={330} out={83.6}>
          <Tag bg="#FFFFFF" size={42} rot={-2}>
            mulai dari cuci tangan aja
          </Tag>
        </CPop>
        <Sticker at={83.75} y={1010} bg="#FFE27A" color={C.ink} size={62} rotate={-3}>
          {"KAMU UDAH HEBAT 🌟"}
        </Sticker>
        <Confetti at={84.05} y={760} n={30} />
      </Scene>

      {/* label kisah nyata, tetap di atas selama bagian pembuka */}
      <StoryBadge from={0.05} to={9.85} />
    </AbsoluteFill>
  );
};

const W = warp.length ? warp : undefined;

export const Ep16: React.FC = () => (
  <Episode ep={16} accent="#3FA34D" tint="#CFE8C6" words={words} endStart={W ? warpOldToNew(EP16.endStart, W) : EP16.endStart} revealAt={W ? warpOldToNew(EP16.revealAt, W) : EP16.revealAt} warp={W} flashes={[18.11]}>
    <Ep16Scenes />
  </Episode>
);
