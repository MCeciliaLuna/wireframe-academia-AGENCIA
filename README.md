# Academia SIGMMA — prototipo de alta fidelidad (lado agencia)

Implementación en HTML + Tailwind de las 16 pantallas del wireframe
`Academia SIGMMA - Wireframes.dc.html`, con el lenguaje visual real de sigmma.net descrito en
[`ESTILOS-ACADEMIA.md`](./ESTILOS-ACADEMIA.md).

Es un prototipo navegable con datos ficticios: **no hay backend, ni SSO, ni API, ni YouTube real**.
Sirve como referencia de construcción para desarrollo y como pieza presentable a negocio.

---

## Cómo verlo

**Sin instalar nada.** Abrí `index.html` con doble click. El CSS compilado está versionado en
`assets/css/academia.css`, así que el prototipo funciona sobre `file://`.

**Para editar los estilos:**

```bash
npm install
npm run dev      # recompila al guardar src/input.css
npm run build    # compilado minificado para entregar
npm run serve    # servidor local en http://localhost:4321 (opcional)
```

---

## Las 16 pantallas

Viven en 9 archivos: los estados transversales y los overlays se abren sobre su pantalla padre con
un parámetro en la URL, igual que pasaría en el producto real.
`design-system.html` tiene el índice completo enlazado.

| # | Pantalla | URL |
|---|---|---|
| 01 | Login | `index.html` |
| 01b | Login con error de credenciales | `index.html?state=error` |
| 02 | Listado de módulos | `modulos.html` |
| 03 | Detalle de módulo (syllabus) | `modulo.html` |
| 04 | Reproducción de video | `video.html` |
| 05 | Evaluación — intro | `evaluacion.html` |
| 06 | Evaluación — en curso | `evaluacion.html?phase=quiz` |
| 07 | Resultado aprobado | `evaluacion.html?phase=result&score=9` |
| 08 | Resultado desaprobado | `evaluacion.html?phase=result&score=6` |
| 09 | Solicitud de Meet | `meet.html` · confirmación: `meet.html?state=sent` |
| 10 | Mis certificaciones — en progreso | `certificaciones.html` |
| 10b | Mis certificaciones — recorrido completo | `certificaciones.html?state=complete` |
| 11 | Mi agencia | `agencia.html` |
| 12a | Vacío — primera visita al listado | `modulos.html?state=empty` |
| 12b | Vacío — agencia sin actividad | `agencia.html?state=empty` |
| 12c | Error de carga del video | `video.html?state=error` |
| 12d | Carga — skeleton del listado | `modulos.html?state=loading` |
| 13 | Menú de avatar abierto | `modulos.html?menu=open` |
| 14 | Variante «Meet ya solicitada» | `modulo.html?m=2&meet=solicitada` |
| 15 | Confirmación con preguntas sin responder | `evaluacion.html?phase=quiz&confirm=1` |
| 16 | Sesión expirada (takeover) | cualquier página con `?state=expired` |

También aceptan `?m=<1-10>` para cambiar de módulo y `?v=<id>` para cambiar de video.

### Recorrido completo, sin tocar la URL

Login → listado → módulo 03 → un video (dale play y cruzá el 80 %: el check del sidebar se
actualiza solo) → evaluación → respondé → resultado → solicitar Meet → volver al módulo (ya dice
«Meet solicitada el DD/MM») → certificaciones → mi agencia.

---

## Estructura

```
├── ESTILOS-ACADEMIA.md          guía de diseño (fuente de verdad, no se toca)
├── package.json                 @tailwindcss/cli v4
├── src/
│   ├── input.css                tokens (@theme) + base + componentes
│   └── partials/app-header.html fuente canónica del chrome de la app
├── assets/
│   ├── css/academia.css         compilado y versionado
│   ├── fonts/                   Sofia Sans + Roboto (400/700), de web-2026
│   ├── img/logo.svg             de web-2026
│   └── js/
│       ├── mock-data.js         módulos, videos, banco de preguntas, personas
│       ├── icons.js             set de iconos, hidratados en el cliente
│       ├── ui.js                modal, menú, tooltip, tablas, ?state=
│       ├── quiz.js              máquina de estados de la evaluación
│       └── player.js            reproductor simulado con umbral del 80 %
└── *.html                       9 pantallas + design-system.html
```

**El chrome está duplicado en las 8 páginas de app**, a propósito: así los `.html` se abren con
doble click, sin build ni servidor. La versión canónica es `src/partials/app-header.html` y cada
copia está marcada con `<!-- app-shell: sincronizar con src/partials/app-header.html -->`. Si tocás
el header, replicalo en las 8.

---

## Decisiones de diseño

Donde la guía manda, se siguió al pie de la letra. Donde marca un hueco o una deuda, se decidió:

