// ============================================================
//  home-hero.js — Hero Section Dinâmica | HubSG
//  Responsabilidade: Puxar o evento com destaque: true do
//  data.json e atualizar os overlays do hero da home com
//  os dados reais (imagem, categoria, título, dia e mês).
//
//  Graceful Fallback: se o fetch falhar ou não houver evento
//  em destaque, o HTML estático original é mantido intacto.
// ============================================================

(async function carregarEventoDestaque() {
    'use strict';

    // ── 1. Referências aos elementos do DOM ─────────────────
    const elImg = document.getElementById('hero-destaque-img');
    const elLabel = document.getElementById('hero-badge-label');
    const elValue = document.getElementById('hero-badge-value');
    const elDia = document.getElementById('hero-badge-dia');
    const elMes = document.getElementById('hero-badge-mes');
    const elBtnCta = document.getElementById('btn-hero-destaque');

    // Verifica se estamos na home (elementos devem existir)
    if (!elImg || !elLabel || !elValue) return;

    // ── 2. Fetch do data.json ────────────────────────────────
    let destaque = null;
    try {
        const res = await fetch('src/db/data.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Filtra o primeiro evento com destaque: true
        destaque = (data.eventos ?? []).find(e => e.destaque === true) ?? null;
    } catch (err) {
        // Fetch falhou — mantém o HTML estático original
        console.warn('[home-hero.js] Não foi possível carregar o evento em destaque:', err.message);
        return;
    }

    // Sem destaque no JSON — mantém o HTML estático original
    if (!destaque) return;

    // ── 3. Capitaliza a categoria (ex: "hackathon" → "Hackathon") ──
    const categoriaLabel = destaque.categoria
        ? destaque.categoria.charAt(0).toUpperCase() + destaque.categoria.slice(1)
        : 'Evento';

    // ── 4. Atualização do DOM com transição suave ────────────
    /*
      Usamos opacity para fazer um crossfade suave:
      1. Fade out dos elementos (opacity: 0)
      2. Troca dos dados (não visível ao usuário)
      3. Fade in com os novos dados (opacity: 1)
    */
    const elementos = [elImg, elLabel, elValue, elDia, elMes];
    const FADE_MS = 300; // duração do fade em ms

    // Aplica transição de opacity em todos os elementos
    elementos.forEach(el => {
        el.style.transition = `opacity ${FADE_MS}ms ease`;
        el.style.opacity = '0';
    });

    // Aguarda o fade out terminar antes de trocar os dados
    await new Promise(r => setTimeout(r, FADE_MS));

    // ── 4a. Imagem ───────────────────────────────────────────
    /*
      O JSON usa caminhos relativos à raiz do projeto (src/...).
      A home (index.html) está na raiz, então o caminho já está correto.
    */
    elImg.src = destaque.img;
    elImg.alt = `Imagem do evento: ${destaque.titulo}`;

    // ── 4b. Badge Glassmorphism ──────────────────────────────
    elLabel.textContent = categoriaLabel;  // Ex: "Hackathon"
    elValue.textContent = destaque.titulo; // Ex: "Hackathon Varejo Inteligente"

    // ── 4c. Selo de data ─────────────────────────────────────
    if (elDia && elMes && destaque.dia && destaque.mes) {
        elDia.textContent = destaque.dia;  // Ex: "29"
        elMes.textContent = destaque.mes;  // Ex: "ABR"
    }

    // ── 4d. Botão CTA ────────────────────────────────────────
    /*
      Se o evento tem um link de inscrição válido, o botão
      primário passa a apontar diretamente para ele.
      Caso contrário, mantém o href para pages/eventos.html.
    */
    if (elBtnCta && destaque.link && destaque.link.length > 4) {
        elBtnCta.href = destaque.link;
        elBtnCta.target = '_blank';
        elBtnCta.rel = 'noopener noreferrer';
        // Atualiza o texto e ícone do botão
        elBtnCta.innerHTML = `
            <i class="fas fa-ticket-alt" aria-hidden="true"></i>
            Inscreva-se
        `;
        elBtnCta.setAttribute('aria-label', `Inscreva-se em: ${destaque.titulo}`);
    }

    // ── 5. Fade in com os dados novos ────────────────────────
    elementos.forEach(el => {
        el.style.opacity = '1';
    });

    // ── 6. Adiciona tooltip no badge com o título completo ───
    const badge = document.getElementById('hero-destaque-badge');
    if (badge) {
        badge.title = `Evento em Destaque: ${destaque.titulo}`;
    }

    // ── 7. Adiciona aria-label atualizado ao badge de data ───
    const badgeData = document.getElementById('hero-destaque-data');
    if (badgeData && destaque.dia && destaque.mes) {
        badgeData.setAttribute(
            'aria-label',
            `Data do evento: ${destaque.dia} de ${destaque.mes}`
        );
    }

})();
