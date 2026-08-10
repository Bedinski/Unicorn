export function canSpeak(): boolean {
  return (
    typeof globalThis !== "undefined" &&
    typeof (globalThis as { speechSynthesis?: unknown }).speechSynthesis !==
      "undefined"
  );
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  if (!canSpeak()) return undefined;
  const voices = globalThis.speechSynthesis.getVoices();
  const normalized = lang.toLowerCase();
  return (
    voices.find((v) => v.lang.toLowerCase() === normalized) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(normalized.slice(0, 2)))
  );
}

function speak(text: string, lang: string, rate: number): void {
  if (!canSpeak() || !text) return;
  try {
    const synth = globalThis.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = rate;
    const voice = pickVoice(lang);
    if (voice) utter.voice = voice;
    synth.speak(utter);
  } catch {
    // ignore — audio is always optional
  }
}

export function speakZh(text: string): void {
  // Curriculum uses Traditional Chinese, so prefer a Taiwanese Mandarin voice.
  // pickVoice still falls back to any available zh voice when zh-TW is absent.
  speak(text, "zh-TW", 0.85);
}

export function speakEn(text: string): void {
  speak(text, "en-US", 0.95);
}
