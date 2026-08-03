# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Prototipo navegable de alta fidelidad de la **Academia de Autocapacitación SIGMMA** (lado agencia),
derivado de un wireframe de baja fidelidad de 16 pantallas. Ticket Jira: **SGM-1834**.

No es una aplicación de producción: **no hay backend, SSO, API ni YouTube real**. Todos los datos son
ficticios y viven en `assets/js/mock-data.js`. El reproductor de video está simulado. Sirve como
referencia de construcción para desarrollo y como pieza presentable a negocio.

La UI está **íntegramente en español rioplatense** (voseo: "Empezá", "Contanos", "Pasame"). Los
comentarios de código también. Mantené ese registro al escribir copy nuevo.

## Comandos

```bash
npm install
npm run dev        # tailwindcss --watch sobre src/input.css
npm run build      # compilado minificado → assets/css/academia.css (versionado en git)
npm run build:dev  # igual pero sin minificar, más legible para inspeccionar
npm run serve      # servidor estático en http://localhost:4321
```

**No hay suite de tests.** La verificación en este repo es visual y estructural (ver abajo).

`assets/css/academia.css` **está versionado a propósito**: permite abrir cualquier `.html` con doble
click sobre `file://` sin instalar nada. Si tocás `src/input.css`, recompilá y commiteá el CSS.

## Arquitectura

### Sistema de tokens cerrado (Tailwind v4, CSS-first)

Todo el diseño vive en `src/input.css`. No hay `tailwind.config.js`: la configuración es el bloque
`@theme`. **La paleta, los pesos, los tamaños de texto, los radios, las sombras, los breakpoints y
los contenedores por defecto de Tailwind fueron borrados** con `--color-*: initial` y equivalentes.

Consecuencia práctica: `bg-blue-500`, `font-medium`, `text-2xl`, `sm:`, `xl:` **no compilan**. Si
necesitás un valor nuevo, se agrega al `@theme` con un nombre semántico — nunca un hex suelto en el
HTML ni una clase de la paleta default. Esto es deliberado: la guía de diseño marca los nombres
numéricos (`color-2-normal`) y los pesos sintetizados como deuda a no repetir.

Los tokens se nombran **por rol**: `primary`, `accent`, `indigo`, `cta`, `success`, `error`,
`warning`, `info`, `ink`, `ink-soft`, `surface`, `line`. Breakpoints: solo base, `md` (768) y `lg` (1024).
Pesos: solo 400 y 700.

Los componentes (`.btn`, `.card`, `.badge`, `.progress`, `.field`, `.modal`, `.table-app`,
`.brand-edge`…) están en `@layer components` del mismo archivo.

### Sin build de HTML — chrome duplicado a propósito

Los `.html` son archivos planos, sin templating. El header + nav de la app está **copiado literal en
las 8 páginas de app**, delimitado por:

```html
<!-- app-shell: sincronizar con src/partials/app-header.html -->
...
<!-- /app-shell -->
```

`src/partials/app-header.html` es la **fuente canónica** (no se sirve). Si modificás el chrome,
replicá el cambio en las 8 páginas y actualizá el partial. Al copiarlo, cambiá solo el
`aria-current="page"` al link que corresponda.

### El contrato de URL: 16 pantallas en 9 archivos

Los estados transversales y los overlays no tienen archivo propio: se abren sobre su pantalla padre
con query params. Esto replica cómo se comportarían en el producto real.

| Param | Valores | Efecto |
|---|---|---|
| `?state=` | `error`, `empty`, `loading`, `complete`, `sent`, `expired` | Estado alternativo de la pantalla |
| `?phase=` | `quiz`, `result` (+ `&score=N`) | Fase del quiz en `evaluacion.html` |
| `?confirm=1` | — | Abre el modal de preguntas sin responder |
| `?menu=open` | — | Abre el menú de avatar |
| `?meet=solicitada` | — | Variante «Meet ya solicitada» |
| `?ver=` | `ranking` | Vista de ranking del equipo en `agencia.html` |
| `?m=` / `?v=` | id de módulo (1-10) / id de video | Cambia el contenido |

`?state=expired` funciona en **cualquier** página (lo maneja `ui.js` de forma global).
`design-system.html` tiene la tabla completa de las 22 URLs enlazada — es el índice canónico y hay
que actualizarlo si se agrega una pantalla o estado.

### JS: globales clásicos, orden de carga fijo

No hay módulos ES (romperían `file://`). Cada archivo expone un global vía IIFE:

| Archivo | Global | Rol |
|---|---|---|
| `mock-data.js` | `ACADEMIA` | Datos + derivados (`aprobados()`, `progresoGeneral()`, `modulo(id)`, `hoyCorto()`) |
| `icons.js` | `ICONS`, `renderIcons()` | Mapa de paths SVG + hidratación |
| `ui.js` | `UI` | `param()`, `showModal()`, `closeModal()`, `loading()`, `sessionExpired()` |
| `quiz.js` | `Quiz` | Máquina de estados de la evaluación (solo lógica, sin DOM) |
| `player.js` | `Player` | Reproductor simulado con umbral del 80 % |

