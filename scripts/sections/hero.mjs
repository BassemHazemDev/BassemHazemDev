import { c, W, PAD } from "../lib/theme.mjs";
import { Doc, measure } from "../lib/text.mjs";
import { card } from "../lib/frame.mjs";
import { inlineImage } from "../lib/sprite.mjs";
import { profile, pub } from "../data.mjs";

const H = 300;
const AVATAR = 212;
const LOGO = 132;

/** Static intro card: the {#;} mark on the left, a plain greeting and two lines about the work. */
export async function hero() {
  const doc = new Doc(W, H);
  const bg = card(doc, { lights: [[150, 150, 300, c.cyan, 0.2], [W, H, 320, c.emerald, 0.1]], drift: false });
  const ax = PAD;
  const ay = (H - AVATAR) / 2;
  doc.defs.push(
    `<radialGradient id="plate" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#0f2a3a"/><stop offset="1" stop-color="${c.bg2}"/></radialGradient>`,
    `<linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.cyan}"/><stop offset="1" stop-color="${c.emerald}"/></linearGradient>`,
  );

  const logo = await inlineImage(pub("logo-512.png"), { width: LOGO * 2, quality: 92 });
  const x = ax + AVATAR + 40;
  const hi = "Hi, I'm ";
  const hiW = measure(hi, { size: 46, font: "d", tracking: -0.02 });
  const site = profile.site.replace("https://www.", "");
  const locW = measure(profile.location, { size: 14, font: "c" });

  const body =
    bg.open +
    `<rect x="${ax}" y="${ay}" width="${AVATAR}" height="${AVATAR}" rx="28" fill="url(#plate)"/>` +
    `<image href="${logo.uri}" x="${ax + (AVATAR - LOGO) / 2}" y="${ay + (AVATAR - LOGO) / 2}" width="${LOGO}" height="${LOGO}"/>` +
    `<rect x="${ax}" y="${ay}" width="${AVATAR}" height="${AVATAR}" rx="28" fill="none" stroke="url(#ring)" stroke-width="2"/>` +
    doc.text("@BASSEMHAZEMDEV", { x, y: 78, size: 12.5, font: "c", fill: c.cyan, tracking: 0.28 }) +
    doc.text(hi, { x, y: 134, size: 46, font: "d", tracking: -0.02 }) +
    doc.outline("Bassem.", { x: x + hiW, y: 134, size: 46, fill: "url(#ring)", tracking: -0.02 }) +
    doc.text("Full stack developer and technical project manager.", { x, y: 174, size: 18, font: "m" }) +
    doc.text("I build SaaS and AI products with TypeScript, Next.js,", { x, y: 204, size: 16, fill: c.muted }) +
    doc.text("NestJS and MongoDB, and lead the team that ships them.", { x, y: 228, size: 16, fill: c.muted }) +
    `<circle cx="${x + 5}" cy="${257}" r="4.5" fill="${c.emerald}"/>` +
    doc.text(profile.location, { x: x + 18, y: 262, size: 14, font: "c", fill: c.ink }) +
    doc.text("·", { x: x + 18 + locW + 12, y: 262, size: 14, font: "c", fill: c.muted }) +
    doc.text(site, { x: x + 18 + locW + 34, y: 262, size: 14, font: "c", fill: c.cyan }) +
    bg.close;

  return doc.render(body, {
    label: "Hi, I'm Bassem — full stack developer and technical project manager in Alexandria, Egypt.",
  });
}
