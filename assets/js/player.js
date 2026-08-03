/* ============================================================================
   Academia SIGMMA — reproductor simulado
   ----------------------------------------------------------------------------
   En producción esto es la YouTube IFrame Player API: se escucha
   `onStateChange`, se compara tiempo actual contra duración y se reporta el
   avance al backend. Acá se simula el reloj para poder probar la mecánica que
   define el producto: al cruzar el 80 % el video queda VISTO y no vuelve atrás.
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
