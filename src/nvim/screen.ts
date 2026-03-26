import { createSignal } from "solid-js";
import { theme } from "@/theme";

export interface HighlightAttribute {
  fg?: string;
  bg?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  reverse?: boolean;
  sp?: string;
}

export interface Cell {
  char: string;
  highlightId: number;
}

export interface CursorPos {
  row: number;
  column: number;
}

function intToHex(n: number): string {
  return `#${(n & 0xffffff).toString(16).padStart(6, "0")}`;
}

const EMPTY_CELL: Cell = { char: " ", highlightId: 0 };

function makeGrid(width: number, height: number): Cell[][] {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({ ...EMPTY_CELL })),
  );
}

export function createScreen(width: number, height: number) {
  const highlightAttributes = new Map<number, HighlightAttribute>();
  highlightAttributes.set(0, {});

  let grid = makeGrid(width, height);

  let cursor: CursorPos = { row: 0, column: 0 };
  let defaultFg = theme.text;
  let defaultBg = theme.base;

  const [version, setVersion] = createSignal(0);

  function row(index: number): Cell[] {
    return grid[index] as Cell[];
  }

  function processRedrawEvents(events: any[]) {
    let needsFlush = false;

    for (const event of events) {
      const [name, ...args] = event;

      switch (name) {
        case "default_colors_set":
          for (const [fg, bg] of args) {
            if (fg !== -1 && fg !== undefined) defaultFg = intToHex(fg);
            if (bg !== -1 && bg !== undefined) defaultBg = intToHex(bg);
          }
          break;

        case "hl_attr_define":
          for (const [id, rgbAttribute] of args) {
            const attribute: HighlightAttribute = {};
            if (rgbAttribute.foreground !== undefined)
              attribute.fg = intToHex(rgbAttribute.foreground);
            if (rgbAttribute.background !== undefined)
              attribute.bg = intToHex(rgbAttribute.background);
            if (rgbAttribute.special !== undefined) attribute.sp = intToHex(rgbAttribute.special);
            if (rgbAttribute.bold) attribute.bold = true;
            if (rgbAttribute.italic) attribute.italic = true;
            if (rgbAttribute.underline) attribute.underline = true;
            if (rgbAttribute.strikethrough) attribute.strikethrough = true;
            if (rgbAttribute.reverse) attribute.reverse = true;
            highlightAttributes.set(id, attribute);
          }
          break;

        case "grid_resize":
          for (const [, w, h] of args) {
            const oldGrid = grid;
            const oldHeight = height;
            const oldWidth = width;
            grid = makeGrid(w, h);
            for (let r = 0; r < Math.min(oldHeight, h); r++) {
              for (let c = 0; c < Math.min(oldWidth, w); c++) {
                (grid[r] as Cell[])[c] = (oldGrid[r] as Cell[])[c] as Cell;
              }
            }
            width = w;
            height = h;
          }
          break;

        case "grid_line":
          for (const [, rowIndex, columnStart, cells] of args) {
            if (rowIndex >= height) continue;
            const gridRow = row(rowIndex);
            let column = columnStart;
            let lastHighlightId = 0;
            for (const cell of cells) {
              const char = cell[0] as string;
              const highlightId = cell.length > 1 ? (cell[1] as number) : lastHighlightId;
              const repeat = cell.length > 2 ? (cell[2] as number) : 1;
              lastHighlightId = highlightId;
              for (let i = 0; i < repeat; i++) {
                if (column < width) {
                  gridRow[column] = { char, highlightId };
                }
                column++;
              }
            }
          }
          break;

        case "grid_cursor_goto":
          for (const [, cursorRow, column] of args) {
            cursor = { row: cursorRow, column };
          }
          break;

        case "grid_scroll":
          for (const [, top, bot, left, right, rows] of args) {
            if (rows > 0) {
              for (let r = top; r < bot - rows; r++) {
                const destRow = row(r);
                const srcRow = row(r + rows);
                for (let c = left; c < right; c++) {
                  destRow[c] = srcRow[c] as Cell;
                }
              }
              for (let r = bot - rows; r < bot; r++) {
                const gridRow = row(r);
                for (let c = left; c < right; c++) {
                  gridRow[c] = { ...EMPTY_CELL };
                }
              }
            } else if (rows < 0) {
              for (let r = bot - 1; r >= top - rows; r--) {
                const destRow = row(r);
                const srcRow = row(r + rows);
                for (let c = left; c < right; c++) {
                  destRow[c] = srcRow[c] as Cell;
                }
              }
              for (let r = top; r < top - rows; r++) {
                const gridRow = row(r);
                for (let c = left; c < right; c++) {
                  gridRow[c] = { ...EMPTY_CELL };
                }
              }
            }
          }
          break;

        case "grid_clear":
          grid = makeGrid(width, height);
          break;

        case "flush":
          needsFlush = true;
          break;
      }
    }

    if (needsFlush) {
      setVersion((v) => v + 1);
    }
  }

  function getResolvedAttribute(highlightId: number): {
    fg: string;
    bg: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
  } {
    const attribute = highlightAttributes.get(highlightId) ?? {};
    let fg = attribute.fg ?? defaultFg;
    let bg = attribute.bg ?? defaultBg;

    if (attribute.reverse) {
      [fg, bg] = [bg, fg];
    }

    return {
      fg,
      bg,
      bold: attribute.bold ?? false,
      italic: attribute.italic ?? false,
      underline: attribute.underline ?? false,
      strikethrough: attribute.strikethrough ?? false,
    };
  }

  return {
    get width() {
      return width;
    },
    get height() {
      return height;
    },
    get grid() {
      return grid;
    },
    get cursor() {
      return cursor;
    },
    get defaultFg() {
      return defaultFg;
    },
    get defaultBg() {
      return defaultBg;
    },
    version,
    processRedrawEvents,
    getResolvedAttribute,
  };
}

export type Screen = ReturnType<typeof createScreen>;
