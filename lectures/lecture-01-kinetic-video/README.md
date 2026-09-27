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

이 컴포지션은 영상 전용입니다(요청사항에 따라 웹 대시보드/컨트롤/오디오
없이 순수 타이포그래피 비디오로 구성). 나레이션을 입히려면 `Root.tsx`의
컴포지션에 `<Audio src={staticFile(...)} />`를 추가하고, `src/timeline.ts`의
프레임 길이를 실제 음성 길이에 맞춰 조정하면 됩니다.

## 렌더링 시간 참고

전체 스크립트(약 70개 비트, 약 4~5분 분량)를 1920x1080으로 렌더링하면
프레임 수가 많아 시간이 걸립니다. `--concurrency` 플래그로 병렬 처리 수를
늘리면 속도를 높일 수 있습니다.
