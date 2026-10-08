import sharp from "sharp";

const dataUri = (buf, mime) => `data:${mime};base64,${buf.toString("base64")}`;

/** Resize one image and return it as an inline WebP data URI. */
export async function inlineImage(file, { width, height, fit = "cover", position = "top", quality = 78 } = {}) {
  const img = sharp(file).resize({ width, height, fit, position });
  const buf = await img.webp({ quality }).toBuffer();
  const meta = await sharp(buf).metadata();
  return { uri: dataUri(buf, "image/webp"), width: meta.width, height: meta.height, bytes: buf.length };
}

/**
 * Lay frames side by side into one horizontal strip. The SVG slides the strip
 * with a steps() animation, which plays it back like film.
 */
export async function spriteSheet(files, { width, quality = 62 } = {}) {
  const frames = await Promise.all(files.map((f) => sharp(f).resize({ width }).png().toBuffer()));
  const { height } = await sharp(frames[0]).metadata();
  const sheet = await sharp({
    create: { width: width * frames.length, height, channels: 3, background: "#05080d" },
  })
    .composite(frames.map((input, i) => ({ input, left: i * width, top: 0 })))
    .webp({ quality, effort: 6 })
    .toBuffer();
  return { uri: dataUri(sheet, "image/webp"), frameWidth: width, frameHeight: height, count: frames.length, bytes: sheet.length };
}
