import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut, easeOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode, warpOldToNew } from "../Episode";
import { Pop, Scanner, Sticker, useShake } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep13.words";
import { warp } from "./ep13.warp";

/**
 * EP13 "Cium Bau Gas? Jangan Nyalain Lampu!" — gas LPG bocor di rumah.
 * Semua waktu = detik isi utama (data/ep13_words.json). Tema HANGAT (peach/koral) — teks gelap di latar terang.
 * Kasus nyata digambarkan simbolis (rumah, kilatan oranye), tanpa korban.
 */
export const EP13 = { endStart: 47.65, revealAt: 50.27 };

const CORAL = "#E8663D";
const GASC = "#C9D86A"; // warna awan gas (kuning-hijau pucat)
const SH = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const IBU = { hijab: "#7A3E2E", shirt: "#E8634A", pants: "#3B3B4F" } as const;
const BAPAK = { hair: "#2A1B12", shirt: "#3F8FD6", pants: "#2E3557" } as const;
const ANAK = { hair: "#2A1B12", shirt: "#F2B33D", pants: "#3B4E8A" } as const;

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

/* ----------------------------------------------------------- gambar lokal */

/** Ruangan hangat (dinding krem, lantai keramik) — `dim` meredupkan lembut */
const Room: React.FC<{ children?: React.ReactNode; dim?: number; wall?: string; floor?: string; glow?: number }> = ({
  children,
  dim = 0,
  wall = "#F6E3CF",
  floor = "#D9A77E",
  glow = 0,
}) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 880, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: wall }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 190, background: floor, borderTop: `${OUTLINE}px solid ${C.ink}` }} />
    {children}
    {glow > 0 && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(255,205,120,0.55), rgba(255,180,90,0) 70%)", opacity: glow }} />}
    {dim > 0 && <div style={{ position: "absolute", inset: 0, background: "#4A3346", opacity: dim }} />}
  </div>
);

/** Label kartu (teks gelap di latar terang) */
const Tag: React.FC<{ children: React.ReactNode; bg?: string; size?: number; rot?: number }> = ({ children, bg = C.cream, size = 40, rot = -2 }) => (
  <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: size, color: C.ink, background: bg, padding: "8px 22px 10px", borderRadius: 20, border: `6px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, rotate: `${rot}deg`, whiteSpace: "nowrap" }}>{children}</div>
);

const Source: React.FC<{ children: React.ReactNode; y?: number }> = ({ children, y = 1130 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 28, color: "#6B4A3A" }}>{children}</div>
);

/** Rumah sederhana tampak depan */
const House: React.FC<{ lit?: number }> = ({ lit = 0 }) => (
  <svg width={520} height={440} viewBox="0 0 520 440" style={{ overflow: "visible" }}>
    <path d="M30 200 L260 30 L490 200 Z" fill="#B5573A" {...SH} />
    <rect x={70} y={195} width={380} height={230} fill="#F1D9B8" {...SH} />
    <rect x={110} y={250} width={110} height={90} rx={8} fill={`rgba(255,${200 - 60 * lit},${120 - 80 * lit},1)`} {...SH} />
    <path d="M165 250 L165 340 M110 295 L220 295" stroke={C.ink} strokeWidth={5} />
    <rect x={290} y={270} width={110} height={155} rx={8} fill="#8A5A3C" {...SH} />
    <circle cx={380} cy={350} r={7} fill={C.ink} />
    <rect x={360} y={70} width={44} height={90} fill="#9C4A30" {...SH} />
  </svg>
);

/** Tabung + regulator + selang; `leak` 0..1 memunculkan uap gas di sambungan, `fire` 0..1 nyala api kecil */
const TankRig: React.FC<{ leak?: number; fire?: number }> = ({ leak = 0, fire = 0 }) => {
  const t = useT();
  return (
    <svg width={760} height={520} viewBox="0 0 760 520" style={{ overflow: "visible" }}>
      {/* kompor */}
      <rect x={430} y={330} width={300} height={120} rx={16} fill="#C9CED6" {...SH} />
      <rect x={470} y={300} width={100} height={30} rx={8} fill="#3A3F4B" {...SH} />
      <rect x={590} y={300} width={100} height={30} rx={8} fill="#3A3F4B" {...SH} />
      {fire > 0 && (
        <g transform={`translate(520 300) scale(${0.4 + 0.6 * fire})`}>
          <path d={`M0 0 Q-34 -${40 + 6 * Math.sin(t * 14)} 0 -${100 + 10 * Math.sin(t * 11)} Q34 -${40 + 6 * Math.sin(t * 13)} 0 0 Z`} fill="#FF8A3D" {...SH} strokeWidth={5} />
          <path d="M0 -6 Q-14 -30 0 -60 Q14 -30 0 -6 Z" fill="#FFD23F" />
        </g>
      )}
      {/* selang */}
      <path d="M250 150 Q350 120 380 230 Q400 320 470 330" fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
      <path d="M250 150 Q350 120 380 230 Q400 320 470 330" fill="none" stroke="#E2603A" strokeWidth={12} strokeLinecap="round" />
      {/* tabung */}
      <rect x={60} y={150} width={200} height={330} rx={70} fill="#3FAE5A" {...SH} />
      <rect x={95} y={270} width={130} height={60} rx={12} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
      <text x={160} y={312} textAnchor="middle" fontFamily="LilitaOne" fontSize={40} fill={C.ink}>
        LPG
      </text>
      {/* regulator */}
      <rect x={120} y={92} width={100} height={64} rx={14} fill="#C9CED6" {...SH} />
      <circle cx={170} cy={124} r={20} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
      <path d="M170 124 L182 112" stroke="#E0566F" strokeWidth={5} strokeLinecap="round" />
      <rect x={210} y={110} width={46} height={28} rx={8} fill="#9AA1AE" {...SH} strokeWidth={5} />
      {/* uap gas bocor */}
      {leak > 0 &&
        [0, 1, 2, 3].map((i) => {
          const p = (t * 0.7 + i / 4) % 1;
          return (
            <path
              key={i}
              d={`M${250 + p * 120} ${110 - p * 90} q16 -14 0 -28 q-16 -14 0 -28`}
              fill="none"
              stroke="#B5A23A"
              strokeWidth={9}
              strokeLinecap="round"
              opacity={leak * 0.9 * Math.sin(p * Math.PI)}
            />
          );
        })}
    </svg>
  );
};

/** Awan gas yang mengendap rendah di lantai */
const GasPool: React.FC<{ level: number }> = ({ level }) => {
  const t = useT();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 360 * level, overflow: "visible" }}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: -60 + i * 150 + Math.sin(t * 0.9 + i) * 22,
            bottom: -40 + (i % 2) * 30,
            width: 260,
            height: 200 * level + 80,
            borderRadius: "50%",
            background: GASC,
            opacity: 0.42,
            filter: "blur(10px)",
          }}
        />
      ))}
    </div>
  );
};

/** Kartu pemicu percikan */
const SparkCard: React.FC<{ icon: string; label: string; at: number; x: number }> = ({ icon, label, at, x }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 11, stiffness: 210 } });
  const spark = 0.5 + 0.5 * Math.sin((t - at) * 18);
  return (
    <div style={{ position: "absolute", left: x, top: 520, width: 290, scale: String(interpolate(s, [0, 1], [0.3, 1])), opacity: interpolate(s, [0, 0.3], [0, 1], clamp) }}>
      <div style={{ height: 290, borderRadius: 36, background: "#FFF6EA", border: `7px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}`, display: "grid", placeItems: "center", position: "relative" }}>
        <div style={{ fontSize: 130 }}>{icon}</div>
        <div style={{ position: "absolute", right: 18, top: 12, fontSize: 64, opacity: spark }}>⚡</div>
      </div>
      <div style={{ marginTop: 18, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 40, color: C.ink, lineHeight: 1.05 }}>{label}</div>
    </div>
  );
};

/** Kartu langkah darurat 1-2-3 */
const StepCard: React.FC<{ n: number; title: string; sub: string; at: number; next?: number; y: number; color: string }> = ({ n, title, sub, at, next, y, color }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 13, stiffness: 190 } });
  const active = next === undefined ? true : t < next;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        width: 960,
        top: y,
        height: 196,
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "0 30px",
        borderRadius: 36,
        background: active ? "#FFF0DC" : "#FFFDF8",
        border: `7px solid ${C.ink}`,
        boxShadow: `0 10px 0 ${C.ink}`,
        translate: `${interpolate(s, [0, 1], [-1000, 0])}px 0px`,
        scale: active ? String(1 + 0.015 * Math.sin((t - at) * 7)) : "0.97",
        opacity: active ? 1 : 0.8,
      }}
    >
      <div style={{ flex: "none", width: 116, height: 116, borderRadius: 30, background: color, border: `6px solid ${C.ink}`, display: "grid", placeItems: "center", fontFamily: HEAD, fontSize: 78, color: C.white, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill" }}>{n}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: HEAD, fontSize: 52, lineHeight: 1, color: C.ink }}>{title}</div>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 32, color: "#6B4A3A", marginTop: 8, lineHeight: 1.1 }}>{sub}</div>
      </div>
    </div>
  );
};

/** Baris ceklis pencegahan */
const Row: React.FC<{ icon: string; label: string; at: number; y: number }> = ({ icon, label, at, y }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 14, stiffness: 210 } });
  const tick = interpolate(t, [at + 0.15, at + 0.45], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        top: y,
        width: 960,
        height: 110,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 24px",
        borderRadius: 30,
        background: "#FFF8EE",
        border: `6px solid ${C.ink}`,
        boxShadow: `0 7px 0 ${C.ink}`,
        translate: `${interpolate(s, [0, 1], [900, 0])}px 0px`,
      }}
    >
      <div style={{ fontSize: 56, width: 66, textAlign: "center" }}>{icon}</div>
      <div style={{ flex: 1, fontFamily: BODY, fontWeight: 800, fontSize: 40, color: C.ink, lineHeight: 1.05 }}>{label}</div>
      <svg width={74} height={74} viewBox="0 0 90 90">
        <circle cx={45} cy={45} r={38} fill={C.lime} stroke={C.ink} strokeWidth={7} />
        <path d="M26 46 L40 60 L66 32" fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={70} strokeDashoffset={70 * (1 - tick)} />
      </svg>
    </div>
  );
};

/** Sambungan selang yang diolesi air sabun — gelembung membesar = bocor */
const BubbleTest: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  if (t < at - 0.05) return null;
  const k = interpolate(t, [at, at + 0.4], [0, 1], clamp);
  const grow = interpolate(t, [at + 1.6, at + 3.0], [0, 1], { ...clamp, easing: easeOut });
  const sponge = interpolate(t, [at, at + 1.6], [0, 1], { ...clamp, easing: easeInOut });
  return (
    <div style={{ position: "absolute", left: 60, top: 590, width: 960, height: 400, borderRadius: 40, background: "#FFF6EA", border: `7px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}`, opacity: k, overflow: "hidden" }}>
      <svg width={960} height={400} viewBox="0 0 960 400">
        {/* regulator + selang */}
        <rect x={120} y={140} width={180} height={110} rx={22} fill="#C9CED6" {...SH} />
        <circle cx={210} cy={195} r={34} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
        <rect x={300} y={168} width={80} height={54} rx={10} fill="#9AA1AE" {...SH} />
        <path d="M380 195 Q560 195 700 260 Q820 310 900 300" fill="none" stroke={C.ink} strokeWidth={34} strokeLinecap="round" />
        <path d="M380 195 Q560 195 700 260 Q820 310 900 300" fill="none" stroke="#E2603A" strokeWidth={20} strokeLinecap="round" />
        {/* spons air sabun */}
        <g transform={`translate(${560 - 180 * sponge} ${230 - 30 * Math.sin(sponge * Math.PI)})`} opacity={1 - interpolate(t, [at + 1.6, at + 2.0], [0, 1], clamp)}>
          <rect x={0} y={0} width={110} height={70} rx={16} fill="#FFE27A" {...SH} strokeWidth={5} />
          <circle cx={30} cy={28} r={8} fill="#F2C94C" />
          <circle cx={70} cy={42} r={10} fill="#F2C94C" />
        </g>
        {/* gelembung di sambungan */}
        {[0, 1, 2, 3, 4].map((i) => {
          const r = (20 + i * 8) * grow * (0.9 + 0.1 * Math.sin(t * 5 + i));
          const pos = [[380, 150], [420, 120], [350, 110], [440, 70], [390, 50]][i];
          return r > 1 ? (
            <circle key={i} cx={pos[0]} cy={pos[1]} r={r} fill="rgba(200,240,255,0.6)" stroke="#3E8FB0" strokeWidth={5} />
          ) : null;
        })}
      </svg>
      <div style={{ position: "absolute", left: 40, top: 310 }}>
        <Tag bg="#E3F2FA" size={36} rot={-2}>
          🧽 olesin air sabun di sambungan
        </Tag>
      </div>
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
          <div key={i} style={{ position: "absolute", left: 120 + i * 150 + Math.sin(t * 1.5 + i) * 30, top: 1060 - p * 650, fontSize: 46 + (i % 3) * 14, opacity: Math.sin(p * Math.PI) * 0.85 }}>
            💛
          </div>
        );
      })}
    </>
  );
};

/** Panci mengepul di kompor (adegan keluarga) */
const CookPot: React.FC = () => {
  const t = useT();
  return (
    <svg width={300} height={240} viewBox="0 0 300 240" style={{ overflow: "visible" }}>
      {[0, 1, 2].map((i) => {
        const p = (t * 0.5 + i / 3) % 1;
        return <path key={i} d={`M${90 + i * 60} ${70 - p * 60} q-14 -16 0 -32 q14 -16 0 -32`} fill="none" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" opacity={Math.sin(p * Math.PI)} />;
      })}
      <rect x={40} y={80} width={220} height={110} rx={20} fill="#E8634A" {...SH} />
      <rect x={20} y={70} width={260} height={28} rx={12} fill="#C9503A" {...SH} />
      <rect x={10} y={190} width={280} height={40} rx={10} fill="#6B7280" {...SH} />
    </svg>
  );
};

/* ----------------------------------------------------------------- adegan */
const Ep13Scenes: React.FC = () => {
  const t = useT();
  const shake = useShake([
    { t: 2.42, a: 16 },
    { t: 11.31, a: 14 },
    { t: 21.23, a: 6 },
  ]);
  const boom = interpolate(t, [2.42, 2.6, 4.2], [0, 1, 0.25], clamp);
  const leak = interpolate(t, [5.2, 6.0], [0, 1], clamp);
  const fire = interpolate(t, [7.3, 7.9], [0, 1], clamp);
  const pool = interpolate(t, [12.1, 16.6], [0.15, 1], { ...clamp, easing: easeInOut });
  const glow = interpolate(t, [42.4, 43.6], [0, 1], { ...clamp, easing: easeInOut });

  return (
    <AbsoluteFill style={{ translate: shake }}>
      {/* 1 — kasus Pekalongan, simbolis */}
      <Scene a={0} b={4.85} zoom={false}>
        <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 880, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: "linear-gradient(180deg, #FFD9B8 0%, #F6C2A0 70%, #E7A77E 100%)" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 58%, rgba(255,140,60,0.95) 0%, rgba(255,190,90,0.55) 30%, rgba(255,200,120,0) 62%)", opacity: boom }} />
          <div style={{ position: "absolute", left: 240, top: 330 }}>
            <House lit={boom} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, background: "#C9946E", borderTop: `${OUTLINE}px solid ${C.ink}` }} />
        </div>
        <Pop at={0.25} x={70} y={340}>
          <Tag bg="#FFF6E5" size={42} rot={-3}>
            📍 Pekalongan · Nov 2025
          </Tag>
        </Pop>
        <Sticker at={2.5} y={500} bg="#FFE3D3" color={C.ink} size={62} rotate={2}>
          {"LEDAKAN GAS DI RUMAH 💥"}
        </Sticker>
        <Pop at={3.4} x={300} y={1010}>
          <Tag bg="#FFFFFF" size={40} rot={0}>
            🕯️ 3 orang meninggal
          </Tag>
        </Pop>
        <Source y={1120}>sumber: detik.com, November 2025</Source>
      </Scene>

      {/* 2 — sumbernya regulator bocor, ketemu api */}
      <Scene a={4.85} b={9.1}>
        <Room>
          <div style={{ position: "absolute", left: 80, top: 250 }}>
            <TankRig leak={leak} fire={fire} />
          </div>
        </Room>
        <Sticker at={5.0} y={340} bg="#FFF0DC" color={C.ink} size={56} rotate={-2}>
          {"SUMBERNYA: REGULATOR BOCOR"}
        </Sticker>
        <Pop at={5.6} x={110} y={480}>
          <Tag bg="#FFFFFF" size={36} rot={-3}>
            kata Pertamina
          </Tag>
        </Pop>
        <Pop at={7.5} x={600} y={500}>
          <Tag bg="#FFE3D3" size={42} rot={4}>
            + ketemu api 🔥
          </Tag>
        </Pop>
      </Scene>

      {/* 3 — Si Halus: Gas Bocor */}
      <Scene a={9.1} b={12.0}>
        <Room dim={0.18}>
          <GasPool level={0.5} />
        </Room>
        <Scanner at={9.7} dur={0.9} top={430} height={700}>
          <div style={{ position: "absolute", left: 360, top: 520 }}>
            <SiHalus size={400} variant="lpg" mood="laugh" />
          </div>
        </Scanner>
        <Sticker at={11.3} y={350} bg={CORAL} color={C.white} size={62} rotate={-3}>
          {"SI HALUS: GAS BOCOR 👃"}
        </Sticker>
      </Scene>

      {/* 4 — lebih berat dari udara, ngumpul di lantai */}
      <Scene a={12.0} b={17.1}>
        <Room>
          <div style={{ position: "absolute", left: 600, top: 330 }}>
            <svg width={260} height={340} viewBox="0 0 260 340">
              <rect x={10} y={0} width={240} height={250} rx={10} fill="#BFE6EF" {...SH} />
              <path d="M130 0 L130 250 M10 125 L250 125" stroke={C.ink} strokeWidth={6} />
            </svg>
          </div>
          <div style={{ position: "absolute", left: 90, top: 380 }}>
            <svg width={220} height={300} viewBox="0 0 220 300">
              <rect x={20} y={40} width={180} height={250} rx={60} fill="#3FAE5A" {...SH} />
              <rect x={70} y={6} width={80} height={44} rx={10} fill="#C9CED6" {...SH} />
            </svg>
          </div>
          <GasPool level={pool} />
        </Room>
        <Pop at={12.3} x={330} y={360}>
          <Tag bg="#FFFFFF" size={42} rot={-2}>
            ⬇️ lebih berat dari udara
          </Tag>
        </Pop>
        <Pop at={14.1} x={80} y={960}>
          <Tag bg="#F4F7D9" size={40} rot={2}>
            ngumpul di lantai, diem-diem…
          </Tag>
        </Pop>
        <Pop at={15.5} x={500} y={1055}>
          <Tag bg="#FFE3D3" size={40} rot={-3}>
            nunggu 1 percikan ⚡
          </Tag>
        </Pop>
      </Scene>

      {/* 5 — percikan dari hal sepele */}
      <Scene a={17.1} b={21.1}>
        <Sticker at={17.3} y={330} bg="#FFF0DC" color={C.ink} size={56} rotate={-2}>
          {"PERCIKANNYA DARI HAL SEPELE"}
        </Sticker>
        <SparkCard icon="💡" label="nyalain lampu" at={18.9} x={60} />
        <SparkCard icon="🔌" label="nyolok HP" at={19.7} x={395} />
        <SparkCard icon="🔥" label="nyalain kompor" at={20.4} x={730} />
      </Scene>

      {/* 6 — langkah darurat 1-2-3 (bagian yang disimpan) */}
      <Scene a={21.1} b={29.75}>
        <Sticker at={21.2} y={300} bg={CORAL} color={C.white} size={54} rotate={-2}>
          {"CIUM BAU GAS? LAKUKAN INI 👇"}
        </Sticker>
        <StepCard n={1} title="JANGAN SENTUH SAKLAR" sub="jangan nyalain / matiin lampu & listrik" at={21.23} next={24.76} y={440} color="#E0566F" />
        <StepCard n={2} title="BUKA PINTU & JENDELA" sub="lebar-lebar, biar gasnya keluar" at={24.76} next={26.87} y={660} color="#2FA7B8" />
        <StepCard n={3} title="COPOT REGULATOR" sub="bawa tabung ke luar, ke tempat terbuka" at={26.87} y={880} color="#3FAE5A" />
        <Pop at={28.6} x={300} y={1100}>
          <Tag bg="#FFF6E5" size={36} rot={-2}>
            📌 simpan biar nggak panik
          </Tag>
        </Pop>
      </Scene>

      {/* 7 — cegah dari awal */}
      <Scene a={29.75} b={42.2}>
        <Sticker at={29.9} y={300} bg="#E7F4D9" color={C.ink} size={54} rotate={-2}>
          {"CEGAH DARI AWAL ✅"}
        </Sticker>
        <Row icon="🏷️" label="Regulator & selang ber-SNI" at={29.85} y={450} />
        <BubbleTest at={33.63} />
        <Pop at={36.0} x={575} y={640}>
          <Tag bg="#FFE3D3" size={38} rot={3}>
            gelembung = BOCOR! 🫧
          </Tag>
        </Pop>
        <Row icon="📅" label="Ganti selang 2–3 th · regulator 3–5 th" at={37.91} y={1020} />
        <Source y={1145}>sumber: Ditjen Migas ESDM</Source>
      </Scene>

      {/* 8 — dapur = tempat bikin kenangan (haru) */}
      <Scene a={42.2} b={EP13.endStart}>
        <Room wall="#FBE7CF" floor="#E2B48A" glow={glow}>
          <div style={{ position: "absolute", left: 620, top: 470 }}>
            <CookPot />
          </div>
          <div style={{ position: "absolute", left: 60, top: 250 }}>
            <Worker size={470} pose="wave" expr="happy" {...BAPAK} seed={2} />
          </div>
          <div style={{ position: "absolute", left: 330, top: 280 }}>
            <Worker size={440} pose="idle" expr="happy" {...IBU} seed={8} />
          </div>
          <div style={{ position: "absolute", left: 560, top: 420 }}>
            <Worker size={300} pose="wave" expr="happy" {...ANAK} seed={4} />
          </div>
        </Room>
        <FloatHearts at={42.6} />
        <Sticker at={42.6} y={330} bg="#FFF3D6" color={C.ink} size={52} rotate={-2}>
          {"DAPUR = TEMPAT BIKIN KENANGAN 💛"}
        </Sticker>
        <Pop at={45.4} x={290} y={1060}>
          <Tag bg="#FFFFFF" size={42} rot={2}>
            bukan tempat ninggalin luka
          </Tag>
        </Pop>
      </Scene>
    </AbsoluteFill>
  );
};

const W = warp.length ? warp : undefined;

export const Ep13: React.FC = () => (
  <Episode ep={13} accent="#E8663D" tint="#F6C2A0" words={words} endStart={W ? warpOldToNew(EP13.endStart, W) : EP13.endStart} revealAt={W ? warpOldToNew(EP13.revealAt, W) : EP13.revealAt} warp={W} flashes={[2.42, 11.31]}>
    <Ep13Scenes />
  </Episode>
);
