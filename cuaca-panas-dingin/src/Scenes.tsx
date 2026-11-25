import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption, Pill } from "./Caption";
import { FONT } from "./fonts";
import {
  Bolt,
  Calendar,
  DelayBar,
  IconBottle,
  IconPhone,
  IconTreeNo,
  IconUmbrella,
  IconWarning,
  Ring,
  Thermometer,
  useSpringIn,
} from "./Graphics";
import { beatPulse, clamp, easeInOut, easeOut } from "./timeline";
import { CloudShape, Rain, Sun } from "./Weather";

const ICE_BG = "#7FD3FF";
const ICE_FG = "#06243F";

const Center: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  y,
  children,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      top: y,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

const useOut = (dur: number, len = 10) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(frame, [dur * fps - len, dur * fps], [0, 1], { ...clamp, easing: easeOut });
};

const BigNumber: React.FC<{
  value: string;
  size?: number;
  color?: string;
  glow?: string;
  shiver?: boolean;
  slamFrom?: number;
}> = ({ value, size = 360, color = "#fff", glow = "rgba(255,90,20,0.8)", shiver, slamFrom = 1.9 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 10, stiffness: 220, mass: 0.8 } });
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: -size * 0.05,
        color,
        textShadow: `0 14px 0 rgba(0,0,0,0.22), 0 0 90px ${glow}`,
        scale: String(interpolate(s, [0, 1], [slamFrom, 1])),
        opacity: interpolate(frame, [0, 3], [0, 1], clamp),
        translate: shiver ? `${Math.sin(frame * 2.3) * 7}px 0px` : undefined,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {value}
    </div>
  );
};

/* 0 - 1.8  HOOK: panas */
export const HookHot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(1.8, 6);
  const n = Math.round(interpolate(frame, [0, 0.45 * fps], [29, 35], { ...clamp, easing: easeOut }));
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Center y={520}>
        <Pill>☀ Siang ini</Pill>
      </Center>
      <Center y={640}>
        <BigNumber value={`${n}°C`} />
      </Center>
      <Sequence from={Math.round(0.35 * fps)} layout="none">
        <Caption text="rasanya kayak / [dipanggang]" dur={1.45} size={92} y={1060} stagger={3} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* 1.8 - 3.6  HOOK: tiba-tiba dingin */
export const HookCold: React.FC = () => {
  const { fps } = useVideoConfig();
  const out = useOut(1.8, 6);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Center y={520}>
        <Pill bg="#DDF1FF" color="#0B3A6B">
          ☁ Sorenya
        </Pill>
      </Center>
      <Center y={640}>
        <BigNumber value="25°C" color="#EAF7FF" glow="rgba(110,200,255,0.9)" shiver slamFrom={0.4} />
      </Center>
      <Sequence from={Math.round(0.25 * fps)} layout="none">
        <Caption
          text="kok malah / [menggigil?]"
          dur={1.55}
          size={92}
          y={1060}
          stagger={3}
          hlBg={ICE_BG}
          hlColor={ICE_FG}
          shiver
        />
      </Sequence>
    </AbsoluteFill>
  );
};

/* 3.6 - 6 */
export const HookLabil: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Caption text="Bukan perasaan / kamu doang." dur={2.4} size={108} y={620} />
      <Sequence from={Math.round(1.0 * fps)} layout="none">
        <Caption text="Cuaca lagi / [labil parah.]" dur={1.4} size={108} y={930} stagger={5} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* 6 - 10 */
