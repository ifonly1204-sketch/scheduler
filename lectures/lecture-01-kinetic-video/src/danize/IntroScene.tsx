import React from "react";
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from "remotion";
import {DanizeBackdrop} from "./DanizeBackdrop";
import {SplitFlapBoard} from "../splitflap/SplitFlapBoard";
import {KineticWords} from "../KineticWords";
import {padCenter} from "../splitflap/pad";
import {displayFontStack} from "../fonts";
import {BRAND, BADGE, INTRO_BADGE_START} from "./schedule";

const BADGE_COLUMNS = BADGE.length;
const CELL_W = 26;
const CELL_H = 56;

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const blank = padCenter("", BADGE_COLUMNS);
  const badge = padCenter(BADGE, BADGE_COLUMNS);

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
      <DanizeBackdrop />
      <Audio src={staticFile("audio/intro.mp3")} />
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 46}}>
        <KineticWords
          text={BRAND}
          frame={frame}
          delay={4}
          fontSize={128}
          fontFamily={displayFontStack}
          color="#3B82F6"
          fontWeight={700}
          textShadow="0 0 40px rgba(59,130,246,0.55)"
          stagger={4}
        />
        <SplitFlapBoard
          current={blank}
          next={badge}
          columns={BADGE_COLUMNS}
          triggerFrame={INTRO_BADGE_START}
          staggerFrames={2}
          cellWidth={CELL_W}
          cellHeight={CELL_H}
          fontSize={30}
          fontFamily={displayFontStack}
          currentColor="#F8FAFC"
          nextColor="#F8FAFC"
          cardBg="#0F172A"
          gap={3}
        />
      </div>
    </AbsoluteFill>
  );
};
