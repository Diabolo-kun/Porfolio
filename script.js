document.addEventListener('DOMContentLoaded', () => {



    /* ==========================================================================
       1. TRANSICIÓN DE LA INTRO AL MENÚ PRINCIPAL
       ========================================================================== */
    const startBtn = document.getElementById('start-btn');
    const introScreen = document.getElementById('intro');
    const mainLayout = document.getElementById('main-layout');
    const rightPanel = document.getElementById('right-panel');

    let currentView = 'intro'; // 'intro', 'menu', 'submenu'

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            introScreen.classList.add('fade-out');
            mainLayout.classList.remove('hidden');
            rightPanel.classList.add('animate-in'); // Animación desde la derecha

            setTimeout(() => {
                introScreen.style.display = 'none';
                currentView = 'menu';
                updateMainMenuVisuals(); // Selecciona la primera opción por defecto
                fetchGitHubRepos(); // Pre-cargar
            }, 800); 
        });
    }

    function returnToIntro() {
        if (currentView !== 'menu') return;
        currentView = 'intro';

        rightPanel.classList.remove('animate-in');
        rightPanel.classList.add('animate-out');

        introScreen.style.display = 'flex';
        setTimeout(() => {
            introScreen.classList.remove('fade-out');
        }, 10);

        setTimeout(() => {
            mainLayout.classList.add('hidden');
            rightPanel.classList.remove('animate-out');
        }, 500);
    }

    const backToIntroBtn = document.getElementById('back-to-intro-btn');
    if (backToIntroBtn) {
        backToIntroBtn.addEventListener('click', returnToIntro);
    }

    /* ==========================================================================
       2. EFECTO DE PARPADEO DEL RETRATO
       ========================================================================== */
    const blinkLayer = document.getElementById('portrait-blink');
    function triggerBlink() {
        if (!blinkLayer) return;
        blinkLayer.style.opacity = '1';
        setTimeout(() => { blinkLayer.style.opacity = '0'; }, 150);
        setTimeout(triggerBlink, Math.random() * 4000 + 2000);
    }
    setTimeout(triggerBlink, 3000);


    /* ==========================================================================
       3. LÓGICA DEL MENÚ PRINCIPAL (Estado Persistente y Teclado)
       ========================================================================== */
    const navButtons = document.querySelectorAll('.nav-btn');
    const mainMenuContainer = document.getElementById('main-menu-container');
    const submenuContainer = document.getElementById('submenu-container');
    const sections = document.querySelectorAll('.content-section');
    const backBtn = document.getElementById('back-btn');

    let mainIndex = 0; // 0: Perfil, 1: Proyectos, 2: Experiencia

    function updateMainMenuVisuals() {
        if (currentView !== 'menu') return;
        
        navButtons.forEach((btn, i) => {
            if (i === mainIndex) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Actualizar efectos del panel izquierdo
        document.body.className = `nav-active-${mainIndex}`;
    }

    // Interacción con ratón: Al pasar el ratón, se actualiza el index y se queda fijo
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
        
        // Ocultar menú principal y mostrar overlay
        mainMenuContainer.classList.remove('active');
        mainMenuContainer.classList.add('hidden-view');
        
        submenuContainer.classList.remove('hidden'); // por si acaso
        submenuContainer.classList.remove('hidden-view');
        submenuContainer.classList.add('active');

        // Mostrar sección correcta
        sections.forEach(sec => sec.classList.remove('active'));
        const targetId = navButtons[mainIndex].getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.add('active');

        // Resetear subíndice (para navegar por los submenús)
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
    let subIndex = 0; // Índice para navegar dentro del Submenu A
    
    // Obtenemos los botones actuales según la sección activa
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
                item.classList.add('hovered'); // Simulamos que está seleccionado/hovered
                // Auto-scroll si está fuera de vista
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                item.classList.remove('hovered');
            }
        });

        // Auto-mostrar el detalle del elemento seleccionado (como en un juego)
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
       5. DATOS DE EXPERIENCIA Y GITHUB (INYECCIÓN DE MOCK Y FETCH)
       ========================================================================== */
    const expData = [
        { id: 'exp1', title: "Ingeniero de Robótica", subtitle: "Empresa S.A. | 2023 - Presente", body: "<p>Desarrollo de brazos robóticos con ROS2.</p><ul><li>Control cinemático</li></ul>" },
        { id: 'exp2', title: "Desarrollador Embebido", subtitle: "Tech Solutions | 2020 - 2023", body: "<p>Microcontroladores IoT (ESP32, STM32).</p><ul><li>Firmware en C/C++ y Rust</li></ul>" },
        { id: 'edu1', title: "Grado en Ingeniería", subtitle: "Universidad Politécnica | 2016 - 2020", body: "<p>Especialización en Electrónica.</p><ul><li>Matrícula de Honor en Control</li></ul>" },
        { id: 'contacto', title: "Datos de Contacto", subtitle: "¡Hablemos!", body: "<p>Email: tuemail@ejemplo.com</p><p>LinkedIn: /in/tu-perfil</p>" }
    ];

    const expListPane = document.getElementById('exp-list');
    const expDetailsPane = document.getElementById('exp-details');

    // Generar botones de experiencia dinámicamente
    if (expListPane) {
        expListPane.innerHTML = '';
        expData.forEach((item, idx) => {
            const btn = document.createElement('button');
            btn.className = 'submenu-item';
            btn.innerHTML = `<span class="sub-arrow">▶</span> ${item.title}`;
            
            // Mouse Interaction
            btn.addEventListener('mouseenter', () => {
                if(currentView === 'submenu') {
                    subIndex = idx;
                    updateSubmenuVisuals(); // Actualiza selección
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
