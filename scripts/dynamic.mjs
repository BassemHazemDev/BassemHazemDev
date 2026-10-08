// Refreshes the parts of the README that change over time: the contribution
// heatmap and the latest articles. Run by .github/workflows/profile.yml.
//   GH_TOKEN (optional) — with it, private contributions are counted too.
import { readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { c, W, PAD, r1, esc } from "./lib/theme.mjs";
import { Doc, measure } from "./lib/text.mjs";
import { card, eyebrow, arrow, PING } from "./lib/frame.mjs";
import { ROOT, profile } from "./data.mjs";

const USER = process.env.GH_USER ?? "BassemHazemDev";
const FEED = `${profile.site}/articles/feed.xml`;
const ARTICLE_COUNT = 3;
const UA = { "user-agent": "profile-readme-build" };

// ───────────────────────── contributions ─────────────────────────

const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

async function fromGraphQL(token) {
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount contributionLevel}}}}}}`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...UA, authorization: `bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ query, variables: { login: USER } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors ?? res.status)}`);
  return json.data.user.contributionsCollection.contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .map((d) => ({ date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] }));
}

/** No token: read the public calendar GitHub renders on the profile page. */
async function fromProfilePage() {
  const res = await fetch(`https://github.com/users/${USER}/contributions`, { headers: UA });
  if (!res.ok) throw new Error(`contributions page: ${res.status}`);
  const html = await res.text();
  const counts = new Map();
  for (const [, id, text] of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    counts.set(id, Number.parseInt(text, 10) || 0);
  }
  const days = [];
  for (const [tag] of html.matchAll(/<td[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
    const attr = (name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
    days.push({ date: attr("data-date"), level: Number(attr("data-level")), count: counts.get(attr("id")) ?? 0 });
  }
  if (!days.length) throw new Error("contributions page: no days found");
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

function streaks(days) {
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // Today may simply not have happened yet, so an empty last day doesn't break the streak.
  let i = days.length - 1;
  if (i >= 0 && !days[i].count) i--;
  let current = 0;
  while (i >= 0 && days[i].count) {
    current++;
    i--;
  }
  return { current, longest };
}

const SCALE = ["rgba(120,200,230,0.08)", "#0f4753", c.teal, c.cyan, c.emerald];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const utc = (date) => new Date(`${date}T00:00:00Z`);

function contributionsSvg(days) {
  const H = 356;
  const doc = new Doc(W, H);
  const bg = card(doc, { lights: [[160, 60, 320, c.cyan, 0.16], [800, H, 300, c.emerald, 0.1]] });
  doc.defs.push(
    `<linearGradient id="val" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${c.ink}"/><stop offset=".55" stop-color="${c.cyan}"/><stop offset="1" stop-color="${c.emerald}"/></linearGradient>`,
  );
  doc.css.push("@keyframes wave{0%,60%,100%{opacity:1}30%{opacity:.45}}.w{animation:wave 7s ease-in-out infinite}", PING);

  // Columns are weeks starting on Sunday, like GitHub's own graph.
  const weeks = [];
  for (const day of days) {
    const dow = utc(day.date).getUTCDay();
    if (!weeks.length || dow === 0) weeks.push([]);
    weeks.at(-1).push({ ...day, dow });
  }
  const cols = weeks.slice(-53);
  const inner = W - PAD * 2;
  const step = inner / 53;
  const cell = step - 3;
  const gridTop = 196;
  const x0 = PAD + (53 - cols.length) * step;

  let grid = "";
  let months = "";
  let lastMonth = -1;
  let lastLabelX = -100;
  cols.forEach((week, i) => {
    const x = x0 + i * step;
    const month = utc(week[0].date).getUTCMonth();
    if (month !== lastMonth && x - lastLabelX > 34 && i < cols.length - 1) {
      months += doc.text(MONTHS[month].toUpperCase(), { x, y: gridTop - 12, size: 10.5, font: "c", fill: c.muted, tracking: 0.12 });
      lastLabelX = x;
    }
    lastMonth = month;
    const cells = week
      .map((d) => `<rect x="${r1(x)}" y="${r1(gridTop + d.dow * step)}" width="${r1(cell)}" height="${r1(cell)}" rx="2.6" fill="${SCALE[d.level]}"/>`)
      .join("");
    grid += `<g class="w" style="animation-delay:${(i * 0.07).toFixed(2)}s">${cells}</g>`;
  });

  const today = cols.at(-1).at(-1);
  const tx = x0 + (cols.length - 1) * step + cell / 2;
  const tyy = gridTop + today.dow * step + cell / 2;
  const marker = `<circle class="ping" cx="${r1(tx)}" cy="${r1(tyy)}" r="${r1(cell / 2)}" fill="none" stroke="${c.emerald}" stroke-width="1.5"/>`;

  const total = days.reduce((n, d) => n + d.count, 0);
  const active = days.filter((d) => d.count).length;
  const best = days.reduce((a, b) => (b.count > a.count ? b : a));
  const { current, longest } = streaks(days);
  const totalText = total.toLocaleString("en-US");
  const totalW = measure(totalText, { size: 54, font: "d", tracking: -0.02 });

  const stats = [
    [String(current), "day streak, current"],
    [String(longest), "day streak, longest"],
    [String(active), "active days"],
    [String(best.count), "busiest day"],
  ];
  const colW = 118;
  const statsX = W - PAD - colW * stats.length + 14;
  const statSvg = stats
    .map(
      ([value, label], i) =>
        `<line x1="${statsX + i * colW - 14}" y1="92" x2="${statsX + i * colW - 14}" y2="144" stroke="${c.line}"/>` +
        doc.text(value, { x: statsX + i * colW, y: 118, size: 26, font: "d" }) +
        doc.text(label, { x: statsX + i * colW, y: 140, size: 11.5, fill: c.muted }),
    )
    .join("");

  const legendY = gridTop + 7 * step + 14;
  let legend = doc.text("LESS", { x: W - PAD - 5 * 16 - 44 - 34, y: legendY + 9.5, size: 10.5, font: "c", fill: c.muted, tracking: 0.12 });
  SCALE.forEach((fill, i) => {
    legend += `<rect x="${W - PAD - 44 - (5 - i) * 16}" y="${legendY}" width="11" height="11" rx="2.6" fill="${fill}"/>`;
  });
  legend += doc.text("MORE", { x: W - PAD - 36, y: legendY + 9.5, size: 10.5, font: "c", fill: c.muted, tracking: 0.12 });

  const body =
    bg.open +
    eyebrow(doc, "03", "Contributions") +
    doc.outline(totalText, { x: PAD - 2, y: 138, size: 54, fill: "url(#val)", tracking: -0.02 }) +
    doc.text("contributions", { x: PAD + totalW + 12, y: 121, size: 14, fill: c.ink }) +
    doc.text("in the last year", { x: PAD + totalW + 12, y: 139, size: 14, fill: c.muted }) +
    statSvg +
    months +
    grid +
    marker +
    legend +
    doc.text(`@${USER}`, { x: PAD, y: legendY + 9.5, size: 11.5, font: "c", fill: c.cyan }) +
    bg.close;
  return doc.render(body, {
    label: `${totalText} contributions in the last year. Current streak ${current} days, longest streak ${longest} days.`,
  });
}

// ─────────────────────────── articles ───────────────────────────

const cdata = (s) => (s ?? "").replace(/^<!\[CDATA\[|\]\]>$/g, "").trim();
const unescapeXml = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&");

async function fetchArticles() {
  const res = await fetch(FEED, { headers: UA });
  if (!res.ok) throw new Error(`feed: ${res.status}`);
  const xml = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
    const tag = (name) => unescapeXml(cdata(item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1]));
    return { title: tag("title"), link: tag("link"), category: tag("category"), summary: tag("description"), date: new Date(tag("pubDate")) };
  });
  // Only ever link to the portfolio itself, whatever the feed says.
  return items.filter((a) => a.title && a.link.startsWith(`${profile.site}/`)).slice(0, ARTICLE_COUNT);
}

