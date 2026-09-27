import React from "react";
import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {displayFontStack} from "./fonts";

type Props = {
  word: string;
  caption: string;
  accent: string;
};

// 짧은 강조 동사(RISE, COLLAPSE 등)를 화면 중앙에 크게, 글자 단위로
// 튀어 오르듯 등장시키는 키네틱 타이포그래피 전용 화면.
export const WordPhrase: React.FC<Props> = ({word, caption, accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const letters = word.split("");

  const captionDelay = letters.length * 2.4 + 10;
  const captionProgress = spring({
    frame: frame - captionDelay,
    fps,
    config: {damping: 20}
  });
  const captionOpacity = interpolate(captionProgress, [0, 1], [0, 1]);
  const captionY = interpolate(captionProgress, [0, 1], [12, 0]);

  // 글자 수가 많을수록(FLUCTUATE, COLLAPSE 등) 화면 폭에 맞춰 살짝 줄인다.
  const fontSize = letters.length <= 6 ? 220 : letters.length <= 9 ? 168 : 132;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 44
      }}
    >
      <div style={{display: "flex"}}>
        {letters.map((ch, i) => {
          const local = frame - i * 2.4;
          const progress = spring({
            frame: local,
            fps,
            config: {damping: 12, mass: 0.5, stiffness: 180}
          });
          const opacity = interpolate(progress, [0, 1], [0, 1]);
          const translateY = interpolate(progress, [0, 1], [60, 0]);
          const scale = interpolate(progress, [0, 1], [0.5, 1]);
          const rotate = interpolate(progress, [0, 1], [-14, 0]);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: displayFontStack,
                fontSize,
                fontWeight: 700,
                color: accent,
                textShadow: `0 0 60px ${accent}66, 0 0 140px ${accent}33`,
                opacity,
                transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                minWidth: ch === " " ? fontSize * 0.35 : undefined
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <div
        style={{
          fontFamily: displayFontStack,
          fontSize: 38,
          fontWeight: 500,
          color: "#c9d0d8",
          opacity: captionOpacity,
          transform: `translateY(${captionY}px)`,
          textAlign: "center"
        }}
      >
        {caption}
      </div>
    </div>
  );
};
