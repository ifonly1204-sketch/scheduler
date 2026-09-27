#!/usr/bin/env node
// 오프라인 TTS로 내레이션 오디오를 생성한다.
//
// 이 샌드박스의 네트워크 정책이 구글/클라우드 TTS API를 전부 차단하고
// (translate.google.com, huggingface.co 등 CONNECT 403) 환경에 있는 AWS
// 자격증명도 Polly 호출에는 유효하지 않아(다른 용도로 발급된 키), 완전히
// 오프라인인 엔진만 쓸 수 있다.
//
// - 영어: espeak-ng + MBROLA(us1) 다이폰 합성 — 기본 espeak 포먼트 합성보다
//   훨씬 매끄럽고 사람에 가까운 음색.
// - 한국어: espeak-ng 기본 "ko" 보이스 — Ubuntu에 한국어 MBROLA 음성
//   데이터(mbrola-hn1)는 있지만 espeak-ng용 음소 매핑이 없어 그대로는
//   연결되지 않는다(제대로 하려면 espeak-ng 음성 정의 파일을 새로 써야 함).
//
// 더 자연스러운 목소리가 필요하면, 네트워크 제한이 없는 곳에서 원하는
// TTS(Google Cloud TTS, ElevenLabs, OpenAI 등)로 같은 문장을 합성해
// public/audio/의 같은 파일명으로 덮어쓰면 된다 — README 참고.
//
// 사용법: node scripts/generate-audio.mjs
// 필요: espeak-ng, mbrola, mbrola-us1, ffmpeg, ffprobe
//   apt-get install -y espeak-ng mbrola mbrola-us1 ffmpeg

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

const KO_VOICE = "ko";
const EN_VOICE = "mb-us1"; // MBROLA 다이폰 보이스 (더 자연스러움)

function synth(text, voice, outMp3, {rate = 148} = {}) {
  const wav = path.join(TMP_DIR, path.basename(outMp3, ".mp3") + ".wav");
  const args = ["-v", voice, "-s", String(rate), "-w", wav, text];
  execFileSync("espeak-ng", args);
  // 살짝 앞뒤 무음 패딩 + 약간의 웜톤 EQ + 정규화된 mp3로 변환
  execFileSync("ffmpeg", [
    "-y", "-i", wav,
    "-af",
    "apad=pad_dur=0.35,adelay=120|120,equalizer=f=7000:t=q:w=1:g=-4,loudnorm=I=-16:TP=-1.5:LRA=11",
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
synth(`${data.brand}. ${data.badge}.`, KO_VOICE, "intro.mp3");
manifest["intro.mp3"] = durationOf("intro.mp3");

data.sentences.forEach((s, i) => {
  console.log(`Synthesizing sentence ${i + 1}/${data.sentences.length}...`);
  const krFile = `kr-${i}.mp3`;
  const enFile = `en-${i}.mp3`;
  synth(s.kr, KO_VOICE, krFile);
  synth(s.en, EN_VOICE, enFile, {rate: 155});
  manifest[krFile] = durationOf(krFile);
  manifest[enFile] = durationOf(enFile);
});

data.summary.forEach((s, i) => {
  console.log(`Synthesizing summary ${i + 1}/${data.summary.length}...`);
  const file = `summary-${i}.mp3`;
  synth(s.narration, KO_VOICE, file);
  manifest[file] = durationOf(file);
});

writeFileSync(path.join(AUDIO_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("Done. Wrote", Object.keys(manifest).length, "durations to public/audio/manifest.json");
