import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SiHalus } from "../Characters";
import { Episode, warpOldToNew } from "../Episode";
import { Sticker } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep14.words";
import { warp } from "./ep14.warp";

/** Semua waktu = detik isi utama (data/ep14_words.json). Tema HANGAT (latar pastel) — pakai warna gelap/ink untuk teks. */
export const EP14 = { endStart: 60, revealAt: 62 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const Ep14Scenes: React.FC = () => {
  useT();
  return (
    <AbsoluteFill>
      <Scene a={0} b={EP14.endStart} zoom={false}>
        <Sticker at={0.1} y={300}>TODO EP14</Sticker>
        <div style={{ position: "absolute", left: 380, top: 700 }}>
          <SiHalus size={320} variant="bottle" />
        </div>
      </Scene>
    </AbsoluteFill>
  );
};

const W = warp.length ? warp : undefined;

export const Ep14: React.FC = () => (
  <Episode ep={14} accent="#2E9E83" tint="#CDE8DC" words={words} endStart={W ? warpOldToNew(EP14.endStart, W) : EP14.endStart} revealAt={W ? warpOldToNew(EP14.revealAt, W) : EP14.revealAt} warp={W} flashes={[]}>
    <Ep14Scenes />
  </Episode>
);
