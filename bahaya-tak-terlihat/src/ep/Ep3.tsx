import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C, HEAD, OUTLINE, clamp, easeOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode } from "../Episode";
import { BigStat, Pop, Scanner, Sticker, useShake } from "../Kit";
import { Bubble, CheckRow, InfoCard, Room } from "../Props";
import { Scene } from "./Ep1";
import { words } from "./ep3.words";
import { warp } from "./ep3.warp";

/** Semua waktu = detik absolut pada voice-over EP3 (lihat data/ep3_words.json) */
/** Adegan ditulis dalam detik VO lama; `warp` memetakannya ke VO baru (Adrianleoh) */
export const EP3 = { dur: 52.2, endStart: 47.77, revealAt: 49.9 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const WALL = "#4A2440";
const FLOOR = "#2E1428";

/* ------------------------------------------------------------ props lokal */

/** Mesin pabrik di latar */
const Machine: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => {
  const t = useT();
  return (
    <svg width={300 * scale} height={330 * scale} viewBox="0 0 300 330" style={{ position: "absolute", left: x, top: y }}>
      <rect x={10} y={60} width={280} height={260} rx={24} fill="#6B3A5C" stroke={C.ink} strokeWidth={OUTLINE} />
      <rect x={40} y={100} width={120} height={80} rx={12} fill="#2E1428" stroke={C.ink} strokeWidth={5} />
      <circle cx={225} cy={140} r={44} fill={C.yellow} stroke={C.ink} strokeWidth={OUTLINE} />
      <g style={{ rotate: `${t * 240}deg`, transformOrigin: "225px 140px" }}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={221} y={100} width={8} height={80} fill={C.ink} style={{ rotate: `${i * 45}deg`, transformOrigin: "225px 140px" }} />
        ))}
      </g>
      <rect x={40} y={220} width={220} height={22} rx={11} fill={C.pink} stroke={C.ink} strokeWidth={5} />
      <rect x={40} y={262} width={150} height={22} rx={11} fill={C.cyan} stroke={C.ink} strokeWidth={5} />
      <rect x={110} y={10} width={60} height={60} fill="#5A2E4C" stroke={C.ink} strokeWidth={OUTLINE} />
    </svg>
  );
};

/** Garis-garis getar bunyi di sekitar mesin */
const NoiseLines: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = C.pink }) => {
  const t = useT();
  return (
    <svg width={200} height={260} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      {[0, 1, 2].map((i) => {
        const p = (t * 1.8 + i / 3) % 1;
        return (
          <path
            key={i}
            d={`M${20 + p * 120} ${60 - p * 40} Q${60 + p * 160} 130 ${20 + p * 120} ${200 + p * 40}`}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            opacity={1 - p}
          />
        );
      })}
    </svg>
  );
};

/** Balon teriakan bergerigi */
const ShoutBubble: React.FC<{ text: string; w?: number; h?: number }> = ({ text, w = 460, h = 260 }) => {
  const t = useT();
  const n = 18;
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const r = i % 2 ? 0.78 : 1;
    const px = w / 2 + Math.cos(a) * (w / 2 - 8) * r;
    const py = h / 2 + Math.sin(a) * (h / 2 - 8) * r;
    d += `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)} `;
  }
  return (
    <div style={{ position: "relative", width: w, height: h, translate: `${Math.sin(t * 40) * 3}px 0px` }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <path d={d + "Z"} fill={C.yellow} stroke={C.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: HEAD,
          fontSize: 66,
          lineHeight: 1,
          color: C.ink,
          textAlign: "center",
          whiteSpace: "pre-line",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Hitung mundur 5 detik */
const Countdown: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const t = useT();
  if (t < at) return null;
  const p = interpolate(t, [at, at + 5], [0, 1], clamp);
  const n = Math.max(0, Math.ceil(5 - (t - at)));
  const R = 70;
  const L = 2 * Math.PI * R;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 180, height: 180 }}>
      <svg width={180} height={180} style={{ rotate: "-90deg" }}>
        <circle cx={90} cy={90} r={R} fill={C.bg1} stroke={C.ink} strokeWidth={26} />
        <circle cx={90} cy={90} r={R} fill="none" stroke={C.lime} strokeWidth={16} strokeDasharray={L} strokeDashoffset={L * p} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontSize: 84, color: C.cream }}>{n}</div>
    </div>
  );
};

