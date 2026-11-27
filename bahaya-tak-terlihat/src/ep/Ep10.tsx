import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut, easeOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode } from "../Episode";
import { Pop, Scanner, Sticker, useShake } from "../Kit";
import { CheckRow } from "../Props";
import { Scene } from "./Ep1";
import { words } from "./ep10.words";

/** Semua waktu = detik isi utama (data/ep10_words.json). Tema HANGAT/terang — teks gelap di atas latar terang. */
export const EP10 = { endStart: 49.46, revealAt: 51.39 };

const AMBER = "#FFB21A";
const RED = "#E8463A";
const SH = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const IBU = { hijab: "#3D4E8A", shirt: "#E85D75", pants: "#4A3B5C" } as const;
const ANAK = { shirt: "#49B6E8", pants: "#2E3557", hair: "#2A1B12" } as const;
/** siluet hormat untuk adegan kejadian: tanpa wajah */
const SIL: React.CSSProperties = { filter: "brightness(0.18) sepia(1) saturate(1.6) hue-rotate(-10deg)", opacity: 0.85 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

/* ----------------------------------------------------------- gambar lokal */

/** Halaman belakang: langit sore hangat, rumah beratap seng, tiang jemuran */
const Yard: React.FC<{ children?: React.ReactNode; dim?: number }> = ({ children, dim = 0 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 880, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: "linear-gradient(180deg, #FFD9A0 0%, #FFE9C9 60%, #F6D2A2 100%)" }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 200, background: "#C9A36B", borderTop: `${OUTLINE}px solid ${C.ink}` }} />
    {children}
    {dim > 0 && <div style={{ position: "absolute", inset: 0, background: "#3A2414", opacity: dim }} />}
  </div>
);

const ZincRoofHouse: React.FC<{ x: number; y: number; glow?: number }> = ({ x, y, glow = 0 }) => (
  <svg width={360} height={420} viewBox="0 0 360 420" style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <rect x={30} y={170} width={300} height={240} fill="#F3E3C6" {...SH} />
    <rect x={140} y={270} width={80} height={140} fill="#B07A4A" {...SH} />
    <rect x={56} y={220} width={60} height={56} fill="#BFE6EF" {...SH} strokeWidth={5} />
    <path d="M0 180 L180 60 L360 180 Z" fill={interpolateGlow(glow)} {...SH} />
    {[...Array(9)].map((_, i) => (
      <path key={i} d={`M${40 + i * 35} ${170 - (i < 5 ? i : 8 - i) * 22} L${40 + i * 35} ${178}`} stroke="#8D96A3" strokeWidth={5} />
    ))}
  </svg>
);
const interpolateGlow = (g: number) => (g > 0.01 ? `rgb(${170 + 85 * g}, ${178 + 50 * g}, ${190 - 120 * g})` : "#AAB2BE");

/** Kawat jemuran + baju; `live` 0..1 = ada arus (kawat berkilat kuning) */
const Clothesline: React.FC<{ x: number; y: number; w: number; live?: number }> = ({ x, y, w, live = 0 }) => {
  const t = useT();
  return (
    <svg width={w} height={300} viewBox={`0 0 ${w} 300`} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <rect x={0} y={20} width={20} height={280} fill="#8A6A4A" {...SH} strokeWidth={5} />
      <rect x={w - 20} y={20} width={20} height={280} fill="#8A6A4A" {...SH} strokeWidth={5} />
      <path d={`M10 40 Q${w / 2} 80 ${w - 10} 40`} fill="none" stroke={live > 0.05 ? AMBER : "#9AA3AF"} strokeWidth={live > 0.05 ? 10 : 7} />
      {live > 0.05 && (
        <path d={`M10 40 Q${w / 2} 80 ${w - 10} 40`} fill="none" stroke="#FFF6B0" strokeWidth={5} strokeDasharray="18 26" strokeDashoffset={-t * 220} opacity={live} />
      )}
      <path d={`M${w * 0.18} 56 l0 90 l70 0 l0 -96 z`} fill={C.pink} {...SH} strokeWidth={5} />
      <path d={`M${w * 0.45} 64 l-20 20 l14 10 l0 70 l70 0 l0 -70 l14 -10 l-20 -20 z`} fill="#7FD0F0" {...SH} strokeWidth={5} />
      <path d={`M${w * 0.72} 58 l0 110 l56 0 l0 -112 z`} fill="#FFD23F" {...SH} strokeWidth={5} />
    </svg>
  );
};

