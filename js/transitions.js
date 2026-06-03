// fade out all'uscita
document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;
    e.preventDefault();
    document.body.classList.remove('loaded');
    setTimeout(() => {
        window.location.href = href;
    }, 220);
});