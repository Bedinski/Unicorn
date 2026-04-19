import { isMaxLevel, levelForXp } from "./levels";

export interface GameState {
  xp: number;
  correctCount: number;
  incorrectCount: number;
  recentHanzi: string[];
}

export const RECENT_MEMORY = 4;

export function initialState(): GameState {
  return {
    xp: 0,
    correctCount: 0,
    incorrectCount: 0,
    recentHanzi: [],
  };
}

export interface AnswerResult {
  state: GameState;
  leveledUp: boolean;
  newLevel: number;
  justMaxed: boolean;
}

export function recordAnswer(
  state: GameState,
  promptHanzi: string,
  wasCorrect: boolean,
): AnswerResult {
  const previousLevel = levelForXp(state.xp);
  const previouslyMax = isMaxLevel(state.xp);

  const nextXp = wasCorrect ? state.xp + 1 : state.xp;
  const recentHanzi = [promptHanzi, ...state.recentHanzi].slice(
    0,
    RECENT_MEMORY,
  );

  const nextState: GameState = {
    xp: nextXp,
    correctCount: state.correctCount + (wasCorrect ? 1 : 0),
    incorrectCount: state.incorrectCount + (wasCorrect ? 0 : 1),
    recentHanzi,
  };

  const newLevel = levelForXp(nextState.xp);
  return {
    state: nextState,
    leveledUp: newLevel > previousLevel,
    newLevel,
    justMaxed: !previouslyMax && isMaxLevel(nextState.xp),
  };
}

export function resetKitty(state: GameState): GameState {
  return {
    ...initialState(),
    recentHanzi: state.recentHanzi,
  };
}
