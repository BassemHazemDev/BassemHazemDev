import { c, W, PAD } from "../lib/theme.mjs";
import { Doc, measure } from "../lib/text.mjs";
import { card, chipRow } from "../lib/frame.mjs";
import { inlineImage } from "../lib/sprite.mjs";
import { profile, pub } from "../data.mjs";

const H = 460;

/** Static banner: brand mark, name, roles and the portrait. No animation. */
export async function hero() {
  const doc = new Doc(W, H);

  const pw = 454;
  const portrait = await inlineImage(pub("frames/desktop/frame_0121.webp"), { width: pw * 2, quality: 74 });
  const ph = Math.round((portrait.height / portrait.width) * pw);
  const px = W - pw;
  const logo = await inlineImage(pub("logo-512.png"), { width: 96, quality: 90 });

  doc.defs.push(
    `<linearGradient id="sky" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${c.bg}"/><stop offset=".62" stop-color="#08212e"/><stop offset="1" stop-color="#0a5672"/></linearGradient>`,
    `<linearGradient id="fadeX" gradientUnits="userSpaceOnUse" x1="${px}" x2="${px + 190}" y1="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>`,
    `<mask id="fade" maskUnits="userSpaceOnUse" x="${px}" y="0" width="${pw}" height="${H}"><rect x="${px}" width="${pw}" height="${H}" fill="url(#fadeX)"/></mask>`,
    `<linearGradient id="floor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${c.bg}" stop-opacity="0"/><stop offset="1" stop-color="${c.bg}" stop-opacity=".85"/></linearGradient>`,
    `<linearGradient id="name" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${c.cyan}"/><stop offset="1" stop-color="${c.emerald}"/></linearGradient>`,
  );

  const bg = card(doc, { lights: [[150, 110, 330, c.cyan, 0.2], [330, 470, 260, c.emerald, 0.1]], drift: false });
  const [role, second] = profile.roles;
  const handle = "@BassemHazemDev";
  const chips = chipRow(doc, ["Next.js", "NestJS", "MongoDB", "AI / RAG"], { x: PAD, y: 356, maxX: 430 });

  const body =
    bg.open +
    `<rect width="${W}" height="${H}" fill="url(#sky)" opacity=".9"/>` +
    `<g mask="url(#fade)"><image href="${portrait.uri}" x="${px}" y="${H - ph}" width="${pw}" height="${ph}"/></g>` +
    `<rect y="${H - 150}" width="${W}" height="150" fill="url(#floor)"/>` +
    `<image href="${logo.uri}" x="${PAD}" y="34" width="44" height="44"/>` +
    `<line x1="${PAD + 60}" y1="56" x2="${PAD + 92}" y2="56" stroke="${c.lineStrong}"/>` +
    doc.text(handle.toUpperCase(), { x: PAD + 106, y: 60.5, size: 12.5, font: "c", fill: c.cyan, tracking: 0.3 }) +
    doc.text(`·  ${profile.location.toUpperCase()}`, { x: PAD + 106 + measure(handle.toUpperCase(), { size: 12.5, font: "c", tracking: 0.3 }) + 14, y: 60.5, size: 12.5, font: "c", fill: c.muted, tracking: 0.3 }) +
    doc.outline("Bassem", { x: PAD - 3, y: 162, size: 80, fill: c.ink, tracking: -0.02 }) +
    doc.outline("Hazem", { x: PAD - 3, y: 238, size: 80, fill: "url(#name)", tracking: -0.02 }) +
    doc.text(role, { x: PAD, y: 288, size: 25, font: "m" }) +
    doc.text(`& ${second}`, { x: PAD, y: 320, size: 25, font: "m", fill: c.muted }) +
    chips.svg +
    `<circle cx="${PAD + 5}" cy="421" r="5" fill="${c.emerald}"/>` +
    doc.text("bassemhazem.com", { x: PAD + 22, y: 426.5, size: 15, font: "c", fill: c.cyan }) +
    bg.close;

  return doc.render(body, { label: "Bassem Hazem — Full Stack Developer and Technical Project Manager, Alexandria, Egypt" });
}