export const SceneNov: React.FC = () => {
  const out = useOut(4);
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Center y={400} style={{ opacity: 1 - out }}>
        <Calendar month="NOV" day="25" />
      </Center>
      <Sequence from={Math.round(0.3 * fps)} layout="none">
        <Caption text="Akhir November / harusnya udah / [musim hujan] kan?" dur={3.7} size={96} y={860} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* 10 - 14 */
export const SceneFakta: React.FC = () => {
  const out = useOut(4);
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Caption text="Faktanya, baru" dur={4} size={88} y={380} />
      <Center y={520} style={{ opacity: 1 - out, scale: String(1 - 0.1 * out) }}>
        <Ring value={18} size={470} />
      </Center>
      <Sequence from={Math.round(0.9 * fps)} layout="none">
        <Caption
          text="zona musim di Indonesia / yang [udah masuk] / musim hujan."
          dur={3.1}
          size={72}
          y={1040}
          stagger={3}
        />
      </Sequence>
      <Sequence from={Math.round(1.6 * fps)} layout="none">
        <Caption text="Data BMKG, per 23 Nov 2026" dur={2.4} size={36} y={1345} weight={600} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* 14 - 18 */
export const SceneElNino: React.FC = () => {
  const out = useOut(4);
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Caption text="Biang keroknya: / [El Niño] lagi kuat." dur={4} size={104} y={400} />
      <Sequence from={Math.round(0.5 * fps)} layout="none">
        <Center y={860} style={{ opacity: 1 - out }}>
          <DelayBar />
        </Center>
      </Sequence>
      <Sequence from={Math.round(2.7 * fps)} layout="none">
        <Caption
          text="BMKG: awal musim hujan mundur 20–30 hari"
          dur={1.3}
          size={38}
          y={1200}
          weight={700}
          stagger={1}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

/* 18 - 22 */
export const SceneKenapa: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Caption text="Terus kok sorenya / bisa hujan [deres?]" dur={2} size={100} y={680} />
      <Sequence from={Math.round(2 * fps)} layout="none">
        <Caption text="Jawabannya justru / si [panas siang] itu." dur={2} size={100} y={680} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* 22 - 25.75 : diagram konveksi */
export const SceneDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const grow = interpolate(t, [0.8, 3.0], [0.15, 1], { ...clamp, easing: easeOut });
  const dark = interpolate(t, [1.6, 3.6], [0, 1], clamp);
  const cloudCol = interpolateColors(dark, [0, 1], ["#FFFFFF", "#4A5A74"]);
  const cloudCol2 = interpolateColors(dark, [0, 1], ["#F1F4F8", "#36445C"]);
  const out = useOut(3.75, 8);
  const buildings = [
    [60, 120], [150, 190], [250, 140], [330, 230], [440, 160], [520, 260], [630, 150], [720, 210], [820, 130], [900, 180],
  ];
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      {/* awan kumulonimbus tumbuh */}
      <div
        style={{
          position: "absolute",
          left: 540 - 380,
          top: 330,
          width: 760,
          height: 420,
          scale: String(grow),
          transformOrigin: "50% 100%",
        }}
      >
        <CloudShape w={560} color={cloudCol2} style={{ position: "absolute", left: 100, top: 0 }} />
        <CloudShape w={760} color={cloudCol} style={{ position: "absolute", left: 0, top: 120 }} />
      </div>
      {/* panah udara naik */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[260, 540, 820].map((x, i) => {
          const p = interpolate(t, [0.2 + i * 0.15, 1.4 + i * 0.15], [0, 1], { ...clamp, easing: easeInOut });
          const y0 = 1120;
          const y1 = 800;
          let d = `M ${x} ${y0}`;
          for (let yy = y0; yy >= y1; yy -= 10) d += ` L ${x + Math.sin((yy + t * 300) / 40) * 22} ${yy}`;
          const L = 420;
          return (
            <g key={x} opacity={interpolate(p, [0, 0.1], [0, 1], clamp)}>
              <path d={d} stroke="#FFF3D0" strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} />
              <path
                d={`M ${x - 34} ${y1 + 40} L ${x} ${y1 - 6} L ${x + 34} ${y1 + 40}`}
                stroke="#FFF3D0"
                strokeWidth={14}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={interpolate(p, [0.85, 1], [0, 1], clamp)}
              />
            </g>
          );
        })}
        {/* kota */}
        {buildings.map(([x, h], i) => (
          <rect key={i} x={x - 40} y={1260 - h} width={84} height={h} rx={6} fill="rgba(60,25,20,0.55)" />
        ))}
        <rect x={0} y={1255} width={1080} height={30} fill="rgba(60,25,20,0.55)" />
      </svg>
      <Center y={1140}>
        <Pill delay={10} bg="#FF5A3C" color="#fff" size={40}>
          Panas + lembap
        </Pill>
      </Center>
      <div style={{ position: "absolute", left: 600, top: 880 }}>
        <Pill delay={50} bg="#fff" color="#E8431A" size={40}>
          Naik ↑
        </Pill>
      </div>
      <Center y={300}>
        <Pill delay={130} bg="#1C2B45" color="#DDF1FF" size={40}>
          Awan hujan raksasa
        </Pill>
      </Center>
      <Caption
        text="Udara panas & lembap naik, / numpuk jadi [awan hujan.]"
        dur={3.75}
        size={66}
        y={1330}
        stagger={3}
      />
    </AbsoluteFill>
  );
};

