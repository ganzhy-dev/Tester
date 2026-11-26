import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut, easeOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode } from "../Episode";
import { BigStat, Pop, Scanner, Sticker, useShake } from "../Kit";
import { CheckRow, Room } from "../Props";
import { Bed, Headline, Phone, S } from "../PropsStress";
import { Scene } from "./Ep1";
import { words } from "./ep9.words";

/** Semua waktu = detik isi utama (data/ep9_words.json), tanpa warp. Hook & CTA diatur Episode.tsx */
export const EP9 = { endStart: 60.64, revealAt: 63.0 };

const ACC = S.blue;
const SH = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const FEED = [
  { tag: "PHK", text: "Ribuan pekerja dirumahkan", color: S.red },
  { tag: "VIRAL", text: "Umur 22 udah punya rumah 🏠", color: C.pink },
  { tag: "HARGA", text: "Beras naik lagi 📈", color: C.orange },
  { tag: "BENCANA", text: "Banjir di mana-mana 🌧️", color: "#3A8DDE" },
  { tag: "FYP", text: "Resign, liburan ke Eropa ✈️", color: S.violet },
  { tag: "BREAKING", text: "Ekonomi lagi lesu…", color: S.red },
];

/* ----------------------------------------------------------- gambar lokal */

/** Jam besar (status bar) yang melompat */
const Clock: React.FC<{ jumpAt: number; from: string; to: string }> = ({ jumpAt, from, to }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const after = t >= jumpAt;
  const s = spring({ frame: (t - jumpAt) * fps, fps, config: { damping: 8, stiffness: 260 } });
  const spin = !after ? 0 : interpolate(s, [0, 1], [0, 1]);
  return (
    <div
      style={{
        fontFamily: HEAD,
        fontSize: 120,
        color: after ? C.yellow : C.cream,
        background: after ? "#0E1230" : "rgba(0,0,0,0.35)",
        padding: "6px 40px 14px",
        borderRadius: 40,
        border: `${OUTLINE}px solid ${C.ink}`,
        boxShadow: `0 12px 0 ${C.ink}`,
        scale: String(after ? interpolate(spin, [0, 1], [1.5, 1]) : 1),
        rotate: `${after ? (1 - spin) * 8 : 0}deg`,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {after ? to : from}
    </div>
  );
};

/** Kamar tidur: pagi → malam */
const Bedroom: React.FC<{ night: number; children?: React.ReactNode }> = ({ night, children }) => {
  const sky = night > 0.5 ? "#0B1030" : "#8FD3FF";
  return (
    <Room wall={night > 0.5 ? "#1B1840" : "#5C4A9A"} floor={night > 0.5 ? "#110F2A" : "#3A2D66"} dark={night * 0.35}>
      <div style={{ position: "absolute", left: 610, top: 70, width: 260, height: 220, borderRadius: 20, background: sky, border: `${OUTLINE}px solid ${C.ink}`, overflow: "hidden" }}>
        {night < 0.5 ? (
          <div style={{ position: "absolute", left: 150, top: 30, width: 80, height: 80, borderRadius: "50%", background: C.yellow, border: `5px solid ${C.ink}` }} />
        ) : (
          <div style={{ position: "absolute", left: 150, top: 30, width: 70, height: 70, borderRadius: "50%", background: C.cream, boxShadow: "-18px 0 0 0 #0B1030 inset" }} />
        )}
        <div style={{ position: "absolute", left: 126, top: 0, bottom: 0, width: 8, background: C.ink }} />
      </div>
      <div style={{ position: "absolute", left: 20, top: 560 }}>
        <Bed w={900} color={night > 0.5 ? "#3A3F8A" : "#5B6BD8"} />
      </div>
      {children}
    </Room>
  );
};

/** Cahaya layar HP di wajah */
const ScreenGlow: React.FC<{ x: number; y: number; r?: number; o?: number }> = ({ x, y, r = 360, o = 1 }) => {
  const t = useT();
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(140,175,255,${(0.42 + 0.08 * Math.sin(t * 7)) * o}) 0%, rgba(140,175,255,0) 70%)`,
        pointerEvents: "none",
      }}
    />
  );
};

/** TV kecil berisi berita */
const TV: React.FC<{ w?: number }> = ({ w = 300 }) => {
  const t = useT();
  return (
    <div style={{ position: "relative", width: w, height: w * 0.72 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: "#2A2F52", border: `${OUTLINE}px solid ${C.ink}` }} />
      <div style={{ position: "absolute", left: 16, right: 16, top: 16, bottom: 30, borderRadius: 14, background: "#CFE0FF", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 34, background: S.red, fontFamily: HEAD, fontSize: 24, color: C.white, whiteSpace: "nowrap", paddingTop: 2 }}>
          <span style={{ display: "inline-block", translate: `${-((t * 120) % 400)}px 0` }}>BREAKING NEWS · BREAKING NEWS · BREAKING NEWS ·</span>
        </div>
        <div style={{ position: "absolute", left: 18, top: 14, fontSize: w * 0.22 }}>🚨</div>
      </div>
      <div style={{ position: "absolute", left: w / 2 - 40, bottom: -26, width: 80, height: 26, background: C.ink, borderRadius: 6 }} />
    </div>
  );
};

/** Bar tingkat stres */
const StressBar: React.FC<{ at: number; level: number; label: string; color: string }> = ({ at, level, label, color }) => {
  const t = useT();
  const p = interpolate(t, [at, at + 0.7], [0, level], { ...clamp, easing: easeOut });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", width: 120, height: 300, borderRadius: 24, background: "rgba(0,0,0,0.35)", border: `6px solid ${C.ink}`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${p * 100}%`, background: color }} />
      </div>
      <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 34, color: C.cream, textAlign: "center", lineHeight: 1 }}>{label}</div>
    </div>
  );
};

