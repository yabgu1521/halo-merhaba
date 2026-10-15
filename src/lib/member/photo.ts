import sharp from "sharp";
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export async function normalizePhoto(bytes: Buffer) {
  if (bytes.length > MAX_PHOTO_BYTES || bytes.length < 12)
    throw new Error("Invalid photo");
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const webp =
    bytes.subarray(0, 4).toString() === "RIFF" &&
    bytes.subarray(8, 12).toString() === "WEBP";
  if (!jpeg && !png && !webp) throw new Error("Invalid photo");
  const image = sharp(bytes, { limitInputPixels: 16000000, failOn: "warning" });
  const meta = await image.metadata();
  if (
    !["jpeg", "png", "webp"].includes(meta.format || "") ||
    !meta.width ||
    !meta.height ||
    meta.width > 6000 ||
    meta.height > 6000 ||
    (meta.pages || 1) > 1
  )
    throw new Error("Invalid photo");
  return image
    .rotate()
    .resize({
      width: 1200,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();
}
