import React from "react";
import {AbsoluteFill, Audio, Sequence, staticFile} from "remotion";
import {SplitFlapBoard} from "../splitflap/SplitFlapBoard";
import {padCenter} from "../splitflap/pad";
import {displayFontStack} from "../fonts";
import {BOARD_COLUMNS, type SentenceSchedule} from "./schedule";

const CELL_W = 48;
const CELL_H = 100;
const FONT_SIZE = 58;

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
          fontFamily: displayFontStack,
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: "0.18em",
          color: "#7C8AA3",
          textTransform: "uppercase"
        }}
      >
        LESSON 01 &middot; SENTENCE {String(sentenceNumber).padStart(2, "0")}/{total}
      </div>

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
        currentColor="#F8FAFC"
        nextColor="#3B82F6"
        cardBg="#1E293B"
        highlightColumns={highlightColumns}
        highlightColor="#F59E0B"
      />
    </AbsoluteFill>
  );
};
