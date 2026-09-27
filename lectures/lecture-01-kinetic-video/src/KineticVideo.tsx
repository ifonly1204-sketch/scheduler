import React from "react";
import {AbsoluteFill} from "remotion";
import {TransitionSeries, linearTiming} from "@remotion/transitions";
import {fade} from "@remotion/transitions/fade";
import {Backdrop} from "./Backdrop";
import {LinesPhrase} from "./LinesPhrase";
import {WordPhrase} from "./WordPhrase";
import {ExamplePhrase} from "./ExamplePhrase";
import {BEATS, BEAT_FRAMES, type Beat} from "./timeline";

export const TRANSITION_FRAMES = 12;

const ACCENT = "#ff8a3d";

const BeatContent: React.FC<{beat: Beat}> = ({beat}) => {
  if (beat.type === "lines") {
    return <LinesPhrase primary={beat.primary} secondary={beat.secondary} accent={ACCENT} />;
  }
  if (beat.type === "word") {
    return <WordPhrase word={beat.word} caption={beat.caption} accent={ACCENT} />;
  }
  return <ExamplePhrase en={beat.en} kr={beat.kr} accent={ACCENT} />;
};

// 오직 키네틱 타이포그래피만 존재하는 1920x1080 비디오 컴포지션.
// 대시보드/버튼/진행바 등 웹 UI 요소는 일절 렌더링하지 않는다.
export const KineticVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      <Backdrop />
      <TransitionSeries>
        {BEATS.map((beat, i) => {
          const nodes: React.ReactNode[] = [
            <TransitionSeries.Sequence key={`seq-${i}`} durationInFrames={BEAT_FRAMES[i]}>
              <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
                <BeatContent beat={beat} />
              </AbsoluteFill>
            </TransitionSeries.Sequence>
          ];
          if (i < BEATS.length - 1) {
            nodes.push(
              <TransitionSeries.Transition
                key={`tr-${i}`}
                presentation={fade()}
                timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
              />
            );
          }
          return nodes;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
