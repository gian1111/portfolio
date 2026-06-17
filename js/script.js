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
    { name: "CoVince", slug:"covince", style: "", category: "uxui", category: "art-direction" },
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
    available: 'Disponibile per progetti freelance'
  },
  en: {
    name: 'Gianmarco Malandra.',
    subtitle: 'Graphic Designer and Visual Artist, based in Italy',
    projects: 'Projects',
    aboutme: 'About Me',
    available: 'Available for freelance projects'
  }
};

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  const t = translations[lang];

  const navH1 = document.querySelector('nav h1');
  const navP = document.querySelector('nav p');
  const navProjects = document.getElementById('nav-projects');
  const navAboutme = document.getElementById('nav-aboutme');
  const navProjectsMobile = document.getElementById('nav-projects-mobile');
  const navAboutmeMobile = document.getElementById('nav-aboutme-mobile');
  const available = document.querySelector('.underline.font-bold');
  const btn = document.getElementById('langToggle');
  const btnMobile = document.getElementById('langToggle-mobile');

  if (navH1) navH1.textContent = t.name;
  if (navP) navP.textContent = t.subtitle;
  if (navProjects) navProjects.textContent = t.projects;
  if (navAboutme) navAboutme.textContent = t.aboutme;
  if (navProjectsMobile) navProjectsMobile.textContent = t.projects;
  if (navAboutmeMobile) navAboutmeMobile.textContent = t.aboutme;
  if (available) available.textContent = t.available;
  if (btn) btn.textContent = lang === 'en' ? 'ITA' : 'ENG';
  if (btnMobile) btnMobile.textContent = lang === 'en' ? 'ITA' : 'ENG';

  document.querySelectorAll('.available-mobile').forEach(el => el.textContent = t.available);
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
    renderProjects();
    initFilters();
    updateClock();
    initThemeToggle();
    setInterval(updateClock, 60000);
    initLangToggle();
    initHamburger();
    document.body.classList.add('loaded');
});

