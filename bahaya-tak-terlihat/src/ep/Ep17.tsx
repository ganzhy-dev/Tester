import React from "react";
import { AbsoluteFill } from "remotion";
import { SiHalus } from "../Characters";
import { Episode, warpOldToNew } from "../Episode";
import { Sticker } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep17.words";
import { warp } from "./ep17.warp";

/** Semua waktu = detik isi utama (data/ep17_words.json). Tema HANGAT — teks gelap di latar terang. */
export const EP17 = { endStart: 60, revealAt: 62 };

const Ep17Scenes: React.FC = () => (
  <AbsoluteFill>
    <Scene a={0} b={EP17.endStart} zoom={false}>
      <Sticker at={0.1} y={300}>TODO EP17</Sticker>
      <div style={{ position: "absolute", left: 380, top: 700 }}>
        <SiHalus size={320} variant="finish" />
      </div>
    </Scene>
  </AbsoluteFill>
);

const W = warp.length ? warp : undefined;

export const Ep17: React.FC = () => (
  <Episode ep={17} accent="#E8743B" tint="#F7CDB0" words={words} endStart={W ? warpOldToNew(EP17.endStart, W) : EP17.endStart} revealAt={W ? warpOldToNew(EP17.revealAt, W) : EP17.revealAt} warp={W} flashes={[]}>
    <Ep17Scenes />
  </Episode>
);
