/* ============================================================================
   Academia SIGMMA — Meet de soporte por agencia
   ----------------------------------------------------------------------------
   El bloque de estado, la cola y el formulario de duda viven acá y no en cada
   página porque los comparten tres pantallas: `modulo.html` (bloque al pie),
   `evaluacion.html` (CTA en el resultado aprobado) y `agencia.html` (las colas
   abiertas del equipo). Sin esto, la matriz de estados quedaría copiada tres
   veces y se desincronizaría en el primer cambio de copy.

   Las REGLAS no están acá: están enteras en `mock-data.js` (`cupoMeet`,
   `puedeDejarDuda`, `puedeAgendar`, `esCoordinador`). Este archivo solo pinta
   el estado que le devuelven, igual que en el producto real el frontend
   renderiza lo que manda el backend sin recalcular nada.

   Carga después de `ui.js` y antes del script inline de la página.
   ========================================================================== */

window.Meet = (function () {
  "use strict";

  const A = window.ACADEMIA;

  /* El texto de las dudas lo escribe la usuaria en el prototipo: un "<" suelto
     rompería el DOM. El resto del contenido es del mock y no hace falta. */
  function esc(texto) {
    return String(texto == null ? "" : texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function plural(n, singular, plural_) {
    return n + " " + (n === 1 ? singular : plural_);
  }

  /* -- Estados forzados por URL ----------------------------------------------
     `?meet=<estado>` fuerza el estado del cupo para poder mirarlo sin tener que
     armar el dato: Lucía aprobó dos módulos y con eso no alcanza para recorrer
     sus cuatro estados. Es el mismo patrón que `?state=` y `?phase=` — estados
     transversales sobre la pantalla padre, sin archivo propio.

     No inventa dudas: mueve el TURNO, que es lo que separa `abierto`,
     `agendado` y `consumido`. `sin-lugares` además vacía la cola, porque es
     literalmente lo que ese estado significa. */
  const ESTADOS_FORZABLES = ["sin-lugares", "abierto", "agendado", "consumido"];

  function forzar(moduloId, cupo) {
    const pedido = UI.param("meet");
    if (ESTADOS_FORZABLES.indexOf(pedido) === -1) return cupo;

    if (pedido === "sin-lugares") return { estado: pedido, dudas: [], mias: [], meet: null };
    if (pedido === "abierto") return Object.assign({}, cupo, { estado: pedido, meet: null });

    const turno = A.turnosDisponibles(moduloId)[0];
    const meet =
      pedido === "agendado" && turno
        ? { moduloId: moduloId, inicioISO: turno.inicioISO, duracionMin: turno.duracionMin, enlace: null }
        : { moduloId: moduloId, inicioISO: "2026-07-16T15:00:00", duracionMin: 30, enlace: null };
    return Object.assign({}, cupo, { estado: pedido, meet: meet });
  }

  /* -- Estado de la UI -------------------------------------------------------
     Devuelve el número de fila de la matriz, además del estado del cupo. El
     número no se usa para pintar —cada rama tiene su propio render— pero es lo
     que permite verificar los diez estados sin leer la pantalla entera, y lo
     que enlaza la tabla del design system con esta implementación.

       1 · no coordinador, módulo sin aprobar
       2 · no coordinador, aprobado, cola vacía
       3 · no coordinador, aprobado, cola abierta
       4 · no coordinador, aprobado, turno agendado
       5 · no coordinador, aprobado, Meet realizada
       6 · coordinador, cola vacía
       7 · coordinador, cola abierta con turnos libres
       8 · coordinador, turno agendado
       9 · coordinador, Meet realizada
      10 · coordinador, cola abierta sin turnos libres

     No hay 11: la cola no vence. El coordinador ve su vista aunque no haya
     aprobado el módulo — agenda por su rol, no por su avance. */
  function estadoUI(modulo) {
    const cupo = forzar(modulo.id, A.cupoMeet(modulo.id));
    const coord = A.esCoordinador();
    /* Dos cosas distintas: `aprobado` elige la fila de la matriz (el estado 1
       es exactamente "no aprobado"), y `puedeDuda` decide si además de ver el
       estado hay algo que hacer — con el cupo consumido ya no lo hay. */
    const aprobado = A.estadoEfectivo(modulo.id) === "aprobado";
    const puedeDuda = aprobado && cupo.estado !== "consumido";
    let fila;

    if (coord) {
      if (cupo.estado === "sin-lugares") fila = 6;
      else if (cupo.estado === "agendado") fila = 8;
      else if (cupo.estado === "consumido") fila = 9;
      else fila = A.turnosDisponibles(modulo.id).length ? 7 : 10;
    } else if (!aprobado) {
      fila = 1;
    } else if (cupo.estado === "sin-lugares") fila = 2;
    else if (cupo.estado === "abierto") fila = 3;
    else if (cupo.estado === "agendado") fila = 4;
    else fila = 5;

    return { fila, cupo, coord, aprobado, puedeDuda };
  }

  /* -- Piezas ---------------------------------------------------------------- */

  function turnoTexto(meet) {
    return A.horaART(meet.inicioISO) + " · " + meet.duracionMin + " min";
  }

  /* Una duda de la cola. El coordinador ve el texto de todas; el resto, solo el
     de las propias — de las ajenas ve que existen, no qué dicen. */
  function itemDuda(duda, verTexto) {
    const video = duda.videoId ? A.video(duda.videoId) : null;
    const mia = A.esMia(duda);
    const meta = [];
    if (video) meta.push(esc(video.titulo));
    if (duda.subtema) meta.push(esc(duda.subtema));
    meta.push(A.fechaCorta(duda.creadaEn));

    return (
      '<li class="flex flex-col gap-1.5 border-b border-line px-4 py-3 last:border-b-0">' +
      '<div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">' +
      '<span class="text-sm font-bold">' +
      (mia ? "Vos" : esc(A.autorDuda(duda))) +
      "</span>" +
      '<span class="meta">' + meta.join(" · ") + "</span>" +
      "</div>" +
      (verTexto
        ? '<p class="text-sm text-gray-700">' + esc(duda.texto) + "</p>"
        : '<p class="text-sm text-ink-soft">Solo el coordinador del equipo ve el texto de las dudas de otras personas.</p>') +
      (mia && verTexto
        ? '<button class="link-quiet self-start text-sm" type="button" data-retirar="' +
          esc(duda.id) + '">Retirar mi duda</button>'
        : "") +
      "</li>"
    );
  }

  function listaDudas(dudas, verTodo) {
    return (
      '<ul class="overflow-hidden rounded-xl border border-line bg-white">' +
      dudas
        .map(function (d) {
          return itemDuda(d, verTodo || A.esMia(d));
        })
        .join("") +
      "</ul>"
    );
  }

  function ctaDuda(modulo, etiqueta) {
    return (
      '<button class="btn btn-bordered self-start" type="button" data-modal-open="modal-duda" data-duda-modulo="' +
      modulo.id + '">' +
      '<span class="icon" data-icon="message"></span>' +
      (etiqueta || "Me quedó una duda de este módulo") +
      "</button>"
    );
  }

  /* Ningún estado sin acción puede terminar en un callejón: siempre dice qué
     sigue y quién lo tiene que hacer. */
  function avisoCoordinador() {
    const c = A.coordinador();
    return (
      '<p class="hint">La Meet con Soporte la agenda ' +
      (c ? "<strong>" + esc(c.nombre) + "</strong>" : "el coordinador del equipo") +
      ", que coordina las Meets de " + esc(A.agencia.nombre) + ".</p>"
    );
  }

  /* -- El bloque, estado por estado ------------------------------------------ */

  function cuerpo(modulo, ui) {
    const cupo = ui.cupo;
    const n = cupo.dudas.length;

    /* 1 · Sin aprobar. El filtro de la Meet es la aprobación: es lo que evita
       que soporte vuelva a atender lo que el video ya explica. */
    if (ui.fila === 1) {
      return (
        '<p class="text-sm text-gray-700">Para dejar una duda y acceder a la Meet de soporte, primero tenés que aprobar la evaluación del módulo.</p>' +
        '<a class="link-quiet self-start text-sm" href="evaluacion.html?m=' + modulo.id +
        '">Ir a la evaluación</a>'
      );
    }

    /* 2 · Aprobado, nadie del equipo dejó dudas todavía. */
    if (ui.fila === 2) {
      return (
        '<p class="text-sm text-gray-700">Si te quedó alguna duda de este módulo, dejala acá. El coordinador del equipo agenda una Meet con Soporte cuando haya dudas registradas.</p>' +
        ctaDuda(modulo) +
        avisoCoordinador()
      );
    }

    /* 3 · Aprobado, con cola. Ve la cantidad del equipo y el texto de lo suyo. */
    if (ui.fila === 3) {
      return (
        '<p class="text-sm text-gray-700">Hay <strong>' +
        plural(n, "duda", "dudas") +
        "</strong> de este módulo en la cola de tu equipo.</p>" +
        listaDudas(cupo.dudas, false) +
        ctaDuda(modulo, cupo.mias.length ? "Dejar otra duda" : "Me quedó una duda de este módulo") +
        avisoCoordinador()
      );
    }

    /* 4 · Turno tomado. Lo ve todo el equipo, no solo quien dejó la duda. */
    if (ui.fila === 4) {
      return (
        '<p class="text-sm text-gray-700">La Meet de este módulo está agendada para el <strong>' +
        A.horaART(cupo.meet.inicioISO) + "</strong>.</p>" +
        (cupo.meet.enlace
          ? '<a class="btn btn-bordered self-start" href="' + esc(cupo.meet.enlace) +
            '" target="_blank" rel="noopener"><span class="icon" data-icon="message"></span>Entrar a la Meet</a>'
          : '<p class="hint">El enlace se envía por mail antes de la reunión.</p>') +
        '<p class="hint">Son ' + cupo.meet.duracionMin + " minutos con Soporte sobre " +
        (n === 1 ? "la duda registrada" : "las " + n + " dudas registradas") +
        " de este módulo.</p>" +
        /* El turno todavía no pasó: se puede sumar una duda a esa agenda. */
        (ui.puedeDuda ? ctaDuda(modulo, "Sumar una duda a esta Meet") : "")
      );
    }

    /* 5 · Ya se hizo. El cupo del módulo se consumió y no se reabre, así que es
       el único estado del que la usuaria no puede salir sola: lleva al canal de
       soporte de siempre para que no quede en un callejón.

       Es una desviación consciente de la especificación de la Meet, que pedía
       DOS cosas incompatibles en este estado: no ofrecer canales alternativos de
       consulta (el flujo no deriva a WhatsApp ni a mail), y no dejar ninguna
       pantalla sin salida. Con el cupo consumido no hay acción dentro del flujo,
       así que la única forma de cumplir la segunda es incumplir la primera. Gana
       la segunda: un callejón sin salida es peor que un canal de más. */
    if (ui.fila === 5) {
      return (
        '<p class="text-sm text-gray-700">La Meet de este módulo ya se realizó, el <strong>' +
        A.fechaCorta(cupo.meet.inicioISO) + "</strong>.</p>" +
        '<p class="hint">Hay una Meet por módulo para toda la agencia, así que el cupo de este ya se usó.</p>' +
        '<a class="link-quiet self-start text-sm" href="' + A.soporte.whatsapp +
        '" target="_blank" rel="noopener">Si te quedó algo pendiente, escribinos por soporte</a>'
      );
    }

    /* 6 · Coordinador, sin cola. */
    if (ui.fila === 6) {
      return (
        '<p class="text-sm text-gray-700">Todavía nadie de tu equipo dejó dudas de este módulo. Cuando haya al menos una, vas a poder agendar la Meet con Soporte.</p>' +
        (ui.puedeDuda
          ? ctaDuda(modulo)
          : '<p class="hint">Vos todavía no aprobaste este módulo, así que no podés dejar dudas — sí podés agendar la Meet del equipo cuando haya cola.</p>')
      );
    }

    /* 7 y 10 · Coordinador con cola. La diferencia es si hay turno libre. */
    if (ui.fila === 7 || ui.fila === 10) {
      const sinTurnos = ui.fila === 10;
      return (
        '<p class="text-sm text-gray-700"><strong>' +
        plural(n, "duda pendiente", "dudas pendientes") +
        "</strong> de este módulo, de " +
        plural(new Set(cupo.dudas.map(function (d) { return d.empleadoId; })).size, "persona", "personas") +
        " de tu equipo.</p>" +
        listaDudas(cupo.dudas, true) +
        (sinTurnos
          ? '<p class="alert alert-info text-sm"><span class="icon" data-icon="info"></span>Por ahora no hay turnos disponibles. Las dudas siguen en la cola y vas a poder agendar cuando se libere un turno.</p>'
          : '<a class="btn btn-primary self-start" href="meet.html?m=' + modulo.id +
            '"><span class="icon" data-icon="message"></span>Coordinar Meet</a>') +
        (ui.puedeDuda ? ctaDuda(modulo, "Sumar una duda mía") : "")
      );
    }

    /* 8 · Coordinador, turno tomado. */
    if (ui.fila === 8) {
      return (
        '<p class="text-sm text-gray-700">Meet agendada para el <strong>' +
        A.horaART(cupo.meet.inicioISO) + "</strong>, con " +
        plural(n, "duda", "dudas") + " en la agenda.</p>" +
        listaDudas(cupo.dudas, true) +
        '<a class="btn btn-bordered self-start" href="meet.html?m=' + modulo.id +
        '">Ver o cancelar el turno</a>'
      );
    }

    /* 9 · Coordinador, Meet realizada. */
    return (
      '<p class="text-sm text-gray-700">La Meet de este módulo se realizó el <strong>' +
      A.fechaCorta(cupo.meet.inicioISO) + "</strong>, con " +
      plural(n, "duda", "dudas") + " en la agenda.</p>" +
      listaDudas(cupo.dudas, true) +
      '<p class="hint">El cupo de este módulo ya se usó. Se vuelve a habilitar si el módulo recibe contenido nuevo.</p>'
    );
  }

  /* El bloque completo. Es secundario a propósito: borde de 1 px y fondo gris,
     nunca sombra ni el borde de marca — la Meet es soporte opcional, no el
     objetivo del módulo, y no puede competir con los videos ni la evaluación. */
  function bloque(modulo) {
    const ui = estadoUI(modulo);

    /* Sin badge en el estado 1: el módulo todavía no está aprobado, así que la
       Meet del equipo no es asunto de esta persona y un "Agendada" al lado de
       "primero tenés que aprobar" se lee como una contradicción. */
    const badge =
      ui.fila === 1
        ? ""
        : ui.fila === 7 || ui.fila === 10
        ? '<span class="badge badge-warning">' + plural(ui.cupo.dudas.length, "duda en cola", "dudas en cola") + "</span>"
        : ui.cupo.estado === "agendado"
        ? '<span class="badge badge-info">Agendada</span>'
        : ui.cupo.estado === "consumido"
        ? '<span class="badge badge-success">Realizada</span>'
        : "";

    return (
      '<section class="flex flex-col items-start gap-4 rounded-xl border border-line bg-surface p-6" aria-labelledby="meet-titulo" data-meet-fila="' +
      ui.fila + '">' +
      '<div class="flex w-full flex-wrap items-center gap-x-3 gap-y-1">' +
      '<h2 class="text-h5" id="meet-titulo" data-meet-foco tabindex="-1">Meet con Soporte</h2>' +
      badge +
      "</div>" +
      cuerpo(modulo, ui) +
      "</section>"
    );
  }

  /* -- Formulario de duda ----------------------------------------------------
     Un solo patrón de modal en todo el producto: el de `ui.js`, con foco
     atrapado y `Esc`. El markup se genera acá para no duplicarlo en las dos
     páginas que lo abren. */
  function markupModal(modulo) {
    const videos = A.videosAplicables(modulo.id);
    const secciones = A.secciones(modulo.id);

    return (
      '<div class="modal" id="modal-duda" role="dialog" aria-modal="true" aria-labelledby="duda-titulo" hidden>' +
      '<div class="modal-overlay"></div>' +
      '<div class="modal-panel modal-panel-wide">' +
      '<h2 class="text-h4" id="duda-titulo">Dejá tu duda</h2>' +
      '<p class="mt-2 text-sm text-gray-700">Se suma a la cola de <strong>' +
      esc(modulo.titulo) + "</strong> de " + esc(A.agencia.nombre) +
      ". El coordinador del equipo agenda una única Meet con Soporte para este módulo.</p>" +

      '<form class="mt-5 flex flex-col gap-4" id="form-duda" novalidate>' +

      '<div class="field">' +
      '<label class="label" for="duda-video">¿Sobre qué video? <span class="label-optional">(opcional)</span></label>' +
      '<select class="select" id="duda-video" name="video">' +
      '<option value="">No es sobre un video puntual</option>' +
      videos
        .map(function (v) {
          return '<option value="' + esc(v.id) + '">' + esc(v.titulo) + "</option>";
        })
        .join("") +
      "</select>" +
      "</div>" +

      '<div class="field">' +
      '<label class="label" for="duda-tema">¿Sobre qué tema? <span class="label-optional">(opcional)</span></label>' +
      '<select class="select" id="duda-tema" name="tema">' +
      '<option value="">Sin tema puntual</option>' +
      secciones
        .map(function (s) {
          return '<option value="' + esc(s.titulo) + '">' + esc(s.titulo) + "</option>";
        })
        .join("") +
      "</select>" +
      '<span class="hint" id="duda-tema-hint" hidden></span>' +
      "</div>" +

      '<div class="field">' +
      '<label class="label" for="duda-texto">Contanos tu duda</label>' +
      '<textarea class="textarea" id="duda-texto" name="texto" maxlength="500" required aria-describedby="duda-texto-error" data-autofocus placeholder="Describí lo más puntual posible qué no te quedó claro."></textarea>' +
      '<div class="flex flex-wrap justify-between gap-2">' +
      '<span class="error-text" id="duda-texto-error" hidden>Escribí tu duda para poder enviarla.</span>' +
      '<span class="hint ml-auto" data-counter-for="duda-texto">0 / 500</span>' +
      "</div>" +
      "</div>" +

      '<p class="alert alert-error text-sm" id="duda-error" hidden><span class="icon" data-icon="alert-circle"></span>No pudimos guardar tu duda. Probá de nuevo en un momento.</p>' +

      '<div class="mt-1 flex flex-col-reverse gap-2.5 border-t border-line pt-5 md:flex-row md:justify-end">' +
      '<button class="btn btn-bordered" type="button" data-modal-close>Cancelar</button>' +
      '<button class="btn btn-primary" type="submit" id="duda-enviar">Dejar la duda</button>' +
      "</div>" +

      "</form>" +
      "</div>" +
      "</div>"
    );
  }

  /* -- Cableado --------------------------------------------------------------
     `alCambiar` se llama después de registrar o retirar una duda: la página
     decide qué repintar.

     `sugerido` es el título de una sección del módulo a preseleccionar en el
     campo Tema. Sale de las preguntas que la usuaria falló, y solo lo puede
     saber `evaluacion.html`: `Quiz.descartar()` borra el intento del storage
     antes de corregir, así que en `modulo.html` el dato ya no existe y no se
     sugiere nada — antes que inventar una sugerencia, campo libre.

     Que el subtema de una pregunta sirva como tema de la duda no es casual: el
     `subtema` del banco ES el título de una sección del módulo, las dos
     taxonomías están alineadas a propósito. */
  function cablear(modulo, alCambiar, sugerido) {
    const form = document.getElementById("form-duda");
    if (!form || form.dataset.cableado === "1") return;
    form.dataset.cableado = "1";

    const texto = document.getElementById("duda-texto");
    const error = document.getElementById("duda-texto-error");
    const errorGeneral = document.getElementById("duda-error");
    const enviar = document.getElementById("duda-enviar");

    const select = document.getElementById("duda-tema");
    const existe = Array.prototype.some.call(select.options, function (o) {
      return o.value === sugerido;
    });
    if (sugerido && existe) {
      const hint = document.getElementById("duda-tema-hint");
      select.value = sugerido;
      hint.hidden = false;
      hint.textContent = "Te lo sugerimos porque es el tema de las preguntas que te costaron en la evaluación.";
    }

    texto.addEventListener("input", function () {
      if (texto.value.trim()) {
        error.hidden = true;
        texto.removeAttribute("aria-invalid");
      }
    });

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      errorGeneral.hidden = true;

      if (!texto.value.trim()) {
        error.hidden = false;
        texto.setAttribute("aria-invalid", "true");
        texto.focus();
        return;
      }

      UI.loading(enviar, true);
      window.setTimeout(function () {
        UI.loading(enviar, false);
        const duda = A.registrarDuda(modulo.id, {
          videoId: document.getElementById("duda-video").value || null,
          subtema: document.getElementById("duda-tema").value || null,
          texto: texto.value,
        });
        if (!duda) {
          errorGeneral.hidden = false;
          return;
        }
        form.reset();
        UI.closeModal();
        if (alCambiar) alCambiar(duda);
        recuperarFoco();
      }, 500);
    });
  }

  /* Los botones «Retirar mi duda» se regeneran con el bloque, así que se
     escuchan por delegación sobre el contenedor y no uno por uno. */
  function cablearRetiro(contenedor, alCambiar) {
    if (!contenedor || contenedor.dataset.retiroCableado === "1") return;
    contenedor.dataset.retiroCableado = "1";
    contenedor.addEventListener("click", function (evento) {
      const boton = evento.target.closest("[data-retirar]");
      if (!boton) return;
      evento.preventDefault();
      if (!A.retirarDuda(boton.dataset.retirar)) return;
      if (alCambiar) alCambiar(null);
      recuperarFoco();
    });
  }

  /* Repintar el bloque destruye el botón que tenía el foco —el que abrió el
     modal, o el «Retirar mi duda» recién usado—, así que `closeModal` lo
     devuelve a un nodo que ya no existe y se pierde en el `body`. Se lo lleva
     al encabezado del bloque, que es donde quedó el cambio. */
  function recuperarFoco() {
    const destino = document.querySelector("[data-meet-foco]");
    if (destino) destino.focus();
  }

  /* Los estados se anuncian solos al repintarse, pero recién después del primer
     render: con `aria-live` puesto desde el HTML, cargar la página leería el
     bloque entero en voz alta sin que haya pasado nada. */
  function anunciar(host) {
    if (!host || host.getAttribute("aria-live")) return;
    window.setTimeout(function () {
      host.setAttribute("aria-live", "polite");
    }, 0);
  }

  return {
    estadoUI: estadoUI,
    bloque: bloque,
    markupModal: markupModal,
    listaDudas: listaDudas,
    turnoTexto: turnoTexto,
    cablear: cablear,
    cablearRetiro: cablearRetiro,
    anunciar: anunciar,
    esc: esc,
    plural: plural,
  };
})();
