import { c, W, PAD, r1 } from "../lib/theme.mjs";
import { Doc } from "../lib/text.mjs";
import { card, eyebrow, chipRow, tile, PING } from "../lib/frame.mjs";
import { signature, achievements, experience } from "../data.mjs";

const INNER = W - PAD * 2;

/** 01 — the {#;} mark read as three working principles. */
export function signatureSection() {
  const top = 140;
  const th = 286;
  const H = top + th + PAD;
  const doc = new Doc(W, H);
  const bg = card(doc, { lights: [[130, 40, 320, c.cyan, 0.17], [780, H, 300, c.ember, 0.1]] });
  doc.css.push(
    "@keyframes glow{0%,100%{opacity:.45}50%{opacity:1}}.g{animation:glow 4.5s ease-in-out infinite}.g1{animation-delay:1.5s}.g2{animation-delay:3s}",
  );

  const gap = 16;
  const tw = (INNER - gap * 2) / 3;
  const tiles = signature
    .map((part, i) => {
      const x = PAD + i * (tw + gap);
      const colour = part.accent === "ember" ? c.ember : c.cyan;
      const body = doc.para(part.body, { x: x + 22, y: top + 136, width: tw - 44, size: 14.5, fill: c.muted, lineHeight: 1.5 });
      return (
        tile(doc, { x, y: top, w: tw, h: th }) +
        `<g class="g g${i}">${doc.text(part.glyph, { x: x + 22, y: top + 66, size: 46, font: "b", fill: colour })}</g>` +
        doc.text(`0${i + 1}`, { x: x + tw - 22, y: top + 34, size: 12, font: "c", fill: c.muted, anchor: "end", tracking: 0.1 }) +
        doc.text(part.title, { x: x + 22, y: top + 106, size: 22, font: "d" }) +
        body.svg +
        `<line x1="${r1(x + 22)}" y1="${top + th - 44}" x2="${r1(x + tw - 22)}" y2="${top + th - 44}" stroke="${c.line}"/>` +
        doc.text(part.meta, { x: x + 22, y: top + th - 20, size: 11.5, font: "c", fill: colour })
      );
    })
    .join("");

  const body =
    bg.open +
    eyebrow(doc, "01", "Signature") +
    doc.text("Each glyph of the mark is a working principle.", { x: PAD, y: 106, size: 27, font: "d" }) +
    tiles +
    bg.close;
  return doc.render(body, {
    label: "Signature: Scope — every project starts with structure. Intent — every feature is tagged, tracked and prioritised. Delivery — work isn't done until it ships.",
  });
}

/** 02 — headline numbers. */
export function impactSection() {
  const top = 84;
  const th = 122;
  const gap = 16;
  const H = top + th * 2 + gap + PAD;
  const doc = new Doc(W, H);
  const bg = card(doc, { lights: [[720, 30, 320, c.emerald, 0.13], [80, H, 280, c.cyan, 0.14]] });
  doc.defs.push(
    `<linearGradient id="val" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${c.ink}"/><stop offset=".55" stop-color="${c.cyan}"/><stop offset="1" stop-color="${c.emerald}"/></linearGradient>`,
  );
  doc.css.push(
    "@keyframes bar{0%,100%{transform:scaleX(1);opacity:.7}50%{transform:scaleX(2.2);opacity:1}}.bar{transform-box:fill-box;transform-origin:left;animation:bar 5s ease-in-out infinite}",
    ...achievements.map((_, i) => `.b${i}{animation-delay:${(i * 0.45).toFixed(2)}s}`),
  );

  const tw = (INNER - gap * 2) / 3;
  const tiles = achievements
    .map((a, i) => {
      const x = PAD + (i % 3) * (tw + gap);
      const y = top + Math.floor(i / 3) * (th + gap);
      return (
        tile(doc, { x, y, w: tw, h: th }) +
        `<rect class="bar b${i}" x="${r1(x + 22)}" y="${y}" width="28" height="2.5" rx="1.25" fill="${i % 2 ? c.emerald : c.cyan}"/>` +
        doc.outline(a.value, { x: x + 20, y: y + 62, size: 46, fill: "url(#val)", tracking: -0.02 }) +
        doc.text(a.label, { x: x + 22, y: y + 88, size: 15, font: "m" }) +
        doc.text(a.detail, { x: x + 22, y: y + 107, size: 12, fill: c.muted })
      );
    })
    .join("");

  const body = bg.open + eyebrow(doc, "02", "Impact") + tiles + bg.close;
  return doc.render(body, { label: `Impact: ${achievements.map((a) => `${a.value} ${a.label}`).join(", ")}` });
}

