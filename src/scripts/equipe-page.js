// ============================================================
//  equipe-page.js — Página dedicada da Equipe | HubSG
//  Responsabilidades:
//    · Fetch do data.json e renderização no CSS Grid
//    · Flip 3D por clique/tap (sem lógica de carrossel)
//    · Animações de entrada via IntersectionObserver
//    · Fallback de imagem e links sociais condicionais
// ============================================================

(async function iniciarPaginaEquipe() {

    const grid    = document.getElementById('equipe-page-grid');
    const loading = document.getElementById('equipe-loading');

    // ── 1. Caminho relativo correto a partir de pages/ ──────────
    const DATA_URL    = '../src/db/data.json';
    const AVATAR_FALLBACK = '../src/assets/images/equipe/default-avatar.jpg';

    // ── 2. Fetch dos dados ──────────────────────────────────────
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

    // ── 3. Geração do HTML dos cards ────────────────────────────
    /*
      Reutilizamos a mesma estrutura de card do equipe.css (card-front/card-back).
      Diferenças desta versão:
        · Caminhos de imagem ajustados para pages/ (../ prefix)
        · Links sociais só renderizados se existirem no JSON
        · Delay de animação escalonado por índice (máx ~0.8s)
    */
    const cardsHTML = equipe.map((membro, i) => {
        const imgSrc   = membro.img   ? `../${membro.img}` : AVATAR_FALLBACK;
        const delay    = Math.min(i * 0.08, 0.8); // Limite de 0.8s para não demorar demais

        // Links sociais — só renderiza o ícone se a URL existir
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

        // Cargo: fallback para "Membro" se funcao for "?" ou vazio
        const funcao = (!membro.funcao || membro.funcao === '?')
            ? 'Membro HubSG'
            : membro.funcao;

        return `
        <div class="team-card animate-on-scroll"
             role="listitem"
             aria-label="Card de ${membro.nome}"
             style="animation-delay: ${delay}s; transition-delay: ${delay}s;">

            <div class="card-inner">

                <!-- FRENTE: glassmorphism -->
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

                <!-- VERSO: gradiente azul profundo -->
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

    // ── 4. Injeta no grid e remove o loading ───────────────────
    loading.classList.add('hidden');
    grid.insertAdjacentHTML('beforeend', cardsHTML);

    // ── 5. Flip por tap/click (essencial em mobile) ────────────
    ativarFlipPorClique();

    // ── 6. Animações de entrada via IntersectionObserver ────────
    ativarAnimacoesScroll();

    // ── 7. Dispara animação do hero ─────────────────────────────
    ativarHero();

})();


// ── FLIP por clique/tap ──────────────────────────────────────
/*
  Em desktop o flip acontece via CSS :hover.
  Em mobile (touch), o hover não persiste, então usamos JS
  para alternar a classe .flip no .card-inner ao clicar.
  Clique duplo no mesmo card desfaz o flip.
*/
function ativarFlipPorClique() {
    document.querySelectorAll('#equipe-page-grid .team-card').forEach(card => {
        card.addEventListener('click', () => {
            const inner = card.querySelector('.card-inner');
            inner.classList.toggle('flip');
        });
    });
}


// ── IntersectionObserver para .animate-on-scroll ────────────
function ativarAnimacoesScroll() {
    const elements = document.querySelectorAll(
        '#equipe-page-grid .animate-on-scroll, .equipe-section-header.animate-on-scroll, .equipe-cta-content.animate-on-scroll'
    );

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target); // Observa apenas uma vez
            }
        });
    }, { threshold: 0.12 });

    elements.forEach(el => obs.observe(el));
}


// ── Animação do hero (dispara imediatamente) ─────────────────
function ativarHero() {
    document.querySelectorAll('.animate-hero').forEach(el => {
        requestAnimationFrame(() => el.classList.add('visible'));
    });
}
