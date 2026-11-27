import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode, warpOldToNew } from "../Episode";
import { BigStat, Pop, Scanner, Sticker, useShake } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep15.words";
import { warp } from "./ep15.warp";

/**
 * EP15 "Air Panas di Dapur" — luka bakar air panas pada anak.
 * Semua waktu = detik isi utama (data/ep15_words.json). Tema HANGAT (rose-krem) — teks gelap di latar terang.
 * Kejadian digambarkan simbolis (siluet + uap), tanpa menampilkan luka.
 */
export const EP15 = { endStart: 56.76, revealAt: 57.64 };

const ROSE = "#E0566F";
const SH = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const IBU = { hijab: "#8A3B4A", shirt: "#F2A65A", pants: "#3B3B4F" } as const;
const ANAK = { hair: "#2A1B12", shirt: "#6FB3E0", pants: "#3B4E8A" } as const;

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

/* ----------------------------------------------------------- gambar lokal */

/** Dapur hangat: dinding krem-rose, meja dapur, lantai kayu */
const Kitchen: React.FC<{ children?: React.ReactNode; dim?: number; glow?: number; counter?: boolean }> = ({ children, dim = 0, glow = 0, counter = true }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 880, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: "#FBEDE6" }}>
    {/* ubin dinding */}
    {[0, 1, 2, 3].map((r) => (
      <div key={r} style={{ position: "absolute", left: 0, right: 0, top: 60 + r * 90, height: 2, background: "#EBCFC4" }} />
    ))}
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 190, background: "#D9B38C", borderTop: `${OUTLINE}px solid ${C.ink}` }} />
    {counter && (
      <div style={{ position: "absolute", right: -10, width: 560, top: 420, height: 290, background: "#C98F6B", border: `${OUTLINE}px solid ${C.ink}`, borderRadius: "18px 0 0 0" }}>
        <div style={{ position: "absolute", left: -10, right: 0, top: -14, height: 34, background: "#F4E3D3", border: `${OUTLINE}px solid ${C.ink}`, borderRadius: 12 }} />
        <div style={{ position: "absolute", left: 60, top: 90, width: 180, height: 150, borderRadius: 14, border: `6px solid ${C.ink}`, background: "#B97E5B" }} />
        <div style={{ position: "absolute", left: 290, top: 90, width: 180, height: 150, borderRadius: 14, border: `6px solid ${C.ink}`, background: "#B97E5B" }} />
      </div>
    )}
    {children}
    {glow > 0 && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(255,205,140,0.6), rgba(255,190,110,0) 70%)", opacity: glow }} />}
    {dim > 0 && <div style={{ position: "absolute", inset: 0, background: "#4A2F35", opacity: dim }} />}
  </div>
);

/** Panci di atas kompor; `handle` = "out" (gagang menjorok ke luar/kiri) atau "in" (diputar ke dalam) */
const Pot: React.FC<{ w?: number; handle?: number; steam?: number; t?: number }> = ({ w = 380, handle = 0, steam = 1, t = 0 }) => (
  <svg width={w} height={w * (260 / 380)} viewBox="0 0 380 260" style={{ overflow: "visible" }}>
    {/* kompor */}
    <rect x={30} y={200} width={320} height={40} rx={12} fill="#555B66" {...SH} />
    {[110, 270].map((x) => (
      <ellipse key={x} cx={x} cy={200} rx={40} ry={8} fill="#F08A4B" opacity={0.85} />
    ))}
    {/* gagang: berputar dari kiri (out) ke belakang (in) */}
    <g transform={`rotate(${handle * 70} 110 125)`}>
      <rect x={-30} y={112} width={150} height={26} rx={13} fill="#3A3F4B" {...SH} />
    </g>
    <rect x={100} y={70} width={210} height={135} rx={20} fill="#C9CED6" {...SH} />
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

/** Kepulan uap besar (pengganti adegan tumpah — lembut, tanpa luka) */
const SteamBurst: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  if (t < at) return null;
  const k = interpolate(t, [at, at + 0.9], [0, 1], { ...clamp, easing: easeInOut });
  return (
    <>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 240 + (i % 4) * 160 - 60 + Math.sin(i * 2.1) * 40,
            top: 430 - k * (120 + i * 30) + (i > 3 ? 120 : 0),
            width: 240 + i * 22,
            height: 240 + i * 22,
            borderRadius: "50%",
            background: "#FFFFFF",
            opacity: 0.92 * k,
            scale: String(0.4 + 0.8 * k),
            filter: "blur(4px)",
          }}
        />
      ))}
    </>
  );
};

