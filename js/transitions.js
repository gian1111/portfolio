// fade in all'entrata
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
});

// fade out all'uscita
document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;
        e.preventDefault();
        document.body.classList.remove('loaded');
        setTimeout(() => {
            window.location.href = href;
        }, 400);
    });
});