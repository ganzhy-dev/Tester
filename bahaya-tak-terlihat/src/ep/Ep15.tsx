import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SiHalus } from "../Characters";
import { Episode, warpOldToNew } from "../Episode";
import { Sticker } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep15.words";
import { warp } from "./ep15.warp";

/** Semua waktu = detik isi utama (data/ep15_words.json). Tema HANGAT (latar pastel) — pakai warna gelap/ink untuk teks. */
export const EP15 = { endStart: 60, revealAt: 62 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const Ep15Scenes: React.FC = () => {
  useT();
  return (
    <AbsoluteFill>
      <Scene a={0} b={EP15.endStart} zoom={false}>
        <Sticker at={0.1} y={300}>TODO EP15</Sticker>
        <div style={{ position: "absolute", left: 380, top: 700 }}>
          <SiHalus size={320} variant="steam" />
        </div>
      </Scene>
    </AbsoluteFill>
  );
};

const W = warp.length ? warp : undefined;

export const Ep15: React.FC = () => (
  <Episode ep={15} accent="#E0566F" tint="#F3C1C8" words={words} endStart={W ? warpOldToNew(EP15.endStart, W) : EP15.endStart} revealAt={W ? warpOldToNew(EP15.revealAt, W) : EP15.revealAt} warp={W} flashes={[]}>
    <Ep15Scenes />
  </Episode>
);
