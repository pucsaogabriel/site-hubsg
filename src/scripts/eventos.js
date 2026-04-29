/**
 * eventos.js — Renderização e filtro de eventos | HubSG
 *
 * Busca os eventos em data.json, injeta os cards no grid e
 * inicializa os filtros por categoria após o render assíncrono.
 */

'use strict';

// Mapeamento de categorias para ícones Font Awesome
const categorias       = ['workshop', 'palestra', 'hackathon', 'networking'];
const iconesCategorias = ['tools', 'microphone-alt', 'code', 'users'];

/**
 * Retorna o ícone Font Awesome correspondente à categoria do evento.
 * @param {string} cat - Slug da categoria
 * @returns {string} Nome do ícone (sem prefixo "fa-")
 */
function iconeCategoria(cat) {
    const idx = categorias.indexOf(cat);
    return idx >= 0 ? iconesCategorias[idx] : 'calendar';
}

/**
 * Retorna a classe CSS de destaque do card, se aplicável.
 * @param {Object} evento
 * @returns {string}
 */
function classeDestaque(evento) {
    return evento.destaque ? 'card-destaque' : '';
}

/**
 * Retorna o HTML da tag de destaque do card, se aplicável.
 * @param {Object} evento
 * @returns {string}
 */
function tagDestaque(evento) {
    if (!evento.destaque) return '';
    return `<div class="card-destaque-tag" aria-label="Evento em destaque">
                <i class="fas fa-star"></i> Destaque
            </div>`;
}

function marcarEventoMaisProximo(eventos) {
    if (!Array.isArray(eventos) || eventos.length === 0) return eventos;

    // Data atual no fuso do Brasil
    const agoraBR = new Date(
        new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    );

    let eventoMaisProximo = null;
    let menorDiff = Infinity;

    eventos.forEach(evento => {
        // Monta data completa (ajuste aqui se seu JSON tiver outro formato)
        // Exemplo assumido: evento.data = "2026-05-02"
        const [ano, mes, dia] = evento.dataCompleta.split('-').map(Number);
        const dataEvento = new Date(ano, mes - 1, dia);

        // Zera horário para incluir eventos de hoje
        const dataEventoZerada = new Date(dataEvento);
        dataEventoZerada.setHours(0, 0, 0, 0);

        const hojeZerado = new Date(agoraBR);
        hojeZerado.setHours(0, 0, 0, 0);

        const diff = dataEventoZerada - hojeZerado;

        // Ignora eventos passados
        if (diff < 0) return;

        if (diff < menorDiff) {
            menorDiff = diff;
            eventoMaisProximo = evento;
        }
    });

    // Limpa destaques antigos (garante consistência)
    eventos.forEach(e => e.destaque = false);

    if (eventoMaisProximo) {
        eventoMaisProximo.destaque = true;
    }

    return eventos;
}

/**
 * Busca os eventos em data.json, renderiza os cards no grid
 * e inicializa os filtros por categoria.
 * Os filtros são inicializados após o render para garantir que
 * querySelectorAll retorne os cards já presentes no DOM.
 */
async function RenderizarCardsEventos() {
    const container = document.getElementById('eventos-grid');
    if (!container) return;

    let eventos = [];
    try {
        const res = await fetch('../src/db/data.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        eventos = data.eventos ?? [];
        eventos = marcarEventoMaisProximo(eventos);
    } catch (err) {
        console.error('[eventos.js] Erro ao carregar data.json:', err);
        container.innerHTML = `
            <p style="grid-column:1/-1;text-align:center;color:#6c757d;padding:40px 0;">
                Não foi possível carregar os eventos. Tente novamente.
            </p>`;
        return;
    }

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

    inicializarFiltros();

    requestAnimationFrame(() => {
        document.querySelectorAll('.animate-hero').forEach(el => el.classList.add('visible'));
    });
}

/**
 * Inicializa os filtros por categoria.
 * Deve ser chamado após o render dos cards para que
 * querySelectorAll retorne os nós corretos.
 */
function inicializarFiltros() {
    const pills    = document.querySelectorAll('.filtro-pill');
    const cards    = document.querySelectorAll('.evento-card');
    const noResult = document.getElementById('no-results');

    /**
     * Exibe ou oculta cards conforme o filtro selecionado.
     * @param {string} filtro - Slug da categoria ou "todos"
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
     * Atualiza estado visual e aria-pressed das pills de filtro.
     * @param {HTMLElement} pillAtivo - Pill que foi clicada
     */
    function atualizarPills(pillAtivo) {
        pills.forEach(pill => {
            const ativo = pill === pillAtivo;
            pill.classList.toggle('active', ativo);
            pill.setAttribute('aria-pressed', ativo ? 'true' : 'false');
        });
    }

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            atualizarPills(pill);
            filtrarEventos(pill.dataset.filtro);
        });
    });
}

RenderizarCardsEventos();
