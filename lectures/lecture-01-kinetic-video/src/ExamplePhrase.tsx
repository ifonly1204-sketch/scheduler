import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {KineticWords} from "./KineticWords";
import {displayFontStack} from "./fonts";

type Props = {
  en: string;
  kr: string;
  accent: string;
};

const KR_STAGE_FRAMES = 60; // 2초 @30fps
const CROSSFADE = 10;

function sizeFor(text: string): number {
  const len = text.length;
  if (len <= 12) return 100;
  if (len <= 22) return 80;
  if (len <= 34) return 64;
  return 52;
}

// 요청사항: 예문 카드는 한글 뜻이 먼저 2초간, 그다음 영문이 3초간 나오는
// 고정 2단계 시퀀스. 두 단계 사이에는 짧게 크로스페이드를 준다.
export const ExamplePhrase: React.FC<Props> = ({en, kr, accent}) => {
  const frame = useCurrentFrame();

  const krOpacity = interpolate(
    frame,
    [0, 8, KR_STAGE_FRAMES - CROSSFADE, KR_STAGE_FRAMES],
    [0, 1, 1, 0],
    {extrapolateRight: "clamp"}
  );
  const enOpacity = interpolate(
    frame,
    [KR_STAGE_FRAMES - CROSSFADE, KR_STAGE_FRAMES + 2],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
      <AbsoluteFill
        style={{alignItems: "center", justifyContent: "center", opacity: krOpacity}}
      >
        <KineticWords
          text={kr}
          frame={frame}
          fontSize={sizeFor(kr)}
          fontFamily={displayFontStack}
          color="#f6f2e8"
          fontWeight={700}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 26,
          opacity: enOpacity
        }}
      >
        <KineticWords
          text={en}
          frame={frame - KR_STAGE_FRAMES}
          fontSize={sizeFor(en)}
          fontFamily={displayFontStack}
          color={accent}
          fontWeight={700}
          stagger={2}
        />
        <div
          style={{
            fontFamily: displayFontStack,
            fontSize: 34,
            fontWeight: 500,
            color: "#8f97a1"
          }}
        >
          {kr}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
