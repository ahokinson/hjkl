import type { NvimClient } from "@/nvim/client";

export enum ChallengeCategory {
  Navigation = "navigation",
  Editing = "editing",
  TextObjects = "text-objects",
  Search = "search",
  MarksJumps = "marks-jumps",
}

export interface Challenge {
  id: string;
  instruction: string;
  snippetIndex: number;
  initialCursor: [row: number, column: number];
  validate: (client: NvimClient) => Promise<boolean>;
  idealKeystrokes: number;
  hint: string;
  category: ChallengeCategory;
}

export type ChallengeTemplate = () => Challenge;
