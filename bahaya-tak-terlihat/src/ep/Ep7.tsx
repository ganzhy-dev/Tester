import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SiHalus } from "../Characters";
import { Episode } from "../Episode";
import { Sticker } from "../Kit";
import { S } from "../PropsStress";
import { Scene } from "./Ep1";
import { words } from "./ep7.words";

/** Semua waktu = detik isi utama (data/ep7_words.json), tanpa warp. Hook & CTA diatur Episode.tsx */
export const EP7 = { endStart: 70.05, revealAt: 72.19 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const Ep7Scenes: React.FC = () => {
  useT();
  return (
    <AbsoluteFill>
      <Scene a={0} b={EP7.endStart} zoom={false}>
        <Sticker at={0.1} y={300}>TODO EP7</Sticker>
        <div style={{ position: "absolute", left: 380, top: 700 }}>
          <SiHalus size={320} variant="stress" />
        </div>
      </Scene>
    </AbsoluteFill>
  );
};

export const Ep7: React.FC = () => (
  <Episode ep={7} accent={S.red} tint="#4A1426" words={words} endStart={EP7.endStart} revealAt={EP7.revealAt} flashes={[]}>
    <Ep7Scenes />
  </Episode>
);
