/**
 * @file transitions.js
 * @brief Lógica de transiciones y animaciones entre la pantalla de inicio y el menú principal.
 * @author Manuel Perez
 */

const startBtn = document.getElementById('start-btn');
const introScreen = document.getElementById('intro');
const mainLayout = document.getElementById('main-layout');
const gridOverlay = document.getElementById('grid-overlay');
const backToIntroBtn = document.getElementById('back-to-intro-btn');
const navButtons = document.querySelectorAll('.nav-btn');

if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (currentView !== 'intro') return;
        startTransition();
    });
}

/**
 * @brief Inicia la transición animada desde la pantalla de inicio hacia el menú principal.
 *
 * Utiliza un sistema de fases (cortina turquesa, deslizamiento del menú, solidificación del fondo)
 * mediante retrasos controlados con setTimeout. Al finalizar, activa la visualización del menú.
 */
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

    // FASE 5: Solidificar fondo del menú (empieza a transicionar a turquesa)
    setTimeout(() => {
        mainLayout.style.backgroundColor = 'var(--color-turquoise)';
        
        // Esperar a que acabe la transición (0.6s) para quitar el grid y que no se vea el azul de fondo
        setTimeout(() => {
            gridOverlay.classList.add('hidden');
            gridOverlay.className = 'grid-overlay hidden';
        }, 600);
    }, 1600);

    // FASE 6: Animar aparición de los botones del menú
    setTimeout(() => {
        currentView = 'menu';
        history.pushState({ view: 'menu' }, '', '');
        navButtons.forEach(btn => btn.classList.add('menu-reveal'));
        if (typeof updateMainMenuVisuals === 'function') updateMainMenuVisuals();
        if (typeof loadPerfil === 'function') loadPerfil();
        if (typeof loadProyectos === 'function') loadProyectos();
        if (typeof loadExperiencia === 'function') loadExperiencia();
    }, 1700);
}

/**
 * @brief Restaura la interfaz a la pantalla de inicio.
 *
 * Oculta el menú principal y vuelve a mostrar la pantalla inicial (`intro-screen`).
 */
function returnToIntro() {
    if (currentView !== 'menu') return;
    currentView = 'intro';

    mainLayout.style.backgroundColor = 'transparent';
    mainLayout.classList.remove('slide-in');
    mainLayout.classList.add('hidden');
    
    introScreen.style.display = 'flex';
    introScreen.style.opacity = '1';
    
    navButtons.forEach(btn => btn.classList.remove('menu-reveal'));
}

if (backToIntroBtn) {
    backToIntroBtn.addEventListener('click', returnToIntro);
}
