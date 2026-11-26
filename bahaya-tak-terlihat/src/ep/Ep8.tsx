import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut, easeOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode } from "../Episode";
import { BigStat, Pop, Scanner, Sticker, useShake } from "../Kit";
import { InfoCard, Room, Zzz } from "../Props";
import { Bed, Phone, S } from "../PropsStress";
import { Scene } from "./Ep1";
import { words } from "./ep8.words";

/** Semua waktu = detik isi utama (data/ep8_words.json), tanpa warp. Hook & CTA diatur Episode.tsx */
export const EP8 = { endStart: 62.79, revealAt: 65.2 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const ACC = S.violet;
const SV = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const NIGHT = { wall: "#1C1A44", floor: "#141233" };

/* ----------------------------------------------------------- gambar lokal */

/** Jendela malam dengan bulan */
const NightWindow: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={260} height={240} style={{ position: "absolute", left: x, top: y }}>
    <rect x={6} y={6} width={248} height={228} rx={18} fill="#0B0E2A" stroke={C.ink} strokeWidth={OUTLINE} />
    <circle cx={170} cy={80} r={36} fill={C.cream} />
    <circle cx={186} cy={70} r={34} fill="#0B0E2A" />
    {[
      [50, 60],
      [90, 150],
      [200, 170],
      [60, 190],
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={4} fill={C.cream} opacity={0.8} />
    ))}
    <line x1={130} y1={6} x2={130} y2={234} stroke={C.ink} strokeWidth={6} />
    <line x1={6} y1={120} x2={254} y2={120} stroke={C.ink} strokeWidth={6} />
  </svg>
);

/** Kamar tidur malam: dinding, jendela, kasur. `glow` = cahaya HP di wajah */
const Bedroom: React.FC<{ dark?: number; children?: React.ReactNode }> = ({ dark = 0, children }) => (
  <Room wall={NIGHT.wall} floor={NIGHT.floor} dark={dark}>
    <NightWindow x={620} y={70} />
    {children}
  </Room>
);

/** Orang rebahan: Bang Jo tiduran di kasur, badan ketutup selimut. `sitUp` 0..1 = bangun kaget */
const InBed: React.FC<{ expr: "sleepy" | "shocked" | "dizzy" | "normal"; shake?: number; glow?: number; sitUp?: number }> = ({ expr, shake = 0, glow = 0, sitUp = 0 }) => (
  <>
    <div style={{ position: "absolute", left: 40, top: 760 }}>
      <Bed w={1000} />
    </div>
    {glow > 0 && (
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 600,
          width: 480,
          height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(170,200,255,0.55), rgba(170,200,255,0) 70%)",
          opacity: glow,
        }}
      />
    )}
    <div style={{ position: "absolute", left: 300 - 116, top: 880 - 180, width: 232, height: 360, rotate: `${-90 + 35 * sitUp}deg`, transformOrigin: "50% 62%" }}>
      <Worker size={360} expr={expr} shirt="#3FA7A0" pants="#2E3557" seed={2} shake={shake} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 340,
        top: 860,
        width: 650,
        height: 150,
        background: "#5B6BD8",
        border: `${OUTLINE}px solid ${C.ink}`,
        borderRadius: "90px 40px 26px 60px",
        boxShadow: `inset 0 -18px 0 rgba(0,0,0,0.15)`,
      }}
    />
  </>
);

/** Hati berdebar dengan angka BPM */
const Heart: React.FC<{ at: number; size?: number }> = ({ at, size = 220 }) => {
  const t = useT();
  if (t < at - 0.05) return null;
  const beat = (t - at) * 2.6;
  const ph = beat % 1;
  const pulse = 1 + 0.18 * Math.exp(-ph * 9) + 0.1 * Math.exp(-Math.max(0, ph - 0.22) * 12) * (ph > 0.22 ? 1 : 0);
  const bpm = Math.round(interpolate(t, [at, at + 1.2], [72, 128], clamp));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size * 0.9} viewBox="0 0 220 200" style={{ scale: String(pulse), overflow: "visible" }}>
        <path d="M110 190 C40 140 0 100 10 55 C20 10 80 0 110 45 C140 0 200 10 210 55 C220 100 180 140 110 190 Z" fill={S.red} {...SV} />
        <path d="M50 60 Q55 35 80 32" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={12} strokeLinecap="round" />
      </svg>
      <div
        style={{
          fontFamily: HEAD,
          fontSize: 58,
          color: C.white,
          background: C.ink,
          padding: "4px 22px 8px",
          borderRadius: 999,
          border: `5px solid ${S.red}`,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {bpm} BPM
      </div>
    </div>
  );
};

