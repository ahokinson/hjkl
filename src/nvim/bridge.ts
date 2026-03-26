interface KeyEvent {
  name: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  sequence: string;
  raw: string;
}

const SPECIAL_KEYS: Record<string, string> = {
  escape: "<Esc>",
  return: "<CR>",
  enter: "<CR>",
  tab: "<Tab>",
  backspace: "<BS>",
  delete: "<Del>",
  up: "<Up>",
  down: "<Down>",
  left: "<Left>",
  right: "<Right>",
  home: "<Home>",
  end: "<End>",
  pageup: "<PageUp>",
  pagedown: "<PageDown>",
  insert: "<Insert>",
  f1: "<F1>",
  f2: "<F2>",
  f3: "<F3>",
  f4: "<F4>",
  f5: "<F5>",
  f6: "<F6>",
  f7: "<F7>",
  f8: "<F8>",
  f9: "<F9>",
  f10: "<F10>",
  f11: "<F11>",
  f12: "<F12>",
  space: "<Space>",
};

const SHIFT_CHAR_KEYS = new Set([
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "-",
  "=",
  "[",
  "]",
  "\\",
  ";",
  "'",
  ",",
  ".",
  "/",
  "`",
]);

function modifierPrefix(ctrl: boolean, meta: boolean, shift: boolean): string {
  return (ctrl ? "C-" : "") + (meta ? "M-" : "") + (shift ? "S-" : "");
}

export function translateKey(event: KeyEvent): string {
  const { name, ctrl, meta, shift, sequence } = event;

  const special = SPECIAL_KEYS[name];
  if (special) {
    const prefix = modifierPrefix(ctrl, meta, shift);
    return prefix ? `<${prefix}${special.slice(1, -1)}>` : special;
  }

  if (ctrl || meta) {
    return `<${modifierPrefix(ctrl, meta, shift)}${name}>`;
  }

  if (shift && name.length === 1 && name >= "a" && name <= "z") {
    return name.toUpperCase();
  }

  if (shift && SHIFT_CHAR_KEYS.has(name)) {
    return sequence || name;
  }

  if (name.length === 1) {
    return name;
  }

  if (sequence) {
    return sequence;
  }

  return "";
}
