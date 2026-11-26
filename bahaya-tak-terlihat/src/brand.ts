import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

/** Identitas visual @bahayataktelihat */
export const C = {
  bg1: "#1A1030",
  bg2: "#2E1A57",
  ink: "#140B24",
  lime: "#C8FF3D",
  pink: "#FF4F8B",
  cyan: "#49E3FF",
  cream: "#FFF3E2",
  yellow: "#FFD23F",
  orange: "#FF8A3D",
  skin: "#C98B5E",
  skinShade: "#A86F47",
  white: "#FFFFFF",
};

export const HEAD = "LilitaOne";
export const BODY = "Baloo2";

loadFont({ family: HEAD, url: staticFile("fonts/LilitaOne.woff2"), weight: "400" });
loadFont({ family: BODY, url: staticFile("fonts/baloo-2-latin-700-normal.woff2"), weight: "700" });
loadFont({ family: BODY, url: staticFile("fonts/baloo-2-latin-800-normal.woff2"), weight: "800" });

export const FPS = 60;
export const W = 1080;
export const H = 1920;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);

/** Garis tepi tebal khas komik */
export const OUTLINE = 7;
