import React from "react";
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from "remotion";
import {DanizeBackdrop} from "./DanizeBackdrop";
import {GlassPanel} from "./GlassPanel";
import {SplitFlapBoard} from "../splitflap/SplitFlapBoard";
import {KineticWords} from "../KineticWords";
import {padCenter} from "../splitflap/pad";
import {displayFontStack} from "../fonts";
import {COLORS} from "./theme";
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
          fontSize={116}
          fontFamily={displayFontStack}
          color={COLORS.english}
          fontWeight={700}
          textShadow="0 12px 32px rgba(29,78,216,0.25)"
          stagger={4}
        />
        <GlassPanel padding="22px 30px">
          <SplitFlapBoard
            current={blank}
            next={badge}
            columns={BADGE_COLUMNS}
            triggerFrame={INTRO_BADGE_START}
            staggerFrames={2}
            cellWidth={CELL_W}
            cellHeight={CELL_H}
            fontSize={28}
            fontFamily={displayFontStack}
            currentColor={COLORS.textDark}
            nextColor={COLORS.textDark}
            cardBg={COLORS.cardBg}
            gap={3}
          />
        </GlassPanel>
      </div>
    </AbsoluteFill>
  );
};