/* 25.75 - 26 */
export const SceneBlackout: React.FC = () => (
  <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 80, color: "rgba(255,255,255,0.85)" }}>dan…</div>
  </AbsoluteFill>
);

/* 26 - 28 */
export const SceneBoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bolt = interpolate(frame, [0, 7], [0, 1], clamp);
  const boltO = interpolate(frame, [0, 18, 26, 30, 34, 60], [1, 1, 0.2, 1, 0.9, 0], clamp);
  const s = spring({ frame: frame - 2, fps, config: { damping: 9, stiffness: 260 } });
  const out = useOut(2, 8);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Bolt progress={bolt} style={{ position: "absolute", left: 300, top: 120, opacity: boltO }} />
      <Center y={600}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 250,
            letterSpacing: -10,
            color: "#fff",
            textShadow: "0 14px 0 rgba(0,0,0,0.3), 0 0 120px rgba(120,200,255,0.95)",
            scale: String(interpolate(s, [0, 1], [2.4, 1])),
            opacity: interpolate(frame, [2, 5], [0, 1], clamp),
            rotate: "-4deg",
          }}
        >
          DUARR!
        </div>
      </Center>
      <Sequence from={Math.round(0.6 * fps)} layout="none">
        <Caption text="Sorenya / [berubah total.]" dur={1.4} size={96} y={1000} hlBg={ICE_BG} hlColor={ICE_FG} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* 28 - 33 */
export const SceneAnjlok: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const temp = interpolate(frame, [0.3 * fps, 2.2 * fps], [35, 25], { ...clamp, easing: easeInOut });
  const inS = useSpringIn(0, 14);
  const out = useOut(5);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 400,
          opacity: (1 - out) * inS,
          translate: `${interpolate(inS, [0, 1], [-200, 0])}px 0px`,
        }}
      >
        <Thermometer temp={temp} h={640} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 380,
          top: 460,
          width: 620,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: 1 - out,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 300,
            letterSpacing: -14,
            lineHeight: 1,
            color: interpolateColors(temp, [25, 35], ["#E6F6FF", "#FFE2C8"]),
            textShadow: "0 14px 0 rgba(0,0,0,0.25)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {Math.round(temp)}°
        </div>
        <div style={{ marginTop: 30, opacity: interpolate(frame, [1.6 * fps, 2 * fps], [0, 1], clamp) }}>
          <Pill bg={ICE_BG} color={ICE_FG} size={44} delay={Math.round(1.6 * fps)}>
            ↓ hampir 10°C
          </Pill>
        </div>
      </div>
      <Caption text="Hujan deres, / angin dingin." dur={2.5} size={100} y={1110} hlBg={ICE_BG} hlColor={ICE_FG} />
      <Sequence from={Math.round(2.5 * fps)} layout="none">
        <Caption
          text="Suhu bisa [anjlok] / cuma dalam / beberapa jam."
          dur={2.5}
          size={84}
          y={1110}
          hlBg={ICE_BG}
          hlColor={ICE_FG}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

