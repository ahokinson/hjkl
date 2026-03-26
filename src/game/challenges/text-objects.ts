import {
  findLineContaining,
  findLineWithBraces,
  findLineWithBrackets,
  findLineWithParens,
  line,
  randomSnippet,
} from "@/game/challenges/helpers";
import { ChallengeCategory, type ChallengeTemplate } from "@/game/challenges/types";

const textObjectChallenges: ChallengeTemplate[] = [
  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLineContaining(lines, "const");
    const targetLine = line(lines, lineIndex);
    return {
      id: "edit-change-word",
      instruction: `Change the word under cursor to "let"`,
      snippetIndex,
      initialCursor: [lineIndex + 1, targetLine.indexOf("const")],
      validate: async (client) => {
        const [row] = await client.getCursor();
        const currentLine = await client.getBufferLine(row);
        return currentLine.includes("let");
      },
      idealKeystrokes: 6,
      hint: "ciw then type let then <Esc>",
      category: ChallengeCategory.TextObjects,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLineContaining(lines, '"');
    const targetLine = line(lines, lineIndex);
    const quoteStart = targetLine.indexOf('"');
    const quoteEnd = targetLine.indexOf('"', quoteStart + 1);
    const insideText = targetLine.slice(quoteStart + 1, quoteEnd);
    return {
      id: "textobj-delete-inside-quotes",
      instruction: 'Delete the text inside the quotes (di")',
      snippetIndex,
      initialCursor: [lineIndex + 1, quoteStart + 1],
      validate: async (client) => {
        const [row] = await client.getCursor();
        const currentLine = await client.getBufferLine(row);
        return currentLine.includes('""') && !currentLine.includes(insideText);
      },
      idealKeystrokes: 3,
      hint: 'di"',
      category: ChallengeCategory.TextObjects,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLineWithParens(lines);
    const targetLine = line(lines, lineIndex);
    const parenStart = targetLine.indexOf("(");
    const parenEnd = targetLine.indexOf(")", parenStart);
    const insideText = targetLine.slice(parenStart + 1, parenEnd);
    return {
      id: "textobj-change-inside-parens",
      instruction: "Change the text inside the parentheses (ci()",
      snippetIndex,
      initialCursor: [lineIndex + 1, parenStart + 1],
      validate: async (client) => {
        const [row] = await client.getCursor();
        const currentLine = await client.getBufferLine(row);
        return !currentLine.includes(insideText) && currentLine.includes("(");
      },
      idealKeystrokes: 3,
      hint: "ci(",
      category: ChallengeCategory.TextObjects,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLineContaining(lines, '"');
    const targetLine = line(lines, lineIndex);
    const quoteStart = targetLine.indexOf('"');
    const origQuoteCount = (targetLine.match(/"/g) ?? []).length;
    return {
      id: "textobj-delete-around-quotes",
      instruction: 'Delete the quoted string including the quotes (da")',
      snippetIndex,
      initialCursor: [lineIndex + 1, quoteStart + 1],
      validate: async (client) => {
        const [row] = await client.getCursor();
        const currentLine = await client.getBufferLine(row);
        const quoteCount = (currentLine.match(/"/g) ?? []).length;
        return quoteCount < origQuoteCount;
      },
      idealKeystrokes: 3,
      hint: 'da"',
      category: ChallengeCategory.TextObjects,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLineWithBraces(lines);
    const targetLine = line(lines, lineIndex);
    const braceColumn = targetLine.indexOf("{");
    const closeBrace = targetLine.indexOf("}", braceColumn + 1);
    const insideText = targetLine.slice(braceColumn + 1, closeBrace).trim();
    return {
      id: "textobj-yank-inside-braces",
      instruction: "Yank the text inside the curly braces (yi{)",
      snippetIndex,
      initialCursor: [lineIndex + 1, braceColumn + 1],
      validate: async (client) => {
        const register = await client.getRegister('"');
        return register.includes(insideText);
      },
      idealKeystrokes: 3,
      hint: "yi{ or yi}",
      category: ChallengeCategory.TextObjects,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLineWithBrackets(lines);
    const targetLine = line(lines, lineIndex);
    const bracketStart = targetLine.indexOf("[");
    return {
      id: "textobj-visual-inside-brackets",
      instruction: "Visually select the text inside the brackets (vi[)",
      snippetIndex,
      initialCursor: [lineIndex + 1, bracketStart + 1],
      validate: async (client) => {
        const { mode } = await client.getMode();
        return mode.startsWith("v") || mode.startsWith("V") || mode === "\x16";
      },
      idealKeystrokes: 3,
      hint: "vi[ or vi]",
      category: ChallengeCategory.TextObjects,
    };
  },
];

export default textObjectChallenges;
