/**
 * Genera una pagina statica /project/<slug>.html per ogni progetto in
 * js/project-data.js, partendo dal template project.html.
 *
 * Ogni pagina ha meta tag dedicati (title, description, Open Graph, twitter)
 * letti dai dati del progetto, così i crawler social (che non eseguono JS)
 * vedono l'anteprima corretta. Il contenuto della pagina resta renderizzato
 * da project-page.js, che legge lo slug da <html data-slug="...">.
 *
 * Uso: node scripts/generate-project-pages.js
 * (da rilanciare quando si aggiunge/modifica un progetto in project-data.js)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SITE_URL = 'https://www.gianmarcom.xyz';
const OUT_DIR = path.join(ROOT, 'project');

// --- carica projectsData valutando il file (è un data-file, non un modulo) ---
const dataSrc = fs.readFileSync(path.join(ROOT, 'js', 'project-data.js'), 'utf-8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(dataSrc + '\n;globalThis.__data = projectsData;', sandbox);
const projectsData = sandbox.__data;

// --- template ---
const template = fs.readFileSync(path.join(ROOT, 'project.html'), 'utf-8');

function stripHtml(s) {
  return (s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(s, max) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

function escapeAttr(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function toWebP(src) {
  return src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
}

function firstImage(project) {
  const src = project.images?.[0]?.src
    || project.gallery?.[0]?.images?.[0]?.image
    || project.gallery?.[0]?.images?.[0]?.src;
  if (!src) return null;
  if (/\.(mp4|webm|mov)$/i.test(src)) return null;
  return toWebP(src);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

let count = 0;
for (const [slug, project] of Object.entries(projectsData)) {
  const title = `${stripHtml(project.title)} | Gianmarco Malandra`;
  const description = truncate(
    stripHtml(project.intro) || stripHtml(project.body?.[0]) ||
    `${stripHtml(project.title)} — a project by Gianmarco Malandra, graphic designer and visual artist.`,
    160
  );
  const pageUrl = `${SITE_URL}/project/${slug}.html`;
  const img = firstImage(project);
  const imageUrl = img ? encodeURI(`${SITE_URL}/${img}`) : `${SITE_URL}/assets/1000045896.jpg`;

  const metaBlock = `<title>${escapeAttr(title)}</title>
  <meta name="description" content="${escapeAttr(description)}">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Gianmarco Malandra">
  <meta property="og:title" content="${escapeAttr(title)}">
  <meta property="og:description" content="${escapeAttr(description)}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${imageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttr(title)}">
  <meta name="twitter:description" content="${escapeAttr(description)}">
  <meta name="twitter:image" content="${imageUrl}">`;

  let html = template;

  // meta dedicati al posto del blocco generico del template
  html = html.replace(/<!-- meta:start -->[\s\S]*?<!-- meta:end -->/, metaBlock);

  // slug disponibile per project-page.js senza query string
  html = html.replace('<html lang="it">', `<html lang="it" data-slug="${slug}">`);

  // la pagina vive in /project/: <base> fa risolvere i path relativi
  // (css/, js/, assets/) dalla root come nel template
  html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n  <base href="/">');

  fs.writeFileSync(path.join(OUT_DIR, `${slug}.html`), html);
  count++;
}

console.log(`Generate ${count} pagine in /project/`);
