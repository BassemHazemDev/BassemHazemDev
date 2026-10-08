// Generates the static README sections into ../assets. Run: npm run build
import { mkdirSync, writeFileSync } from "node:fs";
import { ROOT } from "./data.mjs";
import { hero } from "./sections/hero.mjs";
import { signatureSection, impactSection, experienceSection } from "./sections/story.mjs";
import { workSection, stackSection } from "./sections/work.mjs";
import { pills, headings, testimonialCards, footer } from "./sections/chrome.mjs";

const BUDGET_KB = { hero: 600 };
const DEFAULT_BUDGET_KB = 150;

const sections = {
  hero,
  pills,
  signature: signatureSection,
  impact: impactSection,
  experience: experienceSection,
  headings,
  work: workSection,
  stack: stackSection,
  quotes: testimonialCards,
  footer,
};

const only = process.argv.slice(2);
mkdirSync(`${ROOT}assets`, { recursive: true });

let total = 0;
for (const [name, make] of Object.entries(sections)) {
  if (only.length && !only.includes(name)) continue;
  const out = await make();
  // A section may return one SVG or a map of { fileName: svg }.
  const files = typeof out === "string" ? { [name]: out } : out;
  for (const [file, svg] of Object.entries(files)) {
    writeFileSync(`${ROOT}assets/${file}.svg`, svg);
    const kb = Buffer.byteLength(svg) / 1024;
    total += kb;
    const budget = BUDGET_KB[file] ?? DEFAULT_BUDGET_KB;
    console.log(`${kb > budget ? "OVER" : "ok  "}  ${file}.svg  ${kb.toFixed(1)} KB (budget ${budget})`);
  }
}
console.log(`total ${total.toFixed(1)} KB`);
