import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const name of ["feed", "forming"]) {
  await sharp(path.join(root, `assets/prototype-${name}-studio-source.png`))
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(root, `public/assets/prototype-${name}-studio.webp`));
}
