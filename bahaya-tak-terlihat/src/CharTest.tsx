import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "./brand";
import { SiHalus, Worker } from "./Characters";
export const CharTest: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(${C.bg1},${C.bg2})`, flexWrap: "wrap", flexDirection: "row", alignContent: "flex-start", gap: 10, padding: 20 }}>
    <Worker size={420} expr="normal" pose="wave" tie />
    <Worker size={420} expr="sleepy" pose="idle" shirt="#7C5CFF" />
    <Worker size={420} expr="shocked" pose="coverEars" helmet vest earplug />
    <Worker size={420} expr="happy" pose="point" shirt={C.lime} />
    <Worker size={420} expr="dizzy" pose="holdTool" helmet vest />
    <Worker size={420} expr="pain" pose="shrug" shirt={C.pink} />
    <SiHalus size={380} variant="co2" />
    <SiHalus size={380} variant="vibe" mood="laugh" />
    <SiHalus size={380} variant="noise" />
    <SiHalus size={380} variant="co2" mood="busted" />
  </AbsoluteFill>
);
