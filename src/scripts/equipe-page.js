/**
 * equipe-page.js — Página dedicada da Equipe | HubSG
 *
 * Busca os membros em data.json, renderiza os cards no CSS Grid
 * e inicializa as interações: flip 3D, animações de scroll e hero.
 */

(async function iniciarPaginaEquipe() {

    const grid    = document.getElementById('equipe-page-grid');
    const loading = document.getElementById('equipe-loading');

    const DATA_URL        = '../src/db/data.json';
    const AVATAR_FALLBACK = '../src/assets/images/equipe/default-avatar.jpg';

    // Fetch dos dados
    let equipe = [];
    try {
        const res = await fetch(DATA_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        equipe = data.equipe ?? [];
    } catch (err) {
        console.error('[equipe-page.js] Erro ao carregar data.json:', err);
        loading.innerHTML = `
            <i class="fas fa-exclamation-circle" style="color:#e74c3c;"></i>
            <span>Não foi possível carregar a equipe. Tente novamente.</span>
        `;
        return;
    }

    // Geração do HTML dos cards
    const cardsHTML = equipe.map((membro, i) => {
        const imgSrc = membro.img ? `../${membro.img}` : AVATAR_FALLBACK;
        const delay  = Math.min(i * 0.08, 0.8);

        // Links sociais renderizados condicionalmente
        const linkedinHTML = membro.linkedin
            ? `<a href="${membro.linkedin}" target="_blank" rel="noopener noreferrer"
                  aria-label="LinkedIn de ${membro.nome}" class="team-social-link">
                   <i class="fab fa-linkedin"></i>
               </a>`
            : '';

        const githubHTML = membro.github
            ? `<a href="${membro.github}" target="_blank" rel="noopener noreferrer"
                  aria-label="GitHub de ${membro.nome}" class="team-social-link">
                   <i class="fab fa-github"></i>
               </a>`
            : '';

        // Fallback para membros sem cargo definido
        const funcao = (!membro.funcao || membro.funcao === '?')
            ? 'Membro HubSG'
            : membro.funcao;

        return `
        <div class="team-card animate-on-scroll"
             role="listitem"
             aria-label="Card de ${membro.nome}"
             style="animation-delay: ${delay}s; transition-delay: ${delay}s;">

            <div class="card-inner">

                <div class="card-front">
                    <img
                        src="${imgSrc}"
                        alt="Foto de ${membro.nome}"
                        class="team-photo"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='${AVATAR_FALLBACK}';"
                    >
                    <h3 class="team-name">${membro.nome}</h3>
                    <p class="team-role">${funcao}</p>
                </div>

                <div class="card-back">
                    <img
                        src="${imgSrc}"
                        alt="Foto de ${membro.nome}"
                        class="team-photo"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='${AVATAR_FALLBACK}';"
                    >
                    <h3 class="team-name-back">${membro.nome}</h3>
                    <p class="team-role-back">${funcao}</p>

                    ${(linkedinHTML || githubHTML) ? `
                    <div class="team-socials">
                        ${linkedinHTML}
                        ${githubHTML}
                    </div>` : ''}
                </div>

            </div>
        </div>`;
    }).join('');

    loading.classList.add('hidden');
    grid.insertAdjacentHTML('beforeend', cardsHTML);

    ativarFlipPorClique();
    ativarAnimacoesScroll();
    ativarHero();

})();


/**
 * Habilita o flip 3D por clique/tap nos cards do grid.
 * Em desktop o flip ocorre via CSS :hover; em touch, via JS.
 */
function ativarFlipPorClique() {
    document.querySelectorAll('#equipe-page-grid .team-card').forEach(card => {
        card.addEventListener('click', () => {
            const inner = card.querySelector('.card-inner');
            inner.classList.toggle('flip');
        });
    });
}


/**
 * Registra o IntersectionObserver nos cards e nos elementos estáticos
 * da seção. Cada elemento é observado uma única vez.
 */
function ativarAnimacoesScroll() {
    const elements = document.querySelectorAll(
        '#equipe-page-grid .animate-on-scroll, .equipe-section-header.animate-on-scroll, .equipe-cta-content.animate-on-scroll'
    );

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    elements.forEach(el => obs.observe(el));
}


/**
 * Dispara a animação de entrada do hero imediatamente após o render.
 */
function ativarHero() {
    document.querySelectorAll('.animate-hero').forEach(el => {
        requestAnimationFrame(() => el.classList.add('visible'));
    });
}
