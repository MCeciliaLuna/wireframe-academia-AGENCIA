# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Prototipo navegable de alta fidelidad de la **Academia de Autocapacitación SIGMMA** (lado agencia),
derivado de un wireframe de baja fidelidad de 16 pantallas. Ticket Jira: **SGM-1834**.

No es una aplicación de producción: **no hay backend, SSO, API ni YouTube real**. El reproductor de
video está simulado. Sirve como referencia de construcción para desarrollo y como pieza presentable a
negocio.

**Los módulos, secciones y videos son los reales del mapa de contenido**, no inventados: 11 módulos
BAK, 31 secciones y 55 videos con su ID permanente `BAK-Mxx.yyy`, tomados de
`ACADEMIA-BACKLOG/Estrategia_Grabado_Academia_SIGMMA_mapa_pareto_v2.md.pdf`, con el agrupamiento en
secciones de `Cotejo_Wireframe_Academia_SIGMMA.md` (Parte B). Sí son ficticias las personas, la
agencia, las duraciones de los videos, las notas y los bancos de preguntas. Todo vive en
`assets/js/mock-data.js`.

Documentos de referencia, fuera de este repo:

| Documento | Qué define |
|---|---|
| `ACADEMIA-BACKLOG/MD-PROYECTO-CLAUDE.md` | Alcance funcional del MVP: jerarquía de datos, ABMs, reglas de negocio |
| `ACADEMIA-BACKLOG/Estrategia_Grabado_..._pareto_v2.md.pdf` | Mapa de contenido: los 55 videos con ID, tag de plan y prioridad Pareto |
| `Cotejo_Wireframe_Academia_SIGMMA.md` | Cotejo de 82 casos del flujo + propuesta de secciones |

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

### El contrato de URL: todas las pantallas en 9 archivos

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
| `?m=` | `0`, `10`, `20` … `95` | Módulo. Es el número del mapa, **no** la posición en el recorrido |
| `?v=` | `BAK-M20.030` | Video, por ID permanente. Alcanza solo: el módulo se deduce del video |
| `?reset=1` | — | Vuelve el prototipo al estado inicial |

**Nunca leas `?m=` a mano.** Usá `UI.moduloDeLaUrl()`: el primer módulo del recorrido tiene `id: 0`
(`BAK-M00`), así que cualquier `Number(UI.param("m") || 30)` suelto lo trataría como ausente. Sin
`?m=`, el helper cae en `moduloActual()`.

`?state=expired` funciona en **cualquier** página (lo maneja `ui.js` de forma global).
`design-system.html` tiene la tabla completa de las URLs enlazada — es el índice canónico y hay que
actualizarlo si se agrega una pantalla o estado. Ahí está también la tabla de **decisiones abiertas**,
que hay que mantener sincronizada con lo que el prototipo resuelve de una manera sin que esté decidido.

### JS: globales clásicos, orden de carga fijo

No hay módulos ES (romperían `file://`). Cada archivo expone un global vía IIFE:

| Archivo | Global | Rol |
|---|---|---|
| `mock-data.js` | `ACADEMIA` | Datos + derivados (`recorrido()`, `posicion(id)`, `estadoEfectivo(id)`, `secciones(id)`, `banco(id)`) |
| `icons.js` | `ICONS`, `renderIcons()` | Mapa de paths SVG + hidratación |
| `ui.js` | `UI` | `param()`, `moduloDeLaUrl()`, `showModal()`, `avisoPantalla()`, `bloquearModulo()`, `sessionExpired()` |
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
- Un **único certificado final**, sin parciales.
- El `sub-tema` de cada pregunta es **el nombre de una sección de su módulo**. Las dos taxonomías
  están alineadas a propósito: es lo que después permite garantizar cobertura por sección en el
  sorteo y sugerir los videos de la sección fallada.

### El recorrido: plan de la agencia + desbloqueo secuencial

Hay **dos** reglas que deciden si un módulo se puede abrir, y no dicen lo mismo. Las dos viven enteras
en `mock-data.js` y **ninguna pantalla las reimplementa**:

**1 · Plan de la agencia.** Cada módulo declara `planes: ["Professional", "Business"]`. El recorrido
de la usuaria son los módulos que su plan incluye. Los que no incluye **se muestran igual**,
deshabilitados y con un aviso que nombra el plan que sí los tiene — son una superficie comercial además
de pedagógica. Pero **no entran a la cadena de desbloqueo ni a ninguna base de cálculo**: para una
agencia Professional, aprobar `BAK-M80` completa el recorrido y `BAK-M90` nunca se habilita.

