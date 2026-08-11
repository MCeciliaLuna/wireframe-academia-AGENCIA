# Academia SIGMMA — prototipo de alta fidelidad (lado agencia)

Implementación en HTML + Tailwind de las pantallas del wireframe
`Academia SIGMMA - Wireframes.dc.html`, con el lenguaje visual real de sigmma.net descrito en
[`ESTILOS-ACADEMIA.md`](./ESTILOS-ACADEMIA.md).

Es un prototipo navegable: **no hay backend, ni SSO, ni API, ni YouTube real**. Sirve como referencia
de construcción para desarrollo y como pieza presentable a negocio.

**El contenido es el real del mapa:** 11 módulos BAK, 31 secciones y 55 videos con su ID permanente
`BAK-Mxx.yyy`, tomados del mapa de contenido (`Estrategia_Grabado_..._pareto_v2`) y agrupados en
secciones según la Parte B del cotejo del wireframe. Son ficticias las personas, las dos agencias,
las duraciones, las notas y los bancos de preguntas.

### El recorrido de un vistazo

| Módulo | Plan | Secciones | Videos |
|---|---|---:|---:|
| `BAK-M00` Fundamentos | Professional + Business | 2 | 4 |
| `BAK-M10` File | Professional + Business | 3 | 6 |
| `BAK-M20` Entidades: clientes, pasajeros y proveedores | Professional + Business | 3 | 6 |
| `BAK-M30` Voucher / Servicios | Professional + Business | 4 | 7 |
| `BAK-M40` Cobranzas / Recibos | Professional + Business | 3 | 5 |
| `BAK-M50` Facturación | Professional + Business | 3 | 6 |
| `BAK-M60` Pagos a proveedores | Professional + Business | 2 | 4 |
| `BAK-M70` Caja y bancos | Professional + Business | 3 | 4 |
| `BAK-M80` Informes | Professional + Business ¹ | 2 | 4 |
| `BAK-M90` Contable | **Business** | 3 | 5 |
| `BAK-M95` Receptivo operador | **Business** (nicho) | 3 | 4 |
| | | **31** | **55** |

¹ `BAK-M80.030` (Dashboard de KPIs) es el único video con plan propio: es Business dentro de un
módulo que aplica a los dos planes.

La persona por defecto tiene plan **Professional**, así que su recorrido son **9 módulos**. Los
otros dos se muestran igual, deshabilitados y con un aviso que nombra el plan que los incluye. Con
plan Business el recorrido son los **11** y el candado desaparece — se puede ver entrando como Sofía
(abajo).

---

## Cómo verlo

**Sin instalar nada.** Abrí `index.html` con doble click. El CSS compilado está versionado en
`assets/css/academia.css`, así que el prototipo funciona sobre `file://`.

**Para editar los estilos:**

```bash
npm install
npm run dev         # recompila al guardar src/input.css
npm run build       # compilado minificado para entregar
npm run build:dev   # igual, sin minificar — legible para inspeccionar
npm run build:icons # regenera assets/js/icons.js desde @tabler/icons
npm run serve       # servidor local en http://localhost:4321 (opcional)
```

`assets/css/academia.css` y `assets/js/icons.js` son artefactos generados y **están versionados a
propósito**: es lo que permite abrir cualquier `.html` con doble click sobre `file://`. Si tocás
`src/input.css` o el mapa de `scripts/build-icons.mjs`, regenerá y commiteá el artefacto.

---

## Las pantallas

Viven en 8 archivos (el noveno, `design-system.html`, es el catálogo, no una pantalla del producto):
los estados transversales y los overlays se abren sobre su pantalla padre con
un parámetro en la URL, igual que pasaría en el producto real.
`design-system.html` tiene el índice completo enlazado.

> **Antes de recorrer, abrí cualquier página con `?reset=1`** para volver al estado inicial. Los
> deep links de la tabla se recorren como **Lucía**, la persona por defecto: `BAK-M00` y `BAK-M10`
> aprobados, `BAK-M20` en curso, el resto del recorrido bloqueado, y `BAK-M90` / `BAK-M95` fuera
> del plan.

| # | Pantalla | URL |
|---|---|---|
| 01 | Login | `index.html` |
| 01b | Login con error de credenciales | `index.html?state=error` |
| 02 | Listado de módulos | `modulos.html` |
| 03 | Detalle de módulo (syllabus) | `modulo.html?m=20` |
| 03b | Detalle de módulo aprobado | `modulo.html?m=0` |
| 04 | Reproducción de video | `video.html?v=BAK-M20.030` |
| 05 | Evaluación — intro | `evaluacion.html?m=20` |
| 06 | Evaluación — en curso | `evaluacion.html?m=20&phase=quiz` |
| 07 | Resultado aprobado | `evaluacion.html?m=20&phase=result&score=9` |
| 08 | Resultado desaprobado | `evaluacion.html?m=20&phase=result&score=6` |
| 09 | Coordinar Meet (cola + turnos) | `meet.html?u=martin&m=10` · agendada: `?u=martin&m=20` |
| 10 | Mi progreso y certificación | `certificaciones.html` |
| 10b | Certificación — recorrido completo | `certificaciones.html?state=complete` |
| 10c | Certificación — confirmar los datos del titular | `certificaciones.html?state=complete&cert=datos` |
| 10d | Certificación — documento con formato inválido | `…&cert=error` |
| 10e | Certificación — datos confirmados, qué queda impreso | `…&cert=emitido` |
| 11 | Mi agencia | `agencia.html` · ranking: `?ver=ranking` |
| 12a | Vacío — primera visita al listado | `modulos.html?state=empty` |
| 12b | Vacío — agencia sin actividad | `agencia.html?state=empty` |
| 12c | Error de carga del video | `video.html?state=error` |
| 12d | Carga — skeleton del listado | `modulos.html?state=loading` |
| 13 | Menú de avatar abierto | `modulos.html?menu=open` |
| 14 | Bloque de Meet — los 10 estados | `modulo.html?u=lucia&m=10` · el resto, en `design-system.html` |
| 15 | Confirmación con preguntas sin responder | `evaluacion.html?m=20&phase=quiz&confirm=1` |
| 16 | Sesión expirada (takeover) | cualquier página con `?state=expired` |
| 17 | Guarda — bloqueado por secuencia | `modulo.html?m=50` · igual en `video` / `evaluacion` / `meet` |
| 18 | Guarda — fuera del plan de la agencia | `modulo.html?m=90` · igual en las otras tres |
| 19 | Guarda — no sos el coordinador | `meet.html?u=lucia&m=10` |
| 20 | Meet de un módulo fuera de plan | `meet.html?u=martin&m=90` |
| 21 | Video con plan propio dentro del módulo | `modulo.html?m=80` (requiere haber avanzado) |

`?m=` es el número del módulo en el mapa (`0`, `10`, `20` … `95`), **no** su posición en el recorrido.
`?v=` alcanza solo: el módulo se deduce del ID del video.

### Las cuatro personas de prueba

El avance de una sola usuaria no puede mostrar a la vez el recorrido en curso, el terminado y el que
no empezó. Se cambia con **`?u=`** en cualquier página y queda persistida, así que se puede navegar
sin volver a pasarla. La tabla completa, con los enlaces, está en `design-system.html`.

| `?u=` | Persona | Agencia · plan | Cómo llega |
|---|---|---|---|
| `lucia` *(default)* | Lucía Fernández | Viajes del Sur · Professional | Academia en curso: 2 de 9 aprobados y el tercero empezado |
| `martin` | Martín Ruiz | Viajes del Sur · Professional | Recorrido terminado: 9 de 9, certificado emitido, y coordina las Meets del equipo |
| `nicolas` | Nicolás Vera | Viajes del Sur · Professional | Nunca entró: 0 de 9, solo el primer módulo abierto, sin puesto en el ranking |
| `sofia` | Sofía Bianchi | Andes Receptivo · **Business** | Recorrido de 11: Contable y Receptivo entran, y el dashboard de KPIs se habilita |

El plan es de la **agencia**, no de la persona: por eso Sofía es de otra agencia, con su propio
plantel. Son las mismas personas del plantel de su agencia, así que el ranking y el promedio siguen
cerrando mire quien mire.

`?reset=1` limpia el avance de las cuatro y vuelve a Lucía — salvo que se pase `?u=` en la misma
URL, que entonces entra limpio con esa persona.

### Recorrido completo, sin tocar la URL

Login → listado → módulo 03 (Entidades) → un video (dale play y cruzá el 80 %: el check del sidebar
se actualiza solo) → evaluación → respondé → resultado → volver al listado (el módulo 04 ya está
disponible) → certificaciones → mi agencia. En un módulo ya aprobado, el bloque de Meet al pie
muestra la cola de dudas del equipo y deja dejar la tuya.

Y el recorrido que muestra de qué se trata el modelo: dejá una duda como Lucía (`?u=lucia`), entrá
como Martín (`?u=martin`) y vas a verla con su autor y poder agendar la Meet del equipo; entrá como
Sofía (`?u=sofia`) y no está, porque es de otra agencia.

---

## Estructura

```
├── README.md                    esta guía
├── CLAUDE.md                    guía de trabajo sobre el repo (arquitectura y reglas)
├── ESTILOS-ACADEMIA.md          guía de diseño (fuente de verdad, no se toca)
├── package.json                 @tailwindcss/cli v4 + @tabler/icons
├── scripts/
│   └── build-icons.mjs          mapa nombre-del-repo → Tabler; genera icons.js
├── src/
│   ├── input.css                tokens (@theme) + base + componentes
│   └── partials/app-header.html fuente canónica del chrome de la app
├── assets/
│   ├── css/academia.css         GENERADO por npm run build, versionado
│   ├── fonts/                   Sofia Sans (400/700), de web-2026
│   ├── img/logo.svg             de web-2026
│   └── js/
│       ├── mock-data.js         11 módulos con su syllabus, bancos, dos agencias,
│       │                        las cuatro personas de prueba y las reglas
│       ├── icons.js             GENERADO por npm run build:icons, versionado
│       ├── ui.js                modal, menú, tooltip, tablas, ?state=
│       ├── quiz.js              máquina de estados de la evaluación
│       ├── player.js            reproductor simulado con umbral del 80 %
│       ├── meet.js              bloque de estado, cola de dudas y formulario
│       └── certificado.js       datos del titular antes de descargar
└── *.html                       8 pantallas + design-system.html
```

**El chrome está duplicado en las 6 páginas que lo llevan** —`modulos`, `modulo`, `video`, `meet`,
`agencia` y `certificaciones`—, a propósito: así los `.html` se abren con doble click, sin build ni
servidor. La versión canónica es `src/partials/app-header.html` y cada copia está marcada con
`<!-- app-shell: sincronizar con src/partials/app-header.html -->`. Si tocás el header, replicalo en
las 6. Las otras tres no lo llevan: `index.html` no tiene chrome, `evaluacion.html` lleva uno
reducido —durante un intento no hay navegación lateral— y `design-system.html` lo muestra como
muestra.

---

## Decisiones de diseño

Donde la guía manda, se siguió al pie de la letra. Donde marca un hueco o una deuda, se decidió:

| # | Punto | Decisión |
|---|---|---|
| 1 | **Chrome de 108 px** | Una sola barra de 72 px, la altura real del navbar del sistema. Se descartó la topbar de 36 px: la Academia es una app y no tiene links institucionales que justifiquen una segunda fila. |
| 2 | **Gesto de marca** | El borde de gradiente celeste→azul **encoda estado**: lo lleva la card del módulo en curso, y hay una sola por vez. También el botón secundario y el panel del login. Definido una sola vez (en `web-2026` está triplicado). |
| 3 | **Card de módulo** | Hereda radio 16, borde 1 px, superficie `#f9fafb`, título en índigo y el hover firma (borde azul + wash celeste 10 %, sin elevación). No hereda el alto mínimo de 382 px ni el bloque de imagen. |
| 4 | **Tamaños de botón** | S 36 / M 44 / L 48, radio 12. El `min-width: 223px` de la guía **no se trasladó**: ninguna pantalla tiene un CTA de página completa que lo justifique; donde hace falta ancho manda `.btn-block`. Se agregaron los estados que faltaban: deshabilitado, cargando y variante fantasma. |
| 5 | **Naranja `#ff6b35`** | Una sola aparición en todo el producto: «Descargar certificado PDF» cuando está disponible. Nunca como color de estado. |
| 6 | **Tokens de estado** | Se creó el set que no existía: `error` y `warning` nuevos, `success` e `info` anclados en la marca. |
| 7 | **Escala tipográfica** | Fluida con `clamp()` entre 375 y 1440 px, en el tramo bajo: H1 40→48. La escala del sitio comercial (H1 de 72) es de landing y en una app desborda. |
| 8 | **Pesos** | Solo 400 y 700. `font-medium` y `font-semibold` se borraron del theme: no compilan, así que no pueden colarse. |
| 8b | **Una sola familia** | La guía lista Roboto como secundaria «para texto largo», pero la Academia no tiene texto largo: el copy más extenso son las descripciones de sección, de dos o tres renglones. Cargar una segunda familia que ningún selector aplica son ~80 KB de woff2 que el navegador baja para nada, así que Roboto se sacó. Si entra texto corrido de verdad, vuelve con su bloque de métricas. |
| 9 | **Nombres de color** | Por rol (`primary`, `accent`, `indigo`, `success`…), nunca `color-2-normal`. |
| 10 | **Modal** | Uno solo para todo el producto, con foco atrapado y `Esc`: el de dejar una duda y el de confirmar una cancelación usan el mismo. |
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

### Dos candados, no uno

Hay **dos** reglas que deciden si un módulo se puede abrir, y dicen cosas distintas:

- **Secuencia.** Un módulo se abre solo si el anterior **del recorrido** tiene la evaluación aprobada.
  El aviso nombra el prerequisito y el CTA lleva al módulo donde sí hay algo que hacer (no al anterior,
  que puede estar bloqueado también).
- **Plan de la agencia.** Un módulo que el plan no incluye se muestra igual, deshabilitado, con un
  aviso que nombra el plan que lo tiene y el canal de soporte. No hay nada que la usuaria pueda
  resolver sola, así que «aprobá el anterior» acá no sirve. Estos módulos **no entran a la cadena de
  desbloqueo ni a ninguna base de cálculo**: aprobar `BAK-M80` cierra el recorrido de una agencia
  Professional, y `BAK-M90` nunca se habilita.

Las dos están aplicadas de punta a punta, no solo escondiendo links:

- En el listado y en la tabla de certificaciones, los módulos bloqueados **no son links**: el título
  es texto plano y el motivo al lado, fuera del orden de tabulación.
- Escribir `modulo.html?m=90` a mano tampoco entra: las **cuatro** pantallas que dan acceso a un
  módulo —`modulo.html`, `video.html`, `evaluacion.html` y `meet.html`— tienen la guarda.
- `meet.html` es la excepción, a propósito: el coordinador agenda la Meet del equipo por su rol, así
  que ahí el **plan** bloquea pero la **secuencia** no. Sofía puede agendar `BAK-M40` sin haberlo
  aprobado, y sigue sin poder abrir su contenido.
- **Aprobar desbloquea de verdad.** Las aprobaciones se guardan en `localStorage` —con una clave por
  persona, así que aprobar como una no le ensucia el avance a otra—, y si aprobás `BAK-M20`,
  `BAK-M30` queda disponible en todas las pantallas. **`?reset=1` en cualquier página** vuelve al
  estado inicial — conviene usarlo antes de una demo.

El número que ve el usuario es la **posición en el recorrido** (1 a 9 con Professional, 1 a 11 con
Business), nunca el id del módulo: los ids del mapa van de 10 en 10 y saltan. Un módulo fuera de plan
no tiene posición, así que en su lugar lleva el ícono del plan.

### Progreso: por usuario, agregado por agencia

El avance y el desbloqueo son **por usuario**. `agencia.html` muestra el agregado, con la regla de
agregación nombrada en la propia pantalla: promedio de módulos aprobados por persona sobre los del
recorrido del plan. Toda base de cálculo son los **módulos del recorrido** (9 con Professional, 11
con Business), nunca los 11 del mapa por defecto.

### Diferencias con el wireframe y con el cotejo

- El wireframe dice «3 de 10 módulos aprobados» pero muestra dos cards aprobadas. Acá **todos los
  números salen del mismo dato**, así que el listado, el certificado y la vista de agencia siempre
  coinciden.
- El wireframe muestra un módulo como «Disponible» mientras el anterior está En curso, lo que
  contradice su propia regla de desbloqueo. Acá arranca **bloqueado**: la regla no admite excepción.
- El cotejo (P02.3) dice que un módulo que no aplica al perfil **no se muestra**. Acá se muestra
  deshabilitado con aviso de plan: es una decisión tomada a propósito, porque además de pedagógica es
  una superficie comercial. Como nada se oculta, tampoco hay huecos en la numeración.
- Tres secciones **rompen el orden de ID** y está bien: `BAK-M40.S3` muestra `050` antes de `040`,
  `BAK-M70.S1` muestra `030` después de `010`, y `BAK-M80.S2` muestra `040` antes de `030`. El
  agrupamiento pedagógico manda sobre la secuencia del ID, y el ID nunca se mueve.
- La nomenclatura de planes es la del **mapa de contenido** (Professional / Business). El alcance
  funcional del MVP dice Corporate / Business / Standard: ese documento queda para corregir.
- La notación de baja fidelidad (subrayado punteado = dato dinámico, recuadros `[placeholder]`,
  anotaciones amarillas) no se traslada: era instrumental al wireframe.

### Decisiones abiertas

Lo que el prototipo resuelve de una manera pero **todavía no está decidido**. La tabla completa está
en `design-system.html`, sección «Decisiones abiertas». Las dos que más importan:

- **Cómo se mide el 80 % de un video** (P04.3). El prototipo usa la posición del cursor, así que
  arrastrar la barra al final marca el video como visto. **No es el criterio de producción.** La
  alternativa es acumular segundos efectivamente reproducidos (anti-scrub). La IFrame API de YouTube
  alcanza para eso —expone `getCurrentTime()`, `getDuration()` y `onStateChange`—, o sea que la
  elección es de producto, no una restricción técnica.
- **Los bancos de preguntas de `BAK-M40` a `BAK-M95`** no están escritos: es trabajo de contenido.
  Mientras tanto esos módulos sortean sobre un banco de estructura, y la antesala de la evaluación
  lo avisa. Escritos y reales: M00, M10, M20 y M30. Los once bancos tienen **12 preguntas** —el
  mínimo que garantiza un set nuevo en cada reintento—; el tamaño de producción también está por
  decidir, así que la antesala muestra el número **desde el modelo**, nunca una constante de copy.
- **De dónde sale el documento del titular del certificado** (CE-1 / CE-2). El modelo no lo tiene: en
  el producto llegaría del SSO o del backoffice y el campo vendría precargado. Acá lo captura la
  Academia antes de cada descarga, valida solo el **formato** —nunca coincidencia, no hay contra qué
  cotejar— y **no persiste nada**.

Lo que quedó **cerrado por decisión** y por eso no está construido: el estado `vacío` /
«Próximamente» (un módulo se publica solo con su syllabus completo, así que no puede pasar).

---

## Verificado

- Compila con `@tailwindcss/cli` 4.3.3, sin errores.
- **11 módulos, 31 secciones, 55 videos**, con los títulos e IDs del mapa de contenido.
- Los bancos: `subtema` es siempre una sección de su propio módulo, ninguna respuesta correcta cae
  fuera de rango, ningún banco tiene 10 preguntas o menos, ningún enunciado se repite dentro de un
  banco.
- Las URLs de la tabla renderizan la pantalla correcta, verificadas cargando cada página en Chrome
  headless y leyendo el DOM ya hidratado: los ordinales del listado van de 1 a 9 sin huecos, las dos
  cards fuera de plan no tienen ordinal, las tres secciones que rompen el orden de ID lo muestran, el
  video con plan propio se lista sin link, y aprobar el último módulo del recorrido cierra el
  certificado sin ofrecer `BAK-M90`.
- Las guardas de módulo cortan con el aviso correcto según el motivo (secuencia o plan), y
  `meet.html` suma las suyas: solo el coordinador, y solo con cola abierta.
- **Los diez estados del bloque de Meet**, cada uno con su URL en `design-system.html`, y la cola
  compartida entre las personas de una misma agencia y aislada de la otra.
- Todas las bases de cálculo son los módulos del recorrido, coincidentes entre el listado, el
  certificado y la vista de agencia: 9 con Professional, 11 con Business.
- **Las cuatro personas de prueba**, cada una recorrida entera: Lucía en 2 de 9, Martín en 9 de 9 con
  el certificado descargable y 1º en el ranking, Nicolás en 0 de 9 sin puesto, y Sofía en 3 de 11 con
  los ordinales de 1 a 11 sin huecos. El plantel de cada agencia da los mismos números mirado desde
  cualquiera de ellas.
- El avance de cada persona está aislado: aprobar como una no mueve a las demás, `?u=` sobrevive a la
  navegación, `?u=nicolas&reset=1` entra limpio como Nicolás y un `?u=` inválido cae en Lucía.
- Sin aritmética sobre el id del módulo y sin contadores de videos paralelos al syllabus.
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
del PDF del certificado (el prototipo confirma los datos que irían impresos y ahí termina), y el
panel interno de staff SIGMMA — el wireframe cubre solo el lado agencia.
