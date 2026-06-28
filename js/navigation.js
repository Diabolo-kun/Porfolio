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
                else if (action === 'copy') {
                    const textToCopy = btn.getAttribute('data-email');
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        const textSpan = btn.querySelector('.btn-text');
                        const originalText = textSpan.textContent;
                        textSpan.textContent = translations[currentLang]['msg_copied'];
                        setTimeout(() => {
                            textSpan.textContent = originalText;
                        }, 2000);
                    }).catch(err => {
                        console.error('Error al copiar: ', err);
                    });
                }
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
    history.pushState({ view: 'submenu' }, '', '');
    
    mainMenuContainer.classList.remove('active');
    mainMenuContainer.classList.add('hidden-view');
    
    if(portraitBg) portraitBg.classList.add('slide-left-out');
    // Mantenemos las partículas de fondo visibles
    // if(particlesContainer) particlesContainer.classList.add('slide-left-out');

    document.getElementById('main-layout').style.backgroundColor = '#188A78';

    submenuContainer.classList.remove('hidden');
    submenuContainer.classList.remove('hidden-view');
    submenuContainer.classList.add('active');
    
    const descOverlay = document.getElementById('desc-overlay');
    if (descOverlay) descOverlay.classList.remove('active');

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
    
    const descOverlay = document.getElementById('desc-overlay');
    if (descOverlay) descOverlay.classList.remove('active');
    
    if(portraitBg) portraitBg.classList.remove('slide-left-out');
    // if(particlesContainer) particlesContainer.classList.remove('slide-left-out');

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
    const itemH = (typeof isMobile === 'function' && isMobile()) ? ITEM_HEIGHT_MOBILE : ITEM_HEIGHT;
    activeListPane.style.transform = `translateY(-${windowTop * itemH}px)`;
    activeListPane.style.transition = 'transform 0.15s ease-out';
    
    updateAvatarPointing(subIndex, windowTop);
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

        item.addEventListener('click', () => {
            if (currentView !== 'submenu') return;
            subIndex = index;
            renderSubmenuSelection(items);
            
            const descOverlay = document.getElementById('desc-overlay');
            const overlayTitle = document.getElementById('desc-title-overlay');
            const overlayText = document.getElementById('desc-text-overlay');
            
            if (descOverlay) {
                const desc = item.getAttribute('data-description');
                const title = item.getAttribute('data-title') || item.textContent.replace('▶', '').trim();
                if (overlayTitle) {
                    overlayTitle.style.fontSize = ''; // Reset
                    overlayTitle.textContent = title;
                    if (overlayTitle.scrollHeight > 85) {
                        overlayTitle.style.fontSize = '1.3rem';
                    }
                }
                if (overlayText) overlayText.textContent = desc || '';
                descOverlay.classList.add('active');
                history.pushState({ view: 'description' }, '', '');
            }
        });
    });
}

/**
 * @brief Actualiza las clases CSS y el texto de descripción para el elemento seleccionado.
 * @param {NodeList|Array} items Lista de elementos del submenú.
 */
