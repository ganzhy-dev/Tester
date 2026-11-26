import React from "react";
import { Composition, Still } from "remotion";
import { Cover1, Cover2, Cover3, Cover4, Cover5, Cover6, Cover7, Cover8, Cover9 } from "./Covers";
import { AvatarA, AvatarB, ProfilePicture } from "./Avatar";
import { CharTest } from "./CharTest";
import { FPS, H, W } from "./brand";
import { HOOKCTA } from "./ep/hookcta";
import { Ep1 } from "./ep/Ep1";
import { Ep2 } from "./ep/Ep2";
import { Ep3 } from "./ep/Ep3";
import { Ep4 } from "./ep/Ep4";
import { Ep5 } from "./ep/Ep5";
import { Ep6 } from "./ep/Ep6";
import { Ep7 } from "./ep/Ep7";
import { Ep8 } from "./ep/Ep8";
import { Ep9 } from "./ep/Ep9";

/** 1080x1920 @60fps. Render 4K (2160x3840) dengan --scale=2. */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="EP1-CO2" component={Ep1} durationInFrames={Math.ceil(HOOKCTA[1].total * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="EP2-Getaran" component={Ep2} durationInFrames={Math.ceil(HOOKCTA[2].total * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="EP3-Bising" component={Ep3} durationInFrames={Math.ceil(HOOKCTA[3].total * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="EP4-Panas" component={Ep4} durationInFrames={Math.ceil(HOOKCTA[4].total * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="EP5-DebuSilika" component={Ep5} durationInFrames={Math.ceil(HOOKCTA[5].total * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="EP6-KarbonMonoksida" component={Ep6} durationInFrames={Math.ceil(HOOKCTA[6].total * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="EP7-Psikosomatik" component={Ep7} durationInFrames={Math.ceil(HOOKCTA[7].total * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="EP8-NotifMalam" component={Ep8} durationInFrames={Math.ceil(HOOKCTA[8].total * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="EP9-Doomscrolling" component={Ep9} durationInFrames={Math.ceil(HOOKCTA[9].total * FPS)} fps={FPS} width={W} height={H} />
    <Still id="Cover-EP1" component={Cover1} width={W} height={H} />
    <Still id="Cover-EP2" component={Cover2} width={W} height={H} />
    <Still id="Cover-EP3" component={Cover3} width={W} height={H} />
    <Still id="Cover-EP4" component={Cover4} width={W} height={H} />
    <Still id="Cover-EP5" component={Cover5} width={W} height={H} />
    <Still id="Cover-EP6" component={Cover6} width={W} height={H} />
    <Still id="Cover-EP7" component={Cover7} width={W} height={H} />
    <Still id="Cover-EP8" component={Cover8} width={W} height={H} />
    <Still id="Cover-EP9" component={Cover9} width={W} height={H} />
    <Still id="Avatar-A" component={AvatarA} width={1080} height={1080} />
    <Still id="Avatar-B" component={AvatarB} width={1080} height={1080} />
    <Still id="ProfilePicture" component={ProfilePicture} width={1080} height={1080} />
    <Composition id="CharTest" component={CharTest} durationInFrames={60} fps={FPS} width={W} height={H} />
  </>
);
