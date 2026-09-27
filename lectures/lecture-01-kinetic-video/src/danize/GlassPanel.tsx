import React from "react";
import {COLORS} from "./theme";

// 스펙의 "Soft Light-Blueish Glassmorphism" 패널.
export const GlassPanel: React.FC<{children: React.ReactNode; padding?: string; style?: React.CSSProperties}> = ({
  children,
  padding = "36px 56px",
  style
}) => {
  return (
    <div
      style={{
        background: COLORS.panelBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${COLORS.panelBorder}`,
        boxShadow: COLORS.panelShadow,
        borderRadius: 28,
        padding,
        ...style
      }}
    >
      {children}
    </div>
  );
};
