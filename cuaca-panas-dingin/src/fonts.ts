import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const FONT = "InterDisplay";

const weights: [string, string][] = [
  ["500", "InterDisplay-Medium.otf"],
  ["600", "InterDisplay-SemiBold.otf"],
  ["700", "InterDisplay-Bold.otf"],
  ["800", "InterDisplay-ExtraBold.otf"],
  ["900", "InterDisplay-Black.otf"],
];

for (const [weight, file] of weights) {
  loadFont({ family: FONT, url: staticFile(`fonts/${file}`), weight });
}
