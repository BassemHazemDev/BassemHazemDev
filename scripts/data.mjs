// Snapshot of the portfolio's content (F:\Portfolio\frontend\data/*.ts).
// The portfolio is the source of truth — when it changes, update this file and rebuild.
import { fileURLToPath } from "node:url";

// Where the portfolio checkout lives; only needed when rebuilding image assets.
export const PORTFOLIO = process.env.PORTFOLIO_DIR ?? "F:/Portfolio";
export const pub = (p) => `${PORTFOLIO}/frontend/public/${p}`;
export const ROOT = fileURLToPath(new URL("..", import.meta.url));

export const profile = {
  name: "Bassem Hazem Mahmoud",
  shortName: "Bassem Hazem",
  roles: ["Full Stack Developer", "Technical Project Manager"],
  location: "Alexandria, Egypt",
  email: "bassemhazemmahmouddev@gmail.com",
  whatsapp: "https://wa.me/201205802555",
  github: "https://github.com/BassemHazemDev",
  linkedin: "https://www.linkedin.com/in/bassem-hazem-7902b32a2/",
  site: "https://www.bassemhazem.com",
  tagline: "I build scalable SaaS & AI products — and lead the teams that ship them.",
};

export const signature = [
  {
    glyph: "{ }",
    title: "Scope",
    body: "Every project starts with structure: requirements, architecture and clear boundaries before a line is written.",
    meta: "PRDs · System design",
    accent: "cyan",
  },
  {
    glyph: "#",
    title: "Intent",
    body: "Every feature is tagged, tracked and prioritised, so the team always knows what matters next.",
    meta: "Orbit PMO · Sprint planning",
    accent: "ember",
  },
  {
    glyph: ";",
    title: "Delivery",
    body: "Every statement ends. Work isn't done until it's shipped and running in production.",
    meta: "4 live products",
    accent: "ember",
  },
];
export const signatureClosing = { lead: "Every project scoped.", tail: "Every line shipped" };

export const achievements = [
  { value: "15+", label: "Engineers led", detail: "Cross-functional team at RockAI Dev" },
  { value: "#1", label: "Ranked student", detail: "Special Computer Science Dept." },
  { value: "3.88", label: "GPA / 4.00", detail: "B.Sc. CS, Alexandria University" },
  { value: "4", label: "Live products", detail: "Orion, PayFlow, Cortex & portfolio" },
  { value: "28", label: "Backend modules", detail: "Architected for the Orion platform" },
  { value: "8", label: "Certifications", detail: "DEPI, Google, freeCodeCamp, QWorld" },
];

export const experience = [
  {
    title: "Technical Project Manager",
    company: "RockAI Dev",
    period: "Jan 2026 — Present",
    current: true,
    points: [
      "Lead a 15+ member engineering team across SaaS, AI and enterprise platforms.",
      "Own architecture alignment, code reviews and scoping with stakeholders.",
      "Designed and shipped “Orbit”, a proprietary PMO tracking system.",
    ],
    tags: ["Leadership", "Agile", "Architecture", "PRDs"],
  },
  {
    title: "Full Stack Web Developer",
    company: "RockAI Dev",
    period: "Nov 2025 — Jan 2026",
    points: [
      "Architected SaaS products with Next.js, Nest.js, TypeScript and MongoDB.",
      "Built REST APIs, database layers and responsive frontends — then promoted.",
    ],
    tags: ["Next.js", "Nest.js", "TypeScript", "MongoDB"],
  },
  {
    title: "Software Developer Intern",
    company: "Digital Egypt Pioneers Initiative",
    period: "Jun 2025 — Dec 2025",
    points: [
      "7-month MERN track: REST APIs, auth, database integration, responsive UI.",
      "Led the team that built PayFlow, a CRM & billing platform.",
    ],
    tags: ["MERN", "Team Lead", "Agile"],
  },
];

