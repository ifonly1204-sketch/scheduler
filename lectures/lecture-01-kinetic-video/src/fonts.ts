// Remotion은 헤드리스 크로미움으로 프레임을 캡처하기 때문에 <link> 태그로 건
// 구글 폰트는 타이밍에 따라 로드가 늦어 프레임마다 다르게 잡힐 수 있다.
// @remotion/google-fonts는 폰트를 미리 받아 등록하고 로드 완료를 기다릴 수
// 있게 해주므로 렌더링에는 이 방식을 쓴다.
import {loadFont as loadSpaceMono} from "@remotion/google-fonts/SpaceMono";
import {loadFont as loadNotoSansKR} from "@remotion/google-fonts/NotoSansKR";

const spaceMono = loadSpaceMono("normal", {weights: ["400", "700"], subsets: ["latin"]});
// Noto Sans KR ships as many unicode-range chunks; restricting to the
// "korean" subset (dropping cyrillic/latin/latin-ext/vietnamese, which we
// don't use — Latin text renders with Space Mono) cuts the request count
// notably. It's still a lot of requests because Hangul coverage is large,
// hence the explicit opt-out of the "too many requests" warning.
const notoSansKR = loadNotoSansKR("normal", {
  weights: ["400", "500", "700"],
  subsets: ["korean"],
  ignoreTooManyRequestsWarning: true
});

export const latinFont = spaceMono.fontFamily;
export const koreanFont = notoSansKR.fontFamily;
// 두 스크립트가 한 문자열에 섞여도 자동으로 대체(fallback)되도록 스택으로 합친다.
export const displayFontStack = `${latinFont}, ${koreanFont}, sans-serif`;

export const fontsReady = Promise.all([
  spaceMono.waitUntilDone(),
  notoSansKR.waitUntilDone()
]);
