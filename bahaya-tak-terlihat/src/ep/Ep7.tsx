import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut, easeOut } from "../brand";
import { Expr, Pose, SiHalus, Worker } from "../Characters";
import { Episode } from "../Episode";
import { Pop, Scanner, Sticker, useShake } from "../Kit";
import { Badge, Bubble, CheckRow, Room } from "../Props";
import { Bed, BodySpot, Headline, S } from "../PropsStress";
import { Scene } from "./Ep1";
import { words } from "./ep7.words";

/** Semua waktu = detik isi utama (data/ep7_words.json), tanpa warp. Hook & CTA diatur Episode.tsx */
export const EP7 = { endStart: 70.05, revealAt: 72.19 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const SK = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const OFFICE = { wall: "#3A2B5E", floor: "#24183F" };
const NIGHT = { wall: "#1C2350", floor: "#141838" };
const JO = { shirt: "#5B6BD8", pants: "#2E3557" } as const;

/* ------------------------------------------------------------ gambar lokal */

/** Overlay dengan koordinat sama persis dengan Worker (viewBox -30 -20 460 660), ikut goyang napasnya */
const JoOverlay: React.FC<{ size: number; seed?: number; children: React.ReactNode }> = ({ size, seed = 0, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps + seed * 1.7;
  const bob = Math.sin(t * Math.PI * 1.8) * 5;
  return (
    <svg width={size * (400 / 620)} height={size} viewBox="-30 -20 460 660" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", translate: `0px ${bob}px` }}>
      {children}
    </svg>
  );
};

/** Bang Jo + efek tubuh (ikat kepala, leher merah, lambung perih, jantung berdebar) */
const Jo: React.FC<{
  size?: number;
  expr?: Expr;
  pose?: Pose;
  seed?: number;
  band?: number;
  neck?: number;
  gut?: number;
  heart?: number;
  shake?: number;
}> = ({ size = 600, expr = "normal", pose = "idle", seed = 0, band = 0, neck = 0, gut = 0, heart = 0, shake = 0 }) => {
  const t = useT();
  const beat = 1 + 0.18 * Math.max(0, Math.sin(t * Math.PI * 4.2)) ** 6;
  return (
    <div style={{ position: "relative", width: size * (400 / 620), height: size }}>
      <Worker size={size} expr={expr} pose={pose} seed={seed} shake={shake} {...JO} />
      <JoOverlay size={size} seed={seed}>
        {neck > 0 && (
          <g opacity={neck}>
            <ellipse cx={200} cy={318} rx={120} ry={34} fill={S.red} opacity={0.55 + 0.25 * Math.sin(t * 8)} />
            {[-1, 1].map((d) => (
              <path key={d} d={`M${200 + d * 150} 300 l${d * 26} -16 M${200 + d * 156} 322 l${d * 30} 0 M${200 + d * 150} 344 l${d * 26} 16`} stroke={S.red} strokeWidth={9} strokeLinecap="round" />
            ))}
          </g>
        )}
        {band > 0 && (
          <g opacity={band}>
            <path d="M58 150 Q200 110 342 150 L342 182 Q200 142 58 182 Z" fill="#C8A26B" {...SK} strokeWidth={6} />
            <path d="M342 160 l46 -30 l6 24 l-30 18 l34 22 l-16 18 l-40 -36" fill="#C8A26B" {...SK} strokeWidth={6} />
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M${120 + i * 80} ${30 - (i % 2) * 14} q10 -14 0 -28 q-10 -14 0 -28`} fill="none" stroke={C.pink} strokeWidth={8} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 9 + i)} />
            ))}
          </g>
        )}
        {gut > 0 && (
          <g opacity={gut}>
            <ellipse cx={200} cy={440} rx={56 + 6 * Math.sin(t * 10)} ry={40 + 5 * Math.sin(t * 10)} fill={S.red} opacity={0.7} />
            <path d="M178 420 l14 18 l-12 10 l16 16" fill="none" stroke={C.yellow} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
        {heart > 0 && (
          <g opacity={heart} transform={`translate(255 372) scale(${beat})`}>
            <path d="M0 18 C-30 -10 -18 -36 0 -18 C18 -36 30 -10 0 18 Z" fill={S.red} {...SK} strokeWidth={5} />
          </g>
        )}
      </JoOverlay>
    </div>
  );
};

/** Label kecil berlatar */
const Label: React.FC<{ children: React.ReactNode; size?: number; bg?: string; color?: string; rotate?: number }> = ({ children, size = 52, bg = C.cream, color = C.ink, rotate = -2 }) => (
  <div
    style={{
      fontFamily: HEAD,
      fontSize: size,
      color,
      background: bg,
      padding: `${size * 0.14}px ${size * 0.4}px ${size * 0.2}px`,
      borderRadius: size * 0.4,
      border: `6px solid ${C.ink}`,
      boxShadow: `0 8px 0 ${C.ink}`,
      whiteSpace: "nowrap",
      rotate: `${rotate}deg`,
    }}
  >
    {children}
  </div>
);

/** Layar presentasi dengan grafik */
const Screen: React.FC = () => (
  <svg width={460} height={330} viewBox="0 0 460 330" style={{ overflow: "visible" }}>
    <rect x={6} y={6} width={448} height={280} rx={20} fill="#F4F1FF" {...SK} />
    <rect x={60} y={190} width={56} height={70} fill={C.cyan} {...SK} strokeWidth={5} />
    <rect x={146} y={150} width={56} height={110} fill={C.lime} {...SK} strokeWidth={5} />
    <rect x={232} y={110} width={56} height={150} fill={C.pink} {...SK} strokeWidth={5} />
    <rect x={318} y={60} width={56} height={200} fill={C.yellow} {...SK} strokeWidth={5} />
    <path d="M230 286 L230 326 M170 326 L290 326" {...SK} />
  </svg>
);

/** Kalender "DEADLINE" */
const Calendar: React.FC<{ w?: number }> = ({ w = 300 }) => {
  const t = useT();
  return (
    <div style={{ width: w, borderRadius: 30, border: `${OUTLINE}px solid ${C.ink}`, background: C.white, overflow: "hidden", boxShadow: `0 12px 0 ${C.ink}`, rotate: `${4 + Math.sin(t * 14) * 2}deg` }}>
      <div style={{ background: S.red, fontFamily: HEAD, fontSize: w * 0.15, color: C.white, textAlign: "center", padding: "8px 0", borderBottom: `${OUTLINE}px solid ${C.ink}` }}>DEADLINE</div>
      <div style={{ fontFamily: HEAD, fontSize: w * 0.42, color: C.ink, textAlign: "center", lineHeight: 1.2 }}>HARI INI</div>
    </div>
  );
};

/** Obat maag & strip pil */
const Meds: React.FC = () => (
  <svg width={300} height={300} viewBox="0 0 300 300" style={{ overflow: "visible" }}>
    <rect x={40} y={80} width={140} height={200} rx={26} fill={C.white} {...SK} />
    <rect x={56} y={40} width={108} height={50} rx={12} fill={C.cyan} {...SK} />
    <rect x={40} y={140} width={140} height={70} fill={C.lime} {...SK} strokeWidth={5} />
    <text x={110} y={188} textAnchor="middle" fontFamily="LilitaOne" fontSize={40} fill={C.ink}>
      MAAG
    </text>
    <g transform="translate(170 150) rotate(18)">
      <rect x={0} y={0} width={120} height={150} rx={16} fill="#C9CFE0" {...SK} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={34 + (i % 2) * 52} cy={40 + Math.floor(i / 2) * 64} r={20} fill={i === 0 ? "#C9CFE0" : C.white} {...SK} strokeWidth={4} />
      ))}
    </g>
  </svg>
);

/** Kartu hasil lab */
const LabCard: React.FC<{ stamp?: number }> = ({ stamp = 0 }) => (
  <div style={{ position: "relative", width: 420, background: C.white, border: `${OUTLINE}px solid ${C.ink}`, borderRadius: 30, boxShadow: `0 12px 0 ${C.ink}`, padding: "20px 28px", fontFamily: BODY, fontWeight: 800, color: C.ink, rotate: "4deg" }}>
    <div style={{ fontFamily: HEAD, fontSize: 48 }}>🧪 HASIL LAB</div>
    {["Darah", "Lambung", "Jantung"].map((k) => (
      <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 38, marginTop: 10, gap: 12 }}>
        {k}
        <span style={{ color: C.white, background: "#1F9D55", borderRadius: 99, padding: "0 16px", fontSize: 32 }}>NORMAL ✓</span>
      </div>
    ))}
    {stamp > 0 && (
      <div
        style={{
          position: "absolute",
          right: -40,
          bottom: -50,
          fontFamily: HEAD,
          fontSize: 80,
          color: S.red,
          border: `8px solid ${S.red}`,
          borderRadius: 20,
          padding: "0 20px",
          rotate: "-14deg",
          background: "rgba(255,255,255,0.85)",
          scale: String(interpolate(stamp, [0, 1], [2.2, 1])),
          opacity: stamp,
        }}
      >
        ???
      </div>
    )}
  </div>
);

/** Macan kartun (simbol bahaya versi otak purba) */
const Tiger: React.FC<{ size?: number; mood?: "roar" | "chill" }> = ({ size = 420, mood = "roar" }) => {
  const t = useT();
  const roar = mood === "roar";
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" style={{ overflow: "visible" }}>
      <path d="M70 110 L60 30 L140 70 Z" fill={C.orange} {...SK} />
      <path d="M330 110 L340 30 L260 70 Z" fill={C.orange} {...SK} />
      <circle cx={200} cy={210} r={160} fill={C.orange} {...SK} />
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M${200 + d * 150} 170 l${-d * 50} 14 M${200 + d * 156} 220 l${-d * 56} 4 M${200 + d * 146} 270 l${-d * 50} -10`} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
        </g>
      ))}
      <path d="M170 60 l10 40 M200 52 l0 46 M230 60 l-10 40" stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
      <ellipse cx={200} cy={270} rx={100} ry={70} fill={C.cream} {...SK} />
      {roar ? (
        <>
          <path d="M120 150 L170 175 M280 150 L230 175" {...SK} strokeWidth={10} />
          <circle cx={150} cy={190} r={18} fill={C.ink} />
          <circle cx={250} cy={190} r={18} fill={C.ink} />
          <ellipse cx={200} cy={290} rx={62} ry={40 + Math.sin(t * 20) * 6} fill="#5A1030" {...SK} />
          <path d="M150 268 l12 22 l12 -22 M226 268 l12 22 l12 -22" fill={C.white} stroke={C.ink} strokeWidth={4} />
        </>
      ) : (
        <>
          <path d="M126 192 Q150 176 174 192 M226 192 Q250 176 274 192" fill="none" {...SK} />
          <path d="M170 290 Q200 312 230 290" fill="none" {...SK} />
        </>
      )}
      <path d="M180 240 L220 240 L200 262 Z" fill="#5A1030" {...SK} strokeWidth={5} />
    </svg>
  );
};

