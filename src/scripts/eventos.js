/* ================================================================
   eventos.js — Renderização e filtro de eventos | HubSG
   Projeto: HubSG — Hub de Inovação PUC Minas São Gabriel

   CORREÇÃO CRÍTICA:
   A versão anterior capturava `const cards = querySelectorAll()`
   ANTES do fetch/render assíncrono, resultando em NodeList vazia.
   Agora toda a lógica de filtro é inicializada APÓS o await,
   garantindo que os cards já existam no DOM ao ser capturados.
================================================================ */

'use strict';

// ── Utilitários de template ──────────────────────────────────
const categorias      = ['workshop', 'palestra', 'hackathon', 'networking'];
const iconesCategorias = ['tools', 'microphone-alt', 'code', 'users'];

function iconeCategoria(cat) {
    const idx = categorias.indexOf(cat);
    return idx >= 0 ? iconesCategorias[idx] : 'calendar';
}

function classeDestaque(evento) {
    return evento.destaque ? 'card-destaque' : '';
}

function tagDestaque(evento) {
    if (!evento.destaque) return '';
    return `<div class="card-destaque-tag" aria-label="Evento em destaque">
                <i class="fas fa-star"></i> Destaque
            </div>`;
}

// ── Renderização dos cards via fetch ─────────────────────────
async function RenderizarCardsEventos() {
    const container = document.getElementById('eventos-grid');
    if (!container) return;

    let eventos = [];
    try {
        const res = await fetch('../src/db/data.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        eventos = data.eventos ?? [];
    } catch (err) {
        console.error('[eventos.js] Erro ao carregar data.json:', err);
        container.innerHTML = `
            <p style="grid-column:1/-1;text-align:center;color:#6c757d;padding:40px 0;">
                Não foi possível carregar os eventos. Tente novamente.
            </p>`;
        return;
    }

    // Monta o HTML de todos os cards
    const cardsHTML = eventos.map((d, i) => `
        <article
            class="evento-card ${classeDestaque(d)}"
            data-categoria="${d.categoria}"
            role="listitem"
            aria-label="${d.categoria}: ${d.titulo}"
            style="animation-delay: ${i * 0.08}s;">

            <div class="card-img-wrapper">
                <img src="../${d.img}" alt="${d.titulo}" loading="lazy">
                <span class="card-categoria-badge badge-${d.categoria}"
                      aria-label="Categoria: ${d.categoria}">
                    <i class="fas fa-${iconeCategoria(d.categoria)}"></i>
                    ${d.categoria}
                </span>
                ${tagDestaque(d)}
            </div>

            <div class="card-date-badge" aria-label="Data: ${d.dia} de ${d.mes}">
                <span class="date-day">${d.dia}</span>
                <span class="date-month">${d.mes}</span>
            </div>

            <div class="card-body">
                <h3 class="card-title">${d.titulo}</h3>
                <ul class="card-meta" aria-label="Detalhes do evento">
                    <li>
                        <i class="fas fa-clock" aria-hidden="true"></i>
                        <time>${d.horaInicio} – ${d.horaTermino}</time>
                    </li>
                    <li>
                        <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                        <span>${d.local}</span>
                    </li>
                </ul>
                <p class="card-desc">${d.descricao}</p>
                <a href="${d.link}" target="_blank" rel="noopener noreferrer"
                   class="btn-saiba-mais card-cta"
                   aria-label="Inscreva-se em: ${d.titulo}">
                    Inscreva-se
                    <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </a>
            </div>
        </article>
    `).join('');

    container.innerHTML = cardsHTML;

    /*
      CORREÇÃO DO BUG DE FILTRO:
      Só inicializamos o filtro AQUI, depois do innerHTML ser preenchido.
      Agora querySelectorAll('.evento-card') retorna os cards reais, não
      uma NodeList vazia como acontecia quando era chamada no topo do arquivo.
    */
    inicializarFiltros();

    // Dispara animação do hero (aguarda um frame para garantir render)
    requestAnimationFrame(() => {
        document.querySelectorAll('.animate-hero').forEach(el => el.classList.add('visible'));
    });
}

// ── Lógica de filtro por categoria ──────────────────────────
function inicializarFiltros() {
    const pills    = document.querySelectorAll('.filtro-pill');
    const cards    = document.querySelectorAll('.evento-card');   // ← Capturado APÓS render
    const noResult = document.getElementById('no-results');

    /**
     * Mostra/oculta cards conforme o filtro ativo.
     * Usa CSS transition via classe para animar a saída de forma suave.
     */
    function filtrarEventos(filtro) {
        let visiveis = 0;

        cards.forEach(card => {
            const mostrar = filtro === 'todos' || card.dataset.categoria === filtro;

            if (mostrar) {
                card.style.display = '';
                card.removeAttribute('aria-hidden');
                visiveis++;
            } else {
                card.style.display = 'none';
                card.setAttribute('aria-hidden', 'true');
            }
        });

        if (noResult) {
            noResult.hidden = visiveis > 0;
        }
    }

    /**
     * Atualiza o estado visual e aria dos pills.
     */
    function atualizarPills(pillAtivo) {
        pills.forEach(pill => {
            const ativo = pill === pillAtivo;
            pill.classList.toggle('active', ativo);
            pill.setAttribute('aria-pressed', ativo ? 'true' : 'false');
        });
    }

    // Adiciona listener em cada pill
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            atualizarPills(pill);
            filtrarEventos(pill.dataset.filtro);
        });
    });
}

// ── Inicializa tudo ──────────────────────────────────────────
RenderizarCardsEventos();
