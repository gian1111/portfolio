function toWebP(src) {
  if (!src) return src;
  return src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
}

// versione leggera (cartella /thumbs accanto all'immagine) per il display;
// la full si apre nel lightbox
function toThumb(src) {
  const full = toWebP(src);
  if (!full) return full;
  return full.replace(/\/([^\/]+)$/, '/thumbs/$1');
}

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

const project = projectsData[slug];


/* ===============================
   FALLBACK SE PROGETTO NON ESISTE
================================ */

if (!project) {

  window.renderProjectContent = function(lang) {
    const l = lang || 'en';
    const isIt = l === 'it';
    document.querySelector("main").innerHTML = `
      <div class="grid grid-cols-12 px-6 pt-40">
        <div class="col-span-12 md:col-span-6 md:col-start-4">
          <h1 class="project-title font-aujournuit">
            ${isIt ? 'Progetto non trovato' : 'Project not found'}
          </h1>
          <p class="mt-6 font-satoshi">
            ${isIt ? 'Questo progetto non esiste o è ancora in costruzione.' : 'This project does not exist or is still under construction.'}
          </p>
          <a href="index.html" class="underline mt-10 inline-block">
            ${isIt ? 'Torna ai progetti' : 'Back to projects'}
          </a>
        </div>
      </div>
    `;
  };

}


/* ===============================
   RENDER CONTENUTI PROGETTO
================================ */

if (project) {

  /* ---------- TITOLI (una tantum) ---------- */

  document.getElementById("project-title").innerHTML =
      project.title || "";

  document.title = `${project.title} | Gianmarco Malandra`;

  document.getElementById("project-category").innerHTML =
    project.category || "";


  /* ---------- META (una tantum) ---------- */

  document.getElementById("project-role").innerHTML =
    project.role || "";

  document.getElementById("project-contribution").innerHTML =
    project.contribution || "";

  document.getElementById("project-clients").innerHTML =
    project.clients || "";

  document.getElementById("project-tools").innerHTML =
    project.tools || "";


  /* ---------- IMMAGINI HERO (una tantum) ---------- */

  function setHero(id, item) {
    const el = document.getElementById(id);
    if (!el) return;
    const src = item?.src;
    if (!src) { el.hidden = true; return; }
    el.hidden = false;
    el.src = toThumb(src);
    el.dataset.full = toWebP(src);
    el.alt = item.alt || "";
  }

  setHero("project-image-1", project.images?.[0]);
  setHero("project-image-2", project.images?.[1]);
  setHero("project-image-2-1", project.images?.[5]);
  setHero("project-image-3", project.images?.[2]);

  ['project-image-1', 'project-image-2', 'project-image-2-1'].forEach(id => {
    const img = document.getElementById(id);
    const onLoad = () => {
      img.style.flex = img.naturalWidth / img.naturalHeight;
      img.style.width = '100%';
    };
    if (img.complete && img.naturalWidth) onLoad();
    else img.addEventListener('load', onLoad);
  });


  /* ---------- NEXT PROJECT (una tantum) ---------- */

  const projectSlugs = Object.keys(projectsData);
  const currentIndex = projectSlugs.indexOf(slug);
  const nextSlug = projectSlugs[currentIndex + 1] || projectSlugs[0];
  const nextProject = projectsData[nextSlug];

  const nextEl = document.getElementById('next-project');
  if (nextEl && nextProject) {
    nextEl.href = `project.html?slug=${nextSlug}`;
    nextEl.querySelector('.next-title').textContent = nextProject.title;
  }


  /* ===============================
     GALLERY RENDERING
  ================================ */

  function renderTextBlock(item, lang) {
    const isIt = lang === 'it';
    const title = isIt ? (item.title_it || item.title || '') : (item.title || '');
    const text  = isIt ? (item.text_it  || item.text  || '') : (item.text  || '');
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
          const isVideo = src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.mov');
          const liteVideo = src.replace(/\/([^\/]+)$/, '/compressed/$1');
          const poster = liteVideo.replace(/\.(mp4|webm|mov)$/i, '.jpg');

          const media = isVideo
            ? `<video data-src="${liteVideo}" poster="${poster}" class="project-image lazy-video" loop muted playsinline preload="none" style="width:100%; height:auto; display:block;"></video>`
            : `<img src="${toThumb(src)}" data-full="${toWebP(src)}" alt="${alt}" class="project-image" loading="lazy" decoding="async"
                ${isSingle ? '' : 'onload="this.parentElement.style.flex = this.naturalWidth / this.naturalHeight"'}>`;

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
          // thumbnail leggera per il grid; la full si apre nel lightbox (data-full)
          const thumb = full.replace(/\/([^\/]+)$/, '/thumbs/$1');
          return `
            <figure style="margin:0; content-visibility:auto; contain-intrinsic-size:0 360px;">
              <img src="${thumb}" data-full="${full}" alt="${alt}" class="project-image" loading="lazy" decoding="async"
                style="width:100%; height:auto; display:block;">
            </figure>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderGallery(lang) {
    const galleryContainer = document.getElementById("project-gallery");
    if (!project.gallery?.length || !galleryContainer) return;

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

    galleryContainer.style.display = "flex";
    galleryContainer.style.flexDirection = "column";

    galleryContainer.innerHTML = blocks.map(block => {
      if (block.type === 'text') return renderTextBlock(block, lang);
      if (block.type === 'group') return renderImageGroup(block);
      if (block.type === 'grid') return renderImageGrid(block);
      if (block.image || block.src) return renderImageGroup({ images: [block] });
      return '';
    }).join('');

    initLightbox();

    document.querySelectorAll('.lazy-video').forEach(v => videoObserver.observe(v));
  }


  /* ===============================
     FUNZIONE PUBBLICA: aggiorna testi
  ================================ */

  window.renderProjectContent = function(lang) {
    const l = lang || 'en';
    const isIt = l === 'it';

    document.getElementById("project-intro").innerHTML =
      (isIt ? project.intro_it : null) || project.intro || '';

    const body = (isIt && project.body_it) ? project.body_it : project.body;
    document.getElementById("project-body-1").innerHTML = body?.[0] || '';
    document.getElementById("project-body-2").innerHTML = body?.[1] || '';

    renderGallery(l);
  };

}


/* ===============================
   LIGHTBOX
================================ */

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

function initLightbox() {
  document.querySelectorAll(".project-image").forEach(img => {
    img.addEventListener("click", () => {
      lightboxImg.src = img.dataset.full || img.src;
      lightboxImg.alt = img.alt || "";
      lightbox.classList.remove("hidden");
      setTimeout(() => lightbox.classList.add("show"), 10);
    });
  });
}

/* lazy-load videos when they enter the viewport */
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const video = entry.target;
    if (video.dataset.src) {
      video.src = video.dataset.src;
      delete video.dataset.src;
      video.load();
      video.play().catch(() => {});
    }
    videoObserver.unobserve(video);
  });
}, { rootMargin: '600px' });


/* chiusura click */
lightbox.addEventListener("click", () => {
  lightbox.classList.remove("show");
  setTimeout(() => {
    lightbox.classList.add("hidden");
    lightboxImg.src = "";
    lightboxImg.alt = "";
  }, 200);
});

/* chiusura ESC */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    lightbox.classList.remove("show");
    setTimeout(() => {
      lightbox.classList.add("hidden");
      lightboxImg.src = "";
      lightboxImg.alt = "";
    }, 200);
  }
});
