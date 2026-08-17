import { WORDS, type WordCategory } from "@/data/words";
import { isMaxLevel, levelForXp } from "./levels";

export interface DailyStars {
  date: string; // ISO YYYY-MM-DD
  count: number;
}

export type CategoryCorrect = Partial<Record<WordCategory, number>>;

export interface GameState {
  xp: number;
  correctCount: number;
  incorrectCount: number;
  recentHanzi: string[];
  streak: number;
  bestStreak: number;
  seenHanzi: string[];
  stars: DailyStars;
  categoryCorrect: CategoryCorrect;
  /** Date-independent week/category scope, or null for all First Grade. */
  selectedScopeId: string | null;
  /** When true, the app shows a flashcard view for dictation practice
   *  instead of the round-based game. No XP / streaks update in this mode. */
  teacherMode: boolean;
}

export const RECENT_MEMORY = 4;

/** Daily target: how many correct answers to hit today's star goal. */
export const DAILY_STAR_GOAL = 10;

/** Streak thresholds that fire milestone celebrations. */
export const STREAK_MILESTONES: readonly number[] = [3, 5, 10];

/**
 * Bonus XP awarded when crossing a streak milestone. First milestone pays 1,
 * each subsequent pays 1 more (so hitting 10 after 5 after 3 earns +1, +2, +3).
 */
function bonusForStreakMilestone(streak: number): number {
  const idx = STREAK_MILESTONES.indexOf(streak);
  return idx >= 0 ? idx + 1 : 0;
}

export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function initialState(): GameState {
  return {
    xp: 0,
    correctCount: 0,
    incorrectCount: 0,
    recentHanzi: [],
    streak: 0,
    bestStreak: 0,
    seenHanzi: [],
    stars: { date: todayIso(), count: 0 },
    categoryCorrect: {},
    selectedScopeId: null,
    teacherMode: false,
  };
}

export interface AnswerResult {
  state: GameState;
  leveledUp: boolean;
  newLevel: number;
  justMaxed: boolean;
  streakMilestone: number | null;
  bonusXp: number;
  dailyGoalHit: boolean;
  wasNewWord: boolean;
  newSticker: WordCategory | null;
}

/** Categories earn a sticker after this many correct answers. */
export const STICKER_THRESHOLD = 5;

function lookupCategory(hanzi: string): WordCategory | null {
  const w = WORDS.find((x) => x.hanzi === hanzi);
  return w && !w.weeklyOnly ? w.category : null;
}

export function recordAnswer(
  state: GameState,
  promptHanzi: string,
  wasCorrect: boolean,
  now: Date = new Date(),
  categoryOverride?: WordCategory | null,
): AnswerResult {
  const previousLevel = levelForXp(state.xp);
  const previouslyMax = isMaxLevel(state.xp);

  const category = categoryOverride === undefined
    ? lookupCategory(promptHanzi)
    : categoryOverride;
  const wasNewWord = !state.seenHanzi.includes(promptHanzi);

  // streak
  const nextStreak = wasCorrect ? state.streak + 1 : 0;
  const milestone = wasCorrect && STREAK_MILESTONES.includes(nextStreak)
    ? nextStreak
    : null;
  const bonus = milestone ? bonusForStreakMilestone(milestone) : 0;

  // xp (base + optional streak bonus)
  const baseXp = wasCorrect ? 1 : 0;
  const nextXp = state.xp + baseXp + bonus;

  // stars: roll the date over if needed, then increment on correct
  const today = todayIso(now);
  const starsToday = state.stars.date === today
    ? state.stars.count
    : 0;
  const nextStarCount = starsToday + (wasCorrect ? 1 : 0);
  const dailyGoalHit = wasCorrect &&
    starsToday < DAILY_STAR_GOAL &&
    nextStarCount >= DAILY_STAR_GOAL;

  // category correct + sticker
  const categoryCorrect = { ...state.categoryCorrect };
  let newSticker: WordCategory | null = null;
  if (wasCorrect && category) {
    const prev = categoryCorrect[category] ?? 0;
    const next = prev + 1;
    categoryCorrect[category] = next;
    if (prev < STICKER_THRESHOLD && next >= STICKER_THRESHOLD) {
      newSticker = category;
    }
  }

  const recentHanzi = [promptHanzi, ...state.recentHanzi].slice(
    0,
    RECENT_MEMORY,
  );

  const seenHanzi = wasNewWord
    ? [...state.seenHanzi, promptHanzi]
    : state.seenHanzi;

  const nextState: GameState = {
    xp: nextXp,
    correctCount: state.correctCount + (wasCorrect ? 1 : 0),
    incorrectCount: state.incorrectCount + (wasCorrect ? 0 : 1),
    recentHanzi,
    streak: nextStreak,
    bestStreak: Math.max(state.bestStreak, nextStreak),
    seenHanzi,
    stars: { date: today, count: nextStarCount },
    categoryCorrect,
    selectedScopeId: state.selectedScopeId,
    teacherMode: state.teacherMode,
  };

  const newLevel = levelForXp(nextState.xp);
  return {
    state: nextState,
    leveledUp: newLevel > previousLevel,
    newLevel,
    justMaxed: !previouslyMax && isMaxLevel(nextState.xp),
    streakMilestone: milestone,
    bonusXp: bonus,
    dailyGoalHit,
    wasNewWord,
    newSticker,
  };
}

export function resetKitty(state: GameState): GameState {
  return {
    ...initialState(),
    // preserve progress that isn't about the kitty
    recentHanzi: state.recentHanzi,
    seenHanzi: state.seenHanzi,
    stars: state.stars,
    categoryCorrect: state.categoryCorrect,
    bestStreak: state.bestStreak,
    selectedScopeId: state.selectedScopeId,
    teacherMode: state.teacherMode,
  };
}

export function earnedStickers(state: GameState): WordCategory[] {
  return (Object.entries(state.categoryCorrect) as [WordCategory, number][])
    .filter(([, n]) => n >= STICKER_THRESHOLD)
    .map(([c]) => c);
}