/** Lampu sirine siaga */
const Siren: React.FC<{ size?: number }> = ({ size = 200 }) => {
  const t = useT();
  const on = Math.sin(t * 16) > 0;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      {on &&
        [0, 1, 2, 3, 4].map((i) => {
          const a = -Math.PI / 2 + (i - 2) * 0.45;
          return <line key={i} x1={100 + Math.cos(a) * 95} y1={110 + Math.sin(a) * 95} x2={100 + Math.cos(a) * 135} y2={110 + Math.sin(a) * 135} stroke={C.yellow} strokeWidth={12} strokeLinecap="round" />;
        })}
      <path d="M40 150 Q40 50 100 50 Q160 50 160 150 Z" fill={on ? S.red : "#A3202F"} {...SK} />
      <rect x={24} y={146} width={152} height={34} rx={10} fill="#3A3F5C" {...SK} />
      <path d="M80 80 Q90 70 104 72" stroke="rgba(255,255,255,0.7)" strokeWidth={10} strokeLinecap="round" fill="none" />
    </svg>
  );
};

/** Jam weker berdering */
const AlarmClock: React.FC<{ size?: number }> = ({ size = 260 }) => {
  const t = useT();
  const wob = Math.sin(t * 50) * 6;
  return (
    <svg width={size} height={size} viewBox="0 0 260 260" style={{ overflow: "visible", rotate: `${wob}deg` }}>
      <circle cx={70} cy={50} r={36} fill={C.yellow} {...SK} />
      <circle cx={190} cy={50} r={36} fill={C.yellow} {...SK} />
      <circle cx={130} cy={145} r={100} fill={S.red} {...SK} />
      <circle cx={130} cy={145} r={76} fill={C.cream} {...SK} strokeWidth={5} />
      <path d="M130 145 L130 92 M130 145 L168 160" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      <path d="M60 238 L80 210 M200 238 L180 210" {...SK} />
      {[-1, 1].map((d) => (
        <path key={d} d={`M${130 + d * 125} 90 q${d * 20} 30 0 60`} fill="none" stroke={C.yellow} strokeWidth={9} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 30)} />
      ))}
    </svg>
  );
};

