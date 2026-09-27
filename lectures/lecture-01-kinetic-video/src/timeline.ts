// 영어MCP 제1강 스크립트를 키네틱 타이포그래피 비트(beat) 단위로 표현한다.
// 이 파일은 프레임 수를 계산만 할 뿐, 렌더링은 KineticVideo.tsx가 담당한다.

export const FPS = 30;

export type LinesBeat = {
  type: "lines";
  primary: string;
  secondary: string;
  tag: string;
  seconds?: number;
};

export type WordBeat = {
  type: "word";
  word: string;
  caption: string;
  tag: string;
};

export type ExampleBeat = {
  type: "example";
  en: string;
  kr: string;
  tag: string;
};

export type Beat = LinesBeat | WordBeat | ExampleBeat;

type Verb = [
  word: string,
  meaning: string,
  subject: string,
  posEn: string,
  posKr: string,
  negEn: string,
  negKr: string,
  qEn: string,
  qKr: string
];

const VERBS: Verb[] = [
  ["Rise", "오르다", "Stock prices", "Stock prices rise.", "주가가 오른다", "Stock prices don't rise.", "주가가 안 오른다", "Do stock prices rise?", "주가가 오르나요?"],
  ["Fall", "떨어지다", "The interest rate", "The interest rate falls.", "금리가 떨어진다", "The interest rate doesn't fall.", "금리가 안 떨어진다", "Does the interest rate fall?", "금리가 떨어지나요?"],
  ["Surge", "급등하다", "Bitcoin", "Bitcoin surges.", "비트코인이 급등한다", "Bitcoin doesn't surge.", "비트코인이 급등하지 않는다", "Does Bitcoin surge?", "비트코인이 급등하나요?"],
  ["Plunge", "폭락하다", "The market", "The market plunges.", "시장이 폭락한다", "The market doesn't plunge.", "시장이 폭락하지 않는다", "Does the market plunge?", "시장이 폭락하나요?"],
  ["Fluctuate", "요동치다", "Exchange rates", "Exchange rates fluctuate.", "환율이 요동친다", "Exchange rates don't fluctuate.", "환율이 요동치지 않는다", "Do exchange rates fluctuate?", "환율이 요동치나요?"],
  ["Recover", "회복되다", "The economy", "The economy recovers.", "경제가 회복된다", "The economy doesn't recover.", "경제가 회복되지 않는다", "Does the economy recover?", "경제가 회복되나요?"],
  ["Slow down", "둔화되다", "Inflation", "Inflation slows down.", "인플레이션이 둔화된다", "Inflation doesn't slow down.", "인플레이션이 둔화되지 않는다", "Does inflation slow down?", "인플레이션이 둔화되나요?"],
  ["Collapse", "붕괴하다", "The housing market", "The housing market collapses.", "부동산 시장이 붕괴한다", "The housing market doesn't collapse.", "부동산 시장이 붕괴하지 않는다", "Does the housing market collapse?", "부동산 시장이 붕괴하나요?"],
  ["Grow", "성장하다", "Revenue", "Revenue grows.", "매출이 성장한다", "Revenue doesn't grow.", "매출이 성장하지 않는다", "Does revenue grow?", "매출이 성장하나요?"],
  ["Default", "부도나다", "The firm", "The firm defaults.", "그 회사가 부도난다", "The firm doesn't default.", "그 회사가 부도나지 않는다", "Does the firm default?", "그 회사가 부도나나요?"]
];

function lines(primary: string, secondary: string, tag: string, seconds?: number): LinesBeat {
  return {type: "lines", primary, secondary, tag, seconds};
}
function example(en: string, kr: string, tag: string): ExampleBeat {
  return {type: "example", en, kr, tag};
}
function word(w: string, caption: string, tag: string): WordBeat {
  return {type: "word", word: w.toUpperCase(), caption, tag};
}

