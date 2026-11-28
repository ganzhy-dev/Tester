import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode, warpOldToNew } from "../Episode";
import { Pop, Scanner, Sticker, useShake } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep14.words";
import { warp } from "./ep14.warp";

/**
 * EP14 "Botol Nyaru" — versi MENYEMANGATI: cairan kimia di botol air mineral itu gampang dikalahin.
 * Semua waktu = detik isi utama (data/ep14_words.json). Tema HANGAT (mint) — teks gelap di latar terang.
 * Kasus Sukabumi disebut lembut & simbolis (rumah, botol di kolong kursi), tanpa anak minum / korban.
 */
export const EP14 = { endStart: 62.45, revealAt: 64.42 };

const MINT = "#2E9E83";
const DEEP = "#2F5E53"; // teks sekunder hijau tua
const SOFT = "#E3F5EC";
const CORAL = "#E8735A";
const SH = {
  stroke: C.ink,
  strokeWidth: OUTLINE,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const SH4 = {
  stroke: C.ink,
  strokeWidth: 4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const IBU = { hijab: "#2E6B5E", shirt: "#E8834A", pants: "#3B3B4F" } as const;
const ANAK = { hair: "#2A1B12", shirt: "#F2B33D", pants: "#3B4E8A" } as const;
const DOKTER = { hair: "#2A1B12", shirt: "#FFFFFF", pants: "#3B4E8A" } as const;

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const pop = (t: number, at: number, fps: number, damping = 13, stiffness = 190) =>
  spring({
    frame: Math.max(0, (t - at) * fps),
    fps,
    config: { damping, stiffness },
  });

/* ----------------------------------------------------------- bingkai & label */

/** Ruangan hangat (dinding mint-krem, lantai kayu) */
const Room: React.FC<{
  children?: React.ReactNode;
  dim?: number;
  wall?: string;
  floor?: string;
  glow?: number;
}> = ({ children, dim = 0, wall = "#EAF4EC", floor = "#D9B38C", glow = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: 40,
      right: 40,
      top: 300,
      height: 880,
      borderRadius: 60,
      overflow: "hidden",
      border: `${OUTLINE}px solid ${C.ink}`,
      background: wall,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 190,
        background: floor,
        borderTop: `${OUTLINE}px solid ${C.ink}`,
      }}
    />
    {children}
    {glow > 0 && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 45%, rgba(255,210,130,0.6), rgba(255,190,100,0) 70%)",
          opacity: glow,
        }}
      />
    )}
    {dim > 0 && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#2F4A44",
          opacity: dim,
        }}
      />
    )}
  </div>
);

const Cloud: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <svg width={220 * s} height={110 * s} viewBox="0 0 220 110" style={{ position: "absolute", left: x, top: y }}>
    <path d="M40 95 Q10 95 14 70 Q18 48 46 52 Q52 18 92 22 Q120 0 150 26 Q190 20 196 56 Q214 62 208 82 Q204 98 180 95 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);

/** Langit pagi tenang + rumput */
const Sky: React.FC<{ children?: React.ReactNode; clouds?: boolean }> = ({ children, clouds = true }) => {
  const t = useT();
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: 300,
        height: 880,
        borderRadius: 60,
        overflow: "hidden",
        border: `${OUTLINE}px solid ${C.ink}`,
        background: "linear-gradient(180deg, #CDEBE6 0%, #EAF4EC 60%, #F6EBD6 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 800,
          top: 70,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "#FFD86B",
          border: `6px solid ${C.ink}`,
          boxShadow: "0 0 0 24px rgba(255,216,107,0.3)",
        }}
      />
      {clouds && <Cloud x={((300 + t * 22) % 1300) - 240} y={180} />}
      {clouds && <Cloud x={((900 + t * 16) % 1300) - 240} y={290} s={0.8} />}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 110,
          background: "#A9D47F",
          borderTop: `${OUTLINE}px solid ${C.ink}`,
        }}
      />
      {children}
    </div>
  );
};

