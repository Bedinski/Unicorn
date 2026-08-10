import { afterEach, describe, expect, it, vi } from "vitest";
import { canSpeak, speakEn, speakZh } from "@/ui/speech";

const originalSpeech = (globalThis as { speechSynthesis?: unknown })
  .speechSynthesis;
const originalUtter = (globalThis as { SpeechSynthesisUtterance?: unknown })
  .SpeechSynthesisUtterance;

afterEach(() => {
  if (originalSpeech === undefined) {
    delete (globalThis as { speechSynthesis?: unknown }).speechSynthesis;
  } else {
    (globalThis as { speechSynthesis?: unknown }).speechSynthesis =
      originalSpeech;
  }
  if (originalUtter === undefined) {
    delete (globalThis as { SpeechSynthesisUtterance?: unknown })
      .SpeechSynthesisUtterance;
  } else {
    (globalThis as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance =
      originalUtter;
  }
});

describe("speech (no API available)", () => {
  it("canSpeak returns false when speechSynthesis is absent", () => {
    delete (globalThis as { speechSynthesis?: unknown }).speechSynthesis;
    expect(canSpeak()).toBe(false);
  });

  it("speakZh / speakEn are no-ops and never throw without API", () => {
    delete (globalThis as { speechSynthesis?: unknown }).speechSynthesis;
    expect(() => speakZh("猫")).not.toThrow();
    expect(() => speakEn("cat")).not.toThrow();
  });
});

describe("speech (mocked API)", () => {
  it("canSpeak returns true when speechSynthesis is present", () => {
    (globalThis as { speechSynthesis?: unknown }).speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn(),
      getVoices: () => [],
    };
    expect(canSpeak()).toBe(true);
  });

  it("speakZh calls speak with a Traditional-Chinese zh-TW utterance", () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    (globalThis as { speechSynthesis?: unknown }).speechSynthesis = {
      cancel,
      speak,
      getVoices: () => [],
    };
    class FakeUtterance {
      text: string;
      lang = "";
      rate = 1;
      voice: unknown = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    (globalThis as {
      SpeechSynthesisUtterance?: unknown;
    }).SpeechSynthesisUtterance = FakeUtterance as unknown as typeof SpeechSynthesisUtterance;

    speakZh("猫");
    expect(cancel).toHaveBeenCalled();
    expect(speak).toHaveBeenCalledTimes(1);
    const utter = speak.mock.calls[0][0] as FakeUtterance;
    expect(utter.text).toBe("猫");
    expect(utter.lang).toBe("zh-TW");
  });

  it("speakZh swallows errors from the underlying API", () => {
    (globalThis as { speechSynthesis?: unknown }).speechSynthesis = {
      cancel: () => {
        throw new Error("nope");
      },
      speak: () => {
        throw new Error("nope");
      },
      getVoices: () => [],
    };
    (globalThis as {
      SpeechSynthesisUtterance?: unknown;
    }).SpeechSynthesisUtterance = class {
      constructor(public text: string) {}
      lang = "";
      rate = 1;
      voice: unknown = null;
    } as unknown as typeof SpeechSynthesisUtterance;

    expect(() => speakZh("猫")).not.toThrow();
  });
});
