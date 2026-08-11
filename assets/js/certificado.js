/* ============================================================================
   Academia SIGMMA — datos del titular del certificado
   ----------------------------------------------------------------------------
   Antes de descargar el certificado se confirman los datos que van impresos en
   el PDF. El modelo NO tiene documento cargado —no hay SSO ni backoffice detrás
   del prototipo—, así que el formulario lo CAPTURA: pide tipo y número para que
   salgan impresos, y valida FORMATO, nunca coincidencia contra un dato que no
   existe.

   Se pide en CADA descarga y no se persiste nada: en el producto real el
   backend lo guardaría una vez y precargaría el campo. Está anotado como
   decisión abierta (`CE-1` / `CE-2`) en `design-system.html`.

   Las REGLAS no están acá: el catálogo de tipos, la validación de formato y
   «este recorrido está certificado» viven enteros en `mock-data.js`
   (`tiposDocumento`, `validarDocumento`, `puedeCertificar`). Este archivo solo
   arma el modal y pinta lo que ACADEMIA le devuelve — igual que en el producto
   real el frontend no reimplementaría la regla.

   El markup se genera acá y no en el HTML porque el disparador es reutilizable:
   hoy hay un único botón de descarga (`certificaciones.html`) y cualquier otro
   que aparezca se cablea con una línea, `Certificado.cablear(boton)`.

   OJO — el botón NO lleva `data-modal-open`. Ese cableado genérico de `ui.js`
   abriría el diálogo sin pasar por la guarda. La única puerta es `cablear()`.

   Carga después de `ui.js` y antes del script inline de la página.
   ========================================================================== */

