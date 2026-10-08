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

/** Small mono eyebrow, e.g. "02 — IMPACT", with a hairline running to the right edge. */
export function eyebrow(doc, index, title, { y = 58 } = {}) {
  const num = doc.text(index, { x: PAD, y, size: 12.5, font: "b", fill: c.cyan, tracking: 0.12 });
  const label = doc.text(title.toUpperCase(), { x: PAD + 34, y, size: 12.5, font: "c", fill: c.muted, tracking: 0.26 });
  const end = PAD + 34 + measure(title.toUpperCase(), { size: 12.5, font: "c", tracking: 0.26 }) + 18;
  return `${num}${label}<line x1="${r1(end)}" y1="${y - 4}" x2="${W - PAD}" y2="${y - 4}" stroke="${c.line}"/>`;
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
