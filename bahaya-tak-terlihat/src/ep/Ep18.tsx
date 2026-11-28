import React from "react";
import { AbsoluteFill } from "remotion";
import { SiHalus } from "../Characters";
import { Episode, warpOldToNew } from "../Episode";
import { Sticker } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep18.words";
import { warp } from "./ep18.warp";

/** Semua waktu = detik isi utama (data/ep18_words.json). Tema HANGAT — teks gelap di latar terang. */
export const EP18 = { endStart: 60, revealAt: 62 };

const Ep18Scenes: React.FC = () => (
  <AbsoluteFill>
    <Scene a={0} b={EP18.endStart} zoom={false}>
      <Sticker at={0.1} y={300}>TODO EP18</Sticker>
      <div style={{ position: "absolute", left: 380, top: 700 }}>
        <SiHalus size={320} variant="powerbank" />
      </div>
    </Scene>
  </AbsoluteFill>
);

const W = warp.length ? warp : undefined;

export const Ep18: React.FC = () => (
  <Episode ep={18} accent="#E0A21F" tint="#F6DFA4" words={words} endStart={W ? warpOldToNew(EP18.endStart, W) : EP18.endStart} revealAt={W ? warpOldToNew(EP18.revealAt, W) : EP18.revealAt} warp={W} flashes={[]}>
    <Ep18Scenes />
  </Episode>
);
