import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut, easeOut } from "../brand";
import { Expr, Pose, SiHalus, Worker } from "../Characters";
import { Episode } from "../Episode";
import { Pop, Scanner, Sticker, useShake } from "../Kit";
import { Badge, Bubble, CheckRow, InfoCard, Room } from "../Props";
import { Scene } from "./Ep1";
import { words } from "./ep4.words";

/** Semua waktu = detik VO final (data/ep4_words.json), tanpa warp */
export const EP4 = { dur: 66.22, endStart: 61.69, revealAt: 64.0 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const S = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const KITCHEN = { wall: "#5A2E22", floor: "#3A1C14" };

/* ----------------------------------------------------------- gambar lokal */
const ChefHat: React.FC<{ w: number }> = ({ w }) => (
  <svg width={w} height={w * 0.8} viewBox="0 0 260 208" style={{ overflow: "visible" }}>
    <path d="M40 150 Q0 120 30 80 Q40 30 95 45 Q120 0 165 40 Q225 20 232 80 Q262 120 220 150 Z" fill={C.white} {...S} />
    <rect x={44} y={140} width={172} height={60} rx={14} fill={C.white} {...S} />
    <path d="M90 150 L90 196 M130 150 L130 196 M170 150 L170 196" stroke="#D9D3E6" strokeWidth={8} />
  </svg>
);

/** Bang Jo versi juru masak (topi koki digambar di atas kepala) */
const CookJo: React.FC<{ size: number; expr?: Expr; pose?: Pose; red?: number; sweat?: boolean; steam?: boolean; seed?: number; flip?: boolean }> = ({
  size,
  expr = "normal",
  pose = "idle",
  red = 0,
  sweat = false,
  steam = false,
  seed = 0,
  flip = false,
}) => {
  const t = useT();
  const k = size / 660;
  const skin = interpolateColors(red, [0, 1], [C.skin, "#E0674F"]);
  const bob = Math.sin((t + seed * 1.7) * Math.PI * 1.8) * 5;
  return (
    <div style={{ position: "relative", width: size * (400 / 620), height: size }}>
      <Worker size={size} expr={expr} pose={pose} shirt={C.white} pants="#2A2140" skin={skin} seed={seed} flip={flip} />
      <div style={{ position: "absolute", left: (200 + 30 - 130 * 1.15) * k, top: (52 + 20 - 175 * 1.15) * k + bob }}>
        <ChefHat w={260 * 1.15 * k} />
      </div>
      {sweat &&
        [0, 1, 2].map((i) => {
          const p = (t * 1.1 + i / 3) % 1;
          return (
            <svg
              key={i}
              width={40 * k * 1.6}
              height={56 * k * 1.6}
              viewBox="0 0 40 56"
              style={{ position: "absolute", left: (i === 1 ? 80 : i === 0 ? 300 : 330) * k + 20 * k, top: (150 + p * 160) * k + bob, opacity: 1 - p }}
            >
              <path d="M20 2 Q38 30 34 40 Q30 54 20 54 Q10 54 6 40 Q2 30 20 2 Z" fill={C.cyan} stroke={C.ink} strokeWidth={4} />
            </svg>
          );
        })}
      {steam &&
        [0, 1, 2].map((i) => {
          const p = (t * 0.8 + i / 3) % 1;
          let d = `M${150 + i * 50} ${40 - p * 150}`;
          for (let j = 0; j < 4; j++) d += ` q14 -14 0 -28`;
          return (
            <svg key={i} width={size} height={size} viewBox="0 0 660 660" style={{ position: "absolute", left: 0, top: -260 * k, overflow: "visible" }}>
              <path d={d} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={14} strokeLinecap="round" opacity={1 - p} />
            </svg>
          );
        })}
    </div>
  );
};

/** Kompor + panci dengan api bergoyang */
const Stove: React.FC<{ w?: number; steam?: boolean }> = ({ w = 420, steam = true }) => {
  const t = useT();
  return (
    <svg width={w} height={w * 0.95} viewBox="0 0 420 400" style={{ overflow: "visible" }}>
      {steam &&
        [0, 1, 2].map((i) => {
          const p = (t * 0.7 + i / 3) % 1;
          let d = `M${150 + i * 60} ${110 - p * 140}`;
          for (let j = 0; j < 3; j++) d += ` q16 -16 0 -32`;
          return <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={12} strokeLinecap="round" opacity={1 - p} />;
        })}
      {/* panci */}
      <rect x={90} y={120} width={240} height={130} rx={24} fill="#9AA0B5" {...S} />
      <rect x={70} y={108} width={280} height={28} rx={14} fill="#B8BDD0" {...S} />
      <rect x={40} y={150} width={50} height={22} rx={11} fill="#5B6275" {...S} />
      <rect x={330} y={150} width={50} height={22} rx={11} fill="#5B6275" {...S} />
      {/* api */}
      {[130, 210, 290].map((x, i) => {
        const h = 46 + Math.sin(t * 14 + i * 2) * 10;
        return <path key={x} d={`M${x - 24} 280 Q${x - 26} ${280 - h * 0.6} ${x} ${280 - h} Q${x + 26} ${280 - h * 0.6} ${x + 24} 280 Z`} fill={C.orange} stroke={C.ink} strokeWidth={5} />;
      })}
      {[130, 210, 290].map((x, i) => {
        const h = 26 + Math.sin(t * 17 + i) * 6;
        return <path key={`i${x}`} d={`M${x - 12} 280 Q${x - 12} ${280 - h * 0.6} ${x} ${280 - h} Q${x + 12} ${280 - h * 0.6} ${x + 12} 280 Z`} fill={C.yellow} />;
      })}
      {/* badan kompor */}
      <rect x={30} y={280} width={360} height={110} rx={20} fill="#2A2140" {...S} />
      <circle cx={110} cy={335} r={18} fill={C.pink} {...S} strokeWidth={5} />
      <circle cx={310} cy={335} r={18} fill={C.pink} {...S} strokeWidth={5} />
    </svg>
  );
};

/** Termometer sederhana; value 34..42 */
const Thermo: React.FC<{ value: number; h?: number }> = ({ value, h = 560 }) => {
  const w = h * 0.3;
  const p = interpolate(value, [34, 42], [0.08, 0.95], clamp);
  const col = interpolateColors(value, [36.5, 38.5, 40], ["#FFB020", C.orange, "#FF2E2E"]);
  const top = h * 0.04;
  const bottom = h * 0.78;
  const level = bottom - (bottom - top) * p;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect x={w * 0.3} y={0} width={w * 0.4} height={h * 0.85} rx={w * 0.2} fill={C.cream} {...S} />
      <circle cx={w / 2} cy={h * 0.84} r={w * 0.42} fill={C.cream} {...S} />
      <rect x={w * 0.39} y={level} width={w * 0.22} height={h * 0.84 - level} rx={w * 0.11} fill={col} />
      <circle cx={w / 2} cy={h * 0.84} r={w * 0.32} fill={col} />
      {new Array(8).fill(0).map((_, i) => (
        <rect key={i} x={w * 0.72} y={top + 30 + i * ((bottom - top - 30) / 7)} width={i % 2 ? w * 0.08 : w * 0.14} height={5} rx={2} fill={C.ink} />
      ))}
    </svg>
  );
};

