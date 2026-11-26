import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode } from "../Episode";
import { Pop, Scanner, Sticker, useShake } from "../Kit";
import { Badge, CheckRow, Room, Zzz } from "../Props";
import { Scene } from "./Ep1";
import { words } from "./ep6.words";

// Waktu = detik VO final (data/ep6_words.json), tanpa warp.
export const EP6 = { dur: 63.69, endStart: 59.23, revealAt: 61.44 };

const ACC = C.cyan;

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const S = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/* ------------------------------------------------------------ gambar lokal */

/** Mobil tampak samping. Kaca semi-transparan supaya penumpang di belakangnya terlihat. */
const Car: React.FC<{ w?: number; smoke?: boolean; color?: string }> = ({ w = 760, smoke = true, color = "#4F7CFF" }) => {
  const t = useT();
  return (
    <svg width={w} height={w * 0.5} viewBox="0 0 760 380" style={{ overflow: "visible" }}>
      {/* asap knalpot */}
      {smoke &&
        [0, 1, 2, 3].map((i) => {
          const p = (t * 0.45 + i / 4) % 1;
          return <circle key={i} cx={40 - p * 120} cy={300 - p * 120} r={16 + p * 46} fill="#9AA3B5" opacity={0.45 * Math.sin(p * Math.PI)} />;
        })}
      <rect x={20} y={286} width={50} height={18} rx={8} fill="#5C6478" {...S} strokeWidth={5} />
      {/* kabin */}
      {/* kabin berlubang di jendela (evenodd) supaya penumpang terlihat */}
      <path
        d="M190 190 L250 80 Q262 60 290 60 L480 60 Q508 60 522 80 L600 190 Z M232 182 L276 96 Q282 86 296 86 L388 86 L388 182 Z M408 182 L408 86 L476 86 Q490 86 498 98 L560 182 Z"
        fill={color}
        fillRule="evenodd"
        {...S}
      />
      {/* kaca */}
      <path d="M232 182 L276 96 Q282 86 296 86 L388 86 L388 182 Z" fill="rgba(190,225,255,0.22)" {...S} strokeWidth={5} />
      <path d="M408 182 L408 86 L476 86 Q490 86 498 98 L560 182 Z" fill="rgba(190,225,255,0.22)" {...S} strokeWidth={5} />
      {/* badan */}
      <rect x={60} y={180} width={660} height={130} rx={50} fill={color} {...S} />
      <rect x={90} y={230} width={130} height={14} rx={7} fill="rgba(255,255,255,0.35)" />
      <circle cx={700} cy={230} r={16} fill={C.yellow} {...S} strokeWidth={5} />
      <circle cx={80} cy={232} r={12} fill={C.pink} {...S} strokeWidth={5} />
      {/* roda */}
      {[190, 590].map((x) => (
        <g key={x}>
          <circle cx={x} cy={310} r={62} fill={C.ink} />
          <circle cx={x} cy={310} r={28} fill="#9AA0B5" {...S} strokeWidth={5} />
        </g>
      ))}
    </svg>
  );
};

/** Genset sederhana */
const Genset: React.FC<{ size?: number }> = ({ size = 220 }) => {
  const t = useT();
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 220 176" style={{ overflow: "visible" }}>
      <rect x={14} y={30} width={192} height={110} rx={18} fill={C.orange} {...S} />
      <rect x={34} y={50} width={90} height={70} rx={10} fill={C.ink} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={42} y={58 + i * 15} width={74} height={6} rx={3} fill="#5C6478" />
      ))}
      <circle cx={164} cy={84} r={22} fill="#9AA0B5" {...S} strokeWidth={5} />
      <rect x={150} y={10} width={30} height={24} rx={6} fill="#5C6478" {...S} strokeWidth={5} />
      {[0, 1, 2].map((i) => {
        const p = (t * 0.6 + i / 3) % 1;
        return <circle key={i} cx={165 + p * 30} cy={4 - p * 70} r={10 + p * 22} fill="#9AA3B5" opacity={0.5 * Math.sin(p * Math.PI)} />;
      })}
      <circle cx={46} cy={150} r={16} fill={C.ink} />
      <circle cx={174} cy={150} r={16} fill={C.ink} />
    </svg>
  );
};

