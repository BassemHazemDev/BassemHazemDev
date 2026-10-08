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

export const signatureClosing = { lead: "Every project scoped.", tail: "Every line shipped" };

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
