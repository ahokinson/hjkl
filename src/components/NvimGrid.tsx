import {
  bg as bgStyle,
  bold as boldStyle,
  fg as fgStyle,
  italic as italicStyle,
  StyledText,
  type TextRenderable,
  underline as underlineStyle,
} from "@opentui/core";
import { createEffect, createMemo, Index } from "solid-js";
import type { Cell, Screen } from "@/nvim/screen";

interface NvimGridProps {
  screen: Screen;
}

interface Span {
  text: string;
  fg: string;
  bg: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

function buildRowContent(screen: Screen, rowNumber: number): StyledText {
  const row = screen.grid[rowNumber];
  if (!row) return new StyledText([fgStyle(screen.defaultFg)(" ")]);

  const spans: Span[] = [];

  for (let column = 0; column < screen.width; column++) {
    const cell = row[column] as Cell;
    const isCursor = rowNumber === screen.cursor.row && column === screen.cursor.column;
    const attribute = screen.getResolvedAttribute(cell.highlightId);

    const cellFg = isCursor ? attribute.bg : attribute.fg;
    const cellBg = isCursor ? attribute.fg : attribute.bg;

    const prev = spans.at(-1);
    if (
      prev &&
      prev.fg === cellFg &&
      prev.bg === cellBg &&
      prev.bold === attribute.bold &&
      prev.italic === attribute.italic &&
      prev.underline === attribute.underline
    ) {
      prev.text += cell.char;
    } else {
      spans.push({
        text: cell.char,
        fg: cellFg,
        bg: cellBg,
        bold: attribute.bold,
        italic: attribute.italic,
        underline: attribute.underline,
      });
    }
  }

  const chunks = spans.map((span) => {
    let chunk = fgStyle(span.fg)(bgStyle(span.bg)(span.text));
    if (span.bold) chunk = boldStyle(chunk);
    if (span.italic) chunk = italicStyle(chunk);
    if (span.underline) chunk = underlineStyle(chunk);
    return chunk;
  });

  return new StyledText(chunks);
}

function NvimRow(props: { screen: Screen; rowIndex: number }) {
  let textRef: TextRenderable | undefined;

  createEffect(() => {
    props.screen.version();
    if (textRef) {
      textRef.content = buildRowContent(props.screen, props.rowIndex);
    }
  });

  return <text ref={textRef} content="" />;
}

export function NvimGrid(props: NvimGridProps) {
  const rowIndices = createMemo(() => {
    props.screen.version();
    return Array.from({ length: props.screen.height }, (_, i) => i);
  });

  return (
    <box flexDirection="column" flexGrow={1} bg={props.screen.defaultBg}>
      <Index each={rowIndices()}>
        {(rowIndex) => <NvimRow screen={props.screen} rowIndex={rowIndex()} />}
      </Index>
    </box>
  );
}