function truncate(str, maxWidth, opts) {
  if (measure(str, opts) <= maxWidth) return str;
  let out = str;
  while (out.length > 1 && measure(`${out}…`, opts) > maxWidth) out = out.slice(0, out.lastIndexOf(" ") > 0 ? out.lastIndexOf(" ") : -1);
  return `${out.replace(/[\s,.;:—-]+$/, "")}…`;
}

function articleSvg(article, index) {
  const H = 128;
  const doc = new Doc(W, H);
  const bg = card(doc, { lights: [[index % 2 ? W : 0, 0, 280, index % 2 ? c.emerald : c.cyan, 0.13]], drift: false });
  const x = PAD + 46;
  const right = W - PAD - 34;
  const date = `${String(article.date.getUTCDate()).padStart(2, "0")} ${MONTHS[article.date.getUTCMonth()]} ${article.date.getUTCFullYear()}`.toUpperCase();
  const body =
    bg.open +
    doc.text(`0${index + 1}`, { x: PAD, y: 46, size: 13, font: "b", fill: c.cyan, tracking: 0.1 }) +
    doc.text(article.category.toUpperCase(), { x, y: 45, size: 11.5, font: "c", fill: c.emerald, tracking: 0.18 }) +
    doc.text(date, { x: right, y: 45, size: 11.5, font: "c", fill: c.muted, anchor: "end", tracking: 0.1 }) +
    doc.text(truncate(article.title, right - x, { size: 22, font: "d" }), { x, y: 76, size: 22, font: "d" }) +
    doc.text(truncate(article.summary, right - x, { size: 14 }), { x, y: 101, size: 14, fill: c.muted }) +
    arrow(W - PAD - 12, 58, 12, c.cyan, 1.8) +
    bg.close;
  return doc.render(body, { label: `${article.title} — ${article.category}` });
}

