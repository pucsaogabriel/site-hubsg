/* ================================================================
   eventos.js — Lógica de filtro de categorias
   Projeto: HubSG — Hub de Inovação PUC Minas São Gabriel
================================================================ */

(function () {
    'use strict';

    const pills    = document.querySelectorAll('.filtro-pill');
    const cards    = document.querySelectorAll('.evento-card');
    const noResult = document.getElementById('no-results');

    /**
     * Filtra os cards de eventos conforme a categoria selecionada.
     * @param {string} filtro — valor do atributo data-filtro do pill ativo
     */
    function filtrarEventos(filtro) {
        let visiveis = 0;

        cards.forEach(function (card) {
            const categoria = card.dataset.categoria;
            const mostrar   = filtro === 'todos' || categoria === filtro;

            if (mostrar) {
                card.style.display = '';
                card.removeAttribute('aria-hidden');
                visiveis++;
            } else {
                card.style.display = 'none';
                card.setAttribute('aria-hidden', 'true');
            }
        });

        /* Exibe mensagem de nenhum resultado se necessário */
        if (noResult) {
            if (visiveis === 0) {
                noResult.hidden = false;
            } else {
                noResult.hidden = true;
            }
        }
    }

    /**
     * Atualiza os estados aria-pressed e a classe "active" dos pills.
     * @param {HTMLElement} pillAtivo — o botão que foi clicado
     */
    function atualizarPills(pillAtivo) {
        pills.forEach(function (pill) {
            const eAtivo = pill === pillAtivo;
            pill.classList.toggle('active', eAtivo);
            pill.setAttribute('aria-pressed', eAtivo ? 'true' : 'false');
        });
    }

    /* --- Inicialização: adiciona listener em cada pill --- */
    pills.forEach(function (pill) {
        pill.addEventListener('click', function () {
            const filtro = pill.dataset.filtro;
            atualizarPills(pill);
            filtrarEventos(filtro);
        });
    });

}());

async function RenderizarCardsEventos() {
    const container = document.getElementById('eventos-grid');

    const res = await fetch('../src/db/data.json');
    const data = await res.json();

    const eventos = data.eventos;

    let cards = '';

    eventos.forEach((d, i) => {
        cards += `
            <article
                        class="evento-card ${IsDestaqueClass(d)}"
                        data-categoria="${d.categoria}"
                        role="listitem"
                        aria-label="${d.categoria}: ${d.titulo}">
                        <div class="card-img-wrapper">
                            <img
                                src="${d.img}"
                                alt="${d.titulo}"
                                loading="lazy">
                            <!-- Badge de categoria -->
                            <span class="card-categoria-badge badge-${d.categoria}" aria-label="Categoria: ${d.categoria}">
                                <i class="fas fa-${VerificarLogoCategoria(d.categoria)}"></i> ${d.categoria}
                            </span> 
                            ${IsDestaqueTag(d)}
                            
                        </div>
                        <!-- Badge de data sobreposto -->
                        <div class="card-date-badge" aria-label="Data: ${d.dia} de ${d.mes}">
                            <span class="date-day">${d.dia}</span>
                            <span class="date-month">${d.mes}</span>
                        </div>
                        <div class="card-body">
                            <h3 class="card-title">${d.titulo}</h3>
                            <ul class="card-meta" aria-label="Detalhes do evento">
                                <li>
                                    <i class="fas fa-clock" aria-hidden="true"></i>
                                    <time datetime="2026-${d.mes}-${d.dia}T${d.horaInicio}">${d.horaInicio} – ${d.horaTermino}</time>
                                </li>
                                <li>
                                    <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                                    <span>${d.local}</span>
                                </li>
                            </ul>
                            <p class="card-desc">
                                ${d.descricao}
                            </p>
                            <a href="${d.link}" target="_blank" class="btn-saiba-mais card-cta"
                                aria-label="Inscreva-se no ${d.titulo}">
                                Inscreva-se
                                <i class="fas fa-arrow-right" aria-hidden="true"></i>
                            </a>
                        </div>
                    </article>
    `;
    });

    container.innerHTML = cards;

}
RenderizarCardsEventos();

const categorias = ['workshop', 'palestra', 'hackathon', 'networking'];
const iconesCategorias = ['tools', 'microphone-alt', 'code', 'users'];
function VerificarLogoCategoria(cat){
    let pos = 0;
    while(cat != categorias[pos]){
        pos++;
    }
    return iconesCategorias[pos];
}

function IsDestaqueClass(card){
    let resp = "";
    if (card.destaque){
        resp = `card-destaque`
    }

    return resp;    
    
}

function IsDestaqueTag(card){
    let resp = "";
    if (card.destaque){
        resp = `<div class="card-destaque-tag" aria-label="Evento em destaque">
                    <i class="fas fa-star"></i> Destaque
                </div>`
    }

    return resp;    
    
}