**2 · Desbloqueo secuencial.** Un módulo se habilita solo si el anterior **del recorrido** tiene la
evaluación aprobada. El primero siempre está abierto.

| Función | Para qué |
|---|---|
| `ACADEMIA.recorrido()` | Los módulos del plan, en orden. Es la lista sobre la que corre todo lo demás |
| `ACADEMIA.aplica(id)` | ¿El plan de la agencia lo incluye? |
| `ACADEMIA.posicion(id)` / `rotulo(id)` | Posición 1..N en el recorrido, y `"Módulo 04"`. **Es el único número de módulo que va a pantalla:** los ids del mapa van de 10 en 10 y saltan (95 sigue a 90). `null` para un módulo fuera de plan |
| `ACADEMIA.desbloqueado(id)` | ¿Puede entrar? Contempla las dos reglas |
| `ACADEMIA.motivoBloqueo(id)` | `null` \| `"secuencia"` \| `"plan"`. La razón, para poder decir cosas distintas |
| `ACADEMIA.estadoEfectivo(id)` | Estado a mostrar, con las dos reglas aplicadas. `plan` gana sobre todo; después manda la secuencia, en las dos direcciones. **Nunca leer `m.estado` crudo para pintar.** |
| `ACADEMIA.prerequisito(id)` / `siguienteModulo(id)` | El anterior y el siguiente **del recorrido**, no `id ± 1` |
| `ACADEMIA.moduloActual()` | Primer módulo habilitado sin aprobar. Es el destino de los CTA de las pantallas de bloqueo: el anterior puede estar bloqueado también y se rebota |
| `ACADEMIA.registrarAprobacion(id, nota)` | Deja el módulo aprobado de forma persistente |
| `UI.bloquearModulo(modulo)` | Guarda de acceso. Lee el motivo y pinta el aviso que corresponde. Devuelve `true` si bloqueó → el controlador tiene que `return` |

**Nunca hagas aritmética sobre el id.** `id - 1` no es el módulo anterior: los ids son `0, 10, 20 … 90,
95`, y además el anterior del recorrido puede no ser el anterior del mapa si el plan saltea uno.

**Esconder el link no alcanza: la URL es adivinable.** Las **cuatro** pantallas que dan acceso a un
módulo —`modulo.html`, `video.html`, `evaluacion.html` y `meet.html`— arrancan su script inline con:

```js
const m = UI.moduloDeLaUrl();
if (UI.bloquearModulo(m)) return;
```

Si agregás una pantalla que dé acceso a un módulo, va a necesitar la misma guarda. `meet.html` suma
una precondición propia: la Meet existe solo para un módulo **aprobado**.

### Plan a nivel video

`BAK-M80.030` (Dashboard de KPIs) es el único video con `planes` propio, distinto del de su módulo. El
alcance funcional del MVP pone el plan en el módulo, así que esto es una extensión: se le aplica la
misma regla —se lista con su aviso y no cuenta para el progreso ni para la duración de su sección—.
Está anotado como decisión a confirmar en la tabla de `design-system.html`.

Para contar, usá siempre `videosAplicables(id)` / `vistosDelModulo(id)` / `progresoModulo(id)`, no
`videosDelModulo(id)` (que devuelve todos, incluido el que el plan no habilita).

### Aprobaciones que persisten

El prototipo no tiene backend, pero el desbloqueo no se puede demostrar si aprobar se olvida al
navegar. `mock-data.js` guarda las aprobaciones en `localStorage` (clave `academia:aprobados`) y las
aplica sobre el mock al arrancar. Consecuencias al trabajar acá:

- **`?reset=1` en cualquier página** vuelve el prototipo al estado inicial (borra aprobaciones e
  intentos de quiz). Usalo antes de comparar contra el wireframe o de una demo.
- Solo un intento **realmente terminado** registra la aprobación (en `terminar()`, no en
  `pintarResultado()`): los deep links `?phase=result` son para mirar la pantalla y no ensucian el
  estado.
- El estado inicial es: perfil **Professional**, `BAK-M00` y `BAK-M10` aprobados, `BAK-M20` en curso
  (2 de 6 vistos), `BAK-M30` a `BAK-M80` bloqueados por secuencia, y `BAK-M90` / `BAK-M95` con candado
  de plan.

### Progreso: por usuario, agregado por agencia (Opción C)

