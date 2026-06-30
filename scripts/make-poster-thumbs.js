/**
 * Genera thumbnail leggere per il grid di "movie-posters".
 * Gli originali NON vengono toccati: le thumb finiscono in poster/thumbs/.
 *
 * Uso: node scripts/make-poster-thumbs.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SRC_DIR = path.join(__dirname, "..", "assets", "optimized-files", "optimized", "poster");
const OUT_DIR = path.join(SRC_DIR, "thumbs");
const WIDTH = 700;     // larghezza display ~400px, 700 copre i retina 2x
const QUALITY = 74;

fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs.readdirSync(SRC_DIR).filter(f => /\.webp$/i.test(f));
let done = 0, savedBytes = 0;

(async () => {
  for (const file of files) {
    const src = path.join(SRC_DIR, file);
    const out = path.join(OUT_DIR, file);
    try {
      const before = fs.statSync(src).size;
      await sharp(src)
        .resize({ width: WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);
      const after = fs.statSync(out).size;
      savedBytes += before - after;
      done++;
      process.stdout.write(`\r${done}/${files.length}  ${file}`.padEnd(60));
    } catch (e) {
      console.error(`\nERRORE su ${file}:`, e.message);
    }
  }
  console.log(`\nFatto: ${done} thumbnail in ${OUT_DIR}`);
  console.log(`Risparmio totale: ~${(savedBytes / 1048576).toFixed(1)} MB`);
})();
