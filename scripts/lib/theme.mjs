// Design tokens lifted from the portfolio (frontend/app/globals.css).
export const c = {
  bg: "#05080d",
  bg2: "#08121b",
  surface: "#0b1420",
  cyan: "#19c3e6",
  teal: "#0e7c8c",
  emerald: "#22e3a8",
  ember: "#ff3b3b",
  ink: "#e6f1f5",
  muted: "#8aa0ad",
  line: "rgba(120,200,230,0.14)",
  lineStrong: "rgba(120,200,230,0.28)",
};

// Every section is drawn on the same canvas width so the README reads as one page.
export const W = 880;
export const PAD = 44;
export const RADIUS = 22;

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const r1 = (n) => Math.round(n * 10) / 10;
