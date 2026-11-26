import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, random, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, OUTLINE, clamp, easeOut } from "../brand";
import { SiHalus, Worker } from "../Characters";
import { Episode } from "../Episode";
import { BigStat, Pop, Scanner, Sticker, useShake } from "../Kit";
import { Badge, Bubble, CheckRow, InfoCard, Room } from "../Props";
import { Scene } from "./Ep1";
import { words } from "./ep2.words";
import { warp } from "./ep2.warp";

/** Semua waktu = detik absolut pada voice-over EP2 (lihat data/ep2_words.json) */
/** Adegan ditulis dalam detik VO lama; `warp` memetakannya ke VO baru (Adrianleoh) */
export const EP2 = { dur: 63.8, endStart: 59.03, revealAt: 61.38 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

/** Getaran acak kecil (px) */
const useJitter = (amp: number, key: string) => {
  const f = useCurrentFrame();
  if (!amp) return "0px 0px";
  return `${(random(`${key}x${f}`) - 0.5) * amp}px ${(random(`${key}y${f}`) - 0.5) * amp}px`;
};

const S = { stroke: C.ink, strokeWidth: OUTLINE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/* ----------------------------------------------------------- gambar lokal */
export const Grinder: React.FC<{ size?: number; spin?: boolean }> = ({ size = 360, spin = true }) => {
  const t = useT();
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 360 216" style={{ overflow: "visible" }}>
      <rect x={20} y={70} width={210} height={76} rx={36} fill="#3D7BFF" {...S} />
      <rect x={40} y={86} width={70} height={14} rx={7} fill="#1E3A8A" />
      <rect x={210} y={60} width={60} height={96} rx={18} fill="#2A2140" {...S} />
      <g style={{ rotate: spin ? `${t * 2000}deg` : "0deg", transformOrigin: "300px 108px" }}>
        <circle cx={300} cy={108} r={70} fill="#9AA0B5" {...S} />
        <line x1={300} y1={42} x2={300} y2={174} stroke="#6B7088" strokeWidth={8} />
        <line x1={234} y1={108} x2={366} y2={108} stroke="#6B7088" strokeWidth={8} />
        <circle cx={300} cy={108} r={14} fill={C.ink} />
      </g>
      {spin &&
        [0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI - Math.PI / 2 + t * 6;
          return <circle key={i} cx={300 + Math.cos(a) * 95} cy={108 + Math.sin(a) * 95} r={6} fill={C.yellow} />;
        })}
    </svg>
  );
};

const Drill: React.FC<{ size?: number }> = ({ size = 240 }) => (
  <svg width={size} height={size} viewBox="0 0 240 240">
    <rect x={30} y={60} width={140} height={70} rx={28} fill={C.orange} {...S} />
    <rect x={70} y={120} width={50} height={90} rx={16} fill="#2A2140" {...S} />
    <rect x={165} y={82} width={40} height={26} rx={6} fill="#9AA0B5" {...S} />
    <path d="M205 95 L232 95" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
  </svg>
);

const Saw: React.FC<{ size?: number }> = ({ size = 240 }) => {
  const t = useT();
  return (
    <svg width={size} height={size} viewBox="0 0 240 240">
      <g style={{ rotate: `${t * 1500}deg`, transformOrigin: "120px 130px" }}>
        <path
          d={new Array(16)
            .fill(0)
            .map((_, i) => {
              const a = (i / 16) * Math.PI * 2;
              const r = i % 2 ? 78 : 94;
              return `${i ? "L" : "M"}${120 + Math.cos(a) * r} ${130 + Math.sin(a) * r}`;
            })
            .join(" ") + "Z"}
          fill="#C9CEDC"
          {...S}
        />
        <circle cx={120} cy={130} r={18} fill={C.ink} />
      </g>
      <rect x={40} y={26} width={160} height={50} rx={20} fill={C.yellow} {...S} />
    </svg>
  );
};