/** Diagram jalur otak–usus dengan sinyal berjalan */
const GutBrain: React.FC<{ at: number; anxious: number }> = ({ at, anxious }) => {
  const t = useT();
  const p = (n: number) => ((t - at) * 0.9 + n / 3) % 1;
  const jx = anxious * Math.sin(t * 40) * 6;
  return (
    <svg width={640} height={760} viewBox="0 0 640 760" style={{ overflow: "visible" }}>
      {/* otak */}
      <path d="M200 40 Q260 0 320 30 Q390 0 440 50 Q500 70 480 140 Q500 210 420 220 Q360 250 300 220 Q230 250 190 200 Q130 180 150 120 Q140 60 200 40 Z" fill="#FF9EC0" {...SK} />
      <path d="M250 70 Q280 110 250 150 M320 50 Q340 120 310 190 M390 70 Q410 120 380 170" fill="none" stroke="#D9628E" strokeWidth={9} strokeLinecap="round" />
      {/* jalur saraf */}
      <path id="vagus" d="M320 230 C 260 330, 400 400, 320 500" fill="none" stroke={C.cream} strokeWidth={14} strokeDasharray="4 22" strokeLinecap="round" />
      {t > at &&
        [0, 1, 2].map((n) => {
          const q = p(n);
          const x = 320 + Math.sin(q * Math.PI) * (q < 0.5 ? -40 : 40) * 0.9;
          const y = 230 + q * 270;
          return <circle key={n} cx={x} cy={y} r={16} fill={anxious > 0.5 ? S.red : C.lime} {...SK} strokeWidth={4} />;
        })}
      {/* usus */}
      <g transform={`translate(${jx} 0)`}>
        <path
          d="M180 520 Q180 490 220 490 L420 490 Q460 490 460 530 Q460 570 420 570 L230 570 Q190 570 190 610 Q190 650 230 650 L420 650 Q460 650 460 690 Q460 730 420 730 L240 730"
          fill="none"
          stroke={C.ink}
          strokeWidth={64}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M180 520 Q180 490 220 490 L420 490 Q460 490 460 530 Q460 570 420 570 L230 570 Q190 570 190 610 Q190 650 230 650 L420 650 Q460 650 460 690 Q460 730 420 730 L240 730"
          fill="none"
          stroke={anxious > 0.5 ? "#FF8F8F" : "#FFB7A0"}
          strokeWidth={46}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {anxious > 0.5 &&
          [0, 1, 2].map((i) => (
            <path key={i} d={`M${500 + i * 10} ${520 + i * 70} q24 -12 0 -24 q-24 -12 0 -24`} fill="none" stroke={S.red} strokeWidth={8} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 12 + i)} />
          ))}
      </g>
    </svg>
  );
};

