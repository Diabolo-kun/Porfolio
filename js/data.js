/**
 * @file data.js
 * @brief Lógica para la inyección de datos (experiencia y proyectos dinámicos).
 * @author Manuel Perez
 */

const expData = [
    { id: 'exp1', title: "Ingeniero de Robótica", subtitle: "Empresa S.A. | 2023 - Presente", desc: "Desarrollo de brazos robóticos con ROS2, control cinemático y visión artificial." },
    { id: 'exp2', title: "Desarrollador Embebido", subtitle: "Tech Solutions | 2020 - 2023", desc: "Microcontroladores IoT (ESP32, STM32). Firmware en C/C++ y Rust." },
    { id: 'edu1', title: "Grado en Ingeniería", subtitle: "Universidad Politécnica | 2016 - 2020", desc: "Especialización en Electrónica. Matrícula de Honor en Control." },
    { id: 'contacto', title: "Datos de Contacto", subtitle: "¡Hablemos!", desc: "Email, LinkedIn y otras vías para ponerte en contacto conmigo." }
];

const expListPane = document.getElementById('exp-list');

if (expListPane) {
    expListPane.innerHTML = '';
    expData.forEach((item, idx) => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.setAttribute('data-description', item.desc);
        btn.innerHTML = `<span class="sub-arrow">▶</span> ${item.title}`;
        expListPane.appendChild(btn);
    });
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
                const resp = await fetch(`proyectos/${folder}/proyecto.json`);
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
            btn.innerHTML = `<span class="sub-arrow">▶</span> ${proy.titulo}`;
            listPane.appendChild(btn);
        });

        proyectosLoaded = true;
    } catch (error) {
        console.error('Error cargando proyectos:', error);
        listPane.innerHTML = '<p>Error al cargar proyectos.</p>';
    }
}
