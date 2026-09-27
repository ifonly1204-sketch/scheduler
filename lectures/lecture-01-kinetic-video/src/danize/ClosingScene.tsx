import React from "react";
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {KineticWords} from "../KineticWords";
import {displayFontStack} from "../fonts";
import {BRAND, RULE_TEXT} from "./schedule";

// Scene 3: 문법 규칙을 다시 한 번 크게 강조하며 내레이션하고, 브랜드로 마무리.
export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const brandProgress = spring({frame: frame - 40, fps, config: {damping: 18}});
  const brandOpacity = interpolate(brandProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 56}}>
      <Audio src={staticFile("audio/rule.mp3")} />
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 56, maxWidth: 1600}}>
        <KineticWords
          text={RULE_TEXT}
          frame={frame}
          fontSize={48}
          fontFamily={displayFontStack}
          color="#F59E0B"
          fontWeight={700}
          textShadow="0 0 30px rgba(245,158,11,0.5)"
          stagger={2}
        />
        <div
          style={{
            fontFamily: displayFontStack,
            fontSize: 56,
            fontWeight: 700,
            color: "#3B82F6",
            textShadow: "0 0 40px rgba(59,130,246,0.55)",
            opacity: brandOpacity
          }}
        >
          {BRAND}
        </div>
      </div>
    </AbsoluteFill>
  );
};
