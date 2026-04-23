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