/** 03 — roles on a timeline. */
export function experienceSection() {
  // Height depends on wrapped copy, so lay out against a scratch document first.
  const build = (doc) => {
    const lineX = PAD + 7;
    const x = PAD + 40;
    const width = W - PAD - x;
    let y = 108;
    let svg = "";
    const nodes = [];
    for (const role of experience) {
      nodes.push(y - 7);
      const colour = role.current ? c.emerald : c.cyan;
      svg +=
        (role.current ? `<circle class="ping" cx="${lineX}" cy="${y - 7}" r="5" fill="${c.emerald}"/>` : "") +
        `<circle cx="${lineX}" cy="${y - 7}" r="5" fill="${role.current ? c.emerald : c.bg}" stroke="${colour}" stroke-width="1.5"/>` +
        doc.text(role.title, { x, y, size: 21, font: "d" }) +
        doc.text(role.period.toUpperCase(), { x: W - PAD, y: y - 1, size: 12, font: "c", fill: colour, anchor: "end", tracking: 0.08 }) +
        doc.text(role.company, { x, y: y + 25, size: 15, font: "m", fill: c.cyan });
      y += 53;
      for (const point of role.points) {
        const p = doc.para(point, { x: x + 16, y, width: width - 16, size: 14.5, fill: c.muted, lineHeight: 1.5 });
        svg += `<rect x="${x}" y="${y - 5.5}" width="7" height="1.5" fill="${c.teal}"/>` + p.svg;
        y = p.bottom + 24;
      }
      const chips = chipRow(doc, role.tags, { x, y: y - 6, h: 24, size: 11.5, padX: 11, fill: c.muted });
      svg += chips.svg;
      y = chips.bottom + 54;
    }
    const height = y - 54 + PAD;
    const [first] = nodes;
    const lastNode = nodes.at(-1);
    const rail =
      `<line x1="${lineX}" y1="${first}" x2="${lineX}" y2="${lastNode}" stroke="${c.lineStrong}"/>` +
      `<g clip-path="url(#rail)"><rect class="pulse" x="${lineX - 1}" y="${first - 70}" width="2" height="70" fill="url(#pulse)"/></g>`;
    return { svg: rail + svg, height, travel: lastNode - first + 70 };
  };

  const { height } = build(new Doc(W, 100));
  const doc = new Doc(W, Math.round(height));
  const bg = card(doc, { lights: [[60, 80, 300, c.cyan, 0.15], [840, height - 40, 300, c.emerald, 0.09]] });
  const out = build(doc);
  doc.defs.push(
    `<linearGradient id="pulse" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${c.cyan}" stop-opacity="0"/><stop offset="1" stop-color="${c.cyan}"/></linearGradient>`,
    `<clipPath id="rail"><rect x="${PAD}" y="${101}" width="16" height="${r1(out.travel - 70)}"/></clipPath>`,
  );
  doc.css.push(
    PING,
    `@keyframes travel{0%{transform:translateY(0)}70%,100%{transform:translateY(${r1(out.travel)}px)}}.pulse{animation:travel 6s cubic-bezier(.5,0,.3,1) infinite}`,
  );
  const body = bg.open + eyebrow(doc, "03", "Experience") + out.svg + bg.close;
  return doc.render(body, {
    label: `Experience: ${experience.map((r) => `${r.title} at ${r.company}, ${r.period}`).join("; ")}`,
  });
}
