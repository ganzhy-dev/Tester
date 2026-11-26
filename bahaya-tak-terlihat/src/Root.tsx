import React from "react";
import { Composition } from "remotion";
import { CharTest } from "./CharTest";
import { FPS, H, W } from "./brand";
import { EP1, Ep1 } from "./ep/Ep1";
import { EP2, Ep2 } from "./ep/Ep2";
import { EP3, Ep3 } from "./ep/Ep3";

/** 1080x1920 @60fps. Render 4K (2160x3840) dengan --scale=2. */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="EP1-CO2" component={Ep1} durationInFrames={Math.ceil(EP1.dur * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="EP2-Getaran" component={Ep2} durationInFrames={Math.ceil(EP2.dur * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="EP3-Bising" component={Ep3} durationInFrames={Math.ceil(EP3.dur * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="CharTest" component={CharTest} durationInFrames={60} fps={FPS} width={W} height={H} />
  </>
);
