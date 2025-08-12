import fg from 'fast-glob';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const INPUT_DIR = 'src/assets/raw';
const OUT_DIR = 'public/optimized';
const WIDTHS = [320, 480, 768, 1024, 1280, 1600];
const exts = ['.jpg', '.jpeg', '.png'];

const files = await fg(WIDTHS.length ? `${INPUT_DIR}/**/*.{jpg,jpeg,png}` : `${INPUT_DIR}/**/*`);
await mkdir(OUT_DIR, { recursive: true });

const manifest = {};

for (const file of files) {
  const basename = path.basename(file).replace(/\.(jpg|jpeg|png)$/i, '');
  const nameKey = basename; // manifest kaliti
  const img = sharp(file);
  const meta = await img.metadata();
  const ratio = meta.width && meta.height ? meta.height / meta.width : 1;

  const avifSet = [];
  const webpSet = [];
  let fallback = '';

  for (const w of WIDTHS) {
    const h = Math.round(w * ratio);

    // AVIF
    const avifOut = path.join(OUT_DIR, `${basename}-${w}.avif`);
    await sharp(file).resize({ width: w }).avif({ quality: 60 }).toFile(avifOut);
    avifSet.push(`/optimized/${basename}-${w}.avif ${w}w`);

    // WEBP
    const webpOut = path.join(OUT_DIR, `${basename}-${w}.webp`);
    await sharp(file).resize({ width: w }).webp({ quality: 75 }).toFile(webpOut);
    webpSet.push(`/optimized/${basename}-${w}.webp ${w}w`);

    // Fallback (o'rta o'lcham)
    if (w === 768) {
      const jpgOut = path.join(OUT_DIR, `${basename}-${w}.jpg`);
      await sharp(file).resize({ width: w }).jpeg({ quality: 80 }).toFile(jpgOut);
      fallback = `/optimized/${basename}-${w}.jpg`;
    }
  }

  manifest[nameKey] = {
    avif: avifSet,
    webp: webpSet,
    fallback,
    width: WIDTHS.at(-1),
    height: Math.round(WIDTHS.at(-1) * ratio)
  };
}

await writeFile('src/assets/images.manifest.json', JSON.stringify(manifest, null, 2));
console.log('✅ Images optimized & manifest generated.');
