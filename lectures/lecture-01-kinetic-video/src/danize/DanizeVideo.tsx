import React from "react";
import {AbsoluteFill, Sequence} from "remotion";
import {DanizeBackdrop} from "./DanizeBackdrop";
import {IntroScene} from "./IntroScene";
import {LectureScene} from "./LectureScene";
import {ClosingScene} from "./ClosingScene";
import {INTRO_SCENE_FRAMES, LECTURE_SCENE_FRAMES, CLOSING_SCENE_FRAMES} from "./schedule";

// 데이나이즈 영어 — 실제 기계식 스플릿플랩 전광판 + 내레이션 비디오.
// 웹 UI(버튼/진행바/플레이어 테두리) 없이 순수 비디오 프레임만 렌더링한다.
export const DanizeVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: "#0B0F17"}}>
      <DanizeBackdrop />
      <Sequence from={0} durationInFrames={INTRO_SCENE_FRAMES}>
        <IntroScene />
      </Sequence>
      <Sequence from={INTRO_SCENE_FRAMES} durationInFrames={LECTURE_SCENE_FRAMES}>
        <LectureScene />
      </Sequence>
      <Sequence from={INTRO_SCENE_FRAMES + LECTURE_SCENE_FRAMES} durationInFrames={CLOSING_SCENE_FRAMES}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
};
