import "./brand";
import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, clamp } from "./brand";
import { HalusVariant, SiHalus } from "./Characters";
import { Backdrop, Captions, HandleTag, Scanner, Word, flashAt } from "./Kit";
import { Cover1, Cover2, Cover3, Cover4, Cover5, Cover6, Cover7, Cover8, Cover9 } from "./Covers";
import { HOOKCTA } from "./ep/hookcta";

// lazy (hindari impor melingkar Covers -> Ep2 -> Episode)
const getCover = (ep: number): React.FC => [Cover1, Cover2, Cover3, Cover4, Cover5, Cover6, Cover7, Cover8, Cover9][ep - 1];
const easeIn = (x: number) => x * x * x;

/** Cold open 3-5 dtk: frame pertama = cover, lalu push-in + kalimat hook (taruhan/stakes), diakhiri whip-zoom */
const HookIntro: React.FC<{ ep: number; words: Word[]; dur: number }> = ({ ep, words, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const Cov = getCover(ep);
  const push = 1 + 0.07 * interpolate(t, [0, dur], [0, 1], clamp);
  const whip = easeIn(interpolate(t, [dur - 0.3, dur + 0.28], [0, 1], clamp));
  const fade = interpolate(t, [dur - 0.02, dur + 0.28], [1, 0], clamp);
  // getar kecil saat kata penting diucapkan
  const hot = words.find((w) => w.hl && t >= w.start && t < w.end + 0.12);
  const k = hot ? Math.max(0, 1 - (t - hot.start) / (hot.end - hot.start + 0.12)) : 0;
  const sx = k * 9 * Math.sin(t * 95);
  const sy = k * 6 * Math.cos(t * 77);
  const band = interpolate(t, [0.12, 0.4], [0, 1], clamp) * fade;
  const flash = interpolate(t, [dur - 0.12, dur, dur + 0.22], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ opacity: fade, scale: String(push * (1 + 0.55 * whip)), translate: `${sx}px ${sy}px` }}>
        <Cov />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: band, background: "linear-gradient(180deg, rgba(20,11,36,0) 62%, rgba(20,11,36,0.82) 71%, rgba(20,11,36,0.82) 85%, rgba(20,11,36,0) 95%)" }} />
      {t > 0.1 && t < dur && <div style={{ opacity: band }}><Captions words={words} y={1390} /></div>}
      {flash > 0.01 && <AbsoluteFill style={{ background: C.white, opacity: flash * 0.9 }} />}
    </AbsoluteFill>
  );
};

/** Gelembung ajakan komen, muncul saat narator bertanya */
const CommentBubble: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const s = spring({ frame, fps, config: { damping: 11, stiffness: 200 } });
  const ws = text.split(" ");
  const shown = Math.ceil(interpolate(t, [0.05, Math.max(0.6, dur * 0.7)], [0, ws.length], clamp));
  const wob = Math.sin(t * Math.PI * 2.2) * 1.5;
  return (
    <div style={{ position: "absolute", top: 820, left: 70, right: 70, opacity: s, scale: String(interpolate(s, [0, 1], [0.6, 1])), rotate: `${-2 + wob * 0.4}deg` }}>
      <div
        style={{
          position: "relative",
          background: C.cream,
          border: `8px solid ${C.ink}`,
          borderRadius: 48,
          boxShadow: `0 14px 0 ${C.ink}`,
          padding: "70px 50px 46px",
          textAlign: "center",
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: 66,
          lineHeight: 1.12,
          color: C.ink,
          minHeight: 250,
        }}
      >
        {ws.map((w, i) => (
          <span key={i} style={{ opacity: i < shown ? 1 : 0, color: i < shown && i === shown - 1 && t < dur * 0.7 ? C.pink : C.ink }}>
            {w}{" "}
          </span>
        ))}
        <div
          style={{
            position: "absolute",
            top: -44,
            left: "50%",
            translate: "-50% 0",
            whiteSpace: "nowrap",
            fontFamily: HEAD,
            fontSize: 58,
            color: C.white,
            background: C.pink,
            border: `7px solid ${C.ink}`,
            borderRadius: 999,
            padding: "6px 36px 10px",
            WebkitTextStroke: `8px ${C.ink}`,
            paintOrder: "stroke fill",
            scale: String(1 + 0.05 * Math.sin(t * Math.PI * 3.4)),
          }}
        >
          💬 JAWAB DI KOMEN 👇
        </div>
        <svg width={90} height={70} style={{ position: "absolute", bottom: -66, right: 120 }}>
          <path d="M6 0 L84 0 L70 62 Z" fill={C.cream} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
          <rect x={0} y={-12} width={90} height={14} fill={C.cream} />
        </svg>
      </div>
    </div>
  );
};


