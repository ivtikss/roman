import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(root, "public/assets");
const heroSource = path.join(root, "assets/hero-line-source.png");

await sharp(heroSource)
  .webp({ quality: 91, effort: 6 })
  .toFile(path.join(assets, "hero-line.webp"));

const edgeColumn = await sharp(heroSource)
  .extract({ left: 0, top: 0, width: 1, height: 1254 })
  .png()
  .toBuffer();
const edge = await sharp(edgeColumn)
  .resize(4746, 1254, { fit: "fill", kernel: "nearest" })
  .png()
  .toBuffer();

await sharp({
  create: { width: 6000, height: 1254, channels: 3, background: "#d4d9dd" },
})
  .composite([
    { input: edge, left: 0, top: 0 },
    { input: heroSource, left: 4746, top: 0 },
  ])
  .webp({ quality: 88, effort: 6 })
  .toFile(path.join(assets, "hero-line-wide.webp"));

const sideWidth = 2400;
const leftEdge = await sharp(heroSource)
  .extract({ left: 0, top: 0, width: 1, height: 1254 })
  .resize(sideWidth, 1254, { kernel: "nearest" })
  .toBuffer();
const rightEdge = await sharp(heroSource)
  .extract({ left: 1253, top: 0, width: 1, height: 1254 })
  .resize(sideWidth, 1254, { kernel: "nearest" })
  .toBuffer();
await sharp({
  create: { width: 1254 + sideWidth * 2, height: 1254, channels: 3, background: "#d4d9dd" },
})
  .composite([
    { input: leftEdge, left: 0, top: 0 },
    { input: heroSource, left: sideWidth, top: 0 },
    { input: rightEdge, left: sideWidth + 1254, top: 0 },
  ])
  .webp({ quality: 88, effort: 6 })
  .toFile(path.join(assets, "hero-line-centered.webp"));

const topRow = await sharp(heroSource)
  .extract({ left: 0, top: 0, width: 1254, height: 1 })
  .png()
  .toBuffer();
await sharp(topRow)
  .resize(1254, 700, { fit: "fill", kernel: "nearest" })
  .webp({ quality: 88, effort: 6 })
  .toFile(path.join(assets, "hero-line-top.webp"));

const photo = await sharp(heroSource)
  .resize(630, 630, { fit: "contain" })
  .jpeg({ quality: 90, mozjpeg: true })
  .toBuffer();

const typography = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="570" height="630">
    <rect width="570" height="630" fill="#18252b"/>
    <rect x="48" y="80" width="48" height="4" fill="#d68f64"/>
    <text x="48" y="205" fill="#f6f7f5" font-family="Arial, sans-serif" font-size="55" font-weight="700">Карамельная</text>
    <text x="48" y="275" fill="#f6f7f5" font-family="Arial, sans-serif" font-size="72" font-weight="700">линия</text>
    <text x="48" y="495" fill="#d4dedd" font-family="Arial, sans-serif" font-size="21">Леденцовая карамель</text>
    <text x="48" y="527" fill="#d4dedd" font-family="Arial, sans-serif" font-size="21">с мягкой начинкой</text>
  </svg>
`);

await sharp({
  create: { width: 1200, height: 630, channels: 3, background: "#18252b" },
})
  .composite([
    { input: photo, left: 570, top: 0 },
    { input: typography, left: 0, top: 0 },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(path.join(assets, "og-caramel.jpg"));

const icon = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <rect width="128" height="128" rx="18" fill="#18252b"/>
    <circle cx="44" cy="42" r="16" fill="#d1dbd9"/>
    <circle cx="84" cy="42" r="16" fill="#d1dbd9"/>
    <path d="M44 58v19m40-19v19M23 87h82" fill="none" stroke="#d68f64" stroke-width="9" stroke-linecap="round"/>
  </svg>
`);

await sharp(icon).resize(64, 64).png().toFile(path.join(assets, "site-icon.png"));
