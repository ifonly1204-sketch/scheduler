import React from "react";
import {AbsoluteFill} from "remotion";

// 완전한 다크 모드 배경: 중앙이 살짝 밝은 딥 그레이 → 가장자리로 갈수록
// 순검정에 가까워지는 방사형 그라데이션. 어떤 UI 요소도 포함하지 않는다.
export const Backdrop: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(120% 90% at 50% 42%, #14161a 0%, #08090b 60%, #000000 100%)"
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)",
          mixBlendMode: "overlay",
          opacity: 0.5
        }}
      />
    </AbsoluteFill>
  );
};
