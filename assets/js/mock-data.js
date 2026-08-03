/* ============================================================================
   Academia SIGMMA — datos ficticios del prototipo
   ----------------------------------------------------------------------------
   Todo lo de acá es inventado y sirve solo para que el prototipo se pueda
   recorrer. No hay datos reales de agencias, personas ni credenciales.
   Fechas en DD/MM/YYYY, horario 24 h, zona ART (UTC-3).
   ========================================================================== */

window.ACADEMIA = (function () {
  "use strict";

  const usuario = {
    nombre: "Lucía Fernández",
    email: "lucia.fernandez@viajesdelsur.com",
    iniciales: "LF",
    agencia: "Viajes del Sur",
    perfil: "Corporate",
  };

  /* Módulos del recorrido Corporate. `estado` es el estado inicial del
     prototipo; el desbloqueo secuencial lo recalcula progreso.js en runtime. */
  const modulos = [
    {
      id: 1,
      codigo: "BAK-M01",
      titulo: "Introducción al ERP",
      resumen:
        "Panorama general del sistema, navegación y conceptos base de sigmma.net.",
      estado: "aprobado",
      nota: 9,
      fechaAprobacion: "02/06/2026",
      meetSolicitada: null,
      videos: 6,
      vistos: 6,
    },
    {
      id: 2,
      codigo: "BAK-M02",
      titulo: "Alta de clientes",
      resumen: "Carga, edición y búsqueda de clientes y pasajeros en el sistema.",
      estado: "aprobado",
      nota: 8,
      fechaAprobacion: "08/06/2026",
      meetSolicitada: "09/06",
      videos: 4,
      vistos: 4,
    },
    {
      id: 3,
      codigo: "BAK-M03",
      titulo: "Reservas aéreas",
      resumen: "Cotización, emisión y modificación de reservas de vuelos.",
      descripcion:
        "En este módulo vas a ver cómo cotizar, emitir y modificar reservas de vuelos desde el ERP: búsqueda de disponibilidad, reglas tarifarias, emisión, reemisión y cancelaciones. Al terminar los videos, hacé la evaluación para desbloquear el módulo siguiente.",
      estado: "en-progreso",
      nota: null,
      fechaAprobacion: null,
      meetSolicitada: null,
      videos: 8,
      vistos: 2,
    },
    {
      id: 4,
      codigo: "BAK-M04",
      titulo: "Paquetes y armado de viajes",
      resumen: "Cómo componer paquetes, márgenes y condiciones comerciales.",
      estado: "disponible",
      nota: null,
      fechaAprobacion: null,
      meetSolicitada: null,
      videos: 7,
      vistos: 0,
    },
    {
      id: 5,
      codigo: "BAK-M05",
      titulo: "Facturación y cobranzas",
      resumen: "Emisión de comprobantes, pagos parciales y conciliación.",
      estado: "bloqueado",
      videos: 5,
      vistos: 0,
    },
    {
      id: 6,
      codigo: "BAK-M06",
      titulo: "Reportes de gestión",
      resumen: "Tableros, exportaciones y lectura de indicadores.",
      estado: "bloqueado",
      videos: 6,
      vistos: 0,
    },
    {
      id: 7,
      codigo: "BAK-M07",
      titulo: "Cuentas corrientes de proveedores",
      resumen: "Saldos, imputaciones y conciliación con operadores mayoristas.",
      estado: "bloqueado",
      videos: 5,
      vistos: 0,
    },
    {
      id: 8,
      codigo: "BAK-M08",
      titulo: "Vouchers y documentación",
      resumen: "Emisión de vouchers, adjuntos al file y envío al pasajero.",
      estado: "bloqueado",
      videos: 4,
      vistos: 0,
    },
    {
      id: 9,
      codigo: "BAK-M09",
      titulo: "Cierre contable del período",
      resumen: "Cierre mensual, ajustes por tipo de cambio y exportación.",
      estado: "bloqueado",
      videos: 6,
      vistos: 0,
    },
    {
      id: 10,
      codigo: "BAK-M10",
      titulo: "Multimoneda y tipos de cambio",
      resumen: "Operar en ARS, USD y EUR: cotización, conversión y reportes.",
      estado: "bloqueado",
      videos: 5,
      vistos: 0,
    },
  ];

  /* Syllabus completo del módulo 03 — el único con contenido navegable. */
  const secciones = [
    {
      titulo: "Cotización y disponibilidad",
      videos: [
        {
          id: "m3-v1",
          titulo: "Buscar disponibilidad de vuelos",
          duracion: "3:40",
          segundos: 220,
          progreso: 100,
          visto: true,
        },
        {
          id: "m3-v2",
          titulo: "Leer reglas tarifarias",
          duracion: "4:05",
          segundos: 245,
          progreso: 100,
          visto: true,
        },
        {
          id: "m3-v3",
          titulo: "Comparar tarifas y armar la propuesta",
          duracion: "3:15",
          segundos: 195,
          progreso: 41,
          visto: false,
        },
      ],
    },
    {
      titulo: "Emisión y reemisión",
      videos: [
        {
          id: "m3-v4",
          titulo: "Emitir un ticket",
          duracion: "4:20",
          segundos: 260,
          progreso: 0,
          visto: false,
        },
        {
          id: "m3-v5",
          titulo: "Reemisión con diferencia tarifaria",
          duracion: "2:55",
          segundos: 175,
          progreso: 0,
          visto: false,
        },
        {
          id: "m3-v6",
          titulo: "Aplicar un saldo a favor del pasajero",
          duracion: "3:30",
          segundos: 210,
          progreso: 0,
          visto: false,
        },
      ],
    },
    {
      titulo: "Cancelaciones",
      videos: [
        {
          id: "m3-v7",
          titulo: "Cancelar antes de la emisión",
          duracion: "2:40",
          segundos: 160,
          progreso: 0,
          visto: false,
        },
        {
          id: "m3-v8",
          titulo: "Cancelar un ticket emitido y registrar el reintegro",
          duracion: "4:10",
          segundos: 250,
          progreso: 0,
          visto: false,
        },
      ],
    },
  ];

  /* Banco de preguntas del módulo 03. En producción son 50 por módulo y el
     backend sortea 10; acá alcanza con un banco reducido para que dos intentos
     seguidos traigan sets distintos. `subtema` es campo obligatorio del ABM. */
  const banco = [
    {
      id: "q1",
      subtema: "Reemisión",
      texto:
        "Cuando una reemisión genera diferencia tarifaria a favor del pasajero, ¿qué acción corresponde en el ERP?",
      opciones: [
        "Generar una nota de crédito asociada al ticket original.",
        "Registrar el saldo a favor y aplicarlo en la nueva emisión.",
        "Cancelar la reserva y volver a cotizar desde cero.",
        "No se registra en el sistema, se informa al pasajero por mail.",
      ],
      correcta: 1,
    },
    {
      id: "q2",
      subtema: "Saldos a favor",
      texto: "¿Qué condición habilita la aplicación automática de un saldo a favor?",
      opciones: [
        "Que el ticket original haya sido emitido en el mismo mes.",
        "Que el saldo esté asociado al mismo file y al mismo pasajero.",
        "Que el importe del saldo supere los 100 USD.",
        "Que lo autorice manualmente el área de administración.",
      ],
      correcta: 1,
    },
    {
      id: "q3",
      subtema: "Cancelaciones",
      texto: "Al cancelar una reserva emitida, ¿qué registro queda asociado al file?",
      opciones: [
        "Ninguno, el file se elimina del sistema.",
        "Solo una nota interna sin impacto contable.",
        "El comprobante de cancelación y el movimiento de reintegro.",
        "Se conserva el file pero se borra el historial de emisión.",
      ],
      correcta: 2,
    },
    {
      id: "q4",
      subtema: "Disponibilidad",
      texto:
        "En la búsqueda de disponibilidad, ¿qué determina que una tarifa se muestre como no reservable?",
      opciones: [
        "Que la clase de reserva no tenga cupo en el GDS.",
        "Que el vuelo salga en menos de 48 horas.",
        "Que el pasajero no tenga cuenta corriente habilitada.",
        "Que la agencia opere con un perfil distinto de Corporate.",
      ],
      correcta: 0,
    },
    {
      id: "q5",
      subtema: "Reglas tarifarias",
      texto: "¿Dónde se consulta la penalidad por cambio de fecha de una tarifa?",
      opciones: [
        "En el detalle del PNR, solapa de pasajeros.",
        "En las reglas tarifarias de la tarifa cotizada.",
        "En la cuenta corriente del proveedor.",
        "En el reporte de gestión mensual.",
      ],
      correcta: 1,
    },
    {
      id: "q6",
      subtema: "Emisión",
      texto: "¿Qué dato es obligatorio para poder emitir un ticket desde el ERP?",
      opciones: [
        "El número de voucher del hotel asociado.",
        "La forma de pago y el pasajero titular cargados en el file.",
        "La orden de compra firmada por el pasajero.",
        "El código IATA de la agencia de destino.",
      ],
      correcta: 1,
    },
    {
      id: "q7",
      subtema: "Emisión",
      texto: "Después de emitir, ¿qué documento queda disponible en el file?",
      opciones: [
        "El e-ticket y el comprobante de emisión.",
        "Solo el PNR del GDS.",
        "Únicamente el presupuesto original.",
        "Nada hasta el cierre contable del período.",
      ],
      correcta: 0,
    },
    {
      id: "q8",
      subtema: "Reemisión",
      texto:
        "Si la reemisión genera una diferencia en contra del pasajero, ¿cómo se registra el cobro?",
      opciones: [
        "Como un nuevo file independiente del original.",
        "Como un movimiento adicional dentro del mismo file.",
        "Como un ajuste manual en el cierre del período.",
        "No se registra: se cobra por fuera del sistema.",
      ],
      correcta: 1,
    },
    {
      id: "q9",
      subtema: "Cotización",
      texto: "¿Qué diferencia una cotización guardada de una reserva confirmada?",
      opciones: [
        "La cotización no bloquea cupo ni genera PNR.",
        "La cotización ya descuenta el saldo de la cuenta corriente.",
        "La cotización emite voucher provisorio.",
        "No hay diferencia funcional, solo de nombre.",
      ],
      correcta: 0,
    },
    {
      id: "q10",
      subtema: "Cancelaciones",
      texto: "¿Cuándo corresponde registrar una penalidad de cancelación?",
      opciones: [
        "Siempre, aunque la tarifa sea totalmente reembolsable.",
        "Cuando las reglas tarifarias la establecen para el momento de la cancelación.",
        "Solo si el pasajero lo solicita por escrito.",
        "Nunca: la penalidad la descuenta el proveedor por fuera del ERP.",
      ],
      correcta: 1,
    },
    {
      id: "q11",
      subtema: "Multimoneda",
      texto:
        "Un ticket cotizado en USD se cobra en ARS. ¿Qué tipo de cambio toma el ERP?",
      opciones: [
        "El del día de la emisión, según la fuente configurada.",
        "El del día del vuelo.",
        "Un tipo de cambio fijo cargado a inicio de año.",
        "El que cargue manualmente el vendedor en cada operación.",
      ],
      correcta: 0,
    },
    {
      id: "q12",
      subtema: "Disponibilidad",
      texto: "¿Qué implica que un segmento quede en lista de espera?",
      opciones: [
        "Que el ticket ya está emitido pero sin asiento asignado.",
        "Que la reserva ocupa cupo confirmado en clase superior.",
        "Que no hay cupo confirmado y la aerolínea puede o no otorgarlo.",
        "Que el pasajero debe volver a cotizar desde cero.",
      ],
      correcta: 2,
    },
  ];

  /* Vista agregada de la agencia. Solo métricas de capacitación: sin datos
     personales sensibles ni respuestas individuales de las evaluaciones. */
  const empleados = [
    /* `aprobados` de la usuaria logueada se recalcula abajo desde `modulos`,
       para que las tres pantallas nunca muestren números distintos. */
    { nombre: "Lucía Fernández", esVos: true, aprobados: 0, ultimoAcceso: "Hoy 10:12" },
    { nombre: "Martín Ruiz", aprobados: 10, certificado: true, ultimoAcceso: "28/07/2026" },
    { nombre: "Carla Domínguez", aprobados: 6, ultimoAcceso: "30/07/2026" },
    { nombre: "Diego Sosa", aprobados: 4, ultimoAcceso: "25/07/2026" },
    { nombre: "Paula Iglesias", aprobados: 2, ultimoAcceso: "19/07/2026" },
    { nombre: "Nicolás Vera", aprobados: 0, ultimoAcceso: null },
  ];

  empleados[0].aprobados = modulos.filter(function (m) {
    return m.estado === "aprobado";
  }).length;

  const soporte = {
    /* Canal único de soporte en toda la app: WhatsApp en pestaña nueva. */
    whatsapp: "https://wa.me/5493815550100?text=Hola%2C%20necesito%20ayuda%20con%20la%20Academia%20SIGMMA",
  };

  const quizConfig = {
    preguntasPorIntento: 10,
    umbral: 8,
    umbralPorcentaje: 80,
    tamanoBanco: 50,
  };

  const umbralVisto = 80; // % de duración para marcar un video como visto

  return {
    usuario,
    modulos,
    secciones,
    banco,
    empleados,
    soporte,
    quizConfig,
    umbralVisto,

    /* -- Derivados -------------------------------------------------------- */
    modulo(id) {
      return modulos.find((m) => m.id === Number(id)) || null;
    },
    aprobados() {
      return modulos.filter((m) => m.estado === "aprobado").length;
    },
    total() {
      return modulos.length;
    },
    progresoGeneral() {
      return Math.round((this.aprobados() / this.total()) * 100);
    },
    videosDelModulo() {
      return secciones.flatMap((s) => s.videos);
    },
    video(id) {
      return this.videosDelModulo().find((v) => v.id === id) || null;
    },
    seccionDe(id) {
      return secciones.find((s) => s.videos.some((v) => v.id === id)) || null;
    },
    avanceAgencia() {
      const suma = empleados.reduce((acc, e) => acc + e.aprobados, 0);
      return Math.round((suma / (empleados.length * modulos.length)) * 100);
    },

    /* -- Formato ----------------------------------------------------------- */
    hoyCorto() {
      const d = new Date();
      return (
        String(d.getDate()).padStart(2, "0") +
        "/" +
        String(d.getMonth() + 1).padStart(2, "0")
      );
    },
    ahoraLargo() {
      const d = new Date();
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      return `${dd}/${mm}/${d.getFullYear()} ${hh}:${mi}`;
    },
  };
})();
