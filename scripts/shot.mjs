// Rasterise section SVGs (first frame, no animation) for a quick visual check.
import sharp from "sharp";
const out = process.argv[2];
for (const n of process.argv.slice(3)) {
  await sharp(`../assets/${n}.svg`, { density: 144 }).png().toFile(`${out}/${n}.png`);
  console.log(n);
}
