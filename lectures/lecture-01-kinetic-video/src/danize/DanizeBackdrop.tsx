import React from "react";
import {AbsoluteFill} from "remotion";
import {COLORS} from "./theme";

// 스펙: 깔끔한 화이트/오프화이트 캔버스 + 은은한 앰비언트 라이트 그라데이션.
export const DanizeBackdrop: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.canvasBg}}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(60% 50% at 22% 18%, rgba(191,219,254,0.55) 0%, rgba(191,219,254,0) 60%)," +
            "radial-gradient(55% 45% at 82% 85%, rgba(253,230,138,0.28) 0%, rgba(253,230,138,0) 60%)," +
            "radial-gradient(80% 60% at 50% 0%, rgba(219,234,254,0.6) 0%, rgba(248,250,252,0) 70%)"
        }}
      />
    </AbsoluteFill>
  );
};
