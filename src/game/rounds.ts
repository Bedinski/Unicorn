import type { Word } from "@/data/words";

export type Rng = () => number;
export type RoundKind = "mcq" | "draw";

export interface McqRound {
  kind: "mcq";
  answer: Word;
  choices: Word[];
}

export interface DrawRound {
  kind: "draw";
  answer: Word;
}

export type Round = McqRound | DrawRound;

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickPrompt(
  words: readonly Word[],
  recent: readonly string[],
  rng: Rng = Math.random,
): Word {
  if (words.length === 0) {
    throw new Error("Cannot pick a prompt from an empty word list");
  }
  const eligible = words.filter((w) => !recent.includes(w.hanzi));
  const pool = eligible.length > 0 ? eligible : words;
  return pool[Math.floor(rng() * pool.length)];
}

export function pickDistractors(
  answer: Word,
  words: readonly Word[],
  count: number,
  rng: Rng = Math.random,
): Word[] {
  const pool = words.filter((w) => w.english !== answer.english);
  if (pool.length < count) {
    throw new Error(
      `Not enough distractors: need ${count}, have ${pool.length}`,
    );
  }
  return shuffle(pool, rng).slice(0, count);
}

export function pickRoundType(
  rng: Rng,
  canDraw: boolean,
  drawProbability = 0.5,
): RoundKind {
  if (!canDraw) return "mcq";
  const p = Math.min(1, Math.max(0, drawProbability));
  return rng() < p ? "draw" : "mcq";
}

export function buildRound(
  words: readonly Word[],
  recent: readonly string[],
  rng: Rng = Math.random,
  kind: RoundKind = "mcq",
): Round {
  const answer = pickPrompt(words, recent, rng);
  if (kind === "draw") {
    return { kind: "draw", answer };
  }
  const distractors = pickDistractors(answer, words, 2, rng);
  const choices = shuffle([answer, ...distractors], rng);
  return { kind: "mcq", answer, choices };
}