/** Telinga kartun besar. cracks 0..1, rings = getar berdenging */
const Ear: React.FC<{ size?: number; cracks?: number; ring?: number; bend?: number }> = ({ size = 560, cracks = 0, ring = 0, bend = 0 }) => {
  const t = useT();
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 400 500" style={{ overflow: "visible" }}>
      {ring > 0 &&
        [0, 1, 2, 3].map((i) => {
          const p = (t * 1.4 + i / 4) % 1;
          return <circle key={i} cx={210} cy={250} r={120 + p * 220} fill="none" stroke={C.yellow} strokeWidth={12} opacity={(1 - p) * ring} />;
        })}
      <path
        d="M120 330 C40 260 50 90 190 50 C320 15 380 140 340 230 C315 290 270 300 260 350 C250 410 220 450 170 440 C130 432 120 390 120 330 Z"
        fill={C.skin}
        stroke={C.ink}
        strokeWidth={10}
        strokeLinejoin="round"
      />
      <path d="M170 330 C120 260 140 140 220 120 C290 105 320 170 290 220 C270 255 235 250 230 290" fill="none" stroke={C.skinShade} strokeWidth={22} strokeLinecap="round" />
      <path d="M210 250 C190 210 220 180 250 195" fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      <ellipse cx={215} cy={262} rx={26} ry={30} fill="#5A2A2A" stroke={C.ink} strokeWidth={6} />
      {/* rambut halus di dalam telinga (sel rambut) yang tertekuk */}
      {[0, 1, 2, 3, 4].map((i) => {
        const bx = 190 + i * 12;
        const b = bend * (12 + i * 4);
        return <path key={i} d={`M${bx} 300 Q${bx + b * 0.4} 278 ${bx + b} 262`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />;
      })}
      {cracks > 0 && (
        <g stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={cracks}>
          <path d="M290 70 L270 110 L292 128 L262 170" strokeDasharray={140} strokeDashoffset={140 * (1 - cracks)} />
          <path d="M80 200 L120 214 L104 248 L138 262" strokeDasharray={140} strokeDashoffset={140 * (1 - cracks)} />
          <path d="M330 250 L300 262 L318 292" strokeDasharray={90} strokeDashoffset={90 * (1 - cracks)} />
        </g>
      )}
    </svg>
  );
};

/** Gerinda dengan percikan api */
const Grinder: React.FC<{ x: number; y: number; on: boolean }> = ({ x, y, on }) => {
  const t = useT();
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      <svg width={340} height={200} viewBox="0 0 340 200" style={{ overflow: "visible", translate: on ? `${(random(`g${frame}`) - 0.5) * 6}px ${(random(`h${frame}`) - 0.5) * 6}px` : undefined }}>
        <rect x={60} y={70} width={220} height={70} rx={30} fill={C.cyan} stroke={C.ink} strokeWidth={OUTLINE} />
        <rect x={250} y={80} width={70} height={50} rx={14} fill="#1F8FB0" stroke={C.ink} strokeWidth={OUTLINE} />
        <circle cx={70} cy={150} r={54} fill="#B9B4C8" stroke={C.ink} strokeWidth={OUTLINE} />
        <g style={{ rotate: `${t * 2000}deg`, transformOrigin: "70px 150px" }}>
          <line x1={70} y1={100} x2={70} y2={200} stroke={C.ink} strokeWidth={5} />
          <line x1={20} y1={150} x2={120} y2={150} stroke={C.ink} strokeWidth={5} />
        </g>
        {on &&
          new Array(14).fill(0).map((_, i) => {
            const p = ((t * 3 + random(`sp${i}`)) % 1);
            const a = Math.PI * (0.55 + random(`sa${i}`) * 0.5);
            const r = 40 + p * 220;
            return (
              <line
                key={i}
                x1={70 + Math.cos(a) * r}
                y1={200 + Math.sin(a) * r * 0.5 - p * 10}
                x2={70 + Math.cos(a) * (r + 30)}
                y2={200 + Math.sin(a) * (r + 30) * 0.5 - p * 10}
                stroke={i % 2 ? C.yellow : C.orange}
                strokeWidth={8}
                strokeLinecap="round"
                opacity={1 - p}
              />
            );
          })}
      </svg>
    </div>
  );
};