/** Tangan kartun; ujung jari berubah pucat (whiten 0..1); overlay saraf & pembuluh */
export const Hand: React.FC<{ size?: number; whiten?: number; nerves?: number; vessels?: number; tingle?: boolean }> = ({
  size = 520,
  whiten = 0,
  nerves = 0,
  vessels = 0,
  tingle = false,
}) => {
  const t = useT();
  const skin = C.skin;
  const tip = interpolateColors(whiten, [0, 1], [skin, "#F3F1EE"]);
  const fingers = [
    { x: 70, h: 190 },
    { x: 140, h: 240 },
    { x: 210, h: 255 },
    { x: 280, h: 230 },
  ];
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 400 500" style={{ overflow: "visible" }}>
      {/* jempol */}
      <path d="M40 330 Q-20 270 10 220 Q40 190 70 240 L95 300 Z" fill={skin} {...S} />
      {fingers.map((f, i) => (
        <g key={i}>
          <rect x={f.x - 32} y={330 - f.h} width={64} height={f.h + 30} rx={32} fill={skin} {...S} />
          <rect x={f.x - 28} y={334 - f.h} width={56} height={Math.min(110, f.h * 0.45)} rx={28} fill={tip} />
          <path d={`M${f.x - 14} ${330 - f.h + 20} Q${f.x} ${330 - f.h + 6} ${f.x + 14} ${330 - f.h + 20}`} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.4} />
        </g>
      ))}
      {/* telapak */}
      <path d="M36 300 Q30 470 180 490 Q330 480 320 300 Z" fill={skin} {...S} />
      {/* pembuluh darah kecil */}
      {vessels > 0 &&
        fingers.map((f, i) => (
          <path
            key={`v${i}`}
            d={`M${180 + (i - 1.5) * 20} 470 Q${f.x} 380 ${f.x} ${360 - f.h}`}
            fill="none"
            stroke={C.pink}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={420}
            strokeDashoffset={420 * (1 - vessels)}
          />
        ))}
      {/* saraf */}
      {nerves > 0 &&
        fingers.map((f, i) => (
          <path
            key={`n${i}`}
            d={`M${190 + (i - 1.5) * 14} 480 L${f.x + 10} 360 L${f.x - 6} 300 L${f.x + 4} ${350 - f.h}`}
            fill="none"
            stroke={C.yellow}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={460}
            strokeDashoffset={460 * (1 - nerves)}
            opacity={0.95}
          />
        ))}
      {tingle &&
        [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const p = (t * 1.8 + i / 8) % 1;
          const fx = fingers[i % 4].x + (i % 2 ? 26 : -26);
          return (
            <text key={i} x={fx} y={330 - fingers[i % 4].h - 30 - p * 50} textAnchor="middle" fontFamily="LilitaOne" fontSize={40} fill={C.cyan} opacity={Math.sin(p * Math.PI)}>
              ✦
            </text>
          );
        })}
    </svg>
  );
};

/** Kabin alat berat dengan Bang Jo memantul */
const Excavator: React.FC<{ bounce: number }> = ({ bounce }) => {
  const t = useT();
  const b = Math.abs(Math.sin(t * 22)) * bounce;
  return (
    <div style={{ position: "relative", width: 900, height: 700 }}>
      <svg width={900} height={700} viewBox="0 0 900 700" style={{ position: "absolute", inset: 0 }}>
        {/* lengan excavator */}
        <path d="M600 330 L800 140 L880 300" fill="none" stroke={C.ink} strokeWidth={60} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M600 330 L800 140 L880 300" fill="none" stroke={C.yellow} strokeWidth={44} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M840 300 L900 300 L880 380 L820 360 Z" fill="#9AA0B5" {...S} />
        {/* track */}
        <rect x={80} y={560} width={640} height={110} rx={55} fill="#2A2140" {...S} />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={150 + i * 125} cy={615} r={32} fill="#6B7088" {...S} />
        ))}
        {/* badan */}
        <rect x={90} y={420} width={620} height={150} rx={30} fill={C.yellow} {...S} />
        <rect x={130} y={140} width={420} height={300} rx={40} fill={C.yellow} {...S} />
        <rect x={170} y={180} width={340} height={200} rx={26} fill="#9FD8F0" {...S} />
      </svg>
      <div style={{ position: "absolute", left: 230, top: 150 - b, width: 240, height: 230, overflow: "hidden", borderRadius: 20 }}>
        <div style={{ position: "absolute", left: 10 }}>
          <Worker size={330} expr={bounce > 10 ? "pain" : "normal"} helmet vest seed={3} />
        </div>
      </div>
      <svg width={900} height={700} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {[-1, 1].map((side) =>
          [0, 1].map((k) => (
            <path
              key={`${side}${k}`}
              d={side < 0 ? `M${60 - k * 30} 470 l-24 20 l24 20 l-24 20 l24 20` : `M${740 + k * 30} 470 l24 20 l-24 20 l24 20 l-24 20`}
              fill="none"
              stroke={C.cyan}
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.5 + 0.5 * Math.sin(t * 30 + k)}
            />
          )),
        )}
      </svg>
    </div>
  );
};