function renderSubmenuSelection(items) {
    const descText = document.getElementById('item-description-text');
    const overlayTitle = document.getElementById('desc-title-overlay');
    const overlayText = document.getElementById('desc-text-overlay');
    const descOverlay = document.getElementById('desc-overlay');

    items.forEach((item, i) => {
        if (i === subIndex) {
            item.classList.add('hovered');
            const desc = item.getAttribute('data-description');
            const title = item.getAttribute('data-title') || item.textContent.replace('▶', '').trim();
            
            if (descText) {
                descText.textContent = desc || '';
            }

            if (descOverlay && descOverlay.classList.contains('active')) {
                if (overlayTitle) {
                    overlayTitle.style.fontSize = ''; // Reset
                    overlayTitle.textContent = title;
                    if (overlayTitle.scrollHeight > 85) {
                        overlayTitle.style.fontSize = '1.3rem';
                    }
                }
                if (overlayText) overlayText.textContent = desc || '';
            }
        } else {
            item.classList.remove('hovered');
        }
    });

    updateAvatarPointing(subIndex, windowTop);
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
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (items.length > 0 && items[subIndex]) {
                items[subIndex].click();
            }
        } else if (e.key === 'Escape' || e.key === 'Backspace') {
            e.preventDefault();
            const descOverlay = document.getElementById('desc-overlay');
            if (descOverlay && descOverlay.classList.contains('active')) {
                descOverlay.classList.remove('active');
            } else {
                closeSubmenu();
            }
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

/**
 * Función auxiliar para obtener la rotación visual actual del elemento en grados.
 */
function getCurrentRotation(el) {
    const st = window.getComputedStyle(el);
    const tr = st.getPropertyValue("transform");
    if (tr === 'none') return 0;
    const values = tr.split('(')[1].split(')')[0].split(',');
    const a = parseFloat(values[0]);
    const b = parseFloat(values[1]);
    return Math.atan2(b, a) * (180 / Math.PI);
}

let previousAvatarAngle = null;
let previousSubIndexGlobal = null;

/**
 * @brief Actualiza la rotación del brazo del avatar según la opción activa con animación de rebote.
 * @param {number} currentSubIndex Índice real del ítem activo.
 * @param {number} currentWindowTop Índice del primer ítem visible.
 */
function updateAvatarPointing(currentSubIndex, currentWindowTop) {
    const arm = document.getElementById('avatar-arm');
    if (!arm) return;
    
    // Detectamos la dirección real del cursor en la lista total de datos
    const isMovingDownList = previousSubIndexGlobal !== null && currentSubIndex > previousSubIndexGlobal;
    const isMovingUpList = previousSubIndexGlobal !== null && currentSubIndex < previousSubIndexGlobal;
    previousSubIndexGlobal = currentSubIndex;
    
    const visualIndex = currentSubIndex - currentWindowTop;
    
    const angles = [
         18, // Posición 0
         15, // Posición 1
         12, // Posición 2
          9, // Posición 3
          6, // Posición 4
          3, // Posición 5
          0, // Posición 6
         -3  // Posición 7
    ];
    
    const clampedIndex = Math.max(0, Math.min(visualIndex, 7));
    const targetAngle = angles[clampedIndex];
    
    if (previousAvatarAngle === null) {
        arm.style.transform = `rotate(${targetAngle}deg)`;
        previousAvatarAngle = targetAngle;
        return;
    }
    
    let currentVisualAngle = getCurrentRotation(arm);
    
    // Determinamos la dirección del movimiento.
    // Si el ángulo objetivo es distinto al actual, es obvio.
    // Si es el mismo (estamos en los bordes y la lista hace scroll), 
    // usamos la dirección real en la que el usuario ha movido el cursor.
    let isMovingUpVisual;
    if (Math.abs(targetAngle - currentVisualAngle) > 0.1) {
        isMovingUpVisual = targetAngle > currentVisualAngle;
    } else {
        if (isMovingUpList) {
            isMovingUpVisual = true; // El usuario pulsó Arriba
        } else if (isMovingDownList) {
            isMovingUpVisual = false; // El usuario pulsó Abajo
        } else {
            return; // No hay movimiento real
        }
    }
    
    arm.getAnimations().forEach(a => a.cancel());

    const offset = 1.5; 
    
    const overshoot1 = isMovingUpVisual ? targetAngle + offset : targetAngle - offset;
    const overshoot2 = isMovingUpVisual ? targetAngle - (offset/2) : targetAngle + (offset/2); 
    
    arm.animate([
        { transform: `rotate(${currentVisualAngle}deg)` },
        { transform: `rotate(${overshoot1}deg)`, offset: 0.6 },
        { transform: `rotate(${overshoot2}deg)`, offset: 0.85 },
        { transform: `rotate(${targetAngle}deg)`, offset: 1.0 }
    ], {
        duration: 750, 
        easing: 'ease-out', 
        fill: 'forwards' 
    });
    
    arm.style.transform = `rotate(${targetAngle}deg)`;
    previousAvatarAngle = targetAngle;
}

/* ==========================================================================
   SOPORTE TÁCTIL PARA MÓVIL
   ========================================================================== */

/**
 * @brief Detecta si estamos en un dispositivo móvil/táctil.
 * @return {boolean}
 */
function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
}

let touchStartY = null;
let touchStartX = null;
let touchThrottled = false;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (touchStartY === null || touchStartX === null) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const diffY = touchStartY - touchEndY;
    const diffX = touchStartX - touchEndX;
    const minSwipe = 30;
    
    // Swipe vertical = navegar ítems (mismo sistema que wheel/keyboard)
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > minSwipe) {
        if (currentView === 'submenu') {
            if (touchThrottled) { touchStartY = null; touchStartX = null; return; }
            touchThrottled = true;
            setTimeout(() => { touchThrottled = false; }, 120);
            
            const items = getCurrentSubmenuItems();
            if (items.length === 0) { touchStartY = null; touchStartX = null; return; }
            
            if (diffY > 0) {
                // Swipe arriba = siguiente
                subIndex = (subIndex < items.length - 1) ? subIndex + 1 : items.length - 1;
            } else {
                // Swipe abajo = anterior
                subIndex = (subIndex > 0) ? subIndex - 1 : 0;
            }
            updateSubmenuVisuals('keyboard');
        }
    }
    
    // Swipe horizontal hacia la derecha = volver atrás (usa history para consistencia)
    if (Math.abs(diffX) > Math.abs(diffY) && diffX < -minSwipe) {
        if (currentView === 'submenu' || currentView === 'menu') {
            history.back();
        }
    }
    
    touchStartY = null;
    touchStartX = null;
}, { passive: true });

/**
 * @brief Cerrar el overlay de descripción al tocar fuera de él en móvil.
 */
document.addEventListener('click', (e) => {
    if (!isMobile()) return;
    const descOverlay = document.getElementById('desc-overlay');
    if (!descOverlay || !descOverlay.classList.contains('active')) return;
    
    const descInner = descOverlay.querySelector('.desc-inner');
    if (descInner && !descInner.contains(e.target)) {
        history.back();
    }
});

/* ==========================================================================
   BOTÓN ATRÁS DEL NAVEGADOR (History API)
   ========================================================================== */

/**
 * @brief Intercepta el botón atrás del navegador/móvil para navegar entre pantallas
 *        en vez de salir de la web.
 *
 * Flujo: descripción → submenu → menu → intro
 */
window.addEventListener('popstate', (e) => {
    const descOverlay = document.getElementById('desc-overlay');
    
    // Si hay un overlay de descripción abierto, cerrarlo
    if (descOverlay && descOverlay.classList.contains('active')) {
        descOverlay.classList.remove('active');
        return;
    }
    
    // Si estamos en un submenú, volver al menú principal
    if (currentView === 'submenu') {
        closeSubmenu();
        return;
    }
    
    // Si estamos en el menú principal, volver a la intro
    if (currentView === 'menu') {
        if (typeof returnToIntro === 'function') {
            returnToIntro();
        }
        return;
    }
});

// Establecer el estado inicial de la History API
history.replaceState({ view: 'intro' }, '', '');
