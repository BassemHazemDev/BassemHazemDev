import { c, W, PAD, r1 } from "../lib/theme.mjs";
import { Doc, measure } from "../lib/text.mjs";
import { card, chipRow } from "../lib/frame.mjs";
import { inlineImage, spriteSheet } from "../lib/sprite.mjs";
import { profile, pub } from "../data.mjs";

const H = 460;
const FRAME_STEP = 4; // every 4th of the 121 scroll frames
const CYCLE = 10; // seconds for one role to type, hold and clear

/** SMIL keyframes for a typed line: [seconds, visible chars]. */
function typeEvents(len, start) {
  const ev = [];
  for (let k = 1; k <= len; k++) ev.push([start + k * 0.05, k]);
  const del = start + 3.8;
  for (let k = len - 1; k >= 0; k--) ev.push([del + (len - k) * 0.022, k]);
  return ev;
}

function animate(attr, events, toValue) {
  const all = events[0][0] === 0 ? events : [[0, 0], ...events];
  const values = all.map(([, n]) => r1(toValue(n))).join(";");
  const times = all.map(([t]) => +(t / CYCLE).toFixed(4)).join(";");
  return `<animate attributeName="${attr}" dur="${CYCLE}s" repeatCount="indefinite" calcMode="discrete" values="${values}" keyTimes="${times}"/>`;
}

