import { line, randomInt, randomSnippet } from "@/game/challenges/helpers";
import { ChallengeCategory, type ChallengeTemplate } from "@/game/challenges/types";

const marksJumpsChallenges: ChallengeTemplate[] = [
  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineCount = lines.length;
    const markLine = randomInt(5, Math.floor(lineCount / 2));
    const jumpTarget = randomInt(Math.floor(lineCount / 2) + 5, lineCount);
    return {
      id: "marks-set-and-jump",
      instruction: `Set mark 'a' here, go to line ${jumpTarget}, then jump back to mark 'a'`,
      snippetIndex,
      initialCursor: [markLine, 0],
      validate: async (client) => {
        const [row] = await client.getCursor();
        return row === markLine;
      },
      idealKeystrokes: String(jumpTarget).length + 5,
      hint: `ma, then ${jumpTarget}G, then 'a`,
      category: ChallengeCategory.MarksJumps,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineCount = lines.length;
    const startLine = randomInt(5, Math.floor(lineCount / 2));
    return {
      id: "marks-jump-last-pos",
      instruction: "Jump to the last line (G), then jump back to where you were",
      snippetIndex,
      initialCursor: [startLine, 0],
      validate: async (client) => {
        const [row] = await client.getCursor();
        return row === startLine;
      },
      idealKeystrokes: 3,
      hint: "G then '' (two single quotes)",
      category: ChallengeCategory.MarksJumps,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineCount = lines.length;
    const markLine = randomInt(5, Math.floor(lineCount / 2));
    const markLineText = line(lines, markLine);
    const markColumn = Math.min(5, markLineText.length - 1);
    const jumpTarget = randomInt(Math.floor(lineCount / 2) + 5, lineCount);
    return {
      id: "marks-backtick-exact",
      instruction: `Set mark 'b' here, go to line ${jumpTarget}, then jump back to exact position with \`b`,
      snippetIndex,
      initialCursor: [markLine, markColumn],
      validate: async (client) => {
        const [row, column] = await client.getCursor();
        return row === markLine && column === markColumn;
      },
      idealKeystrokes: String(jumpTarget).length + 5,
      hint: `mb, then ${jumpTarget}G, then \`b`,
      category: ChallengeCategory.MarksJumps,
    };
  },

  () => {
    const { snippetIndex, lines } = randomSnippet();
    const lineCount = lines.length;
    const startLine = randomInt(5, Math.floor(lineCount / 3));
    const targetLine = randomInt(Math.floor(lineCount * 0.6), lineCount);
    return {
      id: "marks-ctrl-o",
      instruction: `Go to line ${targetLine}, then jump back with Ctrl-O`,
      snippetIndex,
      initialCursor: [startLine, 0],
      validate: async (client) => {
        const [row] = await client.getCursor();
        return row === startLine;
      },
      idealKeystrokes: String(targetLine).length + 3,
      hint: `${targetLine}G then <C-o>`,
      category: ChallengeCategory.MarksJumps,
    };
  },
];

export default marksJumpsChallenges;