/** Percikan listrik */
const Spark: React.FC<{ x: number; y: number; at: number; size?: number; until?: number }> = ({ x, y, at, size = 1, until = 999 }) => {
  const t = useT();
  if (t < at || t > until) return null;
  const k = 0.7 + 0.3 * Math.abs(Math.sin((t - at) * 40));
  return (
    <svg width={160} height={160} viewBox="-80 -80 160 160" style={{ position: "absolute", left: x - 80, top: y - 80, overflow: "visible", scale: String(size * k) }}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + (t - at) * 3;
        return <path key={i} d={`M${Math.cos(a) * 12} ${Math.sin(a) * 12} L${Math.cos(a + 0.2) * 40} ${Math.sin(a + 0.2) * 40} L${Math.cos(a - 0.1) * 52} ${Math.sin(a - 0.1) * 52} L${Math.cos(a + 0.1) * 70} ${Math.sin(a + 0.1) * 70}`} fill="none" stroke={AMBER} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />;
      })}
      <circle r={16} fill="#FFF6B0" stroke={C.ink} strokeWidth={4} />
    </svg>
  );
};

/** Label kecil gaya kartu (teks gelap di latar terang) */
const Tag: React.FC<{ children: React.ReactNode; bg?: string; size?: number; rot?: number }> = ({ children, bg = C.cream, size = 40, rot = -2 }) => (
  <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: size, color: C.ink, background: bg, padding: "8px 22px 10px", borderRadius: 20, border: `6px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, rotate: `${rot}deg`, whiteSpace: "nowrap" }}>{children}</div>
);

const Source: React.FC<{ children: React.ReactNode; y?: number }> = ({ children, y = 1140 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 28, color: "#6B4A2E" }}>{children}</div>
);

/** Jantung dengan garis EKG; `chaos` membuat iramanya kacau */
const HeartEcg: React.FC<{ chaos: number }> = ({ chaos }) => {
  const t = useT();
  const beat = 1 + 0.08 * Math.max(0, Math.sin(t * (6 + chaos * 10)));
  let d = "M0 90";
  for (let i = 0; i <= 60; i++) {
    const x = i * 14;
    const ph = (i + t * 18) % 15;
    let y = 90;
    if (ph > 6 && ph < 8) y = 90 - 60 * Math.sin(((ph - 6) / 2) * Math.PI);
    y += chaos * 34 * Math.sin(i * 1.7 + t * 23) * Math.sin(i * 0.6);
    d += ` L${x} ${y}`;
  }
  return (
    <div style={{ position: "relative", width: 860, height: 520 }}>
      <svg width={300} height={270} viewBox="0 0 300 270" style={{ position: "absolute", left: 280, top: 0, scale: String(beat) }}>
        <path d="M150 250 C40 170 0 110 30 60 C60 10 130 20 150 70 C170 20 240 10 270 60 C300 110 260 170 150 250 Z" fill={RED} {...SH} />
        <path d="M80 70 Q90 50 112 48" stroke="#FFB3A8" strokeWidth={12} fill="none" strokeLinecap="round" />
      </svg>
      <svg width={860} height={180} viewBox="0 0 860 180" style={{ position: "absolute", left: 0, top: 300 }}>
        <rect x={0} y={0} width={860} height={180} rx={30} fill="#FFF6E8" {...SH} strokeWidth={6} />
        <path d={d} fill="none" stroke={chaos > 0.3 ? RED : "#2F9E57"} strokeWidth={7} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** Kotak meteran + MCB: tuas turun saat `offAt` */
const Meter: React.FC<{ offAt: number; elcb?: boolean; tripAt?: number }> = ({ offAt, elcb = false, tripAt = 999 }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const sw = (at: number) => spring({ frame: (t - at) * fps, fps, config: { damping: 12, stiffness: 240 } });
  const off = t >= offAt ? sw(offAt) : 0;
  const trip = t >= tripAt ? sw(tripAt) : 0;
  return (
    <svg width={520} height={560} viewBox="0 0 520 560" style={{ overflow: "visible" }}>
      <rect x={10} y={10} width={500} height={540} rx={34} fill="#E8EDF1" {...SH} />
      <rect x={40} y={40} width={440} height={130} rx={16} fill="#DDE6EA" {...SH} strokeWidth={5} />
      <text x={260} y={100} textAnchor="middle" fontFamily="Baloo2" fontWeight={800} fontSize={44} fill={C.ink}>0 1 2 3 4 kWh</text>
      <text x={260} y={148} textAnchor="middle" fontFamily="Baloo2" fontWeight={800} fontSize={28} fill="#5A6A78">METERAN LISTRIK</text>
      {/* MCB */}
      <g transform="translate(60 220)">
        <rect width={160} height={260} rx={14} fill="#FFFFFF" {...SH} strokeWidth={5} />
        <text x={80} y={46} textAnchor="middle" fontFamily="LilitaOne" fontSize={40} fill={C.ink}>MCB</text>
        <rect x={50} y={70} width={60} height={150} rx={10} fill="#C9D3DA" {...SH} strokeWidth={4} />
        <rect x={56} y={76 + 80 * off} width={48} height={64} rx={8} fill={off > 0.5 ? RED : "#2F9E57"} {...SH} strokeWidth={4} />
        <text x={80} y={250} textAnchor="middle" fontFamily="Baloo2" fontWeight={800} fontSize={28} fill={off > 0.5 ? RED : "#2F9E57"}>{off > 0.5 ? "OFF" : "ON"}</text>
      </g>
      {elcb && (
        <g transform="translate(290 220)">
          <rect width={170} height={260} rx={14} fill="#FFF3D6" {...SH} strokeWidth={5} />
          <text x={85} y={46} textAnchor="middle" fontFamily="LilitaOne" fontSize={40} fill={C.ink}>ELCB</text>
          <rect x={55} y={70} width={60} height={150} rx={10} fill="#C9D3DA" {...SH} strokeWidth={4} />
          <rect x={61} y={76 + 80 * trip} width={48} height={64} rx={8} fill={trip > 0.5 ? AMBER : "#2F9E57"} {...SH} strokeWidth={4} />
          <text x={85} y={250} textAnchor="middle" fontFamily="Baloo2" fontWeight={800} fontSize={30} fill={C.ink}>30 mA</text>
        </g>
      )}
    </svg>
  );
};

/** Colokan bertumpuk "kayak sate" */
const PlugSate: React.FC = () => {
  const t = useT();
  return (
    <svg width={520} height={260} viewBox="0 0 520 260" style={{ overflow: "visible" }}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${i * 110} ${i * 18 + Math.sin(t * 6 + i) * 2})`}>
          <rect x={0} y={40} width={130} height={90} rx={18} fill={["#FFFFFF", "#FFE9A3", "#FFD3C2", "#E6DAFF"][i]} {...SH} strokeWidth={5} />
          <circle cx={45} cy={85} r={9} fill={C.ink} />
          <circle cx={85} cy={85} r={9} fill={C.ink} />
          <path d={`M65 130 Q${60 - i * 10} 200 ${30 + i * 30} 250`} fill="none" stroke={C.ink} strokeWidth={8} />
        </g>
      ))}
      <path d="M470 60 l18 -34 l-4 26 l20 -6 l-22 40 l4 -26 z" fill={AMBER} {...SH} strokeWidth={4} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 12))} />
    </svg>
  );
};

