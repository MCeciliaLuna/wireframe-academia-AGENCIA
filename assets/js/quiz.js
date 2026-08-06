/* ============================================================================
   Academia SIGMMA — máquina de estados de la evaluación
   ----------------------------------------------------------------------------
   Reglas del negocio, fijas:
   · 10 preguntas tomadas al azar del banco del módulo.
   · Se aprueba con 8 (80 %). Reintentos ilimitados, con set nuevo cada vez.
   · Sin límite de tiempo. El intento se puede dejar y retomar en la MISMA
     pregunta y con el MISMO set — no se sortea uno nuevo al volver.
   · En el repaso NUNCA se muestra cuál era la respuesta correcta.
   ========================================================================== */

window.Quiz = (function () {
  "use strict";

  /* La clave cuelga de la persona activa: un intento a medias de una persona de
     prueba no se le puede aparecer a otra. La compone `mock-data.js`. */
  function clave(moduloId) {
    return ACADEMIA.claveStorage("intento:" + moduloId);
  }

  function mezclar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copia[i];
      copia[i] = copia[j];
      copia[j] = tmp;
    }
    return copia;
  }

  function nuevoIntento(moduloId) {
    /* El banco es del MÓDULO, nunca global: cada módulo sortea sobre el suyo. */
    const banco = ACADEMIA.banco(moduloId);
    const cantidad = Math.min(ACADEMIA.quizConfig.preguntasPorIntento, banco.length);
    return {
      moduloId: moduloId,
      preguntas: mezclar(banco)
        .slice(0, cantidad)
        .map(function (q) {
          return q.id;
        }),
      respuestas: {},
      indice: 0,
      creado: Date.now(),
    };
  }

  function leer(moduloId) {
    try {
      const crudo = window.localStorage.getItem(clave(moduloId));
      const intento = crudo ? JSON.parse(crudo) : null;
      if (!intento || !Array.isArray(intento.preguntas)) return null;
      /* Un intento guardado antes de que cambiara el banco referencia preguntas
         que ya no existen. Se descarta en vez de rehidratarlo a medias: sin esto,
         `pregunta(id)` devuelve null y la pantalla se rompe al pintar. */
      const vigente = intento.preguntas.every(function (id) {
        return Boolean(ACADEMIA.pregunta(id));
      });
      if (!vigente) {
        descartar(moduloId);
        return null;
      }
      return intento;
    } catch (e) {
      return null;
    }
  }

  function guardar(intento) {
    try {
      window.localStorage.setItem(clave(intento.moduloId), JSON.stringify(intento));
    } catch (e) {
      /* Modo privado sin storage: el intento vive solo en memoria. */
    }
  }

  function descartar(moduloId) {
    try {
      window.localStorage.removeItem(clave(moduloId));
    } catch (e) {}
  }

  /* Los ids de pregunta son únicos entre módulos (`BAK-M30.q07`), así que el
     intento guardado en localStorage se puede rehidratar sin saber el módulo. */
  function pregunta(id) {
    return ACADEMIA.pregunta(id);
  }

  function sinResponder(intento) {
    return intento.preguntas
      .map(function (id, i) {
        return intento.respuestas[id] === undefined ? i + 1 : null;
      })
      .filter(function (n) {
        return n !== null;
      });
  }

  function corregir(intento) {
    const erradas = [];
    let correctas = 0;
    intento.preguntas.forEach(function (id, i) {
      const q = pregunta(id);
      const elegida = intento.respuestas[id];
      if (elegida === q.correcta) correctas++;
      else erradas.push({ numero: i + 1, pregunta: q, elegida: elegida });
    });
    return {
      correctas: correctas,
      total: intento.preguntas.length,
      erradas: erradas,
      aprobado: correctas >= ACADEMIA.quizConfig.umbral,
    };
  }

  /* Construye un resultado de demostración con una nota exacta, para poder
     abrir las pantallas 07 y 08 directamente por URL. */
  function resultadoDemo(moduloId, nota) {
    const intento = nuevoIntento(moduloId);
    intento.preguntas.forEach(function (id, i) {
      const q = pregunta(id);
      intento.respuestas[id] =
        i < nota ? q.correcta : (q.correcta + 1) % q.opciones.length;
    });
    return intento;
  }

  return {
    nuevoIntento: nuevoIntento,
    leer: leer,
    guardar: guardar,
    descartar: descartar,
    pregunta: pregunta,
    sinResponder: sinResponder,
    corregir: corregir,
    resultadoDemo: resultadoDemo,
  };
})();
