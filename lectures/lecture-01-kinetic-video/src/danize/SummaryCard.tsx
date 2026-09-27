import React from "react";
import {Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {GlassPanel} from "./GlassPanel";
import {displayFontStack} from "../fonts";
import {COLORS} from "./theme";
import type {SummarySchedule} from "./schedule";

export const SummaryCard: React.FC<{schedule: SummarySchedule; index: number; total: number}> = ({
  schedule,
  index,
  total
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame: frame - 4, fps, config: {damping: 18, mass: 0.7}});
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.92, 1]);

  return (
    <>
      <Sequence from={schedule.audioStart} layout="none">
        <Audio src={staticFile(`audio/${schedule.audio}`)} />
      </Sequence>
      <div style={{opacity, transform: `scale(${scale})`, maxWidth: 1500}}>
        <GlassPanel padding="52px 72px">
          <div style={{display: "flex", flexDirection: "column", gap: 22, alignItems: "center", textAlign: "center"}}>
            <div
              style={{
                fontFamily: displayFontStack,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.16em",
                color: COLORS.muted,
                textTransform: "uppercase"
              }}
            >
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </div>
            <div style={{fontFamily: displayFontStack, fontSize: 56, fontWeight: 700, color: COLORS.english}}>
              {schedule.data.heading}
            </div>
            <div style={{fontFamily: displayFontStack, fontSize: 34, fontWeight: 600, color: COLORS.textDark}}>
              {schedule.data.body}
            </div>
          </div>
        </GlassPanel>
      </div>
    </>
  );
};
