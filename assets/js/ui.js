/* ============================================================================
   Academia SIGMMA — comportamiento de interfaz
   ----------------------------------------------------------------------------
   Modal único con foco atrapado, menú desplegable accesible, tooltips, orden de
   tablas, contadores de caracteres, y el enrutador de estados por query param
   (`?state=`) que permite abrir cualquiera de las 16 pantallas del wireframe
   directamente por URL.
   ========================================================================== */

window.UI = (function () {
  "use strict";

  const FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type=hidden])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  /* -- Query params -------------------------------------------------------- */
  const params = new URLSearchParams(window.location.search);

  function param(name, fallback) {
    return params.get(name) || fallback || null;
  }

  /* -- Modal ---------------------------------------------------------------
     Un solo patrón para todo el producto: overlay negro 60%, panel radio 12,
     foco atrapado, Esc, y el foco vuelve al disparador al cerrar. Los modales
     con `data-dismissible="false"` (sesión expirada) no se pueden descartar. */
  let openModal = null;
  let lastFocused = null;

  function focusables(root) {
    return Array.prototype.filter.call(
      root.querySelectorAll(FOCUSABLE),
      function (el) {
        return el.offsetParent !== null || el === document.activeElement;
      }
    );
  }

  function trap(event) {
    if (!openModal || event.key !== "Tab") return;
    const items = focusables(openModal);
    if (!items.length) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onKeydown(event) {
    if (event.key === "Escape" && openModal) {
      if (openModal.dataset.dismissible !== "false") {
        event.preventDefault();
        const onEsc = openModal.dataset.onEscape;
        if (onEsc && typeof window[onEsc] === "function") window[onEsc]();
        else closeModal();
      }
      return;
    }
    trap(event);
  }

  function showModal(target) {
    const el = typeof target === "string" ? document.getElementById(target) : target;
    if (!el) return;
    if (openModal && openModal !== el) closeModal();
    lastFocused = document.activeElement;
    el.hidden = false;
    openModal = el;
    document.body.style.overflow = "hidden";
    const autofocus = el.querySelector("[data-autofocus]") || focusables(el)[0];
    if (autofocus) autofocus.focus();
    else el.setAttribute("tabindex", "-1"), el.focus();
  }

  function closeModal() {
    if (!openModal) return;
    openModal.hidden = true;
    openModal = null;
    document.body.style.overflow = "";
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    lastFocused = null;
  }

  function bindModals() {
    document.addEventListener("keydown", onKeydown);

    document.addEventListener("click", function (event) {
      const opener = event.target.closest("[data-modal-open]");
      if (opener) {
        event.preventDefault();
        showModal(opener.dataset.modalOpen);
        return;
      }
      const closer = event.target.closest("[data-modal-close]");
      if (closer) {
        event.preventDefault();
        closeModal();
        return;
      }
      /* Click en el overlay: cierra solo si el modal es descartable. */
      if (
        openModal &&
        event.target.classList.contains("modal-overlay") &&
        openModal.dataset.dismissible !== "false"
      ) {
        closeModal();
      }
    });
  }

  /* -- Menú desplegable ---------------------------------------------------- */
  function bindDropdowns() {
    const roots = document.querySelectorAll("[data-dropdown]");

    function close(root) {
      const trigger = root.querySelector("[data-dropdown-trigger]");
      const menu = root.querySelector("[data-dropdown-menu]");
      if (!trigger || !menu) return;
      trigger.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    }

    function open(root) {
      const trigger = root.querySelector("[data-dropdown-trigger]");
      const menu = root.querySelector("[data-dropdown-menu]");
      if (!trigger || !menu) return;
      roots.forEach(close);
      trigger.setAttribute("aria-expanded", "true");
      menu.hidden = false;
      const first = menu.querySelector('[role="menuitem"], button, a');
      if (first) first.focus();
    }

    roots.forEach(function (root) {
      const trigger = root.querySelector("[data-dropdown-trigger]");
      const menu = root.querySelector("[data-dropdown-menu]");
      if (!trigger || !menu) return;

      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        const expanded = trigger.getAttribute("aria-expanded") === "true";
        if (expanded) close(root);
        else open(root);
      });

      menu.addEventListener("keydown", function (event) {
        const items = Array.prototype.slice.call(
          menu.querySelectorAll('[role="menuitem"], button, a')
        );
        const index = items.indexOf(document.activeElement);
        if (event.key === "Escape") {
          event.preventDefault();
          close(root);
          trigger.focus();
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          (items[index + 1] || items[0]).focus();
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          (items[index - 1] || items[items.length - 1]).focus();
        }
      });
    });

    document.addEventListener("click", function (event) {
      roots.forEach(function (root) {
        if (!root.contains(event.target)) close(root);
      });
    });

    window.UI_openDropdown = open;
    window.UI_dropdownRoots = roots;
  }

  /* -- Orden de tablas ----------------------------------------------------- */
  function bindSortableTables() {
    document.querySelectorAll("table[data-sortable]").forEach(function (table) {
      const body = table.querySelector("tbody");
      table.querySelectorAll("th[data-sort-key]").forEach(function (th) {
        const button = th.querySelector(".th-sort") || th;
        button.addEventListener("click", function () {
          const key = th.dataset.sortKey;
          const numeric = th.dataset.sortType === "number";
          const current = button.getAttribute("aria-sort");
          const dir = current === "ascending" ? "descending" : "ascending";

          table.querySelectorAll(".th-sort").forEach(function (other) {
            other.setAttribute("aria-sort", "none");
          });
          button.setAttribute("aria-sort", dir);

          const rows = Array.prototype.slice.call(body.querySelectorAll("tr"));
          rows.sort(function (a, b) {
            const av = a.dataset[key] || "";
            const bv = b.dataset[key] || "";
            const cmp = numeric
              ? Number(av) - Number(bv)
              : String(av).localeCompare(String(bv), "es");
            return dir === "ascending" ? cmp : -cmp;
          });
          rows.forEach(function (row) {
            body.appendChild(row);
          });
        });
      });
    });
  }

  /* -- Contador de caracteres ---------------------------------------------- */
  function bindCounters() {
    document.querySelectorAll("[data-counter-for]").forEach(function (out) {
      const field = document.getElementById(out.dataset.counterFor);
      if (!field) return;
      const max = field.getAttribute("maxlength") || 500;
      const update = function () {
        out.textContent = field.value.length + " / " + max;
      };
      field.addEventListener("input", update);
      update();
    });
  }

  /* -- Botón en estado de carga -------------------------------------------- */
  function loading(button, on) {
    if (!button) return;
    button.classList.toggle("is-loading", on !== false);
    if (on === false) button.removeAttribute("aria-busy");
    else button.setAttribute("aria-busy", "true");
  }

  /* -- Sesión expirada (pantalla 16) ---------------------------------------
     Takeover que se dispara ante un 401. Conserva el contexto de fondo
     atenuado, bloquea la interacción y no se puede descartar: sin ✕, sin click
     afuera, sin Esc. La única salida es volver a iniciar sesión. */
  function sessionExpired() {
    if (document.getElementById("modal-sesion-expirada")) {
      showModal("modal-sesion-expirada");
      return;
    }
    const el = document.createElement("div");
    el.id = "modal-sesion-expirada";
    el.className = "modal";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "sesion-expirada-titulo");
    el.dataset.dismissible = "false";
    el.innerHTML = [
      /* Se conserva el contexto de fondo, atenuado pero legible: el usuario
         tiene que reconocer dónde estaba, no sentir que perdió la pantalla. */
      '<div class="modal-overlay" style="background:rgba(249,250,251,.8);backdrop-filter:blur(3px)"></div>',
      '<div class="modal-panel" style="max-width:460px">',
      '  <span class="placeholder-icon mb-4" data-icon="clock"></span>',
      '  <h2 id="sesion-expirada-titulo" class="text-h4">Tu sesión expiró</h2>',
      '  <p class="mt-2 text-sm text-gray-700">Por seguridad cerramos la sesión después de un rato sin actividad. <strong>No perdiste tu progreso:</strong> los videos que ya viste y las evaluaciones guardadas siguen tal como los dejaste.</p>',
      '  <a href="index.html" class="btn btn-primary btn-lg mt-6" data-autofocus>Volver a iniciar sesión</a>',
      "</div>",
    ].join("");
    document.body.appendChild(el);
    if (window.renderIcons) window.renderIcons(el);
    showModal(el);
  }

  /* -- Módulo de la URL ----------------------------------------------------
     Centraliza la lectura de `?m=`. Existe porque el primer módulo del mapa
     tiene id 0 (`BAK-M00`): cualquier `Number(UI.param("m") || 30)` suelto en
     una página lo trataría como ausente. Sin `?m=`, cae en el módulo donde la
     usuaria tiene algo que hacer. */
  function moduloDeLaUrl() {
    const A = window.ACADEMIA;
    if (!A) return null;
    const crudo = param("m");
    if (crudo !== null) {
      const m = A.modulo(crudo);
      if (m) return m;
    }
    return A.moduloActual() || A.recorrido()[0] || A.modulos[0];
  }

  /* -- Aviso a pantalla completa -------------------------------------------
     Reemplaza el contenido de `main` por un placeholder-box. Es el patrón único
     para "no hay nada que mostrar acá y este es el motivo": lo usan la guarda de
     módulo y la precondición de la Meet. */
  function avisoPantalla(aviso) {
    const main = document.getElementById("contenido") || document.querySelector("main");
    if (!main) return false;
    if (aviso.title) document.title = aviso.title + " · Academia SIGMMA";
    main.className = "container-app page";
    main.innerHTML = [
      '<div class="mx-auto w-full max-w-narrow">',
      '  <div class="placeholder-box">',
      '    <span class="placeholder-icon"><span class="icon icon-lg" data-icon="' +
        (aviso.icono || "info") + '"></span></span>',
      '    <h1 class="text-h3">' + aviso.titulo + "</h1>",
      '    <p class="max-w-md text-gray-700">' + aviso.texto + "</p>",
      aviso.nota ? '    <p class="max-w-md text-sm text-ink-soft">' + aviso.nota + "</p>" : "",
      aviso.acciones
        ? '    <div class="mt-2 flex flex-wrap justify-center gap-3">' + aviso.acciones + "</div>"
        : "",
      "  </div>",
      "</div>",
    ].join("");
    if (window.renderIcons) window.renderIcons(main);
    return true;
  }

  /* -- Módulo inaccesible --------------------------------------------------
     Guarda de acceso: si alguien llega por URL a un módulo que no puede abrir,
     se reemplaza el contenido de la página por el motivo. No alcanza con
     esconder el link en el listado — la URL es adivinable.

     Hay DOS motivos y no dicen lo mismo:
       · `secuencia` — está en tu recorrido, pero falta aprobar el anterior.
       · `plan`      — no es parte del plan de tu agencia. "Aprobá el anterior"
                       acá no sirve: no hay nada que la usuaria pueda hacer sola,
                       así que la salida es el canal de soporte.

     Devuelve true si bloqueó, para que el controlador de la página corte.

     `ignorarSecuencia` es la única excepción del producto, y la usa solo
     `meet.html`: el coordinador agenda la Meet del equipo por su ROL, no por su
     avance, así que tiene que poder entrar a un módulo que él todavía no
     desbloqueó — las dudas de la cola son de gente que sí lo aprobó. El plan
     de la agencia sigue mandando: un módulo fuera del plan no tiene cola
     posible, porque nadie de esa agencia puede aprobarlo. */
  function bloquearModulo(modulo, opciones) {
    const A = window.ACADEMIA;
    if (!A || !modulo) return false;
    const motivo = A.motivoBloqueo(modulo.id);
    if (!motivo) return false;
    if (motivo === "secuencia" && opciones && opciones.ignorarSecuencia) return false;

    /* Los rótulos del chrome que nombran el módulo se completan igual: la
       guarda corta el controlador de la página antes de que los hidrate, y un
       "Evaluación · " sin nada al lado se lee como algo roto. */
    document.querySelectorAll("[data-modulo-titulo]").forEach(function (el) {
      el.textContent = modulo.titulo;
    });

    avisoPantalla(motivo === "plan" ? avisoPlan(A, modulo) : avisoSecuencia(A, modulo));
    return true;
  }

  /* Bloqueo por secuencia: hay algo que hacer, y el CTA lleva ahí. */
  function avisoSecuencia(A, modulo) {
    const anterior = A.prerequisito(modulo.id);
    /* El CTA no lleva al módulo inmediatamente anterior — ese puede estar
       bloqueado también, y se rebota de pantalla en pantalla. Lleva al primer
       módulo habilitado sin aprobar, que es donde hay algo que hacer. */
    const retomar = A.moduloActual();
    const rotulo = (A.rotulo(modulo.id) || "módulo").toLowerCase();
    return {
      title: "Módulo bloqueado",
      icono: "lock",
      titulo: "El " + rotulo + " todavía está bloqueado",
      texto:
        "Para abrir <strong>" + modulo.titulo +
        "</strong> primero tenés que aprobar la evaluación del <strong>" +
        (anterior ? (A.rotulo(anterior.id) || "").toLowerCase() : "módulo anterior") +
        "</strong>. Los módulos se habilitan de a uno, en orden.",
      nota: retomar
        ? "Vas por el <strong>" + (A.rotulo(retomar.id) || "").toLowerCase() + " · " +
          retomar.titulo + "</strong>."
        : null,
      acciones:
        (retomar
          ? '<a class="btn btn-primary" href="modulo.html?m=' + retomar.id +
            '">Seguir con el ' + (A.rotulo(retomar.id) || "módulo").toLowerCase() + "</a>"
          : "") +
        '<a class="btn btn-bordered" href="modulos.html">Ver mi recorrido</a>',
    };
  }

  /* Bloqueo por plan: no hay nada que la usuaria pueda resolver sola. El aviso
     nombra el plan que sí lo incluye y ofrece el canal de soporte. No promete
     nada sobre condiciones, plazos ni precios: eso no lo define la Academia. */
  function avisoPlan(A, modulo) {
    const plan = A.planDe(modulo.id);
    const retomar = A.moduloActual();
    const soporte = A.soporte && A.soporte.whatsapp;
    return {
      title: "Módulo del plan " + plan,
      icono: "sparkles",
      titulo: modulo.titulo + " es parte del plan " + plan,
      texto:
        "Este módulo no está incluido en el recorrido de tu agencia" +
        (modulo.nicho ? ", porque cubre la operación de receptivo operador" : "") +
        ". Si lo necesitás, escribinos y lo vemos.",
      nota:
        "Tu recorrido tiene <strong>" + A.total() +
        " módulos</strong> y lo podés completar sin este.",
      acciones:
        (soporte
          ? '<a class="btn btn-primary" href="' + soporte + '" target="_blank" rel="noopener">' +
            '<span class="icon" data-icon="message"></span>Escribinos por WhatsApp</a>'
          : "") +
        (retomar
          ? '<a class="btn btn-bordered" href="modulo.html?m=' + retomar.id +
            '">Seguir con el ' + (A.rotulo(retomar.id) || "módulo").toLowerCase() + "</a>"
          : '<a class="btn btn-bordered" href="modulos.html">Ver mi recorrido</a>'),
    };
  }

  /* -- Arranque ------------------------------------------------------------ */
  function init() {
    bindModals();
    bindDropdowns();
    bindSortableTables();
    bindCounters();

    /* Pinta el año y los datos de identidad del chrome en todas las páginas. */
    const u = window.ACADEMIA && window.ACADEMIA.usuario;
    if (u) {
      document.querySelectorAll("[data-user-name]").forEach(function (el) {
        el.textContent = u.nombre;
      });
      document.querySelectorAll("[data-user-agency]").forEach(function (el) {
        el.textContent = u.agencia;
      });
      document.querySelectorAll("[data-user-profile]").forEach(function (el) {
        el.textContent = u.perfil;
      });
      document.querySelectorAll("[data-user-initials]").forEach(function (el) {
        el.textContent = u.iniciales;
      });
      document.querySelectorAll("[data-user-email]").forEach(function (el) {
        el.textContent = u.email;
      });
    }
    const s = window.ACADEMIA && window.ACADEMIA.soporte;
    if (s) {
      document.querySelectorAll("[data-support-link]").forEach(function (el) {
        el.setAttribute("href", s.whatsapp);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
      });
    }

    if (param("state") === "expired") sessionExpired();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return {
    param: param,
    moduloDeLaUrl: moduloDeLaUrl,
    showModal: showModal,
    closeModal: closeModal,
    loading: loading,
    sessionExpired: sessionExpired,
    avisoPantalla: avisoPantalla,
    bloquearModulo: bloquearModulo,
  };
})();
