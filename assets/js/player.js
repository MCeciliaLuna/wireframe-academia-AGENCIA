/* ============================================================================
   Academia SIGMMA — reproductor simulado
   ----------------------------------------------------------------------------
   Acá se simula el reloj para poder probar la mecánica que define el producto:
   al cruzar el 80 % el video queda VISTO y no vuelve atrás.

   ⚠ DECISIÓN ABIERTA — cómo se mide el 80 % (P04.3 del cotejo)
   ----------------------------------------------------------------------------
   Este prototipo marca "visto" comparando la POSICIÓN del cursor contra la
   duración. Con eso, arrastrar la barra al final marca el video como visto en
   un segundo. **No tomar esto como el criterio de producción**: es la opción
   más simple para poder demostrar el umbral en una demo, no la decisión.

   Las dos opciones sobre la mesa:

     A · Posición máxima alcanzada (lo que hace este prototipo).
         Simple. Se puede saltear el contenido entero, y la métrica de consumo
         real del panel de seguimiento queda inservible.

     B · Segundos efectivamente reproducidos.
         Se acumulan solo los avances hacia adelante mientras el reproductor
         está en PLAYING, y se descartan los saltos por encima de un umbral.
         Es el anti-scrub.

   La API de YouTube alcanza para B: no entrega "porcentaje visto", pero expone
   `getCurrentTime()`, `getDuration()` y `onStateChange`, que es todo lo que hace
   falta para acumular tiempo real de reproducción. O sea, la elección es de
   producto —cuánto rigor se le pide a la métrica—, no una restricción técnica de
   YouTube. Es la capa propia que el alcance funcional del MVP (§5) ya declara
   como esfuerzo explícito de desarrollo.

   Cuando se decida, el cambio es local: `pintar()` y `buscarDesdeEvento()`.
   ========================================================================== */

window.Player = (function () {
  "use strict";

  function formato(segundos) {
    const m = Math.floor(segundos / 60);
    const s = Math.floor(segundos % 60);
    return m + ":" + String(s).padStart(2, "0");
  }

  function crear(opciones) {
    const raiz = opciones.root;
    const duracion = opciones.duracion;
    const umbral = opciones.umbral || 80;
    let actual = (opciones.progresoInicial / 100) * duracion;
    let visto = opciones.visto || false;
    let reloj = null;

    const superficie = raiz.querySelector("[data-player-surface]");
    const botonGrande = raiz.querySelector("[data-player-big]");
    const botonPlay = raiz.querySelector("[data-player-toggle]");
    const iconoPlay = botonPlay.querySelector(".icon");
    const scrub = raiz.querySelector("[data-player-scrub]");
    const relleno = raiz.querySelector("[data-player-fill]");
    const tiempo = raiz.querySelector("[data-player-time]");

    function pintar() {
      /* Opción A de la decisión abierta de arriba: el porcentaje es la posición,
         no el tiempo reproducido. Si se adopta la opción B, este cálculo pasa a
         leer un acumulador de segundos y `buscarDesdeEvento` deja de alimentarlo. */
      const pct = Math.min(100, (actual / duracion) * 100);
      relleno.style.width = pct + "%";
      scrub.setAttribute("aria-valuenow", Math.round(pct));
      tiempo.textContent = formato(actual) + " / " + formato(duracion);
      if (opciones.onProgress) opciones.onProgress(pct, visto);
      if (!visto && pct >= umbral) {
        visto = true;
        if (opciones.onWatched) opciones.onWatched();
      }
    }

    function reproducir() {
      if (reloj) return;
      superficie.dataset.playing = "true";
      botonPlay.setAttribute("aria-label", "Pausar");
      iconoPlay.dataset.icon = "pause";
      iconoPlay.dataset.iconDone = "";
      window.renderIcons(botonPlay);
      /* 4× la velocidad real: el prototipo tiene que poder cruzar el umbral sin
         que haya que mirar tres minutos de pantalla. */
      reloj = window.setInterval(function () {
        actual = Math.min(duracion, actual + 1);
        pintar();
        if (actual >= duracion) pausar();
      }, 250);
    }

    function pausar() {
      if (reloj) window.clearInterval(reloj);
      reloj = null;
      superficie.dataset.playing = "false";
      botonPlay.setAttribute("aria-label", "Reproducir");
      iconoPlay.dataset.icon = "play";
      iconoPlay.dataset.iconDone = "";
      window.renderIcons(botonPlay);
    }

    function alternar() {
      if (reloj) pausar();
      else reproducir();
    }

    botonPlay.addEventListener("click", alternar);
    if (botonGrande) botonGrande.addEventListener("click", alternar);

    function buscarDesdeEvento(event) {
      const caja = scrub.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (event.clientX - caja.left) / caja.width));
      actual = ratio * duracion;
      pintar();
    }
    scrub.addEventListener("click", buscarDesdeEvento);
    scrub.addEventListener("keydown", function (event) {
      const paso = duracion / 20;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        actual = Math.min(duracion, actual + paso);
        pintar();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        actual = Math.max(0, actual - paso);
        pintar();
      } else if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        alternar();
      }
    });

    pintar();
    return { reproducir: reproducir, pausar: pausar };
  }

  return { crear: crear, formato: formato };
})();
