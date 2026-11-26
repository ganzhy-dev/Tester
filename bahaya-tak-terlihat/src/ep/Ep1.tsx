import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeInOut, easeOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode } from "../Episode";
import { BigStat, Pop, Scanner, Sticker, useShake } from "../Kit";
import { Badge, Bubble, CheckRow, InfoCard, Room, Table, Zzz } from "../Props";
import { words } from "./ep1.words";
import { warp } from "./ep1.warp";

/** Semua waktu = detik absolut pada voice-over EP1 (lihat data/ep1_words.json) */
/** Adegan ditulis dalam detik VO lama; `warp` memetakannya ke VO baru (Adrianleoh) */
export const EP1 = { dur: 62.9, endStart: 58.06, revealAt: 60.4 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

/** Tampilkan anak hanya di [a, b) + transisi masuk/keluar cepat */
export const Scene: React.FC<{ a: number; b: number; children: React.ReactNode; zoom?: boolean }> = ({ a, b, children, zoom = true }) => {
  const t = useT();
  if (t < a - 0.02 || t >= b) return null;
  const inP = interpolate(t, [a, a + 0.18], [0, 1], { ...clamp, easing: easeOut });
  const outP = interpolate(t, [b - 0.12, b], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: inP * (1 - outP),
        scale: String((zoom ? interpolate(inP, [0, 1], [1.08, 1]) : 1) * (1 + 0.012 * (t - a))),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const BOSS = { shirt: "#5B6275", hair: "#B8BDD0", tie: true } as const;

const Whiteboard: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={420} height={290} style={{ position: "absolute", left: x, top: y }}>
    <rect x={4} y={4} width={412} height={260} rx={18} fill="#F4F1FF" stroke={C.ink} strokeWidth={OUTLINE} />
    <path d="M40 80 L130 120 L210 110 L300 200 L380 230" fill="none" stroke={C.pink} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={40} y={170} width={50} height={70} fill={C.cyan} stroke={C.ink} strokeWidth={4} />
    <rect x={110} y={200} width={50} height={40} fill={C.cyan} stroke={C.ink} strokeWidth={4} />
    <line x1={60} y1={280} x2={360} y2={280} stroke={C.ink} strokeWidth={OUTLINE} />
  </svg>
);

const Door: React.FC<{ x: number; y: number; closeAt: number }> = ({ x, y, closeAt }) => {
  const t = useT();
  const open = interpolate(t, [closeAt, closeAt + 0.35], [1, 0], { ...clamp, easing: easeInOut });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 190, height: 380, background: "#140B24", border: `${OUTLINE}px solid ${C.ink}`, borderRadius: 14, perspective: 900 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#9A6B45",
          border: `${OUTLINE}px solid ${C.ink}`,
          borderRadius: 10,
          transformOrigin: "0% 50%",
          rotate: `y ${-70 * open}deg`,
        }}
      >
        <div style={{ position: "absolute", right: 22, top: 190, width: 22, height: 22, borderRadius: "50%", background: C.yellow, border: `4px solid ${C.ink}` }} />
      </div>
    </div>
  );
};

/** Kabut CO₂ yang menumpuk */
const Haze: React.FC<{ from: number; to: number; max?: number }> = ({ from, to, max = 0.55 }) => {
  const t = useT();
  const o = interpolate(t, [from, to], [0, max], clamp);
  return <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(185,166,255,0.9), rgba(142,118,240,0.5) 60%, rgba(142,118,240,0))", opacity: o }} />;
};

const Bubbles: React.FC<{ x: number; y: number; from: number; seed: number }> = ({ x, y, from, seed }) => {
  const t = useT();
  if (t < from) return null;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const p = ((t - from) * 0.55 + i / 3 + seed * 0.13) % 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin((t + i) * 2) * 20,
              top: y - p * 260,
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: "#D9CCFF",
              border: `4px solid ${C.ink}`,
              opacity: Math.sin(p * Math.PI),
              fontFamily: HEAD,
              fontSize: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.ink,
            }}
          >
            CO₂
          </div>
        );
      })}
    </>
  );
};

