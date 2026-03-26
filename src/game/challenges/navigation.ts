import {
  bigWordBackward,
  bigWordForward,
  findEmptyLine,
  findIndentedLine,
  findLineContaining,
  findLongLine,
  line,
  randomInt,
  randomSnippet,
  wordForward,
} from "@/game/challenges/helpers";
import { ChallengeCategory, type ChallengeTemplate } from "@/game/challenges/types";

const navigationChallenges: ChallengeTemplate[] = [
  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineCount = lines.length;
    const targetLine = randomInt(Math.floor(lineCount * 0.3), lineCount);
    const startLine = randomInt(1, Math.floor(lineCount * 0.3));
    return {
      id: `nav-goto-line-${targetLine}`,
      instruction: `Go to line ${targetLine}`,
      snippetIndex,
      initialCursor: [startLine, 0],
      validate: async (client) => {
        const [row] = await client.getCursor();
        return row === targetLine;
      },
      idealKeystrokes: String(targetLine).length + 2,
      hint: `${targetLine}G or :${targetLine}<CR>`,
      category: ChallengeCategory.Navigation,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineCount = lines.length;
    const startLine = randomInt(Math.min(10, lineCount), lineCount);
    return {
      id: "nav-goto-top",
      instruction: "Go to the first line of the file",
      snippetIndex,
      initialCursor: [startLine, 0],
      validate: async (client) => {
        const [row] = await client.getCursor();
        return row === 1;
      },
      idealKeystrokes: 2,
      hint: "gg",
      category: ChallengeCategory.Navigation,
    };
  },

  () => {
    const { snippetIndex } = randomSnippet();
    return {
      id: "nav-goto-bottom",
      instruction: "Go to the last line of the file",
      snippetIndex,
      initialCursor: [1, 0],
      validate: async (client) => {
        const [row] = await client.getCursor();
        const lines = await client.getBufferLines();
        return row === lines.length;
      },
      idealKeystrokes: 1,
      hint: "G",
      category: ChallengeCategory.Navigation,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLongLine(lines);
    return {
      id: "nav-end-of-line",
      instruction: "Move to the end of the current line",
      snippetIndex,
      initialCursor: [lineIndex + 1, 0],
      validate: async (client) => {
        const [row, column] = await client.getCursor();
        const currentLine = await client.getBufferLine(row);
        return column >= currentLine.length - 1;
      },
      idealKeystrokes: 1,
      hint: "$",
      category: ChallengeCategory.Navigation,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findIndentedLine(lines);
    const targetLine = line(lines, lineIndex);
    return {
      id: "nav-first-nonblank",
      instruction: "Move to the first non-blank character of the line",
      snippetIndex,
      initialCursor: [lineIndex + 1, Math.max(0, targetLine.length - 1)],
      validate: async (client) => {
        const [row, column] = await client.getCursor();
        const currentLine = await client.getBufferLine(row);
        const firstNonBlank = currentLine.search(/\S/);
        return column === (firstNonBlank >= 0 ? firstNonBlank : 0);
      },
      idealKeystrokes: 1,
      hint: "^",
      category: ChallengeCategory.Navigation,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLongLine(lines);
    const targetLine = line(lines, lineIndex);
    const expectedColumn = wordForward(targetLine, 0, 3);
    return {
      id: "nav-word-forward",
      instruction: "Move forward 3 words",
      snippetIndex,
      initialCursor: [lineIndex + 1, 0],
      validate: async (client) => {
        const [, column] = await client.getCursor();
        return column >= expectedColumn;
      },
      idealKeystrokes: 2,
      hint: "3w",
      category: ChallengeCategory.Navigation,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLineContaining(lines, "(");
    const targetLine = line(lines, lineIndex);
    const parenColumn = targetLine.indexOf("(");
    return {
      id: "nav-find-paren",
      instruction: `Jump to the ( on the current line`,
      snippetIndex,
      initialCursor: [lineIndex + 1, 0],
      validate: async (client) => {
        const [, column] = await client.getCursor();
        return column === parenColumn;
      },
      idealKeystrokes: 2,
      hint: "f(",
      category: ChallengeCategory.Navigation,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLineContaining(lines, '"');
    const targetLine = line(lines, lineIndex);
    const quoteColumn = targetLine.indexOf('"');
    return {
      id: "nav-till-quote",
      instruction: 'Jump to just before the first " on this line',
      snippetIndex,
      initialCursor: [lineIndex + 1, 0],
      validate: async (client) => {
        const [, column] = await client.getCursor();
        return column === quoteColumn - 1;
      },
      idealKeystrokes: 2,
      hint: 't"',
      category: ChallengeCategory.Navigation,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLineContaining(lines, "{");
    const targetLine = line(lines, lineIndex);
    const braceColumn = targetLine.indexOf("{");
    return {
      id: "nav-match-bracket",
      instruction: "Jump to the matching bracket",
      snippetIndex,
      initialCursor: [lineIndex + 1, braceColumn],
      validate: async (client) => {
        const [row, column] = await client.getCursor();
        if (row === lineIndex + 1 && column === braceColumn) return false;
        const currentLine = await client.getBufferLine(row);
        return currentLine[column] === "}" || currentLine[column] === "{";
      },
      idealKeystrokes: 1,
      hint: "%",
      category: ChallengeCategory.Navigation,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLongLine(lines);
    const targetLine = line(lines, lineIndex);
    const startColumn = Math.floor(targetLine.length / 2);
    return {
      id: "nav-column-zero",
      instruction: "Move to the beginning of the line (column 0)",
      snippetIndex,
      initialCursor: [lineIndex + 1, startColumn],
      validate: async (client) => {
        const [, column] = await client.getCursor();
        return column === 0;
      },
      idealKeystrokes: 1,
      hint: "0",
      category: ChallengeCategory.Navigation,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLongLine(lines);
    const targetLine = line(lines, lineIndex);
    const expectedColumn = bigWordForward(targetLine, 0, 2);
    return {
      id: "nav-WORD-forward",
      instruction: "Move forward 2 WORDs (space-delimited)",
      snippetIndex,
      initialCursor: [lineIndex + 1, 0],
      validate: async (client) => {
        const [, column] = await client.getCursor();
        return column >= expectedColumn;
      },
      idealKeystrokes: 2,
      hint: "2W",
      category: ChallengeCategory.Navigation,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLongLine(lines);
    const targetLine = line(lines, lineIndex);
    const startColumn = Math.max(0, targetLine.length - 1);
    const expectedColumn = bigWordBackward(targetLine, startColumn, 2);
    return {
      id: "nav-WORD-backward",
      instruction: "Move backward 2 WORDs (space-delimited)",
      snippetIndex,
      initialCursor: [lineIndex + 1, startColumn],
      validate: async (client) => {
        const [, column] = await client.getCursor();
        return column <= expectedColumn;
      },
      idealKeystrokes: 2,
      hint: "2B",
      category: ChallengeCategory.Navigation,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const emptyLineIndex = findEmptyLine(lines);
    const startLine = Math.max(1, emptyLineIndex - 3);
    return {
      id: "nav-paragraph-forward",
      instruction: "Jump to the next blank line",
      snippetIndex,
      initialCursor: [startLine, 0],
      validate: async (client) => {
        const [row] = await client.getCursor();
        if (row <= startLine) return false;
        const currentLine = await client.getBufferLine(row);
        return currentLine.trim() === "";
      },
      idealKeystrokes: 1,
      hint: "}",
      category: ChallengeCategory.Navigation,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const emptyLineIndex = findEmptyLine(lines);
    const startLine = Math.min(lines.length, emptyLineIndex + 5);
    return {
      id: "nav-paragraph-backward",
      instruction: "Jump to the previous blank line",
      snippetIndex,
      initialCursor: [startLine, 0],
      validate: async (client) => {
        const [row] = await client.getCursor();
        if (row >= startLine) return false;
        const currentLine = await client.getBufferLine(row);
        return currentLine.trim() === "";
      },
      idealKeystrokes: 1,
      hint: "{",
      category: ChallengeCategory.Navigation,
    };
  },
];

export default navigationChallenges;
