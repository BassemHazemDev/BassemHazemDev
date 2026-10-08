import { c, W } from "../lib/theme.mjs";
import { Doc, measure, wrap } from "../lib/text.mjs";
import { card, eyebrow, arrow, BLINK } from "../lib/frame.mjs";
import { inlineImage } from "../lib/sprite.mjs";
import { testimonials, signatureClosing, pub } from "../data.mjs";

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
  for (const [id, index, title] of [
    ["work", "04", "Selected work"],
    ["writing", "06", "Writing"],
    ["words", "08", "In their words"],
  ]) {
    const doc = new Doc(W, 60);
    const bg = card(doc, { lights: [[90, 30, 220, c.cyan, 0.16]], drift: false });
    out[`head-${id}`] = doc.render(bg.open + eyebrow(doc, index, title, { y: 35 }) + bg.close, { label: title });
  }
  return out;
}

/** 08 — two quotes, each its own card so it can link to the author's LinkedIn. */
export function testimonialCards() {
  const cw = 432;
  const p = 26;
  const size = 15.5;
  const lh = 1.6;
  const opts = { size, font: "s" };
  const maxLines = Math.max(...testimonials.map((t) => wrap(t.quote, cw - p * 2, opts).length));
  const quoteTop = 92;
  const quoteBottom = quoteTop + (maxLines - 1) * size * lh;
  const H = Math.round(quoteBottom + 104);
  const out = {};
  testimonials.forEach((t, i) => {
    const doc = new Doc(cw, H);
    const bg = card(doc, { lights: [[i ? cw : 0, 0, 260, i ? c.emerald : c.cyan, 0.16]], drift: false });
    const quote = doc.para(t.quote, { x: p, y: quoteTop, width: cw - p * 2, size, lineHeight: lh });
    const [who, where] = t.role.split(" · ");
    const body =
      bg.open +
      doc.text("“", { x: p - 4, y: 82, size: 84, font: "d", fill: i ? c.emerald : c.cyan, opacity: 0.55 }) +
      quote.svg +
      `<line x1="${p}" y1="${H - 78}" x2="${cw - p}" y2="${H - 78}" stroke="${c.line}"/>` +
      doc.text(t.author, { x: p, y: H - 48, size: 15.5, font: "d" }) +
      doc.text(who, { x: p, y: H - 28, size: 12, fill: c.muted }) +
      (where ? doc.text(`· ${where}`, { x: p + measure(who, { size: 12 }) + 6, y: H - 28, size: 12, fill: c.muted, opacity: 0.75 }) : "") +
      arrow(cw - p - 10, H - 58, 10, c.cyan, 1.7) +
      bg.close;
    out[`quote-${i + 1}`] = doc.render(body, { label: `“${t.quote}” — ${t.author}, ${t.role}` });
  });
  return out;
}

/** Sign-off: the portfolio's closing line, ending on the logo's red semicolon. */
export async function footer() {
  const H = 232;
  const doc = new Doc(W, H);
  const bg = card(doc, { lights: [[440, 250, 420, c.cyan, 0.2], [440, -60, 260, c.ember, 0.07]] });
  doc.css.push(BLINK);
  const logo = await inlineImage(pub("logo-512.png"), { width: 96, quality: 90 });
  const size = 34;
  const tailW = measure(signatureClosing.tail, { size, font: "d", tracking: -0.01 });
  const tailX = W / 2 - (tailW + 14) / 2;
  const body =
    bg.open +
    `<image href="${logo.uri}" x="${W / 2 - 20}" y="30" width="40" height="40"/>` +
    doc.text(signatureClosing.lead, { x: W / 2, y: 118, size, font: "d", fill: c.muted, anchor: "middle", tracking: -0.01 }) +
    doc.text(signatureClosing.tail, { x: tailX, y: 160, size, font: "d", tracking: -0.01 }) +
    `<g class="cur">${doc.text(";", { x: tailX + tailW + 2, y: 160, size, font: "d", fill: c.ember })}</g>` +
    doc.text("BASSEMHAZEM.COM", { x: W / 2, y: 202, size: 11.5, font: "c", fill: c.cyan, anchor: "middle", tracking: 0.32 }) +
    bg.close;
  return doc.render(body, { label: `${signatureClosing.lead} ${signatureClosing.tail};` });
}