export const BEATS: Beat[] = [
  lines("[영어MCP] 제1강", "자동사 & 3인칭 단수의 비밀", "TITLE", 4.5),

  lines("1. 자동사", "딱 두 단어로 완성되는 문장", "SEC.1", 3.2),
  example("Stock prices rise.", "주식이 오른다.", "EX 1/5"),
  example("Wind blows.", "바람이 분다.", "EX 2/5"),
  example("Petals flutter.", "꽃잎이 흩날린다.", "EX 3/5"),
  example("The luck comes.", "복이 들어온다.", "EX 4/5"),
  example("Exchange rate fluctuates.", "환율이 요동치네…", "EX 5/5"),
  lines("주어 + 동사", "자동사 = 스스로 동작을 완성하는 동사", "KEY", 4),

  lines("2. 3인칭 단수 현재", "영어의 유일한 귀찮은 규칙", "SEC.2", 3.2),
  lines("3인칭 단수 + 현재", "동사 + -s, 부정은 doesn't", "RULE", 4),
  lines("나, 너 빼고 전부", "= 3인칭", "RULE", 3.4),

  lines("3. 현재 시제의 진짜 의미", "단순한 지금이 아니라 '늘 그러함'", "SEC.3", 3.6),
  example("I love you.", "현재 — 늘 사랑해 (진심)", "TENSE"),
  example("I loved you.", "과거 — 지금은 아니야", "TENSE"),
  example("I will love you.", "미래 — 아직은 아니야", "TENSE"),
  lines("3인칭 단수 + 현재", "동사 뒤에 -s", "RECAP", 3.4),

  lines("4. 돌발 퀴즈", "인칭 구분 완벽 정리", "SEC.4", 3.2),
  lines("나의 친구 = ? 인칭", "Q1", "QUIZ", 3.6),
  lines("정답: 3인칭", "'나'가 아니라 '친구'니까", "QUIZ", 3.8),
  lines("너의 꿈 = ? 인칭", "Q2", "QUIZ", 3.6),
  lines("정답: 3인칭", "'너'가 아니라 '꿈'이니까", "QUIZ", 3.8),
  example("I run.", "나 — 1인칭", "PRONOUN"),
  example("You run.", "너 — 2인칭", "PRONOUN"),
  example("He runs.", "그 — 3인칭 단수", "PRONOUN"),
  example("My friend runs.", "내 친구 — 3인칭 단수", "PRONOUN"),

  lines("5. 부정문 만드는 법", "-s의 변신", "SEC.5", 3.2),
  example("I don't run.", "나는 안 뛴다", "NEG"),
  example("He doesn't run.", "그는 안 뛴다", "NEG"),

  lines("6. 실전 연습", "자동사 10선", "SEC.6", 3.2),

  ...VERBS.flatMap((v, i): Beat[] => {
    const n = String(i + 1).padStart(2, "0");
    return [
      word(v[0], `${v[1]} — ${v[2]}`, `PRACTICE ${n}/10`),
      example(v[3], v[4], "긍정문"),
      example(v[5], v[6], "부정문"),
      example(v[7], v[8], "의문문")
    ];
  }),

  lines("THE END", "1형식 자동사 + 3인칭 단수 완전정복!", "FIN", 5)
];

function clamp(min: number, v: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function linesSeconds(b: LinesBeat): number {
  if (b.seconds) return b.seconds;
  const len = b.primary.length + b.secondary.length;
  return clamp(2.6, 1.3 + len * 0.052, 6.5);
}

// 각 비트의 프레임 길이. example은 한글 2초 → 영문 3초 고정(요청사항),
// word는 1.8초, lines는 글자 수 기반(웹 플레이어와 동일 공식).
export function beatFrames(b: Beat): number {
  if (b.type === "lines") return Math.round(linesSeconds(b) * FPS);
  if (b.type === "word") return Math.round(1.8 * FPS);
  return Math.round(5 * FPS); // example: 2s + 3s
}

export const BEAT_FRAMES = BEATS.map(beatFrames);
export const TOTAL_FRAMES = BEAT_FRAMES.reduce((a, b) => a + b, 0);
export const BEAT_STARTS = BEAT_FRAMES.reduce<number[]>((acc, f, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + BEAT_FRAMES[i - 1]);
  return acc;
}, []);