function updateReadme(articles) {
  const file = `${ROOT}README.md`;
  const readme = readFileSync(file, "utf8");
  const block = articles
    .map(
      (a, i) =>
        `<a href="${esc(a.link)}"><img src="./assets/article-${i + 1}.svg" width="100%" alt="${esc(`${a.title} — ${a.category}`)}" /></a>`,
    )
    .join("\n");
  const next = readme.replace(/(<!--ARTICLES:START-->)[\s\S]*?(<!--ARTICLES:END-->)/, `$1\n${block}\n$2`);
  if (next === readme && !readme.includes("<!--ARTICLES:START-->")) throw new Error("README has no ARTICLES markers");
  if (next !== readme) writeFileSync(file, next);
}

// ───────────────────────────── run ──────────────────────────────

// Each half is independent: if one source is down, keep the last good output for it.
let failed = false;
const step = async (name, fn) => {
  try {
    await fn();
    console.log(`ok    ${name}`);
  } catch (err) {
    failed = true;
    console.error(`FAIL  ${name}: ${err.message}`);
  }
};

await step("contributions", async () => {
  const token = process.env.GH_TOKEN;
  // A missing or expired token shouldn't blank the graph: fall back to the public page.
  const days = token
    ? await fromGraphQL(token).catch((err) => (console.warn(`GraphQL failed (${err.message}), using the public page`), fromProfilePage()))
    : await fromProfilePage();
  writeFileSync(`${ROOT}assets/contributions.svg`, contributionsSvg(days));
});

await step("articles", async () => {
  const articles = await fetchArticles();
  if (!articles.length) throw new Error("feed has no articles");
  articles.forEach((a, i) => writeFileSync(`${ROOT}assets/article-${i + 1}.svg`, articleSvg(a, i)));
  for (let i = articles.length + 1; i <= ARTICLE_COUNT; i++) {
    const stale = `${ROOT}assets/article-${i}.svg`;
    if (existsSync(stale)) rmSync(stale);
  }
  updateReadme(articles);
});

if (failed) process.exitCode = 1;
