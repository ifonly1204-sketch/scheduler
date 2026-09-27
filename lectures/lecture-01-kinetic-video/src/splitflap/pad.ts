// 문자열을 고정 길이로 가운데 정렬 패딩한다(공백 = 빈 플랩).
// 스플릿플랩 보드는 실제 기계식 전광판처럼 컬럼 수가 고정돼 있어야 하므로,
// 한국어 문장과 영어 문장을 같은 컬럼 폭에 맞춰 정렬한다.
export function padCenter(str: string, len: number): string {
  const s = str.slice(0, len);
  const total = len - s.length;
  const left = Math.floor(total / 2);
  const right = total - left;
  return " ".repeat(left) + s + " ".repeat(right);
}

// `word`가 padCenter(str, len) 안에서 시작하는 컬럼 인덱스를 반환한다.
// (찾지 못하면 -1)
export function findColumn(str: string, len: number, word: string): number {
  const padded = padCenter(str, len);
  return padded.indexOf(word);
}
