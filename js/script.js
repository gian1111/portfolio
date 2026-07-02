/**
 * DATABASE PROGETTI
 */
const myProjects = [
    // { name: "SSC Napoli", slug: "ssc-napoli", style: "", category: "social"},
    { name: "Juventus FC", slug:"juventus", style: "", category: "social" },
    { name: "Movie Posters", slug: "movie-posters", style: "", category: "art-direction" },
    { name: "Letsgoski Official Merch", slug: "letsgoski", style: "", category: "merch" },
    { name: "Dinousound", slug: "dinosound", style: "", category: "uxui" },
    { name: "Berserk: The Long Night", slug:"berserk", style: "", category: "uxui" },
    { name: "CoVince", slug:"covince", style: "", category: "uxui", category: "branding" },
    { name: "Stefano Francioni", slug: "stefano-francioni", style: "", category: "art-direction" },
    { name: "Gorgeous Blu-Ray", slug:"gorgeous", style: "", category: "art-direction" }, 
    { name: "Carousels", slug:"carousels", style: "", category: "social" },
    { name: "Straight Through Crew", slug:"straight", style: "", category: "art-direction" },
    { name: "The Seventh Peak", slug:"seventh", style: "", category: "uxui" },
    { name: "Area Sport", slug:"area", style: "", category: "branding" },
    { name: "Football Social Media Design", slug:"social-media", style: "", category: "social" },
    { name: "Novo Esports", slug:"novo", style: "", category: "art-direction" },
    { name: "FractureSounds", slug: "fracturesounds",style: "", category: "social" },

];

let activeFilter = 'all';

/**
 * FUNZIONE RENDER
 */
function renderProjects() {
    const container = document.getElementById('project-container');
    if (!container) return;

    container.innerHTML = myProjects.map((project, index) => {
        // Controllo se il progetto fa parte del filtro attivo
        const isMatch = activeFilter === 'all' || project.category === activeFilter;
        
        // Classi stato: se match -> Nero, se NO match -> Grigio #E8E8E8
        const stateClasses = isMatch 
            ? "text-black hover:text-[#F6FB6B] cursor-crosshair opacity-100" 
            : "text-[#E8E8E8] cursor-default pointer-events-none";

        const projectSpan = `
        <a href="project.html?slug=${project.slug}"
            data-slug="${project.slug}"
            class="inline-block transition-all duration-500 ${project.style} ${stateClasses}">
            ${project.name}
        </a>
        `;        
        const isLast = index === myProjects.length - 1;
        const separator = isLast ? '' : `<span class="text-gray-200 font-sans mx-4 font-light">/</span>`;
        
        return projectSpan + separator;
    }).join(' ');
    initLetterHover();
    if (typeof window._previewAttach === 'function') window._previewAttach();
}

// Letter Hover Effect

function initLetterHover() {
  document.querySelectorAll('#project-container a').forEach(el => {
    const original = el.textContent.trim();
    
    el.innerHTML = original.split('').map((char) => 
      char === ' ' 
        ? ' ' 
        : `<span style="display:inline-block; transition: transform 0.3s ease, opacity 0.3s ease; font-variation-settings: inherit;">${char}</span>`
    ).join('');

    el.querySelectorAll('span').forEach((span, i, all) => {
      span.addEventListener('mouseenter', () => {
        all.forEach((s, j) => {
          const distance = Math.abs(j - i);
          const delay = distance * 40;
          s.style.transitionDelay = `${delay}ms`;
          s.style.transform = 'translateY(-4px)';
          s.style.opacity = '0.4';
        });
      });
    });

    el.addEventListener('mouseleave', () => {
      el.querySelectorAll('span').forEach(span => {
        span.style.transitionDelay = '0ms';
        span.style.transform = 'translateY(0)';
        span.style.opacity = '1';
      });
    });
  });
}

/**
 * GESTIONE FILTRI
 */
function initFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            activeFilter = btn.getAttribute('data-filter');

            // Reset di tutti i bottoni al colore base #E8E8E8
            buttons.forEach(b => {
                b.classList.remove('bg-[#F6FB6B]', 'bg-[#C2C2C2]', 'text-black');
                b.classList.add('bg-[#E8E8E8]', 'text-gray-500');
            });

            // Colore specifico per il bottone cliccato
            if (activeFilter === 'all') {
                btn.classList.remove('bg-[#E8E8E8]', 'text-gray-500');
                btn.classList.add('bg-[#F6FB6B]', 'text-black'); // Giallo Neon
            } else {
                btn.classList.remove('bg-[#E8E8E8]', 'text-gray-500');
                btn.classList.add('bg-[#C2C2C2]', 'text-black'); // Grigio scuro
            }

            renderProjects();
        });
    });
}