/* 33 - 40 */
export const SceneAlert: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const inS = useSpringIn(0, 13);
  const out = useOut(7);
  const chips = ["Aceh", "Sumbar", "Jabar", "Kalbar", "+8 lainnya"];
  return (
    <AbsoluteFill>
      <Center y={400}>
        <div
          style={{
            width: 920,
            padding: "50px 50px 56px",
            borderRadius: 52,
            background: "rgba(8,16,34,0.74)",
            border: "5px solid #FFC531",
            boxShadow: "0 24px 0 rgba(0,0,0,0.25), 0 0 80px rgba(255,197,49,0.25)",
            fontFamily: FONT,
            color: "#fff",
            scale: String(interpolate(inS, [0, 1], [0.6, 1]) * (1 - 0.08 * out)),
            opacity: interpolate(inS, [0, 0.3], [0, 1], clamp) * (1 - out),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 26,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ scale: String(1 + 0.12 * beatPulse(t)) }}>
              <IconWarning size={96} />
            </div>
            <div style={{ fontWeight: 900, fontSize: 54, letterSpacing: 3, color: "#FFC531" }}>PERINGATAN BMKG</div>
          </div>
          <div
            style={{
              fontWeight: 900,
              fontSize: 170,
              letterSpacing: 4,
              lineHeight: 1,
              padding: "16px 50px 22px",
              borderRadius: 30,
              background: "linear-gradient(180deg,#FF8A1F,#FF4D1F)",
              boxShadow: "0 12px 0 rgba(0,0,0,0.25)",
              scale: String(spring({ frame: frame - 12, fps, config: { damping: 9, stiffness: 220 } })),
            }}
          >
            SIAGA
          </div>
          <div style={{ fontWeight: 800, fontSize: 60, textAlign: "center", lineHeight: 1.15 }}>
            hujan lebat di
            <br />
            <span style={{ fontWeight: 900, fontSize: 112, color: "#FFE14D" }}>12 provinsi</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 38, opacity: 0.85 }}>Periode 24–26 Nov 2026</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 6 }}>
            {chips.map((c, i) => {
              const s = spring({ frame: frame - Math.round((2.6 + i * 0.12) * fps), fps, config: { damping: 12, stiffness: 220 } });
              return (
                <div
                  key={c}
                  style={{
                    padding: "12px 26px",
                    borderRadius: 999,
                    background: i === chips.length - 1 ? "rgba(255,255,255,0.15)" : "#fff",
                    color: i === chips.length - 1 ? "#fff" : "#0B1E3F",
                    fontWeight: 800,
                    fontSize: 38,
                    scale: String(s),
                  }}
                >
                  {c}
                </div>
              );
            })}
          </div>
        </div>
      </Center>
      <Sequence from={Math.round(4.4 * fps)} layout="none">
        <Caption text="Daerahmu [termasuk?]" dur={2.6} size={84} y={1420} hlBg="#FFC531" />
      </Sequence>
    </AbsoluteFill>
  );
};

const TipCard: React.FC<{ n: string; icon: React.ReactNode; text: string }> = ({ n, icon, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14, stiffness: 160 } });
  const out = interpolate(frame, [3 * fps - 12, 3 * fps], [0, 1], { ...clamp, easing: easeInOut });
  return (
    <AbsoluteFill
      style={{
        translate: `${interpolate(s, [0, 1], [700, 0]) - out * 900}px 0px`,
        rotate: `${interpolate(s, [0, 1], [8, 0]) - out * 6}deg`,
      }}
    >
      <Center y={500}>
        <div style={{ position: "relative", width: 560, height: 400, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              position: "absolute",
              left: -110,
              top: -60,
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 200,
              letterSpacing: -8,
              color: "transparent",
              WebkitTextStroke: "5px rgba(255,255,255,0.75)",
            }}
          >
            {n}
          </div>
          <div style={{ position: "absolute", left: 160, top: 10 }}>{icon}</div>
        </div>
      </Center>
      <Caption text={text} dur={3} size={text.includes("baliho") ? 80 : 88} y={930} hlBg="#7FD3FF" hlColor="#06243F" stagger={3} />
    </AbsoluteFill>
  );
};

