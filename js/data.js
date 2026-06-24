/**
 * @file data.js
 * @brief Lógica para la inyección de datos (experiencia y proyectos dinámicos).
 * @author Manuel Perez
 */

// PERFIL - Carga dinámica desde /data/perfil.json
let perfilLoaded = false;

/**
 * @brief Carga dinámicamente el perfil desde JSON.
 */
async function loadPerfil() {
    if (perfilLoaded) return;
    const listPane = document.getElementById('perfil-list');
    if (!listPane) return;

    try {
        const resp = await fetch(`data/perfil_${currentLang}.json`);
        if (!resp.ok) throw new Error(`No se pudo cargar perfil_${currentLang}.json`);
        const perfilData = await resp.json();

        listPane.innerHTML = '';
        perfilData.forEach((item) => {
            const btn = document.createElement('button');
            btn.className = 'submenu-item';
            btn.setAttribute('data-description', item.descripcion);
            btn.setAttribute('data-title', item.titulo);
            btn.innerHTML = `<span class="sub-arrow">▶</span> ${item.titulo}`;
            listPane.appendChild(btn);
        });
        perfilLoaded = true;
        if (typeof updateSubmenuVisuals === 'function') updateSubmenuVisuals('keyboard');
    } catch (error) {
        console.error('Error cargando perfil:', error);
        listPane.innerHTML = '<p>Error al cargar perfil.</p>';
    }
}

// EXPERIENCIA - Carga dinámica desde /data/experiencia.json
let experienciaLoaded = false;

/**
 * @brief Carga dinámicamente la experiencia desde JSON.
 */
async function loadExperiencia() {
    if (experienciaLoaded) return;
    const listPane = document.getElementById('exp-list');
    if (!listPane) return;

    try {
        const resp = await fetch(`data/experiencia_${currentLang}.json`);
        if (!resp.ok) throw new Error(`No se pudo cargar experiencia_${currentLang}.json`);
        const expData = await resp.json();

        listPane.innerHTML = '';
        expData.forEach((item) => {
            const btn = document.createElement('button');
            btn.className = 'submenu-item';
            btn.setAttribute('data-description', item.descripcion);
            btn.setAttribute('data-title', item.titulo);
            btn.innerHTML = `<span class="sub-arrow">▶</span> ${item.titulo}`;
            listPane.appendChild(btn);
        });
        experienciaLoaded = true;
        if (typeof updateSubmenuVisuals === 'function') updateSubmenuVisuals('keyboard');
    } catch (error) {
        console.error('Error cargando experiencia:', error);
        listPane.innerHTML = '<p>Error al cargar experiencia.</p>';
    }
}

// PROYECTOS - Carga dinámica desde /proyectos/
let proyectosLoaded = false;

/**
 * @brief Carga dinámicamente los proyectos desde la carpeta local /proyectos/.
 *
 * Lee el archivo manifest.json para obtener la lista de carpetas disponibles. Luego,
 * realiza llamadas fetch para extraer cada proyecto.json, ordenándolos por puntuación 
 * descendente y renderizando cada botón en el DOM dinámicamente.
 */
async function loadProyectos() {
    if (proyectosLoaded) return;
    const listPane = document.getElementById('github-list');
    if (!listPane) return;

    try {
        // Cargar manifiesto
        const manifestResp = await fetch('proyectos/manifest.json');
        if (!manifestResp.ok) throw new Error('No se pudo cargar manifest.json');
        const folders = await manifestResp.json();

        // Cargar cada proyecto
        const proyectos = [];
        for (const folder of folders) {
            try {
                const resp = await fetch(`proyectos/${folder}/proyecto_${currentLang}.json`);
                if (resp.ok) {
                    const data = await resp.json();
                    data._folder = folder;
                    proyectos.push(data);
                }
            } catch (e) {
                console.warn(`Error cargando proyecto ${folder}:`, e);
            }
        }

        // Ordenar: por puntuación (desc), luego alfabéticamente
        proyectos.sort((a, b) => {
            if (b.puntuacion !== a.puntuacion) return b.puntuacion - a.puntuacion;
            return a.titulo.localeCompare(b.titulo);
        });

        // Renderizar en la lista
        listPane.innerHTML = '';
        proyectos.forEach((proy) => {
            const btn = document.createElement('button');
            btn.className = 'submenu-item';
            const tipoTag = proy.tipo ? `[${proy.tipo.toUpperCase()}] ` : '';
            btn.setAttribute('data-description', tipoTag + proy.descripcion_corta);
            btn.setAttribute('data-title', proy.titulo);
            btn.innerHTML = `<span class="sub-arrow">▶</span> ${proy.titulo}`;
            listPane.appendChild(btn);
        });

        proyectosLoaded = true;
        if (typeof updateSubmenuVisuals === 'function') updateSubmenuVisuals('keyboard');
    } catch (error) {
        console.error('Error cargando proyectos:', error);
        listPane.innerHTML = '<p>Error al cargar proyectos.</p>';
    }
}