const Tag: React.FC<{
  children: React.ReactNode;
  bg?: string;
  size?: number;
  rot?: number;
}> = ({ children, bg = C.cream, size = 40, rot = -2 }) => (
  <div
    style={{
      fontFamily: BODY,
      fontWeight: 800,
      fontSize: size,
      color: C.ink,
      background: bg,
      padding: "8px 22px 10px",
      borderRadius: 20,
      border: `6px solid ${C.ink}`,
      boxShadow: `0 8px 0 ${C.ink}`,
      rotate: `${rot}deg`,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

/** Pop yang otomatis di tengah layar */
const CPop: React.FC<{
  at: number;
  y: number;
  out?: number;
  children: React.ReactNode;
}> = ({ at, y, out, children }) => (
  <Pop at={at} out={out} x={0} y={y} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
    {children}
  </Pop>
);

const Source: React.FC<{ children: React.ReactNode; y?: number }> = ({ children, y = 1120 }) => (
  <div
    style={{
      position: "absolute",
      left: 40,
      right: 40,
      top: y,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontFamily: BODY,
        fontWeight: 700,
        fontSize: 28,
        color: DEEP,
        background: "rgba(246,252,248,0.92)",
        padding: "2px 18px 4px",
        borderRadius: 14,
      }}
    >
      {children}
    </div>
  </div>
);

/** Kartu putih bergaris tebal untuk ilustrasi */
const Panel: React.FC<{
  y: number;
  h: number;
  at: number;
  out?: number;
  bg?: string;
  children: React.ReactNode;
}> = ({ y, h, at, out, bg = "#FBFDF9", children }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05 || (out !== undefined && t > out + 0.3)) return null;
  const s = pop(t, at, fps, 14, 170);
  const o = out !== undefined ? interpolate(t, [out, out + 0.25], [1, 0], clamp) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        top: y,
        width: 960,
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

/** Lencana centang hijau (SVG, bukan emoji) */
const Check: React.FC<{ size?: number; bg?: string }> = ({ size = 60, bg = "#3FAE5A" }) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    <circle cx={30} cy={30} r={26} fill={bg} stroke={C.ink} strokeWidth={5} />
    <path d="M17 31 L26 40 L43 21" fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Tanda silang lembut (koral) */
const Cross: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80">
    <circle cx={40} cy={40} r={34} fill={CORAL} stroke={C.ink} strokeWidth={6} />
    <path d="M26 26 L54 54 M54 26 L26 54" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
  </svg>
);

/* ----------------------------------------------------------- gambar lokal */

/** Rumah tampak depan; `warm` menyalakan jendela kuning hangat */
const House: React.FC<{ warm?: number }> = ({ warm = 0 }) => {
  const win = interpolateColors(warm, [0, 1], ["#CFEAF5", "#FFE08A"]);
  return (
    <svg width={520} height={440} viewBox="0 0 520 440" style={{ overflow: "visible" }}>
      {warm > 0 && <circle cx={165} cy={295} r={115} fill="#FFE9A8" opacity={0.55 * warm} />}
      <rect x={360} y={70} width={44} height={90} fill="#3E7F6E" {...SH} />
      <path d="M30 200 L260 30 L490 200 Z" fill={MINT} {...SH} />
      <rect x={70} y={195} width={380} height={230} fill="#F7EEDB" {...SH} />
      <rect x={110} y={250} width={110} height={90} rx={8} fill={win} {...SH} />
      <path d="M165 250 L165 340 M110 295 L220 295" stroke={C.ink} strokeWidth={5} />
      <rect x={290} y={270} width={110} height={155} rx={8} fill="#A8714C" {...SH} />
      <circle cx={380} cy={350} r={7} fill={C.ink} />
      <rect x={232} y={382} width={40} height={43} rx={6} fill={CORAL} {...SH4} />
      <circle cx={252} cy={366} r={22} fill="#6FBF5A" {...SH4} />
    </svg>
  );
};

const MapPin: React.FC = () => (
  <svg width={90} height={124} viewBox="0 0 90 124">
    <path d="M45 120 C30 92 6 72 6 45 A39 39 0 0 1 84 45 C84 72 60 92 45 120 Z" fill={CORAL} {...SH} strokeWidth={6} />
    <circle cx={45} cy={45} r={15} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
  </svg>
);

/** Botol bening ala air mineral; `fill` = warna cairan, `label` = tulisan label ("\n" = 2 baris) */
const Bottle: React.FC<{
  w?: number;
  fill?: string;
  level?: number;
  label?: string;
  labelColor?: string;
  cap?: string;
  warn?: boolean;
  labelBg?: string;
}> = ({ w = 170, fill = "#CFEFFF", level = 0.7, label = "AIR?", labelColor = "#3F8FD6", cap = "#3F8FD6", warn = false, labelBg = "#FFFFFF" }) => {
  const top = 356 - 300 * Math.max(0, level);
  const lines = label.split("\n");
  return (
    <svg width={w} height={w * (370 / 170)} viewBox="0 0 170 370" style={{ overflow: "visible", display: "block" }}>
      <rect x={55} y={0} width={60} height={34} rx={8} fill={cap} {...SH} />
      <path d="M60 34 L110 34 L110 70 Q160 90 160 140 L160 330 Q160 356 134 356 L36 356 Q10 356 10 330 L10 140 Q10 90 60 70 Z" fill="#EAF8FF" {...SH} />
      {level > 0.01 && <path d={`M14 ${top} L156 ${top} L156 330 Q156 352 134 352 L36 352 Q14 352 14 330 Z`} fill={fill} opacity={0.9} />}
      <path d="M30 120 Q26 220 34 300" fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.75} />
      {label && (
        <>
          <rect x={18} y={150} width={134} height={58} rx={8} fill={labelBg} stroke={C.ink} strokeWidth={5} />
          {lines.length > 1 ? (
            <text x={85} textAnchor="middle" fontFamily="LilitaOne" fontSize={23} fill={labelColor}>
              <tspan x={85} y={176}>
                {lines[0]}
              </tspan>
              <tspan x={85} y={200}>
                {lines[1]}
              </tspan>
            </text>
          ) : (
            <text x={85} y={190} textAnchor="middle" fontFamily="LilitaOne" fontSize={label.length > 7 ? 24 : 32} fill={labelColor}>
              {label}
            </text>
          )}
        </>
      )}
      {warn && (
        <g transform="translate(118 222)">
          <path d="M0 0 L26 46 L-26 46 Z" fill="#FFD23F" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <text x={0} y={40} textAnchor="middle" fontFamily="LilitaOne" fontSize={30} fill={C.ink}>
            !
          </text>
        </g>
      )}
    </svg>
  );
};

/** Wadah asli (jeriken pembersih) dengan label pabrik; `level` 0..1 isi */
const Jug: React.FC<{
  w?: number;
  color?: string;
  label?: string;
  level?: number;
}> = ({ w = 220, color = "#5BB0E8", label = "PEMBERSIH", level = 1 }) => {
  const top = 330 - 240 * level;
  return (
    <svg width={w} height={w * (340 / 240)} viewBox="0 0 240 340" style={{ overflow: "visible", display: "block" }}>
      <defs>
        <clipPath id="jugclip">
          <path d="M30 90 Q30 70 50 70 L190 70 Q210 70 210 90 L210 310 Q210 330 190 330 L50 330 Q30 330 30 310 Z" />
        </clipPath>
      </defs>
      <path d="M150 70 L150 26 Q150 14 162 14 L196 14 Q208 14 208 26 L208 70" fill="none" stroke={C.ink} strokeWidth={OUTLINE + 18} strokeLinejoin="round" />
      <path d="M150 70 L150 26 Q150 14 162 14 L196 14 Q208 14 208 26 L208 70" fill="none" stroke={color} strokeWidth={18} strokeLinejoin="round" />
      <rect x={52} y={30} width={60} height={46} rx={10} fill="#F2B33D" {...SH} />
      <path d="M30 90 Q30 70 50 70 L190 70 Q210 70 210 90 L210 310 Q210 330 190 330 L50 330 Q30 330 30 310 Z" fill="#DCEFFB" {...SH} />
      <rect x={30} y={top} width={180} height={340} fill={color} clipPath="url(#jugclip)" opacity={0.95} />
      <path d="M30 90 Q30 70 50 70 L190 70 Q210 70 210 90 L210 310 Q210 330 190 330 L50 330 Q30 330 30 310 Z" fill="none" {...SH} />
      <rect x={46} y={150} width={148} height={104} rx={12} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
      <text x={120} y={192} textAnchor="middle" fontFamily="LilitaOne" fontSize={label.length > 8 ? 24 : 30} fill={C.ink}>
        {label}
      </text>
      <path d="M104 206 L120 234 L136 206 Z" fill="#FFD23F" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      <text x={120} y={230} textAnchor="middle" fontFamily="LilitaOne" fontSize={20} fill={C.ink}>
        !
      </text>
      <text x={168} y={238} textAnchor="middle" fontFamily="Baloo2" fontWeight={800} fontSize={15} fill={DEEP}>
        pabrik
      </text>
    </svg>
  );
};

/** Kursi/sofa kecil tampak samping */
const Chair: React.FC = () => (
  <svg width={420} height={330} viewBox="0 0 420 330" style={{ overflow: "visible" }}>
    <rect x={30} y={20} width={360} height={150} rx={40} fill="#8FC7B4" {...SH} />
    <rect x={10} y={150} width={400} height={80} rx={30} fill="#7AB8A3" {...SH} />
    <rect x={40} y={230} width={26} height={90} rx={8} fill="#7A5236" {...SH} />
    <rect x={354} y={230} width={26} height={90} rx={8} fill="#7A5236" {...SH} />
  </svg>
);

/** Bola mainan */
const Ball: React.FC<{ size?: number }> = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 90 90">
    <circle cx={45} cy={45} r={38} fill="#FF8C6B" {...SH4} strokeWidth={6} />
    <path d="M10 40 Q45 60 80 40" fill="none" stroke="#FFFFFF" strokeWidth={9} />
    <circle cx={45} cy={45} r={38} fill="none" {...SH4} strokeWidth={6} />
  </svg>
);

/** Gelas berisi air bening sungguhan */
const Glass: React.FC<{ w?: number }> = ({ w = 120 }) => (
  <svg width={w} height={w * 1.25} viewBox="0 0 120 150" style={{ overflow: "visible", display: "block" }}>
    <path d="M12 8 L108 8 L96 142 L24 142 Z" fill="#EAF8FF" {...SH} strokeWidth={6} />
    <path d="M20 50 L100 50 L94 136 L26 136 Z" fill="#9FD8F5" opacity={0.85} />
    <path d="M30 60 L34 126" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" opacity={0.8} />
  </svg>
);

/** Papan klip dokter */
const Clipboard: React.FC = () => (
  <svg width={300} height={380} viewBox="0 0 300 380">
    <rect x={10} y={30} width={280} height={340} rx={24} fill="#B5793F" {...SH} />
    <rect x={34} y={60} width={232} height={290} rx={12} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    <rect x={100} y={10} width={100} height={46} rx={12} fill="#9AA1AE" {...SH} strokeWidth={6} />
    <rect x={124} y={82} width={52} height={52} rx={8} fill={CORAL} stroke={C.ink} strokeWidth={4} />
    <path d="M150 92 L150 124 M134 108 L166 108" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
    <text x={150} y={176} textAnchor="middle" fontFamily="LilitaOne" fontSize={34} fill={C.ink}>
      IDAI
    </text>
    {[208, 244, 280, 316].map((y, i) => (
      <g key={y}>
        <circle cx={66} cy={y} r={9} fill={MINT} />
        <rect x={86} y={y - 7} width={i % 2 ? 130 : 160} height={14} rx={7} fill="#D7E7E0" />
      </g>
    ))}
  </svg>
);

