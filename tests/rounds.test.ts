import { describe, expect, it } from "vitest";
import { WORDS } from "@/data/words";
import {
  buildRound,
  pickDistractors,
  pickPrompt,
  pickRoundType,
  shuffle,
} from "@/game/rounds";

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32;
    return s / 2 ** 32;
  };
}

describe("shuffle", () => {
  it("preserves the set of elements", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffle(input, seededRng(42));
    expect(out).toHaveLength(input.length);
    expect([...out].sort()).toEqual([...input].sort());
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3];
    const copy = input.slice();
    shuffle(input, seededRng(1));
    expect(input).toEqual(copy);
  });

  it("can reorder (not always identity) with a deterministic rng", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input, seededRng(7));
    expect(out.join(",")).not.toBe(input.join(","));
  });
});

describe("pickPrompt", () => {
  it("returns a word from the list", () => {
    const word = pickPrompt(WORDS, [], seededRng(1));
    expect(WORDS).toContainEqual(word);
  });

  it("avoids recently seen words when possible", () => {
    const recent = WORDS.slice(0, 18).map((w) => w.hanzi);
    for (let seed = 1; seed < 50; seed++) {
      const word = pickPrompt(WORDS, recent, seededRng(seed));
      expect(recent).not.toContain(word.hanzi);
    }
  });

  it("falls back to the full pool if all words are recent", () => {
    const recent = WORDS.map((w) => w.hanzi);
    const word = pickPrompt(WORDS, recent, seededRng(1));
    expect(WORDS).toContainEqual(word);
  });

  it("throws on an empty word list", () => {
    expect(() => pickPrompt([], [], seededRng(1))).toThrow();
  });
});

describe("pickDistractors", () => {
  const [first, ...rest] = WORDS;

  it("never includes the answer's english value", () => {
    for (let seed = 1; seed < 30; seed++) {
      const d = pickDistractors(first, WORDS, 2, seededRng(seed));
      expect(d.every((w) => w.english !== first.english)).toBe(true);
    }
  });

  it("returns the requested count of unique words", () => {
    const d = pickDistractors(first, WORDS, 2, seededRng(5));
    expect(d).toHaveLength(2);
    expect(new Set(d.map((w) => w.english)).size).toBe(2);
  });

  it("throws if there are not enough distractors", () => {
    expect(() =>
      pickDistractors(first, [first, rest[0]], 3, seededRng(1)),
    ).toThrow();
  });
});

describe("buildRound", () => {
  it("defaults to an mcq round with 3 choices containing the answer", () => {
    const round = buildRound(WORDS, [], seededRng(99));
    expect(round.kind).toBe("mcq");
    if (round.kind !== "mcq") throw new Error("wrong kind");
    expect(round.choices).toHaveLength(3);
    expect(round.choices.map((c) => c.english)).toContain(
      round.answer.english,
    );
  });

  it("mcq choices are all unique", () => {
    for (let seed = 1; seed < 20; seed++) {
      const round = buildRound(WORDS, [], seededRng(seed));
      if (round.kind !== "mcq") throw new Error("wrong kind");
      const uniq = new Set(round.choices.map((c) => c.english));
      expect(uniq.size).toBe(3);
    }
  });

  it("produces a draw round with just an answer when kind=draw", () => {
    const round = buildRound(WORDS, [], seededRng(1), "draw");
    expect(round.kind).toBe("draw");
    expect(round.answer).toBeDefined();
    expect(WORDS).toContainEqual(round.answer);
    expect((round as { choices?: unknown }).choices).toBeUndefined();
  });

  it("produces a match round with 3 hanzi choices containing the answer", () => {
    const round = buildRound(WORDS, [], seededRng(3), "match");
    expect(round.kind).toBe("match");
    if (round.kind !== "match") throw new Error("wrong kind");
    expect(round.choices).toHaveLength(3);
    expect(round.choices.map((c) => c.hanzi)).toContain(round.answer.hanzi);
    const uniq = new Set(round.choices.map((c) => c.hanzi));
    expect(uniq.size).toBe(3);
  });
});

describe("pickRoundType", () => {
  it("always returns mcq when audio is not supported", () => {
    for (let seed = 1; seed < 20; seed++) {
      expect(pickRoundType(seededRng(seed), false)).toBe("mcq");
    }
  });

  it("produces all three kinds when audio is supported", () => {
    const rng = seededRng(12345);
    const results = new Set<string>();
    for (let i = 0; i < 300; i++) {
      results.add(pickRoundType(rng, true));
    }
    expect(results.has("mcq")).toBe(true);
    expect(results.has("draw")).toBe(true);
    expect(results.has("match")).toBe(true);
  });

  it("always returns the only kind with non-zero weight", () => {
    for (let seed = 1; seed < 20; seed++) {
      expect(
        pickRoundType(seededRng(seed), true, { mcq: 0, draw: 0, match: 1 }),
      ).toBe("match");
      expect(
        pickRoundType(seededRng(seed), true, { mcq: 1, draw: 0, match: 0 }),
      ).toBe("mcq");
      expect(
        pickRoundType(seededRng(seed), true, { mcq: 0, draw: 1, match: 0 }),
      ).toBe("draw");
    }
  });

  it("falls back to mcq when all weights are zero", () => {
    expect(
      pickRoundType(seededRng(1), true, { mcq: 0, draw: 0, match: 0 }),
    ).toBe("mcq");
  });
});
