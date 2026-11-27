import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SiHalus } from "../Characters";
import { Episode } from "../Episode";
import { Sticker } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep12.words";

/** Semua waktu = detik isi utama (data/ep12_words.json). Tema TERANG (latar pastel) — pakai warna gelap/ink untuk teks. */
export const EP12 = { endStart: 60, revealAt: 62 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const Ep12Scenes: React.FC = () => {
  useT();
  return (
    <AbsoluteFill>
      <Scene a={0} b={EP12.endStart} zoom={false}>
        <Sticker at={0.1} y={300}>TODO EP12</Sticker>
        <div style={{ position: "absolute", left: 380, top: 700 }}>
          <SiHalus size={320} variant="slip" />
        </div>
      </Scene>
    </AbsoluteFill>
  );
};

export const Ep12: React.FC = () => (
  <Episode ep={12} accent="#2FB4D8" tint="#CFF3FA" words={words} endStart={EP12.endStart} revealAt={EP12.revealAt} flashes={[]}>
    <Ep12Scenes />
  </Episode>
);
