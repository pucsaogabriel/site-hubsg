// Carrossel de logos infinito: duplica os logos para criar um efeito de rolagem contínua.
const track = document.querySelector('.logos-track');
if (track) {
    const originalLogos = Array.from(track.children);

    // A animação CSS (`scroll-carousel`) move o carrossel em -20% do seu tamanho total.
    // Para que o loop seja perfeito e sem interrupções, precisamos de 5 conjuntos de logos
    // preenchendo o track (100% / 20% = 5).
    // Como 1 conjunto já existe no HTML, clonamos os logos mais 4 vezes.
    for (let i = 0; i < 4; i++) {
        originalLogos.forEach(logo => {
            track.appendChild(logo.cloneNode(true));
        });
    }
}