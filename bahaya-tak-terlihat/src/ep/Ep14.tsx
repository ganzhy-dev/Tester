import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode, warpOldToNew } from "../Episode";
import { Pop, Scanner, Sticker, useShake } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep14.words";
import { warp } from "./ep14.warp";

/**
 * EP14 "Botol Air Mineral, Bukan Isi Air?" — cairan berbahaya disimpan di botol minum.
 * Semua waktu = detik isi utama (data/ep14_words.json). Tema HANGAT (mint) — teks gelap di latar terang.
 * Kasus Sukabumi digambarkan simbolis & lembut (siluet, kursi kosong), tanpa menampilkan bahaya.
 */
export const EP14 = { endStart: 46.85, revealAt: 49.54 };

const MINT = "#2E9E83";
const SH = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const IBU = { hijab: "#2E6B5E", shirt: "#E8834A", pants: "#3B3B4F" } as const;
const ANAK = { hair: "#2A1B12", shirt: "#F2B33D", pants: "#3B4E8A" } as const;
const DOKTER = { hair: "#2A1B12", shirt: "#FFFFFF", pants: "#3B4E8A" } as const;

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

/* ----------------------------------------------------------- gambar lokal */

/** Ruangan hangat (dinding mint-krem, lantai kayu) */
const Room: React.FC<{ children?: React.ReactNode; dim?: number; wall?: string; floor?: string; glow?: number }> = ({
  children,
  dim = 0,
  wall = "#EAF4EC",
  floor = "#D9B38C",
  glow = 0,
}) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 880, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: wall }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 190, background: floor, borderTop: `${OUTLINE}px solid ${C.ink}` }} />
    {children}
    {glow > 0 && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(255,210,130,0.6), rgba(255,190,100,0) 70%)", opacity: glow }} />}
    {dim > 0 && <div style={{ position: "absolute", inset: 0, background: "#2F4A44", opacity: dim }} />}
  </div>
);