| # | Punto | Decisión |
|---|---|---|
| 1 | **Chrome de 108 px** | Una sola barra de 72 px, la altura real del navbar del sistema. Se descartó la topbar de 36 px: la Academia es una app y no tiene links institucionales que justifiquen una segunda fila. |
| 2 | **Gesto de marca** | El borde de gradiente celeste→azul **encoda estado**: lo lleva la card del módulo en curso, y hay una sola por vez. También el botón secundario y el panel del login. Definido una sola vez (en `web-2026` está triplicado). |
| 3 | **Card de módulo** | Hereda radio 16, borde 1 px, superficie `#f9fafb`, título en índigo y el hover firma (borde azul + wash celeste 10 %, sin elevación). No hereda el alto mínimo de 382 px ni el bloque de imagen. |
| 4 | **Tamaños de botón** | S 36 / M 44 / L 48, radio 12. El `min-width: 223px` de la guía queda solo para el CTA de pantalla completa. Se agregaron los estados que faltaban: deshabilitado, cargando y variante fantasma. |
| 5 | **Naranja `#ff6b35`** | Una sola aparición en todo el producto: «Descargar certificado PDF» cuando está disponible. Nunca como color de estado. |
| 6 | **Tokens de estado** | Se creó el set que no existía: `error` y `warning` nuevos, `success` e `info` anclados en la marca. |
| 7 | **Escala tipográfica** | Fluida con `clamp()` entre 375 y 1440 px, en el tramo bajo: H1 40→48. La escala del sitio comercial (H1 de 72) es de landing y en una app desborda. |
| 8 | **Pesos** | Solo 400 y 700. `font-medium` y `font-semibold` se borraron del theme: no compilan, así que no pueden colarse. |
| 9 | **Nombres de color** | Por rol (`primary`, `accent`, `indigo`, `success`…), nunca `color-2-normal`. |
| 10 | **Modal** | Uno solo para todo el producto, con foco atrapado, `Esc` y confirmación in-place en la solicitud de Meet. |
| 11 | **Breakpoints** | Tres y cerrados: base, `md` 768, `lg` 1024. Los demás se borraron del theme. |
| 12 | **`prefers-reduced-motion`** | Parte del sistema, no un agregado: anula `transform` y el shimmer, y baja las duraciones a 1 ms. |

### Correcciones de accesibilidad sobre la paleta heredada

Tres colores del sistema actual no llegan a AA y se ajustaron:

- **Naranja de CTA con texto blanco: 2.84:1.** Se conserva el hex exacto de marca y el botón lleva
  texto oscuro (`#111827`, 6.26:1).
- **Verde oscuro `#219667` sobre el fondo verde claro: 3.46:1.** El tono de *texto* bajó a `#17694a`
  (6.17:1). El verde medio de marca `#2dbe83` se mantiene para rellenos.
- **Relleno de la barra de progreso en celeste sobre la pista gris: 1.63:1.** Pasó al gradiente azul
  institucional (`#006fe0 → #003f7f`, 3.90:1). El celeste queda donde la guía dice que va: el borde
  de gradiente y los washes al 10 %.

### Diferencias con el wireframe

- El wireframe dice «3 de 10 módulos aprobados» pero muestra dos cards aprobadas. Acá **todos los
  números salen del mismo dato** (`mock-data.js`), así que el listado, el certificado y la vista de
  agencia siempre coinciden: 2 de 10.
- La notación de baja fidelidad (subrayado punteado = dato dinámico, recuadros `[placeholder]`,
  anotaciones amarillas) no se traslada: era instrumental al wireframe.
- Solo el módulo 03 tiene syllabus cargado. Los demás lo reutilizan.

---

## Verificado

- Compila con `@tailwindcss/cli` 4.3.3, sin errores.
- Las 21 URLs de la tabla renderizan la pantalla correcta.
- Sin scroll horizontal en ninguna página a 375, 768 y 1024 px.
- Un solo `<h1>` visible por pantalla y jerarquía de headings sin saltos.
- Sin imágenes sin `alt`, sin botones o links sin nombre accesible, sin campos sin label, sin IDs
  duplicados, sin foco alcanzable dentro de una card bloqueada.
- 17 pares de color críticos contra WCAG AA (4.5:1 texto, 3:1 gráficos): todos pasan.
- Sin `font-medium`/`font-semibold`, sin hex sueltos en el HTML, sin colores fuera del theme.
- El naranja aparece una sola vez, en `certificaciones.html`.

Lo que queda para probar a mano en un navegador real: el recorrido de teclado completo (foco
visible, `Esc` en modales y menú, foco que vuelve al disparador), y el comportamiento con
`prefers-reduced-motion` activo.

---

## Fuera de alcance

Backend, SSO real, API, la YouTube IFrame Player API (el reproductor está simulado), la generación
del PDF del certificado, y el panel interno de staff SIGMMA — el wireframe cubre solo el lado
agencia.
