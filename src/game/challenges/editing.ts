import {
  findLongLine,
  findLowercaseLine,
  line,
  randomInt,
  randomSnippet,
} from "@/game/challenges/helpers";
import { ChallengeCategory, type ChallengeTemplate } from "@/game/challenges/types";

const editingChallenges: ChallengeTemplate[] = [
  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = randomInt(5, lines.length - 5);
    const origLineCount = lines.length;
    return {
      id: "edit-delete-line",
      instruction: `Delete the current line`,
      snippetIndex,
      initialCursor: [lineIndex + 1, 0],
      validate: async (client) => {
        const currentLines = await client.getBufferLines();
        return currentLines.length === origLineCount - 1;
      },
      idealKeystrokes: 2,
      hint: "dd",
      category: ChallengeCategory.Editing,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLongLine(lines);
    const origLine = line(lines, lineIndex);
    return {
      id: "edit-delete-word",
      instruction: "Delete the word under the cursor",
      snippetIndex,
      initialCursor: [lineIndex + 1, origLine.search(/\S/)],
      validate: async (client) => {
        const [row] = await client.getCursor();
        const currentLine = await client.getBufferLine(row);
        return currentLine !== origLine;
      },
      idealKeystrokes: 2,
      hint: "dw or diw",
      category: ChallengeCategory.Editing,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = randomInt(3, lines.length - 3);
    const expectedLine = line(lines, lineIndex);
    return {
      id: "edit-yank-line",
      instruction: "Yank (copy) the current line",
      snippetIndex,
      initialCursor: [lineIndex + 1, 0],
      validate: async (client) => {
        const register = await client.getRegister('"');
        return register.includes(expectedLine);
      },
      idealKeystrokes: 2,
      hint: "yy",
      category: ChallengeCategory.Editing,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLongLine(lines);
    const origLine = line(lines, lineIndex);
    const midColumn = Math.floor(origLine.length / 3);
    return {
      id: "edit-delete-to-end",
      instruction: "Delete from cursor to end of line",
      snippetIndex,
      initialCursor: [lineIndex + 1, midColumn],
      validate: async (client) => {
        const [row] = await client.getCursor();
        const currentLine = await client.getBufferLine(row);
        return currentLine.length < origLine.length;
      },
      idealKeystrokes: 1,
      hint: "D or d$",
      category: ChallengeCategory.Editing,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = randomInt(5, lines.length - 5);
    const origLineCount = lines.length;
    return {
      id: "edit-paste-below",
      instruction: "Yank this line, then paste it below",
      snippetIndex,
      initialCursor: [lineIndex + 1, 0],
      validate: async (client) => {
        const currentLines = await client.getBufferLines();
        return currentLines.length === origLineCount + 1;
      },
      idealKeystrokes: 3,
      hint: "yyp",
      category: ChallengeCategory.Editing,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = randomInt(5, lines.length - 5);
    const origLineCount = lines.length;
    return {
      id: "edit-join-lines",
      instruction: "Join the current line with the next line",
      snippetIndex,
      initialCursor: [lineIndex + 1, 0],
      validate: async (client) => {
        const currentLines = await client.getBufferLines();
        return currentLines.length === origLineCount - 1;
      },
      idealKeystrokes: 1,
      hint: "J",
      category: ChallengeCategory.Editing,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLowercaseLine(lines);
    const targetLine = line(lines, lineIndex);
    const firstLower = targetLine.search(/[a-z]/);
    const charAtPosition = targetLine[firstLower] as string;
    return {
      id: "edit-toggle-case",
      instruction: "Toggle the case of the character under the cursor",
      snippetIndex,
      initialCursor: [lineIndex + 1, firstLower],
      validate: async (client) => {
        const [row] = await client.getCursor();
        const currentLine = await client.getBufferLine(row);
        return currentLine[firstLower] === charAtPosition.toUpperCase();
      },
      idealKeystrokes: 1,
      hint: "~",
      category: ChallengeCategory.Editing,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = randomInt(5, lines.length - 5);
    const origLine = line(lines, lineIndex);
    return {
      id: "edit-indent-line",
      instruction: "Indent the current line",
      snippetIndex,
      initialCursor: [lineIndex + 1, 0],
      validate: async (client) => {
        const [row] = await client.getCursor();
        const currentLine = await client.getBufferLine(row);
        return (
          currentLine.length > origLine.length && currentLine.trimStart() === origLine.trimStart()
        );
      },
      idealKeystrokes: 2,
      hint: ">>",
      category: ChallengeCategory.Editing,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineIndex = findLongLine(lines);
    const origLine = line(lines, lineIndex);
    const startColumn = origLine.search(/\S/);
    return {
      id: "edit-delete-char",
      instruction: "Delete the character under the cursor",
      snippetIndex,
      initialCursor: [lineIndex + 1, startColumn],
      validate: async (client) => {
        const [row] = await client.getCursor();
        const currentLine = await client.getBufferLine(row);
        return currentLine.length === origLine.length - 1;
      },
      idealKeystrokes: 1,
      hint: "x",
      category: ChallengeCategory.Editing,
    };
  },
];

export default editingChallenges;
