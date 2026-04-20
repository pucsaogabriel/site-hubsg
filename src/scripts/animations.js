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
      <div class="team-card animate-on-scroll" style="transition-delay: 0.${i+1}s;">
        <div class="card-inner">

          <div class="card-front">
            <img src="${d.img}" alt="${d.nome}" class="team-photo">
            <h3 class="team-name">${d.nome}</h3>
            <p class="team-role">${d.funcao}</p>
          </div>

          <div class="card-back">
            <p>Conecte-se comigo</p>
            <a href="${d.linkedin}" target="_blank">LinkedIn</a>
          </div>

        </div>
      </div>
    `;
  });

  container.innerHTML = cards;

  ativarAnimacaoScroll();
  ativarFlipMobile();
  ativarCarousel();
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

  const cardWidth = 320; // largura + gap
  let scrollAmount = 0;

  next.addEventListener('click', () => {
    scrollAmount += cardWidth * 3;
    track.scrollTo({ left: scrollAmount, behavior: 'smooth' });
  });

  prev.addEventListener('click', () => {
    scrollAmount -= cardWidth * 3;
    track.scrollTo({ left: scrollAmount, behavior: 'smooth' });
  });
}

/*function RenderizarCardsEquipe(){
    const container = document.getElementById('team-grid');
      fetch ('src/db/data.json') // aqui ele faz uma requisição ao jsonServer, para pegar os filmes que estão em db.json
        .then(res => res.json())
        .then(data => {
          let cards = '';
          const equipe = data.equipe;

          for (let i = 0; i < equipe.length; i++){ // percorre o array de filmes e adiciona cada filme do array a um card, de forma dinamica
            let d = equipe[i]
            console.log(d.nome);
            cards += `
              <div class="team-card animate-on-scroll" style="transition-delay: 0.${i+1}s;">
                        <img src="${d.img}" alt="Julio Cesar" class="team-photo">
                        <h3 class="team-name">${d.nome}</h3>
                        <p class="team-role">${d.funcao}</p>
                    </div>
            `;
              }
            container.innerHTML = cards;
            document.querySelectorAll('.animate-on-scroll, .slide-in-right').forEach((el) => {
    observer.observe(el);
});
            }); 
}


RenderizarCardsEquipe();*/