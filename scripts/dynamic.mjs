// Refreshes the parts of the README that change over time: the contribution
// heatmap, languages, recent repositories and latest articles. Run by .github/workflows/profile.yml.
//   GH_TOKEN (optional) — with it, private contributions are counted too.
import { readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { c, W, PAD, r1, esc } from "./lib/theme.mjs";
import { Doc, measure } from "./lib/text.mjs";
import { card, eyebrow, arrow } from "./lib/frame.mjs";
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

// The game loop, as fractions of one cycle: Pac-Man crosses the whole year,
// everything fades, then the board respawns and it starts again.
const GAME = { cycle: 52, run: 0.88, exit: 0.93, respawn: 0.97, scared: 3.2 };
const GHOSTS = [
  { colour: c.ember, lag: 1.6 },
  { colour: "#7aa7ff", lag: 2.5 },
  { colour: "#fe842e", lag: 3.4 },
];
const SCARED = "#3b5bdb";
const frac = (n) => +n.toFixed(4);

/** Pac-Man eating his way through the year, chased by three ghosts. */
function pacman({ cols, x0, step, cell, gridTop, pelletTimes }) {
  const mid = cell / 2;
  const top = gridTop + mid;
  const bottom = gridTop + 6 * step + mid;
  let route = "";
  for (let i = 0; i < cols; i++) {
    const x = r1(x0 + i * step + mid);
    const [from, to] = i % 2 ? [bottom, top] : [top, bottom];
    route += `${i ? "L" : "M"}${x} ${r1(from)}L${x} ${r1(to)}`;
  }

  const move = (lag = 0) => {
    const start = frac(lag / GAME.cycle);
    const points = lag ? `0;0;1;1` : `0;1;1`;
    const times = lag ? `0;${start};${frac(GAME.run + start)};1` : `0;${GAME.run};1`;
    return `<animateMotion dur="${GAME.cycle}s" repeatCount="indefinite" calcMode="linear" keyPoints="${points}" keyTimes="${times}" path="${route}"`;
  };
  const visible = (from) =>
    `<animate attributeName="opacity" dur="${GAME.cycle}s" repeatCount="indefinite" calcMode="discrete" values="${from ? "0;1;0" : "1;0"}" keyTimes="${from ? `0;${frac(from)};${GAME.exit}` : `0;${GAME.exit}`}"/>`;

  // Ghosts turn blue for a few seconds after each power pellet (the busiest days).
  const windows = [];
  for (const t of [...pelletTimes].sort((a, b) => a - b)) {
    const end = Math.min(t + GAME.scared / GAME.cycle, GAME.exit);
    if (windows.length && t <= windows.at(-1)[1]) windows.at(-1)[1] = Math.max(windows.at(-1)[1], end);
    else if (t > 0 && t < end) windows.push([t, end]);
  }
  const fright = (colour) =>
    windows.length
      ? `<animate attributeName="fill" dur="${GAME.cycle}s" repeatCount="indefinite" calcMode="discrete" values="${colour};${windows.map(() => `${SCARED};${colour}`).join(";")}" keyTimes="0;${windows.map(([a, b]) => `${frac(a)};${frac(b)}`).join(";")}"/>`
      : "";

  const r = cell * 0.62;
  const jaw = (deg) => {
    const a = (deg * Math.PI) / 180;
    const x = +(r * Math.cos(a)).toFixed(2);
    const y = +(r * Math.sin(a)).toFixed(2);
    return `M0 0L${x} ${-y}A${r1(r)} ${r1(r)} 0 1 0 ${x} ${y}Z`;
  };
  const g = cell * 0.56;
  const ghostBody = `M${-g} ${g}V${-g * 0.2}A${g} ${g} 0 0 1 ${g} ${-g * 0.2}V${g}L${g * 0.66} ${g * 0.68}L${g * 0.33} ${g}L0 ${g * 0.68}L${-g * 0.33} ${g}L${-g * 0.66} ${g * 0.68}Z`
    .replace(/-?\d+\.\d+/g, (n) => r1(+n));
  const eye = (x) =>
    `<circle cx="${r1(x)}" cy="${r1(-g * 0.25)}" r="${r1(g * 0.27)}" fill="#fff"/><circle cx="${r1(x + g * 0.1)}" cy="${r1(-g * 0.25)}" r="${r1(g * 0.13)}" fill="${c.bg}"/>`;

  const ghosts = GHOSTS.map(
    ({ colour, lag }) =>
      `<g opacity="0">${visible(lag / GAME.cycle)}${move(lag)}/><path d="${ghostBody}" fill="${colour}">${fright(colour)}</path>${eye(-g * 0.4)}${eye(g * 0.4)}</g>`,
  ).join("");

  const hero =
    `<g>${visible()}${move()} rotate="auto"/>` +
    `<path fill="url(#pac)" d="${jaw(35)}"><animate attributeName="d" dur=".32s" repeatCount="indefinite" values="${jaw(35)};${jaw(3)};${jaw(35)}"/></path></g>`;

  return ghosts + hero;
}

function contributionsSvg(days) {
  const H = 356;
  const doc = new Doc(W, H);
  const bg = card(doc, { lights: [[160, 60, 320, c.cyan, 0.16], [800, H, 300, c.emerald, 0.1]] });
  doc.defs.push(
    `<linearGradient id="val" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${c.ink}"/><stop offset=".55" stop-color="${c.cyan}"/><stop offset="1" stop-color="${c.emerald}"/></linearGradient>`,
  );
  doc.defs.push(
    `<linearGradient id="pac" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.cyan}"/><stop offset="1" stop-color="${c.emerald}"/></linearGradient>`,
  );
  doc.css.push("@keyframes pellet{50%{opacity:.55}}.pp{animation:pellet 1.2s ease-in-out infinite}");

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

  const routeSteps = cols.length * 7 - 1;
  const pelletTimes = [];
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
    for (const d of week) {
      const rect = `x="${r1(x)}" y="${r1(gridTop + d.dow * step)}" width="${r1(cell)}" height="${r1(cell)}" rx="2.6"`;
      grid += `<rect ${rect} fill="${SCALE[0]}"/>`;
      if (!d.level) continue;
      // Pac-Man snakes down even columns and up odd ones; each column is 7 steps of the route.
      const at = (i * 7 + (i % 2 ? 6 - d.dow : d.dow)) / routeSteps;
      const eaten = `<animate attributeName="opacity" dur="${GAME.cycle}s" repeatCount="indefinite" calcMode="discrete" values="1;0;1" keyTimes="0;${frac(at * GAME.run)};${GAME.respawn}"/>`;
      const dot = `<rect ${rect} fill="${SCALE[d.level]}">${eaten}</rect>`;
      // The pulse sits on a wrapper: a CSS animation on the rect itself would override the SMIL one.
      grid += d.level === 4 ? `<g class="pp">${dot}</g>` : dot;
      if (d.level === 4) pelletTimes.push(at * GAME.run);
    }
  });

  const marker = pacman({ cols: cols.length, x0, step, cell, gridTop, pelletTimes });

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
    eyebrow(doc, "02", "Contributions") +
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