/** Tag label (ikon kartu 3) */
const LabelIcon: React.FC<{ size?: number }> = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M14 30 L60 30 L88 50 L60 70 L14 70 Z" fill="#FFFFFF" {...SH4} strokeWidth={6} />
    <circle cx={64} cy={50} r={6} fill={C.ink} />
    <rect x={22} y={42} width={28} height={6} rx={3} fill={MINT} />
    <rect x={22} y={53} width={20} height={6} rx={3} fill={MINT} />
  </svg>
);

/** Botol minum dicoret (ikon kartu 2) */
const NoBottle: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <div style={{ position: "relative", width: size, height: size }}>
    <div style={{ position: "absolute", left: size * 0.28, top: size * 0.02 }}>
      <Bottle w={size * 0.44} label="" level={0.6} fill="#BFE6F5" />
    </div>
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: 0, top: 0 }}>
      <circle cx={50} cy={50} r={42} fill="none" stroke={C.ink} strokeWidth={14} />
      <circle cx={50} cy={50} r={42} fill="none" stroke={CORAL} strokeWidth={8} />
      <path d="M21 79 L79 21" stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
      <path d="M21 79 L79 21" stroke={CORAL} strokeWidth={8} strokeLinecap="round" />
    </svg>
  </div>
);

/** Kartu langkah bernomor (ikon + judul + sub) */
const StepCard: React.FC<{
  n: number;
  icon: React.ReactNode;
  title: string;
  sub?: string;
  at: number;
  next?: number;
  y: number;
  color: string;
  h?: number;
}> = ({ n, icon, title, sub, at, next, y, color, h = 190 }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps);
  const active = next === undefined ? true : t < next;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        width: 960,
        top: y,
        height: h,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 30,
        padding: "0 34px",
        borderRadius: 36,
        background: active ? SOFT : "#FBFDF9",
        border: `7px solid ${C.ink}`,
        boxShadow: `0 10px 0 ${C.ink}`,
        translate: `${interpolate(s, [0, 1], [-1000, 0])}px 0px`,
        scale: active ? String(1 + 0.012 * Math.sin((t - at) * 7)) : "0.97",
        opacity: active ? 1 : 0.88,
      }}
    >
      <div
        style={{
          position: "relative",
          flex: "none",
          width: 120,
          height: 120,
          boxSizing: "border-box",
          borderRadius: 30,
          background: color,
          border: `6px solid ${C.ink}`,
          display: "grid",
          placeItems: "center",
          fontSize: 66,
          lineHeight: 1,
        }}
      >
        {icon}
        <div
          style={{
            position: "absolute",
            left: -28,
            top: -28,
            width: 58,
            height: 58,
            boxSizing: "border-box",
            borderRadius: "50%",
            background: MINT,
            border: `5px solid ${C.ink}`,
            display: "grid",
            placeItems: "center",
            fontFamily: HEAD,
            fontSize: 34,
            color: C.white,
            WebkitTextStroke: `6px ${C.ink}`,
            paintOrder: "stroke fill",
          }}
        >
          {n}
        </div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: HEAD,
            fontSize: title.length > 24 ? 46 : 52,
            lineHeight: 1,
            color: C.ink,
          }}
        >
          {title}
        </div>
        {sub && (
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: 33,
              color: DEEP,
              marginTop: 8,
              lineHeight: 1.1,
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
};

/** Baris ringkas langkah yang sudah lewat (rekap simpan) */
const DoneRow: React.FC<{
  n: number;
  title: string;
  y: number;
  at: number;
}> = ({ n, title, y, at }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps, 14, 200);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        width: 960,
        top: y,
        height: 112,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 28px",
        borderRadius: 30,
        background: "#FBFDF9",
        border: `6px solid ${C.ink}`,
        boxShadow: `0 8px 0 ${C.ink}`,
        opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
        translate: `0px ${interpolate(s, [0, 1], [40, 0])}px`,
      }}
    >
      <div
        style={{
          flex: "none",
          width: 60,
          height: 60,
          boxSizing: "border-box",
          borderRadius: "50%",
          background: MINT,
          border: `5px solid ${C.ink}`,
          display: "grid",
          placeItems: "center",
          fontFamily: HEAD,
          fontSize: 34,
          color: C.white,
          WebkitTextStroke: `6px ${C.ink}`,
          paintOrder: "stroke fill",
        }}
      >
        {n}
      </div>
      <div
        style={{
          flex: 1,
          fontFamily: HEAD,
          fontSize: 44,
          color: C.ink,
          lineHeight: 1,
        }}
      >
        {title}
      </div>
      <Check size={64} />
    </div>
  );
};

/** Kartu aturan/pertolongan pertama (ikon + judul + sub) */
const RuleCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  sub?: string;
  subAt?: number;
  at: number;
  y: number;
  color: string;
  bg?: string;
}> = ({ icon, title, sub, subAt, at, y, color, bg = SOFT }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps);
  const subO = subAt === undefined ? 1 : interpolate(t, [subAt, subAt + 0.25], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        width: 960,
        top: y,
        minHeight: 190,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "22px 30px",
        borderRadius: 36,
        background: bg,
        border: `7px solid ${C.ink}`,
        boxShadow: `0 10px 0 ${C.ink}`,
        translate: `${interpolate(s, [0, 1], [-1000, 0])}px 0px`,
        scale: String(1 + 0.012 * Math.sin((t - at) * 7)),
      }}
    >
      <div
        style={{
          flex: "none",
          width: 124,
          height: 124,
          boxSizing: "border-box",
          borderRadius: 30,
          background: color,
          border: `6px solid ${C.ink}`,
          display: "grid",
          placeItems: "center",
          fontSize: 68,
          lineHeight: 1,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: HEAD,
            fontSize: 54,
            lineHeight: 1,
            color: C.ink,
          }}
        >
          {title}
        </div>
        {sub && (
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: 33,
              color: DEEP,
              marginTop: 8,
              lineHeight: 1.12,
              opacity: subO,
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
};

/** Rantai pikiran si kecil: haus → ada botol → minum */
const ChainStep: React.FC<{
  icon: React.ReactNode;
  label: string;
  at: number;
  x: number;
  y?: number;
}> = ({ icon, label, at, x, y = 860 }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps, 10, 230);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 250,
        textAlign: "center",
        scale: String(interpolate(s, [0, 1], [0.3, 1])),
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
      }}
    >
      <div
        style={{
          margin: "0 auto",
          width: 170,
          height: 170,
          boxSizing: "border-box",
          borderRadius: 40,
          background: "#FFFDF6",
          border: `7px solid ${C.ink}`,
          boxShadow: `0 9px 0 ${C.ink}`,
          display: "grid",
          placeItems: "center",
          fontSize: 90,
          lineHeight: 1,
        }}
      >
        {icon}
      </div>
      <div style={{ marginTop: 12, fontFamily: HEAD, fontSize: 44, color: C.ink }}>{label}</div>
    </div>
  );
};

const Arrow: React.FC<{ at: number; x: number; y?: number }> = ({ at, x, y = 905 }) => {
  const t = useT();
  if (t < at) return null;
  const k = interpolate(t, [at, at + 0.2], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: HEAD,
        fontSize: 80,
        color: MINT,
        opacity: k,
        WebkitTextStroke: `6px ${C.ink}`,
        paintOrder: "stroke fill",
      }}
    >
      →
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
          <div
            key={i}
            style={{
              position: "absolute",
              left: 90 + i * 160 + Math.sin(t * 1.5 + i) * 30,
              top: 1060 - p * 640,
              fontSize: 44 + (i % 3) * 14,
              opacity: Math.sin(p * Math.PI) * 0.85,
            }}
          >
            💛
          </div>
        );
      })}
    </>
  );
};

