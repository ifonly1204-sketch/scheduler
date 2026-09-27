# 영어MCP 제1강 — 키네틱 타이포그래피 비디오

웹 UI(버튼, 진행바, 헤더 등) 없이 오직 중앙에 배치된 큰 타이포그래피만으로
"[영어MCP] 제1강: 자동사 & 3인칭 단수" 스크립트를 전달하는 1920x1080(16:9)
비디오를 [Remotion](https://www.remotion.dev)으로 렌더링하는 프로젝트입니다.

## 화면 구성

- **배경**: 완전한 다크 모드(딥 그레이 → 블랙 방사형 그라데이션). UI 요소 없음.
- **문구(`lines`)**: 헤더/규칙/퀴즈 등 큰 문구 + 작은 보조 문구가 단어 단위로
  튀어 오르듯 등장.
- **강조 단어(`word`)**: Rise, Fall, Collapse 등 10개 동사를 화면 중앙에
  아주 크게, 글자 단위로 스프링 애니메이션과 함께 등장시키는 키네틱
  타이포그래피 화면.
- **예문(`example`)**: 한글 뜻이 먼저 2초간 나오고, 영문 예문이 3초간 나오는
  고정 2단계 시퀀스(크로스페이드 포함).
- 모든 비트 사이는 `@remotion/transitions`의 fade 전환으로 깔끔하게 이어집니다.

스크립트 내용과 비트 구성은 `src/timeline.ts`에, 실제 렌더링 로직은
`src/LinesPhrase.tsx`, `src/WordPhrase.tsx`, `src/ExamplePhrase.tsx`,
`src/KineticVideo.tsx`에 있습니다.

## 사용법

```bash
npm install

# 프리뷰(브라우저에서 실시간 편집/재생)
npm run start

# 정지 프레임 한 장 미리보기
npm run still

# 전체 비디오를 renders/video.mp4로 렌더링
npm run render
```

기본적으로 Remotion이 렌더링에 필요한 Chrome Headless Shell을 처음 실행 시
자동으로 내려받습니다. 이미 설치된 Chromium(예: Playwright용)을 재사용하려면
`REMOTION_CHROMIUM_EXECUTABLE` 환경변수에 그 실행 파일 경로를 지정하세요.
그 바이너리가 최신 Chromium(예전 headless 모드가 제거된 버전)이라면
`remotion.config.ts`가 자동으로 `chrome-for-testing` 모드로 전환합니다.

```bash
REMOTION_CHROMIUM_EXECUTABLE=/path/to/chromium npm run render
```

## 오디오

`KineticVideo` 컴포지션은 영상 전용입니다(웹 대시보드/컨트롤 없이 순수
타이포그래피 비디오). 아래 `DanizeSplitFlap` 컴포지션은 실제 내레이션
오디오가 함께 나옵니다.

## 렌더링 시간 참고

전체 스크립트(약 70개 비트, 약 4~5분 분량)를 1920x1080으로 렌더링하면
프레임 수가 많아 시간이 걸립니다. `--concurrency` 플래그로 병렬 처리 수를
늘리면 속도를 높일 수 있습니다.

---

## 두 번째 컴포지션: `DanizeSplitFlap` (실제 기계식 스플릿플랩 + 내레이션)

"데이나이즈 영어" 브랜드로, 진짜 공항 발착 안내판처럼 위/아래 절반이 각각
독립적으로 3D 회전하며 뒤집히는 스플릿플랩 보드 + 실제 음성 내레이션이 함께
나오는 두 번째 비디오입니다. 역시 웹 UI 없이 순수 비디오 프레임만
렌더링합니다.

### 화면 구성

- **Scene 1 (인트로)**: "데이나이즈 영어" 타이틀이 키네틱 스프링으로 등장,
  "제 1 강 : 자동사 Intransitive Verbs" 뱃지가 스플릿플랩 보드에 플립되어 나타남.
- **Scene 2 (강의)**: 10개 문장을 순서대로, 한글 문장이 먼저 보이다가
  내레이션이 끝나는 시점에 보드 전체가 왼쪽→오른쪽 순서로(컬럼당 2프레임
  스태거) 영문 문장으로 플립. 3인칭 단수 현재형 어미(-s)는 금색으로 강조.
  화면 하단에는 문법 규칙 바가 계속 떠 있음.
- **Scene 3 (클로징)**: 문법 규칙을 다시 나레이션하며 크게 강조하고 브랜드로
  마무리.

핵심 컴포넌트: `src/splitflap/FlapCell.tsx`(글자 하나의 4레이어 3D 플립
메커니즘), `src/splitflap/SplitFlapBoard.tsx`(한 행 전체), `src/danize/`
(장면 구성과 스케줄).

### 내레이션 오디오

이 샌드박스의 네트워크 정책이 구글 등 클라우드 TTS API를 차단하기 때문에,
`scripts/generate-audio.mjs`는 로컬 오프라인 엔진인 **espeak-ng**로 내레이션을
생성합니다(기계음이지만 실제 음성 트랙입니다). 더 자연스러운 목소리가
필요하면 아래 두 가지 중 하나로 교체하세요.

1. 네트워크 제한이 없는 환경에서 `gTTS`, Google Cloud TTS, ElevenLabs,
   OpenAI TTS 등으로 같은 문장을 합성해 `public/audio/`에 **같은 파일명**
   (`intro.mp3`, `kr-0.mp3` … `kr-9.mp3`, `en-0.mp3` … `en-9.mp3`, `rule.mp3`)
   으로 덮어쓰기.
2. `scripts/generate-audio.mjs`의 `synth()` 함수 안 espeak-ng 호출을 원하는
   TTS 공급자 호출로 바꾸기.

파일을 교체한 뒤에는 반드시 다시 `node scripts/generate-audio.mjs`를 실행하지
말고, 대신 실제 오디오 길이를 다시 측정해 `public/audio/manifest.json`을
갱신해야 합니다(비디오 타이밍이 이 값을 기준으로 계산되기 때문입니다). 가장
쉬운 방법은 새 mp3들을 넣은 뒤 아래를 실행하는 것입니다.

```bash
node -e '
const {execFileSync} = require("child_process");
const fs = require("fs");
const files = fs.readdirSync("public/audio").filter(f => f.endsWith(".mp3"));
const manifest = {};
for (const f of files) {
  const out = execFileSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1","public/audio/"+f]).toString().trim();
  manifest[f] = parseFloat(out);
}
fs.writeFileSync("public/audio/manifest.json", JSON.stringify(manifest, null, 2));
'
```

(espeak-ng/ffmpeg 설치: `apt-get install -y espeak-ng ffmpeg`)

### 렌더링

```bash
npm run audio:generate      # public/audio/*.mp3 + manifest.json 생성
npm run still:danize        # 정지 프레임 미리보기
npm run render:danize       # renders/danize-video.mp4 로 렌더링
```

문장 내용, 강조 어미, 문법 규칙 문구는 `src/danize/sentences.json` 하나만
고치면 됩니다(오디오도 다시 생성해야 타이밍이 맞습니다).
