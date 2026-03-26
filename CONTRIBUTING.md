# Contributing

The easiest way to contribute is by adding new challenges.

## Adding a Challenge

A challenge is a function that returns a `Challenge` object:

```ts
() => {
  const { snippetIndex, lines } = randomSnippet();
  const targetLine = randomInt(1, lines.length);

  return {
    id: `nav-goto-line-${targetLine}`,
    instruction: `Go to line ${targetLine}`,
    snippetIndex,
    initialCursor: [1, 0],
    validate: async (client) => {
      const [row] = await client.getCursor();
      return row === targetLine;
    },
    idealKeystrokes: String(targetLine).length + 2,
    hint: `${targetLine}G`,
    category: ChallengeCategory.Navigation,
  };
}
```

Each field:

| Field | Description |
|---|---|
| `id` | Unique identifier. Include dynamic values to distinguish runs. |
| `instruction` | What the player sees. Short, imperative. |
| `snippetIndex` | From `randomSnippet()`. Loads the code into the Neovim buffer. |
| `initialCursor` | `[row, column]` — rows are 1-indexed, columns are 0-indexed. |
| `validate` | Async function that checks Neovim state. Return `true` when the challenge is complete. |
| `idealKeystrokes` | Minimum keystrokes for the optimal solution. |
| `hint` | The Vim command(s) shown after 10.5 seconds of inactivity. |
| `category` | One of `Navigation`, `Editing`, `TextObjects`, `Search`, `MarksJumps`. |

## Where to Put It

Challenges live in `src/game/challenges/`. Pick the file matching your category:

- `navigation.ts`
- `editing.ts`
- `text-objects.ts`
- `search.ts`
- `marks-jumps.ts`

Append your challenge template to the default export array. It will be picked up automatically.

To add a new category, create a new file, export a `ChallengeTemplate[]`, and add it to the spread in `src/game/challenges/index.ts`.

## Helpers

`src/game/challenges/helpers.ts` provides utilities for building challenges:

- `randomSnippet()` — random code snippet with its index and lines
- `randomInt(min, max)` — random integer in range
- `randomElement(array)` — random array element
- `findLongLine()`, `findIndentedLine()`, `findEmptyLine()` — find lines by shape
- `findLineContaining(lines, char)` — find a line containing a specific character
- `findWord()`, `findMultiOccurrenceWord()` — find words in a snippet
- `wordForward()`, `wordBackward()` — simulate Vim word motion

## Validation

The `validate` function receives an `NvimClient` with access to:

- `getCursor()` — returns `[row, column]`
- `getLines()` — returns all buffer lines
- `getRegister(name)` — returns register contents
- `mode` — current Vim mode

Validate the result, not the method. Check that the cursor landed on the right line, or the buffer changed correctly — not that a specific key was pressed.

## Adding Snippets

Snippets live in `src/data/snippets/`. Each language file exports an array of `{ filetype, code }` objects. Add new snippets to an existing language file or create a new one and add it to `src/data/snippets/index.ts`.

Good snippets are 10-40 lines of real, readable code with a mix of nesting, blank lines, and varied syntax.