const Battery: React.FC<{ from: number; to: number; at: number; dur: number }> = ({ from, to, at, dur }) => {
  const t = useT();
  const v = interpolate(t, [at, at + dur], [from, to], { ...clamp, easing: easeOut });
  const col = v > 70 ? C.lime : v > 55 ? C.yellow : C.pink;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 640, height: 230, borderRadius: 40, border: `10px solid ${C.ink}`, background: C.cream, padding: 16, boxShadow: `0 12px 0 ${C.ink}` }}>
        <div style={{ width: `${v}%`, height: "100%", borderRadius: 24, background: col, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontSize: 110, color: C.ink, minWidth: 260 }}>
          {Math.round(v)}%
        </div>
      </div>
      <div style={{ width: 40, height: 100, borderRadius: 12, background: C.ink }} />
    </div>
  );
};

const Ep1Scenes: React.FC = () => {
  const t = useT();
  const shakeHits = [
    { t: 0.05, a: 10 },
    { t: 9.76, a: 26 },
    { t: 29.0, a: 14 },
    { t: 48.96, a: 16 },
  ];
  const cam = useShake(shakeHits);
  return (
    <>
      <AbsoluteFill style={{ translate: cam }}>
        {/* 1 — HOOK: ngantuk pas rapat */}
        <Scene a={0} b={3.15} zoom={false}>
          <Room>
            <Whiteboard x={560} y={70} />
          </Room>
          <div style={{ position: "absolute", left: 190, top: 430, rotate: `${Math.sin(t * 3) * 7}deg`, transformOrigin: "50% 80%" }}>
            <Worker size={820} expr="sleepy" shirt="#7C5CFF" />
          </div>
          <Zzz x={720} y={520} />
          <Sticker at={0.1} y={290} bg={C.lime} size={86}>
            BARU 30 MENIT RAPAT 😴
          </Sticker>
        </Scene>

        {/* 2 — bukan bosnya? */}
        <Scene a={3.15} b={6.3}>
          <Room>
            <Whiteboard x={420} y={60} />
            <Table x={60} y={640} />
          </Room>
          <div style={{ position: "absolute", left: 70, top: 470 }}>
            <Worker size={700} pose="point" expr={t > 4.75 ? "shocked" : "normal"} {...BOSS} seed={2} />
          </div>
          <div style={{ position: "absolute", left: 640, top: 700 }}>
            <Worker size={480} expr="sleepy" shirt="#7C5CFF" seed={1} />
          </div>
          <Sticker at={4.45} y={290} bg={C.pink} color={C.white} size={78}>
            BUKAN SALAH BOSNYA?
          </Sticker>
        </Scene>

        {/* 3 — ada makhluk halus (scanner) */}
        <Scene a={6.3} b={8.92}>
          <Room dark={interpolate(t, [6.3, 6.7], [0, 0.55], clamp)}>
            <Table x={60} y={640} />
          </Room>
          <div style={{ position: "absolute", left: 90, top: 720, opacity: 0.6 }}>
            <Worker size={420} expr="sleepy" {...BOSS} seed={2} />
          </div>
          <div style={{ position: "absolute", left: 640, top: 720, opacity: 0.6 }}>
            <Worker size={420} expr="sleepy" shirt="#7C5CFF" seed={1} />
          </div>
          <Scanner at={7.0} dur={0.9} top={330} height={700}>
            <div style={{ position: "absolute", left: 330, top: 380 }}>
              <SiHalus size={460} variant="co2" />
            </div>
          </Scanner>
          <Sticker at={6.4} y={290} bg={C.bg1} color={C.lime} size={72}>
            ADA MAKHLUK HALUS 👻
          </Sticker>
        </Scene>

        {/* 4 — namanya CO2 */}
        <Scene a={8.92} b={10.72}>
          <div style={{ position: "absolute", left: 250, top: 380 }}>
            <Pop at={8.95}>
              <SiHalus size={700} variant="co2" mood="laugh" />
            </Pop>
          </div>
          <Sticker at={9.76} y={1050} bg={C.lime} size={110} rotate={-5}>
            SI HALUS: CO₂
          </Sticker>
        </Scene>

        {/* 5 — napas, pintu, orang, ventilasi */}
        <Scene a={10.72} b={16.95}>
          <Room>
            <Door x={800} y={140} closeAt={13.75} />
            <Table x={80} y={600} w={660} />
            {/* ventilasi */}
            <div style={{ position: "absolute", left: 90, top: 90, width: 240, height: 120, background: "#251845", border: `${OUTLINE}px solid ${C.ink}`, borderRadius: 16, display: "flex", flexDirection: "column", justifyContent: "space-evenly", padding: "0 18px" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ height: 10, borderRadius: 5, background: C.cream, opacity: 0.7 }} />
              ))}
              {t > 15.6 && (
                <svg width={260} height={160} style={{ position: "absolute", left: -10, top: -20 }}>
                  <path d="M30 30 L230 140 M230 30 L30 140" stroke={C.pink} strokeWidth={22} strokeLinecap="round" />
                </svg>
              )}
            </div>
          </Room>
          <Haze from={11} to={16.9} />
          <div style={{ position: "absolute", left: 110, top: 620 }}>
            <Worker size={420} expr="normal" shirt="#7C5CFF" seed={1} />
          </div>
          <div style={{ position: "absolute", left: 400, top: 620 }}>
            <Worker size={420} expr="normal" shirt={C.cyan} seed={3} />
          </div>
          <Bubbles x={230} y={640} from={11.0} seed={1} />
          <Bubbles x={520} y={640} from={11.3} seed={2} />
          <Pop at={14.6} x={-40} y={760}>
            <Worker size={380} expr="normal" shirt={C.orange} seed={4} />
          </Pop>
          <Pop at={14.85} x={640} y={760}>
            <Worker size={380} expr="normal" shirt={C.pink} seed={5} />
          </Pop>
          <Sticker at={10.8} out={13.6} y={290} bg={C.cream} size={72}>
            TIAP NAPAS = CO₂ 💨
          </Sticker>
          <Sticker at={13.75} out={14.5} y={290} bg={C.yellow} size={72}>
            🚪 PINTU DITUTUP
          </Sticker>
          <Sticker at={14.6} out={15.5} y={290} bg={C.orange} size={72}>
            👥 ORANG BANYAK
          </Sticker>
          <Sticker at={15.6} y={290} bg={C.pink} color={C.white} size={72}>
            ❄️ AC MUTER UDARA ITU-ITU AJA
          </Sticker>
        </Scene>

        {/* 6 — CO2 meter */}
        <Scene a={16.95} b={23.5}>
          <Pop at={17.0} out={20.05} x={140} y={360}>
            <div style={{ width: 800, height: 560, borderRadius: 60, background: "#2A2140", border: `10px solid ${C.ink}`, boxShadow: `0 16px 0 ${C.ink}` }}>
              <div style={{ margin: 40, height: 330, borderRadius: 30, background: "#0E1A10", border: `6px solid ${C.ink}`, position: "relative" }} />
              <div style={{ textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 44, color: C.cream }}>CO₂ METER · RUANG RAPAT</div>
            </div>
          </Pop>
          {t < 20.15 && (
            <BigStat at={17.1} from={430} to={1000} dur={2.2} suffix="" label="" y={470} color={t > 19.2 ? C.pink : C.lime} />
          )}
          {t < 20.15 && (
            <div style={{ position: "absolute", top: 720, left: 0, right: 0, textAlign: "center", fontFamily: HEAD, fontSize: 64, color: t > 19.2 ? C.pink : C.lime, opacity: (t > 19.3 ? 0.5 + 0.5 * Math.sign(Math.sin(t * 20)) : 1) }}>
              {t > 19.3 ? "⚠ ppm — LEWAT BATAS" : "ppm"}
            </div>
          )}
          <Sticker at={17.05} out={20.1} y={1000} bg={C.lime} size={64}>
            {"< 1 JAM RAPAT"}
          </Sticker>
          {t >= 20.15 && (
            <>
              <Pop at={20.2} x={60} y={420}>
                <InfoCard title="🌳 UDARA LUAR" value="±430" sub="ppm" color={C.cyan} />
              </Pop>
              <Pop at={20.5} x={580} y={420}>
                <InfoCard title="🏢 RUANG RAPAT" value="1.000+" sub="ppm" color={C.pink} />
              </Pop>
              <Pop at={20.8} x={470} y={560}>
                <div style={{ fontFamily: HEAD, fontSize: 80, color: C.cream, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill" }}>vs</div>
              </Pop>
              <Pop at={21.0} x={340} y={790} from="bottom">
                <Worker size={420} expr="sleepy" shirt="#7C5CFF" />
              </Pop>
              <Zzz x={640} y={820} at={21.2} />
            </>
          )}
        </Scene>

        {/* 7 — studi Harvard */}
        <Scene a={23.5} b={29.95}>
          <Sticker at={23.55} y={290} bg={C.cream} size={70}>
            🎓 STUDI HARVARD (2016)
          </Sticker>
          <Pop at={25.55} x={0} y={470} style={{ width: 1080, textAlign: "center" }}>
            <div style={{ fontFamily: HEAD, fontSize: 120, color: C.yellow, WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill", textShadow: `0 12px 0 ${C.ink}` }}>±1.400 ppm</div>
          </Pop>
          <Pop at={27.2} x={0} y={680} style={{ width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 54, color: C.cream }}>🧠 SKOR KEMAMPUAN MIKIR</div>
            <Battery from={100} to={50} at={27.5} dur={1.6} />
          </Pop>
          <Pop at={29.0} x={760} y={930}>
            <Worker size={300} expr="dizzy" shirt="#7C5CFF" />
          </Pop>
        </Scene>

        {/* 8 — gejala + membaik di luar */}
        <Scene a={29.95} b={36.4}>
          {t < 33.5 ? (
            <div style={{ position: "absolute", top: 360, left: 120, display: "flex", flexDirection: "column", gap: 50 }}>
              <Badge icon="😵‍💫" label="KEPALA BERAT" at={30.9} color={C.pink} />
              <Badge icon="😴" label="NGANTUK" at={31.7} color="#B9A6FF" />
              <Badge icon="🎯" label="NGGAK FOKUS" at={32.38} color={C.cyan} />
            </div>
          ) : (
            <>
              <Room wall="#2E6B4F" floor="#1E4A36">
                <div style={{ position: "absolute", left: 60, top: 40, fontSize: 150 }}>🌳</div>
                <div style={{ position: "absolute", right: 70, top: 60, fontSize: 120 }}>☀️</div>
              </Room>
              <div
                style={{
                  position: "absolute",
                  top: 520,
                  left: interpolate(t, [33.6, 34.6], [-500, 300], { ...clamp, easing: easeOut }),
                }}
              >
                <Worker size={640} expr={t > 34.7 ? "happy" : "sleepy"} pose={t > 34.7 ? "wave" : "idle"} shirt="#7C5CFF" />
              </div>
              <Sticker at={34.75} y={1030} bg={C.lime} size={70}>
                KELUAR RUANGAN = SEGER LAGI ✨
              </Sticker>
              <Sticker at={33.55} y={290} bg={C.cream} size={60}>
                CIRI KHAS SICK BUILDING SYNDROME
              </Sticker>
            </>
          )}
        </Scene>

        {/* 9 — Permenkes */}
        <Scene a={36.4} b={39.75}>
          <Pop at={36.5} x={90} y={360}>
            <div style={{ width: 900, padding: "50px 40px 60px", borderRadius: 50, background: C.cream, border: `10px solid ${C.ink}`, boxShadow: `0 16px 0 ${C.ink}`, textAlign: "center", rotate: "-2deg" }}>
              <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 50, color: C.ink }}>📜 PERMENKES 48/2016</div>
              <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 46, color: "#5B4B7A", marginTop: 6 }}>Standar K3 Perkantoran · CO₂</div>
              <div style={{ fontFamily: HEAD, fontSize: 170, color: C.ink, marginTop: 20 }}>≤ 1.000</div>
              <div style={{ fontFamily: HEAD, fontSize: 70, color: C.ink }}>ppm</div>
            </div>
          </Pop>
          <Pop at={38.6} x={720} y={760}>
            <div style={{ width: 230, height: 230, borderRadius: "50%", border: `10px solid ${C.pink}`, color: C.pink, fontFamily: HEAD, fontSize: 54, display: "flex", alignItems: "center", justifyContent: "center", rotate: "-14deg", background: "rgba(255,79,139,0.12)" }}>
              BATAS!
            </div>
          </Pop>
        </Scene>

        {/* 10 — solusi */}
        <Scene a={39.75} b={45.45}>
          <Sticker at={39.8} y={290} bg={C.lime} size={84}>
            JADI GINI 👇
          </Sticker>
          <div style={{ position: "absolute", top: 450, left: 80, display: "flex", flexDirection: "column", gap: 34 }}>
            <CheckRow icon="🚪" label="Buka pintu / jendela sebentar" at={40.5} />
            <CheckRow icon="⏸️" label="Kasih jeda" at={42.15} />
            <CheckRow icon="👥" label="Jangan jejelin ruangan sekecil kamar kos" at={43.5} />
          </div>
          <div
            style={{
              position: "absolute",
              left: interpolate(t, [41, 45.4], [700, 1400], { ...clamp, easing: Easing2 }),
              top: 960,
              rotate: `${interpolate(t, [41, 45.4], [0, 50], clamp)}deg`,
            }}
          >
            <SiHalus size={260} variant="co2" mood="scared" />
          </div>
        </Scene>

        {/* 11 — punchline */}
        <Scene a={45.45} b={51.1}>
          <Room>
            <Whiteboard x={520} y={60} />
            <Table x={40} y={620} />
          </Room>
          <div style={{ position: "absolute", left: 560, top: 520 }}>
            <Worker size={620} {...BOSS} pose={t < 48.9 ? "point" : "idle"} expr={t < 48.9 ? "shocked" : t < 50.1 ? "normal" : "sleepy"} seed={2} flip />
          </div>
          <div
            style={{
              position: "absolute",
              left: 60,
              top: 640,
              rotate: t < 48.9 ? "-16deg" : "0deg",
              transformOrigin: "50% 100%",
            }}
          >
            <Worker size={520} shirt="#7C5CFF" expr={t < 48.9 ? "sleepy" : "smirk"} pose={t < 48.9 ? "idle" : "shrug"} />
          </div>
          <Zzz x={330} y={640} at={45.5} until={48.9} />
          <Zzz x={860} y={520} at={50.2} />
          <Pop at={48.95} x={40} y={330}>
            <Bubble w={620} tail="left" size={58}>
              “Maaf Pak, CO₂-nya tinggi 🙏”
            </Bubble>
          </Pop>
          <Pop at={50.1} x={820} y={330}>
            <SiHalus size={250} variant="co2" mood="laugh" />
          </Pop>
        </Scene>
      </AbsoluteFill>
    </>
  );
};

const Easing2 = (x: number) => x * x;

export const Ep1: React.FC = () => (
  <Episode ep={1} accent={C.lime} tint="#2F1D5E" words={words} endStart={EP1.endStart} revealAt={EP1.revealAt} flashes={[9.76]} warp={warp}>
    <Ep1Scenes />
  </Episode>
);
