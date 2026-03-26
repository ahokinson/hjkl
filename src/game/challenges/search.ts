import {
  findMultiOccurrenceWord,
  findWord,
  findWordOccurrences,
  line,
  randomElement,
  randomSnippet,
} from "@/game/challenges/helpers";
import { ChallengeCategory, type ChallengeTemplate } from "@/game/challenges/types";

const searchChallenges: ChallengeTemplate[] = [
  () => {
    const { snippetIndex, lines } = randomSnippet();
    const { word } = findWord(lines);
    const occurrences = findWordOccurrences(lines, word);
    return {
      id: "search-forward",
      instruction: `Search forward for "${word}"`,
      snippetIndex,
      initialCursor: [1, 0],
      validate: async (client) => {
        const [row] = await client.getCursor();
        return occurrences.includes(row - 1);
      },
      idealKeystrokes: word.length + 2,
      hint: `/${word}<CR>`,
      category: ChallengeCategory.Search,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const { word } = findWord(lines);
    const occurrences = findWordOccurrences(lines, word);
    return {
      id: "search-backward",
      instruction: `Search backward for "${word}"`,
      snippetIndex,
      initialCursor: [lines.length, 0],
      validate: async (client) => {
        const [row] = await client.getCursor();
        return occurrences.includes(row - 1);
      },
      idealKeystrokes: word.length + 2,
      hint: `?${word}<CR>`,
      category: ChallengeCategory.Search,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const { lineIndex, word, column } = findMultiOccurrenceWord(lines);
    const occurrences = findWordOccurrences(lines, word);
    return {
      id: "search-star",
      instruction: "Search for the next occurrence of the word under cursor",
      snippetIndex,
      initialCursor: [lineIndex + 1, column],
      validate: async (client) => {
        const [row] = await client.getCursor();
        return row !== lineIndex + 1 && occurrences.includes(row - 1);
      },
      idealKeystrokes: 1,
      hint: "*",
      category: ChallengeCategory.Search,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const keywords = ["return", "const", "function", "if", "for"];
    let word: string | undefined;
    for (const candidate of keywords) {
      if (findWordOccurrences(lines, candidate).length >= 2) {
        word = candidate;
        break;
      }
    }
    if (!word) {
      const found = findMultiOccurrenceWord(lines);
      word = found.word;
    }
    const occurrences = findWordOccurrences(lines, word);
    const startIndex = randomElement(occurrences);
    const startLine = line(lines, startIndex);
    const column = startLine.indexOf(word);
    return {
      id: "search-hash",
      instruction: "Search backward for the word under cursor",
      snippetIndex,
      initialCursor: [startIndex + 1, Math.max(0, column)],
      validate: async (client) => {
        const [row] = await client.getCursor();
        return row !== startIndex + 1 && occurrences.includes(row - 1);
      },
      idealKeystrokes: 1,
      hint: "#",
      category: ChallengeCategory.Search,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const { word } = findWord(lines);
    const occurrences = findWordOccurrences(lines, word);
    return {
      id: "search-next",
      instruction: `Search for "${word}" then jump to the second match with n`,
      snippetIndex,
      initialCursor: [1, 0],
      validate: async (client) => {
        const [row] = await client.getCursor();
        const matchIndex = occurrences.indexOf(row - 1);
        return matchIndex >= 1;
      },
      idealKeystrokes: word.length + 3,
      hint: `/${word}<CR> then n`,
      category: ChallengeCategory.Search,
    };
  },
];

export default searchChallenges;