**Orden obligatorio:** `mock-data.js` → `icons.js` → `ui.js` → (`quiz.js` / `player.js`) → script
inline de la página. El script inline de cada página es su controlador.

### Hidratación por `data-*`

`ui.js` completa automáticamente al arrancar, en cualquier página:
`data-user-name`, `data-user-agency`, `data-user-profile`, `data-user-initials`, `data-user-email`,
`data-support-link` (link de WhatsApp con `target="_blank" rel="noopener"`).

También cablea sin configuración: `data-dropdown` + `data-dropdown-trigger` + `data-dropdown-menu`
(menú accesible con flechas y `Esc`), `data-modal-open` / `data-modal-close` (modal con foco
atrapado), `data-sortable` + `data-sort-key` (orden de tabla), `data-counter-for` (contador de
caracteres).

`icons.js` hidrata `<span class="icon" data-icon="nombre">`. Se usa un mapa en JS en vez de un sprite
SVG externo porque `<use href="archivo.svg#id">` no carga bajo `file://`.

## Reglas de negocio que están cableadas

No las cambies sin que venga del alcance funcional. Vienen del wireframe y del MVP acordado:

- Video **visto al 80 %** de la duración, e **irreversible** (no vuelve a incompleto).
- **10 preguntas** al azar del banco, se aprueba con **8** (80 %), **reintentos ilimitados** con set
  nuevo cada vez.
- La evaluación está **siempre habilitada**: no exige haber visto los videos.
- Un intento interrumpido se retoma en **la misma pregunta y con el mismo set** (persiste en
  `localStorage`, clave `academia:intento:<moduloId>`).
- En el repaso de un intento desaprobado **nunca se muestra cuál era la respuesta correcta**, solo se
  marca la elegida. Sin lenguaje punitivo.
- **Una sola Meet por módulo aprobado**, estado permanente: una vez pedida, el CTA se reemplaza por
  texto plano (no es botón, no recibe foco, no está en el orden de tabulación).
- Desbloqueo **secuencial**: aprobar un módulo habilita el siguiente.
- Un **único certificado final**, sin parciales.

## Diseño: dónde está la autoridad

`ESTILOS-ACADEMIA.md` es la guía de diseño extraída del repo `web-2026` (el sitio sigmma.net) y es la
fuente de verdad visual. Contiene además una sección explícita de "qué **no** replicar".

Convenciones que el prototipo aplica y conviene respetar:

- **El borde de gradiente celeste→azul es el gesto de marca** (`.brand-edge`). Está definido una sola
  vez y **encoda estado**: lo lleva la card del módulo en curso (una sola por vez) y el botón
  secundario. No lo repartas.
- **El naranja `#ff6b35` aparece una sola vez en todo el producto**: el botón de descargar el
  certificado. Nunca como color de estado.
- Jerarquía por **borde de 1 px + fondo gris**, no por sombra. Sombra solo en modal y menú.
- Un solo patrón de modal para todo (el sitio original tiene dos, es deuda).
- `prefers-reduced-motion` es parte del sistema, no un agregado.

### Correcciones de accesibilidad sobre la paleta heredada

Tres colores del sistema original no llegan a WCAG AA y se ajustaron. Están documentados en el
`@theme` con el motivo. **No los revirtáis a los hex "de marca" sin recalcular contraste:**

- CTA naranja con texto blanco daba 2.84:1 → el botón lleva texto oscuro (`--color-cta-ink`).
- Verde `#219667` sobre fondo verde claro daba 3.46:1 → el tono de *texto* es `#17694a`.
- Barra de progreso en celeste sobre pista gris daba 1.63:1 → usa el gradiente azul institucional.

## Verificación

No hay tests automatizados. Lo que sí se corre antes de dar algo por terminado:

`design-system.html` se excluye de los tres primeros: es el catálogo, ahí los hex y la mención a
`font-medium` son contenido legítimo.

```bash
PAGS=$(ls *.html | grep -v design-system.html)

grep -n "font-medium\|font-semibold" $PAGS          # → vacío
grep -nE "#[0-9a-fA-F]{6}\b" $PAGS | grep -v href=  # → vacío (sin hex sueltos)
grep -noE "\b(bg|text|border)-(red|blue|green|slate|sky|amber|emerald)-[0-9]{2,3}" $PAGS  # → vacío

# El naranja: solo certificaciones.html (+ design-system.html, que lo cataloga)
grep -ln "btn-cta" *.html
```

Más: recorrer los 21 deep links de `design-system.html` y compararlos contra el wireframe; revisar a
375 / 768 / 1024 px sin scroll horizontal; y probar el recorrido de teclado (foco visible, `Esc` en
modales y menú, foco que vuelve al disparador).

## Git

Repo: `git@github.com:MCeciliaLuna/wireframe-academia-AGENCIA.git`, rama principal **`main`**.

Solo tiene remoto `origin` (a diferencia de otros repos de SIGMMA, no hay remoto `aws`). Commits en
Conventional Commits, en español.
