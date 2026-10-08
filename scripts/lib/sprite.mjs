import sharp from "sharp";

/** Resize one image and return it as an inline WebP data URI. */
export async function inlineImage(file, { width, height, fit = "cover", position = "top", quality = 78 } = {}) {
  const buf = await sharp(file).resize({ width, height, fit, position }).webp({ quality }).toBuffer();
  const meta = await sharp(buf).metadata();
  return { uri: `data:image/webp;base64,${buf.toString("base64")}`, width: meta.width, height: meta.height, bytes: buf.length };
}
