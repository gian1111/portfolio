function toWebP(src) {
  if (!src) return src;
  return src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
}

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

const project = projectsData[slug];


/* ===============================
   FALLBACK SE PROGETTO NON ESISTE
================================ */

if (!project) {

  document.querySelector("main").innerHTML = `

    <div class="grid grid-cols-12 px-6 pt-40">

      <div class="col-span-12 md:col-span-6 md:col-start-4">

        <h1 class="project-title font-aujournuit">
          Project not found
        </h1>

        <p class="mt-6 font-satoshi">
          This project does not exist or is still under construction.
        </p>

        <a href="index.html" class="underline mt-10 inline-block">
          Back to projects
        </a>

      </div>

    </div>

  `;

}


/* ===============================
   RENDER CONTENUTI PROGETTO
================================ */

if (project) {

  /* ---------- TITOLI ---------- */

  document.getElementById("project-title").innerHTML =
      project.title || "";

  document.title = `${project.title} | Gianmarco Malandra`;

  document.getElementById("project-category").innerHTML =
    project.category || "";

  document.getElementById("project-intro").innerHTML =
    project.intro || "";


  /* ---------- META ---------- */

  document.getElementById("project-role").innerHTML =
    project.role || "";

  document.getElementById("project-contribution").innerHTML =
    project.contribution || "";

  document.getElementById("project-clients").innerHTML =
    project.clients || "";

  document.getElementById("project-tools").innerHTML =
    project.tools || "";


  /* ---------- TESTI ---------- */

  document.getElementById("project-body-1").innerHTML =
    project.body?.[0] || "";

  document.getElementById("project-body-2").innerHTML =
    project.body?.[1] || "";


  /* ---------- IMMAGINI HERO ---------- */

  document.getElementById("project-image-1").src =
    toWebP(project.images?.[0]?.src) || "";

  document.getElementById("project-image-1").alt =
    project.images?.[0]?.alt || "";


  document.getElementById("project-image-2").src =
    toWebP(project.images?.[1]?.src) || "";

  document.getElementById("project-image-2").alt =
    project.images?.[1]?.alt || "";


  document.getElementById("project-image-2-1").src =
    toWebP(project.images?.[5]?.src) || "";

  document.getElementById("project-image-2-1").alt =
    project.images?.[5]?.alt || "";


  document.getElementById("project-image-3").src =
    toWebP(project.images?.[2]?.src) || "";

  document.getElementById("project-image-3").alt =
    project.images?.[2]?.alt || "";

  ['project-image-1', 'project-image-2', 'project-image-2-1'].forEach(id => {
    const img = document.getElementById(id);
    const onLoad = () => {
      img.style.flex = img.naturalWidth / img.naturalHeight;
      img.style.width = '100%';
    };
    if (img.complete && img.naturalWidth) onLoad();
    else img.addEventListener('load', onLoad);
  });
  /* ===============================
     GALLERY DINAMICA (group-based)
     Supports new grouped structure and falls back to legacy flat arrays
  =============================== */

  const galleryContainer = document.getElementById("project-gallery");

  function renderTextBlock(item) {
    return `
      <figure class="gallery-text-block">
        <div class="gallery-text-inner font-satoshi">
          ${item.title ? `<h3 class="gallery-text-title font-[700] text-[18px] mb-1">${item.title}</h3>` : ''}
          ${item.html ? item.html : (item.text ? `<p class="gallery-text-body text-[16px] leading-snug tracking-wide">${item.text}</p>` : '')}
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

          const media = isVideo
            ? `<video data-src="${src}" class="project-image lazy-video" loop muted playsinline preload="none" style="width:100%; height:auto; display:block;"></video>`
            : `<img src="${toWebP(src)}" alt="${alt}" class="project-image" loading="lazy"
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
        return `
          <figure style="margin:0;">
            <img src="${toWebP(src)}" alt="${alt}" class="project-image" loading="lazy"
              style="width:100%; height:auto; display:block;">
          </figure>
        `;
      }).join('')}
    </div>
  `;
}

  if (project.gallery?.length && galleryContainer) {
    // Normalize: if items already have a `type` property (group/text), use as-is.
    // Otherwise coalesce contiguous images into groups (backwards compatibility).
    let blocks = [];

    const hasTyped = project.gallery.some(i => i && i.type);

    if (hasTyped) {
      blocks = project.gallery;
    } else {
      // legacy flat array: group contiguous image items into a group
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
      if (block.type === 'text') return renderTextBlock(block);
      if (block.type === 'group') return renderImageGroup(block);
      if (block.type === 'grid') return renderImageGrid(block);
      // fallback: if block looks like an image
      if (block.image || block.src) return renderImageGroup({ images: [block] });
      return '';
    }).join('');
  }

//   function normalizeGroupHeights() {
//   document.querySelectorAll('.project-gallery-block').forEach(group => {
//     const imgs = group.querySelectorAll('img');
//     imgs.forEach(img => {
//       const onLoad = () => {
//         const flexValue = img.naturalWidth * img.naturalHeight;
//         img.parentElement.style.flex = flexValue.toString();
//         img.style.width = '100%';
//         img.style.height = 'auto';
//         img.style.display = 'block';
//       };
//       if (img.complete && img.naturalWidth) onLoad();
//       else img.addEventListener('load', onLoad);
//     });
//   });
// }

// normalizeGroupHeights();

}


/* ===============================
   LIGHTBOX
================================ */

const lightbox =
  document.getElementById("lightbox");

const lightboxImg =
  document.getElementById("lightbox-img");


function initLightbox() {

  const images =
    document.querySelectorAll(".project-image");

  images.forEach(img => {

    img.addEventListener("click", () => {

      lightboxImg.src = img.src;

      lightboxImg.alt = img.alt || "";

      lightbox.classList.remove("hidden");

      setTimeout(() => {

        lightbox.classList.add("show");

      }, 10);

    });

  });

}


/* inizializza dopo il render */
initLightbox();

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
}, { rootMargin: '200px' });

document.querySelectorAll('.lazy-video').forEach(v => videoObserver.observe(v));


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

// NEXT PROJECT
const projectSlugs = Object.keys(projectsData);
const currentIndex = projectSlugs.indexOf(slug);
const nextSlug = projectSlugs[currentIndex + 1] || projectSlugs[0];
const nextProject = projectsData[nextSlug];

const nextEl = document.getElementById('next-project');
if (nextEl && nextProject) {
  nextEl.href = `project.html?slug=${nextSlug}`;
  nextEl.querySelector('.next-title').textContent = nextProject.title;
}