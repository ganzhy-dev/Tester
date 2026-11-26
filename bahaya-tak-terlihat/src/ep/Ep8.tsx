import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SiHalus } from "../Characters";
import { Episode } from "../Episode";
import { Sticker } from "../Kit";
import { S } from "../PropsStress";
import { Scene } from "./Ep1";
import { words } from "./ep8.words";

/** Semua waktu = detik isi utama (data/ep8_words.json), tanpa warp. Hook & CTA diatur Episode.tsx */
export const EP8 = { endStart: 62.79, revealAt: 65.2 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const Ep8Scenes: React.FC = () => {
  useT();
  return (
    <AbsoluteFill>
      <Scene a={0} b={EP8.endStart} zoom={false}>
        <Sticker at={0.1} y={300}>TODO EP8</Sticker>
        <div style={{ position: "absolute", left: 380, top: 700 }}>
          <SiHalus size={320} variant="burnout" />
        </div>
      </Scene>
    </AbsoluteFill>
  );
};

export const Ep8: React.FC = () => (
  <Episode ep={8} accent={S.violet} tint="#231A4E" words={words} endStart={EP8.endStart} revealAt={EP8.revealAt} flashes={[]}>
    <Ep8Scenes />
  </Episode>
);