/** Otak kartun */
const Brain: React.FC<{ size?: number; panic?: number }> = ({ size = 340, panic = 0 }) => {
  const t = useT();
  const j = panic * Math.sin(t * 60) * 6;
  return (
    <svg width={size} height={size * 0.82} viewBox="0 0 340 280" style={{ overflow: "visible", translate: `${j}px 0px` }}>
      <path
        d="M70 230 Q20 220 25 170 Q0 130 35 100 Q30 45 90 40 Q120 5 170 25 Q220 0 255 40 Q315 40 312 100 Q345 135 318 175 Q325 225 270 232 Q230 265 170 245 Q110 268 70 230 Z"
        fill="#FF9EC0"
        {...SH}
      />
      <path d="M170 30 Q160 140 175 245" fill="none" stroke={C.ink} strokeWidth={6} />
      <path d="M70 110 Q100 90 120 120 M220 90 Q250 80 270 110 M80 180 Q110 160 135 185 M210 170 Q240 150 265 180" fill="none" stroke="#D9668F" strokeWidth={8} strokeLinecap="round" />
      <ellipse cx={130} cy={150} rx={16} ry={20} fill={C.white} stroke={C.ink} strokeWidth={5} />
      <ellipse cx={210} cy={150} rx={16} ry={20} fill={C.white} stroke={C.ink} strokeWidth={5} />
      <circle cx={130} cy={152} r={7} fill={C.ink} />
      <circle cx={210} cy={152} r={7} fill={C.ink} />
      <ellipse cx={170} cy={205} rx={18} ry={14 + panic * 6} fill="#5A1030" stroke={C.ink} strokeWidth={5} />
    </svg>
  );
};

