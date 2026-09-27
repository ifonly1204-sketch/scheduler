import React from "react";
import {AbsoluteFill, Audio, Sequence, staticFile} from "remotion";
import {SplitFlapBoard} from "../splitflap/SplitFlapBoard";
import {GlassPanel} from "./GlassPanel";
import {padCenter} from "../splitflap/pad";
import {displayFontStack} from "../fonts";
import {COLORS} from "./theme";
import {BOARD_COLUMNS, type SentenceSchedule} from "./schedule";

const CELL_W = 46;
const CELL_H = 96;
const FONT_SIZE = 56;

export const SentenceSlide: React.FC<{schedule: SentenceSchedule; sentenceNumber: number; total: number}> = ({
  schedule,
  sentenceNumber,
  total
}) => {
  const current = padCenter(schedule.data.kr, BOARD_COLUMNS);
  const next = padCenter(schedule.data.en, BOARD_COLUMNS);
  const highlightColumns = schedule.highlightColumn >= 0 ? new Set([schedule.highlightColumn]) : undefined;

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
      <Sequence from={schedule.krAudioStart} layout="none">
        <Audio src={staticFile(`audio/${schedule.krAudio}`)} />
      </Sequence>
      <Sequence from={schedule.enAudioStart} layout="none">
        <Audio src={staticFile(`audio/${schedule.enAudio}`)} />
      </Sequence>

      <div
        style={{
          position: "absolute",
          top: 96,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: displayFontStack,
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: "0.14em",
          color: COLORS.muted,
          textTransform: "uppercase",
          background: "rgba(255,255,255,0.55)",
          border: `1px solid ${COLORS.panelBorder}`,
          borderRadius: 999,
          padding: "10px 26px"
        }}
      >
        LESSON 01 &middot; SENTENCE {String(sentenceNumber).padStart(2, "0")}/{total}
      </div>

      <GlassPanel padding="40px 52px">
        <SplitFlapBoard
          current={current}
          next={next}
          columns={BOARD_COLUMNS}
          triggerFrame={schedule.triggerFrame}
          staggerFrames={2}
          cellWidth={CELL_W}
          cellHeight={CELL_H}
          fontSize={FONT_SIZE}
          fontFamily={displayFontStack}
          currentColor={COLORS.korean}
          nextColor={COLORS.english}
          cardBg={COLORS.cardBg}
          highlightColumns={highlightColumns}
          highlightColor={COLORS.highlight}
        />
      </GlassPanel>
    </AbsoluteFill>
  );
};
