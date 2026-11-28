import React from "react";
import { AbsoluteFill } from "remotion";
import { SiHalus } from "../Characters";
import { Episode, warpOldToNew } from "../Episode";
import { Sticker } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep16.words";
import { warp } from "./ep16.warp";

/** Semua waktu = detik isi utama (data/ep16_words.json). Tema HANGAT — teks gelap di latar terang. */
export const EP16 = { endStart: 60, revealAt: 62 };

const Ep16Scenes: React.FC = () => (
  <AbsoluteFill>
    <Scene a={0} b={EP16.endStart} zoom={false}>
      <Sticker at={0.1} y={300}>TODO EP16</Sticker>
      <div style={{ position: "absolute", left: 380, top: 700 }}>
        <SiHalus size={320} variant="salad" />
      </div>
    </Scene>
  </AbsoluteFill>
);

const W = warp.length ? warp : undefined;

export const Ep16: React.FC = () => (
  <Episode ep={16} accent="#3FA34D" tint="#CFE8C6" words={words} endStart={W ? warpOldToNew(EP16.endStart, W) : EP16.endStart} revealAt={W ? warpOldToNew(EP16.revealAt, W) : EP16.revealAt} warp={W} flashes={[]}>
    <Ep16Scenes />
  </Episode>
);
