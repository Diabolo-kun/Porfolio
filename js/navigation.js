/**
 * @file navigation.js
 * @brief Controladores de eventos de teclado, ratón y lógica de las vistas del submenú.
 * @author Manuel Perez
 */

const mainMenuContainer = document.getElementById('main-menu-container');
const submenuContainer = document.getElementById('submenu-container');
const sections = document.querySelectorAll('.content-section');
const backBtn = document.getElementById('back-btn');
const portraitBg = document.querySelector('.portrait-bg');
const particlesContainer = document.querySelector('.particles-container');
const submenuTitleText = document.getElementById('submenu-title-text');

/**
 * @brief Actualiza la apariencia visual del menú principal según la selección actual.
 */
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
            if (btn.classList.contains('direct-action')) {
                const action = btn.getAttribute('data-action');
                if (action === 'link') window.open(btn.getAttribute('data-url'), '_blank');
                else if (action === 'mailto') window.location.href = `mailto:${btn.getAttribute('data-email')}`;
                else if (action === 'download') {
                    const a = document.createElement('a');
                    a.href = btn.getAttribute('data-file');
                    a.download = 'Manuel_Perez_CV.pdf';
                    a.click();
                }
            } else {
                openSubmenu();
            }
        }
    });
});

/**
 * @brief Abre el submenú correspondiente a la opción seleccionada del menú principal.
 *
 * Oculta el menú principal, aplica estilos específicos al contenedor
 * y prepara las listas para mostrar el submenú activo.
 */
function openSubmenu() {
    currentView = 'submenu';
    
    mainMenuContainer.classList.remove('active');
    mainMenuContainer.classList.add('hidden-view');
    
    if(portraitBg) portraitBg.classList.add('slide-left-out');
    if(particlesContainer) particlesContainer.classList.add('slide-left-out');

    document.getElementById('main-layout').style.backgroundColor = '#188A78';

    submenuContainer.classList.remove('hidden');
    submenuContainer.classList.remove('hidden-view');
    submenuContainer.classList.add('active');

    sections.forEach(sec => sec.classList.remove('active'));
    const targetId = navButtons[mainIndex].getAttribute('data-target');
    const targetSection = document.getElementById(targetId);
    if (targetSection) targetSection.classList.add('active');

    if(submenuTitleText) {
        const btnTextEl = navButtons[mainIndex].querySelector('.btn-text');
        if (btnTextEl && btnTextEl.hasAttribute('data-i18n')) {
            const i18nKey = btnTextEl.getAttribute('data-i18n');
            submenuTitleText.setAttribute('data-i18n', i18nKey);
            submenuTitleText.textContent = typeof translations !== 'undefined' ? translations[currentLang][i18nKey] : targetId.toUpperCase();
        } else {
            submenuTitleText.textContent = targetId.toUpperCase();
        }
    }

    subIndex = 0;
    windowTop = 0;
    updateSubmenuVisuals('keyboard');
}

/**
 * @brief Cierra el submenú activo y retorna al menú principal.
 *
 * Restaura el layout original y reactiva el contenedor del menú principal.
 */
function closeSubmenu() {
    currentView = 'menu';
    
    submenuContainer.classList.remove('active');
    submenuContainer.classList.add('hidden');
    
    if(portraitBg) portraitBg.classList.remove('slide-left-out');
    if(particlesContainer) particlesContainer.classList.remove('slide-left-out');

    document.getElementById('main-layout').style.backgroundColor = 'var(--color-turquoise)';

    mainMenuContainer.classList.remove('hidden-view');
    mainMenuContainer.classList.add('active');

    updateMainMenuVisuals();
}

if (backBtn) {
    backBtn.addEventListener('click', closeSubmenu);
}

/**
 * @brief Obtiene todos los elementos clickeables (.submenu-item) del submenú activo.
 * @return {NodeList|Array} Lista de elementos DOM del submenú.
 */
function getCurrentSubmenuItems() {
    if (currentView !== 'submenu') return [];
    const targetId = navButtons[mainIndex].getAttribute('data-target');
    const activeListPane = document.querySelector(`#${targetId} .list-pane`);
    if (!activeListPane) return [];
    return activeListPane.querySelectorAll('.submenu-item');
}

/**
 * @brief Ajusta el índice superior de la ventana virtual para el scroll.
 * @param {string} source Origen del evento ('keyboard', 'wheel', 'mouse').
 *
 * Asegura que el elemento seleccionado se mantenga dentro del área visible de 8 ítems,
 * forzando su posicionamiento entre el índice 2 y 7 (0-indexed: 1-6) si es posible.
 */