const Glove: React.FC<{ size?: number }> = ({ size = 300 }) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 300 345" style={{ overflow: "visible" }}>
    <path d="M30 230 Q-10 180 20 150 Q50 130 70 175 Z" fill={C.orange} {...S} />
    {[60, 115, 170, 225].map((x, i) => (
      <rect key={i} x={x - 26} y={[70, 40, 35, 60][i]} width={52} height={200} rx={26} fill={C.orange} {...S} />
    ))}
    <path d="M30 200 Q30 320 150 320 Q260 320 255 200 Z" fill={C.orange} {...S} />
    <rect x={40} y={290} width={220} height={50} rx={14} fill="#2A2140" {...S} />
    {[80, 130, 180, 230].map((x) => (
      <circle key={x} cx={x - 20} cy={230} r={10} fill="#C25E1E" />
    ))}
  </svg>
);

const Phone: React.FC<{ saldo: boolean }> = ({ saldo }) => (
  <div
    style={{
      width: 300,
      height: 520,
      borderRadius: 50,
      background: "#1C2333",
      border: `${OUTLINE}px solid ${C.ink}`,
      boxShadow: `0 12px 0 ${C.ink}`,
      padding: 20,
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 32,
        background: saldo ? C.cream : "#2F8CFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: BODY,
        fontWeight: 800,
        color: C.ink,
        textAlign: "center",
      }}
    >
      {saldo ? (
        <>
          <div style={{ fontSize: 38 }}>💳 Saldo</div>
          <div style={{ fontFamily: HEAD, fontSize: 64, color: C.pink, lineHeight: 1.1, marginTop: 10 }}>
            Rp
            <br />
            12.500
          </div>
          <div style={{ fontSize: 30, opacity: 0.6, marginTop: 10 }}>tgl 26 😭</div>
        </>
      ) : (
        <div style={{ fontSize: 110 }}>📱</div>
      )}
    </div>
  </div>
);

const Shaky: React.FC<{ amp: number; k: string; children: React.ReactNode }> = ({ amp, k, children }) => {
  const j = useJitter(amp, k);
  return <div style={{ translate: j }}>{children}</div>;
};

/* ================================================================ EP2 */
const W2 = C.cyan;

