import React from "react";
import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

type Props = {
  text: string;
  frame: number; // 이 문구가 속한 비트 기준 로컬 프레임
  delay?: number; // 시작을 늦출 프레임 수
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight?: number;
  letterSpacing?: string;
  textShadow?: string;
  stagger?: number; // 단어 사이 등장 간격(프레임)
};

// 단어 단위로 스프링 애니메이션을 살짝 어긋나게(stagger) 적용해
// 정적인 페이드가 아니라 "타이핑되듯 튀어 오르는" 키네틱 타이포그래피 느낌을 낸다.
export const KineticWords: React.FC<Props> = ({
  text,
  frame,
  delay = 0,
  fontSize,
  fontFamily,
  color,
  fontWeight = 700,
  letterSpacing,
  textShadow,
  stagger = 3
}) => {
  const {fps} = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        rowGap: "0.1em"
      }}
    >
      {words.map((w, i) => {
        const local = frame - delay - i * stagger;
        const progress = spring({
          frame: local,
          fps,
          config: {damping: 16, mass: 0.6, stiffness: 140}
        });
        const opacity = interpolate(progress, [0, 1], [0, 1]);
        const translateY = interpolate(progress, [0, 1], [22, 0]);
        const scale = interpolate(progress, [0, 1], [0.88, 1]);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginInline: "0.2em",
              fontFamily,
              fontSize,
              fontWeight,
              color,
              letterSpacing,
              textShadow,
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