/** Lonceng alarm yang berdering */
const Alarm: React.FC<{ hits: number[]; size?: number }> = ({ hits, size = 220 }) => {
  const t = useT();
  const ring = hits.reduce((a, h) => {
    const d = t - h;
    return d >= 0 && d < 0.9 ? Math.max(a, 1 - d / 0.9) : a;
  }, 0.15);
  const rot = Math.sin(t * 45) * 16 * ring;
  return (
    <div style={{ position: "relative", width: size, height: size, rotate: `${rot}deg` }}>
      <svg width={size} height={size} viewBox="0 0 220 220" style={{ overflow: "visible" }}>
        <circle cx={60} cy={45} r={30} fill={C.yellow} {...SH} />
        <circle cx={160} cy={45} r={30} fill={C.yellow} {...SH} />
        <circle cx={110} cy={125} r={82} fill={S.red} {...SH} />
        <circle cx={110} cy={125} r={60} fill={C.cream} stroke={C.ink} strokeWidth={5} />
        <path d="M110 125 L110 85 M110 125 L140 140" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        <path d="M55 200 L40 216 M165 200 L180 216" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      </svg>
      {ring > 0.3 &&
        [-1, 1].map((sd) => (
          <svg key={sd} width={80} height={140} style={{ position: "absolute", top: 50, left: sd < 0 ? -80 : size, opacity: ring }}>
            <path d={sd < 0 ? "M70 20 Q30 70 70 120 M45 35 Q10 70 45 105" : "M10 20 Q50 70 10 120 M35 35 Q70 70 35 105"} fill="none" stroke={C.yellow} strokeWidth={9} strokeLinecap="round" />
          </svg>
        ))}
    </div>
  );
};

/** Saklar on/off */
const Toggle: React.FC<{ offAt: number; label: string }> = ({ offAt, label }) => {
  const t = useT();
  const p = interpolate(t, [offAt, offAt + 0.25], [0, 1], { ...clamp, easing: easeInOut });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, fontFamily: BODY, fontWeight: 800, fontSize: 46, color: C.cream }}>
      <div style={{ position: "relative", width: 170, height: 90, borderRadius: 99, background: p < 0.5 ? "#2ECC71" : "#55597A", border: `6px solid ${C.ink}` }}>
        <div style={{ position: "absolute", top: 6, left: 6 + (1 - p) * 80, width: 66, height: 66, borderRadius: 99, background: C.white, border: `5px solid ${C.ink}` }} />
      </div>
      {label}
    </div>
  );
};

/** Kenop volume yang diputar pelan */
const VolumeKnob: React.FC<{ from: number; to: number; at: number; dur: number }> = ({ from, to, at, dur }) => {
  const t = useT();
  const v = interpolate(t, [at, at + dur], [from, to], { ...clamp, easing: easeInOut });
  const ang = -135 + (v / 10) * 270;
  return (
    <div style={{ position: "relative", width: 420, height: 420 }}>
      <svg width={420} height={420} viewBox="0 0 420 420">
        {new Array(11).fill(0).map((_, i) => {
          const a = ((-135 + i * 27 - 90) * Math.PI) / 180;
          const on = i <= v + 0.01;
          return (
            <line
              key={i}
              x1={210 + Math.cos(a) * 170}
              y1={210 + Math.sin(a) * 170}
              x2={210 + Math.cos(a) * 200}
              y2={210 + Math.sin(a) * 200}
              stroke={on ? (i > 6 ? S.red : C.lime) : "rgba(255,255,255,0.25)"}
              strokeWidth={14}
              strokeLinecap="round"
            />
          );
        })}
        <circle cx={210} cy={210} r={140} fill="#2A2F52" {...SH} />
        <circle cx={210} cy={210} r={110} fill="#3C4270" stroke={C.ink} strokeWidth={5} />
        <g transform={`rotate(${ang} 210 210)`}>
          <rect x={200} y={92} width={20} height={70} rx={10} fill={C.lime} stroke={C.ink} strokeWidth={5} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 182, textAlign: "center", fontFamily: HEAD, fontSize: 64, color: C.cream }}>{Math.round(v)}</div>
    </div>
  );
};

