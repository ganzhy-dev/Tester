import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SiHalus } from "../Characters";
import { Episode } from "../Episode";
import { Sticker } from "../Kit";
import { S } from "../PropsStress";
import { Scene } from "./Ep1";
import { words } from "./ep9.words";

/** Semua waktu = detik isi utama (data/ep9_words.json), tanpa warp. Hook & CTA diatur Episode.tsx */
export const EP9 = { endStart: 60.64, revealAt: 63.0 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const Ep9Scenes: React.FC = () => {
  useT();
  return (
    <AbsoluteFill>
      <Scene a={0} b={EP9.endStart} zoom={false}>
        <Sticker at={0.1} y={300}>TODO EP9</Sticker>
        <div style={{ position: "absolute", left: 380, top: 700 }}>
          <SiHalus size={320} variant="doom" />
        </div>
      </Scene>
    </AbsoluteFill>
  );
};

export const Ep9: React.FC = () => (
  <Episode ep={9} accent={S.blue} tint="#16204F" words={words} endStart={EP9.endStart} revealAt={EP9.revealAt} flashes={[]}>
    <Ep9Scenes />
  </Episode>
);
