import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SiHalus } from "../Characters";
import { Episode, warpOldToNew } from "../Episode";
import { Sticker } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep13.words";
import { warp } from "./ep13.warp";

/** Semua waktu = detik isi utama (data/ep13_words.json). Tema HANGAT (latar pastel) — pakai warna gelap/ink untuk teks. */
export const EP13 = { endStart: 60, revealAt: 62 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const Ep13Scenes: React.FC = () => {
  useT();
  return (
    <AbsoluteFill>
      <Scene a={0} b={EP13.endStart} zoom={false}>
        <Sticker at={0.1} y={300}>TODO EP13</Sticker>
        <div style={{ position: "absolute", left: 380, top: 700 }}>
          <SiHalus size={320} variant="lpg" />
        </div>
      </Scene>
    </AbsoluteFill>
  );
};

const W = warp.length ? warp : undefined;

export const Ep13: React.FC = () => (
  <Episode ep={13} accent="#E8663D" tint="#F6C2A0" words={words} endStart={W ? warpOldToNew(EP13.endStart, W) : EP13.endStart} revealAt={W ? warpOldToNew(EP13.revealAt, W) : EP13.revealAt} warp={W} flashes={[]}>
    <Ep13Scenes />
  </Episode>
);
