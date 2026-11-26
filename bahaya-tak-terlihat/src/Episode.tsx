import "./brand";
import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, HEAD, clamp } from "./brand";
import { SiHalus } from "./Characters";
import { Backdrop, Captions, HandleTag, Scanner, Word, flashAt } from "./Kit";

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
export const EndCard: React.FC<{ revealAt: number }> = ({ revealAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const s = spring({ frame, fps, config: { damping: 12, stiffness: 180 } });
  const pulse = 1 + 0.05 * Math.sin(t * Math.PI * 3.4);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${C.bg2}, ${C.bg1} 70%)` }} />
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, textAlign: "center", scale: String(interpolate(s, [0, 1], [0.5, 1])), opacity: s }}>
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
      <Scanner at={revealAt} dur={0.8} top={900} height={420}>
        <div style={{ position: "absolute", top: 930, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 10 }}>
          <SiHalus size={300} variant="co2" mood="laugh" />
          <SiHalus size={330} variant="noise" mood="grin" />
          <SiHalus size={300} variant="vibe" mood="laugh" />
        </div>
      </Scanner>
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

/** Bungkus episode: audio, latar, scene, caption karaoke, tag akun, end card */
export const Episode: React.FC<{
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
}> = ({ ep, accent, tint, words, endStart, revealAt, flashes = [], warp, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = flashAt(t, warp ? flashes.map((x) => warpOldToNew(x, warp)) : flashes);
  return (
    <AbsoluteFill style={{ background: C.bg1, overflow: "hidden" }}>
      <Audio src={staticFile(`audio/ep${ep}_mix.wav`)} />
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
        <EndCard revealAt={revealAt - endStart} />
      </Sequence>
      {t < endStart && <Captions words={words.filter((w) => w.start < endStart - 0.05)} />}
      <HandleTag ep={`EP ${ep}`} />
      {f > 0.01 && <AbsoluteFill style={{ background: C.white, opacity: f * 0.85 }} />}
    </AbsoluteFill>
  );
};
