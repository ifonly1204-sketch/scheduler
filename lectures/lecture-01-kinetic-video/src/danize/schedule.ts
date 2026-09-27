// 실제로 합성된 내레이션 오디오 길이(public/audio/manifest.json)를 기준으로
// 프레임 스케줄을 계산한다. 오디오가 잘리거나 정적이 뜨는 일이 없도록,
// 화면 전환 타이밍은 전부 "실제 음성 길이 + 여유 프레임"에서 역산한다.
import sentencesData from "./sentences.json";
import manifest from "../../public/audio/manifest.json";

export const FPS = 30;

export type SentenceData = {
  kr: string;
  en: string;
  highlight: string | null;
};

export const BRAND: string = sentencesData.brand;
export const BADGE: string = sentencesData.badge;
export const LESSON_LABEL: string = sentencesData.lessonLabel;
export const RULE_TEXT: string = sentencesData.ruleBar;
export const SENTENCES: SentenceData[] = sentencesData.sentences;

function sec(file: string): number {
  const d = (manifest as Record<string, number>)[file];
  if (!d) throw new Error(`Missing audio duration for ${file} — run scripts/generate-audio.mjs`);
  return d;
}
function toFrames(seconds: number): number {
  return Math.round(seconds * FPS);
}

// 보드는 실제 기계식 전광판처럼 컬럼 수가 고정돼 있어야 하므로, 10개 문장 중
// 가장 긴 영어 문장 기준으로 폭을 잡는다(양옆 여백 살짝 추가).
export const BOARD_COLUMNS = Math.max(...SENTENCES.map((s) => s.en.length)) + 2;

const LEAD_PAD = 8; // 문장 슬롯 시작 후 한글 내레이션이 나오기까지의 여유
const KR_TAIL_PAD = 6; // 한글 내레이션이 끝나고 바로 플립하기 전 짧은 여유
const EN_TAIL_PAD = 20; // 영어 내레이션이 끝난 뒤, 스태거 플립이 다 끝나고 다음 문장으로 넘어가기 전 여유

export type SentenceSchedule = {
  index: number;
  data: SentenceData;
  krAudio: string;
  enAudio: string;
  krAudioStart: number; // 문장 슬롯 로컬 프레임 기준
  enAudioStart: number; // 문장 슬롯 로컬 프레임 기준 (= 플립 트리거 프레임)
  triggerFrame: number; // SplitFlapBoard용 (enAudioStart와 동일)
  durationInFrames: number; // 이 문장 슬롯의 총 길이
  highlightColumn: number; // -1이면 강조 없음
};

function buildSentenceSchedule(index: number, data: SentenceData): SentenceSchedule {
  const krAudio = `kr-${index}.mp3`;
  const enAudio = `en-${index}.mp3`;
  const krFrames = toFrames(sec(krAudio));
  const enFrames = toFrames(sec(enAudio));

  const krAudioStart = LEAD_PAD;
  const enAudioStart = krAudioStart + krFrames + KR_TAIL_PAD; // = 플립 트리거
  const durationInFrames = enAudioStart + enFrames + EN_TAIL_PAD;

  const highlightColumn = (() => {
    if (!data.highlight) return -1;
    const leftPad = Math.floor((BOARD_COLUMNS - data.en.length) / 2);
    const wordStart = data.en.indexOf(data.highlight);
    if (wordStart === -1) return -1;
    // "-s" 어미 자체(단어의 마지막 글자)만 금색으로 강조한다.
    return leftPad + wordStart + data.highlight.length - 1;
  })();

  return {
    index,
    data,
    krAudio,
    enAudio,
    krAudioStart,
    enAudioStart,
    triggerFrame: enAudioStart,
    durationInFrames,
    highlightColumn
  };
}

export const SENTENCE_SCHEDULE: SentenceSchedule[] = SENTENCES.map((s, i) => buildSentenceSchedule(i, s));

export const LECTURE_SCENE_FRAMES = SENTENCE_SCHEDULE.reduce((a, s) => a + s.durationInFrames, 0);

// Scene 1: 인트로. 브랜드 내레이션 길이 + 뱃지 플랩보드 애니메이션을 담을 여유.
export const INTRO_BADGE_START = 40;
export const INTRO_SCENE_FRAMES = Math.max(
  toFrames(sec("intro.mp3")) + 20,
  INTRO_BADGE_START + BADGE.length * 2 + 30 + 20
);

// Scene 3: 클로징(문법 규칙 내레이션 + 브랜드 아웃트로).
export const CLOSING_SCENE_FRAMES = toFrames(sec("rule.mp3")) + 45;

export const TOTAL_FRAMES = INTRO_SCENE_FRAMES + LECTURE_SCENE_FRAMES + CLOSING_SCENE_FRAMES;
