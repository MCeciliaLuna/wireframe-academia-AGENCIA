# Rediseño de KPI cards + card de ranking — Academia SIGMMA / dashboard "Mi agencia"

## Objetivo
Darte a vos (desarrolladora frontend) opciones concretas y fundamentadas para agregar íconos, color y destaques a las 4 tarjetas de métricas superiores (PERSONAS, CON ACTIVIDAD, COMPLETADO, SIN EMPEZAR) y a la card "Tu puesto en Viajes del Sur", **sin tocar el layout** ni el resto del dashboard, y compatible con tu design system (Tailwind + tokens semánticos, modo claro, Sofia Sans, paleta definida, WCAG 2.2 AA).

## TL;DR
- **Librería de íconos: adoptá Lucide.** Es el fork mantenido de Feather (licencia ISC, uso comercial libre sin atribución, tree-shakeable, 1.756 íconos según Iconify, plugin oficial de Figma y paquete vanilla `lucide`). Los nombres que ya usás vienen justamente de Feather/Lucide, así que la compatibilidad es casi total — con **7 renombres** que tenés que corregir (tabla en §1).
- **Color: implementá la Opción C ("una estrella")** como default, con la Opción A (mínima monocromo) como fallback sobrio. Colorear las 4 métricas distinto (Opción B) es el patrón que la evidencia de dataviz desaconseja como default: la neutralidad con un solo acento comunica mejor y evita la "semaforización injusta".
- **Card de ranking: convertí el estado vacío en un "teachable moment"** (NN/G) con ícono `trophy` atenuado, tu microcopy actual ("Vas a entrar al ranking cuando apruebes tu primer módulo") y, cuando la persona rankee, una posición sobria (posición+delta en agencias chicas, percentil/"top X%" en grandes) — nada de estética infantil.

---

## 1. Recomendación de librería de íconos

### Recomendación: **Lucide** (lucide.dev)

**Hecho confirmado.** Lucide es un fork community-driven de Feather Icons. Feather "esencialmente dejó de recibir actualizaciones alrededor de 2020" cuando su creador Cole Bemis se corrió, y Lucide nació para "continuar donde Cole Bemis lo dejó". Según la página oficial de comparación de Lucide (lucide.dev/guide/comparison): *"With more than 300 open issues and over 100 open PRs, the Feather Icons project has been abandoned… Lucide now has over 1000 icons, while Feather has around 287 icons."* Hoy Iconify lista **exactamente 1.756 íconos** para Lucide ("Lucide icon set - 1756 open source icons", icon-sets.iconify.design/lucide), diseñados sobre grilla de 24×24 con trazo de 2px, `stroke-linecap`/`linejoin` redondeados y `currentColor` (heredan el color del texto por CSS).

La metadata de Iconify indica textualmente sobre la licencia: *"License: ISC (No attribution required, commercial use is allowed)"*, y el GitHub de Lucide confirma que es *"totally free for commercial use and personal use… licensed under the ISC License"* (ISC es funcionalmente equivalente a MIT). Tiene **plugin oficial de Figma** y **paquete vanilla `lucide`** (`<i data-lucide="nombre">`), además de wrappers para React/Vue/Svelte/Angular. Todos tree-shakeable.

### Por qué Lucide y no las otras

| Librería | Cantidad | Licencia | Trazo/estilo | Compatibilidad con tus nombres | Veredicto |
|---|---|---|---|---|---|
| **Lucide** | 1.756 (Iconify) | ISC | 2px, outline, 24px, redondeado | **Altísima** (tus nombres SON slugs Feather/Lucide) | ✅ **Recomendada** |
| Feather | ~287 | MIT | 2px outline (idéntico) | Alta, pero **sin mantenimiento** | ❌ Abandonada; Lucide la reemplaza |
| Tabler | ~5.000+ | MIT | 2px, 24px, redondeado | Media (otra convención) | Buen fallback si falta un ícono |
| Phosphor | ~1.200 base × 6 pesos = ~7.200 exports | MIT | Multi-peso (Thin, Light, Regular, Bold, Fill, Duotone) | Baja (otra convención) | Sobra para este caso; bundle mayor por peso |
| Heroicons | ~292 | MIT | outline/solid | Baja | Muy chico; ligado a estética Tailwind |
| Material Symbols | miles | Apache 2.0 | variable font | Baja | Estética "Google"; la variable font pesa ~300-400KB si no se subsetea |
| Remix Icon | ~2.800 | Apache 2.0 | mixto | Baja | Apache 2.0 pide documentar cambios si modificás y redistribuís |

