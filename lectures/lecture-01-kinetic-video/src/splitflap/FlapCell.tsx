import React from "react";
import {interpolate} from "remotion";

type HalfProps = {
  half: "top" | "bottom";
  text: string;
  color: string;
  fontFamily: string;
  fontSize: number;
  width: number;
  height: number;
  cardBg: string;
  z: number;
  rotateDeg?: number;
};

// 셀 하나의 절반(위/아래)을 그린다. 글자는 항상 셀 전체 높이 기준으로
// 중앙 정렬된 채로 렌더링한 뒤, overflow:hidden인 절반짜리 박스로 잘라내는
// 방식이라 위/아래 절반이 이어붙었을 때 글자가 정확히 맞물린다.
const Half: React.FC<HalfProps> = ({
  half, text, color, fontFamily, fontSize, width, height, cardBg, z, rotateDeg
}) => {
  const halfHeight = height / 2;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width,
        height: halfHeight,
        top: half === "top" ? 0 : halfHeight,
        overflow: "hidden",
        background: cardBg,
        zIndex: z,
        transform:
          rotateDeg === undefined
            ? undefined
            : `perspective(1200px) rotateX(${rotateDeg}deg)`,
        transformOrigin: half === "top" ? "center bottom" : "center top",
        backfaceVisibility: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          width,
          height,
          top: half === "top" ? 0 : -halfHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily,
          fontSize,
          fontWeight: 700,
          color,
          lineHeight: 1
        }}
      >
        {text}
      </div>
    </div>
  );
};

export type FlapCellProps = {
  current: string;
  next: string;
  localFrame: number; // 이 셀의 플립 시작 시점 기준 로컬 프레임(음수면 아직 시작 전)
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  currentColor: string;
  nextColor: string;
  cardBg: string;
};

// 실제 기계식 스플릿플랩 한 글자 유닛.
// - 위쪽 고정판(TopNext)  : 항상 "다음" 글자의 윗부분을 보여준다.
// - 아래쪽 고정판(BottomCurrent) : 항상 "현재" 글자의 아랫부분을 보여준다.
// - 위쪽 플립판(TopCurrentFlipping)  : "현재" 글자 윗부분, 0deg → -90deg로 넘어가며 사라진다.
// - 아래쪽 플립판(BottomNextFlipping): "다음" 글자 아랫부분, 90deg → 0deg로 내려오며 덮는다.
export const FlapCell: React.FC<FlapCellProps> = ({
  current,
  next,
  localFrame,
  width,
  height,
  fontSize,
  fontFamily,
  currentColor,
  nextColor,
  cardBg
}) => {
  const topRotation = interpolate(localFrame, [0, 15], [0, -90], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const bottomRotation = interpolate(localFrame, [15, 30], [90, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: 8,
        boxShadow:
          "inset 0 1px 2px rgba(15,23,42,0.06), 0 8px 16px -10px rgba(30,41,59,0.35)",
        border: "1px solid rgba(148,172,209,0.35)"
      }}
    >
      <Half half="top" text={next} color={nextColor} fontFamily={fontFamily} fontSize={fontSize} width={width} height={height} cardBg={cardBg} z={1} />
      <Half half="bottom" text={current} color={currentColor} fontFamily={fontFamily} fontSize={fontSize} width={width} height={height} cardBg={cardBg} z={1} />
      <Half half="top" text={current} color={currentColor} fontFamily={fontFamily} fontSize={fontSize} width={width} height={height} cardBg={cardBg} z={2} rotateDeg={topRotation} />
      <Half half="bottom" text={next} color={nextColor} fontFamily={fontFamily} fontSize={fontSize} width={width} height={height} cardBg={cardBg} z={2} rotateDeg={bottomRotation} />
      {/* 가운데 경첩 이음선 — 실제 보드의 얇은 크리스(crease) 정도로만,
          빈 칸(공백)에서도 눈에 띄는 굵은 줄로 보이지 않도록 아주 은은하게 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: height / 2 - 0.5,
          height: 1,
          background: "rgba(15,23,42,0.16)",
          zIndex: 3
        }}
      />
    </div>
  );
};