/** Peta waktu lama -> baru (piecewise linear) */
export const warpOldToNew = (x: number, w: [number, number][]) => {
  for (let i = 0; i < w.length - 1; i++) {
    const [oA, nA] = w[i];
    const [oB, nB] = w[i + 1];
    if (x >= oA && x <= oB) return nA + ((x - oA) * (nB - nA)) / (oB - oA);
  }
  return x - w[w.length - 1][0] + w[w.length - 1][1];
};

/** End card seragam untuk semua episode */
export const EndCard: React.FC<{ revealAt: number; ep?: number; ctaAt?: number; ctaText?: string; ctaDur?: number }> = ({ revealAt, ep = 1, ctaAt, ctaText, ctaDur = 3 }) => {
  const trio: HalusVariant[] = ep >= 7 ? ["stress", "doom", "burnout"] : ep >= 4 ? ["heat", "gas", "dust"] : ["co2", "noise", "vibe"];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const s = spring({ frame, fps, config: { damping: 12, stiffness: 180 } });
  const pulse = 1 + 0.05 * Math.sin(t * Math.PI * 3.4);
  // saat ajakan komen: judul & hantu naik-mengecil memberi ruang untuk gelembung komen
  const p = ctaAt === undefined ? 0 : spring({ frame: frame - Math.round(ctaAt * fps), fps, config: { damping: 15, stiffness: 150 } });
  const intro = interpolate(t, [0, 0.25], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${C.bg2}, ${C.bg1} 70%)`, opacity: intro }} />
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, textAlign: "center", scale: String(interpolate(s, [0, 1], [0.5, 1]) * (1 - 0.28 * p)), transformOrigin: "50% 0%", translate: `0px ${-110 * p}px`, opacity: s }}>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 46, color: C.lime, letterSpacing: 6 }}>👁️ SERIAL K3 · IHOH</div>
        <div
          style={{
            fontFamily: HEAD,
            fontSize: 150,
            lineHeight: 0.95,
            color: C.cream,
            WebkitTextStroke: `14px ${C.ink}`,
            paintOrder: "stroke fill",
            textShadow: `0 14px 0 ${C.ink}`,
            marginTop: 20,
          }}
        >
          BAHAYA
          <br />
          <span style={{ color: C.lime }}>TAK TERLIHAT</span>
        </div>
      </div>
      <AbsoluteFill style={{ transformOrigin: "50% 930px", scale: String(1 - 0.38 * p), translate: `0px ${-360 * p}px` }}>
      <Scanner at={revealAt} dur={0.8} top={900} height={420}>
        <div style={{ position: "absolute", top: 930, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 10 }}>
          <SiHalus size={300} variant={trio[0]} mood="laugh" />
          <SiHalus size={330} variant={trio[1]} mood="grin" />
          <SiHalus size={300} variant={trio[2]} mood="laugh" />
        </div>
      </Scanner>
      </AbsoluteFill>
      {ctaAt !== undefined && ctaText && (
        <Sequence from={Math.round(ctaAt * fps)} layout="none">
          <CommentBubble text={ctaText} dur={ctaDur} />
        </Sequence>
      )}
      <div style={{ position: "absolute", top: 1330, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: interpolate(t, [0.3, 0.6], [0, 1], clamp) }}>
        <div
          style={{
            fontFamily: HEAD,
            fontSize: 70,
            color: C.ink,
            background: C.lime,
            padding: "18px 50px 22px",
            borderRadius: 999,
            border: `7px solid ${C.ink}`,
            boxShadow: `0 12px 0 ${C.ink}`,
            scale: String(pulse),
          }}
        >
          FOLLOW @bahayataktelihat
        </div>
      </div>
    </AbsoluteFill>
  );
};

type EpisodeProps = {
  ep: number;
  accent: string;
  tint: string;
  words: Word[];
  endStart: number;
  revealAt: number;
  flashes?: number[];
  /** Titik jangkar [detik lama, detik baru] untuk menyesuaikan adegan ke voice-over baru */
  warp?: [number, number][];
  children: React.ReactNode;
};

/** Bungkus episode: audio, cold open (hook), isi utama, end card + ajakan komen */
export const Episode: React.FC<EpisodeProps> = (props) => {
  const { fps } = useVideoConfig();
  const hc = HOOKCTA[props.ep];
  const introF = Math.round(hc.hookDur * fps);
  return (
    <AbsoluteFill style={{ background: C.bg1, overflow: "hidden" }}>
      <Audio src={staticFile(`audio/ep${props.ep}_mix.wav`)} />
      <Sequence name="Isi utama" from={introF}>
        <EpisodeBody {...props} ctaAt={hc.ctaAt} ctaText={hc.ctaText} ctaDur={hc.ctaDur} />
      </Sequence>
      <Sequence name="Hook (cold open)" durationInFrames={introF + Math.round(0.32 * fps)}>
        <HookIntro ep={props.ep} words={hc.hookWords} dur={hc.hookDur} />
      </Sequence>
    </AbsoluteFill>
  );
};

const EpisodeBody: React.FC<EpisodeProps & { ctaAt: number; ctaText: string; ctaDur: number }> = ({ ep, accent, tint, words, endStart, revealAt, flashes = [], warp, children, ctaAt, ctaText, ctaDur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = flashAt(t, warp ? flashes.map((x) => warpOldToNew(x, warp)) : flashes);
  return (
    <AbsoluteFill style={{ background: C.bg1, overflow: "hidden" }}>
      <Backdrop accent={accent} tint={tint} />
      {warp ? (
        warp.slice(0, -1).map(([oA, nA], i) => {
          const [oB, nB] = warp[i + 1];
          const nAf = Math.round(nA * fps);
          const nBf = Math.round(nB * fps);
          const oAf = Math.round(oA * fps);
          const oBf = Math.round(oB * fps);
          if (nBf <= nAf || oBf <= oAf) return null;
          // durationInFrames dihitung dalam frame konten (jam anak); panjang di induk = oB-oA / rate = nB-nA
          return (
            <Sequence key={i} name={`Beat ${i + 1}`} from={nAf} durationInFrames={oBf - oAf} trimBefore={oAf} playbackRate={(oBf - oAf) / (nBf - nAf)} premountFor={0}>
              {children}
            </Sequence>
          );
        })
      ) : (
        <Sequence name="Scenes" durationInFrames={Math.round(endStart * fps)} layout="none">
          {children}
        </Sequence>
      )}
      <Sequence name="End card" from={Math.round(endStart * fps)}>
        <EndCard revealAt={revealAt - endStart} ep={ep} ctaAt={ctaAt - endStart} ctaText={ctaText} ctaDur={ctaDur} />
      </Sequence>
      {t < endStart && <Captions words={words.filter((w) => w.start < endStart - 0.05)} />}
      <HandleTag ep={`EP ${ep}`} />
      {f > 0.01 && <AbsoluteFill style={{ background: C.white, opacity: f * 0.85 }} />}
    </AbsoluteFill>
  );
};
