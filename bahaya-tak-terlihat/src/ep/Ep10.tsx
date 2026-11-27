import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SiHalus } from "../Characters";
import { Episode } from "../Episode";
import { Sticker } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep10.words";

/** Semua waktu = detik isi utama (data/ep10_words.json). Tema TERANG (latar pastel) — pakai warna gelap/ink untuk teks. */
export const EP10 = { endStart: 60, revealAt: 62 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const Ep10Scenes: React.FC = () => {
  useT();
  return (
    <AbsoluteFill>
      <Scene a={0} b={EP10.endStart} zoom={false}>
        <Sticker at={0.1} y={300}>TODO EP10</Sticker>
        <div style={{ position: "absolute", left: 380, top: 700 }}>
          <SiHalus size={320} variant="volt" />
        </div>
      </Scene>
    </AbsoluteFill>
  );
};

export const Ep10: React.FC = () => (
  <Episode ep={10} accent="#FFC21A" tint="#FFE9A3" words={words} endStart={EP10.endStart} revealAt={EP10.revealAt} flashes={[]}>
    <Ep10Scenes />
  </Episode>
);
