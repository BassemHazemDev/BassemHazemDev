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

export const marqueeA = ["TypeScript", "React", "Next.js", "Node.js", "Nest.js", "Express", "MongoDB", "Tailwind CSS", "React Native", "Redis"];
export const marqueeB = ["RAG Pipelines", "FastAPI", "Qdrant", "Gemini", "Docker", "Cloudflare WAF", "System Design", "Agile & Scrum", "Code Review", "PRDs"];