/** Kartu langkah penyelamatan (besar, layak di-save) */
const StepCard: React.FC<{ n: number; icon: string; title: string; sub?: string; color: string; active: boolean }> = ({ n, icon, title, sub, color, active }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 22,
      width: 940,
      padding: "18px 26px",
      borderRadius: 36,
      background: active ? "#FFFDF6" : "#FFF3DF",
      border: `${OUTLINE}px solid ${C.ink}`,
      boxShadow: `0 10px 0 ${C.ink}`,
      opacity: active ? 1 : 0.7,
    }}
  >
    <div style={{ flex: "none", width: 96, height: 96, borderRadius: 28, background: color, border: `6px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontSize: 64, color: C.white, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill" }}>{n}</div>
    <div style={{ fontSize: 76 }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: HEAD, fontSize: 50, lineHeight: 1.02, color: C.ink }}>{title}</div>
      {sub && <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 32, lineHeight: 1.1, color: "#6B4A2E", marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
);

/** Rumah kebanjiran dengan air naik */
const FloodHouse: React.FC<{ rise: number }> = ({ rise }) => {
  const t = useT();
  const wy = 760 - 300 * rise;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 880, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: "linear-gradient(180deg, #F7D7B0 0%, #FBE8D0 100%)" }}>
      <div style={{ position: "absolute", left: 120, top: 230, width: 760, height: 560, background: "#FFF3DF", border: `${OUTLINE}px solid ${C.ink}`, borderRadius: 20 }}>
        <div style={{ position: "absolute", left: 60, top: 140, width: 180, height: 150, background: "#BFE6EF", border: `6px solid ${C.ink}`, borderRadius: 12 }} />
        <div style={{ position: "absolute", right: 90, top: 120, width: 70, height: 46, background: "#FFFFFF", border: `5px solid ${C.ink}`, borderRadius: 10 }}>
          <div style={{ position: "absolute", left: 14, top: 12, width: 10, height: 16, background: C.ink, borderRadius: 3 }} />
          <div style={{ position: "absolute", left: 38, top: 12, width: 10, height: 16, background: C.ink, borderRadius: 3 }} />
        </div>
      </div>
      <svg width={1000} height={900} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={`M0 ${wy} ${[...Array(11)].map((_, i) => `Q${i * 100 + 50} ${wy + 18 * Math.sin(t * 4 + i)} ${(i + 1) * 100} ${wy}`).join(" ")} L1000 900 L0 900 Z`} fill="rgba(73,160,220,0.72)" stroke={C.ink} strokeWidth={5} />
      </svg>
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
          <div key={i} style={{ position: "absolute", left: 140 + i * 140 + Math.sin(t * 1.5 + i) * 30, top: 1050 - p * 650, fontSize: 46 + (i % 3) * 14, opacity: Math.sin(p * Math.PI) * 0.85 }}>
            💛
          </div>
        );
      })}
    </>
  );
};

/* ----------------------------------------------------------------- adegan */
const Ep10Scenes: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const shake = useShake([
    { t: 2.5, a: 14 },
    { t: 6.7, a: 18 },
    { t: 8.6, a: 10 },
    { t: 13.62, a: 20 },
    { t: 20.3, a: 14 },
    { t: 37.3, a: 10 },
  ]);
  const mumX = interpolate(t, [4.9, 5.7], [-260, 340], { ...clamp, easing: easeOut });
  const whiteOut = interpolate(t, [6.6, 6.9, 7.6], [0, 0.85, 0.55], clamp);
  const live = interpolate(t, [10.2, 10.7], [0, 1], clamp);
  const roofGlow = interpolate(t, [8.6, 9.0], [0, 1], clamp);
  const elcbLeak = t >= 36.0 && t < 37.3;
  const glow = interpolate(t, [44.6, 46.0], [0, 1], { ...clamp, easing: easeInOut });
  const hug = spring({ frame: (t - 45.0) * fps, fps, config: { damping: 16, stiffness: 90 } });

  return (
    <AbsoluteFill style={{ translate: shake }}>
      {/* 1 — kejadian (simbolik, siluet) */}
      <Scene a={0} b={7.62} zoom={false}>
        <Yard>
          <ZincRoofHouse x={20} y={260} />
          <Clothesline x={360} y={360} w={560} live={t > 2.3 ? 1 : 0} />
          {t > 2.3 && <Spark x={600} y={420} at={2.35} size={1.1} />}
          <div style={{ position: "absolute", left: 560, top: 420, ...SIL, translate: t > 2.4 ? `${Math.sin(t * 60) * 4}px 0px` : "0px 0px" }}>
            <Worker size={330} pose="wave" {...ANAK} seed={3} />
          </div>
          {t > 4.85 && (
            <div style={{ position: "absolute", left: mumX, top: 360, ...SIL, translate: t > 6.7 ? `${Math.sin(t * 60) * 4}px 0px` : "0px 0px" }}>
              <Worker size={400} pose="point" {...IBU} seed={4} />
            </div>
          )}
          {t > 6.6 && <Spark x={640} y={470} at={6.65} size={1.4} />}
        </Yard>
        <Pop at={0.2} x={150} y={340}>
          <Tag bg="#FFF6E8" size={46}>📍 Simalungun · Juli 2021</Tag>
        </Pop>
        <Sticker at={2.45} y={1010} bg={AMBER} size={58} rotate={3} out={4.7}>
          {"⚡ KESETRUM DI KAWAT JEMURAN"}
        </Sticker>
        <AbsoluteFill style={{ background: "#FFF6E6", opacity: whiteOut, pointerEvents: "none" }} />
        <Source y={1150}>kasus nyata · iNews, 13 Juli 2021</Source>
      </Scene>

      {/* 2 — penyebab: kabel putus → seng → kawat jemuran */}
      <Scene a={7.62} b={11.95}>
        <Yard>
          <ZincRoofHouse x={20} y={260} glow={roofGlow} />
          <svg width={400} height={300} style={{ position: "absolute", left: 30, top: 40, overflow: "visible" }}>
            <path d="M0 40 L240 40" stroke={C.ink} strokeWidth={10} />
            <path d={`M240 40 Q260 ${120 + 30 * interpolate(t, [7.7, 8.6], [0, 1], clamp)} 200 ${150 + 120 * interpolate(t, [7.7, 8.6], [0, 1], clamp)}`} fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
          </svg>
          {t > 8.55 && <Spark x={235} y={330} at={8.6} size={1} />}
          <svg width={1000} height={400} style={{ position: "absolute", left: 0, top: 300, overflow: "visible" }}>
            <path d="M330 140 L370 100" stroke={live > 0.05 ? AMBER : "#9AA3AF"} strokeWidth={9} />
          </svg>
          <Clothesline x={360} y={360} w={560} live={live} />
        </Yard>
        <Pop at={8.4} x={110} y={360}>
          <Tag bg="#FFD3C2">✂️ kabel putus</Tag>
        </Pop>
        <Pop at={9.2} x={80} y={830}>
          <Tag bg="#E8EDF1">🏠 atap seng</Tag>
        </Pop>
        <Pop at={10.35} x={430} y={820}>
          <Tag bg={AMBER} size={42} rot={3}>⚡ kawat jemuran ikut berarus</Tag>
        </Pop>
      </Scene>

      {/* 3 — Si Halus: Listrik Nyasar */}
      <Scene a={11.95} b={14.42}>
        <Yard dim={0.25}>
          <Clothesline x={200} y={300} w={640} live={1} />
        </Yard>
        <Scanner at={12.35} dur={0.9} top={360} height={760}>
          <div style={{ position: "absolute", left: 330, top: 560 }}>
            <SiHalus size={420} variant="volt" mood={t > 13.6 ? "laugh" : "grin"} />
          </div>
        </Scanner>
        <Sticker at={13.62} y={360} bg={AMBER} size={74} rotate={-3}>
          {"SI HALUS:\nLISTRIK NYASAR ⚡"}
        </Sticker>
      </Scene>

      {/* 4 — 30–50 mA ganggu jantung; badan basah */}
      <Scene a={14.42} b={20.12}>
        <Pop at={14.5} x={110} y={340}>
          <HeartEcg chaos={interpolate(t, [15.5, 16.5], [0, 1], clamp)} />
        </Pop>
        <Sticker at={14.7} y={860} bg="#FFF6E8" size={84} rotate={-2}>
          {"30–50 mA"}
        </Sticker>
        <Sticker at={16.3} y={1000} bg={RED} color={C.white} size={52} rotate={2} out={18.0}>
          {"BISA GANGGU JANTUNG 💔"}
        </Sticker>
        <Sticker at={18.15} y={1000} bg="#BFE6EF" size={52} rotate={2}>
          {"💧 BADAN BASAH = JALUR LISTRIK"}
        </Sticker>
        <Source y={1150}>sumber: ABB Indonesia (RCCB/ELCB)</Source>
      </Scene>

      {/* 5 — 1-2-3 langkah menolong (layak disimpan) */}
      <Scene a={20.12} b={28.7}>
        <Sticker at={20.2} y={330} bg={RED} color={C.white} size={58} rotate={-2}>
          {"ADA YANG KESETRUM?"}
        </Sticker>
        <Pop at={20.45} from="left" x={70} y={470}>
          <StepCard n={1} icon="🚫" title="JANGAN LANGSUNG DIPEGANG!" sub="tubuhmu ikut jadi jalur listrik" color={RED} active={t < 22.8} />
        </Pop>
        <Pop at={22.85} from="right" x={70} y={672}>
          <StepCard n={2} icon="🔌" title="MATIKAN MCB DI METERAN" sub="putus dulu sumber listriknya" color={AMBER} active={t >= 22.8 && t < 24.8} />
        </Pop>
        <Pop at={24.85} from="left" x={70} y={874}>
          <StepCard n={3} icon="🧹" title="DORONG PAKAI KAYU KERING" sub="atau sapu kering · berdiri di alas kering" color="#2F9E57" active={t >= 24.8} />
        </Pop>
        <Sticker at={27.1} y={1095} bg="#FFF6E8" size={42} rotate={3}>
          {"📌 SIMPAN, BIAR INGAT SAAT PANIK"}
        </Sticker>
      </Scene>

      {/* 6 — cek rumahmu */}
      <Scene a={28.7} b={34.62}>
        <Sticker at={28.8} y={330} bg={AMBER} size={66} rotate={-3}>
          {"🔎 CEK RUMAHMU"}
        </Sticker>
        <div style={{ position: "absolute", left: 80, top: 480, display: "flex", flexDirection: "column", gap: 24 }}>
          <CheckRow icon="🧵" label="Kabel yang ngelupas" at={29.75} />
          <CheckRow icon="🔌" label="Colokan numpuk kayak sate" at={31.15} />
          <CheckRow icon="🧺" label="Jemuran dekat kabel/seng" at={32.4} />
        </div>
        {t > 31.15 && t < 34.62 && (
          <Pop at={31.3} x={330} y={985} style={{ scale: "0.72" }}>
            <PlugSate />
          </Pop>
        )}
      </Scene>

      {/* 7 — ELCB */}
      <Scene a={34.62} b={41.45}>
        <Sticker at={34.7} y={330} bg="#FFF6E8" size={70} rotate={-2}>
          {"PASANG ELCB 🛡️"}
        </Sticker>
        <Pop at={34.9} x={60} y={480}>
          <Meter offAt={999} elcb tripAt={37.25} />
        </Pop>
        {elcbLeak && <Spark x={760} y={760} at={36.0} size={0.9} />}
        <Pop at={36.0} x={640} y={600} out={37.25}>
          <Tag bg="#FFD3C2" size={38}>arus bocor ke badan…</Tag>
        </Pop>
        <Pop at={37.25} x={600} y={560}>
          <div style={{ fontFamily: HEAD, fontSize: 120, color: AMBER, WebkitTextStroke: `14px ${C.ink}`, paintOrder: "stroke fill", rotate: "-8deg" }}>KLIK!</div>
        </Pop>
        <Pop at={37.6} x={600} y={760}>
          <Tag bg="#E9F7EC" size={44}>⏱️ &lt; 0,04 detik</Tag>
        </Pop>
        <Sticker at={39.55} y={1060} bg={AMBER} size={50} rotate={2}>
          {"LEBIH MURAH DARI NYAWA 🤍"}
        </Sticker>
      </Scene>

      {/* 8 — banjir */}
      <Scene a={41.45} b={44.62}>
        <FloodHouse rise={interpolate(t, [41.5, 43.0], [0, 1], { ...clamp, easing: easeOut })} />
        <Sticker at={41.55} y={330} bg="#BFE6EF" size={58} rotate={-2}>
          {"🌊 BANJIR? MATIKAN LISTRIK DULU"}
        </Sticker>
        <Pop at={42.4} x={620} y={500}>
          <div style={{ scale: "0.55", transformOrigin: "0 0" }}>
            <Meter offAt={42.7} />
          </div>
        </Pop>
        <Source y={1150}>kasus: banjir Cilincing, awal 2026 (Metro TV)</Source>
      </Scene>

      {/* 9 — penutup haru: ibu memeluk anak, cahaya keemasan */}
      <Scene a={44.62} b={EP10.endStart + 0.2}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,214,140,${0.95 * glow}) 0%, rgba(255,190,110,${0.5 * glow}) 45%, rgba(255,240,220,0) 75%)` }} />
        <div style={{ position: "absolute", left: 250, top: 420, scale: String(0.96 + 0.04 * hug) }}>
          <Worker size={600} pose="holdTool" expr="happy" {...IBU} seed={4} />
        </div>
        <div style={{ position: "absolute", left: 420, top: 690, translate: `${interpolate(hug, [0, 1], [120, 0])}px 0px` }}>
          <Worker size={380} pose="idle" expr="happy" {...ANAK} seed={3} />
        </div>
        <FloatHearts at={45.0} />
        <Sticker at={47.0} y={330} bg="#FFF6E8" size={52} rotate={-2}>
          {"TUGAS KITA:\nRUMAH YANG AMAN 🏠🤍"}
        </Sticker>
      </Scene>
    </AbsoluteFill>
  );
};

export const Ep10: React.FC = () => (
  <Episode ep={10} accent="#FFB21A" tint="#F3C98B" words={words} endStart={EP10.endStart} revealAt={EP10.revealAt} flashes={[2.4, 13.62]}>
    <Ep10Scenes />
  </Episode>
);