/** Meteran dB setengah lingkaran */
const DbMeter: React.FC<{ value: number }> = ({ value }) => {
  const a = interpolate(value, [40, 110], [-90, 90], clamp);
  return (
    <div style={{ width: 460, padding: "26px 20px 22px", borderRadius: 40, background: C.bg1, border: `${OUTLINE}px solid ${C.ink}`, boxShadow: `0 12px 0 ${C.ink}`, textAlign: "center" }}>
      <svg width={400} height={220} viewBox="0 0 400 220">
        <path d="M40 200 A160 160 0 0 1 200 40" fill="none" stroke={C.lime} strokeWidth={34} />
        <path d="M200 40 A160 160 0 0 1 313 87" fill="none" stroke={C.yellow} strokeWidth={34} />
        <path d="M313 87 A160 160 0 0 1 360 200" fill="none" stroke={C.pink} strokeWidth={34} />
        <g style={{ rotate: `${a}deg`, transformOrigin: "200px 200px" }}>
          <line x1={200} y1={200} x2={200} y2={62} stroke={C.cream} strokeWidth={12} strokeLinecap="round" />
        </g>
        <circle cx={200} cy={200} r={22} fill={C.cream} stroke={C.ink} strokeWidth={6} />
      </svg>
      <div style={{ fontFamily: HEAD, fontSize: 84, color: value >= 85 ? C.pink : C.lime, lineHeight: 1 }}>{Math.round(value)} dB</div>
    </div>
  );
};

/** Earbud putih + kabel, ditempel di posisi telinga Worker */
const Earbuds: React.FC<{ x: number; y: number; size: number }> = ({ x, y, size }) => {
  const t = useT();
  const bob = Math.sin(t * Math.PI * 1.8) * 5;
  const k = size / 660;
  const ex = (e: number) => x + (e + 30) * k;
  const ey = y + (205 + 20) * k + bob;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {[65, 335].map((e) => (
        <g key={e}>
          <path d={`M${ex(e)} ${ey + 20} Q${ex(e) + (e < 200 ? -10 : 10)} ${ey + 160} ${ex(200)} ${ey + 260}`} fill="none" stroke={C.white} strokeWidth={8} />
          <circle cx={ex(e)} cy={ey} r={24} fill={C.white} stroke={C.ink} strokeWidth={6} />
        </g>
      ))}
    </svg>
  );
};

/** Bar volume naik sampai MAX */
const VolumeBar: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  const v = interpolate(t, [at, at + 1.3], [0.2, 1], { ...clamp, easing: easeOut });
  const n = 10;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, padding: 22, borderRadius: 34, background: C.bg1, border: `${OUTLINE}px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}` }}>
      <div style={{ fontSize: 70, marginRight: 8 }}>🔊</div>
      {new Array(n).fill(0).map((_, i) => {
        const on = i / n < v;
        const col = i < 5 ? C.lime : i < 8 ? C.yellow : C.pink;
        return <div key={i} style={{ width: 30, height: 40 + i * 14, borderRadius: 8, background: on ? col : "rgba(255,255,255,0.12)", border: `4px solid ${C.ink}` }} />;
      })}
      <div style={{ fontFamily: HEAD, fontSize: 58, color: v > 0.95 ? C.pink : C.cream, marginLeft: 10 }}>{v > 0.95 ? "MAX!" : ""}</div>
    </div>
  );
};

