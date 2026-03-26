import { flavors } from "@catppuccin/palette";

const frappe = flavors.frappe.colors;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${((1 << 24) | (red << 16) | (green << 8) | blue).toString(16).slice(1)}`;
}

export function lerpColor(from: string, to: string, ratio: number): string {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  return rgbToHex(
    Math.round(r1 + (r2 - r1) * ratio),
    Math.round(g1 + (g2 - g1) * ratio),
    Math.round(b1 + (b2 - b1) * ratio),
  );
}

export const theme = {
  base: frappe.base.hex,
  mantle: frappe.mantle.hex,
  crust: frappe.crust.hex,
  surface0: frappe.surface0.hex,
  surface1: frappe.surface1.hex,
  surface2: frappe.surface2.hex,
  overlay0: frappe.overlay0.hex,
  overlay1: frappe.overlay1.hex,
  text: frappe.text.hex,
  subtext0: frappe.subtext0.hex,
  subtext1: frappe.subtext1.hex,
  red: frappe.red.hex,
  green: frappe.green.hex,
  yellow: frappe.yellow.hex,
  blue: frappe.blue.hex,
  mauve: frappe.mauve.hex,
  teal: frappe.teal.hex,
  peach: frappe.peach.hex,
  sky: frappe.sky.hex,
  pink: frappe.pink.hex,
  flamingo: frappe.flamingo.hex,
  rosewater: frappe.rosewater.hex,
  lavender: frappe.lavender.hex,
} as const;