/**
 * OROLOGIO
 */
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const text = `Chieti, Italy - ${timeString}`;
    const timeDisplay = document.getElementById('current-time');
    const timeDisplayMobile = document.getElementById('current-time-mobile');
    if (timeDisplay) timeDisplay.innerText = text;
    if (timeDisplayMobile) timeDisplayMobile.innerText = text;
}

/**
 * THEME TOGGLE (light/dark)
 */
function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('theme-dark', isDark);

    // Keep Tailwind utility classes in sync (body has hard-coded bg/text classes)
    document.body.classList.toggle('bg-black', isDark);
    document.body.classList.toggle('text-white', isDark);
    document.body.classList.toggle('bg-white', !isDark);
    document.body.classList.toggle('text-black', !isDark);

    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.textContent = isDark ? 'Light' : 'Dark';
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        btn.setAttribute('aria-pressed', String(isDark));
    }
}

function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    const btnMobile = document.getElementById('themeToggle-mobile');

    const stored = localStorage.getItem('theme');
    const initial = stored || 'light';
    applyTheme(initial);

    const toggle = () => {
        const next = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        applyTheme(next);
        if (btnMobile) btnMobile.textContent = next === 'dark' ? 'Light' : 'Dark';
    };

    if (btn) btn.addEventListener('click', toggle);
    if (btnMobile) btnMobile.addEventListener('click', toggle);
}

let currentLang = localStorage.getItem('lang') || 'en';

const translations = {
  it: {
    name: 'Gianmarco Malandra.',
    subtitle: 'Graphic Designer e Visual Artist, based in Italy',
    projects: 'Progetti',
    aboutme: 'Chi sono',
    available: 'Disponibile per progetti freelance',
    // mobile menu labels
    menuContact: 'Contatto',
    menuNavigation: 'Navigazione',
    menuSettings: 'Impostazioni',
    menuInfo: 'Info',
    // about me bio (innerHTML — contiene il tag img)
    aboutBio: 'Gianmarco è un graphic designer e visual artist che lavora su contenuti per i social media, identità visiva e key visual <img src="assets/1000045896.jpg" class="float-left w-36 mr-4 mb-2" alt="Gianmarco portrait"> con un focus su tipografia, layout e coerenza visiva.',
    // project.html labels
    labelRole: 'Ruolo:',
    labelContribution: 'Contributo:',
    labelClients: 'Clienti:',
    labelTools: 'Strumenti:',
    labelNextProject: 'Prossimo Progetto',
  },
  en: {
    name: 'Gianmarco Malandra.',
    subtitle: 'Graphic Designer and Visual Artist, based in Italy',
    projects: 'Projects',
    aboutme: 'About Me',
    available: 'Available for freelance projects',
    // mobile menu labels
    menuContact: 'Contact',
    menuNavigation: 'Navigation',
    menuSettings: 'Settings',
    menuInfo: 'Info',
    // about me bio
    aboutBio: 'Gianmarco is a graphic designer and visual artist working on social media content, visual identity and key visuals <img src="assets/1000045896.jpg" class="float-left w-36 mr-4 mb-2" alt="Gianmarco portrait"> with a focus on typography, layout and visual consistency.',
    // project.html labels
    labelRole: 'Role:',
    labelContribution: 'Contribution:',
    labelClients: 'Clients:',
    labelTools: 'Tools Used:',
    labelNextProject: 'Next Project',
  }
};

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  const t = translations[lang];

  // Nav
  const navH1 = document.querySelector('nav h1');
  const navP = document.querySelector('nav p');
  const navProjects = document.getElementById('nav-projects');
  const navAboutme = document.getElementById('nav-aboutme');
  const navProjectsMobile = document.getElementById('nav-projects-mobile');
  const navAboutmeMobile = document.getElementById('nav-aboutme-mobile');
  const btn = document.getElementById('langToggle');
  const btnMobile = document.getElementById('langToggle-mobile');

  if (navH1) navH1.textContent = t.name;
  if (navP) navP.textContent = t.subtitle;
  if (navProjects) navProjects.textContent = t.projects;
  if (navAboutme) navAboutme.textContent = t.aboutme;
  if (navProjectsMobile) navProjectsMobile.textContent = t.projects;
  if (navAboutmeMobile) navAboutmeMobile.textContent = t.aboutme;
  if (btn) btn.textContent = lang === 'en' ? 'ITA' : 'ENG';
  if (btnMobile) btnMobile.textContent = lang === 'en' ? 'ITA' : 'ENG';

  // Available (footer + mobile)
  document.querySelectorAll('.i18n-available').forEach(el => el.textContent = t.available);
  document.querySelectorAll('.available-mobile').forEach(el => el.textContent = t.available);

  // Mobile menu section labels
  const menuContact = document.getElementById('menu-contact');
  const menuNav = document.getElementById('menu-navigation');
  const menuSettings = document.getElementById('menu-settings');
  const menuInfo = document.getElementById('menu-info');
  if (menuContact) menuContact.textContent = t.menuContact;
  if (menuNav) menuNav.textContent = t.menuNavigation;
  if (menuSettings) menuSettings.textContent = t.menuSettings;
  if (menuInfo) menuInfo.textContent = t.menuInfo;

  // About Me bio
  const aboutBio = document.getElementById('about-bio');
  if (aboutBio) aboutBio.innerHTML = t.aboutBio;

  // Project page labels
  const labelRole = document.getElementById('label-role');
  const labelContribution = document.getElementById('label-contribution');
  const labelClients = document.getElementById('label-clients');
  const labelTools = document.getElementById('label-tools');
  const labelNextProject = document.getElementById('label-next-project');
  if (labelRole) labelRole.textContent = t.labelRole;
  if (labelContribution) labelContribution.textContent = t.labelContribution;
  if (labelClients) labelClients.textContent = t.labelClients;
  if (labelTools) labelTools.textContent = t.labelTools;
  if (labelNextProject) labelNextProject.textContent = t.labelNextProject;

  // Project page content (intro, body, gallery texts)
  if (typeof window.renderProjectContent === 'function') {
    window.renderProjectContent(lang);
  }
}

