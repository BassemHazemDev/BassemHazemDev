import { c, W, PAD, RADIUS, r1 } from "./theme.mjs";
import { measure } from "./text.mjs";

/**
 * The shared card every section sits on: dark rounded surface, soft "studio
 * light" glows, film grain and a hairline border — the portfolio's look.
 * `lights` is a list of [cx, cy, radius, colour, opacity].
 */
export function card(doc, { lights = [], drift = true } = {}) {
  const { width: w, height: h } = doc;
  doc.defs.push(
    `<clipPath id="card"><rect width="${w}" height="${h}" rx="${RADIUS}"/></clipPath>`,
    `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0"/></filter>`,
    ...lights.map(
      ([, , , colour, op = 0.28], i) =>
        `<radialGradient id="lg${i}"><stop offset="0" stop-color="${colour}" stop-opacity="${op}"/><stop offset=".65" stop-color="${colour}" stop-opacity="0"/></radialGradient>`,
    ),
  );
  if (drift && lights.length) {
    doc.css.push(
      "@keyframes drift{from{transform:translate(-14px,8px)}to{transform:translate(18px,-10px)}}",
      ".light{animation:drift 14s ease-in-out infinite alternate}.light:nth-of-type(2n){animation-duration:19s;animation-direction:alternate-reverse}",
    );
  }
  const glow = lights
    .map(([cx, cy, r], i) => `<circle class="light" cx="${cx}" cy="${cy}" r="${r}" fill="url(#lg${i})"/>`)
    .join("");
  return {
    open: `<g clip-path="url(#card)"><rect width="${w}" height="${h}" fill="${c.bg}"/>${glow}`,
    close:
      `<rect width="${w}" height="${h}" filter="url(#grain)" opacity=".07"/></g>` +
      `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${RADIUS - 0.5}" fill="none" stroke="${c.line}"/>`,
  };
}

/** Small mono eyebrow, e.g. "02 — CONTRIBUTIONS", with a hairline running to the right edge. */
export function eyebrow(doc, index, title, { y = 58, pad = PAD } = {}) {
  const num = doc.text(index, { x: pad, y, size: 12.5, font: "b", fill: c.cyan, tracking: 0.12 });
  const label = doc.text(title.toUpperCase(), { x: pad + 34, y, size: 12.5, font: "c", fill: c.muted, tracking: 0.26 });
  const end = pad + 34 + measure(title.toUpperCase(), { size: 12.5, font: "c", tracking: 0.26 }) + 18;
  return `${num}${label}<line x1="${r1(end)}" y1="${y - 4}" x2="${doc.width - pad}" y2="${y - 4}" stroke="${c.line}"/>`;
}

/** Pill chip. Returns markup and its width so callers can flow chips in a row. */
export function chip(doc, label, { x, y, h = 28, size = 12.5, font = "c", colour = c.cyan, fill = c.ink, padX = 13 } = {}) {
  const tw = measure(label, { size, font });
  const w = tw + padX * 2;
  const svg =
    `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${h}" rx="${h / 2}" fill="${colour}" fill-opacity=".07" stroke="${colour}" stroke-opacity=".3"/>` +
    doc.text(label, { x: x + padX, y: y + h / 2 + size * 0.34, size, font, fill });
  return { svg, width: w };
}

/** Flow chips left to right, wrapping at maxX. */
export function chipRow(doc, labels, { x, y, maxX = W - PAD, gap = 8, h = 28, ...opts } = {}) {
  let cx = x;
  let cy = y;
  let svg = "";
  for (const label of labels) {
    const probe = chip(doc, label, { x: cx, y: cy, h, ...opts });
    if (cx > x && cx + probe.width > maxX) {
      cx = x;
      cy += h + gap;
      const again = chip(doc, label, { x: cx, y: cy, h, ...opts });
      svg += again.svg;
      cx += again.width + gap;
    } else {
      svg += probe.svg;
      cx += probe.width + gap;
    }
  }
  return { svg, bottom: cy + h, right: cx - gap };
}

/** Glass tile used inside cards (the portfolio's `.glass` surface, minus the blur). */
export function tile(doc, { x, y, w, h, rx = 16, accent } = {}) {
  if (!doc.defs.some((d) => d.includes('id="tile"'))) {
    doc.defs.push(
      `<linearGradient id="tile" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#142838" stop-opacity=".6"/><stop offset="1" stop-color="#08101a" stop-opacity=".6"/></linearGradient>`,
    );
  }
  return (
    `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${rx}" fill="url(#tile)" stroke="${c.line}"/>` +
    (accent ? `<rect x="${r1(x + 22)}" y="${r1(y)}" width="34" height="2.5" rx="1.25" fill="${accent}"/>` : "")
  );
}

/** Diagonal "open link" arrow, drawn so we don't depend on a font having the glyph. */
export function arrow(x, y, size = 9, colour = c.cyan, width = 1.6) {
  return `<path d="M${r1(x)} ${r1(y + size)}L${r1(x + size)} ${r1(y)}M${r1(x + size * 0.25)} ${r1(y)}H${r1(x + size)}V${r1(y + size * 0.75)}" fill="none" stroke="${colour}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

export const BLINK = "@keyframes blink{50%{opacity:0}}.cur{animation:blink 1.1s steps(1) infinite}";
export const PING =
  "@keyframes ping{0%{transform:scale(1);opacity:.7}80%,100%{transform:scale(3.2);opacity:0}}.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.2s cubic-bezier(0,0,.2,1) infinite}";
