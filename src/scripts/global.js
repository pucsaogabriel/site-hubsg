// ============================================================
//  global.js — Comportamento global do Header | HubSG
// ============================================================

const menuToggle = document.getElementById('mobile-menu');
const navLinks   = document.getElementById('nav-links');

// Abre/fecha o menu mobile
menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');

    menuToggle.setAttribute('aria-expanded', isOpen);

    const icon = menuToggle.querySelector('i');
    if (icon) {
        icon.className = isOpen ? 'fas fa-xmark' : 'fas fa-bars';
    }
});

// Fecha ao clicar em um link de navegação
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        const icon = menuToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
    });
});

// Fecha ao clicar fora do menu
document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        const icon = menuToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
    }
});

// Adiciona .scrolled ao header após 60px de scroll
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });