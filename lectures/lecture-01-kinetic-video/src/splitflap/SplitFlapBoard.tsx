import React from "react";
import {useCurrentFrame} from "remotion";
import {FlapCell} from "./FlapCell";

export type SplitFlapBoardProps = {
  current: string; // columns 길이로 이미 패딩된 문자열
  next: string; // columns 길이로 이미 패딩된 문자열
  columns: number;
  triggerFrame: number; // 0번 컬럼이 플립을 시작하는 로컬 프레임
  staggerFrames?: number;
  cellWidth: number;
  cellHeight: number;
  fontSize: number;
  fontFamily: string;
  currentColor: string;
  nextColor: string;
  cardBg: string;
  gap?: number;
  highlightColumns?: ReadonlySet<number>;
  highlightColor?: string;
};

// 패딩으로 채워진 양옆 빈 칸까지 순서를 매기면 짧은 문장도 긴 보드 폭만큼
// 스태거 시간이 필요해져(빈 칸도 "플립"에 시간을 쓰므로) 불필요하게 오래
// 걸리거나, 고정된 슬롯 안에서 마지막 글자가 채 flip을 끝내기 전에 다음
// 문장으로 넘어가 버릴 수 있다. 그래서 실제로 글자가 있는 구간(현재/다음 중
// 하나라도 공백이 아닌 컬럼)만 스태거 대상으로 삼는다.
function activeRange(current: string, next: string): {start: number; length: number} {
  let start = -1;
  let end = -1;
  for (let i = 0; i < current.length; i++) {
    if (current[i] !== " " || next[i] !== " ") {
      if (start === -1) start = i;
      end = i;
    }
  }
  if (start === -1) return {start: 0, length: 1};
  return {start, length: end - start + 1};
}

// 한 행 전체의 스플릿플랩 보드. 왼쪽부터 오른쪽으로 컬럼마다 살짝 지연을 주어
// (staggerFrames) 실제 공항 전광판처럼 순차적으로 플립되게 한다.
export const SplitFlapBoard: React.FC<SplitFlapBoardProps> = ({
  current,
  next,
  columns,
  triggerFrame,
  staggerFrames = 2,
  cellWidth,
  cellHeight,
  fontSize,
  fontFamily,
  currentColor,
  nextColor,
  cardBg,
  gap = 5,
  highlightColumns,
  highlightColor = "#F59E0B"
}) => {
  const frame = useCurrentFrame();
  const range = activeRange(current, next);

  return (
    <div style={{display: "flex", gap}}>
      {Array.from({length: columns}).map((_, i) => {
        const staggerIndex = Math.min(Math.max(i - range.start, 0), range.length - 1);
        const cellStart = triggerFrame + staggerIndex * staggerFrames;
        const localFrame = frame - cellStart;
        const highlighted = highlightColumns?.has(i);
        return (
          <FlapCell
            key={i}
            current={current[i] ?? " "}
            next={next[i] ?? " "}
            localFrame={localFrame}
            width={cellWidth}
            height={cellHeight}
            fontSize={fontSize}
            fontFamily={fontFamily}
            currentColor={currentColor}
            nextColor={highlighted ? highlightColor : nextColor}
            cardBg={cardBg}
          />
        );
      })}
    </div>
  );
};
