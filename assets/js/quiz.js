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

  const CLAVE = "academia:intento:";

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
    const cantidad = Math.min(
      ACADEMIA.quizConfig.preguntasPorIntento,
      ACADEMIA.banco.length
    );
    return {
      moduloId: moduloId,
      preguntas: mezclar(ACADEMIA.banco)
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
      const crudo = window.localStorage.getItem(CLAVE + moduloId);
      return crudo ? JSON.parse(crudo) : null;
    } catch (e) {
      return null;
    }
  }

  function guardar(intento) {
    try {
      window.localStorage.setItem(
        CLAVE + intento.moduloId,
        JSON.stringify(intento)
      );
    } catch (e) {
      /* Modo privado sin storage: el intento vive solo en memoria. */
    }
  }

  function descartar(moduloId) {
    try {
      window.localStorage.removeItem(CLAVE + moduloId);
    } catch (e) {}
  }

  function pregunta(id) {
    return ACADEMIA.banco.find(function (q) {
      return q.id === id;
    });
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
