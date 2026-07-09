/**
 * Genera una pagina statica /project/<slug>.html per ogni progetto in
 * js/project-data.js, partendo dal template project.html.
 *
 * Ogni pagina ha:
 *  - meta tag dedicati (title, description, Open Graph, twitter)
 *  - il CONTENUTO pre-renderizzato nell'HTML (titolo, intro, body, immagini,
 *    gallery) in inglese, così Google/Bing/crawler che non eseguono JS vedono
 *    la pagina completa. project-page.js rileva data-prerendered="en" e non
 *    ri-renderizza finché l'utente non passa all'italiano.
 *
 * Le funzioni di rendering della gallery rispecchiano quelle di
 * js/project-page.js: se cambi il markup lì, aggiornalo anche qui.
 *
 * Genera inoltre:
 *  - la lista progetti statica in index.html (blocco tra <!-- projects:start/end -->)
 *  - sitemap.xml
 *
 * Uso: node scripts/generate-project-pages.js
 * (da rilanciare quando si aggiunge/modifica un progetto)
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

// --- carica myProjects (lista home) da js/script.js con stub minimi ---
const scriptSrc = fs.readFileSync(path.join(ROOT, 'js', 'script.js'), 'utf-8');
const sb2 = {
  document: { addEventListener() {}, getElementById() { return null; }, querySelectorAll() { return []; } },
  localStorage: { getItem() { return null; }, setItem() {} },
  window: {},
};
vm.createContext(sb2);
vm.runInContext(scriptSrc + '\n;globalThis.__list = myProjects;', sb2);
const myProjects = sb2.__list;

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
  return (src || '').replace(/\.(png|jpg|jpeg)$/i, '.webp');
}

function toThumb(src) {
  const full = toWebP(src);
  if (!full) return full;
  return full.replace(/\/([^\/]+)$/, '/thumbs/$1');
}

function firstImage(project) {
  const src = project.images?.[0]?.src
    || project.gallery?.[0]?.images?.[0]?.image
    || project.gallery?.[0]?.images?.[0]?.src;
  if (!src) return null;
  if (/\.(mp4|webm|mov)$/i.test(src)) return null;
  return toWebP(src);
}

/* ===============================
   RENDER STATICO (specchia project-page.js)
================================ */

function renderTextBlock(item) {
  const title = item.title || '';
  const text = item.text || '';
  return `
      <figure class="gallery-text-block">
        <div class="gallery-text-inner font-satoshi">
          ${title ? `<h3 class="gallery-text-title font-[700] text-[18px] mb-1">${title}</h3>` : ''}
          ${item.html
            ? `<p class="gallery-text-body text-[16px] leading-snug tracking-wide">${item.html}</p>`
            : text ? `<p class="gallery-text-body text-[16px] leading-snug tracking-wide">${text}</p>` : ''}
        </div>
      </figure>
    `;
}

function renderImageGroup(group) {
  const images = group.images || [];
  const isSingle = images.length === 1;
  return `
      <div class="project-gallery project-gallery-block">
        ${images.map(img => {
          const src = img.image || img.src || '';
          const alt = img.alt || img.text || '';
          const caption = img.text || img.caption || '';
          const isVideo = /\.(mp4|webm|mov)$/i.test(src);
          const liteVideo = src.replace(/\/([^\/]+)$/, '/compressed/$1');
          const poster = liteVideo.replace(/\.(mp4|webm|mov)$/i, '.jpg');

          const media = isVideo
            ? `<video data-src="${liteVideo}" poster="${poster}" class="project-image lazy-video" loop muted playsinline preload="none" style="width:100%; height:auto; display:block;"></video>`
            : `<img src="${toThumb(src)}" data-full="${toWebP(src)}" alt="${escapeAttr(alt)}" class="project-image" loading="lazy" decoding="async"
                ${isSingle ? '' : 'onload="this.parentElement.style.flex = (this.naturalWidth / this.naturalHeight) * 100"'}>`;

          return `
            <figure style="flex: ${img.flex || 1}">
              ${media}
              ${caption ? `<figcaption class="font-satoshi font-[500] text-[16px] leading-snug mt-3">${caption}</figcaption>` : ''}
            </figure>
          `;
        }).join('')}
      </div>
    `;
}

function renderImageGrid(group) {
  const images = group.images || [];
  const cols = group.cols || 3;
  return `
      <div class="project-image-grid" style="display:grid; grid-template-columns: repeat(${cols}, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
        ${images.map(img => {
          const src = img.image || img.src || '';
          const alt = img.alt || img.text || '';
          const full = toWebP(src);
          const thumb = full.replace(/\/([^\/]+)$/, '/thumbs/$1');
          return `
            <figure style="margin:0; content-visibility:auto; contain-intrinsic-size:0 360px;">
              <img src="${thumb}" data-full="${full}" alt="${escapeAttr(alt)}" class="project-image" loading="lazy" decoding="async"
                style="width:100%; height:auto; display:block;">
            </figure>
          `;
        }).join('')}
      </div>
    `;
}