window.Certificado = (function () {
  "use strict";

  const A = window.ACADEMIA;
  const ID = "modal-certificado";
  const INSPECCIONABLES = ["datos", "error", "emitido"];

  /* -- La guarda -------------------------------------------------------------
     El modal no se abre si el recorrido no está completo. La regla es
     `ACADEMIA.puedeCertificar()` y no se reimplementa acá.

     `?state=complete` es la simulación documentada de la pantalla —el mismo
     deep link que `certificaciones.html` usa para poder mirarla sin aprobar
     nueve evaluaciones— y se lee en UN solo lugar, este, para que la pantalla y
     la guarda no puedan discrepar. Cualquier otra URL, y cualquier retoque del
     DOM, choca contra `puedeCertificar()`. */
  function habilitado() {
    return A.puedeCertificar() || UI.param("state") === "complete";
  }

  /* -- Markup ---------------------------------------------------------------
     Los dos pasos se arman juntos y el segundo nace `hidden`: confirmar es
     intercambiar dos atributos, no reconstruir el panel. Así el disparador que
     tiene que recuperar el foco al cerrar nunca deja de existir.

     Nada se pinta con `innerHTML` a partir de lo que escribe la usuaria: el
     número tipeado se vuelca con `textContent`, así que no hace falta escapar
     nada. */
  function markup() {
    const opciones = A.tiposDocumento
      .map(function (t, i) {
        return '<option value="' + t.clave + '"' + (i === 0 ? " selected" : "") + ">" +
          t.etiqueta + "</option>";
      })
      .join("");

    return (
      '<div class="modal" id="' + ID + '" role="dialog" aria-modal="true" aria-labelledby="cert-datos-titulo" hidden>' +
      '<div class="modal-overlay"></div>' +
      '<div class="modal-panel">' +

      /* -- Paso 1 · confirmar los datos ------------------------------------ */
      '<div id="cert-paso-datos">' +
      '<h2 class="text-h4" id="cert-datos-titulo">Confirmá los datos de tu certificado</h2>' +
      '<p class="mt-2 text-sm text-gray-700">Estos datos se imprimen en el PDF y no se pueden cambiar después.</p>' +

      '<form class="mt-5 flex flex-col gap-4" id="form-certificado" novalidate>' +

      '<div class="field">' +
      '<label class="label" for="cert-nombre">Nombre y apellido <span class="label-optional">(solo lectura)</span></label>' +
      '<input class="input" id="cert-nombre" type="text" readonly value="" />' +
      '<p class="hint">Sale de tu usuario de sigmma.net. Si no es correcto, escribinos antes de descargar.</p>' +
      "</div>" +

      '<div class="field">' +
      '<label class="label" for="cert-tipo">Tipo de documento</label>' +
      '<select class="select" id="cert-tipo" name="tipo" data-autofocus>' + opciones + "</select>" +
      "</div>" +

      '<div class="field">' +
      '<label class="label" for="cert-numero">Número de documento</label>' +
      '<input class="input" id="cert-numero" name="numero" type="text" autocomplete="off" ' +
      'aria-describedby="cert-numero-hint cert-numero-error" />' +
      '<p class="hint" id="cert-numero-hint"></p>' +
      /* `role="alert"` cubre el segundo submit seguido, con el foco ya en el
         campo: ahí `focus()` es no-op y sin esto nada se vuelve a anunciar. */
      '<p class="error-text" id="cert-numero-error" role="alert" hidden>' +
      '<span class="icon icon-sm" data-icon="alert-circle"></span><span data-texto></span></p>' +
      "</div>" +

      '<div class="mt-1 flex flex-col-reverse gap-2.5 border-t border-line pt-5 md:flex-row md:justify-end">' +
      '<button class="btn btn-bordered" type="button" data-modal-close>Cancelar</button>' +
      '<button class="btn btn-primary" type="submit" id="cert-confirmar">Confirmar y descargar</button>' +
      "</div>" +
      "</form>" +
      "</div>" +

      /* -- Paso 2 · qué queda impreso -------------------------------------- */
      '<div id="cert-paso-emitido" hidden>' +
      '<span class="placeholder-icon"><span class="icon icon-lg" data-icon="award"></span></span>' +
      '<h2 class="mt-4 text-h4" id="cert-emitido-titulo" tabindex="-1">Listo: así sale tu certificado</h2>' +
      '<p class="mt-2 text-sm text-gray-700">Estos son los datos con los que se emite. Se imprimen tal cual.</p>' +
      '<dl class="mt-4 flex flex-col gap-3 rounded-md border border-line bg-surface p-4 text-sm">' +
      '<div class="flex flex-wrap justify-between gap-3"><dt class="text-ink-soft">Nombre</dt><dd class="font-bold" id="cert-r-nombre"></dd></div>' +
      '<div class="flex flex-wrap justify-between gap-3"><dt class="text-ink-soft">Documento</dt><dd class="font-bold" id="cert-r-documento"></dd></div>' +
      '<div class="flex flex-wrap justify-between gap-3"><dt class="text-ink-soft">Recorrido</dt><dd class="font-bold" id="cert-r-recorrido"></dd></div>' +
      '<div class="flex flex-wrap justify-between gap-3"><dt class="text-ink-soft">Fecha de emisión</dt><dd class="font-bold" id="cert-r-fecha"></dd></div>' +
      "</dl>" +
      '<p class="alert alert-info mt-4"><span class="icon" data-icon="info"></span>En el prototipo el archivo no se genera: el PDF lo emite el backend con estos mismos datos. Cada descarga vuelve a pedirte el documento, porque acá no se guarda nada.</p>' +
      '<div class="mt-5 flex justify-end border-t border-line pt-5">' +
      '<button class="btn btn-primary" type="button" data-modal-close>Listo</button>' +
      "</div>" +
      "</div>" +

      "</div>" +
      "</div>"
    );
  }

  /* -- Montaje perezoso ------------------------------------------------------
     El diálogo se inyecta recién en el primer `abrir()`. Una persona que no
     puede certificar no tiene el modal en el DOM: la guarda es estructura, no
     solo condición. */
  function montar() {
    let el = document.getElementById(ID);
    if (el) return el;
    const host = document.createElement("div");
    host.innerHTML = markup();
    el = host.firstChild;
    document.body.appendChild(el);
    /* Por atributo y no por propiedad: `reiniciar()` llama a `form.reset()` en
       cada apertura, que devuelve los campos al valor del ATRIBUTO. Con `.value`
       el nombre se vaciaría al abrir el modal por segunda vez. */
    el.querySelector("#cert-nombre").setAttribute("value", A.usuario.nombre);
    if (window.renderIcons) window.renderIcons(el);
    cablearForm(el);
    return el;
  }

  /* -- Ayuda por tipo --------------------------------------------------------
     El tipo cambia la regla, así que cambia también el ejemplo, el largo máximo
     y el teclado: un pasaporte con `inputmode="numeric"` abre el teclado
     equivocado en un teléfono. */
  function pintarAyuda(el) {
    const t = A.tipoDocumento(el.querySelector("#cert-tipo").value);
    const numero = el.querySelector("#cert-numero");
    if (!t) return;
    el.querySelector("#cert-numero-hint").textContent = t.ayuda;
    numero.setAttribute("inputmode", t.soloDigitos ? "numeric" : "text");
    numero.setAttribute("placeholder", t.ejemplo);
    numero.setAttribute("maxlength", String(t.maximo));
  }

  function mostrarError(el, mensaje) {
    const error = el.querySelector("#cert-numero-error");
    el.querySelector("#cert-numero").setAttribute("aria-invalid", "true");
    error.querySelector("[data-texto]").textContent = mensaje;
    error.hidden = false;
  }

  function limpiarError(el) {
    el.querySelector("#cert-numero").removeAttribute("aria-invalid");
    el.querySelector("#cert-numero-error").hidden = true;
  }

  /* Se pide en CADA descarga: el paso 2 de la vez anterior no puede quedar
     pegado, y el campo arranca vacío porque no hay nada guardado. */
  function reiniciar(el) {
    el.querySelector("#form-certificado").reset();
    limpiarError(el);
    pintarAyuda(el);
    el.querySelector("#cert-paso-datos").hidden = false;
    el.querySelector("#cert-paso-emitido").hidden = true;
    el.setAttribute("aria-labelledby", "cert-datos-titulo");
  }

  function cablearForm(el) {
    const form = el.querySelector("#form-certificado");
    const tipo = el.querySelector("#cert-tipo");
    const numero = el.querySelector("#cert-numero");
    const confirmar = el.querySelector("#cert-confirmar");

    /* Cambiar el tipo cambia la regla: el error que estaba pintado ya no
       describe nada. */
    tipo.addEventListener("change", function () {
      pintarAyuda(el);
      limpiarError(el);
    });
    numero.addEventListener("input", function () {
      limpiarError(el);
    });

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      const error = A.validarDocumento(tipo.value, numero.value);
      if (error) {
        mostrarError(el, error);
        numero.focus();
        return;
      }
      /* Latencia simulada, como en el resto del prototipo. El botón se apaga
         para que no entren dos confirmaciones. */
      UI.loading(confirmar, true);
      window.setTimeout(function () {
        UI.loading(confirmar, false);
        emitir(el, tipo.value, A.normalizarDocumento(numero.value));
      }, 500);
    });
  }

  /* -- El cierre -------------------------------------------------------------
     No hay PDF ni backend, así que el cierre honesto es mostrar EXACTAMENTE lo
     que quedaría impreso —que es lo que el formulario vino a capturar— y decir
     con todas las letras que el archivo lo genera el backend. Nada se guarda:
     la próxima descarga vuelve a pedir los datos. */
  function emitir(el, claveTipo, numero) {
    const t = A.tipoDocumento(claveTipo);
    el.querySelector("#cert-r-nombre").textContent = A.usuario.nombre;
    el.querySelector("#cert-r-documento").textContent = t.etiquetaCorta + " " + numero;
    el.querySelector("#cert-r-recorrido").textContent =
      "Plan " + A.usuario.perfil + " · " + A.total() + " módulos aprobados";
    el.querySelector("#cert-r-fecha").textContent = A.ahoraLargo() + " (ART)";

    el.querySelector("#cert-paso-datos").hidden = true;
    el.querySelector("#cert-paso-emitido").hidden = false;
    el.setAttribute("aria-labelledby", "cert-emitido-titulo");

    /* El submit que tenía el foco se acaba de esconder: sin esto el foco cae al
       body y el lector no anuncia nada. Va al encabezado del paso nuevo, que es
       donde quedó el cambio. Mismo criterio que `Meet.recuperarFoco`. */
    el.querySelector("#cert-emitido-titulo").focus();
  }

  function abrir() {
    if (!habilitado()) return false;
    const el = montar();
    reiniciar(el);
    UI.showModal(el);
    return true;
  }

  /* -- Estados forzados por URL ----------------------------------------------
     `?cert=` abre el modal en un estado concreto para poder inspeccionarlo sin
     tipear, igual que `?meet=` con el bloque de la Meet. NO saltea la guarda:
     pasa por `abrir()`, así que con el recorrido incompleto no monta nada. */
  function inspeccionar(valor) {
    if (INSPECCIONABLES.indexOf(valor) === -1) return false;
    if (!abrir()) return false;
    const el = document.getElementById(ID);
    if (valor === "error") {
      const numero = el.querySelector("#cert-numero");
      numero.value = "123";
      mostrarError(el, A.validarDocumento(el.querySelector("#cert-tipo").value, "123"));
      numero.focus();
    } else if (valor === "emitido") {
      emitir(el, "DNI", "30123456");
    }
    return true;
  }

  /* -- Punto de entrada reutilizable -----------------------------------------
     Una línea por cada botón que ofrezca descargar. Si el recorrido no está
     completo NO engancha nada: el botón queda inerte aunque alguien le saque el
     `aria-disabled` a mano. */
  function cablear(boton) {
    if (!boton || boton.dataset.certCableado === "1") return false;
    if (!habilitado()) return false;
    boton.dataset.certCableado = "1";
    boton.setAttribute("aria-haspopup", "dialog");
    boton.addEventListener("click", function (evento) {
      evento.preventDefault();
      abrir();
    });
    return true;
  }

  return {
    habilitado: habilitado,
    cablear: cablear,
    abrir: abrir,
    inspeccionar: inspeccionar,
  };
})();