Decisión ratificada. El avance y el desbloqueo son **por usuario**; la agencia se mira **agregada** en
`agencia.html`. Las dos cosas conviven y hay que decirlo en pantalla: sin nombrarlo, dos números
distintos se leen como un error de la pantalla.

La regla de agregación es explícita: **promedio de módulos aprobados por persona sobre los del
recorrido del plan**, y está rotulada en la propia pantalla. Toda base de cálculo —progreso general,
certificado, promedio de la agencia— usa `ACADEMIA.total()`, que son los módulos **del recorrido**
(9 con Professional), nunca los 11.

### Bancos de preguntas: cuatro escritos, siete de estructura

`ACADEMIA.banco(moduloId)` devuelve el banco del módulo, nunca uno global. `BAK-M00`, `BAK-M10`,
`BAK-M20` y `BAK-M30` tienen preguntas escritas de verdad. Los otros siete usan `bancoEstructural()`,
que genera 12 preguntas sobre la **estructura** del módulo (a qué sección pertenece cada video, qué
videos componen cada sección). No afirman nada sobre el comportamiento del producto, que es lo que no
se puede inventar, y la antesala lo avisa cuando `modulo.bancoEstructural` es `true`.

Al escribir un banco real, el `subtema` de cada pregunta tiene que ser el título de una sección de ese
módulo, y el banco tiene que quedar con **más de 10 preguntas**: con exactamente 10, dos intentos
seguidos traerían el mismo set y se rompería la regla de "set nuevo cada vez".

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

### Integridad del modelo de contenido

```bash
grep -c 'codigo: "BAK-M' assets/js/mock-data.js   # → 11 módulos
grep -c 'v("BAK-M'        assets/js/mock-data.js   # → 55 videos

# Sin aritmética de id ni contadores paralelos al syllabus
grep -nE "\.id - 1|\.id \+ 1|n <= 1" assets/js/*.js *.html   # → vacío
grep -rn "m\.videos\b" *.html                                 # → vacío
```

Y con Node, que carga `mock-data.js` sin navegador — 31 secciones, subtemas que son secciones de su
módulo, y ningún banco de 10 o menos:

```bash
node -e '
global.window = { location:{search:""}, localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}} };
require("./assets/js/mock-data.js"); const A = window.ACADEMIA;
let s=0,v=0; A.modulos.forEach(m=>{s+=m.secciones.length;m.secciones.forEach(x=>v+=x.videos.length)});
console.log("módulos",A.modulos.length,"secciones",s,"videos",v,"| base",A.total());
let mal=[]; A.modulos.forEach(m=>{const n=m.secciones.map(x=>x.titulo);
  if(A.banco(m.id).length<=A.quizConfig.preguntasPorIntento) mal.push(m.codigo+" banco chico");
  A.banco(m.id).forEach(q=>{ if(n.indexOf(q.subtema)<0) mal.push(q.id+" subtema");
    if(!(q.correcta>=0&&q.correcta<q.opciones.length)) mal.push(q.id+" rango"); })});
console.log(mal.length?mal:"integridad de bancos ok");'
```

### Recorrido en el navegador

Con `google-chrome --headless=new --dump-dom` se puede verificar el DOM ya hidratado sin abrir nada a
mano — así se validaron las guardas y los conteos de esta versión.

Siempre arrancando con `?reset=1`. Lo mínimo: las **cuatro** guardas de módulo con sus dos motivos
(`?m=50` secuencia, `?m=90` plan, en `modulo` / `video` / `evaluacion` / `meet`); que los ordinales del
listado vayan de 1 a 9 **sin huecos** y las dos cards fuera de plan no tengan ordinal; que `?m=40`
muestre la sección 3 con el video `050` antes del `040`; que `?m=80` liste el dashboard de KPIs sin
link; y que aprobar `BAK-M80` cierre el recorrido **sin** ofrecer `BAK-M90`.

Más: recorrer los deep links de `design-system.html` y compararlos contra el wireframe; revisar a
375 / 768 / 1024 px sin scroll horizontal; y probar el recorrido de teclado (foco visible, `Esc` en
modales y menú, foco que vuelve al disparador).

## Git

Repo: `git@github.com:MCeciliaLuna/wireframe-academia-AGENCIA.git`, rama principal **`main`**.

Solo tiene remoto `origin` (a diferencia de otros repos de SIGMMA, no hay remoto `aws`). Commits en
Conventional Commits, en español.
