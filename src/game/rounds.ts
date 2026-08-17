import type { Word } from "@/data/words";

export type Rng = () => number;
export type RoundKind = "mcq" | "draw" | "match";

export interface McqRound {
  kind: "mcq";
  answer: Word;
  choices: Word[];
}

export interface DrawRound {
  kind: "draw";
  answer: Word;
}

export interface MatchRound {
  kind: "match";
  answer: Word;
  choices: Word[];
}

export type Round = McqRound | DrawRound | MatchRound;

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
  const seenMeanings = new Set([answer.english]);
  const pool = shuffle(words.filter((word) => word.hanzi !== answer.hanzi), rng)
    .filter((word) => {
      if (seenMeanings.has(word.english)) return false;
      seenMeanings.add(word.english);
      return true;
    });
  if (pool.length < count) {
    throw new Error(
      `Not enough distractors: need ${count}, have ${pool.length}`,
    );
  }
  return pool.slice(0, count);
}

export interface RoundWeights {
  mcq: number;
  draw: number;
  match: number;
}

export const DEFAULT_ROUND_WEIGHTS: RoundWeights = {
  mcq: 2,
  draw: 1,
  match: 2,
};

/**
 * Picks the next round type. `draw` and `match` both require audio, so
 * passing `canAudio=false` forces `mcq`. When audio is available, the
 * caller can tune the distribution via `weights`.
 */
export function pickRoundType(
  rng: Rng,
  canAudio: boolean,
  weights: RoundWeights = DEFAULT_ROUND_WEIGHTS,
): RoundKind {
  if (!canAudio) return "mcq";
  const total = weights.mcq + weights.draw + weights.match;
  if (total <= 0) return "mcq";
  const r = rng() * total;
  if (r < weights.mcq) return "mcq";
  if (r < weights.mcq + weights.draw) return "draw";
  return "match";
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
  if (kind === "match") {
    return { kind: "match", answer, choices };
  }
  return { kind: "mcq", answer, choices };
}
