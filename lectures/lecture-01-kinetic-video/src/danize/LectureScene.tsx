import React from "react";
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {SentenceSlide} from "./SentenceSlide";
import {displayFontStack} from "../fonts";
import {RULE_TEXT, SENTENCE_SCHEDULE} from "./schedule";

const RuleBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame: frame - 6, fps, config: {damping: 20}});
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const y = interpolate(progress, [0, 1], [24, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 72,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${y}px)`
      }}
    >
      <div
        style={{
          fontFamily: displayFontStack,
          fontSize: 30,
          fontWeight: 600,
          color: "#F59E0B",
          textShadow: "0 0 22px rgba(245,158,11,0.45)",
          background: "rgba(15,23,42,0.55)",
          padding: "14px 36px",
          borderRadius: 999,
          border: "1px solid rgba(245,158,11,0.3)"
        }}
      >
        {RULE_TEXT}
      </div>
    </div>
  );
};

// Scene 2: 10개 문장을 순서대로 배치하고, 화면 하단에는 문법 규칙 바를
// 계속 고정해 둔다(문장이 바뀌어도 다시 애니메이션되지 않도록 개별
// SentenceSlide 밖에 둔다).
export const LectureScene: React.FC = () => {
  let cursor = 0;
  return (
    <AbsoluteFill>
      {SENTENCE_SCHEDULE.map((schedule) => {
        const from = cursor;
        cursor += schedule.durationInFrames;
        return (
          <Sequence key={schedule.index} from={from} durationInFrames={schedule.durationInFrames}>
            <SentenceSlide schedule={schedule} sentenceNumber={schedule.index + 1} total={SENTENCE_SCHEDULE.length} />
          </Sequence>
        );
      })}
      <RuleBar />
    </AbsoluteFill>
  );
};