El argumento decisivo: **tus íconos actuales (`check`, `arrow-right`, `alert-triangle`, `alert-circle`, `info`, `download`, `lock`, `play`, etc.) son literalmente los slugs derivados de Feather que Lucide heredó.** Migrar es casi copiar-pegar.

### ⚠️ Punto crítico verificado: 7 de tus 16 nombres NO mapean 1:1

Lucide estandarizó los íconos de dos palabras a convención "forma primero" (`circle-*`, `triangle-*`) y renombró algunos. Los nombres viejos quedaron como **alias** en los paquetes de framework, pero el **slug canónico** (el que va en el SVG y en lucide.dev) cambió. Mapeo copy-ready, verificado ícono por ícono en lucide.dev:

```
check          → check              ✅ igual
check-circle   → circle-check       ⚠️ renombrado (o circle-check-big para el tilde grande)
alert-triangle → triangle-alert     ⚠️ renombrado
alert-circle   → circle-alert       ⚠️ renombrado
info           → info               ✅ igual
arrow-right    → arrow-right        ✅ igual
refresh        → refresh-cw         ❌ NO existe "refresh" (alt: refresh-ccw, rotate-cw)
download       → download           ✅ igual
play           → play               ✅ igual
play-circle    → circle-play        ⚠️ renombrado
lock           → lock               ✅ igual
sparkles       → sparkles           ✅ igual
award          → award              ✅ igual
unlock         → lock-open          ❌ "unlock" solo como alias legacy
logout         → log-out            ❌ NO existe "logout"
x              → x                  ✅ igual
```

**Recomendación de implementación:** como tu sistema ya usa un mapa por atributo (`<span class="icon" data-icon="nombre">`), **mantené TUS nombres actuales como clave pública** y resolvé internamente al slug/SVG de Lucide en la capa de build o en el diccionario de íconos. Así no rompés el markup existente y encapsulás los 7 renombres en un solo lugar. Documentá el mapeo en el design system.

---

## 2. Patrones actuales de KPI/metric cards

### Anatomía de una metric card moderna
Según la guía de anatomía de KPI cards de Anastasiya Kuznetsova (BI Bites) — coincidente con Material 3, Dell Design System y Palantir — cada card tiene:
1. **Eyebrow/label** (nombre de métrica): pequeño, en mayúsculas o color atenuado. Simplificá ("Total de personas" → "PERSONAS"); ya lo tenés bien.
2. **Valor grande**: el primer elemento que se ve, con la mayor jerarquía tipográfica.
3. **Contexto/delta**: comparación período-a-período, contra promedio o contra target; con flecha ▲▼ y color asociativo.
4. **Ícono contextual**: opcional, refuerza el significado.
5. **Sparkline/micro-viz**: opcional, muestra tendencia.
6. **Acción secundaria**: tu link "Ver".

**Jerarquía tipográfica (Kuznetsova + Refactoring UI):** fuente sans-serif legible, tamaño grande para el valor, menor para el label, aún menor para el contexto. Refactoring UI aporta la regla clave — *"de-emphasize to emphasize"*: en vez de gritar con el valor, bajá el peso/contraste del label. Y en fondos de color, **no uses gris**: elegí un color del mismo hue con menor saturación/lightness (el "gris sobre color" en realidad es contraste reducido y se ve sucio).

### Cuándo el ícono aporta y cuándo distrae (chartjunk)
NN/G ("Clutter-Free: One of the 3 Cs") y Tufte: todo pixel que no aporta información es *chartjunk*, ruido que compite con la señal (data-ink ratio). Playfair Data lo lleva a íconos: un ícono aporta cuando **acelera el reconocimiento de la categoría**; distrae cuando es decorativo o redundante, y recomienda ubicarlo **a la izquierda del label** (patrón de lectura izq→der). Regla práctica: **1 ícono por card, monocromo, tamaño `icon-sm`**. Nunca un ícono grande y colorido que compita con el número.

### Color semántico: ¿colorear las 4 distinto o mantener neutralidad?
**La evidencia es contundente: NO colorees las 4 distinto como default.** La regla de restraint (The Comm Spot, Big Excel Energy, ColorPick, Datarocks) dice: la mayoría de los datos deben ser neutrales para que lo importante resalte; un solo acento hace el trabajo. *"Una paleta con una voz fuerte y varias tranquilas es legible; una donde todos gritan es ruido."* Colorear 4 métricas relacionadas con 4 colores distintos las hace ver como categorías no comparables y sube la carga cognitiva. Además mezclás el significado semántico (success/warning) con simple diferenciación de categorías — error que las guías marcan explícitamente ("keep semantic colors semantic": si el verde también significa "esta categoría", ya no puede significar confiablemente "bueno").

