let isNavigating = false;

// ripristina la visibilità quando si torna indietro (incl. bfcache),
// altrimenti la classe "leaving" resta attiva e la pagina appare bianca
window.addEventListener('pageshow', () => {
    isNavigating = false;
    document.body.classList.remove('leaving');
});

// fade out all'uscita
document.addEventListener('click', e => {
    // lascia passare nuova scheda / click centrale / modificatori
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const link = e.target.closest('a[href]');
    if (!link) return;
    if (link.target && link.target !== '_self') return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;

    e.preventDefault();
    if (isNavigating) return;          // evita doppia navigazione
    isNavigating = true;
    document.body.classList.add('leaving');
    setTimeout(() => {
        window.location.href = href;
    }, 180);
});