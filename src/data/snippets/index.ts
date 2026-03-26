import c from "@/data/snippets/c";
import go from "@/data/snippets/go";
import lua from "@/data/snippets/lua";
import python from "@/data/snippets/python";
import rust from "@/data/snippets/rust";
import typescript from "@/data/snippets/typescript";

interface RawSnippet {
  filetype: string;
  code: string;
}

export interface Snippet {
  filetype: string;
  code: string;
  lines: string[];
}

function toSnippet(raw: RawSnippet): Snippet {
  return { ...raw, lines: raw.code.split("\n") };
}

export const snippets: Snippet[] = [...c, ...go, ...lua, ...python, ...rust, ...typescript].map(
  toSnippet,
);
