import { c, W } from "../lib/theme.mjs";
import { Doc, measure } from "../lib/text.mjs";
import { card, eyebrow, arrow } from "../lib/frame.mjs";

const PILLS = [
  { id: "site", label: "bassemhazem.com", primary: true },
  { id: "articles", label: "Articles" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
];

/** Link buttons. One SVG each, because a README image can only carry one link. */
export function pills() {
  const out = {};
  const h = 44;
  for (const { id, label, primary } of PILLS) {
    const size = 14;
    const tw = measure(label, { size, font: "b" });
    const w = Math.ceil(tw + 20 * 2 + 20);
    const doc = new Doc(w, h);
    const ink = primary ? c.bg : c.ink;
    if (primary) {
      doc.defs.push(
        `<linearGradient id="p" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${c.cyan}"/><stop offset="1" stop-color="${c.emerald}"/></linearGradient>`,
      );
    }
    const body =
      `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${h / 2 - 0.5}" fill="${primary ? "url(#p)" : c.surface}" stroke="${primary ? "none" : c.lineStrong}"/>` +
      doc.text(label, { x: 20, y: h / 2 + 5, size, font: "b", fill: ink }) +
      arrow(20 + tw + 9, h / 2 - 5, 9, primary ? c.bg : c.cyan, 1.8);
    out[`pill-${id}`] = doc.render(body, { label });
  }
  return out;
}

/** Heading strips for sections that are made of several linked images. */
export function headings() {
  const out = {};
  for (const [id, index, title] of [["writing", "05", "Writing"]]) {
    const doc = new Doc(W, 60);
    const bg = card(doc, { lights: [[90, 30, 220, c.cyan, 0.16]], drift: false });
    out[`head-${id}`] = doc.render(bg.open + eyebrow(doc, index, title, { y: 35 }) + bg.close, { label: title });
  }
  return out;
}