### Tratamiento de números
**Hecho confirmado (MDN, Refactoring UI):** usá `font-variant-numeric: tabular-nums` (en Tailwind: clase `tabular-nums`) para que los dígitos tengan ancho fijo y los valores de las 4 cards alineen. Sofia Sans es una OpenType moderna y muy probablemente soporta la feature (verificalo). Alineá números a la derecha en la tabla; en las cards de valor único, alineación izquierda o centrada consistente. Jerarquía: valor ~2-3× el tamaño del label.

### Micro-visualizaciones dentro de la card
Para métricas de progreso, un **progress ring/donut mini** o **mini bar** comunica proporción de un vistazo. Pero en este dashboard el "Avance agregado 39%" ya tiene barra y NO se toca. Para las 4 cards una micro-viz sería sobrecarga (agrega ink sin decisión nueva). Si querés reforzar "1 de 6 completó", un **stack bar comparativo diminuto** (completado vs total) sería lo más honesto, pero es opcional y de baja prioridad.

### Cómo tratan las métricas de "personas capacitándose" los LMS
- **Docebo** usa un "User Engagement widget" que combina usuarios activos, frecuencia de acceso, action counts y tasa de completado; su consejo es analizar picos/valles de participación, no vanidad.
- **TalentLMS** muestra cursos, progreso, completions, seat time y certificados en un dashboard descrito por usuarios como intuitivo (aunque con UI "algo anticuada").
- **LinkedIn Learning** usa un vocabulario visual de estados muy sobrio: círculo vacío = no empezado, círculo gris/naranja = en progreso, **check verde = completado**. Ese trío (vacío / en progreso / check verde) es exactamente el vocabulario que te conviene reutilizar: ya es familiar, accesible y no infantiliza.

---

## 3. Patrones para la card de ranking / "tu puesto"

### Estado vacío que no desmotive (tu caso: Nicolás, 0 de 9)
NN/G ("Empty States: 3 Guidelines"): un contenedor en blanco no es neutro — reduce confianza y discoverability. Un buen empty state hace tres cosas: **comunica el estado, enseña qué va ahí y ofrece el próximo paso** (el "teachable moment"). Tu microcopy actual ("Vas a entrar al ranking cuando apruebes tu primer módulo" + link "Ver ranking") ya cumple las tres. Mejoralo con:
- Ícono `trophy` (Lucide, tags: *leaderboard, ranking, achievement*) en estado atenuado (muted/neutral), **NO en color de alarma**.
- El "—" mantenelo como placeholder del valor, pero acompañado del microcopy motivador para que no se lea como error.
- Tono positivo y de futuro ("Vas a entrar…"), nunca de carencia ("No tenés ranking").

### Ejemplos (educativos/gamificados)
Duolingo convierte estados vacíos en refuerzo positivo y usa ligas/percentiles ("top 1%"); Khan Academy y foros gamificados (Gainsight, comunidades B2B) usan rangos progresivos ("Rookie → Regular → Trailblazer"). Pero en B2B corporativo la evidencia (Gainsight, Neuron, Macrobian) advierte: la gamificación debe sentirse **útil y con propósito**, no un "fun add-on"; badges y leaderboards funcionan si hay significado real, no solo puntos.

### Íconos y microcopy: cuándo son apropiados y cuándo se leen infantiles
- **Apropiado en B2B:** `trophy` / `award` / `medal` en trazo fino monocromo, tamaño chico, un solo acento de color. `sparkles` usalo con muchísima moderación — solo en el momento de logro real (cuando aprueba el primer módulo), nunca permanente.
- **Se lee infantil:** emojis, múltiples colores saturados, medallas 3D, confeti permanente, íconos grandes. Evitalos en un ERP de turismo B2B.

### Alternativas al ranking numérico
En vez de "Puesto 4°" (que puede humillar al último):
- **Percentil / "en el top X%"** ("Estás en el top 30% de tu agencia").
- **Cuartil o tramo** ("Cuarto superior").
- **Posición relativa suave** ("3° de 6, subiste 1 lugar" con delta).

