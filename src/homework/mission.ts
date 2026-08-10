import type { HomeworkAssignment, HomeworkItem } from "./model";
import type { AssignmentProgress, ItemProgress } from "./progress";

export const MISSION_ITEM_LIMIT = 3;

function masteryScore(progress: ItemProgress | undefined): number {
  if (!progress) return 0;
  let score = progress.learned ? 1 : 0;
  if (progress.recallCorrect > 0) score += 1;
  if (progress.recallCorrect > 1) score += 1;
  if (progress.recallIncorrect > progress.recallCorrect) score -= 1;
  return score;
}

/**
 * Pick the least-mastered, least-recently-practiced items for the next short
 * mission. Curriculum order is the final tie-breaker so a new assignment is
 * introduced predictably rather than randomly.
 */
export function planMissionItems(
  assignment: HomeworkAssignment,
  progress: AssignmentProgress,
  limit = MISSION_ITEM_LIMIT,
): HomeworkItem[] {
  const indexed = assignment.items.map((item, index) => ({
    item,
    index,
    progress: progress.items[item.id],
  }));
  return indexed
    .sort((a, b) => {
      const mastery = masteryScore(a.progress) - masteryScore(b.progress);
      if (mastery !== 0) return mastery;
      const recency = (a.progress?.lastPracticed ?? "").localeCompare(b.progress?.lastPracticed ?? "");
      return recency !== 0 ? recency : a.index - b.index;
    })
    .slice(0, Math.max(1, limit))
    .map(({ item }) => item);
}

export interface GardenStage {
  stage: number;
  name: string;
  message: string;
  icon: string;
}

const GARDEN_STAGES: readonly Omit<GardenStage, "stage">[] = [
  { name: "A quiet garden", message: "Your first mission will plant a moonflower seed.", icon: "◌" },
  { name: "Seed planted", message: "One more mission will help it sprout.", icon: "●" },
  { name: "A tiny sprout", message: "The moonflower is reaching for the lantern light.", icon: "♧" },
  { name: "Moonflower bud", message: "Practice again to help the flower open.", icon: "♢" },
  { name: "Moonflower bloom", message: "A little ink spirit has found your garden.", icon: "✿" },
  { name: "Ink-spirit garden", message: "Each mission makes your magical garden brighter.", icon: "✦" },
];

export function gardenStageForMissions(missionsCompleted: number): GardenStage {
  const stage = Math.min(Math.max(0, Math.floor(missionsCompleted)), GARDEN_STAGES.length - 1);
  return { stage, ...GARDEN_STAGES[stage] };
}

export function estimatedMissionMinutes(itemCount: number): number {
  return Math.max(2, Math.min(4, Math.ceil(itemCount * 1.25)));
}
