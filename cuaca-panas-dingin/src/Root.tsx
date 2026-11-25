import React from "react";
import { Composition } from "remotion";
import { PanasKeDingin } from "./PanasKeDingin";
import { DURATION_S, FPS, HEIGHT, WIDTH } from "./timeline";

/**
 * Komposisi 1080x1920 @60fps. Render 4K (2160x3840) dengan --scale=2,
 * lihat script "render:4k" di package.json.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PanasKeDingin"
      component={PanasKeDingin}
      durationInFrames={DURATION_S * FPS}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