/** Lambung kartun dengan meteran sensitivitas */
const Stomach: React.FC<{ size?: number; ouch?: number }> = ({ size = 460, ouch = 0 }) => {
  const t = useT();
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" style={{ overflow: "visible" }}>
      <path d="M150 20 L150 90 Q60 110 70 230 Q90 360 230 350 Q350 340 330 240 Q310 170 250 190 Q200 200 210 120 L210 20 Z" fill="#FF9EB0" {...SK} />
      <path d="M110 220 Q140 300 220 300" fill="none" stroke="#E06C86" strokeWidth={10} strokeLinecap="round" />
      {ouch > 0.5 ? (
        <>
          <path d="M140 200 l24 14 l-24 14 M250 200 l-24 14 l24 14" fill="none" {...SK} strokeWidth={7} />
          <ellipse cx={196} cy={268} rx={26} ry={20 + Math.sin(t * 22) * 4} fill="#5A1030" {...SK} strokeWidth={5} />
        </>
      ) : (
        <>
          <circle cx={156} cy={214} r={12} fill={C.ink} />
          <circle cx={236} cy={214} r={12} fill={C.ink} />
          <path d="M170 262 Q196 252 222 262" fill="none" {...SK} strokeWidth={6} />
        </>
      )}
    </svg>
  );
};

/** Meteran horizontal */
const Meter: React.FC<{ label: string; value: number; color: string; w?: number }> = ({ label, value, color, w = 820 }) => (
  <div style={{ width: w, fontFamily: BODY, fontWeight: 800, color: C.cream, fontSize: 44 }}>
    <div style={{ marginBottom: 8 }}>{label}</div>
    <div style={{ height: 64, borderRadius: 99, background: C.bg1, border: `${OUTLINE}px solid ${C.ink}`, overflow: "hidden" }}>
      <div style={{ width: `${Math.max(6, value * 100)}%`, height: "100%", background: color, borderRight: `6px solid ${C.ink}` }} />
    </div>
  </div>
);