const BigText: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({ children, size = 200, color = C.orange }) => (
  <div
    style={{
      fontFamily: HEAD,
      fontSize: size,
      lineHeight: 1,
      color,
      WebkitTextStroke: `${size * 0.07}px ${C.ink}`,
      paintOrder: "stroke fill",
      textShadow: `0 ${size * 0.07}px 0 ${C.ink}`,
      fontVariantNumeric: "tabular-nums",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

const Label: React.FC<{ children: React.ReactNode; size?: number; color?: string; bg?: string }> = ({ children, size = 48, color = C.ink, bg = C.cream }) => (
  <div
    style={{
      fontFamily: BODY,
      fontWeight: 800,
      fontSize: size,
      color,
      background: bg,
      padding: "8px 26px 12px",
      borderRadius: 26,
      border: `6px solid ${C.ink}`,
      boxShadow: `0 8px 0 ${C.ink}`,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

/** Panah panas masuk ke badan */
const HeatArrow: React.FC<{ from: [number, number]; to: [number, number]; at: number; color?: string }> = ({ from, to, at, color = C.orange }) => {
  const t = useT();
  const p = interpolate(t, [at, at + 0.5], [0, 1], { ...clamp, easing: easeOut });
  if (p <= 0) return null;
  const x = from[0] + (to[0] - from[0]) * p;
  const y = from[1] + (to[1] - from[1]) * p;
  const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const h = 34;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <line x1={from[0]} y1={from[1]} x2={x} y2={y} stroke={C.ink} strokeWidth={30} strokeLinecap="round" />
      <line x1={from[0]} y1={from[1]} x2={x} y2={y} stroke={color} strokeWidth={16} strokeLinecap="round" strokeDasharray="30 18" strokeDashoffset={-t * 120} />
      <path
        d={`M${x + Math.cos(ang) * h} ${y + Math.sin(ang) * h} L${x + Math.cos(ang + 2.4) * h} ${y + Math.sin(ang + 2.4) * h} L${x + Math.cos(ang - 2.4) * h} ${y + Math.sin(ang - 2.4) * h} Z`}
        fill={color}
        stroke={C.ink}
        strokeWidth={6}
        strokeLinejoin="round"
      />
    </svg>
  );
};

const AlarmClock: React.FC<{ size?: number }> = ({ size = 260 }) => {
  const t = useT();
  const wob = Math.sin(t * 40) * 6;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ rotate: `${wob}deg`, overflow: "visible" }}>
      <circle cx={55} cy={45} r={26} fill={C.yellow} {...S} strokeWidth={6} />
      <circle cx={145} cy={45} r={26} fill={C.yellow} {...S} strokeWidth={6} />
      <circle cx={100} cy={110} r={74} fill={C.cream} {...S} />
      <path d="M100 110 L100 66 M100 110 L132 126" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      <path d="M60 180 L46 196 M140 180 L154 196" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      {[0, 1].map((i) => (
        <path key={i} d={i ? "M180 60 Q196 90 182 120" : "M20 60 Q4 90 18 120"} fill="none" stroke={C.pink} strokeWidth={8} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 30 + i)} />
      ))}
    </svg>
  );
};

