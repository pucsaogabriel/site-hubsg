// ============================================================
//  global.js — HubSG | Comportamento global do Header
// ============================================================

const menuToggle = document.getElementById('mobile-menu');
const navLinks   = document.getElementById('nav-links');

// ── Abre / fecha o menu mobile com animação CSS ──────────────
// O CSS usa opacity + translateY (não display:none), então
// basta alternar a classe .active para disparar a transição.
menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');

    // Atualiza aria-expanded para acessibilidade
    menuToggle.setAttribute('aria-expanded', isOpen);

    // Troca o ícone: bars ↔ xmark
    const icon = menuToggle.querySelector('i');
    if (icon) {
        icon.className = isOpen ? 'fas fa-xmark' : 'fas fa-bars';
    }
});

// ── Fecha o menu ao clicar em um link (UX mobile) ───────────
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        const icon = menuToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
    });
});

// ── Fecha o menu ao clicar fora dele ────────────────────────
document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        const icon = menuToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
    }
});

// ── Header compacto ao rolar (scroll shrink) ────────────────
// Adiciona a classe .scrolled ao header quando o usuário
// rola mais de 60px, permitindo ajuste visual via CSS se desejado.
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });