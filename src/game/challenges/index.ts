import editing from "@/game/challenges/editing";
import { randomElement } from "@/game/challenges/helpers";
import marksJumps from "@/game/challenges/marks-jumps";
import navigation from "@/game/challenges/navigation";
import search from "@/game/challenges/search";
import textObjects from "@/game/challenges/text-objects";

export type { Challenge, ChallengeTemplate } from "@/game/challenges/types";
export { ChallengeCategory } from "@/game/challenges/types";

const allTemplates = [...navigation, ...editing, ...textObjects, ...search, ...marksJumps];

export function getRandomChallenge() {
  return randomElement(allTemplates)();
}
