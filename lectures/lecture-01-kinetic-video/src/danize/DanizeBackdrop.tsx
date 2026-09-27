import React from "react";
import {AbsoluteFill} from "remotion";

// 스펙에서 지정한 다크 모드 배경: #0B0F17 베이스 + 은은한 그라데이션과
// 기계식 보드 특유의 미세한 스캔라인 텍스처.
export const DanizeBackdrop: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: "#0B0F17"}}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 90% at 50% 38%, #131a26 0%, #0B0F17 55%, #05070b 100%)"
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)",
          mixBlendMode: "overlay"
        }}
      />
    </AbsoluteFill>
  );
};