// ───────────────────── languages and repositories ─────────────────────

const HALF = 432; // these two cards sit side by side
const HALF_H = 248;
const HP = 26;
const PALETTE = [c.cyan, c.emerald, "#7aa7ff", c.teal, "#fe842e"];
const REPO_ROWS = 4;

async function api(path) {
  const token = process.env.GH_TOKEN;
  const res = await fetch(path.startsWith("http") ? path : `https://api.github.com${path}`, {
    headers: { ...UA, accept: "application/vnd.github+json", ...(token && { authorization: `Bearer ${token}` }) },
  });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

async function fetchRepos() {
  const all = await api(`/users/${USER}/repos?per_page=100&sort=pushed`);
  const own = all.filter((r) => !r.fork && !r.archived && r.name !== USER);
  const bytes = new Map();
  for (const langs of await Promise.all(own.map((r) => api(r.languages_url)))) {
    for (const [name, n] of Object.entries(langs)) bytes.set(name, (bytes.get(name) ?? 0) + n);
  }
  return { repos: own, languages: [...bytes].sort((a, b) => b[1] - a[1]) };
}

function languagesSvg(languages, repoCount) {
  const doc = new Doc(HALF, HALF_H);
  const bg = card(doc, { lights: [[0, 0, 260, c.cyan, 0.15]], drift: false });
  const total = languages.reduce((n, [, b]) => n + b, 0);
  const top = languages.slice(0, PALETTE.length).map(([name, b], i) => ({ name, share: b / total, colour: PALETTE[i] }));
  const rest = 1 - top.reduce((n, l) => n + l.share, 0);
  if (rest > 0.001) top.push({ name: "Other", share: rest, colour: c.muted });

  const barW = HALF - HP * 2;
  const barY = 84;
  doc.defs.push(`<clipPath id="bar"><rect x="${HP}" y="${barY}" width="${barW}" height="10" rx="5"/></clipPath>`);
  let x = HP;
  const segments = top
    .map((l) => {
      const w = l.share * barW;
      const rect = `<rect x="${r1(x)}" y="${barY}" width="${r1(Math.max(w - 2, 1))}" height="10" fill="${l.colour}"/>`;
      x += w;
      return rect;
    })
    .join("");

  const colW = barW / 2;
  const legend = top
    .map((l, i) => {
      const lx = HP + (i % 2) * colW;
      const ly = 132 + Math.floor(i / 2) * 30;
      const pct = `${(l.share * 100).toFixed(l.share < 0.1 ? 1 : 0)}%`;
      return (
        `<circle cx="${lx + 5}" cy="${ly - 5}" r="5" fill="${l.colour}"/>` +
        doc.text(truncate(l.name, colW - 78, { size: 14.5, font: "m" }), { x: lx + 18, y: ly, size: 14.5, font: "m" }) +
        doc.text(pct, { x: lx + colW - 18, y: ly, size: 12, font: "c", fill: c.muted, anchor: "end" })
      );
    })
    .join("");

  const body =
    bg.open +
    eyebrow(doc, "03", "Languages", { y: 46, pad: HP }) +
    `<g clip-path="url(#bar)">${segments}</g>` +
    legend +
    doc.text(`By code size across ${repoCount} public repositories`, { x: HP, y: HALF_H - 22, size: 12, fill: c.muted }) +
    bg.close;
  return doc.render(body, {
    label: `Languages: ${top.map((l) => `${l.name} ${(l.share * 100).toFixed(0)}%`).join(", ")}`,
  });
}

function reposSvg(repos) {
  const doc = new Doc(HALF, HALF_H);
  const bg = card(doc, { lights: [[HALF, 0, 260, c.emerald, 0.13]], drift: false });
  const rows = repos
    .slice(0, REPO_ROWS)
    .map((repo, i) => {
      const y = 88 + i * 40;
      const pushed = new Date(repo.pushed_at);
      const date = `${String(pushed.getUTCDate()).padStart(2, "0")} ${MONTHS[pushed.getUTCMonth()]} ${pushed.getUTCFullYear()}`.toUpperCase();
      return (
        (i ? `<line x1="${HP}" y1="${y - 20}" x2="${HALF - HP}" y2="${y - 20}" stroke="${c.line}"/>` : "") +
        doc.text(truncate(repo.name, 230, { size: 15, font: "m" }), { x: HP, y, size: 15, font: "m" }) +
        doc.text(date, { x: HALF - HP, y: y - 1, size: 11, font: "c", fill: c.muted, anchor: "end", tracking: 0.08 }) +
        doc.text(repo.language ?? "—", { x: HP, y: y + 15, size: 11, font: "c", fill: c.cyan })
      );
    })
    .join("");
  const body = bg.open + eyebrow(doc, "04", "Recently pushed", { y: 46, pad: HP }) + rows + bg.close;
  return doc.render(body, { label: `Recently pushed repositories: ${repos.slice(0, REPO_ROWS).map((r) => r.name).join(", ")}` });
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

await step("languages and repositories", async () => {
  const { repos, languages } = await fetchRepos();
  if (!repos.length || !languages.length) throw new Error("no public repositories");
  writeFileSync(`${ROOT}assets/languages.svg`, languagesSvg(languages, repos.length));
  writeFileSync(`${ROOT}assets/repos.svg`, reposSvg(repos));
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