const Tag: React.FC<{ children: React.ReactNode; bg?: string; size?: number; rot?: number }> = ({ children, bg = C.cream, size = 40, rot = -2 }) => (
  <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: size, color: C.ink, background: bg, padding: "8px 22px 10px", borderRadius: 20, border: `6px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, rotate: `${rot}deg`, whiteSpace: "nowrap" }}>{children}</div>
);

const Source: React.FC<{ children: React.ReactNode; y?: number }> = ({ children, y = 1130 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 28, color: "#3F5E56" }}>{children}</div>
);

/** Botol bening ala air mineral; `fill` = warna cairan, `label` = tulisan label */
const Bottle: React.FC<{ w?: number; fill?: string; level?: number; label?: string; labelColor?: string; cap?: string; warn?: boolean }> = ({
  w = 170,
  fill = "#CFEFFF",
  level = 0.7,
  label = "AIR?",
  labelColor = "#3F8FD6",
  cap = "#3F8FD6",
  warn = false,
}) => {
  const top = 356 - 300 * level;
  return (
    <svg width={w} height={w * (360 / 170)} viewBox="0 0 170 370" style={{ overflow: "visible" }}>
      <rect x={55} y={0} width={60} height={34} rx={8} fill={cap} {...SH} />
      <path d="M60 34 L110 34 L110 70 Q160 90 160 140 L160 330 Q160 356 134 356 L36 356 Q10 356 10 330 L10 140 Q10 90 60 70 Z" fill="#EAF8FF" {...SH} />
      <path d={`M14 ${top} L156 ${top} L156 330 Q156 352 134 352 L36 352 Q14 352 14 330 Z`} fill={fill} opacity={0.9} />
      <path d="M30 120 Q26 220 34 300" fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.75} />
      {label && (
        <>
          <rect x={18} y={150} width={134} height={54} rx={8} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
          <text x={85} y={187} textAnchor="middle" fontFamily="LilitaOne" fontSize={label.length > 10 ? 17 : label.length > 6 ? 22 : 30} fill={labelColor}>
            {label}
          </text>
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

/** Kursi/sofa kecil tampak samping */
const Chair: React.FC = () => (
  <svg width={420} height={330} viewBox="0 0 420 330" style={{ overflow: "visible" }}>
    <rect x={30} y={20} width={360} height={150} rx={40} fill="#8FC7B4" {...SH} />
    <rect x={10} y={150} width={400} height={80} rx={30} fill="#7AB8A3" {...SH} />
    <rect x={40} y={230} width={26} height={90} rx={8} fill="#7A5236" {...SH} />
    <rect x={354} y={230} width={26} height={90} rx={8} fill="#7A5236" {...SH} />
  </svg>
);

/** Gelas berisi air bening sungguhan */
const Glass: React.FC<{ w?: number }> = ({ w = 120 }) => (
  <svg width={w} height={w * 1.25} viewBox="0 0 120 150" style={{ overflow: "visible" }}>
    <path d="M12 8 L108 8 L96 142 L24 142 Z" fill="#EAF8FF" {...SH} strokeWidth={6} />
    <path d="M20 50 L100 50 L94 136 L26 136 Z" fill="#9FD8F5" opacity={0.85} />
    <path d="M30 60 L34 126" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" opacity={0.8} />
  </svg>
);

/** Kartu aturan/pertolongan pertama (ikon + judul + sub) */
const RuleCard: React.FC<{ icon: string; title: string; sub?: string; at: number; next?: number; y: number; color: string; bad?: boolean }> = ({ icon, title, sub, at, next, y, color, bad }) => {
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
        height: 190,
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "0 30px",
        borderRadius: 36,
        background: active ? (bad ? "#FFE6E1" : "#E3F5EC") : "#FDFDF9",
        border: `7px solid ${C.ink}`,
        boxShadow: `0 10px 0 ${C.ink}`,
        translate: `${interpolate(s, [0, 1], [-1000, 0])}px 0px`,
        scale: active ? String(1 + 0.015 * Math.sin((t - at) * 7)) : "0.97",
        opacity: active ? 1 : 0.82,
      }}
    >
      <div style={{ flex: "none", width: 116, height: 116, borderRadius: 30, background: color, border: `6px solid ${C.ink}`, display: "grid", placeItems: "center", fontSize: 64 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: HEAD, fontSize: 50, lineHeight: 1, color: C.ink }}>{title}</div>
        {sub && <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 32, color: "#3F5E56", marginTop: 8, lineHeight: 1.1 }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Rantai pikiran anak: haus → ada botol → minum */
const ChainStep: React.FC<{ icon: string; label: string; at: number; x: number }> = ({ icon, label, at, x }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 10, stiffness: 230 } });
  return (
    <div style={{ position: "absolute", left: x, top: 880, width: 250, textAlign: "center", scale: String(interpolate(s, [0, 1], [0.3, 1])), opacity: interpolate(s, [0, 0.3], [0, 1], clamp) }}>
      <div style={{ margin: "0 auto", width: 170, height: 170, borderRadius: 40, background: "#FFFDF6", border: `7px solid ${C.ink}`, boxShadow: `0 9px 0 ${C.ink}`, display: "grid", placeItems: "center", fontSize: 96 }}>{icon}</div>
      <div style={{ marginTop: 12, fontFamily: HEAD, fontSize: 44, color: C.ink }}>{label}</div>
    </div>
  );
};

const Arrow: React.FC<{ at: number; x: number }> = ({ at, x }) => {
  const t = useT();
  if (t < at) return null;
  const k = interpolate(t, [at, at + 0.2], [0, 1], clamp);
  return <div style={{ position: "absolute", left: x, top: 925, fontFamily: HEAD, fontSize: 80, color: MINT, opacity: k, WebkitTextStroke: `6px ${C.ink}`, paintOrder: "stroke fill" }}>→</div>;
};

const FloatHearts: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  if (t < at) return null;
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const p = ((t - at) * 0.35 + i / 6) % 1;
        return (
          <div key={i} style={{ position: "absolute", left: 90 + i * 160 + Math.sin(t * 1.5 + i) * 30, top: 1060 - p * 640, fontSize: 44 + (i % 3) * 14, opacity: Math.sin(p * Math.PI) * 0.85 }}>
            💛
          </div>
        );
      })}
    </>
  );
};

/* ----------------------------------------------------------------- adegan */
const Ep14Scenes: React.FC = () => {
  const t = useT();
  const shake = useShake([
    { t: 14.8, a: 12 },
    { t: 22.89, a: 6 },
    { t: 32.21, a: 6 },
  ]);
  // adegan 1: siluet balita merangkak menuju botol, lalu memudar lembut → kursi kosong
  const crawl = interpolate(t, [0.3, 1.8], [0, 1], { ...clamp, easing: easeInOut });
  const fade = interpolate(t, [1.9, 2.7], [1, 0], clamp);
  const soft = interpolate(t, [1.9, 2.8], [0, 1], clamp);
  const glow = interpolate(t, [40.6, 41.8], [0, 1], { ...clamp, easing: easeInOut });
  const chainDim = interpolate(t, [21.3, 21.6], [1, 0.3], clamp);
  const water = interpolate(t, [42.9, 44.4], [0, 1], { ...clamp, easing: easeInOut });

  return (
    <AbsoluteFill style={{ translate: shake }}>
      {/* 1 — Sukabumi, simbolis & lembut */}
      <Scene a={0} b={3.0} zoom={false}>
        <Room glow={soft * 0.7}>
          <div style={{ position: "absolute", left: 420, top: 320 }}>
            <Chair />
          </div>
          <div style={{ position: "absolute", left: 640, top: 520, rotate: "-78deg" }}>
            <Bottle w={90} fill="#E9F7C9" level={0.55} label="" />
          </div>
          <div
            style={{
              position: "absolute",
              left: 120 + crawl * 300,
              top: 430,
              opacity: 0.85 * fade,
              filter: "brightness(0.35) sepia(0.6)",
            }}
          >
            <Worker size={260} pose="point" expr="normal" {...ANAK} seed={11} />
          </div>
        </Room>
        <Pop at={0.2} x={70} y={340}>
          <Tag bg="#FFFFFF" size={42} rot={-3}>
            📍 Sukabumi
          </Tag>
        </Pop>
        <Pop at={1.6} x={170} y={1010}>
          <Tag bg="#F4FAF5" size={40} rot={0}>
            🕯️ balita 2 tahun, nggak selamat
          </Tag>
        </Pop>
      </Scene>

      {/* 2 — dokter anak IDAI: banyak kasus */}
      <Scene a={3.0} b={10.05}>
        <Room>
          <div style={{ position: "absolute", left: 40, top: 230 }}>
            <Worker size={500} pose="point" expr="normal" {...DOKTER} seed={12} />
          </div>
          <div style={{ position: "absolute", left: 520, top: 380, display: "flex", gap: 24, alignItems: "flex-end" }}>
            {[
              { at: 6.9, fill: "#F2E7A0" },
              { at: 7.4, fill: "#E9F7C9" },
              { at: 7.9, fill: "#D8C7F0" },
            ].map((b, i) =>
              t >= b.at - 0.05 ? (
                <div key={i} style={{ scale: String(interpolate(t, [b.at, b.at + 0.3], [0.4, 1], clamp)), opacity: interpolate(t, [b.at, b.at + 0.2], [0, 1], clamp) }}>
                  <Bottle w={120} fill={b.fill} level={0.6} label="AIR?" warn />
                </div>
              ) : (
                <div key={i} style={{ width: 120 }} />
              ),
            )}
          </div>
        </Room>
        <Pop at={3.2} x={70} y={340}>
          <Tag bg="#E3F5EC" size={40} rot={-2}>
            🩺 kata dokter anak IDAI
          </Tag>
        </Pop>
        <Sticker at={4.6} y={470} bg="#FFF6E5" color={C.ink} size={52} rotate={2}>
          {"BANYAK ANAK NELEN\nCAIRAN BERBAHAYA"}
        </Sticker>
        <Pop at={8.3} x={150} y={1015}>
          <Tag bg="#FFFFFF" size={38} rot={-2}>
            gara-gara disimpen di botol air mineral
          </Tag>
        </Pop>
        <Source>IDAI (dr. Ariani Dewi Widodo) · kasus Sukabumi</Source>
      </Scene>

      {/* 3 — paling sering: air aki & minyak tanah */}
      <Scene a={10.05} b={12.45}>
        <Room>
          <div style={{ position: "absolute", left: 160, top: 300 }}>
            <Bottle w={200} fill="#E4F1F4" level={0.75} label="AIR AKI" labelColor="#E0566F" warn />
          </div>
          <div style={{ position: "absolute", left: 560, top: 300 }}>
            <Bottle w={200} fill="#F4E39A" level={0.75} label="MINYAK TANAH" labelColor="#B5651D" warn />
          </div>
        </Room>
        <Sticker at={10.2} y={330} bg="#FFE6E1" color={C.ink} size={56} rotate={-2}>
          {"PALING SERING ⚠️"}
        </Sticker>
      </Scene>

      {/* 4 — Si Halus: Botol Nyaru */}
      <Scene a={12.45} b={15.6}>
        <Room dim={0.16}>
          <div style={{ position: "absolute", left: 120, top: 360, opacity: 0.6 }}>
            <Bottle w={150} fill="#E9F7C9" level={0.6} label="AIR?" />
          </div>
        </Room>
        <Scanner at={13.1} dur={0.9} top={430} height={700}>
          <div style={{ position: "absolute", left: 380, top: 480 }}>
            <SiHalus size={420} variant="bottle" mood="laugh" />
          </div>
        </Scanner>
        <Sticker at={14.8} y={340} bg={MINT} color={C.white} size={60} rotate={-3}>
          {"SI HALUS: BOTOL NYARU 🍼"}
        </Sticker>
      </Scene>

      {/* 5 — POV anak: botol bening = minum */}
      <Scene a={15.6} b={22.7}>
        <Room>
          <div style={{ position: "absolute", left: 590, top: 210, opacity: chainDim }}>
            <Bottle w={210} fill="#E9F7C9" level={0.62} label="AIR?" />
          </div>
          <div style={{ position: "absolute", left: 120, top: 330, opacity: chainDim }}>
            <Worker size={360} pose="point" expr="happy" {...ANAK} seed={11} />
          </div>
        </Room>
        <Pop at={15.9} x={70} y={340}>
          <Tag bg="#FFFFFF" size={42} rot={-3}>
            buat anak: botol bening = minum
          </Tag>
        </Pop>
        <Pop at={18.6} x={430} y={440}>
          <Tag bg="#FFE6E1" size={38} rot={3}>
            belum bisa baca label 🔤
          </Tag>
        </Pop>
        <ChainStep icon="😫" label="haus" at={21.48} x={60} />
        <Arrow at={21.75} x={315} />
        <ChainStep icon="🍶" label="ada botol" at={21.85} x={405} />
        <Arrow at={22.05} x={660} />
        <ChainStep icon="🥤" label="minum" at={22.15} x={750} />
      </Scene>

      {/* 6 — aturan simpan (bagian yang disimpan) */}
      <Scene a={22.7} b={32.05}>
        <Sticker at={22.8} y={300} bg={MINT} color={C.white} size={54} rotate={-2}>
          {"ATURANNYA GAMPANG 👇"}
        </Sticker>
        <RuleCard icon="❌" title="JANGAN PINDAH KE BOTOL MINUM" sub="cairan berbahaya tetap di wadahnya" at={22.89} next={26.95} y={440} color="#FFD0C7" bad />
        <RuleCard icon="🏷️" title="BOTOL ASLI + LABEL JELAS" sub="biar semua orang tahu isinya" at={26.95} next={29.5} y={660} color="#BDE8D5" />
        <RuleCard icon="🔒" title="TARUH TINGGI / DIKUNCI" sub="di luar jangkauan tangan anak" at={29.5} y={880} color="#FFE27A" />
        <Pop at={31.0} x={330} y={1100}>
          <Tag bg="#FFF6E5" size={36} rot={-2}>
            📌 simpan video ini
          </Tag>
        </Pop>
      </Scene>

      {/* 7 — kalau terlanjur ketelen */}
      <Scene a={32.05} b={40.45}>
        <Sticker at={32.1} y={300} bg="#E0566F" color={C.white} size={54} rotate={-2}>
          {"KALAU TERLANJUR KETELEN 🚨"}
        </Sticker>
        <RuleCard icon="🚫" title="JANGAN DISURUH MUNTAH" sub="cairannya bisa melukai lagi" at={32.21} next={34.69} y={440} color="#FFD0C7" bad />
        <RuleCard icon="⚠️" title="LUKA KEDUA DI KERONGKONGAN" sub="saat cairan naik lagi" at={34.69} next={36.87} y={660} color="#FFE27A" bad />
        <RuleCard icon="🏥" title="LANGSUNG KE IGD" sub="+ BAWA BOTOLNYA, biar dokter tahu isinya" at={36.87} y={880} color="#BDE8D5" />
        <Source y={1110}>sumber: IDAI</Source>
      </Scene>

      {/* 8 — haru: yang kelihatan kayak air… memang air */}
      <Scene a={40.45} b={EP14.endStart}>
        <Room wall="#F2F1DE" floor="#E2B48A" glow={glow}>
          <div style={{ position: "absolute", left: 90, top: 240 }}>
            <Worker size={480} pose="point" expr="happy" {...IBU} seed={13} />
          </div>
          <div style={{ position: "absolute", left: 520, top: 400 }}>
            <Worker size={320} pose="wave" expr="happy" {...ANAK} seed={11} />
          </div>
          <div style={{ position: "absolute", left: 400 + water * 80, top: 470 - water * 30 }}>
            <Glass w={110} />
          </div>
        </Room>
        <FloatHearts at={41.0} />
        <Pop at={40.7} x={150} y={340}>
          <Tag bg="#FFFFFF" size={40} rot={-2}>
            anak kita nggak salah karena haus 💛
          </Tag>
        </Pop>
        <Sticker at={43.0} y={1000} bg="#FFF3D6" color={C.ink} size={46} rotate={1}>
          {"YANG KELIHATAN KAYAK AIR…\nHARUS MEMANG AIR 💛"}
        </Sticker>
      </Scene>
    </AbsoluteFill>
  );
};

const W = warp.length ? warp : undefined;

export const Ep14: React.FC = () => (
  <Episode ep={14} accent="#2E9E83" tint="#CDE8DC" words={words} endStart={W ? warpOldToNew(EP14.endStart, W) : EP14.endStart} revealAt={W ? warpOldToNew(EP14.revealAt, W) : EP14.revealAt} warp={W} flashes={[14.8]}>
    <Ep14Scenes />
  </Episode>
);
