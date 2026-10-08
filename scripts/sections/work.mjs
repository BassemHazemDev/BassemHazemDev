import { c, W, r1 } from "../lib/theme.mjs";
import { Doc } from "../lib/text.mjs";
import { card, eyebrow, chip, chipRow, arrow, PING } from "../lib/frame.mjs";
import { inlineImage } from "../lib/sprite.mjs";
import { projects, marqueeA, marqueeB, pub } from "../data.mjs";

// Two project cards sit side by side in the README, so each is half the page.
const CW = 432;
const CH = 452;
const IMG_H = 216;
const P = 24;

/** Cover for a project without a screenshot: its name set large over a ledger grid. */
function typeCover(doc, project) {
  const lines = [];
  for (let x = 0; x <= CW; x += 36) lines.push(`M${x} 0V${IMG_H}`);
  for (let y = 0; y <= IMG_H; y += 36) lines.push(`M0 ${y}H${CW}`);
  doc.defs.push(
    `<radialGradient id="cover" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="${project.accent}" stop-opacity=".42"/><stop offset="1" stop-color="${project.accent}" stop-opacity="0"/></radialGradient>`,
  );
  return (
    `<rect width="${CW}" height="${IMG_H}" fill="#06131a"/>` +
    `<path d="${lines.join("")}" stroke="${project.accent}" stroke-opacity=".1" fill="none"/>` +
    `<rect class="kb" width="${CW}" height="${IMG_H}" fill="url(#cover)"/>` +
    doc.text(project.name, { x: CW / 2, y: 124, size: 62, font: "d", anchor: "middle", tracking: -0.02 }) +
    doc.text("CRM  ·  INVOICING  ·  STRIPE", { x: CW / 2, y: 158, size: 11.5, font: "c", fill: project.accent, anchor: "middle", tracking: 0.2 })
  );
}

async function projectCard(project) {
  const doc = new Doc(CW, CH);
  const bg = card(doc, { lights: [[CW - 40, CH, 260, project.accent, 0.16]], drift: false });
  doc.css.push(
    "@keyframes kb{from{transform:scale(1)}to{transform:scale(1.07)}}.kb{transform-box:fill-box;transform-origin:50% 30%;animation:kb 16s ease-in-out infinite alternate}",
    PING,
  );
  doc.defs.push(
    `<clipPath id="shot"><rect width="${CW}" height="${IMG_H}"/></clipPath>`,
    `<linearGradient id="shade" x1="0" x2="0" y1="0" y2="1"><stop offset=".45" stop-color="${c.bg}" stop-opacity="0"/><stop offset="1" stop-color="${c.bg}"/></linearGradient>`,
  );

  let cover;
  if (project.image) {
    const img = await inlineImage(pub(project.image), { width: CW * 2, height: IMG_H * 2, quality: 72 });
    cover = `<image class="kb" href="${img.uri}" width="${CW}" height="${IMG_H}" preserveAspectRatio="xMidYMin slice"/>`;
  } else cover = typeCover(doc, project);

  // "LIVE" badge
  const bw = 64;
  const bx = CW - P - bw;
  const live =
    `<rect x="${r1(bx)}" y="18" width="${r1(bw)}" height="26" rx="13" fill="${c.bg}" fill-opacity=".72" stroke="${c.emerald}" stroke-opacity=".4"/>` +
    `<circle class="ping" cx="${r1(bx + 14)}" cy="31" r="3.5" fill="${c.emerald}"/><circle cx="${r1(bx + 14)}" cy="31" r="3.5" fill="${c.emerald}"/>` +
    doc.text("LIVE", { x: bx + 25, y: 35, size: 11, font: "b", fill: c.ink, tracking: 0.12 });

  const y0 = IMG_H;
  const summary = doc.para(project.summary, { x: P, y: y0 + 98, width: CW - P * 2, size: 14.5, fill: c.muted, lineHeight: 1.5 });
  const chips = chipRow(doc, project.stack, { x: P, y: y0 + 168, maxX: CW - P, h: 24, size: 11.5, padX: 10, gap: 6, colour: project.accent, fill: c.ink });

  const body =
    bg.open +
    `<g clip-path="url(#shot)">${cover}<rect width="${CW}" height="${IMG_H}" fill="url(#shade)"/></g>` +
    `<line x1="0" y1="${IMG_H}" x2="${CW}" y2="${IMG_H}" stroke="${project.accent}" stroke-opacity=".35"/>` +
    live +
    doc.text(project.kind.toUpperCase(), { x: P, y: y0 + 34, size: 11.5, font: "c", fill: project.accent, tracking: 0.16 }) +
    doc.text(project.name, { x: P, y: y0 + 68, size: 27, font: "d" }) +
    arrow(CW - P - 11, y0 + 50, 11, project.accent, 1.8) +
    summary.svg +
    chips.svg +
    bg.close;
  return doc.render(body, { label: `${project.name} — ${project.kind}. ${project.summary}` });
}

/** 04 — one card per project, so each can link to its own live site. */
export async function workSection() {
  const out = {};
  for (const project of projects) out[`work-${project.slug}`] = await projectCard(project);
  return out;
}

/** 05 — the portfolio's two counter-scrolling skill marquees. */
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
    eyebrow(doc, "05", "Stack") +
    `<g mask="url(#fadeEdges)">${row(marqueeA, 88, 0)}${row(marqueeB, 88 + h + 16, 1)}</g>` +
    bg.close;
  return doc.render(body, { label: `Stack: ${[...marqueeA, ...marqueeB].join(", ")}` });
}