/** Bendera putih menyerah kecil */
const WhiteFlag: React.FC = () => {
  const t = useT();
  const w = Math.sin(t * 9) * 10;
  return (
    <svg width={200} height={220} viewBox="0 0 200 220" style={{ overflow: "visible" }}>
      <line x1={40} y1={210} x2={40} y2={20} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      <path d={`M44 24 Q100 ${10 + w} 160 ${30 - w * 0.5} L160 ${100 - w * 0.5} Q100 ${82 + w} 44 98 Z`} fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    </svg>
  );
};

/** Jam dengan jarum berputar */
const Timer: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  const a = interpolate(t, [at, at + 2.2], [0, 90], { ...clamp, easing: easeOut });
  return (
    <svg width={300} height={300} viewBox="0 0 300 300">
      <circle cx={150} cy={160} r={120} fill={C.cream} stroke={C.ink} strokeWidth={12} />
      <path d={`M150 160 L150 40 A120 120 0 0 1 ${150 + 120 * Math.sin((a * Math.PI) / 180)} ${160 - 120 * Math.cos((a * Math.PI) / 180)} Z`} fill={C.pink} opacity={0.75} />
      <rect x={128} y={8} width={44} height={30} rx={8} fill={C.ink} />
      <g style={{ rotate: `${a}deg`, transformOrigin: "150px 160px" }}>
        <line x1={150} y1={160} x2={150} y2={60} stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
      </g>
      <circle cx={150} cy={160} r={14} fill={C.ink} />
    </svg>
  );
};

const LADDER: [string, string, number][] = [
  ["85 dB", "8 jam", 17.3],
  ["88 dB", "4 jam", 18.1],
  ["91 dB", "2 jam", 18.8],
  ["94 dB", "1 jam", 19.4],
  ["97 dB", "30 menit", 20.0],
  ["100 dB", "15 menit", 20.6],
];

const COWORKER = { shirt: "#8A5A3C", hair: "#C9CCD8", pants: "#2A2140" } as const;