/** Konfeti perayaan */
const Confetti: React.FC<{
  at: number;
  x?: number;
  y?: number;
  n?: number;
}> = ({ at, x = 540, y = 640, n = 44 }) => {
  const t = useT();
  const dt = t - at;
  if (dt < 0 || dt > 3) return null;
  const cols = [MINT, "#FFD23F", CORAL, "#49B6E0", "#9BD77A", "#B48CF2"];
  const k = 2.6;
  const d = (1 - Math.exp(-k * dt)) / k;
  const o = interpolate(dt, [2.2, 3.0], [1, 0], clamp);
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const ang = -Math.PI / 2 + (random(`c14a${i}`) - 0.5) * 2.8;
        const sp = 700 + random(`c14s${i}`) * 650;
        const px = x + Math.cos(ang) * sp * d + Math.sin(dt * 3 + i) * 14;
        const py = y + Math.sin(ang) * sp * d + 260 * dt * dt;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: 18,
              height: 30,
              borderRadius: 5,
              background: cols[i % cols.length],
              border: `3px solid ${C.ink}`,
              rotate: `${random(`c14r${i}`) * 360 + dt * (200 + random(`c14w${i}`) * 300)}deg`,
              opacity: o,
            }}
          />
        );
      })}
    </>
  );
};

/** Label botol dari mata orang dewasa vs si kecil (coretan) */
const LabelView: React.FC<{ k: number }> = ({ k }) => {
  const t = useT();
  return (
    <svg width={800} height={300} viewBox="0 0 800 300">
      <rect x={10} y={10} width={780} height={280} rx={30} fill="#FFFFFF" stroke={C.ink} strokeWidth={8} />
      <g opacity={1 - k}>
        <text x={400} y={130} textAnchor="middle" fontFamily="LilitaOne" fontSize={84} fill={CORAL}>
          CAIRAN KIMIA
        </text>
        <text x={400} y={215} textAnchor="middle" fontFamily="Baloo2" fontWeight={800} fontSize={46} fill={C.ink}>
          jauhkan dari jangkauan anak
        </text>
      </g>
      <g opacity={k}>
        {[0, 1].map((r) => (
          <path
            key={r}
            d={`M${90 + r * 60} ${120 + r * 80} ${new Array(r ? 9 : 11)
              .fill(0)
              .map((_, i) => `q 25 ${(i % 2 ? 1 : -1) * (26 + 6 * Math.sin(t * 6 + i))} 50 0`)
              .join(" ")}`}
            fill="none"
            stroke={r ? C.ink : CORAL}
            strokeWidth={r ? 12 : 16}
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
};

/** Napas tenang: lingkaran mengembang-mengempis */
const Breath: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = pop(t, at, fps, 14, 140);
  const b = 1 + 0.08 * Math.sin((t - at) * 3.2);
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 300,
        top: 760 - 300,
        width: 600,
        height: 600,
        scale: String(s * b),
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -60,
          borderRadius: "50%",
          background: "rgba(46,158,131,0.14)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -24,
          borderRadius: "50%",
          background: "rgba(46,158,131,0.22)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxSizing: "border-box",
          borderRadius: "50%",
          background: "#CFEFE3",
          border: `8px solid ${C.ink}`,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: HEAD,
              fontSize: 96,
              lineHeight: 0.95,
              color: C.ink,
            }}
          >
            TENANG
            <br />
            DULU
          </div>
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 800,
              fontSize: 36,
              color: DEEP,
              marginTop: 14,
            }}
          >
            tarik napas… buang
          </div>
        </div>
      </div>
    </div>
  );
};

/** Siluet leher + kerongkongan; panah naik dicoret */
const Throat: React.FC<{ up: number; stop: number }> = ({ up, stop }) => {
  const t = useT();
  const ay = 400 - 230 * ((t * 0.6) % 1);
  return (
    <svg width={946} height={406} viewBox="0 0 946 406">
      {/* siluet (tanpa wajah) */}
      <circle cx={300} cy={120} r={96} fill="#CFE6DD" stroke={C.ink} strokeWidth={6} />
      <rect x={252} y={190} width={96} height={110} fill="#CFE6DD" />
      <path d="M100 420 Q110 300 252 290 L348 290 Q490 300 500 420 Z" fill="#CFE6DD" stroke={C.ink} strokeWidth={6} />
      <path d="M252 196 L252 292 M348 196 L348 292" stroke={C.ink} strokeWidth={6} />
      {/* kerongkongan */}
      <path d="M300 150 L300 420" stroke="#F4A7A0" strokeWidth={44} strokeLinecap="round" />
      <path d="M300 150 L300 420" stroke="#F9CFC8" strokeWidth={24} strokeLinecap="round" />
      {/* panah naik (dicoret) */}
      <g opacity={up}>
        <path d={`M390 ${ay + 60} L390 ${ay}`} stroke={CORAL} strokeWidth={12} strokeLinecap="round" strokeDasharray="6 16" />
        <path d={`M370 ${ay + 22} L390 ${ay} L410 ${ay + 22}`} fill="none" stroke={CORAL} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform={`translate(400 236) scale(${stop})`} opacity={stop > 0.01 ? 1 : 0}>
        <circle r={58} fill={CORAL} stroke={C.ink} strokeWidth={7} />
        <path d="M-24 -24 L24 24 M24 -24 L-24 24" stroke="#FFFFFF" strokeWidth={14} strokeLinecap="round" />
      </g>
      <path d="M520 210 L340 210" stroke={C.ink} strokeWidth={5} strokeDasharray="4 12" strokeLinecap="round" />
      <text x={560} y={196} fontFamily="LilitaOne" fontSize={50} fill={C.ink}>
        kerongkongan
      </text>
      <text x={560} y={250} fontFamily="Baloo2" fontWeight={800} fontSize={34} fill={DEEP}>
        biar nggak kena dua kali
      </text>
    </svg>
  );
};

/** Gedung IGD */
const Hospital: React.FC = () => (
  <svg width={420} height={470} viewBox="0 0 420 470" style={{ overflow: "visible" }}>
    <rect x={20} y={90} width={380} height={370} rx={14} fill="#FFFFFF" {...SH} />
    <rect x={120} y={20} width={180} height={90} rx={14} fill="#FFFFFF" {...SH} />
    <rect x={180} y={30} width={60} height={64} rx={8} fill={CORAL} stroke={C.ink} strokeWidth={5} />
    <path d="M210 42 L210 82 M190 62 L230 62" stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" />
    <rect x={110} y={130} width={200} height={70} rx={12} fill={CORAL} stroke={C.ink} strokeWidth={6} />
    <text x={210} y={182} textAnchor="middle" fontFamily="LilitaOne" fontSize={54} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} paintOrder="stroke">
      IGD
    </text>
    {[50, 160, 270].map((x) => (
      <rect key={x} x={x + 12} y={230} width={76} height={70} rx={8} fill="#CFEAF5" stroke={C.ink} strokeWidth={5} />
    ))}
    <rect x={150} y={330} width={120} height={130} rx={8} fill="#BFE6EF" stroke={C.ink} strokeWidth={6} />
    <path d="M210 334 L210 456" stroke={C.ink} strokeWidth={5} />
  </svg>
);