/* 40 - 52 */
export const SceneTips: React.FC = () => {
  const { fps } = useVideoConfig();
  const out = useOut(12);
  const tips = [
    { n: "01", icon: <IconUmbrella size={360} />, text: "Bawa [payung] / + jaket tipis. / Dua-duanya." },
    { n: "02", icon: <IconBottle size={360} />, text: "Minum terus, / jangan nunggu [haus.]" },
    { n: "03", icon: <IconTreeNo size={360} />, text: "Angin kencang? / Jangan neduh di bawah / [pohon] atau [baliho.]" },
    { n: "04", icon: <IconPhone size={360} />, text: "Cek [InfoBMKG] / sebelum berangkat." },
  ];
  return (
    <AbsoluteFill>
      <Center y={340} style={{ opacity: 1 - out }}>
        <Pill bg="#FFE14D" color="#1A1206" size={46}>
          Biar nggak tumbang
        </Pill>
      </Center>
      {tips.map((tp, i) => (
        <Sequence key={tp.n} from={i * 3 * fps} durationInFrames={3 * fps} layout="none" name={`Tips ${tp.n}`}>
          <TipCard {...tp} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* 52 - 56 */
export const SceneIntinya: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Caption text="Intinya, siang panas / sore hujan itu [wajar] / pas peralihan musim." dur={2.3} size={88} y={620} />
      <Sequence from={Math.round(2.3 * fps)} layout="none">
        <Caption text="Yang penting, / [kamu siap.]" dur={1.7} size={126} y={720} stagger={5} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* 56 - 60 : CTA split panas | hujan */
export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const open = spring({ frame, fps, config: { damping: 16, stiffness: 140 } });
  const choice = (side: "L" | "R", emoji: string, label: string, bg: string, color: string, delay: number) => {
    const s = spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 200 } });
    const beat = Math.floor(t / 0.5) % 2 === (side === "L" ? 0 : 1) ? beatPulse(t) : 0;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          scale: String(s * (1 + 0.07 * beat)),
        }}
      >
        <div style={{ fontSize: 200, lineHeight: 1 }}>{emoji}</div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 70,
            letterSpacing: 3,
            padding: "14px 40px 18px",
            borderRadius: 999,
            background: bg,
            color,
            boxShadow: "0 10px 0 rgba(0,0,0,0.25)",
          }}
        >
          {label}
        </div>
      </div>
    );
  };
  const arrowY = Math.abs(Math.sin(t * Math.PI * 2)) * 18;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          clipPath: "polygon(0 0, 58% 0, 42% 100%, 0 100%)",
          translate: `${interpolate(open, [0, 1], [-1080, 0])}px 0px`,
          background: "linear-gradient(180deg,#FF4A1C 0%,#FF8A26 55%,#FFD45E 100%)",
        }}
      >
        <Sun x={170} y={1760} r={110} opacity={1} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          clipPath: "polygon(58% 0, 100% 0, 100% 100%, 42% 100%)",
          translate: `${interpolate(open, [0, 1], [1080, 0])}px 0px`,
          background: "linear-gradient(180deg,#060F26 0%,#14305A 52%,#3D6A99 100%)",
        }}
      >
        <Rain amount={0.8} />
      </AbsoluteFill>
      <Caption text="Di tempatmu / sekarang?" dur={4.2} size={124} y={300} />
      <div
        style={{
          position: "absolute",
          top: 700,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          padding: "0 40px",
        }}
      >
        {choice("L", "🥵", "PANAS", "#FFFFFF", "#E8431A", 12)}
        {choice("R", "🌧️", "HUJAN", "#7FD3FF", "#06243F", 20)}
      </div>
      <Sequence from={Math.round(0.9 * fps)} layout="none">
        <Caption text="Jawab di komen" dur={3.3} size={84} y={1240} />
        <Center y={1360}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 90,
              color: "#fff",
              translate: `0px ${arrowY}px`,
              textShadow: "0 6px 0 rgba(0,0,0,0.3)",
            }}
          >
            ↓
          </div>
        </Center>
      </Sequence>
    </AbsoluteFill>
  );
};
