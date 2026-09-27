import React from "react";
import {Composition} from "remotion";
import {KineticVideo, TRANSITION_FRAMES} from "./KineticVideo";
import {BEATS, BEAT_FRAMES, FPS} from "./timeline";

// TransitionSeries의 각 크로스페이드 전환은 앞뒤 시퀀스를 그만큼 겹치므로
// 실제 합성 길이는 비트 프레임 합계에서 전환 구간 총합을 뺀 값이다.
const rawTotal = BEAT_FRAMES.reduce((a, b) => a + b, 0);
const overlap = (BEATS.length - 1) * TRANSITION_FRAMES;
export const TOTAL_COMPOSITION_FRAMES = rawTotal - overlap;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="KineticVideo"
      component={KineticVideo}
      durationInFrames={TOTAL_COMPOSITION_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
