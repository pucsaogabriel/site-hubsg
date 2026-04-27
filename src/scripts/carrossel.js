/**
 * carrossel.js — Parceiros Carousel com Efeito Depth Focus | HubSG
 *
 * Aplica efeito de foco progressivo nos logos conforme passam pelo centro
 * da viewport, usando escala, opacidade e grayscale interpolados via rAF.
 *
 * Arquitetura de performance:
 *   - Leituras de getBoundingClientRect() em batch (evita layout thrashing)
 *   - Escritas de inline styles em batch separado
 *   - requestAnimationFrame sincronizado com o ciclo de repaint
 *   - ResizeObserver para atualizar o centro sem listeners de resize pesados
 *   - IntersectionObserver para pausar o rAF fora da viewport
 */

(function () {
    'use strict';

    /* ─── 1. REFERÊNCIAS ────────────────────────────────────────── */

    const carousel = document.querySelector('.logos-carousel');
    const track    = document.querySelector('.logos-track');

    if (!carousel || !track) return;

    /**
     * Lê o raio de influência do efeito a partir da CSS custom property
     * `--depth-radius` definida em `.parceiros`, permitindo ajuste por
     * breakpoint no CSS sem tocar no JS.
     * @returns {number} Raio em pixels (fallback: 280)
     */
    function getRadius() {
        const raw = getComputedStyle(carousel.closest('.parceiros') || document.documentElement)
            .getPropertyValue('--depth-radius')
            .trim();
        return raw ? parseFloat(raw) : 280;
    }

    let RADIUS = getRadius();

    const SCALE_MAX   = 1.22;
    const SCALE_MIN   = 1.0;
    const OPACITY_MAX = 1.0;
    const OPACITY_MIN = 0.45;
    const GRAY_MAX    = 100;
    const GRAY_MIN    = 0;

    /* ─── 2. DUPLICAÇÃO DE LOGOS PARA LOOP INFINITO ────────────── */

    /**
     * A animação CSS `scroll-carousel` percorre -50% do track.
     * Com 1 conjunto original + 1 clone (total 2), o loop é perfeito sem salto.
     */
    const originalLogos = Array.from(track.children);
    originalLogos.forEach(logo => {
        track.appendChild(logo.cloneNode(true));
    });

    /* ─── 3. CACHE DO CENTRO DA VIEWPORT ───────────────────────── */

    let halfVW = window.innerWidth / 2;

    const resizeObs = new ResizeObserver(() => {
        halfVW = window.innerWidth / 2;
    });
    resizeObs.observe(carousel);

    /* ─── 4. COLETA DOS IMGS (APÓS DUPLICAÇÃO) ──────────────────── */

    let imgs = Array.from(track.querySelectorAll('img'));

    /* ─── 5. INTERPOLAÇÃO ───────────────────────────────────────── */

    /**
     * Interpolação linear entre `a` e `b` com fator `t` em [0, 1].
     * @param {number} a - Valor de periferia
     * @param {number} b - Valor de centro
     * @param {number} t - Fator de proximidade
     * @returns {number}
     */
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Normaliza a distância ao centro para um fator de proximidade [0, 1]
     * com curva smoothstep (3t² − 2t³) para transição orgânica.
     * @param {number} dist - Distância absoluta ao centro em px
     * @returns {number} Fator de proximidade em [0, 1]
     */
    function proximity(dist) {
        if (dist >= RADIUS) return 0;
        const t = 1 - dist / RADIUS;
        return t * t * (3 - 2 * t);
    }

    /* ─── 6. LOOP DE ANIMAÇÃO ───────────────────────────────────── */

    let rafId     = null;
    let isVisible = false;

    /**
     * Loop principal do efeito Depth Focus.
     * Fase 1 — Leitura em batch: coleta todos os rects antes de escrever.
     * Fase 2 — Escrita em batch: aplica transform/filter sem intercalar reflows.
     */
    function depthFocusTick() {
        if (!isVisible) {
            rafId = requestAnimationFrame(depthFocusTick);
            return;
        }

        // Fase de leitura
        const rects = imgs.map(img => img.getBoundingClientRect());

        // Fase de escrita
        imgs.forEach((img, i) => {
            const rect       = rects[i];
            const logoCenterX = rect.left + rect.width / 2;
            const dist        = Math.abs(logoCenterX - halfVW);
            const factor      = proximity(dist);

            const scale   = lerp(SCALE_MIN,   SCALE_MAX,   factor);
            const opacity = lerp(OPACITY_MIN,  OPACITY_MAX, factor);
            const gray    = lerp(GRAY_MAX,     GRAY_MIN,    factor);

            // transform e filter rodam no thread de compositing (GPU), sem reflow
            img.style.transform = `scale(${scale.toFixed(3)})`;
            img.style.filter    = `grayscale(${gray.toFixed(1)}%) opacity(${opacity.toFixed(3)})`;

            if (factor > 0.75) {
                img.classList.add('logo-in-focus');
            } else {
                img.classList.remove('logo-in-focus');
            }
        });

        rafId = requestAnimationFrame(depthFocusTick);
    }

    /* ─── 7. PAUSAR FORA DA VIEWPORT ────────────────────────────── */

    const intersectionObs = new IntersectionObserver(
        entries => {
            isVisible = entries[0].isIntersecting;

            if (isVisible && rafId === null) {
                rafId = requestAnimationFrame(depthFocusTick);
            } else if (!isVisible && rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;

                // Reset visual ao sair da viewport
                imgs.forEach(img => {
                    img.style.transform = '';
                    img.style.filter    = '';
                    img.classList.remove('logo-in-focus');
                });
            }
        },
        { threshold: 0.1 }
    );

    intersectionObs.observe(carousel);

    /* ─── 8. RESIZE / ORIENTAÇÃO ────────────────────────────────── */

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            halfVW = window.innerWidth / 2;
            RADIUS = getRadius();
            imgs   = Array.from(track.querySelectorAll('img'));
        }, 150);
    }, { passive: true });

    if (window.screen?.orientation) {
        window.screen.orientation.addEventListener('change', () => {
            halfVW = window.innerWidth / 2;
        });
    }

})();