import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import opentype from "opentype.js";
import { c, r1, esc } from "./theme.mjs";

const require = createRequire(import.meta.url);

function load(pkg, file) {
  const buf = readFileSync(require.resolve(`@fontsource/${pkg}/files/${file}`));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

// Single-letter keys double as glyph id prefixes inside the SVG.
export const fonts = {
  d: load("space-grotesk", "space-grotesk-latin-700-normal.woff"), // display
  m: load("space-grotesk", "space-grotesk-latin-500-normal.woff"), // medium
  s: load("space-grotesk", "space-grotesk-latin-400-normal.woff"), // body
  c: load("jetbrains-mono", "jetbrains-mono-latin-400-normal.woff"), // code
  b: load("jetbrains-mono", "jetbrains-mono-latin-700-normal.woff"), // code bold
};

function layout(str, fontKey, tracking) {
  const font = fonts[fontKey];
  const upm = font.unitsPerEm;
  const glyphs = font.stringToGlyphs(str);
  const out = [];
  let x = 0;
  glyphs.forEach((g, i) => {
    out.push({ g, x });
    x += g.advanceWidth ?? 0;
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) + tracking * upm;
  });
  return { font, upm, items: out, width: x };
}

export function measure(str, { size = 16, font = "s", tracking = 0 } = {}) {
  const l = layout(str, font, tracking);
  return (l.width * size) / l.upm;
}

export function wrap(str, maxWidth, opts = {}) {
  const lines = [];
  let line = "";
  for (const word of str.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, opts) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * One SVG document. Text is drawn as outlined glyphs so the file needs no fonts:
 * each glyph is defined once in <defs> and placed with <use>, which keeps
 * paragraphs small.
 */
export class Doc {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.glyphs = new Map();
    this.defs = [];
    this.css = [];
  }

  text(str, { x = 0, y = 0, size = 16, font = "s", fill = c.ink, anchor = "start", tracking = 0, opacity, attrs = "" } = {}) {
    const l = layout(str, font, tracking);
    const scale = size / l.upm;
    const w = l.width * scale;
    const ox = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
    let uses = "";
    for (const { g, x: gx } of l.items) {
      if (g.index === 0) console.warn(`missing glyph in "${str}" (font ${font})`);
      const d = g.getPath(0, 0, l.upm).toPathData(0);
      if (!d) continue;
      const id = `${font}${g.index.toString(36)}`;
      if (!this.glyphs.has(id)) this.glyphs.set(id, d);
      uses += `<use href="#${id}"${gx ? ` x="${Math.round(gx)}"` : ""}/>`;
    }
    const op = opacity == null ? "" : ` opacity="${opacity}"`;
    return `<g transform="translate(${r1(ox)} ${r1(y)}) scale(${+scale.toFixed(4)})" fill="${fill}"${op}${attrs ? " " + attrs : ""}>${uses}</g>`;
  }

  /** Multi-line paragraph; returns markup and the y of the last baseline. */
  para(str, { x = 0, y = 0, width, size = 16, lineHeight = 1.5, ...rest } = {}) {
    const lines = wrap(str, width, { size, font: rest.font ?? "s", tracking: rest.tracking ?? 0 });
    const svg = lines.map((ln, i) => this.text(ln, { x, y: y + i * size * lineHeight, size, ...rest })).join("");
    return { svg, lines: lines.length, bottom: y + (lines.length - 1) * size * lineHeight };
  }

  /** A single merged path, for text that needs one gradient across the whole word. */
  outline(str, { x = 0, y = 0, size = 16, font = "d", fill = c.ink, tracking = 0, attrs = "" } = {}) {
    const f = fonts[font];
    const d = f.getPath(str, x, y, size, { kerning: true, letterSpacing: tracking }).toPathData(1);
    return `<path d="${d}" fill="${fill}"${attrs ? " " + attrs : ""}/>`;
  }

  render(body, { label } = {}) {
    const glyphDefs = [...this.glyphs].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join("");
    const css = [
      ...this.css,
      // Entrances use fill-mode backwards, so with motion off everything is simply visible.
      "@media (prefers-reduced-motion:reduce){*{animation:none!important}}",
    ].join("");
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" width="${this.width}" height="${this.height}" role="img"${label ? ` aria-label="${esc(label)}"` : ""}>` +
      `<style>${css}</style><defs>${this.defs.join("")}${glyphDefs}</defs>${body}</svg>`
    );
  }
}