/** Baris akibat/gejala (ikon + teks) */
const Row: React.FC<{ icon: string; label: string; sub?: string; color?: string; at: number; w?: number }> = ({ icon, label, sub, color = S.red, at, w = 920 }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 13, stiffness: 190 } });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        width: w,
        padding: "18px 28px",
        borderRadius: 40,
        background: C.cream,
        border: `${OUTLINE}px solid ${C.ink}`,
        boxShadow: `0 10px 0 ${C.ink}`,
        translate: `${interpolate(s, [0, 1], [950, 0])}px 0px`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          flexShrink: 0,
          borderRadius: 30,
          background: color,
          border: `6px solid ${C.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 70,
        }}
      >
        {icon}
      </div>
      <div style={{ fontFamily: BODY, fontWeight: 800, color: C.ink, lineHeight: 1.05 }}>
        <div style={{ fontSize: 56 }}>{label}</div>
        {sub && <div style={{ fontSize: 36, opacity: 0.7, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Jam dinding; `speed` = jarum berputar cepat (lembur) */
const Clock: React.FC<{ size?: number; speed?: number; time?: number; closed?: boolean; closedAt?: number }> = ({ size = 300, speed = 0, time = 10, closed = false, closedAt = 0 }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const hours = time + t * speed;
  const ha = (hours % 12) * 30;
  const ma = (hours % 1) * 360;
  const sign = closed ? spring({ frame: (t - closedAt) * fps, fps, config: { damping: 7, stiffness: 120 } }) : 0;
  const swing = closed ? Math.sin((t - closedAt) * 5) * 10 * Math.exp(-(t - closedAt) * 1.5) : 0;
  return (
    <div style={{ position: "relative", width: size, height: size * (closed ? 1.5 : 1) }}>
      <svg width={size} height={size} viewBox="0 0 300 300">
        <circle cx={150} cy={150} r={135} fill={C.cream} {...SV} />
        {new Array(12).fill(0).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={150 + Math.sin(a) * 105} y1={150 - Math.cos(a) * 105} x2={150 + Math.sin(a) * 120} y2={150 - Math.cos(a) * 120} stroke={C.ink} strokeWidth={i % 3 ? 5 : 10} strokeLinecap="round" />;
        })}
        <line x1={150} y1={150} x2={150 + Math.sin((ha * Math.PI) / 180) * 62} y2={150 - Math.cos((ha * Math.PI) / 180) * 62} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
        <line x1={150} y1={150} x2={150 + Math.sin((ma * Math.PI) / 180) * 95} y2={150 - Math.cos((ma * Math.PI) / 180) * 95} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
        <circle cx={150} cy={150} r={12} fill={S.red} stroke={C.ink} strokeWidth={5} />
      </svg>
      {closed && (
        <div
          style={{
            position: "absolute",
            left: size * 0.05,
            top: size * 0.86,
            width: size * 0.9,
            transformOrigin: "50% -40px",
            rotate: `${swing}deg`,
            scale: String(interpolate(sign, [0, 1], [0.2, 1])),
            opacity: interpolate(sign, [0, 0.3], [0, 1], clamp),
          }}
        >
          <svg width={size * 0.9} height={50} style={{ position: "absolute", top: -46, left: 0 }}>
            <line x1={size * 0.2} y1={0} x2={size * 0.12} y2={50} stroke={C.ink} strokeWidth={5} />
            <line x1={size * 0.7} y1={0} x2={size * 0.78} y2={50} stroke={C.ink} strokeWidth={5} />
          </svg>
          <div
            style={{
              fontFamily: HEAD,
              fontSize: size * 0.2,
              color: C.white,
              background: S.red,
              border: `${OUTLINE}px solid ${C.ink}`,
              borderRadius: 22,
              boxShadow: `0 8px 0 ${C.ink}`,
              textAlign: "center",
              padding: "6px 0 10px",
            }}
          >
            TUTUP 🔒
          </div>
        </div>
      )}
    </div>
  );
};

/** Saklar notifikasi ON -> OFF */
const NotifToggle: React.FC<{ label: string; offAt: number; at: number }> = ({ label, offAt, at }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 13, stiffness: 190 } });
  const off = spring({ frame: (t - offAt) * fps, fps, config: { damping: 14, stiffness: 240 } });
  const on = 1 - off;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        width: 900,
        padding: "22px 30px",
        borderRadius: 40,
        background: C.cream,
        border: `${OUTLINE}px solid ${C.ink}`,
        boxShadow: `0 10px 0 ${C.ink}`,
        scale: String(interpolate(s, [0, 1], [0.4, 1])),
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: 76 }}>{on > 0.5 ? "🔔" : "🔕"}</div>
      <div style={{ flex: 1, fontFamily: BODY, fontWeight: 800, fontSize: 52, color: C.ink, lineHeight: 1.05 }}>
        {label}
        <div style={{ fontSize: 34, opacity: 0.65 }}>{on > 0.5 ? "bunyi terus 24 jam" : "senyap setelah 21.00"}</div>
      </div>
      <div style={{ position: "relative", width: 170, height: 92, borderRadius: 99, border: `6px solid ${C.ink}`, background: on > 0.5 ? C.lime : "#B7B2C6" }}>
        <div
          style={{
            position: "absolute",
            top: 6,
            left: interpolate(off, [0, 1], [84, 6]),
            width: 68,
            height: 68,
            borderRadius: 99,
            background: C.white,
            border: `5px solid ${C.ink}`,
          }}
        />
      </div>
    </div>
  );
};

/** Gelembung chat WhatsApp-ish */
const ChatBubble: React.FC<{ text: string; me?: boolean; at: number; time?: string; size?: number; strike?: number }> = ({ text, me = true, at, time = "22.07", size = 54, strike }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < at - 0.05) return null;
  const s = spring({ frame: (t - at) * fps, fps, config: { damping: 12, stiffness: 220 } });
  const st = strike !== undefined ? interpolate(t, [strike, strike + 0.35], [0, 1], { ...clamp, easing: easeOut }) : 0;
  return (
    <div
      style={{
        position: "relative",
        maxWidth: 620,
        padding: "20px 30px 16px",
        borderRadius: 34,
        borderBottomRightRadius: me ? 8 : 34,
        borderBottomLeftRadius: me ? 34 : 8,
        background: me ? "#D7FFC2" : C.white,
        border: `${OUTLINE}px solid ${C.ink}`,
        boxShadow: `0 10px 0 ${C.ink}`,
        fontFamily: BODY,
        fontWeight: 800,
        fontSize: size,
        color: C.ink,
        lineHeight: 1.08,
        scale: String(interpolate(s, [0, 1], [0.3, 1])),
        transformOrigin: me ? "100% 100%" : "0% 100%",
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
      }}
    >
      {text}
      <div style={{ fontSize: 30, opacity: 0.6, textAlign: "right", marginTop: 4 }}>{time} ✓✓</div>
      {st > 0 && (
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1={4} y1={92} x2={4 + 92 * st} y2={92 - 84 * st} stroke={S.red} strokeWidth={4} strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 16 }} />
        </svg>
      )}
    </div>
  );
};

/** Headset CS di kepala Bang Jo */
const Headset: React.FC<{ size: number }> = ({ size }) => {
  const k = size / 620;
  return (
    <svg width={400 * k} height={360 * k} viewBox="0 0 400 360" style={{ position: "absolute", left: 0, top: -30 * k, overflow: "visible" }}>
      <path d="M70 200 Q70 20 200 20 Q330 20 330 200" fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
      <rect x={40} y={160} width={60} height={100} rx={22} fill={S.violet} {...SV} />
      <rect x={300} y={160} width={60} height={100} rx={22} fill={S.violet} {...SV} />
      <path d="M70 250 Q90 330 180 320" fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      <circle cx={190} cy={318} r={16} fill={C.ink} />
    </svg>
  );
};

/** Gelembung "mengetik…" */
const Typing: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  if (t < at - 0.05) return null;
  return (
    <div style={{ display: "inline-flex", gap: 14, padding: "22px 30px", borderRadius: 40, background: C.white, border: `${OUTLINE}px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}` }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 26, height: 26, borderRadius: 99, background: C.ink, translate: `0px ${-Math.max(0, Math.sin((t - at) * 9 - i * 0.9)) * 14}px` }} />
      ))}
    </div>
  );
};

/* ----------------------------------------------------------------- adegan */
const Ep8Scenes: React.FC = () => {
  const t = useT();
  const cam = useShake([
    { t: 2.53, a: 12 },
    { t: 13.9, a: 24 },
    { t: 46.45, a: 14 },
  ]);
  const shocked = t >= 2.5;
  return (
    <AbsoluteFill style={{ translate: cam }}>
      {/* 1 — rebahan, mau tidur… HP bunyi */}
      <Scene a={0} b={3.17} zoom={false}>
        <Bedroom dark={interpolate(t, [0, 2.3], [0.1, 0.35], clamp)}>
          <div style={{ position: "absolute", left: 0, top: 0 }} />
        </Bedroom>
        <InBed expr={shocked ? "shocked" : "sleepy"} shake={shocked ? 6 : 0} glow={shocked ? 1 : 0} sitUp={interpolate(t, [2.5, 2.8], [0, 1], { ...clamp, easing: easeOut })} />
        <Zzz x={250} y={640} until={2.4} />
        <Sticker at={0.1} out={2.3} y={300} bg={C.cream} size={62}>
          JAM 22.00 · UDAH REBAHAN 😴
        </Sticker>
        <Pop at={2.4} x={640} y={420} from="bottom">
          <Phone w={290} time="22.07" buzz={[2.45, 2.85]} rotate={8} />
        </Pop>
        <Sticker at={2.5} y={300} bg={S.red} color={C.white} size={78} rotate={3}>
          DRRRT! 📳
        </Sticker>
      </Scene>

      {/* 2 — notif kantor & kelas, deg-degan */}
      <Scene a={3.17} b={9.9}>
        <div style={{ position: "absolute", left: 330, top: 330 }}>
          <Phone
            w={400}
            time="22.07"
            buzz={[3.2, 5.6]}
            notifs={[
              { app: "Grup Kantor", title: "Pak Bos", text: "Tolong dicek ya, besok pagi 🙏", at: 3.2 },
              { app: "Grup Kelas", title: "Ketua Kelas", text: "Tugas dikumpulin jam 7!! 📚", color: "#FFB020", at: 5.6 },
              { app: "Grup Kantor", title: "Pak Bos", text: "Udah dibaca kan? 👀", at: 8.9 },
            ]}
          />
        </div>
        <div style={{ position: "absolute", left: -40, top: 620 }}>
          <Worker size={540} expr={t > 8.1 ? "dizzy" : "shocked"} pose="coverEars" shirt="#3FA7A0" pants="#2E3557" seed={2} shake={t > 7.0 && t < 8.1 ? 8 : 0} />
        </div>
        <Pop at={7.05} x={770} y={600}>
          <Heart at={7.05} size={230} />
        </Pop>
        <Sticker at={8.17} y={1090} bg={ACC} color={C.white} size={58} rotate={-2}>
          PADAHAL CUMA 1 NOTIF 🙃
        </Sticker>
      </Scene>

      {/* 3 — scanner: ada yang ngikutin sampai ke kasur */}
      <Scene a={9.9} b={13.88}>
        <Bedroom dark={interpolate(t, [9.9, 10.4], [0.3, 0.6], clamp)} />
        <InBed expr="sleepy" glow={0.6} />
        <Scanner at={10.35} dur={0.9} top={330} height={850}>
          <div style={{ position: "absolute", left: 600, top: 520, rotate: "10deg" }}>
            <SiHalus size={340} variant="burnout" mood="grin" />
          </div>
        </Scanner>
        <Sticker at={11.7} y={300} bg={C.bg1} color={ACC} size={66}>
          NGIKUTIN SAMPAI KE KASUR 👻
        </Sticker>
      </Scene>

      {/* 4 — judul */}
      <Scene a={13.88} b={15.56}>
        <div style={{ position: "absolute", left: 270, top: 340 }}>
          <Pop at={13.9}>
            <SiHalus size={600} variant="burnout" mood="laugh" />
          </Pop>
        </div>
        <Pop at={14.0} x={60} y={420}>
          <Clock size={230} speed={6} time={10} />
        </Pop>
        <Sticker at={14.2} y={960} bg={ACC} color={C.white} size={70} rotate={-4}>
          {"SI HALUS:\nSTRES TANPA JAM PULANG ⏰"}
        </Sticker>
      </Scene>

      {/* 5 — telepressure */}
      <Scene a={15.56} b={20.29}>
        <Sticker at={15.6} y={300} bg={C.cyan} size={78}>
          TELEPRESSURE 📲
        </Sticker>
        <Pop at={16.53} x={70} y={470}>
          <div
            style={{
              width: 940,
              boxSizing: "border-box",
              padding: "28px 36px 30px",
              borderRadius: 40,
              background: C.cream,
              border: `${OUTLINE}px solid ${C.ink}`,
              boxShadow: `0 14px 0 ${C.ink}`,
              fontFamily: BODY,
              fontWeight: 800,
              color: C.ink,
            }}
          >
            <div style={{ fontSize: 58, lineHeight: 1.08 }}>
              Dorongan buat <span style={{ background: C.lime, padding: "0 10px", borderRadius: 10 }}>langsung bales</span> pesan kerja…
              <span style={{ color: S.red }}> kapan pun.</span>
            </div>
            <div style={{ fontSize: 32, opacity: 0.6, marginTop: 12 }}>Barber & Santuzzi, 2015</div>
          </div>
        </Pop>
        <Pop at={17.5} x={80} y={830}>
          <Clock size={230} time={23.78} speed={0.02} />
        </Pop>
        <Pop at={18.1} x={350} y={880}>
          <Typing at={18.1} />
        </Pop>
        <Pop at={19.5} x={640} y={840}>
          <div style={{ fontFamily: HEAD, fontSize: 66, color: C.cream, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill", rotate: "6deg" }}>
            23.47 🌙
          </div>
        </Pop>
      </Scene>

      {/* 6 — akibatnya: tidur jelek, gampang burnout */}
      <Scene a={20.29} b={23.51}>
        <Sticker at={20.32} y={300} bg={C.cream} size={64}>
          ORANG YANG KAYAK GINI… 👇
        </Sticker>
        <div style={{ position: "absolute", left: 80, top: 480, display: "flex", flexDirection: "column", gap: 34 }}>
          <Row at={21.26} icon="😵‍💫" label="Tidur lebih jelek" sub="otak masih 'siaga'" color={S.blue} />
          <Row at={22.66} icon="🔥" label="Gampang burnout" sub="capek numpuk tiap hari" color={C.orange} />
        </div>
        <Pop at={22.9} x={720} y={840}>
          <SiHalus size={260} variant="burnout" mood="laugh" />
        </Pop>
      </Scene>

      {/* 7 — burnout diakui WHO: 3 tanda */}
      <Scene a={23.51} b={32.59}>
        <Sticker at={23.55} y={300} bg={C.lime} size={66}>
          BURNOUT = DIAKUI WHO 🩺
        </Sticker>
        <Pop at={24.9} x={240} y={420}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 38, color: C.cream, background: "rgba(0,0,0,0.4)", padding: "6px 24px", borderRadius: 999, border: `4px solid ${C.lime}` }}>
            fenomena kerja · ICD-11
          </div>
        </Pop>
        <Pop at={25.56} x={470} y={505}>
          <div style={{ fontFamily: HEAD, fontSize: 52, color: C.yellow, WebkitTextStroke: `9px ${C.ink}`, paintOrder: "stroke fill" }}>3 TANDA:</div>
        </Pop>
        <div style={{ position: "absolute", left: 80, top: 590, display: "flex", flexDirection: "column", gap: 26 }}>
          <Row at={26.44} icon="🪫" label="Capek nggak ilang" sub="walau udah tidur" color={S.red} />
          <Row at={28.4} icon="😒" label="Sinis sama kerjaan" sub="“ah, bodo amat”" color={C.yellow} />
          <Row at={29.9} icon="📉" label="Ngerasa nggak ada hasil" sub="sekeras apa pun kerja" color={S.blue} />
        </div>
      </Scene>

      {/* 8 — 43% pekerja Indonesia */}
      <Scene a={32.59} b={37.53}>
        <Sticker at={32.62} y={300} bg={C.cream} size={64}>
          🇮🇩 SURVEI 2025
        </Sticker>
        <BigStat at={35.03} from={0} to={43} dur={0.9} suffix="%" label="pekerja ngaku burnout" y={470} color={S.red} />
        <Pop at={35.9} x={0} y={860} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", gap: 14 }}>
            {new Array(10).fill(0).map((_, i) => (
              <div key={i} style={{ fontSize: 64, opacity: i < 4 ? 1 : 0.3, filter: i < 4 ? undefined : "grayscale(1)" }}>
                {i < 4 ? "🥵" : "🙂"}
              </div>
            ))}
          </div>
        </Pop>
        <Pop at={36.45} x={250} y={990}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 36, color: C.cream, opacity: 0.85 }}>Jobstreet by SEEK · Workplace Happiness 2025</div>
        </Pop>
      </Scene>

      {/* 9 — lembur terus: WHO/ILO 55 jam → stroke +35% */}
      <Scene a={37.53} b={45.65}>
        <Sticker at={37.56} y={300} bg={C.orange} size={68}>
          LEMBUR TERUS-TERUSAN? ⏰
        </Sticker>
        <Pop at={37.9} out={39.4} x={140} y={470}>
          <Clock size={300} speed={9} time={18} />
        </Pop>
        <Pop at={38.1} out={39.4} x={520} y={460}>
          <Worker size={480} expr="dizzy" pose="idle" shirt="#5B6BD8" pants="#2E3557" tie seed={5} />
        </Pop>
        <Pop at={39.59} x={330} y={420}>
          <div style={{ fontFamily: HEAD, fontSize: 64, color: C.ink, background: C.cyan, padding: "8px 32px 12px", borderRadius: 999, border: `${OUTLINE}px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}` }}>
            WHO + ILO 🌏
          </div>
        </Pop>
        <Pop at={41.33} x={50} y={570}>
          <InfoCard title="Kerja" value="≥55 JAM" sub="per minggu" color={C.yellow} w={470} valueSize={100} />
        </Pop>
        <Pop at={42.4} x={505} y={690}>
          <div style={{ fontFamily: HEAD, fontSize: 110, color: C.cream, WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill" }}>→</div>
        </Pop>
        <Pop at={43.38} x={570} y={570}>
          <InfoCard title="Risiko stroke" value="+35%" sub="vs 35–40 jam" color={S.red} w={460} valueSize={120} />
        </Pop>
        <Pop at={44.4} x={220} y={1010}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 34, color: C.cream, opacity: 0.85 }}>WHO/ILO · Environment International, 2021</div>
        </Pop>
      </Scene>

      {/* 10 — ratusan ribu meninggal */}
      <Scene a={45.65} b={48.5}>
        <AbsoluteFill style={{ background: "rgba(0,0,0,0.35)" }} />
        <Sticker at={45.68} y={300} bg={C.cream} size={60}>
          DALAM SETAHUN… 🕯️
        </Sticker>
        <BigStat at={46.45} from={0} to={745000} dur={1.1} label="meninggal (stroke + jantung)" y={500} color={C.cream} />
        <Pop at={47.4} x={300} y={870}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 40, color: C.cream, background: "rgba(0,0,0,0.45)", padding: "8px 26px", borderRadius: 999 }}>
            data tahun 2016 · WHO/ILO
          </div>
        </Pop>
      </Scene>

      {/* 11 — tips: jam tutup + matiin notif */}
      <Scene a={48.5} b={52.74}>
        <Sticker at={48.52} y={300} bg={C.lime} size={72}>
          TERUS GIMANA? 💡
        </Sticker>
        <Pop at={49.37} out={50.35} x={390} y={430}>
          <Clock size={300} time={9} closed closedAt={49.75} />
        </Pop>
        <Pop at={49.4} out={50.35} x={260} y={940}>
          <div style={{ fontFamily: HEAD, fontSize: 80, color: C.cream, WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill" }}>BIKIN JAM TUTUP</div>
        </Pop>
        <Pop at={50.45} x={90} y={520}>
          <NotifToggle at={50.45} offAt={51.6} label="Grup Kantor & Kelas" />
        </Pop>
        <Pop at={51.7} x={260} y={810}>
          <div style={{ fontFamily: HEAD, fontSize: 70, color: C.ink, background: C.lime, padding: "10px 34px 14px", borderRadius: 30, border: `${OUTLINE}px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}`, rotate: "-3deg" }}>
            SETELAH 21.00 🔕
          </div>
        </Pop>
      </Scene>

      {/* 12 — bales besok pagi + atasan/ketua kelas: jadwalin */}
      <Scene a={52.74} b={59.45}>
        <Sticker at={52.78} out={54.6} y={300} bg={C.cream} size={62}>
          BILANG BAIK-BAIK 😊
        </Sticker>
        <Pop at={53.0} out={54.6} x={40} y={560}>
          <Worker size={520} expr="happy" pose="wave" shirt="#3FA7A0" pants="#2E3557" seed={2} />
        </Pop>
        <Pop at={53.6} out={54.6} x={400} y={470}>
          <ChatBubble at={53.6} text="Aku bales besok pagi, ya 🙏" time="21.05" size={54} />
        </Pop>
        <Sticker at={54.73} y={300} bg={C.yellow} size={60}>
          BUAT ATASAN & KETUA KELAS 👔🎒
        </Sticker>
        <Pop at={56.6} x={120} y={470}>
          <ChatBubble at={56.6} me={false} text="Tugas baru, kumpulin besok!" time="22.00" size={52} strike={57.6} />
        </Pop>
        <Pop at={58.41} x={180} y={720} from="right">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "20px 34px",
              borderRadius: 36,
              background: C.lime,
              border: `${OUTLINE}px solid ${C.ink}`,
              boxShadow: `0 10px 0 ${C.ink}`,
              fontFamily: BODY,
              fontWeight: 800,
              color: C.ink,
            }}
          >
            <span style={{ fontSize: 76 }}>🕖</span>
            <div style={{ lineHeight: 1.05 }}>
              <div style={{ fontFamily: HEAD, fontSize: 64 }}>JADWALIN AJA ✅</div>
              <div style={{ fontSize: 38 }}>kirim otomatis jam 07.00</div>
            </div>
          </div>
        </Pop>
      </Scene>

      {/* 13 — gag: manusia, bukan CS 24 jam; hantu kabur */}
      <Scene a={59.45} b={EP8.endStart}>
        <Pop at={59.5} x={90} y={470}>
          <div style={{ position: "relative" }}>
            <Worker size={560} expr={t > 60.9 ? "smirk" : "dizzy"} pose={t > 60.9 ? "shrug" : "idle"} shirt="#3FA7A0" pants="#2E3557" seed={2} />
            {t < 61.6 && (
              <div style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(t, [61.2, 61.6], [1, 0], clamp), translate: `0px ${interpolate(t, [61.2, 61.6], [0, -120], { ...clamp, easing: easeInOut })}px` }}>
                <Headset size={560} />
              </div>
            )}
          </div>
        </Pop>
        <Pop at={59.9} x={480} y={460}>
          <div
            style={{
              position: "relative",
              fontFamily: HEAD,
              fontSize: 64,
              lineHeight: 1.05,
              color: C.white,
              background: S.blue,
              padding: "16px 30px 20px",
              borderRadius: 30,
              border: `${OUTLINE}px solid ${C.ink}`,
              boxShadow: `0 10px 0 ${C.ink}`,
              rotate: "4deg",
              textAlign: "center",
            }}
          >
            ☎️ CS 24 JAM
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <line x1={0} y1={100} x2={interpolate(t, [61.0, 61.35], [0, 100], clamp)} y2={100 - interpolate(t, [61.0, 61.35], [0, 100], clamp)} stroke={S.red} vectorEffect="non-scaling-stroke" strokeWidth={16} strokeLinecap="round" />
            </svg>
          </div>
        </Pop>
        <Pop at={61.1} x={640} y={700}>
          <div style={{ translate: `${interpolate(t, [61.9, 62.7], [0, 520], { ...clamp, easing: easeInOut })}px ${interpolate(t, [61.9, 62.7], [0, -160], clamp)}px` }}>
            <SiHalus size={260} variant="burnout" mood={t > 61.5 ? "busted" : "grin"} />
          </div>
        </Pop>
        <Sticker at={60.92} y={1060} bg={C.lime} size={60} rotate={-2}>
          KAMU MANUSIA, BUKAN CS 😤
        </Sticker>
      </Scene>
    </AbsoluteFill>
  );
};

export const Ep8: React.FC = () => (
  <Episode ep={8} accent={S.violet} tint="#231A4E" words={words} endStart={EP8.endStart} revealAt={EP8.revealAt} flashes={[13.88, 46.45]}>
    <Ep8Scenes />
  </Episode>
);