/** Garasi tertutup (rolling door) */
const Garage: React.FC<{ dark?: number; children?: React.ReactNode }> = ({ dark = 0, children }) => (
  <Room wall="#2A3348" floor="#1C2230" dark={dark}>
    <div style={{ position: "absolute", left: 60, right: 60, top: 40, height: 520, borderRadius: 18, border: `${OUTLINE}px solid ${C.ink}`, background: "#3A4560", overflow: "hidden" }}>
      {new Array(12).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 18 + i * 42, height: 8, background: "rgba(0,0,0,0.22)" }} />
      ))}
    </div>
    <div style={{ position: "absolute", left: 420, top: 40, width: 120, height: 34, background: C.ink, borderRadius: "0 0 14px 14px" }} />
    {children}
  </Room>
);

/** Ikon bulat besar dengan emoji + label + coretan opsional */
const IconTile: React.FC<{ icon: string; label: string; crossed?: boolean; crossAt?: number; color?: string; size?: number }> = ({
  icon,
  label,
  crossed,
  crossAt = 0,
  color = C.cream,
  size = 230,
}) => {
  const t = useT();
  const cross = crossed ? interpolate(t, [crossAt, crossAt + 0.3], [0, 1], { ...clamp, easing: easeOut }) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: size + 60 }}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          border: `${OUTLINE}px solid ${C.ink}`,
          boxShadow: `0 12px 0 ${C.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.52,
        }}
      >
        {icon}
        {crossed && (
          <svg width={size} height={size} style={{ position: "absolute", inset: 0 }}>
            <line x1={size * 0.18} y1={size * 0.82} x2={size * 0.18 + size * 0.64 * cross} y2={size * 0.82 - size * 0.64 * cross} stroke={C.pink} strokeWidth={22} strokeLinecap="round" />
          </svg>
        )}
      </div>
      <div style={{ fontFamily: HEAD, fontSize: 56, color: C.cream, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill", textAlign: "center", lineHeight: 1 }}>{label}</div>
    </div>
  );
};

/** Molekul kecil */
const Mol: React.FC<{ label: string; color: string; size?: number }> = ({ label, color, size = 96 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      border: `6px solid ${C.ink}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: HEAD,
      fontSize: size * 0.34,
      color: C.ink,
    }}
  >
    {label}
  </div>
);

/** Sel darah merah dengan 4 "kursi"; CO merebut kursi, O₂ terpental */
const BloodCell: React.FC = () => {
  const t = useT();
  const seats = [
    [210, 170],
    [430, 170],
    [210, 390],
    [430, 390],
  ];
  const grabAt = [25.39, 25.72, 26.06, 26.40];
  const bounce = interpolate(t, [27.69, 28.09], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ position: "relative", width: 700, height: 600 }}>
      <svg width={700} height={600} style={{ position: "absolute", inset: 0 }}>
        <ellipse cx={350} cy={300} rx={330} ry={270} fill="#E23B4E" {...S} />
        <ellipse cx={350} cy={300} rx={200} ry={150} fill="#C02A3E" />
        {seats.map(([x, y], i) => (
          <circle key={i} cx={x + 48} cy={y + 48} r={62} fill="rgba(0,0,0,0.25)" stroke={C.ink} strokeWidth={5} strokeDasharray="12 10" />
        ))}
      </svg>
      {seats.map(([x, y], i) => {
        const p = interpolate(t, [grabAt[i], grabAt[i] + 0.45], [0, 1], { ...clamp, easing: easeOut });
        if (p <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: x + (1 - p) * (i % 2 ? 300 : -300), top: y, opacity: p }}>
            <Mol label="CO" color="#8A93A6" />
          </div>
        );
      })}
      {/* O₂ yang ketinggalan */}
      {[0, 1, 2].map((i) => {
        const appear = interpolate(t, [27.07 + i * 0.15, 27.30 + i * 0.15], [0, 1], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 560 + i * 40 + bounce * 120,
              top: 40 + i * 150 - bounce * 30 * (i - 1),
              opacity: appear * (1 - bounce * 0.4),
              rotate: `${bounce * 30 * (i - 1)}deg`,
            }}
          >
            <Mol label="O₂" color={C.cyan} size={86} />
          </div>
        );
      })}
    </div>
  );
};