const Ep2Scenes: React.FC = () => {
  const t = useT();
  const cam = useShake([
    { t: 0.05, a: 10 },
    { t: 8.32, a: 28 },
    { t: 24.2, a: 18 },
    { t: 36.32, a: 12 },
    { t: 53.52, a: 16 },
  ]);
  return (
    <>
      <AbsoluteFill style={{ translate: cam }}>
        {/* 1 — HOOK: jari putih habis gerinda */}
        <Scene a={0} b={3.95} zoom={false}>
          <Room wall="#1F4A5A" floor="#163542" />
          <div style={{ position: "absolute", left: 40, top: 560 }}>
            <Shaky amp={10} k="jo">
              <Worker size={620} pose="holdTool" helmet vest expr={t > 2.2 ? "shocked" : "normal"} shake={8} />
            </Shaky>
          </div>
          <div style={{ position: "absolute", left: 150, top: 900 }}>
            <Shaky amp={12} k="gr">
              <Grinder size={300} />
            </Shaky>
          </div>
          <Pop at={1.1} x={560} y={380}>
            <div style={{ rotate: "8deg" }}>
              <Shaky amp={t < 2.6 ? 8 : 0} k="hand">
                <Hand size={440} whiten={interpolate(t, [1.6, 2.6], [0, 1], clamp)} />
              </Shaky>
            </div>
          </Pop>
          <Sticker at={0.1} y={290} bg={C.cream} size={84} rotate={-4}>
            JARI JADI PUTIH?! 😨
          </Sticker>
        </Scene>

        {/* 2 — bukan masuk angin */}
        <Scene a={3.95} b={5.42}>
          <div>
            <Pop at={4.0} x={340} y={420}>
              <div style={{ position: "relative", fontSize: 360, lineHeight: 1 }}>
                🪙
                <svg width={400} height={400} style={{ position: "absolute", left: -20, top: -10 }}>
                  <circle cx={200} cy={200} r={170} fill="none" stroke={C.pink} strokeWidth={30} />
                  <line x1={80} y1={320} x2={320} y2={80} stroke={C.pink} strokeWidth={30} strokeLinecap="round" />
                </svg>
              </div>
            </Pop>
          </div>
          <Sticker at={4.3} y={900} bg={C.pink} color={C.white} size={86} rotate={3}>
            ❌ BUKAN MASUK ANGIN
          </Sticker>
          <Sticker at={4.05} y={290} bg={C.cream} size={58}>
            (kerokan nggak bakal mempan 😅)
          </Sticker>
        </Scene>

        {/* 3 — makhluk halus (scanner) */}
        <Scene a={5.42} b={8.3}>
          <Room wall="#1F4A5A" floor="#163542" dark={interpolate(t, [5.42, 5.8], [0, 0.55], clamp)} />
          <div style={{ position: "absolute", left: 80, top: 640, opacity: 0.6 }}>
            <Worker size={480} pose="holdTool" helmet vest expr="normal" shake={6} />
          </div>
          <Scanner at={5.9} dur={0.9} top={330} height={700}>
            <div style={{ position: "absolute", left: 520, top: 400 }}>
              <SiHalus size={440} variant="vibe" />
            </div>
          </Scanner>
          <Sticker at={5.5} y={290} bg={C.bg1} color={C.cyan} size={72}>
            ADA MAKHLUK HALUS 👻
          </Sticker>
        </Scene>

        {/* 4 — GETARAN! */}
        <Scene a={8.3} b={9.15}>
          <div style={{ position: "absolute", left: 250, top: 380 }}>
            <Pop at={8.3}>
              <SiHalus size={700} variant="vibe" mood="laugh" />
            </Pop>
          </div>
          <Sticker at={8.32} y={1050} bg={C.cyan} size={104} rotate={-5}>
            SI HALUS: GETARAN
          </Sticker>
        </Scene>

        {/* 5 — alat & kerusakan saraf/pembuluh */}
        <Scene a={9.15} b={15.32}>
          {t < 12.6 ? (
            <>
              <Sticker at={9.2} y={290} bg={C.cream} size={74}>
                SUMBERNYA? 🛠️
              </Sticker>
              <div>
                {[
                  { at: 9.84, el: <Drill size={270} />, label: "BOR", x: 40, y: 430 },
                  { at: 10.4, el: <Grinder size={290} />, label: "GERINDA", x: 390, y: 640 },
                  { at: 11.2, el: <Saw size={270} />, label: "MESIN POTONG", x: 720, y: 430 },
                ].map((x) => (
                  <Pop key={x.label} at={x.at} x={x.x} y={x.y}>
                    <Shaky amp={6} k={x.label}>
                      <div style={{ width: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                        <div style={{ height: 290, display: "flex", alignItems: "center" }}>{x.el}</div>
                        <div style={{ fontFamily: HEAD, fontSize: 52, color: C.cream, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill", textAlign: "center" }}>{x.label}</div>
                      </div>
                    </Shaky>
                  </Pop>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ position: "absolute", left: 300, top: 360 }}>
                <Pop at={12.6}>
                  <Hand
                    size={500}
                    nerves={interpolate(t, [13.0, 13.6], [0, 1], { ...clamp, easing: easeOut })}
                    vessels={interpolate(t, [13.55, 14.2], [0, 1], { ...clamp, easing: easeOut })}
                  />
                </Pop>
              </div>
              <Sticker at={12.65} y={290} bg={C.pink} color={C.white} size={70}>
                LAMA-LAMA NGERUSAK 👇
              </Sticker>
              <Pop at={13.04} x={60} y={520}>
                <div style={{ padding: "12px 26px", borderRadius: 999, background: C.yellow, border: `6px solid ${C.ink}`, fontFamily: HEAD, fontSize: 54, color: C.ink, rotate: "-6deg" }}>⚡ SARAF</div>
              </Pop>
              <Pop at={13.56} x={720} y={760}>
                <div style={{ padding: "12px 26px", borderRadius: 999, background: C.pink, border: `6px solid ${C.ink}`, fontFamily: HEAD, fontSize: 48, color: C.white, rotate: "5deg", textAlign: "center", lineHeight: 1 }}>
                  🩸 PEMBULUH
                  <br />
                  DARAH
                </div>
              </Pop>
            </>
          )}
        </Scene>

        {/* 6 — gejala */}
        <Scene a={15.32} b={22.15}>
          <Sticker at={15.38} out={21.1} y={290} bg={C.cream} size={70}>
            GEJALANYA 🩺
          </Sticker>
          <Sticker at={21.2} y={290} bg="#DDF1FF" color="#0B3A6B" size={68}>
            ❄️ APALAGI PAS DINGIN
          </Sticker>
          <div style={{ position: "absolute", top: 400, left: 90, display: "flex", flexDirection: "column", gap: 22, scale: "0.86", transformOrigin: "0 0" }}>
            <Badge icon="✨" label="KESEMUTAN" at={16.08} color={C.cyan} />
            <Badge icon="🫥" label="KEBAS" at={16.8} color="#B9A6FF" />
            <Badge icon="✊" label="GENGGAMAN LEMAH" at={18.08} color={C.orange} />
            <Badge icon="🤍" label="JARI MEMUTIH" at={20.0} color={C.cream} />
          </div>
        </Scene>

        {/* 7 — permanen */}
        <Scene a={22.15} b={25.15}>
          <div style={{ position: "absolute", left: 300, top: 420 }}>
            <Hand size={480} whiten={1} />
          </div>
          <Sticker at={22.2} y={290} bg={C.bg1} color={C.pink} size={76}>
            YANG SEREM... 😱
          </Sticker>
          <Pop at={24.2} x={90} y={700}>
            <div
              style={{
                width: 900,
                padding: "20px 0 26px",
                borderRadius: 30,
                border: `14px solid ${C.pink}`,
                color: C.pink,
                background: "rgba(20,11,36,0.85)",
                fontFamily: HEAD,
                fontSize: 170,
                textAlign: "center",
                rotate: "-8deg",
                letterSpacing: 4,
              }}
            >
              PERMANEN
            </div>
          </Pop>
        </Scene>

        {/* 8 — getaran seluruh tubuh */}
        <Scene a={25.15} b={33.42}>
          {t < 29.9 ? (
            <>
              <Sticker at={25.2} y={290} bg={C.cream} size={70}>
                BUKAN CUMA TANGAN 👀
              </Sticker>
              <div style={{ position: "absolute", left: 90, top: 430, scale: "0.95" }}>
                <Excavator bounce={t > 28.4 ? 18 : 8} />
              </div>
              <Pop at={26.48} x={60} y={380}>
                <div style={{ padding: "10px 24px", borderRadius: 999, background: C.yellow, border: `6px solid ${C.ink}`, fontFamily: HEAD, fontSize: 46, color: C.ink, rotate: "-5deg" }}>🚚 SOPIR</div>
              </Pop>
              <Pop at={27.3} x={640} y={380}>
                <div style={{ padding: "10px 24px", borderRadius: 999, background: C.orange, border: `6px solid ${C.ink}`, fontFamily: HEAD, fontSize: 46, color: C.ink, rotate: "5deg" }}>🏗️ OPERATOR</div>
              </Pop>
            </>
          ) : (
            <>
              <Sticker at={29.9} y={290} bg={C.pink} color={C.white} size={66}>
                RISIKO SAKIT PINGGANG 🦴
              </Sticker>
              <BigStat at={31.44} from={1} to={1.5} dur={1.0} decimals={1} suffix="×" label="LEBIH TINGGI" y={420} color={C.pink} />
              <div>
                <Pop at={30.1} x={70} y={800}>
                  <InfoCard title="NAB tangan-lengan" value="5 m/s²" sub="8 jam/hari" color={C.cyan} w={450} valueSize={86} />
                </Pop>
                <Pop at={30.4} x={560} y={800}>
                  <InfoCard title="NAB seluruh tubuh" value="0,8661" sub="m/s² · 8 jam/hari" color={C.yellow} w={450} valueSize={86} />
                </Pop>
              </div>
              <Pop at={30.6} x={0} y={1140} style={{ width: 1080, textAlign: "center" }}>
                <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 32, color: C.cream, opacity: 0.8 }}>Permenaker No. 5 Tahun 2018</div>
              </Pop>
            </>
          )}
        </Scene>

        {/* 9 — mitos sarung tangan */}
        <Scene a={33.42} b={40.35}>
          <Sticker at={33.45} y={290} bg={C.cream} size={66}>
            {t < 36.32 ? "SARUNG TANGAN ANTI-GETAR?" : "EITS... TUNGGU DULU ✋"}
          </Sticker>
          <div style={{ position: "absolute", left: 380, top: 420, rotate: t > 36.32 ? `${Math.sin(t * 30) * 4}deg` : "0deg" }}>
            <Pop at={33.6}>
              <Glove size={320} />
            </Pop>
          </div>
          <Pop at={35.5} x={720} y={430}>
            <div
              style={{
                width: 190,
                height: 190,
                borderRadius: "50%",
                background: t < 36.32 ? C.lime : C.pink,
                border: `8px solid ${C.ink}`,
                boxShadow: `0 10px 0 ${C.ink}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 110,
                rotate: t < 36.32 ? "0deg" : `${interpolate(t, [36.32, 36.6], [180, 360], clamp)}deg`,
              }}
            >
              {t < 36.32 ? "✅" : "❌"}
            </div>
          </Pop>
          <Pop at={37.2} x={90} y={830}>
            <div
              style={{
                width: 900,
                padding: "24px 30px 28px",
                borderRadius: 40,
                background: C.bg1,
                border: `${OUTLINE}px solid ${C.ink}`,
                outline: `5px solid ${C.pink}`,
                outlineOffset: -18,
                boxShadow: `0 12px 0 ${C.ink}`,
                textAlign: "center",
                fontFamily: BODY,
                fontWeight: 800,
                color: C.cream,
                fontSize: 42,
                lineHeight: 1.15,
              }}
            >
              🇬🇧 HSE (badan K3 Inggris):
              <div style={{ fontFamily: HEAD, fontSize: 62, color: C.pink, marginTop: 6 }}>NGGAK BISA DIANDALKAN</div>
            </div>
          </Pop>
        </Scene>

        {/* 10 — solusi */}
        <Scene a={40.35} b={47.72}>
          <Sticker at={40.4} y={290} bg={C.cyan} size={78}>
            YANG BENERAN NGEFEK 👇
          </Sticker>
          <div style={{ position: "absolute", top: 460, left: 80, display: "flex", flexDirection: "column", gap: 34 }}>
            <CheckRow icon="🛠️" label="Pilih alat getaran rendah" at={41.68} />
            <CheckRow icon="⏱️" label="Kerjanya dicicil, jangan nonstop" at={43.44} />
            <CheckRow icon="🧤" label="Tangan tetap hangat & kering" at={45.44} />
          </div>
          <div
            style={{
              position: "absolute",
              left: interpolate(t, [42, 47.6], [760, 1300], clamp),
              top: 960,
              rotate: `${interpolate(t, [42, 47.6], [0, 40], clamp)}deg`,
            }}
          >
            <SiHalus size={240} variant="vibe" mood="scared" />
          </div>
        </Scene>

        {/* 11 — punchline saldo */}
        <Scene a={47.72} b={54.55}>
          <Room wall="#1F4A5A" floor="#163542" />
          <div style={{ position: "absolute", left: 60, top: 560 }}>
            <Worker size={620} pose="holdTool" shirt="#7C5CFF" expr={t < 52.9 ? "normal" : t < 53.5 ? "shocked" : "pain"} shake={t > 47.8 ? 10 : 0} />
          </div>
          <div style={{ position: "absolute", left: 590, top: 470, rotate: "6deg" }}>
            <Shaky amp={t < 53.5 ? 9 : 16} k="ph">
              <Phone saldo={t >= 53.4} />
            </Shaky>
          </div>
          <Pop at={50.56} x={60} y={320}>
            <Bubble w={480} tail="right" size={50}>
              Tangan gemeteran terus... 🤔
            </Bubble>
          </Pop>
          <Pop at={53.52} x={820} y={980}>
            <SiHalus size={220} variant="vibe" mood="laugh" />
          </Pop>
          <Sticker at={51.6} out={53.4} y={1080} bg={C.cyan} size={60}>
            GETARAN? 🛠️
          </Sticker>
          <Sticker at={53.5} y={1080} bg={C.pink} color={C.white} size={60}>
            ATAU LIAT SALDO? 💸
          </Sticker>
        </Scene>
      </AbsoluteFill>
    </>
  );
};

export const Ep2: React.FC = () => (
  <Episode ep={2} accent={W2} tint="#123A4A" words={words} endStart={EP2.endStart} revealAt={EP2.revealAt} flashes={[8.32]} warp={warp}>
    <Ep2Scenes />
  </Episode>
);
