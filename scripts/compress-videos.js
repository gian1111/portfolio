/**
 * Ricomprime i video dei progetti (bitrate assurdi -> ragionevoli) e genera
 * un poster frame. Originali INTATTI: output in <cartella>/compressed/.
 *   - scala a max 1280px lato lungo (solo downscale)
 *   - CRF 28, preset slow, max 30fps
 *   - -movflags +faststart  => parte quasi subito (streaming)
 *   - audio rimosso (i video sono muted)
 *   - poster .jpg dal primo frame
 *
 * Uso: node scripts/compress-videos.js
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ffmpeg = require("ffmpeg-static");

const ROOT = path.join(__dirname, "..");
const code = fs.readFileSync(path.join(ROOT, "js", "project-data.js"), "utf8");
const pd = eval("(" + code.replace(/^[\s\S]*?projectsData\s*=\s*/, "").replace(/;\s*$/, "") + ")");

const vids = new Set();
for (const slug in pd) {
  (pd[slug].gallery || []).forEach(g => {
    const push = s => { if (s && /\.(mp4|webm|mov)$/i.test(s)) vids.add(s); };
    push(g.image || g.src);
    (g.images || []).forEach(i => push(i && (i.image || i.src)));
  });
}

let savedBytes = 0, done = 0;
for (const rel of vids) {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) { console.log("MANCA:", rel); continue; }

  const dir = path.dirname(src);
  const outDir = path.join(dir, "compressed");
  fs.mkdirSync(outDir, { recursive: true });
  const base = path.basename(src);
  const outMp4 = path.join(outDir, base);
  const outPoster = path.join(outDir, base.replace(/\.(mp4|webm|mov)$/i, ".jpg"));

  try {
    execFileSync(ffmpeg, [
      "-y", "-i", src,
      "-vf", "scale='min(1280,iw)':-2,fps=30",
      "-c:v", "libx264", "-crf", "28", "-preset", "slow",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart",
      "-an", outMp4
    ], { stdio: "ignore" });

    execFileSync(ffmpeg, [
      "-y", "-i", src, "-vf", "scale='min(1280,iw)':-2",
      "-frames:v", "1", "-q:v", "4", outPoster
    ], { stdio: "ignore" });

    const before = fs.statSync(src).size, after = fs.statSync(outMp4).size;
    savedBytes += before - after;
    done++;
    console.log(`${(before/1048576).toFixed(1)}MB -> ${(after/1048576).toFixed(1)}MB  ${base}`);
  } catch (e) {
    console.error("ERRORE su", base, e.message);
  }
}
console.log(`\nFatto: ${done} video. Risparmio: ~${(savedBytes/1048576).toFixed(1)} MB`);
