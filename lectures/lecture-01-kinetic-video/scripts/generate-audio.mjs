#!/usr/bin/env node
// 오프라인 TTS(espeak-ng)로 내레이션 오디오를 생성한다.
//
// 이 샌드박스의 네트워크 정책이 구글/클라우드 TTS API를 차단하기 때문에
// 로컬 espeak-ng 엔진을 사용한다. 기계음이지만 실제 음성 트랙이 필요하면
// 이 스크립트가 만든 public/audio/*.mp3 파일을 원하는 TTS 공급자(구글
// Cloud TTS, ElevenLabs, OpenAI 등)로 생성한 파일로 그대로 교체하면 된다
// (파일명과 manifest.json 구조만 유지하면 됨).
//
// 사용법: node scripts/generate-audio.mjs
// 필요: espeak-ng, ffmpeg, ffprobe (apt-get install espeak-ng ffmpeg)

import {execFileSync} from "node:child_process";
import {mkdirSync, writeFileSync, readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const AUDIO_DIR = path.join(ROOT, "public", "audio");
const TMP_DIR = path.join(ROOT, ".audio-tmp");

mkdirSync(AUDIO_DIR, {recursive: true});
mkdirSync(TMP_DIR, {recursive: true});

const data = JSON.parse(readFileSync(path.join(__dirname, "..", "src", "danize", "sentences.json"), "utf8"));

function synth(text, voice, outMp3) {
  const wav = path.join(TMP_DIR, path.basename(outMp3, ".mp3") + ".wav");
  execFileSync("espeak-ng", ["-v", voice, "-s", "150", "-p", "45", "-w", wav, text]);
  // 살짝 앞뒤 무음 패딩 + 정규화된 mp3로 변환
  execFileSync("ffmpeg", [
    "-y", "-i", wav,
    "-af", "apad=pad_dur=0.35,adelay=120|120,loudnorm=I=-16:TP=-1.5:LRA=11",
    "-ar", "44100", "-b:a", "128k",
    path.join(AUDIO_DIR, outMp3)
  ]);
}

function durationOf(file) {
  const out = execFileSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    path.join(AUDIO_DIR, file)
  ]).toString().trim();
  return parseFloat(out);
}

const manifest = {};

console.log("Synthesizing intro...");
synth(`${data.brand}. ${data.badge}.`, "ko", "intro.mp3");
manifest["intro.mp3"] = durationOf("intro.mp3");

data.sentences.forEach((s, i) => {
  console.log(`Synthesizing sentence ${i + 1}/${data.sentences.length}...`);
  const krFile = `kr-${i}.mp3`;
  const enFile = `en-${i}.mp3`;
  synth(s.kr, "ko", krFile);
  synth(s.en, "en-us", enFile);
  manifest[krFile] = durationOf(krFile);
  manifest[enFile] = durationOf(enFile);
});

console.log("Synthesizing rule bar...");
const ruleScript =
  "주어가 3인칭 단수이고 현재 시제이면, 동사에 -s를 붙입니다. 부정문은 doesn't 플러스 동사원형입니다.";
synth(ruleScript, "ko", "rule.mp3");
manifest["rule.mp3"] = durationOf("rule.mp3");

writeFileSync(path.join(AUDIO_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("Done. Wrote", Object.keys(manifest).length, "durations to public/audio/manifest.json");
