/**
 * @file i18n.js
 * @brief Diccionario de traducciones y lógica para cambiar el idioma estático de la página.
 * @author Manuel Perez
 */

const translations = {
    es: {
        "start": "START",
        "menu_profile": "PERFIL",
        "menu_projects": "PROYECTOS",
        "menu_experience": "EXPERIENCIA",
        "menu_linkedin": "LINKEDIN",
        "menu_email": "EMAIL",
        "menu_cv": "CV (PDF)",
        "inst_nav": "Usa <span>↑</span> <span>↓</span> para navegar | <span>ENTER</span> para seleccionar",
        "inst_esc": "<span>ESC</span> para volver al inicio",
        "btn_back": "<span class=\"back-icon\">◀</span> VOLVER [ESC]",
        "title_item": "WHICH ITEM?",
        "load_profile": "Cargando perfil...",
        "load_projects": "Cargando proyectos...",
        "load_experience": "Cargando experiencia...",
        "desc_placeholder": "Selecciona un elemento para ver su descripción.",
        "msg_copied": "¡COPIADO!"
    },
    en: {
        "start": "START",
        "menu_profile": "PROFILE",
        "menu_projects": "PROJECTS",
        "menu_experience": "EXPERIENCE",
        "menu_linkedin": "LINKEDIN",
        "menu_email": "EMAIL",
        "menu_cv": "CV (PDF)",
        "inst_nav": "Use <span>↑</span> <span>↓</span> to navigate | <span>ENTER</span> to select",
        "inst_esc": "<span>ESC</span> to return to start",
        "btn_back": "<span class=\"back-icon\">◀</span> BACK [ESC]",
        "title_item": "WHICH ITEM?",
        "load_profile": "Loading profile...",
        "load_projects": "Loading projects...",
        "load_experience": "Loading experience...",
        "desc_placeholder": "Select an item to see its description.",
        "msg_copied": "COPIED!"
    }
};

/**
 * @brief Cambia el idioma de todos los elementos estáticos con data-i18n
 * @param {string} lang 'es' o 'en'
 */
function updateStaticTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // Actualizar botones de toggle
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar idioma estático
    updateStaticTranslations(currentLang);

    // Eventos para los botones de idioma
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.getAttribute('data-lang');
            if (lang !== currentLang) {
                currentLang = lang;
                updateStaticTranslations(currentLang);

                // Recargar datos dinámicos si ya estaban cargados
                if (perfilLoaded) { perfilLoaded = false; loadPerfil(); }
                if (experienciaLoaded) { experienciaLoaded = false; loadExperiencia(); }
                if (proyectosLoaded) { proyectosLoaded = false; loadProyectos(); }
            }
        });
    });
});