function adjustWindow(source) {
    const items = getCurrentSubmenuItems();
    const total = items.length;
    if (total === 0) return;
    const maxTop = Math.max(0, total - VISIBLE_COUNT);

    if (source === 'mouse') {
        if (subIndex < windowTop) {
            windowTop = subIndex;
        } else if (subIndex >= windowTop + VISIBLE_COUNT) {
            windowTop = subIndex - VISIBLE_COUNT + 1;
        }
    } else {
        if (subIndex === 0) {
            windowTop = 0;
        } else if (subIndex === total - 1) {
            windowTop = Math.max(0, total - VISIBLE_COUNT);
        } else {
            if (subIndex < windowTop + 1) {
                windowTop = subIndex - 1;
            }
            if (subIndex > windowTop + VISIBLE_COUNT - 2) {
                windowTop = subIndex - VISIBLE_COUNT + 2;
            }
        }
    }

    windowTop = Math.max(0, Math.min(windowTop, maxTop));
}

/**
 * @brief Aplica el desplazamiento CSS (`transform`) al contenedor del submenú activo.
 */
function applyWindowScroll() {
    const targetId = navButtons[mainIndex].getAttribute('data-target');
    const activeListPane = document.querySelector(`#${targetId} .list-pane`);
    if (!activeListPane) return;
    activeListPane.style.transform = `translateY(-${windowTop * ITEM_HEIGHT}px)`;
    activeListPane.style.transition = 'transform 0.15s ease-out';
}

/**
 * @brief Adjunta la lógica de hover a los elementos del submenú para selección por ratón.
 * @param {NodeList|Array} items Elementos DOM a los que adjuntar los listeners.
 */
function attachSubmenuHoverLogic(items) {
    items.forEach((item, index) => {
        if(item.dataset.hasHoverLogic) return;
        item.dataset.hasHoverLogic = 'true';

        item.addEventListener('mouseenter', () => {
            if (currentView !== 'submenu') return;
            subIndex = index;
            adjustWindow('mouse');
            applyWindowScroll();
            renderSubmenuSelection(items);
        });
    });
}

/**
 * @brief Actualiza las clases CSS y el texto de descripción para el elemento seleccionado.
 * @param {NodeList|Array} items Lista de elementos del submenú.
 */
function renderSubmenuSelection(items) {
    const descText = document.getElementById('item-description-text');
    items.forEach((item, i) => {
        if (i === subIndex) {
            item.classList.add('hovered');
            if (descText) {
                const desc = item.getAttribute('data-description');
                descText.textContent = desc || '';
            }
        } else {
            item.classList.remove('hovered');
        }
    });
}

/**
 * @brief Controlador principal para actualizar el submenú tras una acción de navegación.
 * @param {string} source Origen de la acción (por defecto 'mouse').
 */
function updateSubmenuVisuals(source = 'mouse') {
    const items = getCurrentSubmenuItems();
    if (items.length === 0) return;

    attachSubmenuHoverLogic(items);
    adjustWindow(source);
    applyWindowScroll();
    renderSubmenuSelection(items);

    if(items[subIndex]) {
        items[subIndex].click(); 
    }
}

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
            const btn = navButtons[mainIndex];
            if (btn.classList.contains('direct-action')) {
                btn.click(); // Reutilizamos la lógica del click
            } else {
                openSubmenu();
            }
        } else if (e.key === 'Escape' || e.key === 'Backspace') {
            e.preventDefault();
            returnToIntro();
        }
    }

    if (currentView === 'submenu') {
        const items = getCurrentSubmenuItems();
        
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            
            if (window.keyThrottle) return;
            window.keyThrottle = true;
            setTimeout(() => { window.keyThrottle = false; }, 125);

            if (e.key === 'ArrowUp') {
                if (items.length > 0) {
                    subIndex = (subIndex > 0) ? subIndex - 1 : items.length - 1;
                    updateSubmenuVisuals('keyboard');
                }
            } else if (e.key === 'ArrowDown') {
                if (items.length > 0) {
                    subIndex = (subIndex < items.length - 1) ? subIndex + 1 : 0;
                    updateSubmenuVisuals('keyboard');
                }
            }
        } else if (e.key === 'Escape' || e.key === 'Backspace') {
            e.preventDefault();
            closeSubmenu();
        }
    }
});

document.addEventListener('wheel', (e) => {
    if (currentView === 'submenu') {
        e.preventDefault();

        const items = getCurrentSubmenuItems();
        if (items.length === 0) return;

        if (window.wheelThrottle) return;
        window.wheelThrottle = true;
        setTimeout(() => { window.wheelThrottle = false; }, 80);

        if (e.deltaY > 0) {
            subIndex = (subIndex < items.length - 1) ? subIndex + 1 : 0;
        } else if (e.deltaY < 0) {
            subIndex = (subIndex > 0) ? subIndex - 1 : items.length - 1;
        }
        
        updateSubmenuVisuals('wheel');
    }
}, { passive: false });
