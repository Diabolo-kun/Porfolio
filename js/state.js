/**
 * @file state.js
 * @brief Variables de estado global para la navegación de la interfaz.
 * @author Manuel Perez
 */

/** @var {string} currentView Vista actual de la aplicación ('intro', 'menu', 'submenu') */
let currentView = 'intro';

/** @var {string} currentLang Idioma actual de la aplicación ('es' o 'en') */
let currentLang = 'es';

/** @var {number} mainIndex Índice del elemento seleccionado en el menú principal */
let mainIndex = 0;

/** @var {number} subIndex Índice absoluto del elemento seleccionado en el submenú actual */
let subIndex = 0;

/** @var {number} windowTop Índice del primer ítem visible en la ventana de scroll (virtual window) */
let windowTop = 0;

/** @const {number} VISIBLE_COUNT Número máximo de elementos visibles simultáneamente en un submenú */
const VISIBLE_COUNT = 8;

/** @const {number} ITEM_HEIGHT Altura en píxeles de cada elemento del submenú (60px altura + 10px gap) */
const ITEM_HEIGHT = 70;

/** @const {number} ITEM_HEIGHT_MOBILE Altura en móvil (45px altura + 10px gap) */
const ITEM_HEIGHT_MOBILE = 55;
