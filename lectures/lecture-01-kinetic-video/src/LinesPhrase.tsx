import React from "react";
import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {KineticWords} from "./KineticWords";
import {displayFontStack} from "./fonts";

type Props = {
  primary: string;
  secondary: string;
  accent: string;
};

const HANGUL_RE = /[가-힣]/;
function sizeFor(text: string): number {
  // 문장이 길수록(예: 영문 예문) 한 화면에 다 들어오도록 살짝 줄인다.
  const len = text.length;
  if (len <= 10) return 108;
  if (len <= 20) return 88;
  if (len <= 30) return 72;
  return 58;
}

// 헤더/규칙/퀴즈 등 "큰 문구 + 작은 보조 문구" 두 줄 구성.
export const LinesPhrase: React.FC<Props> = ({primary, secondary, accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const secondaryDelay = 10;
  const secondaryLocal = frame - secondaryDelay;
  const secondaryProgress = spring({
    frame: secondaryLocal,
    fps,
    config: {damping: 20, mass: 0.7}
  });
  const secondaryOpacity = interpolate(secondaryProgress, [0, 1], [0, 1]);
  const secondaryY = interpolate(secondaryProgress, [0, 1], [14, 0]);

  const isPrimaryKorean = HANGUL_RE.test(primary);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
        maxWidth: 1600,
        textAlign: "center"
      }}
    >
      <KineticWords
        text={primary}
        frame={frame}
        fontSize={sizeFor(primary)}
        fontFamily={displayFontStack}
        color="#f6f2e8"
        fontWeight={700}
        letterSpacing={isPrimaryKorean ? "-0.01em" : "-0.01em"}
      />
      {secondary ? (
        <div
          style={{
            fontFamily: displayFontStack,
            fontSize: 40,
            fontWeight: 500,
            color: accent,
            opacity: secondaryOpacity,
            transform: `translateY(${secondaryY}px)`,
            letterSpacing: "0.01em"
          }}
        >
          {secondary}
        </div>
      ) : null}
    </div>
  );
};
