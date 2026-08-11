/* ============================================================================
   Academia SIGMMA — generador del set de iconos
   ----------------------------------------------------------------------------
   Reescribe el bloque entre los marcadores `@generado` de `assets/js/icons.js`
   con los paths de Tabler Icons (variante outline). El IIFE de hidratación que
   viene después de los marcadores es código escrito a mano y no se toca.

       npm run build:icons

   El artefacto SIGUE versionándose en git, igual que `assets/css/academia.css`:
   el prototipo tiene que abrirse con doble click sobre `file://`, sin build.

   Para sumar un icono, agregá la entrada al MAPA de abajo y regenerá. El nombre
   de la izquierda es el que va en el HTML (`data-icon="..."`) y no cambia nunca
   aunque Tabler renombre el suyo: por eso el mapa existe.
   ========================================================================== */

import { readFileSync, writeFileSync } from "node:fs";

const ORIGEN = "node_modules/@tabler/icons/icons/outline";
const DESTINO = "assets/js/icons.js";
const INICIO = "/* @generado:inicio — no editar a mano: npm run build:icons */";
const FIN = "/* @generado:fin */";

/* nombre en el HTML → nombre en Tabler.
   `play-circle` es el único que no tiene equivalente literal: Tabler no publica
   `play-circle` ni `circle-play`. `circle-caret-right` es exactamente eso, un
   caret sobre el mismo círculo r=9 que usa `circle-check`. */
const MAPA = {
  /* -- Estado y validación -- */
  check: "check",
  "check-circle": "circle-check",
  x: "x",
  "alert-triangle": "alert-triangle",
  "alert-circle": "alert-circle",
  info: "info-circle",
  clock: "clock",

  /* -- Recorrido -- */
  lock: "lock",
  unlock: "lock-open",
  activity: "activity",
  target: "target",
  "list-checks": "list-check",
  refresh: "refresh",

  /* -- Video -- */
  play: "player-play",
  pause: "player-pause",
  "play-circle": "circle-caret-right",
  video: "video",
  eye: "eye",

  /* -- Navegación y acciones -- */
  "arrow-right": "arrow-right",
  "arrow-left": "arrow-left",
  logout: "logout",
  download: "download",
  sort: "arrows-sort",

  /* -- Agencia, logros y soporte -- */
  users: "users",
  award: "award",
  trophy: "trophy",
  message: "message-circle",
  wifi: "wifi",
  sparkles: "sparkles",
};

/* Deja el contenido del <svg> de Tabler listo para entrar al mapa: sin el
   encabezado, sin la caja de recorte invisible y en una sola línea. */
function cuerpo(nombreRepo, nombreTabler) {
  let svg;
  try {
    svg = readFileSync(`${ORIGEN}/${nombreTabler}.svg`, "utf8");
  } catch {
    throw new Error(
      `"${nombreRepo}" apunta a "${nombreTabler}", que no existe en ${ORIGEN}. ` +
        `¿Typo, o Tabler lo renombró?`,
    );
  }

  const limpio = svg
    .replace(/^[\s\S]*?<svg\b[^>]*>/, "") /* encabezado */
    .replace(/<\/svg>[\s\S]*$/, "") /* cierre */
    .replace(/<path\s+stroke="none"[^>]*\/>/g, "") /* caja de recorte de Tabler */
    .replace(/\s+/g, " ")
    .replace(/\s+\/>/g, "/>")
    .replace(/>\s+</g, "><")
    .trim();

  if (!limpio) {
    throw new Error(`"${nombreRepo}" (${nombreTabler}) quedó vacío al limpiarlo.`);
  }
  if (limpio.includes("'")) {
    throw new Error(
      `"${nombreRepo}" (${nombreTabler}) tiene una comilla simple y el mapa las usa como delimitador.`,
    );
  }
  return limpio;
}

const entradas = Object.entries(MAPA).map(([repo, tabler]) => {
  const linea = `  "${repo}": '${cuerpo(repo, tabler)}',`;
  return { repo, tabler, linea };
});

const bloque = [
  INICIO,
  `/* ${entradas.length} iconos · Tabler Icons (outline) · grilla 24, trazo 2 */`,
  "window.ICONS = {",
  ...entradas.map((e) => e.linea),
  "};",
  FIN,
].join("\n");

const actual = readFileSync(DESTINO, "utf8");
const desde = actual.indexOf(INICIO);
const hasta = actual.indexOf(FIN);
if (desde < 0 || hasta < 0 || hasta < desde) {
  throw new Error(
    `No encontré los marcadores @generado en ${DESTINO}. ` +
      `Tienen que estar textuales:\n  ${INICIO}\n  ${FIN}`,
  );
}

writeFileSync(
  DESTINO,
  actual.slice(0, desde) + bloque + actual.slice(hasta + FIN.length),
  "utf8",
);

console.log(`${DESTINO}: ${entradas.length} iconos desde Tabler Icons (outline).`);
