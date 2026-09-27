import {Config} from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");

// 이 환경에는 (구식 headless 모드가 없는) 최신 Chromium이 이미 설치되어
// 있으므로 Remotion이 별도로 내려받지 않도록 그 경로를 재사용한다. 기본값인
// "headless-shell" 모드는 이런 바이너리와 호환되지 않으므로 새 headless 모드를
// 쓰는 "chrome-for-testing" 모드로 전환한다. 다른 환경에서는 이 블록을 지우면
// Remotion이 필요한 브라우저(headless shell)를 알아서 내려받는다.
if (process.env.REMOTION_CHROMIUM_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_CHROMIUM_EXECUTABLE);
  Config.setChromeMode("chrome-for-testing");
  // 이 컨테이너의 아웃바운드 HTTPS는 사설 인증서를 쓰는 프록시를 통과하므로
  // 개발 환경 확인용으로만 인증서 검증을 완화한다(운영 렌더링에는 불필요).
  if (process.env.REMOTION_DEV_SANDBOX) {
    Config.setChromiumIgnoreCertificateErrors(true);
  }
}