function renderGalleryHtml(project) {
  if (!project.gallery?.length) return '';

  let blocks = [];
  const hasTyped = project.gallery.some(i => i && i.type);

  if (hasTyped) {
    blocks = project.gallery;
  } else {
    let currentGroup = { type: 'group', images: [] };
    project.gallery.forEach(item => {
      if (item.type === 'text' || item.textOnly) {
        if (currentGroup.images.length) {
          blocks.push(currentGroup);
          currentGroup = { type: 'group', images: [] };
        }
        blocks.push({ type: 'text', title: item.title, text: item.text, html: item.html });
      } else {
        currentGroup.images.push(item);
      }
    });
    if (currentGroup.images.length) blocks.push(currentGroup);
  }

  return blocks.map(block => {
    if (block.type === 'text') return renderTextBlock(block);
    if (block.type === 'group') return renderImageGroup(block);
    if (block.type === 'grid') return renderImageGrid(block);
    if (block.image || block.src) return renderImageGroup({ images: [block] });
    return '';
  }).join('');
}

// riempie un elemento vuoto identificato dal suo id nel template
function fillById(html, id, content) {
  const re = new RegExp(`(<[a-z0-9]+ id="${id}"[^>]*>)([\\s\\S]*?)(</)`);
  return html.replace(re, `$1${content}$3`);
}

// imposta src/data-full/alt su un <img id="..."> del template (o hidden se manca)
function fillImg(html, id, item, projectTitle) {
  const re = new RegExp(`<img id="${id}" src="" alt=""`);
  if (!item?.src) return html.replace(re, `<img id="${id}" src="" alt="" hidden`);
  const alt = escapeAttr(item.alt || `${stripHtml(projectTitle)} — hero image`);
  return html.replace(re, `<img id="${id}" src="${toThumb(item.src)}" data-full="${toWebP(item.src)}" alt="${alt}"`);
}

/* ===============================
   PAGINE PROGETTO
================================ */

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const slugs = Object.keys(projectsData);
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
  const imageUrl = img ? encodeURI(`${SITE_URL}/${img}`) : `${SITE_URL}/assets/og-cover.jpg`;

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

  html = html.replace(/<!-- meta:start -->[\s\S]*?<!-- meta:end -->/, metaBlock);

  // slug + flag "contenuto EN già nell'HTML" per project-page.js
  html = html.replace('<html lang="it">', `<html lang="en" data-slug="${slug}" data-prerendered="en">`);

  // la pagina vive in /project/: <base> fa risolvere i path relativi dalla root
  html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n  <base href="/">');

  // --- contenuto pre-renderizzato (EN) ---
  html = fillById(html, 'project-title', project.title || '');
  html = fillById(html, 'project-category', project.category || '');
  html = fillById(html, 'project-intro', project.intro || '');
  html = fillById(html, 'project-role', project.role || '');
  html = fillById(html, 'project-contribution', project.contribution || '');
  html = fillById(html, 'project-clients', project.clients || '');
  html = fillById(html, 'project-tools', project.tools || '');
  html = fillById(html, 'project-body-1', project.body?.[0] || '');
  html = fillById(html, 'project-body-2', project.body?.[1] || '');

  html = fillImg(html, 'project-image-1', project.images?.[0], project.title);
  html = fillImg(html, 'project-image-2', project.images?.[1], project.title);
  html = fillImg(html, 'project-image-2-1', project.images?.[5], project.title);
  html = fillImg(html, 'project-image-3', project.images?.[2], project.title);

  const galleryHtml = renderGalleryHtml(project);
  if (galleryHtml) {
    html = html.replace(
      '<div id="project-gallery" class="project-gallery"></div>',
      `<div id="project-gallery" class="project-gallery" style="display:flex;flex-direction:column">${galleryHtml}</div>`
    );
  }

  // next project (stesso ordine di project-page.js)
  const idx = slugs.indexOf(slug);
  const nextSlug = slugs[idx + 1] || slugs[0];
  html = html.replace('<a id="next-project" href="#"', `<a id="next-project" href="project/${nextSlug}.html"`);
  html = html.replace(
    /(<h2 class="next-title[^>]*>)(<\/h2>)/,
    `$1${projectsData[nextSlug].title || ''}$2`
  );

  fs.writeFileSync(path.join(OUT_DIR, `${slug}.html`), html);
  count++;
}

console.log(`Generate ${count} pagine in /project/`);

/* ===============================
   LISTA PROGETTI STATICA IN index.html
   (stesso markup di renderProjects in js/script.js, filtro "all")
================================ */

const listHtml = myProjects.map((p, i) => {
  const cats = [].concat(p.category).join(' ');
  const link = `<a href="project/${p.slug}.html" data-slug="${p.slug}" data-category="${cats}" class="inline-block transition-all duration-500 ${p.style} text-black hover:text-[#F6FB6B] cursor-crosshair opacity-100">${p.name}</a>`;
  const sep = i === myProjects.length - 1 ? '' : ` <span class="text-gray-200 font-sans mx-4 font-light">/</span>`;
  return link + sep;
}).join(' ');

const indexPath = path.join(ROOT, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf-8');
const marked = /<!-- projects:start -->[\s\S]*?<!-- projects:end -->/;
if (marked.test(indexHtml)) {
  indexHtml = indexHtml.replace(marked, `<!-- projects:start -->${listHtml}<!-- projects:end -->`);
  fs.writeFileSync(indexPath, indexHtml);
  console.log(`Lista progetti statica aggiornata in index.html (${myProjects.length} progetti)`);
} else {
  console.warn('ATTENZIONE: marcatori <!-- projects:start/end --> non trovati in index.html, lista non aggiornata');
}

/* ===============================
   SITEMAP
================================ */

const today = new Date().toISOString().slice(0, 10);
const urls = [
  `${SITE_URL}/`,
  `${SITE_URL}/aboutme.html`,
  ...slugs.map(s => `${SITE_URL}/project/${s}.html`),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
console.log(`sitemap.xml generata (${urls.length} URL)`);