export const projects = [
  {
    slug: "orion",
    name: "Orion",
    kind: "AI-Powered E-Learning Platform",
    period: "2025 — 2026",
    url: "https://orion.apextec.dev",
    image: "projects/orion.webp",
    accent: "#19c3e6",
    summary: "A bilingual learning platform with a RAG-powered study assistant, on web and mobile.",
    stack: ["Next.js", "Node.js", "React Native", "FastAPI", "Qdrant", "Gemini"],
  },
  {
    slug: "payflow",
    name: "PayFlow",
    kind: "CRM & Billing Platform",
    period: "2025",
    url: "https://pay-flow-prod.vercel.app/",
    repo: "https://github.com/BassemHazemDev/PayFlowProd",
    accent: "#22e3a8",
    summary: "CRM and invoicing for small businesses with Stripe payments and AI insights.",
    stack: ["React", "Vite", "Tailwind", "Express", "MongoDB", "Stripe"],
  },
  {
    slug: "cortex",
    name: "Cortex",
    kind: "Task Manager",
    period: "2025",
    url: "https://cortex-sooty.vercel.app/",
    repo: "https://github.com/BassemHazemDev/Cortex-Task-Manager",
    image: "projects/cortex.webp",
    accent: "#7aa7ff",
    summary: "A workflow-focused task manager with smart scheduling and a drag-and-drop calendar.",
    stack: ["React", "Vite", "Drag & Drop", "Notifications"],
  },
  {
    slug: "portfolio",
    name: "Portfolio",
    kind: "bassemhazem.com",
    period: "2026",
    url: "https://www.bassemhazem.com",
    image: "og.jpg",
    accent: "#fe842e",
    summary: "This brand, live: a scroll-driven cinematic hero, articles CMS and admin with 2FA.",
    stack: ["Next.js 15", "NestJS", "MongoDB", "GSAP", "Tailwind"],
  },
];

export const skillGroups = [
  { name: "Frontend", items: ["HTML5", "CSS3", "JavaScript (ES6+)", "TypeScript", "React.js", "Next.js", "React Native", "Tailwind CSS", "Bootstrap", "Vite"] },
  { name: "Backend", items: ["Node.js", "Express.js", "Nest.js", "RESTful APIs", "JWT Auth", "API Design", "Backend Architecture"] },
  { name: "Databases", items: ["MongoDB", "MongoDB Atlas", "MySQL", "Database Design", "Database Optimization"] },
  { name: "AI & Integrations", items: ["FastAPI", "Qdrant", "Gemini", "RAG Pipelines", "AI Assistants", "AI Automation"] },
  { name: "Tools & Infra", items: ["Git", "GitHub", "Docker", "Vercel", "Redis", "Cloudflare WAF", "Jira", "Notion"] },
  { name: "Programming & CS", items: ["JavaScript", "TypeScript", "Java", "Python", "Data Structures", "Algorithms", "OOP"] },
];
export const marqueeA = ["TypeScript", "React", "Next.js", "Node.js", "Nest.js", "Express", "MongoDB", "Tailwind CSS", "React Native", "Redis"];
export const marqueeB = ["RAG Pipelines", "FastAPI", "Qdrant", "Gemini", "Docker", "Cloudflare WAF", "System Design", "Agile & Scrum", "Code Review", "PRDs"];

export const testimonials = [
  {
    quote:
      "He actually reviews PRs, cares about code quality, and always makes room for refactoring and system design ideas in the sprint.",
    author: "Mahmoud Abdelbaky",
    role: "Backend Engineer · reported to Bassem at RockAI Dev",
    href: "https://www.linkedin.com/in/mahmoud-abdelbaky-2ab528243/",
  },
  {
    quote:
      "Bassem bridges the gap between technical execution and business vision — managing tight timelines with urgency, never sacrificing code quality or stability.",
    author: "Zeyad I. Hamdalla",
    role: "Full-Stack Engineer · reported to Bassem at RockAI Dev",
    href: "https://www.linkedin.com/in/boltawy/",
  },
];

export const degree = {
  title: "B.Sc. in Computer Science",
  school: "Alexandria University — Faculty of Science",
  period: "Oct 2022 — Jun 2026",
  gpa: "3.88 / 4.00",
  rank: "Ranked #1 in the Special Computer Science Department",
};

export const certifications = [
  { title: "Software Development — MERN", issuer: "Digital Egypt Pioneers Initiative", note: "7-month track with Agile delivery" },
  { title: "Responsive Web Design", issuer: "freeCodeCamp", url: "https://www.freecodecamp.org/certification/bassemhazem/responsive-web-design" },
  { title: "JavaScript Algorithms & Data Structures", issuer: "freeCodeCamp", url: "https://www.freecodecamp.org/certification/bassemhazem/javascript-algorithms-and-data-structures-v8" },
  { title: "Front End Development Libraries", issuer: "freeCodeCamp" },
  { title: "Quantum Computing & Programming", issuer: "QWorld · AIU · AleQCG", note: "100% across quizzes, labs & final project" },
  { title: "Foundations of Project Management", issuer: "Google" },
  { title: "Professional Diploma in Project Management", issuer: "MTF Institute" },
  { title: "Train the Trainer", issuer: "Udemy", url: "https://www.udemy.com/certificate/UC-03f248c1-5b51-424f-bf0c-921b9c0146ee/" },
];