/** Murid kecil (tokoh) untuk statistik remaja */
const Student: React.FC<{ shirt: string; hl?: boolean; at: number; seed: number }> = ({ shirt, hl, at, seed }) => {
  const t = useT();
  const glow = hl ? interpolate(t, [at, at + 0.4], [0, 1], clamp) : 0;
  return (
    <div style={{ position: "relative", width: 280, height: 470, display: "flex", justifyContent: "center" }}>
      {hl && (
        <div
          style={{
            position: "absolute",
            left: -10,
            top: -10,
            width: 300,
            height: 500,
            borderRadius: 60,
            background: `radial-gradient(ellipse, rgba(108,140,255,${0.55 * glow}) 0%, rgba(108,140,255,0) 70%)`,
          }}
        />
      )}
      <div style={{ opacity: hl ? 1 : 0.55 + 0.45 * (1 - glow * 0.4) }}>
        <Worker size={430} expr={hl && glow > 0.5 ? "pain" : "normal"} shirt={shirt} pants="#2E3557" seed={seed} />
      </div>
      {hl && glow > 0.05 && (
        <div style={{ position: "absolute", left: 150, top: -70, opacity: glow, scale: String(0.6 + 0.4 * glow) }}>
          <SiHalus size={170} variant="doom" />
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ adegan */
const Ep9Scenes: React.FC = () => {
  const t = useT();
  const cam = useShake([
    { t: 12.46, a: 22 },
    { t: 26.97, a: 12 },
  ]);
  return (
    <AbsoluteFill style={{ translate: cam }}>
      {/* 1 — bangun tidur, buka HP, berita buruk berjatuhan */}
      <Scene a={0} b={6.55} zoom={false}>
        <Bedroom night={0} />
        <div style={{ position: "absolute", left: 120, top: 560 }}>
          <Worker size={520} expr={t < 1.85 ? "sleepy" : t < 4.9 ? "shocked" : "pain"} shirt={C.pink} pants="#2E3557" seed={4} />
        </div>
        <div style={{ position: "absolute", left: 300, top: 840, rotate: "-12deg" }}>
          <Phone w={110} time="06.30" />
        </div>
        <ScreenGlow x={300} y={760} r={260} o={0.6} />
        <Sticker at={0.08} y={290} bg={C.cream} size={64}>
          BANGUN TIDUR → BUKA HP 📱
        </Sticker>
        <Pop at={1.88} x={530} y={420}>
          <Headline tag="PHK" text="Ribuan pekerja dirumahkan" w={440} rotate={5} />
        </Pop>
        <Pop at={2.96} x={560} y={640}>
          <Headline tag="HARGA" text="Semua naik lagi 📈" color={C.orange} w={420} rotate={-4} />
        </Pop>
        <Pop at={3.54} x={520} y={850}>
          <Headline tag="BENCANA" text="Banjir lagi 🌧️" color="#3A8DDE" w={400} rotate={3} />
        </Pop>
        <Pop at={4.98} x={90} y={420}>
          <Headline tag="FYP" text="Umur 22 udah sukses 🤑" color={S.violet} w={430} rotate={-6} />
        </Pop>
      </Scene>

      {/* 2 — scroll, scroll, scroll … tau-tau jam 2 pagi */}
      <Scene a={6.55} b={9.6}>
        <Bedroom night={interpolate(t, [7.6, 8.7], [0, 1], clamp)} />
        <ScreenGlow x={540} y={760} r={480} o={interpolate(t, [7.6, 8.7], [0.4, 1], clamp)} />
        <div style={{ position: "absolute", left: 60, top: 640, opacity: 0.95 }}>
          <Worker size={500} expr={t < 8.8 ? "dizzy" : "sleepy"} shirt={C.pink} pants="#2E3557" seed={4} />
        </div>
        <div style={{ position: "absolute", left: 470, top: 360, rotate: "4deg" }}>
          <Phone w={410} dark time={t < 8.84 ? "07.00" : "02.13"} feed={FEED} scrollSpeed={900} />
        </div>
        {[6.61, 7.0, 7.48].map((a, i) => (
          <Pop key={a} at={a} out={a + 0.5} x={50 + i * 30} y={440 + i * 80}>
            <div style={{ fontFamily: HEAD, fontSize: 64, color: i === 2 ? C.yellow : C.cream, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill", rotate: `${-8 + i * 5}deg` }}>
              SCROLL ⬆️
            </div>
          </Pop>
        ))}
        <div style={{ position: "absolute", left: 70, top: 300 }}>
          {t >= 8.0 && (
            <Pop at={8.0}>
              <Clock jumpAt={8.84} from="07.00" to="02.13" />
            </Pop>
          )}
        </div>
      </Scene>

      {/* 3 — makhluk halus yang masuk lewat layar */}
      <Scene a={9.6} b={12.42}>
        <Bedroom night={1} />
        <ScreenGlow x={540} y={780} r={520} />
        <div style={{ position: "absolute", left: 340, top: 520 }}>
          <Phone w={400} dark time="02.14" feed={FEED} scrollSpeed={300} />
        </div>
        <Scanner at={10.3} dur={0.9} top={330} height={850}>
          <div
            style={{
              position: "absolute",
              left: 330,
              top: interpolate(t, [10.6, 12.2], [700, 360], { ...clamp, easing: easeOut }),
              scale: String(interpolate(t, [10.6, 12.2], [0.6, 1], clamp)),
            }}
          >
            <SiHalus size={420} variant="doom" mood="grin" />
          </div>
        </Scanner>
        <Sticker at={9.72} y={290} bg={C.bg1} color={C.cream} size={64}>
          MASUKNYA LEWAT LAYAR… 📱
        </Sticker>
      </Scene>

      {/* 4 — judul: DOOMSCROLLING */}
      <Scene a={12.42} b={13.6}>
        <div style={{ position: "absolute", left: 270, top: 360 }}>
          <Pop at={12.46}>
            <SiHalus size={600} variant="doom" mood="laugh" />
          </Pop>
        </div>
        <Sticker at={12.55} y={1000} bg={ACC} color={C.white} size={74} rotate={-4}>
          {"SI HALUS:\nDOOMSCROLLING"}
        </Sticker>
      </Scene>

      {/* 5 — penelitian Boston Marathon */}
      <Scene a={13.6} b={21.75}>
        <Sticker at={13.65} y={290} bg={C.cream} size={56}>
          🔬 STUDI BOSTON MARATHON 2013
        </Sticker>
        {/* kiri: penonton berita */}
        <Pop at={16.09} x={50} y={420} from="left">
          <div style={{ position: "relative", width: 470, height: 560, borderRadius: 40, background: "#1E2450", border: `${OUTLINE}px solid ${C.ink}`, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 150, top: 30 }}>
              <TV w={290} />
            </div>
            <div style={{ position: "absolute", left: 20, top: 190 }}>
              <Worker size={360} expr={t > 18.46 ? "pain" : "shocked"} shirt={C.pink} pants="#2E3557" seed={4} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, textAlign: "center", fontFamily: HEAD, fontSize: 46, color: C.yellow, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill", lineHeight: 1 }}>
              NONTON BERITA ≥6 JAM/HARI 📺
            </div>
            {t >= 18.4 && (
              <div style={{ position: "absolute", left: 340, top: 150, scale: "0.62", transformOrigin: "0 0" }}>
                <StressBar at={18.5} level={0.95} label="STRES" color={S.red} />
              </div>
            )}
          </div>
        </Pop>
        {/* kanan: di lokasi */}
        <Pop at={19.81} x={560} y={420} from="right">
          <div style={{ position: "relative", width: 470, height: 560, borderRadius: 40, background: "#2E5E4E", border: `${OUTLINE}px solid ${C.ink}`, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 30, right: 30, top: 40, height: 90, background: C.cream, border: `6px solid ${C.ink}`, borderRadius: 12, fontFamily: HEAD, fontSize: 52, color: C.ink, textAlign: "center", lineHeight: "80px" }}>
              FINISH 🏁
            </div>
            <div style={{ position: "absolute", left: 40, top: 130, width: 14, height: 300, background: C.ink }} />
            <div style={{ position: "absolute", right: 40, top: 130, width: 14, height: 300, background: C.ink }} />
            <div style={{ position: "absolute", left: 120, top: 190 }}>
              <Worker size={330} expr="normal" shirt={C.yellow} pants="#2E3557" seed={6} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, textAlign: "center", fontFamily: HEAD, fontSize: 46, color: C.lime, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill", lineHeight: 1 }}>
              ADA DI LOKASI 📍
            </div>
            {t >= 20.9 && (
              <div style={{ position: "absolute", left: 340, top: 150, scale: "0.62", transformOrigin: "0 0" }}>
                <StressBar at={20.96} level={0.5} label="STRES" color={C.yellow} />
              </div>
            )}
          </div>
        </Pop>
        <Pop at={18.46} x={0} y={1020} style={{ width: 1080, textAlign: "center" }}>
          <div style={{ fontFamily: HEAD, fontSize: 60, color: C.cream, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill" }}>
            {t < 20.9 ? "STRESNYA LEBIH TINGGI… 📈" : "…DARIPADA YANG DI LOKASI!"}
          </div>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, color: C.cream, opacity: 0.85, marginTop: 6 }}>Holman dkk., PNAS 2014</div>
        </Pop>
      </Scene>

      {/* 6 — otak nggak bisa bedain */}
      <Scene a={21.75} b={25.85}>
        <Sticker at={21.81} out={23.2} y={290} bg={C.yellow} size={80}>
          KENAPA? 🤔
        </Sticker>
        <Sticker at={23.3} y={290} bg={C.pink} color={C.white} size={58}>
          OTAK NGGAK BISA BEDAIN 🧠
        </Sticker>
        <div style={{ position: "absolute", left: 370, top: 430 }}>
          <Pop at={22.55}>
            <Brain size={340} panic={t > 25.0 ? 1 : 0} />
          </Pop>
        </div>
        <Pop at={23.8} x={130} y={720}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 260 }}>
            <Phone w={180} dark feed={[{ tag: "🚨", text: "Bahaya!", color: S.red }]} scrollSpeed={60} />
            <div style={{ fontFamily: HEAD, fontSize: 48, color: C.cream, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill" }}>DI LAYAR</div>
          </div>
        </Pop>
        <Pop at={24.4} x={480} y={830}>
          <div style={{ fontFamily: HEAD, fontSize: 150, color: C.lime, WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill" }}>=</div>
        </Pop>
        <Pop at={24.78} x={660} y={760}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 300 }}>
            <div style={{ fontSize: 230, lineHeight: 1 }}>🐅</div>
            <div style={{ fontFamily: HEAD, fontSize: 48, color: C.cream, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill" }}>BENERAN</div>
          </div>
        </Pop>
      </Scene>

      {/* 7 — tiap berita buruk, alarm bunyi lagi + 3 jam medsos */}
      <Scene a={25.85} b={31.85}>
        <Sticker at={25.9} out={27.95} y={290} bg={S.red} color={C.white} size={66}>
          TIAP BERITA BURUK… 🔔
        </Sticker>
        <div style={{ position: "absolute", left: 420, top: 470, opacity: interpolate(t, [27.95, 28.25], [1, 0], clamp) }}>
          <Alarm hits={[26.17, 26.97, 27.32]} size={240} />
        </div>
        {[
          [26.17, 60, 430, "PHK", "Gelombang PHK lagi", S.red, -6],
          [26.6, 620, 470, "HARGA", "Naik terus 📈", C.orange, 5],
          [27.05, 90, 790, "BENCANA", "Gempa & banjir", "#3A8DDE", 4],
          [27.4, 600, 820, "VIRAL", "Drama artis 🙄", C.pink, -4],
        ].map(([a, x, y, tag, text, col, r]) => (
          <div key={String(tag)} style={{ opacity: interpolate(t, [27.95, 28.25], [1, 0], clamp) }}>
            <Pop at={a as number} x={x as number} y={y as number}>
              <Headline tag={tag as string} text={text as string} color={col as string} w={380} rotate={r as number} />
            </Pop>
          </div>
        ))}
        {t >= 28.0 && (
          <>
            <Sticker at={28.03} y={290} bg={C.cream} size={60}>
              ORANG INDONESIA DI MEDSOS 🇮🇩
            </Sticker>
            <BigStat at={29.42} from={0} to={3} dur={1.4} suffix="+ JAM" label="sehari · tiap hari" y={520} color={ACC} />
            <Pop at={30.4} x={0} y={900} style={{ width: 1080, textAlign: "center" }}>
              <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, color: C.cream, opacity: 0.85 }}>We Are Social &amp; Meltwater, Digital 2026</div>
            </Pop>
            <Pop at={29.0} x={790} y={760}>
              <div style={{ rotate: "10deg" }}>
                <Phone w={160} dark feed={FEED} scrollSpeed={500} />
              </div>
            </Pop>
          </>
        )}
      </Scene>

      {/* 8 — anak sekolah juga kena */}
      <Scene a={31.85} b={40.3}>
        <Sticker at={31.91} out={37.6} y={290} bg={C.yellow} size={66}>
          ANAK SEKOLAH JUGA KENA 🎒
        </Sticker>
        {t < 37.75 && (
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: interpolate(t, [37.5, 37.75], [1, 0], clamp) }}>
            <Pop at={32.1} x={50} y={470}>
              <Student shirt="#3FA7A0" at={34.39} seed={1} />
            </Pop>
            <Pop at={32.3} x={400} y={470}>
              <Student shirt={C.pink} hl at={34.39} seed={4} />
            </Pop>
            <Pop at={32.5} x={750} y={470}>
              <Student shirt={C.yellow} at={34.39} seed={6} />
            </Pop>
          </div>
        )}
        {t >= 34.3 && t < 37.75 && (
          <Pop at={34.39} x={0} y={960} style={{ width: 1080, display: "flex", justifyContent: "center", opacity: interpolate(t, [37.5, 37.75], [1, 0], clamp) }}>
            <div style={{ fontFamily: HEAD, fontSize: 84, color: C.cream, background: ACC, padding: "6px 34px 12px", borderRadius: 28, border: `${OUTLINE}px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}`, rotate: "-2deg" }}>
              1 DARI 3 REMAJA 🧠
            </div>
          </Pop>
        )}
        {t >= 37.6 && (
          <>
            <Sticker at={37.7} y={320} bg={C.cream} size={60}>
              YANG DAPET BANTUAN CUMA…
            </Sticker>
            <BigStat at={38.92} from={0} to={2.6} dur={1.0} decimals={1} suffix="%" label="yang akses layanan" y={500} color={C.yellow} />
            <div style={{ position: "absolute", left: 60, right: 60, top: 880, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 30, color: C.cream, opacity: 0.85 * Math.min(1, Math.max(0, (t - 39.2) / 0.3)) }}>
              I-NAMHS 2022 · 15,5 juta remaja punya masalah kesehatan mental
            </div>
          </>
        )}
      </Scene>

      {/* 9 — cara aman: tetap update, tapi kasih batas */}
      <Scene a={40.3} b={50.1}>
        <Sticker at={40.36} out={42.1} y={290} bg={ACC} color={C.white} size={78}>
          JADI GINI 👇
        </Sticker>
        <Sticker at={42.21} y={290} bg={C.lime} size={60}>
          BOLEH UPDATE, ASAL ADA BATAS ✋
        </Sticker>
        <div style={{ position: "absolute", top: 440, left: 80, display: "flex", flexDirection: "column", gap: 24 }}>
          <CheckRow icon="🗞️" label="Cek berita 2× sehari aja" at={43.48} />
          <CheckRow icon="🌙" label="Jangan sebelum tidur" at={45.18} />
          <CheckRow icon="▶️" label="Matiin autoplay" at={46.28} />
          <CheckRow icon="🚫" label="Unfollow akun yang bikin ngerasa kurang" at={47.47} />
        </div>
        {t >= 46.2 && t < 47.45 && (
          <Pop at={46.3} out={47.2} x={560} y={1000}>
            <div style={{ background: C.bg1, border: `${OUTLINE}px solid ${C.ink}`, borderRadius: 30, padding: "14px 24px", boxShadow: `0 10px 0 ${C.ink}` }}>
              <Toggle offAt={46.88} label="Autoplay" />
            </div>
          </Pop>
        )}
      </Scene>

      {/* 10 — kalau udah berat: kamu nggak sendirian (tenang, hangat) */}
      <Scene a={50.1} b={56.5}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 55% at 50% 45%, #3B3470 0%, rgba(26,16,48,0) 75%)" }} />
        <Pop at={50.25} x={140} y={330}>
          <div style={{ display: "flex", gap: 0, alignItems: "flex-end" }}>
            <Worker size={460} expr="normal" shirt={C.pink} pants="#2E3557" seed={4} />
            <div style={{ marginLeft: -40 }}>
              <Worker size={460} expr="happy" shirt="#7EC8A0" pants="#2E3557" pose="wave" seed={7} flip />
            </div>
          </div>
        </Pop>
        <Pop at={51.4} x={420} y={340}>
          <div style={{ fontSize: 90 }}>🤍</div>
        </Pop>
        <Pop at={50.5} x={80} y={790}>
          <div
            style={{
              width: 920,
              padding: "26px 34px 30px",
              borderRadius: 40,
              background: "#FFF6EC",
              border: `${OUTLINE}px solid ${C.ink}`,
              boxShadow: `0 12px 0 ${C.ink}`,
              fontFamily: BODY,
              fontWeight: 800,
              color: C.ink,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 50, lineHeight: 1.1 }}>Lagi berat? Kamu nggak sendirian 🤝</div>
            {t >= 53.1 && (
              <div style={{ marginTop: 14, opacity: interpolate(t, [53.19, 53.5], [0, 1], clamp) }}>
                <div style={{ fontSize: 34, opacity: 0.75 }}>Layanan Kemenkes</div>
                <div style={{ fontFamily: HEAD, fontSize: 92, color: "#3A6FD8", lineHeight: 1.05 }}>119 ext 8</div>
                <div style={{ fontSize: 36, opacity: 0.8 }}>healing119.id</div>
              </div>
            )}
          </div>
        </Pop>
      </Scene>

      {/* 11 — dunia lagi ribut, kamu yang pegang volumenya */}
      <Scene a={56.5} b={EP9.endStart}>
        <Sticker at={56.53} out={58.0} y={290} bg={C.cream} size={64}>
          DUNIA EMANG LAGI RIBUT… 📢
        </Sticker>
        <Sticker at={58.09} y={290} bg={C.lime} size={54}>
          KAMU YANG PEGANG VOLUMENYA 🎚️
        </Sticker>
        {[
          [56.6, 60, 470, "PHK", S.red, -8],
          [56.8, 760, 450, "HARGA", C.orange, 7],
          [57.0, 40, 900, "VIRAL", C.pink, 5],
          [57.2, 780, 880, "BENCANA", "#3A8DDE", -6],
        ].map(([a, x, y, tag, col, r]) => (
          <div key={String(tag)} style={{ opacity: interpolate(t, [58.8, 60.1], [1, 0.15], clamp) }}>
            <Pop at={a as number} x={x as number} y={y as number}>
              <div style={{ fontFamily: HEAD, fontSize: 44, color: C.white, background: col as string, padding: "4px 22px 8px", borderRadius: 99, border: `6px solid ${C.ink}`, rotate: `${r}deg`, scale: String(1 + 0.06 * Math.sin(t * 14 + (a as number))) }}>
                {tag as string} 🔊
              </div>
            </Pop>
          </div>
        ))}
        <div style={{ position: "absolute", left: 330, top: 560 }}>
          <Pop at={57.4}>
            <VolumeKnob from={10} to={2} at={58.76} dur={1.4} />
          </Pop>
        </div>
        {t >= 58.3 && (
          <div
            style={{
              position: "absolute",
              left: 760,
              top: 650,
              scale: String(interpolate(t, [58.8, 60.2], [1, 0.45], { ...clamp, easing: easeInOut })),
              opacity: interpolate(t, [60.1, 60.6], [1, 0.4], clamp),
              transformOrigin: "50% 100%",
            }}
          >
            <Pop at={58.3}>
              <SiHalus size={240} variant="doom" mood={t > 59.3 ? "busted" : "grin"} />
            </Pop>
          </div>
        )}
      </Scene>
    </AbsoluteFill>
  );
};

export const Ep9: React.FC = () => (
  <Episode ep={9} accent={ACC} tint="#16204F" words={words} endStart={EP9.endStart} revealAt={EP9.revealAt} flashes={[12.46]}>
    <Ep9Scenes />
  </Episode>
);
