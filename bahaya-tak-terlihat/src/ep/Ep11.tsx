import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SiHalus } from "../Characters";
import { Episode } from "../Episode";
import { Sticker } from "../Kit";
import { Scene } from "./Ep1";
import { words } from "./ep11.words";

/** Semua waktu = detik isi utama (data/ep11_words.json). Tema TERANG (latar pastel) — pakai warna gelap/ink untuk teks. */
export const EP11 = { endStart: 60, revealAt: 62 };

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

const Ep11Scenes: React.FC = () => {
  useT();
  return (
    <AbsoluteFill>
      <Scene a={0} b={EP11.endStart} zoom={false}>
        <Sticker at={0.1} y={300}>TODO EP11</Sticker>
        <div style={{ position: "absolute", left: 380, top: 700 }}>
          <SiHalus size={320} variant="load" />
        </div>
      </Scene>
    </AbsoluteFill>
  );
};

export const Ep11: React.FC = () => (
  <Episode ep={11} accent="#A77BC9" tint="#E3C4D6" words={words} endStart={EP11.endStart} revealAt={EP11.revealAt} flashes={[]}>
    <Ep11Scenes />
  </Episode>
);