const Tag: React.FC<{ children: React.ReactNode; bg?: string; size?: number; rot?: number }> = ({ children, bg = C.cream, size = 40, rot = -2 }) => (
  <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: size, color: C.ink, background: bg, padding: "8px 22px 10px", borderRadius: 20, border: `6px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, rotate: `${rot}deg`, whiteSpace: "nowrap" }}>{children}</div>
);

const Source: React.FC<{ children: React.ReactNode; y?: number }> = ({ children, y = 1130 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 28, color: "#6B4148" }}>{children}</div>
);

/** Kartu langkah (ikon + judul + sub) */
const RuleCard: React.FC<{ icon: string; title: string; sub?: string; at: number; next?: number; y: number; color: string; bad?: boolean; h?: number }> = ({ icon, title, sub, at, next, y, color, bad, h = 190 }) => {
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
        height: h,
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "0 30px",
        borderRadius: 36,
        background: active ? (bad ? "#FFE3E3" : "#FFF1E6") : "#FDFBF8",
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
        {sub && <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 32, color: "#6B4148", marginTop: 8, lineHeight: 1.1 }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Lapisan kulit: dewasa (tebal) vs anak (tipis) */
const SkinCol: React.FC<{ x: number; label: string; layers: number; at: number; emoji: string }> = ({ x, label, layers, at, emoji }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 12, stiffness: 180 } });
  const cols = ["#F6CBB0", "#EEB094", "#E59A80", "#D9846E"];
  return (
    <div style={{ position: "absolute", left: x, top: 470, width: 400, textAlign: "center", scale: String(interpolate(s, [0, 1], [0.4, 1])), opacity: interpolate(s, [0, 0.3], [0, 1], clamp) }}>
      <div style={{ fontSize: 110 }}>{emoji}</div>
      <div style={{ fontFamily: HEAD, fontSize: 52, color: C.ink, margin: "6px 0 18px" }}>{label}</div>
      <div style={{ margin: "0 auto", width: 330, borderRadius: 26, overflow: "hidden", border: `7px solid ${C.ink}`, boxShadow: `0 9px 0 ${C.ink}` }}>
        {cols.slice(0, layers).map((c, i) => (
          <div key={i} style={{ height: layers > 2 ? 70 : 52, background: c, borderTop: i ? `4px dashed ${C.ink}` : undefined }} />
        ))}
        <div style={{ height: 70, background: "#B5575F" }} />
      </div>
    </div>
  );
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
const Ep15Scenes: React.FC = () => {
  const t = useT();
  const shake = useShake([
    { t: 12.49, a: 12 },
    { t: 32.48, a: 6 },
  ]);
  // adegan 1: tangan kecil meraih gagang yang menjorok → uap mengepul → memudar lembut
  const reach = interpolate(t, [0.3, 2.6], [0, 1], { ...clamp, easing: easeInOut });
  const fade = interpolate(t, [3.0, 3.8], [1, 0], clamp);
  const soft = interpolate(t, [3.4, 4.6], [0, 1], clamp);
  // adegan akhir: gagang diputar ke dalam
  const turn = interpolate(t, [51.4, 52.4], [0, 1], { ...clamp, easing: easeInOut });
  const glow = interpolate(t, [52.7, 54.0], [0, 1], { ...clamp, easing: easeInOut });

  return (
    <AbsoluteFill style={{ translate: shake }}>
      {/* 1 — sedetik lengah (simbolis) */}
      <Scene a={0} b={5.0} zoom={false}>
        <Kitchen glow={soft * 0.6}>
          <div style={{ position: "absolute", left: 470, top: 238 }}>
            <Pot w={420} t={t} />
          </div>
          <div style={{ position: "absolute", left: 40 + reach * 250, top: 330, opacity: 0.85 * fade, filter: "brightness(0.35) sepia(0.6)" }}>
            <Worker size={250} pose="wave" expr="normal" {...ANAK} seed={14} />
          </div>
          <SteamBurst at={2.9} />
        </Kitchen>
        <Pop at={0.2} x={70} y={340}>
          <Tag bg="#FFFFFF" size={42} rot={-3}>
            ⏱️ cuma sedetik lengah…
          </Tag>
        </Pop>
        <Pop at={1.4} x={520} y={440}>
          <Tag bg="#FFE3E3" size={36} rot={3}>
            gagang panci menjorok 👀
          </Tag>
        </Pop>
      </Scene>

      {/* 2 — sering banget: Ponorogo */}
      <Scene a={5.0} b={9.4}>
        <Kitchen dim={0.08}>
          <div style={{ position: "absolute", left: 250, top: 238, opacity: 0.9 }}>
            <Pot w={420} t={t} />
          </div>
        </Kitchen>
        <Sticker at={5.06} y={470} bg="#FFF3E8" color={C.ink} size={56} rotate={-2}>
          {"KASUS KAYAK GINI\nSERING BANGET"}
        </Sticker>
        <Pop at={6.56} x={70} y={340}>
          <Tag bg="#FFFFFF" size={42} rot={-3}>
            📍 Ponorogo
          </Tag>
        </Pop>
        <Pop at={7.6} x={110} y={1010}>
          <Tag bg="#FBF3EF" size={38} rot={0}>
            🕯️ balita kecebur panci air panas
          </Tag>
        </Pop>
      </Scene>

      {/* 3 — Si Halus: Air Panas */}
      <Scene a={9.4} b={13.1}>
        <Kitchen dim={0.16}>
          <div style={{ position: "absolute", left: 470, top: 238, opacity: 0.6 }}>
            <Pot w={420} t={t} />
          </div>
        </Kitchen>
        <Scanner at={9.9} dur={0.9} top={430} height={700}>
          <div style={{ position: "absolute", left: 330, top: 470 }}>
            <SiHalus size={420} variant="steam" mood="laugh" />
          </div>
        </Scanner>
        <Pop at={10.9} x={90} y={1010}>
          <Tag bg="#FFFFFF" size={36} rot={-2}>
            paling deket sama dapur kita 🔥
          </Tag>
        </Pop>
        <Sticker at={12.49} y={340} bg={ROSE} color={C.white} size={60} rotate={-3}>
          {"SI HALUS: AIR PANAS ♨️"}
        </Sticker>
      </Scene>

      {/* 4 — kulit anak lebih tipis */}
      <Scene a={13.1} b={20.6}>
        <Sticker at={13.25} y={310} bg="#FFF3E8" color={C.ink} size={52} rotate={-2}>
          {"KULIT ANAK LEBIH TIPIS"}
        </Sticker>
        <SkinCol x={70} label="DEWASA" layers={4} at={13.6} emoji="🧑" />
        <SkinCol x={610} label="ANAK" layers={2} at={14.4} emoji="👶" />
        <Pop at={15.98} x={80} y={1000}>
          <Tag bg="#FFFFFF" size={36} rot={-2}>
            kita: cuma kaget 😳
          </Tag>
        </Pop>
        <Pop at={17.9} x={520} y={1000}>
          <Tag bg="#FFE3E3" size={36} rot={2}>
            anak: luka bakar dalam 🩹
          </Tag>
        </Pop>
      </Scene>

      {/* 5 — data WHO */}
      <Scene a={20.6} b={28.0}>
        <Pop at={20.76} x={70} y={330}>
          <Tag bg="#FFFFFF" size={42} rot={-3}>
            🌍 WHO nyatet:
          </Tag>
        </Pop>
        <BigStat at={21.6} from={0} to={180000} dur={1.6} y={500} color={ROSE} />
        <Pop at={22.4} x={120} y={780}>
          <Tag bg="#FFFFFF" size={40} rot={-1}>
            🔥 kematian akibat luka bakar / tahun
          </Tag>
        </Pop>
        <Pop at={25.2} x={150} y={930}>
          <Tag bg="#FFF3E8" size={40} rot={-2}>
            🏠 kebanyakan di rumah
          </Tag>
        </Pop>
        <Pop at={26.4} x={330} y={1030}>
          <Tag bg="#FFF3E8" size={40} rot={2}>
            🏭 & tempat kerja
          </Tag>
        </Pop>
        <Source y={1150}>sumber: WHO, Burns fact sheet (~180.000/tahun)</Source>
      </Scene>

      {/* 6 — pertolongan pertama (bagian yang disimpan) */}
      <Scene a={28.0} b={38.7}>
        <Sticker at={28.05} y={300} bg={ROSE} color={C.white} size={54} rotate={-2}>
          {"KALAU KEJADIAN 🚑"}
        </Sticker>
        <RuleCard icon="💧" title="AIR MENGALIR SEJUK" sub="±20 menit — bukan air es" at={28.16} next={32.48} y={440} color="#BFE3F5" />
        <RuleCard icon="❌" title="JANGAN ES / ODOL" sub="jangan mentega, jangan kecap" at={32.48} next={35.49} y={660} color="#FFC9C9" bad />
        <RuleCard icon="💍" title="LEPAS BAJU & PERHIASAN" sub="kecuali yang udah nempel di kulit" at={35.49} y={880} color="#FFE27A" />
        <Pop at={37.0} x={330} y={1100}>
          <Tag bg="#FFF3E8" size={36} rot={-2}>
            📌 simpan video ini
          </Tag>
        </Pop>
      </Scene>

      {/* 7 — tutup & ke dokter */}
      <Scene a={38.7} b={44.2}>
        <Sticker at={38.75} y={300} bg="#FFF3E8" color={C.ink} size={54} rotate={-2}>
          {"TERUS… 👇"}
        </Sticker>
        <RuleCard icon="🧺" title="TUTUP KAIN BERSIH" sub="longgar, jangan ditekan" at={38.83} next={40.6} y={440} color="#F3D6C6" />
        <RuleCard icon="🏥" title="KE DOKTER" sub="apalagi kalau…" at={40.6} y={660} color="#BDE8D5" />
        <Pop at={41.9} x={90} y={900}>
          <Tag bg="#FFE3E3" size={38} rot={-2}>
            ✋ lebih besar dari telapak tangan
          </Tag>
        </Pop>
        <Pop at={43.1} x={330} y={1010}>
          <Tag bg="#FFE3E3" size={38} rot={2}>
            🙂 atau kena muka
          </Tag>
        </Pop>
      </Scene>

      {/* 8 — pencegahan */}
      <Scene a={44.2} b={51.0}>
        <Sticker at={44.33} y={300} bg={ROSE} color={C.white} size={54} rotate={-2}>
          {"CEGAHNYA 👇"}
        </Sticker>
        <RuleCard icon="🔄" title="GAGANG PANCI KE DALAM" sub="jangan menjorok ke pinggir kompor" at={44.6} next={46.5} y={440} color="#FFD8B8" />
        <RuleCard icon="🫖" title="TERMOS & DISPENSER" sub="taruh di tempat tinggi" at={46.5} next={48.67} y={660} color="#BFE3F5" />
        <RuleCard icon="🚸" title="ANAK JAUH DARI DAPUR" sub="pas lagi masak" at={48.67} y={880} color="#FFE27A" />
      </Scene>

      {/* 9 — haru: dapur yang ikut jagain */}
      <Scene a={51.0} b={EP15.endStart}>
        <Kitchen glow={glow}>
          <div style={{ position: "absolute", left: 470, top: 238 }}>
            <Pot w={420} handle={turn} t={t} />
          </div>
          <div style={{ position: "absolute", left: 250, top: 200 }}>
            <Worker size={420} pose="point" expr="happy" {...IBU} seed={15} />
          </div>
          <div style={{ position: "absolute", left: 20, top: 400 }}>
            <Worker size={260} pose="wave" expr="happy" {...ANAK} seed={14} />
          </div>
        </Kitchen>
        <FloatHearts at={53.0} />
        <Pop at={51.04} x={110} y={340}>
          <Tag bg="#FFFFFF" size={38} rot={-2}>
            kita nggak bisa jagain anak tiap detik
          </Tag>
        </Pop>
        <Sticker at={52.73} y={1000} bg="#FFF3D6" color={C.ink} size={46} rotate={1}>
          {"TAPI DAPUR KITA\nBISA IKUT JAGAIN 💛"}
        </Sticker>
      </Scene>
    </AbsoluteFill>
  );
};

const W = warp.length ? warp : undefined;

export const Ep15: React.FC = () => (
  <Episode ep={15} accent="#E0566F" tint="#F3C1C8" words={words} endStart={W ? warpOldToNew(EP15.endStart, W) : EP15.endStart} revealAt={W ? warpOldToNew(EP15.revealAt, W) : EP15.revealAt} warp={W} flashes={[12.49]}>
    <Ep15Scenes />
  </Episode>
);