function initLangToggle() {
  const btn = document.getElementById('langToggle');
  const btnMobile = document.getElementById('langToggle-mobile');
  applyLang(currentLang);
  const toggle = () => applyLang(currentLang === 'it' ? 'en' : 'it');
  if (btn) btn.addEventListener('click', toggle);
  if (btnMobile) btnMobile.addEventListener('click', toggle);
}

function initHamburger() {
    const toggle = document.getElementById('hamburger-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
        toggle.classList.toggle('active');
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            toggle.classList.remove('active');
        });
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            menu.classList.remove('open');
            toggle.classList.remove('active');
        }
    });
}

/**
 * HOVER PREVIEW
 */
function initProjectPreview() {
    const preview = document.createElement('div');
    preview.id = 'project-preview';
    preview.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.2s ease;
        width: 140px;
        height: 80px;
        overflow: hidden;
        border-radius: 18px;
    `;
    const img = document.createElement('img');
    img.style.cssText = 'width:100%; height:100%; object-fit:cover; display:block;';
    preview.appendChild(img);
    document.body.appendChild(preview);

    // Dimensioni fisse (vedi cssText sopra): evita reflow sincrono ad ogni frame
    const PW = 140, PH = 80;

    document.addEventListener('mousemove', e => {
        // Riposiziona solo quando il preview è effettivamente visibile
        if (preview.style.opacity !== '1') return;
        const offset = 20;
        const x = e.clientX + offset + PW > window.innerWidth ? e.clientX - offset - PW : e.clientX + offset;
        const y = e.clientY + offset + PH > window.innerHeight ? e.clientY - offset - PH : e.clientY + offset;
        preview.style.left = x + 'px';
        preview.style.top = y + 'px';
    });

    function attachPreviewListeners() {
        document.querySelectorAll('#project-container a[data-slug]').forEach(link => {
            link.addEventListener('mouseenter', () => {
                const slug = link.getAttribute('data-slug');
                const data = typeof projectsData !== 'undefined' && projectsData[slug];
                if (!data) return;
                const firstImage = data.images?.[0]?.src || data.gallery?.[0]?.images?.[0]?.image;
                if (!firstImage) return;
                // usa la thumbnail leggera (/thumbs) invece dell'originale full-res
                const thumb = firstImage
                    .replace(/\.(png|jpg|jpeg)$/i, '.webp')
                    .replace(/\/([^\/]+)$/, '/thumbs/$1');
                img.src = thumb;
                preview.style.opacity = '1';
            });
            link.addEventListener('mouseleave', () => {
                preview.style.opacity = '0';
            });
        });
    }

    // Re-attach dopo ogni render (i filtri ri-renderizzano la lista)
    const origRender = renderProjects;
    window._previewAttach = attachPreviewListeners;

    attachPreviewListeners();
}

document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
    initFilters();
    updateClock();
    initThemeToggle();
    setInterval(updateClock, 60000);
    initLangToggle();
    initHamburger();
    initProjectPreview();

    // Rivela la pagina solo dopo che lingua/render sono applicati e i font
    // sono pronti: elimina il flash EN->IT e il layout jump da FOUT.
    const reveal = () => {
        document.documentElement.classList.remove('preload-hide');
        document.body.classList.add('loaded');
    };
    if (document.fonts && document.fonts.ready) {
        Promise.race([
            document.fonts.ready,
            new Promise(res => setTimeout(res, 800))
        ]).then(reveal);
    } else {
        reveal();
    }
});

