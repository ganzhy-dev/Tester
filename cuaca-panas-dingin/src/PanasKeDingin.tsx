import "./fonts";
import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  HookCold,
  HookHot,
  HookLabil,
  SceneAlert,
  SceneAnjlok,
  SceneBlackout,
  SceneBoom,
  SceneCTA,
  SceneDiagram,
  SceneElNino,
  SceneFakta,
  SceneIntinya,
  SceneKenapa,
  SceneNov,
  SceneTips,
} from "./Scenes";
import { T, punch, shake } from "./timeline";
import { Embers, Flash, HeatWaves, Hud, Rain, Sky, StormClouds, Sun, Vignettes } from "./Weather";

/** Kamera: guncangan + zoom punch. Dipisah supaya hanya ini yang re-render tiap frame. */
const Camera: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const s = shake(t);
  return (
    <AbsoluteFill
      style={{
        translate: `${s.x}px ${s.y}px`,
        rotate: `${s.r}deg`,
        scale: String(1.05 * punch(t)),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const scenes: { name: string; from: number; to: number; C: React.FC }[] = [
  { name: "Hook – Panas", from: T.hookHot, to: T.hookCold, C: HookHot },
  { name: "Hook – Dingin", from: T.hookCold, to: T.hookLabil, C: HookCold },
  { name: "Hook – Labil", from: T.hookLabil, to: T.nov, C: HookLabil },
  { name: "Akhir November", from: T.nov, to: T.fakta, C: SceneNov },
  { name: "Fakta 18%", from: T.fakta, to: T.elnino, C: SceneFakta },
  { name: "El Niño", from: T.elnino, to: T.kenapa, C: SceneElNino },
  { name: "Kenapa hujan?", from: T.kenapa, to: T.diagram, C: SceneKenapa },
  { name: "Diagram konveksi", from: T.diagram, to: T.blackout, C: SceneDiagram },
  { name: "DUARR", from: T.boom, to: T.anjlok, C: SceneBoom },
  { name: "Suhu anjlok", from: T.anjlok, to: T.alert, C: SceneAnjlok },
  { name: "Peringatan BMKG", from: T.alert, to: T.tips, C: SceneAlert },
  { name: "Tips", from: T.tips, to: T.intinya, C: SceneTips },
  { name: "Intinya", from: T.intinya, to: T.cta, C: SceneIntinya },
  { name: "CTA komen", from: T.cta, to: T.end, C: SceneCTA },
];

export const PanasKeDingin: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("music.wav")} />
      <Camera>
        <Sky />
        <Sun />
        <HeatWaves />
        <StormClouds />
        <Embers />
        {scenes.map(({ name, from, to, C }) => (
          <Sequence
            key={name}
            name={name}
            from={Math.round(from * fps)}
            durationInFrames={Math.round((to - from) * fps)}
          >
            <C />
          </Sequence>
        ))}
        <Rain />
      </Camera>
      <Vignettes />
      <Hud />
      <Flash />
      <Sequence
        name="Blackout"
        from={Math.round(T.blackout * fps)}
        durationInFrames={Math.round((T.boom - T.blackout) * fps)}
      >
        <SceneBlackout />
      </Sequence>
    </AbsoluteFill>
  );
};