/** Gumpalan gas CO yang melayang pelan */
const Wisps: React.FC<{ x: number; y: number; n?: number; dx?: number }> = ({ x, y, n = 4, dx = 160 }) => {
  const t = useT();
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const p = (t * 0.35 + i / n) % 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + p * dx + Math.sin(t * 1.4 + i) * 18,
              top: y - p * 140,
              width: 60 + p * 70,
              height: 60 + p * 70,
              borderRadius: "50%",
              background: "#8A93A6",
              opacity: 0.55 * Math.sin(p * Math.PI),
            }}
          />
        );
      })}
    </>
  );
};

/** Rumah malam hari saat mati lampu, genset di dalam garasi */
const HouseNight: React.FC<{ from: number }> = ({ from }) => {
  const t = useT();
  const dark = interpolate(t, [from + 1.6, from + 2.0], [0, 1], clamp);
  return (
    <>
      <div style={{ position: "absolute", left: 40, right: 40, top: 400, height: 780, borderRadius: 60, overflow: "hidden", border: `${OUTLINE}px solid ${C.ink}`, background: "#101830" }}>
        {/* bintang */}
        {new Array(10).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 40 + ((i * 97) % 900), top: 30 + ((i * 53) % 140), width: 8, height: 8, borderRadius: "50%", background: C.cream, opacity: 0.7 }} />
        ))}
        {/* atap */}
        <svg width={1000} height={820} style={{ position: "absolute", inset: 0 }}>
          <path d="M80 330 L360 140 L640 330 Z" fill="#7A3B2E" stroke={C.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
          <rect x={110} y={330} width={500} height={420} fill="#C9B79A" stroke={C.ink} strokeWidth={OUTLINE} />
          {/* jendela: nyala lalu padam */}
          {[160, 430].map((x) => (
            <rect key={x} x={x} y={390} width={130} height={120} rx={10} fill={dark > 0.5 ? "#1B2238" : C.yellow} stroke={C.ink} strokeWidth={6} />
          ))}
          <rect x={300} y={560} width={110} height={190} rx={8} fill="#6B4528" stroke={C.ink} strokeWidth={6} />
          {/* garasi samping */}
          <rect x={610} y={420} width={330} height={330} fill="#A89A82" stroke={C.ink} strokeWidth={OUTLINE} />
          <rect x={640} y={470} width={270} height={280} fill="#3A4560" stroke={C.ink} strokeWidth={6} />
          <rect x={0} y={750} width={1000} height={70} fill="#1C2230" />
        </svg>
        <div style={{ position: "absolute", left: 660, top: 560 }}>
          <Genset size={200} />
        </div>
        <Wisps x={620} y={520} dx={-260} />
        <Wisps x={300} y={470} n={3} dx={-120} />
        <div style={{ position: "absolute", left: 420, top: 420, opacity: 0.85 }}>
          <SiHalus size={190} variant="gas" />
        </div>
      </div>
    </>
  );
};

