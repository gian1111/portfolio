/**
 * DATABASE PROGETTI
 */
const myProjects = [
    // { name: "SSC Napoli", slug: "ssc-napoli", style: "", category: "social"},
    { name: "Area Sport", slug:"area", style: "", category: "branding" },
    { name: "Juventus FC", slug:"juventus", style: "", category: "social" },
    { name: "Stefano Francioni", slug: "stefano-francioni", style: "", category: "art-direction" },
    { name: "Football Social Media Design", slug:"social-media", style: "", category: "social" },
    { name: "FractureSounds", slug: "fracturesounds",style: "", category: "social" },
    { name: "CoVince", slug:"covince", style: "", category: ["uxui", "branding"] },
    { name: "Dinosound", slug: "dinosound", style: "", category: "uxui" },
    { name: "Movie Posters", slug: "movie-posters", style: "", category: "art-direction" },
    { name: "Novo Esports", slug:"novo", style: "", category: "art-direction" },
    { name: "Letsgoski Official Merch", slug: "letsgoski", style: "", category: "merch" },
    { name: "Gorgeous Blu-Ray", slug:"gorgeous", style: "", category: "art-direction" },
    { name: "Carousels", slug:"carousels", style: "", category: "social" },
    { name: "Straight Through Crew", slug:"straight", style: "", category: "art-direction" },
    { name: "The Seventh Peak", slug:"seventh", style: "", category: "uxui" },
    { name: "Berserk: The Long Night", slug:"berserk", style: "", category: "uxui" },

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
        const isMatch = activeFilter === 'all' || [].concat(project.category).includes(activeFilter);
        
        // Classi stato: se match -> Nero, se NO match -> Grigio #E8E8E8
        const stateClasses = isMatch 
            ? "text-black hover:text-[#F6FB6B] cursor-crosshair opacity-100" 
            : "text-[#E8E8E8] cursor-default pointer-events-none";

        const projectSpan = `
        <a href="project/${project.slug}.html"
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
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Europe/Rome' });
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
    subtitle: 'Graphic Designer e Art Director, based in Italy',
    projects: 'Progetti',
    aboutme: 'Chi sono',
    available: 'Disponibile per progetti freelance',
    // mobile menu labels
    menuContact: 'Contatto',
    menuNavigation: 'Navigazione',
    menuSettings: 'Impostazioni',
    menuInfo: 'Info',
    // about me bio (innerHTML — contiene il tag img)
    aboutBio: '<img src="assets/1000045896.jpg" class="float-left w-36 mr-4 mb-2" alt="Ritratto di Gianmarco Malandra">Gianmarco è un graphic designer e art director che lavora su contenuti per i social media, identità visiva e key visual con un focus su tipografia, layout e coerenza visiva.',
    aboutMore: "Dal 2018 lavora con club e agenzie calcistiche, team esports, produzioni teatrali, distributori cinematografici e aziende music-tech, seguendo i progetti dal primo concept ai file finali di produzione. Il suo lavoro spazia tra branding, sistemi per i social media, key art e packaging — sempre costruiti su solide basi tipografiche. Vive a Chieti e collabora da remoto con clienti in tutta Europa; è aperto a progetti freelance e nuove opportunità.",
    ctaText: 'Ti piace quello che vedi?',
    ctaLink: 'Scrivimi',
    // project.html labels
    labelRole: 'Ruolo:',
    labelDeliverables: 'Materiali finali:',
    labelClients: 'Clienti:',
    labelTools: 'Strumenti:',
    labelNextProject: 'Prossimo Progetto',
    // footer CV
    cvLabel: 'Scarica CV',
    cvFile: 'gianmarco-malandra_CV-ita.pdf',
  },
  en: {
    name: 'Gianmarco Malandra.',
    subtitle: 'Graphic Designer and Art Director, based in Italy',
    projects: 'Projects',
    aboutme: 'About Me',
    available: 'Available for freelance projects',
    // mobile menu labels
    menuContact: 'Contact',
    menuNavigation: 'Navigation',
    menuSettings: 'Settings',
    menuInfo: 'Info',
    // about me bio
    aboutBio: '<img src="assets/1000045896.jpg" class="float-left w-36 mr-4 mb-2" alt="Portrait of Gianmarco Malandra">Gianmarco is a graphic designer and art director working on social media content, visual identity and key visuals with a focus on typography, layout and visual consistency.',
    aboutMore: "Since 2018 he has worked with football clubs and agencies, esports teams, theatre productions, film distributors and music-tech companies, taking projects from first concept to final production files. His work spans branding, social media systems, key art and packaging — always built on a strong typographic foundation. Based in Chieti, Italy, he collaborates remotely with clients across Europe and is currently open to freelance projects and new opportunities.",
    ctaText: 'Like what you see?',
    ctaLink: 'Get in touch',
    // project.html labels
    labelRole: 'Role:',
    labelDeliverables: 'Deliverables:',
    labelClients: 'Clients:',
    labelTools: 'Tools Used:',
    labelNextProject: 'Next Project',
    // footer CV
    cvLabel: 'Download CV',
    cvFile: 'gianmarco-malandra_resume.pdf',
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

  // Footer: link download CV
  const footerCv = document.getElementById('footer-cv');
  if (footerCv) {
    footerCv.textContent = t.cvLabel;
    footerCv.setAttribute('href', t.cvFile);
  }

  // About Me bio
  const aboutBio = document.getElementById('about-bio');
  if (aboutBio) aboutBio.innerHTML = t.aboutBio;
  const aboutMore = document.getElementById('about-more');
  if (aboutMore) aboutMore.textContent = t.aboutMore;

  // CTA contatto (about me + pagine progetto)
  const ctaText = document.getElementById('cta-text');
  const ctaLink = document.getElementById('cta-link');
  if (ctaText) ctaText.textContent = t.ctaText;
  if (ctaLink) ctaLink.textContent = t.ctaLink;

  // Project page labels
  const labelRole = document.getElementById('label-role');
  const labelDeliverables = document.getElementById('label-deliverables');
  const labelClients = document.getElementById('label-clients');
  const labelTools = document.getElementById('label-tools');
  const labelNextProject = document.getElementById('label-next-project');
  if (labelRole) labelRole.textContent = t.labelRole;
  if (labelDeliverables) labelDeliverables.textContent = t.labelDeliverables;
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

document.addEventListener('DOMContentLoaded', () => {
    // la lista è pre-renderizzata nell'HTML (build:pages) per i crawler:
    // al primo load basta attivare l'hover; renderProjects serve solo
    // quando cambiano i filtri
    const staticList = document.querySelector('#project-container a');
    if (staticList) initLetterHover();
    else renderProjects();
    initFilters();
    updateClock();
    initThemeToggle();
    setInterval(updateClock, 60000);
    initLangToggle();
    initHamburger();

    // Lingua e lista sono già applicate qui (in modo sincrono): rivela
    // subito. Elimina il flash EN->IT senza aggiungere attesa percepita.
    // Il font e' gestito da preload + font-display:optional (niente jump).
    document.documentElement.classList.remove('preload-hide');
    document.body.classList.add('loaded');

    // Carica i dati progetti (88KB) DOPO il paint: servono solo per
    // l'anteprima hover in home, non devono ritardare il caricamento.
    // Su project.html projectsData è già definito -> non ricaricare.
    if (typeof projectsData === 'undefined') {
        const s = document.createElement('script');
        s.src = 'js/project-data.js';
        document.body.appendChild(s);
    }
});

