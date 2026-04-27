/**
 * animations.js — Animações de scroll e renderização do carrossel da Home | HubSG
 *
 * Inicializa o IntersectionObserver para `.animate-on-scroll`,
 * busca os dados da equipe em data.json e monta os cards no
 * carrossel da home com suporte a flip 3D, drag e navegação por botões.
 */

// ================================================================
//  INTERSECTION OBSERVER GLOBAL
// ================================================================

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15,
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll, .slide-in-right').forEach((el) => {
    observer.observe(el);
});


// ================================================================
//  RENDERIZAÇÃO DOS CARDS DA EQUIPE
// ================================================================

/**
 * Busca a lista de membros em data.json e injeta os cards
 * do carrossel da home. Após o render, inicializa as interações.
 */
async function RenderizarCardsEquipe() {
    const container = document.getElementById('team-grid');

    const res = await fetch('src/db/data.json');
    const data = await res.json();

    const equipe = data.equipe;

    let cards = '';

    equipe.forEach((d, i) => {
        cards += `
      <div class="team-card animate-on-scroll" style="transition-delay: 0.${i + 1}s;">
        <div class="card-inner">

          <div class="card-front">
            <img src="${d.img}" alt="${d.nome}" class="team-photo" onerror="this.onerror=null;this.src='src/assets/images/equipe/default-avatar.jpg';">
            <h3 class="team-name">${d.nome}</h3>
            <p class="team-role">${d.funcao}</p>
          </div>

          <div class="card-back">
            <img src="${d.img}" alt="${d.nome}" class="team-photo" onerror="this.onerror=null;this.src='src/assets/images/equipe/default-avatar.jpg';">
            <h3 class="team-name-back">${d.nome}</h3>
            <p class="team-role-back">${d.funcao}</p>
            <div class="social-links">
                <a href="${d.linkedin}" aria-label="linkedin"><i class="fab fa-linkedin"></i></a>
                <a href="${d.github}" aria-label="github"><i class="fab fa-github"></i></a>
            </div>
          </div>

        </div>
      </div>
    `;
    });

    container.innerHTML = cards;

    ativarAnimacaoScroll();
    ativarFlipMobile();
    ativarCarousel();
    ativarDrag();
}

RenderizarCardsEquipe();


// ================================================================
//  INTERAÇÕES
// ================================================================

/**
 * Re-registra o IntersectionObserver nos cards injetados via JS.
 */
function ativarAnimacaoScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    });

    elements.forEach(el => observer.observe(el));
}


/**
 * Habilita o flip 3D por clique/tap nos cards do carrossel.
 * Cliques em links sociais são ignorados.
 */
function ativarFlipMobile() {
    document.querySelectorAll('.team-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            card.querySelector('.card-inner').classList.toggle('flip');
        });
    });
}


/**
 * Inicializa a navegação por botões prev/next do carrossel.
 */
function ativarCarousel() {
    const track = document.querySelector('.carousel-track');
    const next  = document.querySelector('.next');
    const prev  = document.querySelector('.prev');

    function getCardWidth() {
        const card = track.querySelector('.team-card');
        const gap = 30;
        return card.offsetWidth + gap;
    }

    next.addEventListener('click', () => {
        track.scrollBy({
            left: getCardWidth() * getCardsPerView(),
            behavior: 'smooth'
        });
    });

    prev.addEventListener('click', () => {
        track.scrollBy({
            left: -getCardWidth() * getCardsPerView(),
            behavior: 'smooth'
        });
    });
}

/**
 * Retorna o número de cards visíveis por breakpoint.
 * @returns {number}
 */
function getCardsPerView() {
    if (window.innerWidth < 600) return 1;
    if (window.innerWidth < 900) return 2;
    return 3;
}

/**
 * Habilita scroll por drag (mouse) no carousel-track.
 * Distingue drag de clique simples via DRAG_THRESHOLD para não
 * acionar o flip dos cards ao arrastar.
 */
function ativarDrag() {
    const track = document.querySelector('.carousel-track');

    let isDown    = false;
    let hasDragged = false;
    let startX;
    let scrollLeft;
    const DRAG_THRESHOLD = 5; // px mínimos para considerar como drag

    track.addEventListener('mousedown', (e) => {
        isDown     = true;
        hasDragged = false;
        startX     = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => isDown = false);
    track.addEventListener('mouseup',    () => isDown = false);

    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x    = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(x - startX) > DRAG_THRESHOLD) {
            hasDragged = true;
        }
        track.scrollLeft = scrollLeft - walk;
    });

    // Intercepta na fase de captura para cancelar o flip após drag
    track.addEventListener('click', (e) => {
        if (hasDragged) {
            e.stopPropagation();
            hasDragged = false;
        }
    }, true);
}
