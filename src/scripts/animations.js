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


// ================= ANIMAÇÃO SCROLL =================
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


// ================= FLIP MOBILE =================
function ativarFlipMobile() {
    document.querySelectorAll('.team-card').forEach(card => {
        card.addEventListener('click', () => {
            card.querySelector('.card-inner').classList.toggle('flip');
        });
    });
}


// ================= CARROSSEL =================
function ativarCarousel() {
    const track = document.querySelector('.carousel-track');
    const next = document.querySelector('.next');
    const prev = document.querySelector('.prev');

    function getCardWidth() {
        const card = track.querySelector('.team-card');
        const gap = 30; // igual ao CSS
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

    /*FUNCIONAL, CARROSSEL V1.0
    const cardWidth = 320; // largura + gap
    let scrollAmount = 0;
  
    next.addEventListener('click', () => {
      scrollAmount += cardWidth * 3;
      track.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    });
  
    prev.addEventListener('click', () => {
      scrollAmount -= cardWidth * 3;
      track.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    });*/
}

function getCardsPerView() {
    if (window.innerWidth < 600) return 1;
    if (window.innerWidth < 900) return 2;
    return 3;
}

function ativarDrag() {
    const track = document.querySelector('.carousel-track');

    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => isDown = false);
    track.addEventListener('mouseup', () => isDown = false);

    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.5;
        track.scrollLeft = scrollLeft - walk;
    });
}

