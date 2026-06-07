document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. TRANSICIÓN DE LA INTRO AL MENÚ PRINCIPAL
       Animación: líneas grid → celdas turquesa entran desde izquierda (cortina)
       → grid se desvanece revelando el menú debajo
       ========================================================================== */
    const startBtn = document.getElementById('start-btn');
    const introScreen = document.getElementById('intro');
    const mainLayout = document.getElementById('main-layout');
    const gridOverlay = document.getElementById('grid-overlay');

    let currentView = 'intro'; // 'intro', 'menu', 'submenu'

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (currentView !== 'intro') return;
            startTransition();
        });
    }

    function startTransition() {
        // FASE 1: Mostrar overlay y dibujar las líneas del grid
        gridOverlay.classList.remove('hidden');
        gridOverlay.classList.add('phase-lines');

        // FASE 2: Celdas turquesa entran desde la izquierda
        setTimeout(() => {
            gridOverlay.classList.add('phase-cover');
        }, 500);

        // FASE 3: El menú (transparente) entra siguiendo la cortina
        setTimeout(() => {
            mainLayout.classList.remove('hidden');
            mainLayout.classList.add('slide-in');
        }, 700);

        // FASE 4: Ocultar intro 
        setTimeout(() => {
            introScreen.style.display = 'none';
        }, 1300);

        // FASE 5: Solidificar fondo del menú y quitar grid
        setTimeout(() => {
            mainLayout.style.backgroundColor = 'var(--color-turquoise)';
            gridOverlay.classList.add('hidden');
            gridOverlay.className = 'grid-overlay hidden';
        }, 1600);

        // FASE 6: Animar aparición de los botones del menú
        setTimeout(() => {
            currentView = 'menu';
            const navBtns = document.querySelectorAll('.nav-btn');
            navBtns.forEach(btn => btn.classList.add('menu-reveal'));
            updateMainMenuVisuals();
            fetchGitHubRepos();
        }, 1700);
    }

    function returnToIntro() {
        if (currentView !== 'menu') return;
        currentView = 'intro';

        mainLayout.style.backgroundColor = 'transparent';
        mainLayout.classList.remove('slide-in');
        mainLayout.classList.add('hidden');
        
        introScreen.style.display = 'flex';
        introScreen.style.opacity = '1';
        
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => btn.classList.remove('menu-reveal'));
    }

    const backToIntroBtn = document.getElementById('back-to-intro-btn');
    if (backToIntroBtn) {
        backToIntroBtn.addEventListener('click', returnToIntro);
    }


    /* ==========================================================================
       3. LÓGICA DEL MENÚ PRINCIPAL (Estado Persistente y Teclado)
       ========================================================================== */
    const navButtons = document.querySelectorAll('.nav-btn');
    const mainMenuContainer = document.getElementById('main-menu-container');
    const submenuContainer = document.getElementById('submenu-container');
    const sections = document.querySelectorAll('.content-section');
    const backBtn = document.getElementById('back-btn');

    let mainIndex = 0;

    function updateMainMenuVisuals() {
        if (currentView !== 'menu') return;
        
        navButtons.forEach((btn, i) => {
            if (i === mainIndex) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        document.body.className = `nav-active-${mainIndex}`;
    }

    navButtons.forEach((btn, index) => {
        btn.addEventListener('mouseenter', () => {
            if (currentView === 'menu') {
                mainIndex = index;
                updateMainMenuVisuals();
            }
        });

        btn.addEventListener('click', () => {
            if (currentView === 'menu') {
                mainIndex = index;
                openSubmenu();
            }
        });
    });

    function openSubmenu() {
        currentView = 'submenu';
        
        mainMenuContainer.classList.remove('active');
        mainMenuContainer.classList.add('hidden-view');
        
        submenuContainer.classList.remove('hidden');
        submenuContainer.classList.remove('hidden-view');
        submenuContainer.classList.add('active');

        sections.forEach(sec => sec.classList.remove('active'));
        const targetId = navButtons[mainIndex].getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.add('active');

        subIndex = 0;
        updateSubmenuVisuals();
    }

    function closeSubmenu() {
        currentView = 'menu';
        
        submenuContainer.classList.remove('active');
        submenuContainer.classList.add('hidden-view');
        
        mainMenuContainer.classList.remove('hidden-view');
        mainMenuContainer.classList.add('active');

        updateMainMenuVisuals();
    }

    if (backBtn) {
        backBtn.addEventListener('click', closeSubmenu);
    }


    /* ==========================================================================
       4. LÓGICA DE SUBMENÚS Y NAVEGACIÓN POR TECLADO
       ========================================================================== */
    let subIndex = 0;
    
    function getCurrentSubmenuItems() {
        if (currentView !== 'submenu') return [];
        const targetId = navButtons[mainIndex].getAttribute('data-target');
        const activeListPane = document.querySelector(`#${targetId} .list-pane`);
        if (!activeListPane) return [];
        return activeListPane.querySelectorAll('.submenu-item');
    }

    function updateSubmenuVisuals() {
        const items = getCurrentSubmenuItems();
        if (items.length === 0) return;

        items.forEach((item, i) => {
            if (i === subIndex) {
                item.classList.add('hovered');
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                item.classList.remove('hovered');
            }
        });

        if(items[subIndex]) {
            items[subIndex].click(); 
        }
    }

    // LISTENER GLOBAL DE TECLADO
    document.addEventListener('keydown', (e) => {
        if (currentView === 'intro') {
            if (e.key === 'Enter') startBtn.click();
            return;
        }

        if (currentView === 'menu') {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                mainIndex = (mainIndex > 0) ? mainIndex - 1 : navButtons.length - 1;
                updateMainMenuVisuals();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                mainIndex = (mainIndex < navButtons.length - 1) ? mainIndex + 1 : 0;
                updateMainMenuVisuals();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                openSubmenu();
            } else if (e.key === 'Escape' || e.key === 'Backspace') {
                e.preventDefault();
                returnToIntro();
            }
        }

        if (currentView === 'submenu') {
            const items = getCurrentSubmenuItems();
            
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (items.length > 0) {
                    subIndex = (subIndex > 0) ? subIndex - 1 : items.length - 1;
                    updateSubmenuVisuals();
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (items.length > 0) {
                    subIndex = (subIndex < items.length - 1) ? subIndex + 1 : 0;
                    updateSubmenuVisuals();
                }
            } else if (e.key === 'Escape' || e.key === 'Backspace') {
                e.preventDefault();
                closeSubmenu();
            }
        }
    });

    /* ==========================================================================
       5. DATOS DE EXPERIENCIA Y GITHUB
       ========================================================================== */
    const expData = [
        { id: 'exp1', title: "Ingeniero de Robótica", subtitle: "Empresa S.A. | 2023 - Presente", body: "<p>Desarrollo de brazos robóticos con ROS2.</p><ul><li>Control cinemático</li></ul>" },
        { id: 'exp2', title: "Desarrollador Embebido", subtitle: "Tech Solutions | 2020 - 2023", body: "<p>Microcontroladores IoT (ESP32, STM32).</p><ul><li>Firmware en C/C++ y Rust</li></ul>" },
        { id: 'edu1', title: "Grado en Ingeniería", subtitle: "Universidad Politécnica | 2016 - 2020", body: "<p>Especialización en Electrónica.</p><ul><li>Matrícula de Honor en Control</li></ul>" },
        { id: 'contacto', title: "Datos de Contacto", subtitle: "¡Hablemos!", body: "<p>Email: tuemail@ejemplo.com</p><p>LinkedIn: /in/tu-perfil</p>" }
    ];

    const expListPane = document.getElementById('exp-list');
    const expDetailsPane = document.getElementById('exp-details');

    if (expListPane) {
        expListPane.innerHTML = '';
        expData.forEach((item, idx) => {
            const btn = document.createElement('button');
            btn.className = 'submenu-item';
            btn.innerHTML = `<span class="sub-arrow">▶</span> ${item.title}`;
            
            btn.addEventListener('mouseenter', () => {
                if(currentView === 'submenu') {
                    subIndex = idx;
                    updateSubmenuVisuals();
                }
            });

            btn.addEventListener('click', () => {
                document.querySelectorAll('#exp-list .submenu-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                expDetailsPane.innerHTML = `
                    <h4 class="detail-title">${item.title}</h4>
                    <span class="detail-subtitle">${item.subtitle}</span>
                    <div class="detail-body">${item.body}</div>
                `;
            });
            expListPane.appendChild(btn);
        });
    }

    // GITHUB
    const GITHUB_USERNAME = 'octocat';
    let reposLoaded = false;

    async function fetchGitHubRepos() {
        if (reposLoaded) return; 
        const listPane = document.getElementById('github-list');
        const detailPane = document.getElementById('github-details');
        if (!listPane || !detailPane) return;

        try {
            const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`);
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            
            listPane.innerHTML = '';
            if (data.length === 0) { listPane.innerHTML = '<p>No hay repositorios.</p>'; return; }

            data.forEach((repo, idx) => {
                const btn = document.createElement('button');
                btn.className = 'submenu-item';
                btn.innerHTML = `<span class="sub-arrow">▶</span> ${repo.name}`;
                
                btn.addEventListener('mouseenter', () => {
                    if(currentView === 'submenu') {
                        subIndex = idx;
                        updateSubmenuVisuals();
                    }
                });

                btn.addEventListener('click', () => {
                    document.querySelectorAll('#github-list .submenu-item').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    const fecha = new Date(repo.updated_at).toLocaleDateString();
                    detailPane.innerHTML = `
                        <h4 class="detail-title">${repo.name}</h4>
                        <span class="detail-subtitle">Actualizado: ${fecha} | ${repo.language || 'Multilenguaje'}</span>
                        <div class="detail-body">
                            <p>${repo.description || 'Sin descripción'}</p>
                            <ul>
                                <li>⭐ Estrellas: ${repo.stargazers_count}</li>
                                <li>🔀 Forks: ${repo.forks_count}</li>
                            </ul>
                            <a href="${repo.html_url}" target="_blank" class="repo-link">Ver Código</a>
                        </div>
                    `;
                });
                listPane.appendChild(btn);
            });
            reposLoaded = true;
        } catch (error) {
            console.error(error);
            listPane.innerHTML = '<p>Error al cargar proyectos.</p>';
        }
    }

});