/** Bengkel & gudang dengan rolling door tertutup */
const Workshop: React.FC<{ from: number }> = ({ from }) => {
  const t = useT();
  const pop2 = interpolate(t, [from + 1.7, from + 2.0], [0, 1], { ...clamp, easing: easeOut });
  const box = (x: number, label: string, o = 1) => (
    <div style={{ position: "absolute", left: x, top: 470, width: 440, height: 560, opacity: o, scale: String(0.6 + 0.4 * o) }}>
      <svg width={440} height={560} viewBox="0 0 440 560">
        <path d="M10 130 L220 30 L430 130 L430 550 L10 550 Z" fill="#4A5570" stroke={C.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
        <rect x={60} y={220} width={320} height={330} fill="#2A3348" stroke={C.ink} strokeWidth={6} />
        {new Array(9).fill(0).map((_, i) => (
          <rect key={i} x={60} y={232 + i * 36} width={320} height={8} fill="rgba(0,0,0,0.3)" />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: HEAD, fontSize: 52, color: C.cream, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill" }}>
        {label}
      </div>
    </div>
  );
  return (
    <>
      {box(60, "BENGKEL 🔧")}
      {box(580, "GUDANG 📦", pop2)}
      <Wisps x={150} y={760} dx={220} />
      <Wisps x={660} y={760} dx={200} n={3} />
      <div style={{ position: "absolute", left: 420, top: 690, opacity: 0.9 }}>
        <SiHalus size={220} variant="gas" mood="grin" />
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ adegan */
const Ep6Scenes: React.FC = () => {
  const t = useT();
  const cam = useShake([
    { t: 13.80, a: 24 },
    { t: 54.38, a: 16 },
  ]);
  const sleeperHead = (
    <div style={{ position: "absolute", left: 360, top: 560, rotate: `${Math.sin(t * 1.6) * 4 - 8}deg`, transformOrigin: "50% 90%" }}>
      <Worker size={330} expr="sleepy" shirt="#7C5CFF" seed={1} />
    </div>
  );
  return (
    <AbsoluteFill style={{ translate: cam }}>
      {/* 1 — HOOK: tidur di mobil, mesin nyala */}
      <Scene a={0} b={5.67} zoom={false}>
        <Garage>
          <div style={{ position: "absolute", left: 30, bottom: 120, width: 920, height: 260, background: "radial-gradient(ellipse at 50% 100%, rgba(255,210,63,0.18), rgba(0,0,0,0) 70%)" }} />
        </Garage>
        {sleeperHead}
        <div style={{ position: "absolute", left: 150, top: 520 }}>
          <Car w={780} />
        </div>
        <Zzz x={600} y={560} />
        <Sticker at={0.08} out={4.60} y={290} bg={C.cream} size={64}>
          MESIN NYALA · AC DINGIN 🚗❄️
        </Sticker>
        <Sticker at={4.67} y={290} bg={ACC} size={76}>
          ENAK BANGET… KAN? 😴
        </Sticker>
      </Scene>

      {/* 2 — berita + bukan keracunan AC */}
      <Scene a={5.67} b={11.48}>
        <Garage dark={0.35}>
          <div style={{ position: "absolute", left: 120, top: 470, opacity: 0.55 }}>
            <Car w={700} smoke />
          </div>
        </Garage>
        <Pop at={5.72} x={90} y={360}>
          <div
            style={{
              width: 900,
              padding: "26px 34px 32px",
              borderRadius: 34,
              background: C.cream,
              border: `${OUTLINE}px solid ${C.ink}`,
              boxShadow: `0 14px 0 ${C.ink}`,
              fontFamily: BODY,
              fontWeight: 800,
              color: C.ink,
              rotate: "-1.5deg",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ background: "#E23B4E", color: C.white, borderRadius: 12, padding: "4px 18px", fontSize: 40, fontFamily: HEAD }}>BERITA</span>
              <span style={{ fontSize: 34, opacity: 0.7 }}>terulang berkali-kali</span>
              <span style={{ marginLeft: "auto", fontSize: 52, scale: String(1 + 0.12 * Math.abs(Math.sin(t * 6))) }}>🚨</span>
            </div>
            <div style={{ fontSize: 54, lineHeight: 1.12, marginTop: 14 }}>Ditemukan tak sadarkan diri di dalam mobil, mesin masih menyala</div>
          </div>
        </Pop>
        <Pop at={9.42} x={180} y={790}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ position: "relative", width: 200, height: 120, borderRadius: 22, background: C.white, border: `${OUTLINE}px solid ${C.ink}` }}>
              <div style={{ position: "absolute", left: 20, right: 20, bottom: 22, height: 10, borderRadius: 5, background: "#9AA0B5" }} />
              <div style={{ position: "absolute", left: 22, top: 18, fontFamily: HEAD, fontSize: 40, color: C.ink }}>AC</div>
              <svg width={200} height={120} style={{ position: "absolute", inset: 0 }}>
                <line x1={14} y1={106} x2={186} y2={14} stroke={C.pink} strokeWidth={16} strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ fontFamily: HEAD, fontSize: 76, color: C.white, background: C.pink, padding: "12px 30px 16px", borderRadius: 26, border: `${OUTLINE}px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}`, rotate: "-3deg" }}>
              BUKAN KERACUNAN AC ❌
            </div>
          </div>
        </Pop>
      </Scene>

      {/* 3 — scanner: makhluk halus paling licik */}
      <Scene a={11.48} b={13.78}>
        <Garage dark={interpolate(t, [11.48, 11.82], [0.2, 0.6], clamp)} />
        <div style={{ position: "absolute", left: 360, top: 560, opacity: 0.55 }}>
          <Worker size={330} expr="sleepy" shirt="#7C5CFF" seed={1} />
        </div>
        <div style={{ position: "absolute", left: 150, top: 520, opacity: 0.6 }}>
          <Car w={780} />
        </div>
        <Scanner at={12.02} dur={0.9} top={330} height={820}>
          <div style={{ position: "absolute", left: 40, top: 520, rotate: "-12deg" }}>
            <SiHalus size={360} variant="gas" />
          </div>
        </Scanner>
        <Sticker at={11.53} y={290} bg={C.bg1} color={ACC} size={66}>
          PALING LICIK 👻
        </Sticker>
      </Scene>

      {/* 4 — judul */}
      <Scene a={13.78} b={15.05}>
        <div style={{ position: "absolute", left: 270, top: 340 }}>
          <Pop at={13.80}>
            <SiHalus size={620} variant="gas" mood="laugh" />
          </Pop>
        </div>
        <Sticker at={14.16} y={960} bg={ACC} size={72} rotate={-4}>
          {"SI HALUS:\nKARBON MONOKSIDA"}
        </Sticker>
      </Scene>

      {/* 5 — jangan ketuker sama CO₂ */}
      <Scene a={15.05} b={19.60}>
        <Sticker at={15.10} y={290} bg={C.yellow} size={74}>
          EH, JANGAN KETUKER! ⚠️
        </Sticker>
        <Pop at={16.18} x={60} y={430}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: 420 }}>
            <SiHalus size={330} variant="co2" mood="grin" />
            <div style={{ fontFamily: HEAD, fontSize: 90, color: "#B9A6FF", WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill" }}>CO₂</div>
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 40, color: C.cream }}>EP 1 · ruang rapat</div>
          </div>
        </Pop>
        <Pop at={17.66} x={600} y={430}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: 420 }}>
            <SiHalus size={330} variant="gas" mood="grin" />
            <div style={{ fontFamily: HEAD, fontSize: 90, color: "#B8C0D0", WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill" }}>CO</div>
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 40, color: C.cream }}>gas racun</div>
          </div>
        </Pop>
        <Pop at={18.04} x={455} y={580}>
          <div style={{ fontFamily: HEAD, fontSize: 170, color: C.pink, WebkitTextStroke: `14px ${C.ink}`, paintOrder: "stroke fill" }}>≠</div>
        </Pop>
        <Sticker at={18.80} y={1080} bg={C.cream} size={58}>
          CO = TANPA “DUA” ✌️❌
        </Sticker>
      </Scene>

      {/* 6 — sumber pembakaran */}
      <Scene a={19.60} b={23.28}>
        <Sticker at={19.62} y={290} bg={C.orange} size={70}>
          GAS DARI PEMBAKARAN 🔥
        </Sticker>
        <Pop at={21.10} x={40} y={470}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: 330 }}>
            <div style={{ width: 300, height: 230, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Car w={300} />
            </div>
            <div style={{ fontFamily: HEAD, fontSize: 60, color: C.cream, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill" }}>KNALPOT</div>
          </div>
        </Pop>
        <Pop at={21.83} x={375} y={470}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: 330 }}>
            <div style={{ width: 300, height: 230, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Genset size={240} />
            </div>
            <div style={{ fontFamily: HEAD, fontSize: 60, color: C.cream, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill" }}>GENSET</div>
          </div>
        </Pop>
        <Pop at={22.61} x={710} y={470}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: 330 }}>
            <div style={{ width: 300, height: 230, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 170 }}>🔥</div>
            <div style={{ fontFamily: HEAD, fontSize: 56, color: C.cream, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill", textAlign: "center", lineHeight: 1 }}>
              KOMPOR
              <br />
              ARANG
            </div>
          </div>
        </Pop>
      </Scene>

      {/* 7 — tanpa warna, tanpa bau */}
      <Scene a={23.28} b={24.98}>
        <Sticker at={23.30} y={290} bg={C.cream} size={66}>
          NGGAK KELIHATAN · NGGAK KECIUM
        </Sticker>
        <Pop at={23.50} x={110} y={480}>
          <IconTile icon="👁️" label="TANPA WARNA" crossed crossAt={23.65} />
        </Pop>
        <Pop at={24.35} x={600} y={480}>
          <IconTile icon="👃" label="TANPA BAU" crossed crossAt={24.50} />
        </Pop>
      </Scene>

      {/* 8 — darah: CO > 200x lebih kuat */}
      <Scene a={24.98} b={28.95}>
        <Sticker at={25.02} out={27.66} y={290} bg={ACC} size={66}>
          CO NEMPEL KE DARAH 🩸
        </Sticker>
        <Sticker at={27.70} y={290} bg={C.pink} color={C.white} size={62}>
          OKSIGEN NGGAK KEANGKUT
        </Sticker>
        <div style={{ position: "absolute", left: 60, top: 450 }}>
          <BloodCell />
        </div>
        <Pop at={26.30} x={600} y={930}>
          <div
            style={{
              fontFamily: HEAD,
              fontSize: 84,
              color: C.ink,
              background: C.yellow,
              padding: "10px 30px 14px",
              borderRadius: 26,
              border: `${OUTLINE}px solid ${C.ink}`,
              boxShadow: `0 10px 0 ${C.ink}`,
              rotate: "-4deg",
            }}
          >
            &gt;200× KUAT
          </div>
        </Pop>
        <Pop at={28.29} x={790} y={420}>
          <Worker size={300} expr="dizzy" shirt="#7C5CFF" seed={2} />
        </Pop>
      </Scene>

      {/* 9 — gejala mirip masuk angin */}
      <Scene a={28.95} b={32.82}>
        <Sticker at={28.96} y={290} bg={C.cream} size={70}>
          MIRIP MASUK ANGIN 🤧
        </Sticker>
        <Pop at={29.0} out={30.25} x={330} y={470}>
          <Worker size={600} expr="dizzy" shirt="#7C5CFF" seed={2} />
        </Pop>
        <div style={{ position: "absolute", top: 420, left: 120, display: "flex", flexDirection: "column", gap: 22 }}>
          <Badge icon="😵‍💫" label="PUSING" at={30.41} color={C.pink} />
          <Badge icon="🤢" label="MUAL" at={31.09} color="#7EE08A" />
          <Badge icon="🫠" label="LEMES" at={31.74} color={C.yellow} />
          <Badge icon="😴" label="NGANTUK" at={32.25} color="#B9A6FF" />
        </div>
      </Scene>

      {/* 10 — kalau lagi tidur */}
      <Scene a={32.82} b={35.58}>
        <Garage dark={interpolate(t, [32.85, 35.10], [0.25, 0.7], clamp)} />
        <div style={{ position: "absolute", left: 360, top: 560, opacity: interpolate(t, [32.85, 35.19], [1, 0.45], clamp) }}>
          <Worker size={330} expr="sleepy" shirt="#7C5CFF" seed={1} />
        </div>
        <div style={{ position: "absolute", left: 150, top: 520 }}>
          <Car w={780} />
        </div>
        <div style={{ opacity: interpolate(t, [33.09, 35.37], [1, 0], clamp) }}>
          <Zzz x={600} y={560} at={32.85} />
        </div>
        <div style={{ position: "absolute", left: 30, top: 470, rotate: "-10deg", opacity: 0.85 }}>
          <SiHalus size={260} variant="gas" />
        </div>
        <Sticker at={32.90} out={33.94} y={290} bg={C.bg1} color={C.cream} size={70}>
          KALAU LAGI TIDUR…
        </Sticker>
        <Sticker at={34.02} y={290} bg={C.pink} color={C.white} size={68}>
          BISA NGGAK SEMPET SADAR ⚠️
        </Sticker>
      </Scene>

      {/* 10b — DI RUMAH: mati lampu, genset di dalam */}
      <Scene a={35.58} b={40.35}>
        <HouseNight from={35.58} />
        <Sticker at={35.62} y={290} bg={C.cream} size={74}>
          DI RUMAH 🏠
        </Sticker>
        <Sticker at={37.25} out={39.9} y={1080} bg={C.bg1} color={C.yellow} size={56} rotate={3}>
          MATI LAMPU 🕯️
        </Sticker>
        <Pop at={38.14} x={760} y={430}>
          <div style={{ fontFamily: HEAD, fontSize: 130, color: "#FF3B30", WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill" }}>✕</div>
        </Pop>
      </Scene>

      {/* 10c — DI TEMPAT KERJA: bengkel & gudang tertutup */}
      <Scene a={40.35} b={43.11}>
        <Workshop from={40.35} />
        <Sticker at={40.4} y={290} bg={ACC} size={70}>
          DI TEMPAT KERJA 🔧
        </Sticker>
        <Sticker at={41.43} y={1080} bg={C.bg1} color={C.cream} size={54} rotate={-2}>
          BENGKEL &amp; GUDANG TERTUTUP
        </Sticker>
      </Scene>

      {/* 11 — cara aman */}
      <Scene a={43.11} b={52.44}>
        <Sticker at={43.11} y={290} bg={ACC} size={80}>
          JADI GINI 👇
        </Sticker>
        <div style={{ position: "absolute", top: 420, left: 80, display: "flex", flexDirection: "column", gap: 28 }}>
          <CheckRow icon="🚗" label="Jangan tidur di mobil, mesin nyala, di tempat tertutup" at={43.76} />
          <CheckRow icon="⚙️" label="Genset di luar, ≥ 6 m dari jendela & pintu" at={46.75} />
          <CheckRow icon="🚨" label="Pasang detektor CO di rumah" at={51.04} />
        </div>
        {/* diagram 6 meter */}
        {t >= 47.38 && t < 50.91 && (
          <Pop at={47.47} out={50.64} x={80} y={830}>
            <div style={{ position: "relative", width: 920, height: 330 }}>
              <div style={{ position: "absolute", left: 0, top: 70, width: 260, height: 210, background: "#3A4560", border: `${OUTLINE}px solid ${C.ink}`, borderRadius: 16 }}>
                <div style={{ position: "absolute", left: 60, top: 50, width: 90, height: 80, background: "rgba(190,225,255,0.5)", border: `5px solid ${C.ink}`, borderRadius: 8 }} />
                <div style={{ position: "absolute", left: 80, top: -40, fontFamily: HEAD, fontSize: 40, color: C.cream }}>🏠</div>
              </div>
              <svg width={920} height={330} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                <line x1={290} y1={170} x2={640} y2={170} stroke={C.lime} strokeWidth={10} strokeDasharray="22 14" />
                <path d="M300 150 L280 170 L300 190 M630 150 L650 170 L630 190" fill="none" stroke={C.lime} strokeWidth={10} strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", left: 380, top: 80, fontFamily: HEAD, fontSize: 80, color: C.lime, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill" }}>≥ 6 m</div>
              <div style={{ position: "absolute", left: 670, top: 90 }}>
                <Genset size={230} />
              </div>
            </div>
          </Pop>
        )}
      </Scene>

      {/* 12 — beda satu angka, beda nasib */}
      <Scene a={52.44} b={59.23}>
        <Sticker at={53.06} y={290} bg={C.yellow} size={58} rotate={-2}>
          BEDA SATU ANGKA, BEDA NASIB
        </Sticker>
        {t < 54.83 && (
          <Pop at={52.49} out={54.61} x={0} y={560} style={{ width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 40 }}>
            <SiHalus size={300} variant="co2" mood="grin" />
            <div style={{ fontFamily: HEAD, fontSize: 110, color: C.cream, WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill" }}>vs</div>
            <SiHalus size={300} variant="gas" mood="grin" />
          </Pop>
        )}
        {/* panel kiri: CO₂ (EP1) */}
        <Pop at={54.78} x={50} y={430} from="left">
          <div style={{ position: "relative", width: 480, height: 740, borderRadius: 40, border: `${OUTLINE}px solid ${C.ink}`, background: "#3B2A66", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 200, background: "#251845", borderTop: `${OUTLINE}px solid ${C.ink}` }} />
            <div style={{ position: "absolute", left: 270, top: 40 }}>
              <SiHalus size={190} variant="co2" mood="laugh" />
            </div>
            <div style={{ position: "absolute", left: 70, top: 220 }}>
              <Worker size={420} expr="sleepy" shirt="#7C5CFF" seed={1} tie />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 24, textAlign: "center", fontFamily: HEAD, fontSize: 64, color: "#B9A6FF", WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill", lineHeight: 1 }}>
              CO₂
              <div style={{ fontFamily: BODY, fontSize: 40, color: C.cream, WebkitTextStroke: "0px", marginTop: 6 }}>ngantuk pas meeting 😴</div>
            </div>
          </div>
        </Pop>
        {/* panel kanan: CO */}
        <Pop at={57.03} x={550} y={430} from="right">
          <div style={{ position: "relative", width: 480, height: 740, borderRadius: 40, border: `${OUTLINE}px solid ${C.ink}`, background: "#141A26", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 200, background: "#0D1119", borderTop: `${OUTLINE}px solid ${C.ink}` }} />
            <div style={{ position: "absolute", left: 30, top: 300, opacity: 0.8 }}>
              <Car w={420} color="#3C4A6B" />
            </div>
            <div style={{ position: "absolute", left: 160, top: 40, opacity: 0.9 }}>
              <SiHalus size={210} variant="gas" />
            </div>
            <div
              style={{
                position: "absolute",
                left: 40,
                top: 60,
                fontSize: 80,
                opacity: 0.6 + 0.4 * Math.abs(Math.sin(t * 5)),
              }}
            >
              🚨
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 24, textAlign: "center", fontFamily: HEAD, fontSize: 64, color: "#B8C0D0", WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill", lineHeight: 1 }}>
              CO
              <div style={{ fontFamily: BODY, fontSize: 40, color: C.cream, WebkitTextStroke: "0px", marginTop: 6 }}>bisa nggak bangun lagi ⚠️</div>
            </div>
          </div>
        </Pop>
        {t < 56.98 && (
          <Pop at={55.55} x={640} y={700}>
            <div style={{ fontFamily: HEAD, fontSize: 120, color: "rgba(255,255,255,0.25)" }}>?</div>
          </Pop>
        )}
      </Scene>
    </AbsoluteFill>
  );
};

export const Ep6: React.FC = () => (
  <Episode ep={6} accent={ACC} tint="#1E2A3A" words={words} endStart={EP6.endStart} revealAt={EP6.revealAt} flashes={[13.80]}>
    <Ep6Scenes />
  </Episode>
);