const Ep3Scenes: React.FC = () => {
  const t = useT();
  const cam = useShake([
    { t: 0.13, a: 12 },
    { t: 11.16, a: 30 },
    { t: 21.36, a: 14 },
    { t: 30.04, a: 16 },
    { t: 50.12, a: 12 },
  ]);
  return (
    <>
      <AbsoluteFill style={{ translate: cam }}>
        {/* 1 — HOOK: tes 5 detik, teriak di jarak selengan */}
        <Scene a={0} b={5.3} zoom={false}>
          <Room wall={WALL} floor={FLOOR}>
            <Machine x={620} y={40} scale={1.05} />
            <NoiseLines x={900} y={60} />
          </Room>
          <div style={{ position: "absolute", left: 60, top: 560 }}>
            <Worker size={600} helmet vest expr="shocked" pose="idle" shirt="#3D7BFF" />
          </div>
          <div style={{ position: "absolute", left: 560, top: 560 }}>
            <Worker size={600} helmet vest expr="pain" pose="coverEars" shirt={C.pink} seed={2} />
          </div>
          {/* panah ukur 1 lengan */}
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <g opacity={interpolate(t, [2.0, 2.3], [0, 1], clamp)}>
              <line x1={330} y1={1110} x2={690} y2={1110} stroke={C.lime} strokeWidth={10} strokeLinecap="round" />
              <path d="M350 1088 L326 1110 L350 1132 M670 1088 L694 1110 L670 1132" fill="none" stroke={C.lime} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
          <Pop at={2.0} x={330} y={1130}>
            <div style={{ width: 360, textAlign: "center", fontFamily: HEAD, fontSize: 48, color: C.lime, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill" }}>1 LENGAN ≈ 1 m</div>
          </Pop>
          <Pop at={1.95} x={150} y={360}>
            <ShoutBubble text={"HAH?!\nAPA??"} w={420} h={240} />
          </Pop>
          <Countdown at={0.13} x={840} y={330} />
          <Sticker at={0.1} y={290} x={60} bg={C.lime} size={74}>
            COBA TES INI 🧪
          </Sticker>
        </Scene>

        {/* 2 — telinga dirusak pelan-pelan */}
        <Scene a={5.3} b={7.85}>
          <div style={{ position: "absolute", left: 250, top: 420, rotate: `${Math.sin(t * 30) * 1.5}deg` }}>
            <Ear size={580} cracks={interpolate(t, [6.3, 7.6], [0, 1], clamp)} bend={interpolate(t, [5.6, 7.6], [0, 1], clamp)} />
          </div>
          <NoiseLines x={60} y={560} />
          <Sticker at={5.45} y={290} bg={C.pink} color={C.white} size={70}>
            TELINGAMU LAGI DIRUSAK 😨
          </Sticker>
        </Scene>

        {/* 3 — makhluk halus paling berisik (scanner) */}
        <Scene a={7.85} b={11.12}>
          <Room wall={WALL} floor={FLOOR} dark={interpolate(t, [7.9, 8.3], [0, 0.6], clamp)}>
            <Machine x={60} y={60} />
            <Machine x={640} y={80} scale={0.9} />
          </Room>
          <Scanner at={9.2} dur={0.9} top={330} height={760}>
            <div style={{ position: "absolute", left: 320, top: 470 }}>
              <SiHalus size={500} variant="noise" />
            </div>
          </Scanner>
          <Sticker at={7.95} y={290} bg={C.bg1} color={C.pink} size={66}>
            YANG PALING BERISIK… 👻
          </Sticker>
        </Scene>

        {/* 4 — KEBISINGAN! */}
        <Scene a={11.12} b={12.2}>
          <div style={{ position: "absolute", left: 230, top: 360 }}>
            <Pop at={11.14}>
              <SiHalus size={720} variant="noise" />
            </Pop>
          </div>
          <Sticker at={11.16} y={1060} bg={C.pink} color={C.white} size={104} rotate={-5}>
            SI HALUS: BISING
          </Sticker>
        </Scene>

        {/* 5 — NAB 85 dB / 8 jam */}
        <Scene a={12.2} b={17.22}>
          <Sticker at={12.25} y={290} bg={C.cream} size={60}>
            📜 PERMENAKER 5/2018 · NAB BISING
          </Sticker>
          <BigStat at={13.7} from={40} to={85} dur={0.9} suffix=" dB" y={480} color={C.lime} />
          <Pop at={15.3} x={0} y={780} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 40px", borderRadius: 40, background: C.cream, border: `${OUTLINE}px solid ${C.ink}`, boxShadow: `0 12px 0 ${C.ink}`, fontFamily: HEAD, fontSize: 76, color: C.ink }}>
              ⏱️ MAKS 8 JAM / HARI
            </div>
          </Pop>
        </Scene>

        {/* 6 — tiap +3 dB jatah ½ */}
        <Scene a={17.22} b={21.22}>
          <Sticker at={17.7} y={290} bg={C.lime} size={74}>
            +3 dB = JATAH ½
          </Sticker>
          <div style={{ position: "absolute", top: 430, left: 140, width: 800, display: "flex", flexDirection: "column", gap: 14 }}>
            {LADDER.map(([db, time, at], i) => (
              <Pop key={db} at={at} from="right" style={{ position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 36px",
                    borderRadius: 30,
                    background: i === LADDER.length - 1 ? C.pink : C.bg1,
                    border: `${OUTLINE}px solid ${C.ink}`,
                    outline: `4px solid ${interpolateColor(i)}`,
                    outlineOffset: -14,
                    boxShadow: `0 8px 0 ${C.ink}`,
                    fontFamily: HEAD,
                    fontSize: 62,
                    color: i === LADDER.length - 1 ? C.white : C.cream,
                    marginLeft: i * 12,
                  }}
                >
                  <span>{db}</span>
                  <span style={{ color: i === LADDER.length - 1 ? C.white : interpolateColor(i) }}>{time}</span>
                </div>
              </Pop>
            ))}
          </div>
        </Scene>

        {/* 7 — 100 dB = 15 menit */}
        <Scene a={21.22} b={23.82}>
          <Pop at={21.3} x={0} y={380} style={{ width: 1080, textAlign: "center" }}>
            <div style={{ fontFamily: HEAD, fontSize: 210, lineHeight: 1, color: C.pink, WebkitTextStroke: `16px ${C.ink}`, paintOrder: "stroke fill", textShadow: `0 16px 0 ${C.ink}` }}>100 dB</div>
          </Pop>
          <Pop at={22.4} x={140} y={660}>
            <Timer at={22.45} />
          </Pop>
          <Pop at={22.6} x={470} y={740}>
            <div style={{ fontFamily: HEAD, fontSize: 108, lineHeight: 0.95, color: C.cream, WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill", textShadow: `0 12px 0 ${C.ink}` }}>
              CUMA
              <br />
              <span style={{ color: C.yellow }}>15 MENIT</span>
            </div>
          </Pop>
        </Scene>

        {/* 8 — gerinda 95–100 dB */}
        <Scene a={23.82} b={28.38}>
          <Room wall={WALL} floor={FLOOR} />
          <div style={{ position: "absolute", left: 40, top: 560 }}>
            <Worker size={600} helmet vest pose="holdTool" expr={t > 26.5 ? "pain" : "normal"} shirt="#3D7BFF" shake={t > 24.5 ? 6 : 0} />
          </div>
          <Grinder x={210} y={830} on={t > 24.5} />
          <Pop at={24.6} x={560} y={430}>
            <DbMeter value={interpolate(t, [24.7, 27.4], [60, 100], { ...clamp, easing: easeOut })} />
          </Pop>
          <Sticker at={24.5} y={290} bg={C.yellow} size={66}>
            GERINDA KECIL: 95–100 dB 🔥
          </Sticker>
        </Scene>

        {/* 9 — permanen + telinga berdenging */}
        <Scene a={28.38} b={33.98}>
          {t < 31.0 ? (
            <>
              <div style={{ position: "absolute", left: 250, top: 400, opacity: 0.55 }}>
                <Ear size={560} cracks={1} bend={1} />
              </div>
              <Pop at={30.0} x={130} y={620}>
                <div
                  style={{
                    padding: "18px 50px 24px",
                    border: `14px solid ${C.pink}`,
                    borderRadius: 30,
                    color: C.pink,
                    background: "rgba(26,16,48,0.85)",
                    fontFamily: HEAD,
                    fontSize: 150,
                    rotate: "-12deg",
                    letterSpacing: 4,
                  }}
                >
                  PERMANEN
                </div>
              </Pop>
              <Sticker at={28.45} y={290} bg={C.cream} size={70}>
                RUSAKNYA PELAN… 🐌
              </Sticker>
            </>
          ) : (
            <>
              <div style={{ position: "absolute", left: 250, top: 430 }}>
                <Ear size={560} ring={interpolate(t, [32.2, 32.6], [0, 1], clamp)} />
              </div>
              <Pop at={32.4} x={60} y={520}>
                <div style={{ fontFamily: HEAD, fontSize: 64, color: C.yellow, WebkitTextStroke: `9px ${C.ink}`, paintOrder: "stroke fill", rotate: "-10deg" }}>NGIIING~</div>
              </Pop>
              <Sticker at={31.05} y={290} bg={C.yellow} size={70}>
                🔔 TANDA AWAL: BERDENGING
              </Sticker>
            </>
          )}
        </Scene>

        {/* 10 — earphone */}
        <Scene a={33.98} b={39.66}>
          <Room wall="#3B2A66" floor="#251845" />
          <div style={{ position: "absolute", left: 80, top: 520 }}>
            <Worker size={640} expr={t > 37.6 ? "shocked" : "happy"} pose="idle" shirt={C.lime} hair="#1E1428" />
          </div>
          <Earbuds x={80} y={520} size={640} />
          <Sticker at={34.05} y={290} bg={C.cream} size={66}>
            BUKAN CUMA DI PABRIK 🎧
          </Sticker>
          <Pop at={36.6} x={380} y={430}>
            <VolumeBar at={36.7} />
          </Pop>
          <Pop at={37.6} x={540} y={720}>
            <InfoCard title="🎧 EARPHONE KENCENG" value="s/d 105 dB" sub="data WHO" color={C.pink} w={480} valueSize={66} />
          </Pop>
        </Scene>

        {/* 11 — solusi */}
        <Scene a={39.66} b={45.56}>
          <Sticker at={39.7} y={290} bg={C.lime} size={84}>
            JADI GINI 👇
          </Sticker>
          <div style={{ position: "absolute", top: 450, left: 80, display: "flex", flexDirection: "column", gap: 34 }}>
            <CheckRow icon="🎧" label="Pakai earplug / earmuff" at={40.85} />
            <CheckRow icon="↔️" label="Jaga jarak dari sumber bising" at={42.3} />
            <CheckRow icon="🩺" label="Cek pendengaran rutin (audiometri)" at={44.1} />
          </div>
          <div style={{ position: "absolute", left: 760, top: 930 }}>
            <Pop at={41.0}>
              <SiHalus size={250} variant="noise" mood="scared" />
            </Pop>
          </div>
        </Scene>

        {/* 12 — punchline: telinganya udah nyerah */}
        <Scene a={45.56} b={53.45}>
          <Room wall={WALL} floor={FLOOR}>
            <Machine x={660} y={40} />
            <NoiseLines x={930} y={60} />
          </Room>
          <div style={{ position: "absolute", left: 280, top: 560 }}>
            <Worker size={640} helmet vest {...COWORKER} expr={t < 50.1 ? "smirk" : "normal"} pose={t < 50.1 ? "shrug" : "idle"} />
          </div>
          <Pop at={47.15} out={49.95} x={40} y={340}>
            <Bubble w={640} tail="right" size={56}>
              “Santai, aku udah biasa sama bisingnya 😎”
            </Bubble>
          </Pop>
          {t >= 50.1 && (
            <Pop at={50.12} x={0} y={370} style={{ width: 1080, textAlign: "center" }}>
              <div style={{ fontFamily: HEAD, fontSize: 96, color: C.pink, WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill", textShadow: `0 10px 0 ${C.ink}`, rotate: "-4deg" }}>ITU BUKAN BIASA!</div>
            </Pop>
          )}
          {/* bendera putih dari telinga kiri (posisi telinga di koordinat Worker) */}
          <Pop at={51.9} x={280 + (65 + 30) * (640 / 660) - 40} y={560 + (205 + 20) * (640 / 660) - 210}>
            <div style={{ rotate: "-32deg", transformOrigin: "40px 210px" }}>
              <WhiteFlag />
            </div>
          </Pop>
          <Pop at={51.95} x={700} y={740}>
            <div style={{ fontFamily: HEAD, fontSize: 54, color: C.cream, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill", rotate: "-8deg", width: 260, textAlign: "center" }}>
              telinga:
              <br />
              “aku nyerah” 🏳️
            </div>
          </Pop>
          <Pop at={52.2} x={800} y={970}>
            <SiHalus size={230} variant="noise" mood="laugh" />
          </Pop>
        </Scene>
      </AbsoluteFill>
    </>
  );
};

function interpolateColor(i: number) {
  return [C.lime, C.lime, C.yellow, C.yellow, C.orange, C.pink][i];
}



export const Ep3: React.FC = () => (
  <Episode ep={3} accent={C.pink} tint="#4A1B3F" words={words} endStart={EP3.endStart} revealAt={EP3.revealAt} flashes={[11.16]} warp={warp}>
    <Ep3Scenes />
  </Episode>
);