/** Lingkaran napas: membesar saat tarik, sedikit lagi saat tambah, mengecil pelan saat buang */
const BreathCircle: React.FC<{ a: number; b: number; c: number; d: number }> = ({ a, b, c, d }) => {
  const t = useT();
  const r =
    t < b
      ? interpolate(t, [a, b], [0.45, 0.82], { ...clamp, easing: easeInOut })
      : t < c
        ? interpolate(t, [b, b + 0.8], [0.82, 1], { ...clamp, easing: easeOut })
        : interpolate(t, [c, d], [1, 0.45], { ...clamp, easing: easeInOut });
  const phase = t < b ? 0 : t < c ? 1 : 2;
  const labels = ["👃 TARIK", "👃 TAMBAH DIKIT", "👄 BUANG PELAN"];
  const cols = [C.cyan, C.lime, C.yellow];
  return (
    <div style={{ position: "relative", width: 640, height: 640 }}>
      {[1.25, 1.12].map((k, i) => (
        <div key={i} style={{ position: "absolute", left: 320 - 300 * r * k, top: 320 - 300 * r * k, width: 600 * r * k, height: 600 * r * k, borderRadius: "50%", background: cols[phase], opacity: 0.12 + i * 0.08 }} />
      ))}
      <div
        style={{
          position: "absolute",
          left: 320 - 300 * r,
          top: 320 - 300 * r,
          width: 600 * r,
          height: 600 * r,
          borderRadius: "50%",
          background: cols[phase],
          border: `${OUTLINE}px solid ${C.ink}`,
          boxShadow: `0 14px 0 ${C.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontFamily: HEAD, fontSize: 64, color: C.ink, textAlign: "center", lineHeight: 1 }}>{labels[phase]}</div>
      </div>
    </div>
  );
};

/** Batang perbandingan */
const Bars: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  const g = (d: number) => interpolate(t, [at + d, at + d + 0.8], [0, 1], { ...clamp, easing: easeOut });
  const rows: [string, number, string][] = [
    ["Napas cyclic sighing", 1, C.lime],
    ["Meditasi biasa", 0.62, "#B9A6FF"],
  ];
  return (
    <div style={{ display: "flex", gap: 70, alignItems: "flex-end", height: 430 }}>
      {rows.map(([l, v, col], i) => (
        <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          {i === 0 && t > at + 1 && <div style={{ fontSize: 70 }}>😌</div>}
          <div style={{ width: 210, height: 330 * v * g(i * 0.25), background: col, border: `${OUTLINE}px solid ${C.ink}`, borderRadius: "26px 26px 8px 8px", boxShadow: `0 10px 0 ${C.ink}` }} />
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 36, color: C.cream, textAlign: "center", width: 300, lineHeight: 1.05 }}>{l}</div>
        </div>
      ))}
    </div>
  );
};

/** Cap silang "BUKAN" */
const Stamp: React.FC<{ at: number; children: React.ReactNode; color?: string; rotate?: number }> = ({ at, children, color = S.red, rotate = -8 }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.02) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 9, stiffness: 260 } });
  return (
    <div
      style={{
        fontFamily: HEAD,
        fontSize: 92,
        color,
        border: `10px solid ${color}`,
        borderRadius: 26,
        padding: "0 30px 6px",
        background: "rgba(20,11,36,0.6)",
        rotate: `${rotate}deg`,
        scale: String(interpolate(s, [0, 1], [2.4, 1])),
        opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

/* ================================================================== adegan */
const Ep7Scenes: React.FC = () => {
  const t = useT();
  const cam = useShake([
    { t: 0.45, a: 10 },
    { t: 4.83, a: 10 },
    { t: 13.84, a: 26 },
    { t: 16.84, a: 22 },
    { t: 28.8, a: 18 },
    { t: 38.17, a: 16 },
    { t: 45.8, a: 14 },
    { t: 49.65, a: 22 },
    { t: 68.82, a: 12 },
  ]);
  return (
    <AbsoluteFill style={{ translate: cam }}>
      {/* 1 — lambung perih tiap mau presentasi */}
      <Scene a={0} b={1.8} zoom={false}>
        <Room {...OFFICE}>
          <div style={{ position: "absolute", right: 50, top: 70 }}>
            <Screen />
          </div>
        </Room>
        <div style={{ position: "absolute", left: 110, top: 470 }}>
          <Jo size={680} expr="pain" gut={interpolate(t, [0.4, 0.6], [0, 1], clamp)} shake={t > 0.45 && t < 1.2 ? 6 : 0} />
        </div>
        <Pop at={0.5} x={470} y={800}>
          <Label size={56} bg={S.red} color={C.white}>
            😖 LAMBUNG PERIH
          </Label>
        </Pop>
        <Sticker at={0.08} y={290} bg={C.cream} size={72}>
          MAU PRESENTASI 📊
        </Sticker>
      </Scene>

      {/* 2 — kepala kayak diiket pas deadline */}
      <Scene a={1.8} b={3.75}>
        <Room {...OFFICE} />
        <div style={{ position: "absolute", left: 90, top: 470 }}>
          <Jo size={680} expr="pain" seed={1} band={interpolate(t, [2.4, 2.7], [0, 1], clamp)} />
        </div>
        <Pop at={3.1} x={650} y={520}>
          <Calendar w={320} />
        </Pop>
        <Sticker at={1.86} y={290} bg={C.yellow} size={72}>
          KEPALA KAYAK DIIKET 🪢
        </Sticker>
      </Scene>

      {/* 3 — leher kaku, deg-degan, padahal rebahan */}
      <Scene a={3.75} b={7.1}>
        <Room {...NIGHT} />
        <div style={{ position: "absolute", left: 90, top: 820 }}>
          <Bed w={900} />
        </div>
        <div style={{ position: "absolute", left: 296, top: 640, rotate: "-90deg" }}>
          <Jo size={540} expr={t > 4.8 ? "shocked" : "pain"} seed={2} neck={interpolate(t, [4.0, 4.3], [0, 1], clamp)} heart={interpolate(t, [4.8, 5.0], [0, 1], clamp)} />
        </div>
        <Pop at={4.07} x={70} y={470}>
          <Label size={52} bg={C.orange}>
            🦒 LEHER KAKU
          </Label>
        </Pop>
        <Pop at={4.83} x={560} y={560}>
          <Label size={52} bg={S.red} color={C.white} rotate={3}>
            💓 DEG-DEGAN
          </Label>
        </Pop>
        <Sticker at={5.9} y={290} bg={C.cream} size={68}>
          PADAHAL LAGI REBAHAN 🛌
        </Sticker>
      </Scene>

      {/* 4 — obat maag, ke dokter, katanya normal */}
      <Scene a={7.1} b={10.3}>
        <Room {...OFFICE} />
        <div style={{ position: "absolute", left: 60, top: 520 }}>
          <Jo size={640} expr={t > 9.3 ? "normal" : "pain"} pose={t > 9.3 ? "shrug" : "idle"} seed={3} gut={t < 8.2 ? 1 : 0} />
        </div>
        <Pop at={7.36} x={620} y={420}>
          <Meds />
        </Pop>
        <Pop at={8.55} x={540} y={740} from="right">
          <LabCard stamp={interpolate(t, [9.6, 9.9], [0, 1], clamp)} />
        </Pop>
        <Sticker at={7.2} y={290} bg={C.lime} size={64} out={8.45}>
          UDAH MINUM OBAT MAAG 💊
        </Sticker>
        <Sticker at={8.6} y={290} bg={C.cyan} size={64}>
          {"UDAH KE DOKTER 🩺"}
        </Sticker>
      </Scene>

      {/* 5 — makhluk halus nempel di pundak (scanner) */}
      <Scene a={10.3} b={13.8}>
        <Room {...OFFICE} dark={interpolate(t, [10.4, 10.9], [0, 0.6], clamp)} />
        <div style={{ position: "absolute", left: 230, top: 520 }}>
          <Jo size={680} expr="pain" seed={3} neck={0.6} />
        </div>
        <Scanner at={11.5} dur={0.9} top={330} height={820}>
          <div style={{ position: "absolute", left: 560, top: 380, rotate: "10deg" }}>
            <SiHalus size={360} variant="stress" />
          </div>
        </Scanner>
        <Pop at={12.9} x={560} y={790}>
          <Label size={44} bg={C.lime}>
            ⬅ NEMPEL DI PUNDAK
          </Label>
        </Pop>
        <Sticker at={10.4} y={290} bg={C.bg1} color={C.lime} size={70}>
          ADA MAKHLUK HALUS 👻
        </Sticker>
      </Scene>

      {/* 6 — judul: STRES */}
      <Scene a={13.8} b={15.1}>
        <div style={{ position: "absolute", left: 300, top: 380 }}>
          <Pop at={13.82}>
            <SiHalus size={560} variant="stress" mood="laugh" />
          </Pop>
        </div>
        <Sticker at={13.84} y={960} bg={S.red} color={C.white} size={96} rotate={-5}>
          {"SI HALUS:\nSTRES"}
        </Sticker>
      </Scene>

      {/* 7 — otak ngira dikejar macan */}
      <Scene a={15.1} b={17.75}>
        <Sticker at={15.15} y={290} bg={C.cream} size={68}>
          OTAK: "ADA MACAN!" 🐯
        </Sticker>
        <div style={{ position: "absolute", left: interpolate(t, [15.2, 17.7], [180, 90]), top: 520 }}>
          <Jo size={620} expr={t > 16.8 ? "shocked" : "normal"} seed={4} shake={t > 16.84 ? 8 : 0} />
        </div>
        <Pop at={16.84} x={560} y={500} from="right">
          <Tiger size={440} />
        </Pop>
        <Pop at={15.9} x={90} y={420}>
          <Bubble w={330} size={46} tail="down">
            🧠 BAHAYA!!
          </Bubble>
        </Pop>
      </Scene>

      {/* 8 — mode siaga: jantung, otot, napas */}
      <Scene a={17.75} b={21.8}>
        <div style={{ position: "absolute", left: 800, top: 400 }}>
          <Siren size={180} />
        </div>
        <Sticker at={17.8} y={290} bg={S.red} color={C.white} size={70} x={60}>
          MODE SIAGA 🚨
        </Sticker>
        <div style={{ position: "absolute", left: 90, top: 560 }}>
          <Badge icon="❤️" label="JANTUNG DIPACU" at={18.89} color={S.red} />
        </div>
        <div style={{ position: "absolute", left: 90, top: 790 }}>
          <Badge icon="💪" label="OTOT TEGANG" at={19.9} color={C.orange} />
        </div>
        <div style={{ position: "absolute", left: 90, top: 1020 }}>
          <Badge icon="💨" label="NAPAS PENDEK" at={20.91} color={C.cyan} />
        </div>
      </Scene>

      {/* 9 — sebentar OK, tapi macannya nggak pergi */}
      <Scene a={21.8} b={25.85}>
        <Room {...OFFICE}>
          <div style={{ position: "absolute", left: 60, bottom: 160 }}>
            <svg width={880} height={220} viewBox="0 0 880 220">
              <rect x={20} y={60} width={840} height={110} rx={40} fill="#8A4B6B" {...SK} />
              <rect x={0} y={30} width={90} height={170} rx={30} fill="#9C5A7C" {...SK} />
              <rect x={790} y={30} width={90} height={170} rx={30} fill="#9C5A7C" {...SK} />
            </svg>
          </div>
        </Room>
        {t < 23.3 ? (
          <>
            <Sticker at={21.86} y={290} bg={C.lime} size={68}>
              SEBENTAR? NGGAK APA-APA ✅
            </Sticker>
            <div style={{ position: "absolute", left: 330, top: 520 }}>
              <Jo size={640} expr="happy" seed={5} />
            </div>
          </>
        ) : (
          <>
            <Sticker at={23.36} y={290} bg={S.red} color={C.white} size={60}>
              MASALAHNYA... 😬
            </Sticker>
            <div style={{ position: "absolute", left: 90, top: 520 }}>
              <Jo size={640} expr="pain" seed={5} heart={1} />
            </div>
            <Pop at={24.16} x={530} y={470} from="right">
              <Tiger size={400} mood="chill" />
            </Pop>
            <Pop at={24.9} x={520} y={900}>
              <Label size={46} bg={C.yellow}>
                🐯 NGGAK PERGI-PERGI
              </Label>
            </Pop>
          </>
        )}
      </Scene>

      {/* 10 — cicilan, kerjaan, tugas, berita: alarm tiap hari */}
      <Scene a={25.85} b={30.15}>
        <div style={{ position: "absolute", left: 70, top: 330 }}>
          <Headline at={25.88} tag="CICILAN" text="Jatuh tempo besok 💸" color={S.red} w={470} rotate={-4} />
        </div>
        <div style={{ position: "absolute", left: 560, top: 370 }}>
          <Headline at={26.71} tag="KERJAAN" text="Revisi ke-7 😩" color={S.violet} w={450} rotate={4} />
        </div>
        <div style={{ position: "absolute", left: 90, top: 640 }}>
          <Headline at={27.3} tag="TUGAS" text="Kumpul jam 23.59 ⏰" color={C.orange} w={460} rotate={3} />
        </div>
        <div style={{ position: "absolute", left: 580, top: 680 }}>
          <Headline at={27.89} tag="BERITA" text="Harga naik lagi 📈" color={S.blue} w={430} rotate={-3} />
        </div>
        <Pop at={28.8} x={410} y={870}>
          <AlarmClock size={270} />
        </Pop>
        <Sticker at={28.85} y={1110} bg={S.red} color={C.white} size={58}>
          ALARM BUNYI TIAP HARI 🚨
        </Sticker>
      </Scene>

      {/* 11 — otot tegang terus: kepala & leher */}
      <Scene a={30.15} b={33.55}>
        <Sticker at={30.21} y={290} bg={C.orange} size={68}>
          OTOT TEGANG TERUS 😣
        </Sticker>
        <div style={{ position: "absolute", left: 80, top: 460 }}>
          <Jo size={700} expr="pain" seed={6} neck={interpolate(t, [30.5, 31.0], [0, 1], clamp)} band={interpolate(t, [32.0, 32.3], [0, 1], clamp)} />
        </div>
        <div style={{ position: "absolute", left: 560, top: 560 }}>
          <BodySpot at={32.04} icon="🤕" label="SAKIT KEPALA" />
        </div>
        <div style={{ position: "absolute", left: 560, top: 720 }}>
          <BodySpot at={32.88} icon="🦒" label="LEHER KAKU" color={C.orange} />
        </div>
      </Scene>

      {/* 12 — usus nyambung ke otak */}
      <Scene a={33.55} b={37.5}>
        <Sticker at={33.6} y={290} bg={C.cyan} size={64}>
          USUS ↔ OTAK: NYAMBUNG 🧠
        </Sticker>
        <div style={{ position: "absolute", left: 60, top: 420, scale: "0.95" }}>
          <GutBrain at={34.1} anxious={t > 35.89 ? 1 : 0} />
        </div>
        <Pop at={35.89} x={690} y={500}>
          <Label size={52} bg={S.red} color={C.white} rotate={4}>
            😰 CEMAS
          </Label>
        </Pop>
        <Pop at={36.45} x={560} y={1010}>
          <Label size={48} bg={C.yellow}>
            🌀 PERUT BERULAH
          </Label>
        </Pop>
      </Scene>

      {/* 13 — psikosomatik: bukan pura-pura, sakitnya nyata */}
      <Scene a={37.5} b={43.4}>
        <Sticker at={38.17} y={300} bg={C.lime} size={104} rotate={-4}>
          PSIKOSOMATIK
        </Sticker>
        <div style={{ position: "absolute", left: 120, top: 520 }}>
          <Stamp at={39.37}>❌ PURA-PURA</Stamp>
        </div>
        <div style={{ position: "absolute", left: 300, top: 680 }}>
          <Stamp at={40.31} rotate={6}>
            ❌ LEBAY
          </Stamp>
        </div>
        <Pop at={40.91} x={70} y={880}>
          <div style={{ display: "flex", gap: 24 }}>
            <Label size={48} bg={C.lime} rotate={-3}>
              ✅ SAKITNYA NYATA
            </Label>
          </div>
        </Pop>
        <Pop at={42.01} x={400} y={1010}>
          <Label size={48} bg={C.cream} rotate={3}>
            🧠 PEMICUNYA PIKIRAN
          </Label>
        </Pop>
        <Pop at={38.4} x={810} y={860}>
          <SiHalus size={200} variant="stress" mood="grin" />
        </Pop>
      </Scene>

      {/* 14 — mitos: stres bikin asam lambung nambah */}
      <Scene a={43.4} b={46.2}>
        <Sticker at={43.45} y={290} bg={C.yellow} size={74}>
          MITOS ATAU FAKTA? 🤔
        </Sticker>
        <Pop at={44.18} x={90} y={470}>
          <Bubble w={900} size={60}>
            "Stres bikin asam lambung nambah banyak"
          </Bubble>
        </Pop>
        <div style={{ position: "absolute", left: 330, top: 800 }}>
          <Stamp at={45.8}>MITOS ❌</Stamp>
        </div>
      </Scene>

      {/* 15 — lambung jadi lebih sensitif, perih dikit kayak ditusuk */}
      <Scene a={46.2} b={50.1}>
        <Sticker at={46.25} y={290} bg={C.lime} size={68}>
          FAKTANYA: LEBIH SENSITIF 📈
        </Sticker>
        <div style={{ position: "absolute", left: 300, top: 420 }}>
          <Stomach size={470} ouch={t > 49.6 ? 1 : 0} />
        </div>
        <Pop at={48.33} x={760} y={520} from="right">
          <div style={{ fontSize: 130, rotate: `${-30 + (t > 49.6 ? 0 : 20)}deg` }}>📌</div>
        </Pop>
        <div style={{ position: "absolute", left: 130, top: 940 }}>
          <Meter label="Sensitivitas lambung" value={interpolate(t, [46.8, 48.2], [0.25, 0.95], { ...clamp, easing: easeOut })} color={S.red} />
        </div>
      </Scene>

      {/* 16 — terus gimana? napas (cyclic sighing) */}
      <Scene a={50.1} b={56.65}>
        <Sticker at={50.16} y={290} bg={C.cream} size={68} out={55.5}>
          TERUS GIMANA? 🤔
        </Sticker>
        <Sticker at={55.66} y={290} bg={C.lime} size={72}>
          5 MENIT / HARI ⏱️
        </Sticker>
        <div style={{ position: "absolute", left: 220, top: 430 }}>
          <BreathCircle a={50.95} b={52.2} c={53.8} d={56.4} />
        </div>
        <Pop at={51.0} x={60} y={1090}>
          <Label size={40} bg={C.cyan}>
            1. TARIK
          </Label>
        </Pop>
        <Pop at={52.21} x={330} y={1090}>
          <Label size={40} bg={C.lime}>
            2. TAMBAH DIKIT
          </Label>
        </Pop>
        <Pop at={53.81} x={720} y={1090}>
          <Label size={40} bg={C.yellow}>
            3. BUANG PELAN
          </Label>
        </Pop>
      </Scene>

      {/* 17 — penelitian Stanford */}
      <Scene a={56.65} b={60.7}>
        <Sticker at={56.7} y={290} bg={C.cream} size={64}>
          🎓 PENELITIAN STANFORD 2023
        </Sticker>
        <div style={{ position: "absolute", left: 120, top: 470 }}>
          <Bars at={57.9} />
        </div>
        <Pop at={58.65} x={680} y={480}>
          <Label size={48} bg={C.lime} rotate={4}>
            MOOD ⬆
          </Label>
        </Pop>
        <Pop at={59.4} x={760} y={680}>
          <SiHalus size={220} variant="stress" mood="scared" opacity={0.85} />
        </Pop>
      </Scene>

      {/* 18 — tetap periksa ke dokter, cerita ke psikolog */}
      <Scene a={60.7} b={66.9}>
        <Sticker at={60.75} y={290} bg={C.cyan} size={66}>
          TETAP PERIKSA, YA 🩺
        </Sticker>
        <div style={{ position: "absolute", top: 470, left: 80 }}>
          <CheckRow icon="🩺" label="Cek ke dokter dulu" at={60.95} />
        </div>
        <div style={{ position: "absolute", top: 660, left: 80 }}>
          <CheckRow icon="🗣️" label="Normal tapi masih sakit? Cerita ke psikolog" at={64.3} />
        </div>
        <Sticker at={65.69} y={900} bg={C.lime} size={70} rotate={3}>
          BUKAN BERARTI LEMAH 💪
        </Sticker>
      </Scene>

      {/* 19 — penutup: badan ngomong pakai bahasa sakit */}
      <Scene a={66.9} b={EP7.endStart}>
        <div style={{ position: "absolute", left: 120, top: 520 }}>
          <Jo size={660} expr="happy" pose="wave" seed={7} />
        </div>
        <Pop at={67.98} x={540} y={420}>
          <Bubble w={460} size={50} tail="left">
            "Halo, aku capek nih" 🤕
          </Bubble>
        </Pop>
        <Sticker at={66.94} y={290} bg={C.cream} size={62}>
          BADAN KAMU LAGI NGOMONG...
        </Sticker>
        <Sticker at={68.82} y={1010} bg={S.red} color={C.white} size={66} rotate={3}>
          ...PAKAI BAHASA SAKIT 🤕
        </Sticker>
        <Pop at={68.2} x={interpolate(t, [68.9, 69.9], [700, 1100], clamp)} y={interpolate(t, [68.9, 69.9], [620, 360], clamp)}>
          <SiHalus size={240} variant="stress" mood="busted" />
        </Pop>
      </Scene>
    </AbsoluteFill>
  );
};

export const Ep7: React.FC = () => (
  <Episode ep={7} accent={S.red} tint="#4A1426" words={words} endStart={EP7.endStart} revealAt={EP7.revealAt} flashes={[13.84, 38.17]}>
    <Ep7Scenes />
  </Episode>
);