export async function hero() {
  const doc = new Doc(W, H);

  // Portrait: the portfolio's scroll-scrubbed head turn, replayed as a film strip.
  const files = [];
  for (let i = 1; i <= 121; i += FRAME_STEP) files.push(pub(`frames/mobile/frame_${String(i).padStart(4, "0")}.webp`));
  const pw = 454;
  const sheet = await spriteSheet(files, { width: pw, quality: 58 });
  const ph = sheet.frameHeight;
  const px = W - pw;
  const py = H - ph;
  const last = (sheet.count - 1) * pw;
  const logo = await inlineImage(pub("logo-512.png"), { width: 96, quality: 90 });

  doc.defs.push(
    `<linearGradient id="sky" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${c.bg}"/><stop offset=".62" stop-color="#08212e"/><stop offset="1" stop-color="#0a5672"/></linearGradient>`,
    `<linearGradient id="fadeX" gradientUnits="userSpaceOnUse" x1="${px}" x2="${px + 190}" y1="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>`,
    `<mask id="fade" maskUnits="userSpaceOnUse" x="${px}" y="0" width="${pw}" height="${H}"><rect x="${px}" width="${pw}" height="${H}" fill="url(#fadeX)"/></mask>`,
    `<linearGradient id="floor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${c.bg}" stop-opacity="0"/><stop offset="1" stop-color="${c.bg}" stop-opacity=".85"/></linearGradient>`,
    `<linearGradient id="name" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${c.cyan}"/><stop offset="1" stop-color="${c.emerald}"/></linearGradient>`,
  );

  doc.css.push(
    `@keyframes film{0%,8%{transform:translateX(0);animation-timing-function:steps(${sheet.count - 1})}34%,86%{transform:translateX(-${last}px);animation-timing-function:steps(${sheet.count - 1})}100%{transform:translateX(0)}}`,
    ".film{animation:film 11s infinite}",
    "@keyframes rise{from{opacity:0;transform:translateY(16px)}}",
    ".e{animation:rise 1s cubic-bezier(.16,1,.3,1) backwards}.e2{animation-delay:.12s}.e3{animation-delay:.24s}.e4{animation-delay:.36s}.e5{animation-delay:.48s}.e6{animation-delay:.6s}",
    "@keyframes blink{50%{opacity:0}}.cur{animation:blink 1s steps(1) infinite}",
    "@keyframes ping{0%{transform:scale(1);opacity:.7}80%,100%{transform:scale(3.2);opacity:0}}.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.2s cubic-bezier(0,0,.2,1) infinite}",
  );

  const bg = card(doc, { lights: [[150, 110, 330, c.cyan, 0.2], [330, 470, 260, c.emerald, 0.1]] });

  // Typed roles
  const size = 19;
  const cw = measure("M", { size, font: "c" });
  const tx = PAD + cw * 2;
  const ty = 286;
  const lines = profile.roles;
  const slot = CYCLE / lines.length;
  let cursorEvents = [];
  const typed = lines
    .map((role, i) => {
      const ev = typeEvents(role.length, i * slot);
      cursorEvents = cursorEvents.concat(ev);
      doc.defs.push(
        `<clipPath id="t${i}"><rect x="${r1(tx)}" y="${ty - 24}" height="34" width="${i === 0 ? r1(role.length * cw) : 0}">${animate("width", ev, (n) => n * cw)}</rect></clipPath>`,
      );
      return `<g clip-path="url(#t${i})">${doc.text(role, { x: tx, y: ty, size, font: "c", fill: c.ink })}</g>`;
    })
    .join("");
  const cursor = `<rect class="cur" x="${r1(tx)}" y="${ty - 17}" width="${r1(cw * 0.9)}" height="21" rx="1.5" fill="${c.cyan}">${animate("x", cursorEvents, (n) => tx + n * cw + 2)}</rect>`;

  const tagline = doc.para(profile.tagline, { x: PAD, y: 322, width: 372, size: 16, fill: c.muted, lineHeight: 1.5 });
  const chips = chipRow(doc, ["Next.js", "NestJS", "MongoDB", "AI / RAG"], { x: PAD, y: 366, maxX: 430 });

  const body =
    bg.open +
    `<rect width="${W}" height="${H}" fill="url(#sky)" opacity=".9"/>` +
    `<g mask="url(#fade)"><svg x="${px}" y="${py}" width="${pw}" height="${ph}" viewBox="0 0 ${pw} ${ph}"><image class="film" href="${sheet.uri}" width="${sheet.count * pw}" height="${ph}" preserveAspectRatio="none"/></svg></g>` +
    `<rect y="${H - 150}" width="${W}" height="150" fill="url(#floor)"/>` +
    // Brand row
    `<g class="e"><image href="${logo.uri}" x="${PAD}" y="34" width="44" height="44"/>` +
    `<line x1="${PAD + 60}" y1="56" x2="${PAD + 92}" y2="56" stroke="${c.lineStrong}"/>` +
    doc.text("PORTFOLIO", { x: PAD + 106, y: 60.5, size: 12.5, font: "c", fill: c.cyan, tracking: 0.3 }) +
    doc.text(`·  ${profile.location.toUpperCase()}`, { x: PAD + 106 + measure("PORTFOLIO", { size: 12.5, font: "c", tracking: 0.3 }) + 14, y: 60.5, size: 12.5, font: "c", fill: c.muted, tracking: 0.3 }) +
    `</g>` +
    // Name
    `<g class="e e2">${doc.outline("Bassem", { x: PAD - 3, y: 162, size: 80, fill: c.ink, tracking: -0.02 })}</g>` +
    `<g class="e e3">${doc.outline("Hazem", { x: PAD - 3, y: 238, size: 80, fill: "url(#name)", tracking: -0.02 })}</g>` +
    // Roles
    `<g class="e e4">${doc.text("›", { x: PAD, y: ty, size, font: "b", fill: c.emerald })}${typed}${cursor}</g>` +
    `<g class="e e5">${tagline.svg}</g>` +
    `<g class="e e6">${chips.svg}</g>` +
    `<g class="e e6"><circle class="ping" cx="${PAD + 5}" cy="427" r="5" fill="${c.emerald}"/><circle cx="${PAD + 5}" cy="427" r="5" fill="${c.emerald}"/>` +
    doc.text("bassemhazem.com", { x: PAD + 22, y: 432.5, size: 15, font: "c", fill: c.cyan }) +
    `</g>` +
    bg.close;

  return doc.render(body, { label: "Bassem Hazem — Full Stack Developer and Technical Project Manager, Alexandria, Egypt" });
}
