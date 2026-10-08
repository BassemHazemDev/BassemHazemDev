import { c, W, r1 } from "../lib/theme.mjs";
import { Doc } from "../lib/text.mjs";
import { card, eyebrow, chip } from "../lib/frame.mjs";
import { marqueeA, marqueeB } from "../data.mjs";

/** 01 — the portfolio's two counter-scrolling skill marquees. */
export function stackSection() {
  const H = 236;
  const doc = new Doc(W, H);
  const bg = card(doc, { lights: [[440, -40, 360, c.cyan, 0.14]] });
  const h = 42;
  const gap = 12;

  const row = (labels, y, i) => {
    let x = 0;
    let once = "";
    for (const label of labels) {
      const chipSvg = chip(doc, label, { x, y, h, size: 15, padX: 20, colour: i ? c.emerald : c.cyan });
      once += chipSvg.svg;
      x += chipSvg.width + gap;
    }
    // Draw the row twice and slide by exactly one row width: a seamless loop.
    doc.css.push(
      `@keyframes m${i}{to{transform:translateX(-${r1(x)}px)}}.m${i}{animation:m${i} ${i ? 46 : 38}s linear infinite${i ? " reverse" : ""}}`,
    );
    return `<g class="m${i}">${once}<g transform="translate(${r1(x)})">${once}</g></g>`;
  };

  doc.defs.push(
    `<linearGradient id="edge" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".12" stop-color="#fff"/><stop offset=".88" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
    `<mask id="fadeEdges" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#edge)"/></mask>`,
  );

  const body =
    bg.open +
    eyebrow(doc, "01", "Stack") +
    `<g mask="url(#fadeEdges)">${row(marqueeA, 88, 0)}${row(marqueeB, 88 + h + 16, 1)}</g>` +
    bg.close;
  return doc.render(body, { label: `Stack: ${[...marqueeA, ...marqueeB].join(", ")}` });
}
