const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '..', 'assets', 'optimized-files', 'optimized');
const QUALITY = 82;

let converted = 0;
let skipped = 0;
let errors = 0;
let savedBytes = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

async function convert(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return;

  const webpPath = filePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  if (fs.existsSync(webpPath)) {
    skipped++;
    return;
  }

  try {
    await sharp(filePath).webp({ quality: QUALITY }).toFile(webpPath);
    const origSize = fs.statSync(filePath).size;
    const newSize = fs.statSync(webpPath).size;
    savedBytes += origSize - newSize;
    converted++;
    if (converted % 50 === 0) process.stdout.write(`  ${converted} converted...\n`);
  } catch (e) {
    errors++;
    console.error(`  ERROR: ${path.basename(filePath)} — ${e.message}`);
  }
}

(async () => {
  console.log('Scanning assets...');
  const files = walk(INPUT_DIR);
  const targets = files.filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  console.log(`Found ${targets.length} images to process.\n`);

  for (const f of targets) await convert(f);

  const savedMB = (savedBytes / 1024 / 1024).toFixed(1);
  console.log(`\nDone.`);
  console.log(`  Converted : ${converted}`);
  console.log(`  Skipped   : ${skipped} (already had .webp)`);
  console.log(`  Errors    : ${errors}`);
  console.log(`  Saved     : ${savedMB} MB`);
})();
