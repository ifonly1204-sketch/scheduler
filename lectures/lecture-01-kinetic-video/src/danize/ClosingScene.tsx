import React from "react";
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {SummaryCard} from "./SummaryCard";
import {KineticWords} from "../KineticWords";
import {displayFontStack} from "../fonts";
import {COLORS} from "./theme";
import {BRAND, SUMMARY_SCHEDULE, BRAND_OUTRO_FRAMES} from "./schedule";

const BrandOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lineProgress = spring({frame, fps, config: {damping: 20}});
  const lineWidth = interpolate(lineProgress, [0, 1], [0, 160]);

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 28}}>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 28}}>
        <KineticWords
          text={BRAND}
          frame={frame}
          delay={2}
          fontSize={104}
          fontFamily={displayFontStack}
          color={COLORS.english}
          fontWeight={700}
          textShadow="0 12px 32px rgba(29,78,216,0.25)"
          stagger={4}
        />
        <div style={{width: lineWidth, height: 4, borderRadius: 2, background: COLORS.highlight}} />
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: 강의 요약 3가지를 순서대로 보여주고(각각 내레이션과 함께),
// 마지막에 브랜드로 마무리한다. 인터랙티브 버튼은 넣지 않는다
// (독립형 MP4 비디오이며 클릭할 수 있는 대상이 아니므로).
export const ClosingScene: React.FC = () => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
      {SUMMARY_SCHEDULE.map((schedule) => {
        const from = cursor;
        cursor += schedule.durationInFrames;
        return (
          <Sequence key={schedule.index} from={from} durationInFrames={schedule.durationInFrames}>
            <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
              <SummaryCard schedule={schedule} index={schedule.index} total={SUMMARY_SCHEDULE.length} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <Sequence from={cursor} durationInFrames={BRAND_OUTRO_FRAMES}>
        <BrandOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
