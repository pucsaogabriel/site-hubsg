/**
 * @file projetos.js
 * @description Lógica assíncrona para buscar e renderizar os projetos do HubSG.
 */

document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('projetos-grid');
    const loadingState = document.getElementById('projetos-loading');
    const errorState = document.getElementById('projetos-error');
    const btnRetry = document.getElementById('btn-retry');

    /**
     * Busca os dados dos projetos no JSON
     */
    const fetchProjetos = async () => {
        try {
            // Mostra o loading, esconde os outros
            loadingState.style.display = 'flex';
            errorState.style.display = 'none';
            gridContainer.style.display = 'none';

            // Faz a requisição ao data.json
            const response = await fetch('../src/db/data.json');
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            // Filtra caso hajam projetos vazios (ex: mock inicial)
            const projetos = data.projetos.filter(p => p.titulo && p.titulo.trim() !== '');

            renderProjetos(projetos);
        } catch (error) {
            console.error('Falha ao carregar os projetos:', error);
            loadingState.style.display = 'none';
            errorState.style.display = 'flex';
        }
    };

    /**
     * Renderiza os cards de projeto no DOM
     * @param {Array} projetos - Array de objetos contendo os dados dos projetos
     */
    const renderProjetos = (projetos) => {
        gridContainer.innerHTML = ''; // Limpa o grid

        if (projetos.length === 0) {
            gridContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #555;">Nenhum projeto encontrado no momento.</p>';
        } else {
            projetos.forEach((projeto, index) => {
                const card = createProjetoCard(projeto, index);
                gridContainer.appendChild(card);
            });
        }

        // Atualiza a visualização
        loadingState.style.display = 'none';
        gridContainer.style.display = 'grid';

        // Ativa o IntersectionObserver para animar a entrada dos cards
        observeCards();
    };

    /**
     * Cria a estrutura HTML do card do projeto
     * @param {Object} projeto - Dados do projeto
     * @param {number} index - Índice do projeto
     * @returns {HTMLElement} O elemento do card
     */
    const createProjetoCard = (projeto, index) => {
        const article = document.createElement('article');
        // Usa a classe animate-on-scroll para a transição e um delay opcional
        article.className = 'projeto-card animate-on-scroll';
        article.style.transitionDelay = `${(index % 3) * 0.1}s`;

        // Verifica se é destaque
        const destaqueHTML = projeto.destaque ? `
            <div class="destaque-tag">
                <i class="fas fa-star"></i> Destaque
            </div>
        ` : '';

        // Formata o link correto da imagem
        // Como o js roda em pages/projetos.html, a base é relativa a pages/
        // Ex: "src/assets/images/projetos/..." vindo do JSON precisa de um '../'
        const imgSrc = projeto.img.startsWith('src/') ? `../${projeto.img}` : projeto.img;

        article.innerHTML = `
            <div class="projeto-img-wrapper">
                <img src="${imgSrc}" alt="Imagem do projeto ${projeto.titulo}" class="projeto-img" loading="lazy">
                <div class="glass-badge">${projeto.area}</div>
                ${destaqueHTML}
            </div>
            <div class="projeto-content">
                ${projeto.objetivo ? `<span class="projeto-objetivo">${projeto.objetivo}</span>` : ''}
                <h3 class="projeto-title">${projeto.titulo}</h3>
                <p class="projeto-desc">${projeto.descricao}</p>
                
                <a href="${projeto.link || '#'}" target="_blank" rel="noopener noreferrer" class="btn-projeto">
                    Ver Projeto <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        `;

        return article;
    };

    /**
     * Observa os cards para animá-los ao aparecerem na tela
     */
    const observeCards = () => {
        // Se existir a lógica no animations.js global, ela pode estar atrelada a todos
        // Mas por garantia e por ser assíncrono, nós mesmos inicializamos os recém-criados
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const cards = gridContainer.querySelectorAll('.animate-on-scroll');
        cards.forEach(card => observer.observe(card));
    };

    // Listeners
    if (btnRetry) {
        btnRetry.addEventListener('click', fetchProjetos);
    }

    // Inicializa
    fetchProjetos();
});
