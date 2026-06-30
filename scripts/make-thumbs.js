/**
 * Genera thumbnail leggere per TUTTE le immagini di gallery/hero dei progetti.
 * Gli originali NON vengono toccati: le thumb finiscono in <cartella>/thumbs/.
 * Le thumb già esistenti (es. movie-posters a 700px) vengono saltate.
 *
 * Uso: node scripts/make-thumbs.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const WIDTH = 1600;    // le group/hero si vedono grandi; 1600 copre i retina
const QUALITY = 76;

function toWebP(s) { return s ? s.replace(/\.(png|jpg|jpeg)$/i, ".webp") : s; }

const code = fs.readFileSync(path.join(ROOT, "js", "project-data.js"), "utf8");
const pd = eval("(" + code.replace(/^[\s\S]*?projectsData\s*=\s*/, "").replace(/;\s*$/, "") + ")");

function collect(d) {
  const out = [];
  (d.images || []).forEach(i => { if (i && i.src) out.push(i.src); });
  (d.gallery || []).forEach(g => {
    if (g.image || g.src) out.push(g.image || g.src);
    (g.images || []).forEach(i => { if (i && (i.image || i.src)) out.push(i.image || i.src); });
  });
  return out;
}

const all = new Set();
for (const slug in pd) collect(pd[slug]).forEach(s => all.add(s));

let done = 0, skipped = 0, savedBytes = 0, missing = 0;

(async () => {
  for (const raw of all) {
    if (/\.(mp4|webm|mov)$/i.test(raw)) continue;
    const full = path.join(ROOT, toWebP(raw));
    if (!fs.existsSync(full)) { missing++; continue; }

    const dir = path.dirname(full);
    const outDir = path.join(dir, "thumbs");
    const out = path.join(outDir, path.basename(full));
    if (fs.existsSync(out)) { skipped++; continue; }   // preserva thumb già fatte

    fs.mkdirSync(outDir, { recursive: true });
    try {
      const before = fs.statSync(full).size;
      await sharp(full)
        .resize({ width: WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);
      savedBytes += before - fs.statSync(out).size;
      done++;
      process.stdout.write(`\r${done} create  (${skipped} saltate)`.padEnd(50));
    } catch (e) {
      console.error(`\nERRORE su ${full}:`, e.message);
    }
  }
  console.log(`\nFatto: ${done} thumbnail nuove, ${skipped} già esistenti, ${missing} sorgenti mancanti.`);
  console.log(`Risparmio: ~${(savedBytes / 1048576).toFixed(1)} MB`);
})();