const Glass: React.FC<{ size?: number }> = ({ size = 260 }) => {
  const t = useT();
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 200 240" style={{ overflow: "visible" }}>
      <path d="M30 20 L170 20 L150 225 L50 225 Z" fill="rgba(255,255,255,0.25)" {...S} />
      <path d={`M42 ${80 + Math.sin(t * 5) * 4} Q100 ${70 + Math.sin(t * 5 + 1) * 6} 158 ${80 + Math.sin(t * 5) * 4} L148 218 L52 218 Z`} fill={C.cyan} />
      <path d="M30 20 L170 20 L150 225 L50 225 Z" fill="none" {...S} />
      <circle cx={80} cy={150} r={8} fill="rgba(255,255,255,0.7)" />
      <circle cx={120} cy={180} r={6} fill="rgba(255,255,255,0.6)" />
    </svg>
  );
};

const URINE = ["#FFF6C9", "#FCE98A", "#F4D35E", "#E0A93A", "#B9762A", "#8A4E1E"];

/* ================================================================== adegan */
const Ep4Scenes: React.FC = () => {
  const t = useT();
  const cam = useShake([
    { t: 3.91, a: 12 },
    { t: 14.37, a: 26 },
    { t: 33.58, a: 20 },
    { t: 34.34, a: 14 },
    { t: 59.89, a: 14 },
  ]);
  return (
    <AbsoluteFill style={{ translate: cam }}>
      {/* 1 — HOOK: hari pertama kerja di dapur panas */}
      <Scene a={0} b={4.7} zoom={false}>
        <Room {...KITCHEN}>
          <div style={{ position: "absolute", right: 60, top: 70 }}>
            <div style={{ width: 210, borderRadius: 30, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: C.white, textAlign: "center", rotate: "6deg", boxShadow: `0 10px 0 ${C.ink}` }}>
              <div style={{ background: C.pink, color: C.white, fontFamily: HEAD, fontSize: 44, padding: "6px 0" }}>HARI</div>
              <div style={{ fontFamily: HEAD, fontSize: 120, color: C.ink, lineHeight: 1.1 }}>1</div>
            </div>
          </div>
        </Room>
        <div style={{ position: "absolute", left: 540, top: 640 }}>
          <Stove w={440} />
        </div>
        <div style={{ position: "absolute", left: 90, top: 440 }}>
          <CookJo size={680} expr={t > 2.06 ? "shocked" : "normal"} pose="holdTool" sweat red={interpolate(t, [0, 4], [0.1, 0.4], clamp)} />
        </div>
        <Sticker at={0.1} out={2.0} y={290} bg={C.cream} size={74}>
          HARI PERTAMA KERJA 👨‍🍳
        </Sticker>
        <Sticker at={2.06} y={290} bg={C.pink} color={C.white} size={74}>
          = PALING BAHAYA?! 😨
        </Sticker>
      </Scene>

      {/* 2 — >70% kematian di minggu pertama */}
      <Scene a={4.7} b={10.82}>
        <Pop at={4.8} x={0} y={380} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
          <BigText size={250}>
            {">"}
            {Math.round(interpolate(t, [5.3, 6.2], [0, 70], { ...clamp, easing: easeOut }))}%
          </BigText>
        </Pop>
        <Pop at={6.0} x={0} y={670} style={{ width: 1080, textAlign: "center" }}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 54, color: C.cream, lineHeight: 1.15 }}>
            kematian akibat panas
            <br />
            di tempat kerja terjadi di…
          </div>
        </Pop>
        <Sticker at={8.57} y={850} bg={C.orange} color={C.ink} size={80} rotate={-4}>
          MINGGU PERTAMA 📅
        </Sticker>
        <Pop at={8.9} x={0} y={1040} style={{ width: 1080, textAlign: "center" }}>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 34, color: C.cream, opacity: 0.8 }}>Data OSHA (AS)</div>
        </Pop>
        <Pop at={9.5} x={60} y={880}>
          <CookJo size={300} expr="dizzy" seed={1} />
        </Pop>
      </Scene>

      {/* 3 — ada makhluk halus (scanner) */}
      <Scene a={10.82} b={14.3}>
        <Room {...KITCHEN} dark={interpolate(t, [10.85, 11.3], [0, 0.55], clamp)} />
        <div style={{ position: "absolute", left: 600, top: 700, opacity: 0.6 }}>
          <Stove w={380} steam={false} />
        </div>
        <div style={{ position: "absolute", left: 110, top: 620, opacity: 0.6 }}>
          <CookJo size={520} expr="sleepy" sweat />
        </div>
        <Scanner at={11.7} dur={0.9} top={330} height={760}>
          <div style={{ position: "absolute", left: 400, top: 380 }}>
            <SiHalus size={440} variant="heat" />
          </div>
        </Scanner>
        <Sticker at={10.9} y={290} bg={C.bg1} color={C.lime} size={70}>
          ADA MAKHLUK HALUS 👻
        </Sticker>
      </Scene>

      {/* 4 — judul: tekanan panas */}
      <Scene a={14.3} b={15.9}>
        <div style={{ position: "absolute", left: 307, top: 400 }}>
          <Pop at={14.32}>
            <SiHalus size={560} variant="heat" mood="laugh" />
          </Pop>
        </div>
        <Sticker at={14.37} y={960} bg={C.orange} size={84} rotate={-5}>
          {"SI HALUS:\nTEKANAN PANAS"}
        </Sticker>
      </Scene>

      {/* 5 — badan kayak mesin */}
      <Scene a={15.9} b={22.65}>
        <Sticker at={15.96} y={290} bg={C.cream} size={72}>
          BADAN = MESIN ⚙️
        </Sticker>
        <div style={{ position: "absolute", left: 300, top: 470 }}>
          <CookJo size={600} expr={t > 21.1 ? "dizzy" : "normal"} sweat={t > 19.6} red={interpolate(t, [17.4, 22.2], [0, 0.6], clamp)} />
        </div>
        <div style={{ position: "absolute", left: 820, top: 460 }}>
          <Thermo value={interpolate(t, [17.4, 22.2], [36.5, 39.3], { ...clamp, easing: easeInOut })} h={520} />
        </div>
        <Pop at={18.0} x={60} y={420}>
          <div style={{ fontSize: 120 }}>☀️🔥</div>
        </Pop>
        <Pop at={18.1} x={60} y={560}>
          <Label size={38} bg={C.yellow}>PANAS LUAR</Label>
        </Pop>
        <HeatArrow from={[200, 640]} to={[360, 700]} at={18.2} />
        <Pop at={18.9} x={60} y={880}>
          <div style={{ fontSize: 110 }}>💪</div>
        </Pop>
        <Pop at={19.0} x={40} y={1010}>
          <Label size={38} bg={C.orange}>PANAS DARI KERJA</Label>
        </Pop>
        <HeatArrow from={[200, 950]} to={[380, 880]} at={19.1} />
        <Pop at={20.3} x={560} y={380}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 90, position: "relative" }}>
              💨
              <svg width={110} height={110} style={{ position: "absolute", left: -6, top: -4 }}>
                <path d="M15 15 L95 95 M95 15 L15 95" stroke={C.pink} strokeWidth={16} strokeLinecap="round" />
              </svg>
            </div>
            <Label size={34} bg={C.pink} color={C.white}>
              NGGAK BISA DIBUANG
            </Label>
          </div>
        </Pop>
        <Sticker at={21.11} y={1090} bg={C.pink} color={C.white} size={64}>
          SUHU TUBUH NAIK ⬆️🌡️
        </Sticker>
      </Scene>

      {/* 6 — gejala awal + masih bisa ditolong */}
      <Scene a={22.65} b={29.85}>
        {t < 25.85 ? (
          <>
            <Sticker at={22.72} y={290} bg={C.cream} size={64}>
              GEJALA AWAL 🥵
            </Sticker>
            <div style={{ position: "absolute", left: 120, top: 400 }}>
              <Badge icon="💦" label="KERINGETAN" at={23.18} color={C.cyan} />
            </div>
            <div style={{ position: "absolute", left: 120, top: 600 }}>
              <Badge icon="😵‍💫" label="PUSING" at={24.19} color="#B9A6FF" />
            </div>
            <div style={{ position: "absolute", left: 120, top: 800 }}>
              <Badge icon="🤢" label="MUAL" at={24.82} color={C.lime} />
            </div>
            <div style={{ position: "absolute", left: 120, top: 1000 }}>
              <Badge icon="🫠" label="LEMES" at={25.37} color={C.orange} />
            </div>
          </>
        ) : (
          <>
            <Sticker at={25.9} y={290} bg={C.lime} size={74}>
              MASIH BISA DITOLONG ✅
            </Sticker>
            <div style={{ position: "absolute", top: 440, left: 80 }}>
              <CheckRow icon="🌳" label="Istirahat di tempat adem" at={27.04} />
            </div>
            <div style={{ position: "absolute", top: 600, left: 80 }}>
              <CheckRow icon="💧" label="Minum" at={28.46} />
            </div>
            <div style={{ position: "absolute", top: 760, left: 80 }}>
              <CheckRow icon="🧊" label="Dinginin badan" at={28.98} />
            </div>
            <Pop at={26.2} x={700} y={900} from="bottom">
              <CookJo size={330} expr="happy" seed={2} />
            </Pop>
          </>
        )}
      </Scene>

      {/* 7 — heat stroke: darurat */}
      <Scene a={29.85} b={39.92}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,40,40,0.35), rgba(255,40,40,0) 70%)", opacity: 0.6 + 0.4 * Math.sin(t * 8) }} />
        {t < 33.25 ? (
          <>
            <Sticker at={29.95} y={290} bg={C.pink} color={C.white} size={70}>
              TAPI KALAU UDAH… ⚠️
            </Sticker>
            <div style={{ position: "absolute", left: 120, top: 430 }}>
              <Badge icon="😵" label="BINGUNG" at={30.57} color={C.pink} />
            </div>
            <div style={{ position: "absolute", left: 120, top: 640 }}>
              <Badge icon="🗯️" label="NGELANTUR" at={31.47} color={C.orange} />
            </div>
            <div style={{ position: "absolute", left: 120, top: 850 }}>
              <Badge icon="🫥" label="PINGSAN" at={32.51} color="#B9A6FF" />
            </div>
          </>
        ) : t < 37.7 ? (
          <>
            <Pop at={33.3} x={0} y={330} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
              <div style={{ border: `12px solid ${C.pink}`, borderRadius: 40, padding: "10px 40px 18px", rotate: "-6deg", background: "rgba(255,79,139,0.15)" }}>
                <BigText size={150} color={C.pink}>
                  HEAT STROKE
                </BigText>
              </div>
            </Pop>
            <Sticker at={34.34} y={570} bg="#FF2E2E" color={C.white} size={84} rotate={4}>
              DARURAT 🚨
            </Sticker>
            <div style={{ position: "absolute", left: 160, top: 720 }}>
              <Pop at={35.1}>
                <Thermo value={interpolate(t, [35.3, 36.7], [38, 41], { ...clamp, easing: easeOut })} h={430} />
              </Pop>
            </div>
            <Pop at={36.2} x={380} y={800}>
              <BigText size={170} color="#FF4A3D">
                40°C+
              </BigText>
            </Pop>
          </>
        ) : (
          <>
            <Sticker at={37.74} y={290} bg={C.lime} size={70}>
              LANGSUNG LAKUIN INI 👇
            </Sticker>
            <Pop at={38.0} x={70} y={440}>
              <InfoCard title="🧊 DINGININ" value="BADANNYA" sub="kompres, siram air" color={C.cyan} valueSize={74} />
            </Pop>
            <Pop at={39.1} x={570} y={440}>
              <InfoCard title="📞 PANGGIL" value="BANTUAN" sub="ambulans / medis" color={C.pink} valueSize={74} />
            </Pop>
          </>
        )}
      </Scene>

      {/* 8 — minum tiap 15–20 menit, haus = alarm telat */}
      <Scene a={39.92} b={46.5}>
        <Sticker at={39.96} y={290} bg={C.cream} size={70}>
          BIAR AMAN GIMANA? 🤔
        </Sticker>
        <Pop at={41.29} x={110} y={430}>
          <Glass size={280} />
        </Pop>
        <Pop at={41.56} x={430} y={470}>
          <div>
            <BigText size={110} color={C.cyan}>
              1 GELAS
            </BigText>
            <div style={{ marginTop: 18 }}>
              <Label size={46} bg={C.cyan}>
                tiap 15–20 menit ⏱️
              </Label>
            </div>
          </div>
        </Pop>
        {t > 43.85 && (
          <>
            <Pop at={43.9} x={140} y={830}>
              <AlarmClock size={230} />
            </Pop>
            <Pop at={45.16} x={420} y={880}>
              <div style={{ rotate: "-3deg" }}>
                <Label size={60} bg={C.yellow}>
                  HAUS = ALARM TELAT
                </Label>
              </div>
            </Pop>
          </>
        )}
      </Scene>

      {/* 9 — cek warna pipis */}
      <Scene a={46.5} b={50.42}>
        <Sticker at={46.57} y={290} bg={C.yellow} size={70}>
          CEK WARNA PIPIS 🚽
        </Sticker>
        <div style={{ position: "absolute", left: 90, top: 440, width: 900, display: "flex", gap: 14 }}>
          {URINE.map((c, i) => {
            const at = 46.9 + i * 0.12;
            const s = interpolate(t, [at, at + 0.25], [0, 1], { ...clamp, easing: easeOut });
            return (
              <div
                key={c}
                style={{
                  flex: 1,
                  height: 340,
                  borderRadius: 30,
                  background: c,
                  border: `${OUTLINE}px solid ${C.ink}`,
                  scale: `1 ${s}`,
                  transformOrigin: "50% 100%",
                  boxShadow: i >= 4 && t > 47.9 ? `0 0 0 10px ${C.pink}` : "none",
                }}
              />
            );
          })}
        </div>
        <Pop at={47.3} x={120} y={810}>
          <Label size={44} bg={C.lime}>
            ✅ kuning pucat = cukup
          </Label>
        </Pop>
        <Pop at={48.38} x={560} y={810}>
          <Label size={44} bg={C.pink} color={C.white}>
            ❌ kayak teh 🍵
          </Label>
        </Pop>
        <Sticker at={49.29} y={970} bg={C.orange} size={70} rotate={-3}>
          = KURANG MINUM!
        </Sticker>
      </Scene>

      {/* 10 — anak baru: jam kerja dicicil */}
      <Scene a={50.42} b={55.0}>
        <Sticker at={50.47} y={290} bg={C.cream} size={70}>
          BUAT ANAK BARU 🧑‍🍳
        </Sticker>
        <div style={{ position: "absolute", left: 110, top: 470, width: 860, height: 520, display: "flex", alignItems: "flex-end", gap: 24 }}>
          {[20, 40, 60, 80, 100].map((pct, i) => {
            const at = 51.65 + i * 0.5;
            const s = interpolate(t, [at, at + 0.35], [0, 1], { ...clamp, easing: easeOut });
            return (
              <div key={pct} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ fontFamily: HEAD, fontSize: 40, color: C.cream, opacity: s }}>{pct}%</div>
                <div
                  style={{
                    width: "100%",
                    height: 4 * pct,
                    borderRadius: 20,
                    background: interpolateColors(i, [0, 4], [C.lime, C.orange]),
                    border: `${OUTLINE}px solid ${C.ink}`,
                    scale: `1 ${s}`,
                    transformOrigin: "50% 100%",
                  }}
                />
                <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 34, color: C.cream }}>H{i + 1}</div>
              </div>
            );
          })}
        </div>
        <Sticker at={52.31} y={1060} bg={C.lime} size={64}>
          JAM KERJA DICICIL 📈
        </Sticker>
      </Scene>

      {/* 11 — punchline */}
      <Scene a={55.0} b={EP4.endStart}>
        <Room {...KITCHEN} />
        <div style={{ position: "absolute", left: 770, top: 880 }}>
          <Stove w={260} />
        </div>
        <div style={{ position: "absolute", left: 500, top: 520 }}>
          <Worker size={420} shirt="#5B6275" hair="#B8BDD0" pose={t < 58.7 ? "point" : "idle"} expr={t < 59.4 ? "smirk" : "shocked"} seed={3} flip />
        </div>
        <div style={{ position: "absolute", left: 70, top: 520 }}>
          <CookJo
            size={620}
            expr={t < 58.77 ? "normal" : t < 59.8 ? "smirk" : "dizzy"}
            pose={t < 58.77 ? "idle" : "shrug"}
            red={interpolate(t, [59.5, 60.3], [0.1, 1], clamp)}
            steam={t > 59.8}
            sweat={t > 59.8}
          />
        </div>
        <Pop at={56.0} out={58.6} x={380} y={300}>
          <Bubble w={640} tail="right" size={50}>
            “Kerja di dapur emang harus panas-panasan!”
          </Bubble>
        </Pop>
        <Pop at={58.77} out={59.35} x={60} y={330}>
          <Bubble w={380} tail="left" size={64}>
            “Boleh.” 👍
          </Bubble>
        </Pop>
        <Sticker at={59.44} y={290} x={230} bg={C.orange} size={52} rotate={-3}>
          {"YANG MATENG MASAKANNYA,\nBUKAN KAMU 🍳"}
        </Sticker>
        <Pop at={60.2} x={800} y={560}>
          <SiHalus size={220} variant="heat" mood="laugh" />
        </Pop>
      </Scene>
    </AbsoluteFill>
  );
};

export const Ep4: React.FC = () => (
  <Episode ep={4} accent={C.orange} tint="#4A2412" words={words} endStart={EP4.endStart} revealAt={EP4.revealAt} flashes={[14.37, 33.58]}>
    <Ep4Scenes />
  </Episode>
);
