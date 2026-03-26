import { type Snippet, snippets } from "@/data/snippets";

export function randomInt(min: number, max: number): number {
  if (min >= max) return min;
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T;
}

export function randomSnippet(): { snippet: Snippet; snippetIndex: number; lines: string[] } {
  const snippetIndex = randomInt(0, snippets.length);
  const snippet = snippets[snippetIndex] as Snippet;
  return { snippet, snippetIndex, lines: snippet.lines };
}

export function line(lines: string[], index: number): string {
  return lines[index] as string;
}

export function findLongLine(lines: string[]): number {
  let best = 0;
  let bestLength = 0;
  for (let i = 2; i < lines.length - 2; i++) {
    const length = line(lines, i).trim().length;
    if (length > bestLength) {
      bestLength = length;
      best = i;
    }
  }
  return best;
}

export function findIndentedLine(lines: string[]): number {
  for (let i = 2; i < lines.length - 2; i++) {
    const current = line(lines, i);
    if (current.startsWith("  ") && current.trim().length > 5) {
      return i;
    }
  }
  return 2;
}

export function findLowercaseLine(lines: string[]): number {
  for (let i = 2; i < lines.length - 2; i++) {
    const match = line(lines, i).match(/[a-z]{3,}/);
    if (match) return i;
  }
  return 2;
}

export function findEmptyLine(lines: string[]): number {
  for (let i = 5; i < lines.length - 5; i++) {
    if (line(lines, i).trim() === "") return i;
  }
  return 5;
}

export function findLineContaining(lines: string[], text: string): number {
  for (let i = 2; i < lines.length - 2; i++) {
    if (line(lines, i).includes(text)) return i;
  }
  return 2;
}

function findLineWithDelimiters(lines: string[], open: string, close: string): number {
  for (let i = 2; i < lines.length - 2; i++) {
    const current = line(lines, i);
    if (
      current.includes(open) &&
      current.includes(close) &&
      current.indexOf(open) < current.indexOf(close)
    ) {
      return i;
    }
  }
  return 2;
}

export const findLineWithParens = (lines: string[]) => findLineWithDelimiters(lines, "(", ")");

export const findLineWithBrackets = (lines: string[]) => findLineWithDelimiters(lines, "[", "]");

export const findLineWithBraces = (lines: string[]) => findLineWithDelimiters(lines, "{", "}");

export function findWord(lines: string[]): {
  lineIndex: number;
  word: string;
  column: number;
} {
  for (let i = 5; i < lines.length - 5; i++) {
    const match = line(lines, i).match(/\b([a-zA-Z_]\w{3,})\b/);
    if (match) {
      return { lineIndex: i, word: match[1] as string, column: match.index as number };
    }
  }
  return { lineIndex: 5, word: "const", column: 0 };
}

export function findMultiOccurrenceWord(lines: string[]): {
  lineIndex: number;
  word: string;
  column: number;
} {
  for (let i = 5; i < lines.length - 5; i++) {
    const matches = line(lines, i).matchAll(/\b([a-zA-Z_]\w{3,})\b/g);
    for (const match of matches) {
      const word = match[1] as string;
      if (findWordOccurrences(lines, word).length >= 2) {
        return { lineIndex: i, word, column: match.index as number };
      }
    }
  }
  return findWord(lines);
}

export function findWordOccurrences(lines: string[], word: string): number[] {
  const result: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (line(lines, i).includes(word)) result.push(i);
  }
  return result;
}

export function wordForward(text: string, column: number, count: number): number {
  let position = column;
  for (let n = 0; n < count; n++) {
    const remaining = text.slice(position);
    const match = remaining.match(/^(\w+|\W+)\s*/);
    if (match) {
      position += match[0].length;
    } else {
      break;
    }
  }
  return Math.min(position, text.length - 1);
}

export function wordBackward(text: string, column: number, count: number): number {
  let position = column;
  for (let n = 0; n < count; n++) {
    const before = text.slice(0, position);
    const match = before.match(/\s*(\w+|\W+)$/);
    if (match) {
      position -= match[0].length;
    } else {
      break;
    }
  }
  return Math.max(position, 0);
}

export function bigWordForward(text: string, column: number, count: number): number {
  let position = column;
  for (let n = 0; n < count; n++) {
    const remaining = text.slice(position);
    const match = remaining.match(/^(\S+)\s*/);
    if (match) {
      position += match[0].length;
    } else {
      break;
    }
  }
  return Math.min(position, text.length - 1);
}

export function bigWordBackward(text: string, column: number, count: number): number {
  let position = column;
  for (let n = 0; n < count; n++) {
    const before = text.slice(0, position);
    const match = before.match(/\s*(\S+)$/);
    if (match) {
      position -= match[0].length;
    } else {
      break;
    }
  }
  return Math.max(position, 0);
}
