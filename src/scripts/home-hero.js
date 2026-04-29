/**
 * home-hero.js — Hero Section Dinâmica | HubSG
 *
 * Busca o evento com `destaque: true` em data.json e atualiza
 * os overlays do hero (imagem, badge, data, botão CTA).
 *
 * Graceful fallback: se o fetch falhar ou não houver evento em
 * destaque, o conteúdo estático do HTML é mantido intacto.
 */

(async function carregarEventoDestaque() {
    'use strict';

    // Referências ao DOM
    const elImg    = document.getElementById('hero-destaque-img');
    const elLabel  = document.getElementById('hero-badge-label');
    const elValue  = document.getElementById('hero-badge-value');
    const elDia    = document.getElementById('hero-badge-dia');
    const elMes    = document.getElementById('hero-badge-mes');
    const elBtnCta = document.getElementById('btn-hero-destaque');

    if (!elImg || !elLabel || !elValue) return;

    // Fetch do data.json
    let destaque = null;
    try {
        const res = await fetch('src/db/data.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        let eventos = data.eventos ?? [];
        eventos = marcarEventoMaisProximo(eventos);
        destaque = (eventos ?? []).find(e => e.destaque === true) ?? null;
    } catch (err) {
        console.warn('[home-hero.js] Não foi possível carregar o evento em destaque:', err.message);
        return;
    }

    if (!destaque) return;

    // Capitaliza a categoria (ex: "hackathon" → "Hackathon")
    const categoriaLabel = destaque.categoria
        ? destaque.categoria.charAt(0).toUpperCase() + destaque.categoria.slice(1)
        : 'Evento';

    // Crossfade suave: fade out → troca de dados → fade in
    const elementos = [elImg, elLabel, elValue, elDia, elMes];
    const FADE_MS = 300;

    elementos.forEach(el => {
        el.style.transition = `opacity ${FADE_MS}ms ease`;
        el.style.opacity = '0';
    });

    await new Promise(r => setTimeout(r, FADE_MS));

    // Atualiza imagem
    elImg.src = destaque.img;
    elImg.alt = `Imagem do evento: ${destaque.titulo}`;

    // Atualiza badge glassmorphism
    elLabel.textContent = categoriaLabel;
    elValue.textContent = destaque.titulo;

    // Atualiza selo de data
    if (elDia && elMes && destaque.dia && destaque.mes) {
        elDia.textContent = destaque.dia;
        elMes.textContent = destaque.mes;
    }

    // Atualiza botão CTA se o evento tiver link de inscrição válido
    if (elBtnCta && destaque.link && destaque.link.length > 4) {
        elBtnCta.href = destaque.link;
        elBtnCta.target = '_blank';
        elBtnCta.rel = 'noopener noreferrer';
        elBtnCta.innerHTML = `
            <i class="fas fa-ticket-alt" aria-hidden="true"></i>
            Inscreva-se
        `;
        elBtnCta.setAttribute('aria-label', `Inscreva-se em: ${destaque.titulo}`);
    }

    // Fade in com os dados atualizados
    elementos.forEach(el => {
        el.style.opacity = '1';
    });

    // Tooltip no badge com título completo
    const badge = document.getElementById('hero-destaque-badge');
    if (badge) {
        badge.title = `Evento em Destaque: ${destaque.titulo}`;
    }

    // aria-label no badge de data
    const badgeData = document.getElementById('hero-destaque-data');
    if (badgeData && destaque.dia && destaque.mes) {
        badgeData.setAttribute(
            'aria-label',
            `Data do evento: ${destaque.dia} de ${destaque.mes}`
        );
    }

})();

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
