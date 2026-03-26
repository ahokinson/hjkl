import { spawn } from "node:child_process";
import { attach, type NeovimClient } from "neovim";

const UI_ATTACH_SETTLE_MS = 200;

export interface NvimClient {
  nvim: NeovimClient;
  sendKeys(keys: string): Promise<number>;
  getCursor(): Promise<[number, number]>;
  setCursor(row: number, column: number): Promise<void>;
  getMode(): Promise<{ mode: string; blocking: boolean }>;
  getBufferLines(start?: number, end?: number): Promise<string[]>;
  getBufferLine(row: number): Promise<string>;
  getRegister(name: string): Promise<string>;
  loadSnippet(text: string, filetype: string): Promise<void>;
  resize(width: number, height: number): Promise<void>;
  destroy(): void;
}

export async function createNvimClient(
  width: number,
  height: number,
  onRedraw: (events: any[]) => void,
): Promise<NvimClient> {
  const proc = spawn("nvim", ["--embed"], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  const nvim = attach({ proc });

  nvim.on("notification", (method: string, args: any[]) => {
    if (method === "redraw") {
      onRedraw(args);
    }
  });

  await nvim.uiAttach(width, height, {
    ext_linegrid: true,
    rgb: true,
  });

  await Bun.sleep(UI_ATTACH_SETTLE_MS);

  await nvim.command("enew! | set noswapfile buftype=nofile");

  return {
    nvim,

    sendKeys(keys: string) {
      return nvim.input(keys);
    },

    async getCursor() {
      const window = await nvim.window;
      const cursor = await window.cursor;
      return cursor as [number, number];
    },

    async setCursor(row: number, column: number) {
      await nvim.call("nvim_win_set_cursor", [0, [row, column]]);
    },

    getMode() {
      return nvim.mode;
    },

    async getBufferLines(start = 0, end = -1) {
      const buffer = await nvim.buffer;
      return buffer.getLines({ start, end, strictIndexing: false });
    },

    async getBufferLine(row: number) {
      const buffer = await nvim.buffer;
      const lines = await buffer.getLines({ start: row - 1, end: row, strictIndexing: false });
      return lines[0] as string;
    },

    getRegister(name: string) {
      return nvim.call("getreg", [name]) as Promise<string>;
    },

    async loadSnippet(text: string, filetype: string) {
      await nvim.command("enew! | set noswapfile buftype=nofile");
      const buffer = await nvim.buffer;
      const lines = text.split("\n");
      await buffer.replace(lines, 0);
      await nvim.command(`set filetype=${filetype}`);
      await nvim.command("normal! gg0");
    },

    async resize(width: number, height: number) {
      await nvim.uiTryResize(width, height);
    },

    destroy() {
      nvim.quit();
      proc.kill();
    },
  };
}