/** Denah mini rumah — 4 titik cek */
const SPOTS = [
  { name: "KOLONG KURSI", x: 20, y: 20, at: 38.77 },
  { name: "DAPUR", x: 486, y: 20, at: 39.31 },
  { name: "GARASI", x: 20, y: 310, at: 39.63 },
  { name: "KAMAR MANDI", x: 486, y: 310, at: 40.14 },
];
const FloorPlan: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  // posisi kaca pembesar: berpindah dari titik ke titik
  let mx = 240;
  let my = 170;
  for (let i = 0; i < SPOTS.length; i++) {
    const a = SPOTS[i];
    const k = interpolate(t, [a.at - 0.28, a.at], [0, 1], {
      ...clamp,
      easing: easeInOut,
    });
    const px = i === 0 ? 120 : SPOTS[i - 1].x + 300;
    const py = i === 0 ? 80 : SPOTS[i - 1].y + 170;
    if (t >= a.at - 0.28) {
      mx = px + (a.x + 300 - px) * k;
      my = py + (a.y + 170 - py) * k;
    }
  }
  const W = 454;
  const H = 270;
  return (
    <svg width={946} height={596} viewBox="0 0 946 596">
      {SPOTS.map((s, i) => {
        const on = t >= s.at + 0.2;
        const c = pop(t, s.at + 0.2, fps, 9, 220);
        return (
          <g key={i}>
            <rect x={s.x} y={s.y} width={W - 14} height={H - 14} rx={20} fill={on ? "#D4F0E3" : "#F3EFE6"} stroke={C.ink} strokeWidth={6} />
            <text x={s.x + 26} y={s.y + 58} fontFamily="LilitaOne" fontSize={40} fill={C.ink}>
              {s.name}
            </text>
            <g transform={`translate(${s.x + 60} ${s.y + 90})`}>
              {i === 0 && (
                <g>
                  <rect x={40} y={10} width={220} height={80} rx={26} fill="#8FC7B4" {...SH4} strokeWidth={5} />
                  <rect x={28} y={76} width={244} height={44} rx={18} fill="#7AB8A3" {...SH4} strokeWidth={5} />
                  <rect x={46} y={120} width={14} height={36} rx={4} fill="#7A5236" {...SH4} />
                  <rect x={240} y={120} width={14} height={36} rx={4} fill="#7A5236" {...SH4} />
                  <ellipse cx={150} cy={142} rx={60} ry={10} fill="rgba(0,0,0,0.15)" />
                </g>
              )}
              {i === 1 && (
                <g>
                  <rect x={30} y={60} width={250} height={90} rx={12} fill="#C98F6B" {...SH4} strokeWidth={5} />
                  <rect x={60} y={36} width={150} height={28} rx={8} fill="#C9CED6" {...SH4} strokeWidth={5} />
                  <rect x={90} y={0} width={90} height={40} rx={10} fill={CORAL} {...SH4} strokeWidth={5} />
                  <rect x={232} y={8} width={30} height={56} rx={8} fill="#F2B33D" {...SH4} strokeWidth={5} />
                </g>
              )}
              {i === 2 && (
                <g>
                  <rect x={20} y={0} width={210} height={150} rx={10} fill="#C9CED6" {...SH4} strokeWidth={5} />
                  {[30, 62, 94, 126].map((y) => (
                    <path key={y} d={`M24 ${y} L226 ${y}`} stroke={C.ink} strokeWidth={4} />
                  ))}
                  <rect x={250} y={70} width={60} height={80} rx={10} fill="#E0566F" {...SH4} strokeWidth={5} />
                  <rect x={262} y={56} width={22} height={18} rx={4} fill="#3A3F4B" {...SH4} />
                </g>
              )}
              {i === 3 && (
                <g>
                  <path d="M20 60 L290 60 L270 150 L40 150 Z" fill="#FFFFFF" {...SH4} strokeWidth={5} />
                  <rect x={28} y={66} width={254} height={22} fill="#9FD8F5" />
                  <path d="M60 150 L56 164 M250 150 L254 164" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
                  <path d="M246 60 L246 6 L210 6" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
                </g>
              )}
            </g>
            {on && (
              <g transform={`translate(${s.x + W - 74} ${s.y + 44}) scale(${c})`}>
                <circle r={30} fill="#3FAE5A" stroke={C.ink} strokeWidth={5} />
                <path d="M-13 1 L-4 10 L13 -9" fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
          </g>
        );
      })}
      {t >= SPOTS[0].at - 0.3 && (
        <g transform={`translate(${mx} ${my}) rotate(${6 * Math.sin(t * 4)})`}>
          <path d="M40 40 L82 82" stroke={C.ink} strokeWidth={24} strokeLinecap="round" />
          <path d="M40 40 L80 80" stroke="#B5793F" strokeWidth={12} strokeLinecap="round" />
          <circle r={56} fill="rgba(255,255,255,0.35)" stroke={C.ink} strokeWidth={10} />
          <circle r={56} fill="none" stroke={MINT} strokeWidth={4} />
          <path d="M-26 -18 Q-20 -34 -4 -38" fill="none" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

/** Pekan beres-beres: 1 sudut rumah per hari */
const DAYS = [
  ["SEN", "kursi"],
  ["SEL", "dapur"],
  ["RAB", "garasi"],
  ["KAM", "k. mandi"],
  ["JUM", "rak"],
  ["SAB", "lemari"],
  ["MIN", "teras"],
];
const WeekBar: React.FC<{ from: number; step: number }> = ({ from, step }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const done = DAYS.filter((_, i) => t >= from + i * step).length;
  const bar = interpolate(t, [from, from + (DAYS.length - 1) * step + 0.25], [0, 1], clamp);
  return (
    <div
      style={{
        width: 946,
        height: 406,
        boxSizing: "border-box",
        padding: "26px 28px 0",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: HEAD,
            fontSize: 58,
            color: C.ink,
            lineHeight: 1,
          }}
        >
          1 SUDUT RUMAH / HARI
        </div>
        <Check size={66} />
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 26,
          justifyContent: "center",
        }}
      >
        {DAYS.map(([d, spot], i) => {
          const on = t >= from + i * step;
          const s = pop(t, from + i * step, fps, 9, 240);
          return (
            <div
              key={d}
              style={{
                width: 116,
                height: 150,
                boxSizing: "border-box",
                borderRadius: 22,
                border: `6px solid ${C.ink}`,
                background: on ? "#BFE8D5" : "#F3EFE6",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0 10px",
                scale: on ? String(1 + 0.12 * (1 - s)) : "1",
              }}
            >
              <div
                style={{
                  fontFamily: HEAD,
                  fontSize: 32,
                  color: C.ink,
                  lineHeight: 1,
                }}
              >
                {d}
              </div>
              <div style={{ height: 52, display: "grid", placeItems: "center" }}>
                {on ? (
                  <div style={{ scale: String(s) }}>
                    <Check size={52} />
                  </div>
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      border: `5px dashed #B9B1A2`,
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  fontFamily: BODY,
                  fontWeight: 800,
                  fontSize: 21,
                  color: DEEP,
                  lineHeight: 1,
                }}
              >
                {spot}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          margin: "26px auto 0",
          width: 860,
          height: 40,
          boxSizing: "border-box",
          borderRadius: 20,
          border: `6px solid ${C.ink}`,
          background: "#F3EFE6",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${bar * 100}%`,
            height: "100%",
            background: `repeating-linear-gradient(-45deg, ${MINT} 0 18px, #3DB596 18px 36px)`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: 46,
          top: 330,
          fontFamily: HEAD,
          fontSize: 30,
          color: DEEP,
        }}
      >
        {done}/7
      </div>
    </div>
  );
};

/* ----------------------------------------------------------------- adegan */
const Ep14Scenes: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const shake = useShake([{ t: 16.63, a: 8 }]);

  // 1a — rumah tenang, pin lokasi jatuh
  const pinS = pop(t, 0.88, fps, 10, 170);
  const warm1 = interpolate(t, [1.6, 2.6], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  // 1b — cincin sorot botol di kolong kursi
  const ring1 = pop(t, 5.27, fps, 11, 200);
  // 2c — label berganti
  const flip = (at: number) => Math.abs(Math.cos(interpolate(t, [at - 0.12, at + 0.12], [0, Math.PI], clamp)));
  // 3b — Si Halus ketakutan saat label jelas muncul
  const hit3 = pop(t, 19.0, fps, 10, 160);
  const halusX = interpolate(hit3, [0, 1], [0, 90]);
  const labelS = pop(t, 19.0, fps, 12, 260);
  // 4b — label jadi coretan dari mata si kecil
  const scr = interpolate(t, [23.85, 24.2], [0, 1], clamp);
  // 5a — panel ilustrasi
  // 6b — tuang balik ke wadah asli
  const tilt6 = interpolate(t, [42.4, 42.8], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const pour6 = interpolate(t, [42.75, 43.5], [0, 1], clamp);
  // 7b — kerongkongan
  const up7 = interpolate(t, [46.0, 46.3], [0, 1], clamp);
  const stop7 = pop(t, 46.27, fps, 10, 220);
  // 7c — Ibu jalan ke IGD
  const walk7 = interpolate(t, [50.2, 51.4], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  // 9 — penutup hangat
  const glow9 = interpolate(t, [57.0, 59.0], [0.3, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const take9 = interpolate(t, [58.1, 58.6], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });

  return (
    <AbsoluteFill style={{ translate: shake }}>
      {/* 1a — Sukabumi, disebut lembut */}
      <Scene a={0} b={3.25} zoom={false}>
        <Sky>
          <div style={{ position: "absolute", left: 230, top: 330 }}>
            <House warm={warm1} />
          </div>
          {t >= 0.84 && (
            <div
              style={{
                position: "absolute",
                left: 445,
                top: interpolate(pinS, [0, 1], [-160, 230]),
              }}
            >
              <MapPin />
            </div>
          )}
        </Sky>
        <Pop at={0.3} x={70} y={340}>
          <Tag bg="#FFFFFF" size={42} rot={-3}>
            📍 Sukabumi
          </Tag>
        </Pop>
        <Sticker at={1.56} y={1010} bg="#FFF3D6" color={C.ink} size={48} rotate={-2}>
          {"BIKIN BANYAK ORANG TUA BELAJAR 💛"}
        </Sticker>
      </Scene>

      {/* 1b — botol air mineral di kolong kursi (simbolis) */}
      <Scene a={3.25} b={6.3}>
        <Room>
          <div style={{ position: "absolute", left: 360, top: 370 }}>
            <Chair />
          </div>
          <div style={{ position: "absolute", left: 120, top: 600 }}>
            <Ball size={96} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 560,
              top: 572,
              width: 80,
              height: 170,
              rotate: "90deg",
            }}
          >
            <Bottle w={80} fill="#E9F7C9" level={0.55} label="" />
          </div>
          {t >= 5.22 && (
            <div
              style={{
                position: "absolute",
                left: 600 - 140,
                top: 657 - 100,
                width: 280,
                height: 200,
                boxSizing: "border-box",
                borderRadius: "50%",
                border: `9px dashed ${MINT}`,
                rotate: `${t * 30}deg`,
                scale: String(interpolate(ring1, [0, 1], [1.8, 1]) * (1 + 0.04 * Math.sin(t * 8))),
                opacity: interpolate(ring1, [0, 0.3], [0, 1], clamp),
              }}
            />
          )}
        </Room>
        <CPop at={3.4} y={340}>
          <Tag bg="#FFFFFF" size={40} rot={-2}>
            botolnya botol air mineral…
          </Tag>
        </CPop>
        <CPop at={4.4} y={450}>
          <Tag bg="#FFF3D6" size={40} rot={2}>
            isinya ternyata disinfektan
          </Tag>
        </CPop>
      </Scene>

      {/* 2a — dokter anak IDAI */}
      <Scene a={6.3} b={9.05}>
        <Room>
          <div style={{ position: "absolute", left: 40, top: 190 }}>
            <Worker size={520} pose="point" expr="happy" {...DOKTER} seed={12} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 600,
              top: 240,
              rotate: `${3 + 2 * Math.sin(t * 2)}deg`,
            }}
          >
            <Clipboard />
          </div>
        </Room>
        <Sticker at={6.95} y={330} bg="#FFF3D6" color={C.ink} size={56} rotate={-2}>
          {"CUKUP SERING TERJADI"}
        </Sticker>
        <CPop at={7.68} y={1050}>
          <Tag bg={SOFT} size={42} rot={-2}>
            🩺 kata dokter anak IDAI
          </Tag>
        </CPop>
      </Scene>

      {/* 2b — banyak anak nelen cairan kimia dari botol air mineral */}
      <Scene a={9.05} b={12.2}>
        <Room>
          <div
            style={{
              position: "absolute",
              left: 120,
              top: 270,
              display: "flex",
              gap: 70,
              alignItems: "flex-end",
            }}
          >
            {[
              { at: 9.1, fill: "#F2E7A0" },
              { at: 9.4, fill: "#E9F7C9" },
              { at: 9.62, fill: "#D8C7F0" },
            ].map((b, i) => {
              const s = pop(t, b.at, fps, 10, 220);
              return (
                <div
                  key={i}
                  style={{
                    width: 200,
                    scale: String(interpolate(s, [0, 1], [0.4, 1])),
                    opacity: t >= b.at - 0.05 ? interpolate(s, [0, 0.3], [0, 1], clamp) : 0,
                    rotate: `${3 * Math.sin(t * 3 + i * 2)}deg`,
                  }}
                >
                  <Bottle w={200} fill={b.fill} level={0.62} label="AIR?" />
                </div>
              );
            })}
          </div>
        </Room>
        <CPop at={9.1} y={340}>
          <Tag bg="#FFFFFF" size={40} rot={-2}>
            banyak anak nelen cairan kimia
          </Tag>
        </CPop>
        <CPop at={10.73} y={1010}>
          <Tag bg="#FFF3D6" size={38} rot={2}>
            …karena disimpan di botol air mineral
          </Tag>
        </CPop>
        <Source y={1110}>sumber: IDAI</Source>
      </Scene>

      {/* 2c — paling sering: air aki & minyak tanah */}
      <Scene a={12.2} b={14.3}>
        <Room>
          <div
            style={{
              position: "absolute",
              left: 150,
              top: 220,
              scale: `${flip(12.95)} 1`,
            }}
          >
            <Bottle w={220} fill="#E4F1F4" level={0.75} label={t < 12.95 ? "AIR?" : "AIR AKI"} labelColor={t < 12.95 ? "#3F8FD6" : "#C2475C"} warn={t >= 12.95} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 560,
              top: 220,
              scale: `${flip(13.42)} 1`,
            }}
          >
            <Bottle w={220} fill="#F4E39A" level={0.75} label={t < 13.42 ? "AIR?" : "MINYAK\nTANAH"} labelColor={t < 13.42 ? "#3F8FD6" : "#A0521A"} warn={t >= 13.42} />
          </div>
        </Room>
        <Sticker at={12.29} y={330} bg="#FFF3D6" color={C.ink} size={56} rotate={-2}>
          {"PALING SERING 👇"}
        </Sticker>
        <Pop at={13.0} x={110} y={1030}>
          <Tag bg="#FFFFFF" size={38} rot={-3}>
            air aki
          </Tag>
        </Pop>
        <Pop at={13.47} x={560} y={1030}>
          <Tag bg="#FFFFFF" size={38} rot={3}>
            minyak tanah
          </Tag>
        </Pop>
      </Scene>

      {/* 3a — Si Halus: Botol Nyaru */}
      <Scene a={14.3} b={17.3}>
        <Room dim={0.16}>
          <div style={{ position: "absolute", left: 110, top: 340, opacity: 0.6 }}>
            <Bottle w={150} fill="#E9F7C9" level={0.6} label="AIR?" />
          </div>
        </Room>
        <Scanner at={14.4} dur={0.9} top={430} height={700}>
          <div style={{ position: "absolute", left: 380, top: 500 }}>
            <SiHalus size={420} variant="bottle" mood="laugh" />
          </div>
        </Scanner>
        <Pop at={15.8} x={90} y={1020}>
          <Tag bg="#FFFFFF" size={38} rot={-3}>
            jago nyamar 👀
          </Tag>
        </Pop>
        <Sticker at={16.63} y={340} bg={MINT} color={C.white} size={60} rotate={-3}>
          {"SI HALUS: BOTOL NYARU 🍼"}
        </Sticker>
      </Scene>

      {/* 3b — tenang, gampang dikalahin: takut label jelas */}
      <Scene a={17.3} b={21.2}>
        <Room wall="#F1F8F1">
          <div style={{ position: "absolute", left: 30, top: 250 }}>
            <Worker size={460} pose="point" expr="happy" {...IBU} seed={13} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 560 + halusX,
              top: 240,
              scale: String(1 - 0.15 * hit3),
              rotate: `${8 * hit3}deg`,
              translate: `${t > 19 ? Math.sin(t * 40) * 3 : 0}px 0px`,
            }}
          >
            <SiHalus size={360} variant="bottle" mood={t < 19.0 ? "scared" : "busted"} />
          </div>
          {t > 19.1 && (
            <div
              style={{
                position: "absolute",
                left: 860,
                top: 210,
                fontSize: 64,
                opacity: 0.6 + 0.4 * Math.sin(t * 6),
              }}
            >
              💦
            </div>
          )}
        </Room>
        <Sticker at={17.38} y={330} bg="#CFEFDF" color={C.ink} size={54} rotate={-2}>
          {"TENANG, GAMPANG DIKALAHIN 💪"}
        </Sticker>
        {t >= 18.95 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 960,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "16px 40px 18px 28px",
                background: "#FFFFFF",
                border: `8px solid ${C.ink}`,
                borderRadius: 30,
                boxShadow: `0 12px 0 ${C.ink}`,
                rotate: `${interpolate(labelS, [0, 1], [-18, -3])}deg`,
                scale: String(interpolate(labelS, [0, 1], [2.2, 1])),
                opacity: interpolate(labelS, [0, 0.25], [0, 1], clamp),
              }}
            >
              <LabelIcon size={100} />
              <div
                style={{
                  fontFamily: HEAD,
                  fontSize: 76,
                  color: C.ink,
                  lineHeight: 1,
                }}
              >
                LABEL JELAS
              </div>
              <Check size={80} />
            </div>
          </div>
        )}
      </Scene>

      {/* 4a — POV si kecil: botol bening = minum */}
      <Scene a={21.2} b={23.05}>
        <div style={{ position: "absolute", left: 80, top: 450 }}>
          <Worker size={360} pose="point" expr="happy" {...ANAK} seed={11} />
        </div>
        <div style={{ position: "absolute", left: 660, top: 470 }}>
          <Bottle w={150} fill="#E9F7C9" level={0.62} label="" />
        </div>
        <CPop at={21.29} y={330}>
          <Tag bg="#FFFFFF" size={40} rot={-2}>
            buat si kecil: botol bening = minum 💧
          </Tag>
        </CPop>
        <ChainStep icon="🙂" label="haus" at={21.55} x={60} />
        <Arrow at={21.75} x={315} />
        <ChainStep icon={<Bottle w={62} fill="#E9F7C9" level={0.6} label="" />} label="ada botol" at={21.87} x={415} />
        <Arrow at={22.4} x={670} />
        <ChainStep icon={<Glass w={84} />} label="minum" at={22.68} x={770} />
      </Scene>

      {/* 4b — belum bisa baca label */}
      <Scene a={23.05} b={25.0}>
        <CPop at={23.12} y={330}>
          <Tag bg="#FFFFFF" size={40} rot={-2}>
            mereka belum bisa baca label
          </Tag>
        </CPop>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 470,
            textAlign: "center",
            fontFamily: HEAD,
            fontSize: 48,
            color: DEEP,
          }}
        >
          {scr < 0.5 ? "yang kita baca:" : "yang si kecil lihat:"}
        </div>
        <Panel y={540} h={340} at={23.15} bg="#F6FBF7">
          <div style={{ position: "absolute", left: 66, top: 14 }}>
            <LabelView k={scr} />
          </div>
        </Panel>
        <div style={{ position: "absolute", left: 120, top: 860 }}>
          <Worker size={290} pose="idle" expr="normal" {...ANAK} seed={11} />
        </div>
        <Pop at={24.22} x={330} y={930}>
          <div
            style={{
              fontFamily: HEAD,
              fontSize: 110,
              color: MINT,
              WebkitTextStroke: `9px ${C.ink}`,
              paintOrder: "stroke fill",
              lineHeight: 1,
              rotate: "10deg",
            }}
          >
            ?
          </div>
        </Pop>
        <Pop at={24.3} x={480} y={980}>
          <Tag bg="#FFF3D6" size={38} rot={2}>
            taunya: botol minum 💧
          </Tag>
        </Pop>
      </Scene>

      {/* 4c — bukan salah mereka */}
      <Scene a={25.0} b={27.3}>
        <Room wall="#F2F1DE" floor="#E2B48A" glow={0.7}>
          <div style={{ position: "absolute", left: 70, top: 220 }}>
            <Worker size={480} pose="idle" expr="happy" {...IBU} seed={13} />
          </div>
          <div style={{ position: "absolute", left: 500, top: 390 }}>
            <Worker size={320} pose="wave" expr="happy" {...ANAK} seed={11} />
          </div>
        </Room>
        <Sticker at={25.25} y={330} bg="#FFF3D6" color={C.ink} size={58} rotate={-2}>
          {"BUKAN SALAH MEREKA 💛"}
        </Sticker>
        <CPop at={26.14} y={1060}>
          <Tag bg="#FFFFFF" size={44} rot={-2}>
            🤝 kita yang bantu jagain
          </Tag>
        </CPop>
      </Scene>

      {/* 5a — caranya gampang: langkah 1–2 */}
      <Scene a={27.3} b={33.5}>
        <Sticker at={27.38} y={300} bg="#FFF3D6" color={C.ink} size={56} rotate={-2}>
          {"CARANYA GAMPANG KOK 👇"}
        </Sticker>
        <StepCard n={1} icon={<Jug w={74} />} title="SIMPAN DI BOTOL ASLINYA" sub="biasain dari sekarang" at={28.43} next={30.72} y={440} color="#D4ECF7" />
        <StepCard n={2} icon={<NoBottle size={98} />} title="JANGAN PINDAH KE BOTOL MINUM" sub="sebersih apa pun botolnya" at={30.72} y={660} color="#FFE3DC" />
        <Panel y={660} h={270} at={28.7} out={30.5} bg="#F6FBF7">
          <div style={{ position: "absolute", left: 90, top: 30 }}>
            <Jug w={150} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 300,
              top: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <Check size={90} />
            <div
              style={{
                fontFamily: HEAD,
                fontSize: 50,
                color: C.ink,
                lineHeight: 1.05,
              }}
            >
              botol asli
              <br />
              <span
                style={{
                  fontFamily: BODY,
                  fontWeight: 800,
                  fontSize: 36,
                  color: DEEP,
                }}
              >
                label pabrik lengkap
              </span>
            </div>
          </div>
        </Panel>
        <Panel y={890} h={260} at={31.0} bg="#F6FBF7">
          <div style={{ position: "absolute", left: 120, top: 34 }}>
            <Jug w={140} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 330,
              top: 80,
              fontFamily: HEAD,
              fontSize: 100,
              color: MINT,
              WebkitTextStroke: `8px ${C.ink}`,
              paintOrder: "stroke fill",
              lineHeight: 1,
            }}
          >
            →
          </div>
          <div style={{ position: "absolute", left: 510, top: 26, opacity: 0.85 }}>
            <Bottle w={92} fill="#BFE6F5" level={0.6} label="" />
          </div>
          <div style={{ position: "absolute", left: 500, top: 78 }}>
            <Cross size={110} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 660,
              top: 70,
              fontFamily: HEAD,
              fontSize: 44,
              color: C.ink,
              lineHeight: 1.05,
            }}
          >
            jangan
            <br />
            dipindah
          </div>
        </Panel>
      </Scene>

      {/* 5b — langkah 3–4 + rekap (kartu simpan) */}
      <Scene a={33.5} b={37.8}>
        <CPop at={33.55} y={290}>
          <Tag bg="#FFF3D6" size={42} rot={-2}>
            📌 simpan video ini
          </Tag>
        </CPop>
        <DoneRow n={1} title="SIMPAN DI BOTOL ASLINYA" y={400} at={33.55} />
        <DoneRow n={2} title="JANGAN PINDAH KE BOTOL MINUM" y={530} at={33.65} />
        <StepCard n={3} icon={<LabelIcon size={96} />} title="LABEL JELAS & GEDE" sub="tulis isinya, gede-gede" at={33.6} next={35.06} y={680} color="#FFF3C4" />
        <StepCard n={4} icon="🔒" title="TARUH TINGGI / DIKUNCI" sub="rak atas atau lemari yang dikunci" at={35.06} y={900} color="#CFEFDF" />
      </Scene>

      {/* 6a — misi beres-beres: 4 titik cek */}
      <Scene a={37.8} b={40.75}>
        <Sticker at={37.84} y={300} bg="#FFF3D6" color={C.ink} size={56} rotate={-2}>
          {"MISI BERES-BERES ✨"}
        </Sticker>
        <Panel y={450} h={610} at={37.9} bg="#FBFAF5">
          <div style={{ position: "absolute", left: 0, top: 0 }}>
            <FloorPlan />
          </div>
        </Panel>
        <CPop at={38.58} y={1090}>
          <Tag bg="#FFFFFF" size={36} rot={-1}>
            👀 intip satu-satu
          </Tag>
        </CPop>
      </Scene>

      {/* 6b — botol bekas bukan air? balikin ke wadah asli */}
      <Scene a={40.75} b={43.8}>
        <Room>
          <div style={{ position: "absolute", left: 600, top: 270 }}>
            <Jug w={290} level={0.45 + 0.35 * pour6} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 200 + 260 * tilt6,
              top: 300 - 140 * tilt6,
              rotate: `${tilt6 * 105}deg`,
              transformOrigin: "50% 30%",
            }}
          >
            <Bottle w={170} fill="#9FD0F0" level={0.62 * (1 - pour6)} label="AIR?" />
          </div>
          {pour6 > 0 && pour6 < 1 && (
            <div
              style={{
                position: "absolute",
                left: 664,
                top: 296,
                width: 18,
                height: 40,
                borderRadius: 9,
                background: "#5BB0E8",
                opacity: 0.9,
              }}
            />
          )}
          {t > 41.4 && t < 42.4 && (
            <div
              style={{
                position: "absolute",
                left: 270,
                top: 190,
                fontFamily: HEAD,
                fontSize: 110,
                color: MINT,
                WebkitTextStroke: `8px ${C.ink}`,
                paintOrder: "stroke fill",
                rotate: `${8 * Math.sin(t * 6)}deg`,
              }}
            >
              ?
            </div>
          )}
        </Room>
        <CPop at={40.78} y={330}>
          <Tag bg="#FFFFFF" size={40} rot={-2}>
            ada botol bekas yang isinya bukan air? 🤔
          </Tag>
        </CPop>
        <Sticker at={42.35} y={1000} bg="#CFEFDF" color={C.ink} size={52} rotate={-2}>
          {"BALIKIN KE WADAH ASLINYA ↩️"}
        </Sticker>
      </Scene>

      {/* 7a — kalau terlanjur ketelan: tenang dulu */}
      <Scene a={43.8} b={45.4}>
        <Sticker at={43.82} y={300} bg="#FFF3D6" color={C.ink} size={54} rotate={-2}>
          {"KALAU TERLANJUR KETELAN:"}
        </Sticker>
        <Breath at={44.6} />
      </Scene>

      {/* 7b — jangan dipancing muntah */}
      <Scene a={45.4} b={50.1}>
        <RuleCard icon="✋" title="JANGAN DIPANCING MUNTAH" sub="cairannya bisa ngiritasi kerongkongan lagi waktu keluar" subAt={46.81} at={45.44} y={320} color="#FFE3DC" bg="#FFF3EF" />
        <Panel y={640} h={420} at={45.8} bg="#F6FBF7">
          <div style={{ position: "absolute", left: 0, top: 0 }}>
            <Throat up={up7} stop={t >= 46.27 ? stop7 : 0} />
          </div>
        </Panel>
      </Scene>

      {/* 7c — langsung ke IGD + bawa botolnya */}
      <Scene a={50.1} b={53.3}>
        <Sky clouds={false}>
          <div style={{ position: "absolute", left: 540, top: 300 }}>
            <Hospital />
          </div>
          <div
            style={{
              position: "absolute",
              left: 20 + 140 * walk7,
              top: 300,
              translate: `0px ${-Math.abs(Math.sin(t * 9)) * 10 * (walk7 > 0 && walk7 < 1 ? 1 : 0)}px`,
            }}
          >
            <Worker size={460} pose="holdTool" expr="normal" {...IBU} seed={13} />
            <div
              style={{
                position: "absolute",
                left: 114,
                top: 262,
                rotate: "-6deg",
              }}
            >
              <Bottle w={72} fill="#E9F7C9" level={0.5} label="AIR?" />
            </div>
          </div>
        </Sky>
        <Sticker at={50.18} y={320} bg="#FFF3D6" color={C.ink} size={54} rotate={-2}>
          {"KE IGD + BAWA BOTOLNYA 🏥"}
        </Sticker>
        <Pop at={51.4} x={70} y={470}>
          <Tag bg="#FFFFFF" size={36} rot={-4}>
            bawa botolnya 👇
          </Tag>
        </Pop>
        <CPop at={52.15} y={1060}>
          <Tag bg={SOFT} size={40} rot={-2}>
            🩺 biar dokter tahu isinya apa
          </Tag>
        </CPop>
        <Source y={1145}>sumber: IDAI</Source>
      </Scene>

      {/* 8 — semangat: pelan-pelan aja */}
      <Scene a={53.3} b={56.85}>
        <CPop at={53.31} y={310}>
          <Tag bg="#FFFFFF" size={42} rot={-2}>
            nggak harus beres sehari 👌
          </Tag>
        </CPop>
        <Panel y={440} h={420} at={53.6} bg="#FBFAF5">
          <WeekBar from={53.9} step={0.33} />
        </Panel>
        <Sticker at={54.26} y={920} bg="#FFE27A" color={C.ink} size={60} rotate={-3}>
          {"PELAN-PELAN AJA,\nUDAH KEREN 🌟"}
        </Sticker>
        <Confetti at={56.04} y={700} />
      </Scene>

      {/* 9 — penutup hangat: yang kelihatan kayak air, memang air */}
      <Scene a={56.85} b={EP14.endStart}>
        <Room wall="#F2F1DE" floor="#E2B48A" glow={glow9}>
          <div style={{ position: "absolute", left: 60, top: 210 }}>
            <Worker size={480} pose="idle" expr="happy" {...IBU} seed={13} />
          </div>
          <div style={{ position: "absolute", left: 600, top: 380 }}>
            <Worker size={320} pose="point" expr="happy" {...ANAK} seed={11} flip />
          </div>
          {/* meja kecil */}
          <div
            style={{
              position: "absolute",
              left: 400,
              top: 600,
              width: 190,
              height: 24,
              background: "#C98F6B",
              border: `6px solid ${C.ink}`,
              borderRadius: 10,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 480,
              top: 624,
              width: 30,
              height: 70,
              background: "#A8714C",
              border: `6px solid ${C.ink}`,
              borderTop: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 445 + 120 * take9,
              top: 488 - 30 * take9,
            }}
          >
            <Glass w={96} />
          </div>
        </Room>
        <FloatHearts at={59.0} />
        <CPop at={56.88} y={330} out={58.8}>
          <Tag bg="#FFFFFF" size={38} rot={-2}>
            si kecil cukup tahu: haus → ambil minum 💧
          </Tag>
        </CPop>
        <CPop at={58.91} y={330}>
          <Tag bg="#FFFFFF" size={40} rot={-2}>
            🤝 sisanya kita jaga bareng
          </Tag>
        </CPop>
        <Sticker at={60.81} y={985} bg="#FFF3D6" color={C.ink} size={52} rotate={-2}>
          {"YANG KELIHATAN KAYAK AIR,\nMEMANG AIR 💧💛"}
        </Sticker>
      </Scene>
    </AbsoluteFill>
  );
};

const W = warp.length ? warp : undefined;

export const Ep14: React.FC = () => (
  <Episode
    ep={14}
    accent="#2E9E83"
    tint="#CDE8DC"
    words={words}
    endStart={W ? warpOldToNew(EP14.endStart, W) : EP14.endStart}
    revealAt={W ? warpOldToNew(EP14.revealAt, W) : EP14.revealAt}
    warp={W}
    flashes={[16.63]}
  >
    <Ep14Scenes />
  </Episode>
);
