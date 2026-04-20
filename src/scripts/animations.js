// Animações de scroll: revela elementos gradualmente conforme o usuário rola a página.
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // O elemento é considerado visível quando 15% dele está na tela.
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // A animação só precisa ocorrer uma vez. Desativar o observer melhora a performance.
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Seleciona todos os elementos que devem ser animados ao aparecer na tela.
document.querySelectorAll('.animate-on-scroll, .slide-in-right').forEach((el) => {
    observer.observe(el);
});