Para una agencia chica (6 personas), el percentil pierde sentido estadístico; ahí conviene **posición + delta** ("subiste 1 puesto") o directamente el estado motivacional hasta que haya masa crítica.

---

## 4. Opciones concretas de destaque visual

Recordá los tokens semánticos ya existentes: success `#2dbe83` (dark `#17694a`, bg `#eafaf3`, borde `#b7ecd4`), warning `#f79009` (bg `#fffaeb`, borde `#fedf89`), info `#006fe0` (bg `#e5f1fd`, borde `#b9d9f8`), primary `#004f9f`. Todos los íconos abajo son slugs Lucide ya verificados.

### Opción A — "Mínima" (monocromo + tipografía)
Sin color de estado. Cada card lleva un ícono monocromo (color `text-primary` o gris neutro) a la izquierda del label; valor grande en `tabular-nums`; label atenuado.
- PERSONAS → `users`
- CON ACTIVIDAD → `activity` (o `user-check`)
- COMPLETADO → `circle-check` (¡ojo, renombrado!)
- SIN EMPEZAR → `circle` o `clock` (neutral, sin alarma)
- Ranking → `trophy` monocromo, estado muted

**Pros:** máxima elegancia corporativa; cero riesgo de semaforización injusta; contraste WCAG trivial (texto oscuro sobre blanco); alineada con Refactoring UI. **Contras:** menos "destaque"; puede parecer poco diferenciada si el pedido explícito es "más color".

### Opción B — "Semántica" (cada métrica su color + ícono)
Cada card con su fondo tenue, borde e ícono en color de estado.
- PERSONAS → `users`, info (bg `#e5f1fd`, borde `#b9d9f8`)
- CON ACTIVIDAD → `activity`, info o primary
- COMPLETADO → `circle-check`, success (bg `#eafaf3`, borde `#b7ecd4`)
- SIN EMPEZAR → `clock`/`circle`, **muted/neutral (NO warning/error)**
- Ranking → `trophy`, primary

**Pros:** cumple literalmente el pedido de "más color"; refuerza estado con ícono+color (redundancia buena para daltonismo). **Contras:** la evidencia de dataviz la desaconseja como default — 4 colores en métricas relacionadas suben la carga cognitiva y mezclan "categoría" con "estado". Alto riesgo de semaforización injusta si SIN EMPEZAR va en warning/rojo. Si la elegís, **SIN EMPEZAR debe ir neutral, nunca rojo/ámbar.**

### Opción C — "Una estrella" (RECOMENDADA) ⭐
Solo la métrica estrella lleva color+ícono destacado; el resto queda neutral (como Opción A). La estrella natural en un dashboard de capacitación es **COMPLETADO** (la métrica accionable que celebra progreso).
- PERSONAS → `users`, neutral/gris
- CON ACTIVIDAD → `activity`, neutral/gris
- **COMPLETADO → `circle-check`, success (bg `#eafaf3`, borde `#b7ecd4`, ícono/texto `#17694a`)** ← única con color
- SIN EMPEZAR → `clock`, neutral/gris (sin alarma)
- Ranking → `trophy`; estado vacío muted, y cuando haya dato, acento primary/success

**Pros:** es lo que la evidencia recomienda (restraint + un acento que dirige la atención); da color sin ruido; elimina de raíz la semaforización injusta; escalable. **Contras:** hay que decidir cuál es "la estrella" — si el negocio prioriza activación, podría ser CON ACTIVIDAD.

**Mi recomendación:** implementá **C** como default; dejá **A** como variante de configuración "sobria"; evitá **B** salvo pedido explícito y con SIN EMPEZAR siempre neutral.

---

## 5. Riesgos y puntos de control

1. **Semaforización injusta.** "SIN EMPEZAR: 1" NO debe ir en warning/rojo: es una persona recién ingresada, no un fallo. Como resume dbkay ("save red/yellow/green for traffic lights"), algunos números "simplemente son" y no hay que juzgarlos con color. Usá neutral/muted. Rojo, solo para errores accionables reales.
2. **Contraste WCAG 2.2 AA con fondos tenues.** Texto normal necesita **4.5:1**, texto grande (≥24px o ≥18.7px bold) **3:1**, íconos/UI **3:1** (SC 1.4.11). Tus fondos tenues son muy claros, así que el texto debe ir en la variante *dark* del token (ej. success-dark `#17694a` sobre `#eafaf3`), **NO** en el color base saturado (`#2dbe83` sobre `#eafaf3` casi seguro falla 4.5:1). **Verificá cada par texto/fondo en WebAIM Contrast Checker antes de mergear.** El valor grande, al ser large text, tiene el umbral más laxo (3:1), pero conviene igual apuntar a 4.5:1.
3. **No depender solo del color.** La deficiencia de visión cromática congénita afecta a ~1 de cada 12 varones (8%) y ~1 de cada 200 mujeres (0,5%); Cleveland Clinic lo formula como "about 1 in 12 males, compared with 1 in 200 females". Por eso, siempre acompañá el color con ícono + texto (ya lo hacés) — es el argumento extra a favor de ícono+label por sobre color solo.
4. **Consistencia con el resto del campus.** Los mismos íconos/colores ya viven en los badges de módulos (badge-success, badge-info, etc.). Reutilizá exactamente esos tokens y slugs para que "completado" se vea igual en la card, en el badge y en la tabla. Documentá el pairing ícono↔token.
5. **Vanity metrics.** PERSONAS (6) y CON ACTIVIDAD (5) son de bajo valor accionable si nadie hace nada con ellas. No las infles visualmente (nada de color fuerte ni número gigante). El foco visual debe ir a lo accionable (COMPLETADO / SIN EMPEZAR → "andá a activar a esa persona"). Un número grande y colorido que no dispara ninguna decisión es exactamente lo que Tufte/NN-G llaman ruido.
6. **No romper el layout.** Todos los destaques van *dentro* de las cards existentes (ícono, color de fondo/borde/texto). No agregar filas, no cambiar el grid de 4, no tocar tabla/header/avance agregado.

---

## 6. Recomendación final priorizada — próximos pasos

**Fase 1 (implementar primero, bajo riesgo):**
1. Adoptar Lucide; crear el diccionario `data-icon` → slug Lucide (encapsulando los 7 renombres) y documentarlo en el design system.
2. Aplicar `tabular-nums` a los valores de las 4 cards y ordenar la jerarquía tipográfica (valor grande, label atenuado con color, no solo tamaño).
3. Implementar **Opción C**: ícono monocromo neutral en PERSONAS/CON ACTIVIDAD/SIN EMPEZAR; COMPLETADO con token success (bg/borde/texto-dark) + `circle-check`.
4. Card ranking: `trophy` muted + microcopy actual; asegurar que el "—" no se lea como error.

**Fase 2 (validar):**
5. Test rápido con 3-5 usuarios de agencias: ¿identifican la métrica prioritaria? ¿"SIN EMPEZAR" se percibe como reproche? ¿el estado vacío del ranking motiva o frustra?
6. Correr WebAIM sobre cada par texto/fondo; ajustar a variantes *dark* donde falle.

**Fase 3 (documentar y escalar):**
7. Documentar en el design system: pairing ícono↔token semántico, la regla "una estrella" (cuándo usar color), la regla anti-semáforo (SIN EMPEZAR nunca rojo) y el mapeo de nombres.
8. Definir la lógica de ranking real (posición+delta en agencias chicas; percentil/"top X%" en grandes), con umbral de masa crítica para elegir cuál mostrar.

**Benchmarks que cambian la recomendación:**
- Si el test muestra que los usuarios NO distinguen la métrica prioritaria → subir a Opción B controlada (con SIN EMPEZAR neutral).
- Si el negocio prioriza activación sobre completado → mover "la estrella" a CON ACTIVIDAD.
- Si algún par de contraste falla y no se puede oscurecer sin romper la marca → volver esa card a Opción A monocromo.

---

## Distinción hecho / supuesto / recomendación
- **Hechos confirmados:** licencia ISC, estilo y count de Lucide (1.756 según Iconify); los 7 renombres de slugs (verificados en lucide.dev); umbrales WCAG 2.2 AA (4.5:1 / 3:1); anatomía de KPI card; principio data-ink/chartjunk (NN-G/Tufte); regla de restraint de color; riesgos de RAG/semáforo; prevalencia de daltonismo (~1/12 varones, ~1/200 mujeres); vocabulario de estados de LinkedIn Learning.
- **Supuestos:** que Sofia Sans soporta `tabular-nums` (muy probable en OpenType moderna — verificar con la fuente real); que la métrica "estrella" del negocio es COMPLETADO; que los tokens *dark* alcanzan 4.5:1 sobre sus bg (verificar en WebAIM).
- **Recomendaciones (mi criterio):** Opción C como default; A como fallback; evitar B; percentil solo con masa crítica; encapsular los renombres de íconos en el diccionario para no tocar el markup existente.