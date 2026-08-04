/* ============================================================================
   Academia SIGMMA — datos del prototipo
   ----------------------------------------------------------------------------
   Los módulos, secciones y videos son los REALES del mapa de contenido
   (`Estrategia_Grabado_Academia_SIGMMA_mapa_pareto_v2`): 11 módulos BAK,
   31 secciones, 55 videos con su ID permanente `BAK-Mxx.yyy`.

   Lo que sí es ficticio: las personas, la agencia, las duraciones de los videos
   (dentro del rango 2-5 min que declara el mapa), las notas y los bancos de
   preguntas. No hay datos reales de agencias, personas ni credenciales.

   Fechas en DD/MM/YYYY, horario 24 h, zona ART (UTC-3).
   ========================================================================== */

window.ACADEMIA = (function () {
  "use strict";

  /* -- Identidad -------------------------------------------------------------
     `perfil` es el plan de la agencia y decide qué módulos entran al recorrido.
     La nomenclatura es la del mapa de contenido: Professional y Business. Con
     Professional, los módulos M90 (Contable) y M95 (Receptivo) quedan fuera del
     recorrido y se muestran con candado de plan. */
  const usuario = {
    nombre: "Lucía Fernández",
    email: "lucia.fernandez@viajesdelsur.com",
    iniciales: "LF",
    agencia: "Viajes del Sur",
    perfil: "Professional",
  };

  const PROF = "Professional";
  const BUS = "Business";
  const TODOS = [PROF, BUS];

  /* -- Fechas ----------------------------------------------------------------
     Los timestamps del prototipo son ISO local con segundos, en ART (UTC-3):
     `2026-06-08T16:05:12`. Los segundos existen porque son el desempate del
     ranking. Las etiquetas legibles (DD/MM/YYYY) se derivan de la ISO y nunca
     se cargan a mano, para que no puedan quedar desfasadas.

     Se parsean por string y no con `new Date` a propósito: el prototipo se abre
     sobre `file://` en cualquier navegador y el formateo no debe depender de la
     zona horaria de la máquina. */
  function fechaCorta(iso) {
    if (!iso) return null;
    const partes = iso.slice(0, 10).split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
  }

  function isoHoy() {
    const d = new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  /* "Hoy 10:12" si el acceso es del día, si no la fecha corta. `null` cuando la
     persona nunca entró: la vista decide cómo nombrar esa ausencia. */
  function etiquetaAcceso(iso) {
    if (!iso) return null;
    return iso.slice(0, 10) === isoHoy() ? "Hoy " + iso.slice(11, 16) : fechaCorta(iso);
  }

  /* Clave numérica para ordenar timestamps en atributos `data-*`, que solo
     guardan strings. `-1` deja las filas sin actividad siempre al final. */
  function ordenFecha(iso) {
    return iso ? Number(iso.replace(/\D/g, "")) : -1;
  }

  /* Ordinal en masculino porque concuerda con "puesto" ("vas 5º"), no con la
     persona: así el ranking no genera a nadie. `null` es quien todavía no tiene
     puesto, y lo resuelve la vista con su propio copy. */
  function ordinal(n) {
    return n ? n + "º" : null;
  }

  /* Atajo de carga del syllabus: `v(id, titulo, "M:SS")` deriva los segundos de
     la duración, para que los dos números no puedan contradecirse. */
  function v(id, titulo, duracion, progreso, visto, planes) {
    const partes = duracion.split(":");
    return {
      id: id,
      titulo: titulo,
      duracion: duracion,
      segundos: Number(partes[0]) * 60 + Number(partes[1]),
      progreso: progreso || 0,
      visto: Boolean(visto),
      /* Solo M80.030 lo usa: es el único video con tag de plan distinto del de
         su módulo. Sin este campo, el módulo entero tendría que ser Business. */
      planes: planes || null,
    };
  }

  /* -- Los 11 módulos BAK ----------------------------------------------------
     `id` es el número del mapa (0, 10, 20 … 95) y es lo que viaja en `?m=`.
     `codigo` es el ID permanente, que no se muestra en la interfaz de agencia:
     ahí el módulo se nombra por su POSICIÓN en el recorrido (`posicion(id)`).
     `estado` es el estado inicial del prototipo; el desbloqueo secuencial y el
     filtro de plan lo recalculan en runtime con `estadoEfectivo(id)`.

     El orden de los videos dentro de cada sección es el de carga, no el del ID:
     tres secciones lo rompen a propósito (M40.S3, M70.S1, M80.S2) porque el
     agrupamiento pedagógico manda sobre la secuencia del ID, y el ID nunca se
     mueve. */
  const modulos = [
    {
      id: 0,
      codigo: "BAK-M00",
      titulo: "Fundamentos",
      resumen: "Qué es SIGMMA, cómo piensa el sistema y cómo moverse por él.",
      descripcion:
        "El punto de partida: qué resuelve SIGMMA dentro de la agencia, cómo se conecta el ciclo de la operación turística y cómo navegar el sistema. No hace falta saber nada previo.",
      planes: TODOS,
      estado: "aprobado",
      nota: 9,
      aprobadoEn: "2026-06-02T11:20:35",
      meetSolicitada: null,
      secciones: [
        {
          orden: 1,
          titulo: "La lógica del sistema",
          videos: [
            v("BAK-M00.010", "Qué es SIGMMA: el sistema operativo de la agencia", "4:10"),
            v("BAK-M00.020", "El ciclo 360° de la operación turística: cliente, prestador y utilidad", "4:45"),
            v("BAK-M00.030", "Los 7 principios y los procesos atomizados", "3:55"),
          ],
        },
        {
          orden: 2,
          titulo: "Moverse por SIGMMA",
          videos: [
            v("BAK-M00.040", "Navegación: ingreso, menú, botones, último file y rueda de progreso", "3:30"),
          ],
        },
      ],
    },
    {
      id: 10,
      codigo: "BAK-M10",
      titulo: "File",
      resumen: "Buscar, crear y configurar el file: la unidad de toda la operación.",
      descripcion:
        "El file es donde vive cada operación. Acá vas a ver cómo encontrarlo, cómo crearlo según el tipo de servicio, y las decisiones de configuración que después condicionan todo: moneda, datos y estados.",
      planes: TODOS,
      estado: "aprobado",
      nota: 8,
      aprobadoEn: "2026-06-08T16:05:12",
      meetSolicitada: "09/06",
      secciones: [
        {
          orden: 1,
          titulo: "Encontrar y crear un file",
          videos: [
            v("BAK-M10.010", "Buscar file: número, filtros y por nombre", "2:50"),
            v("BAK-M10.020", "Crear y editar un file: tipo de servicio, individual vs. grupal", "4:20"),
          ],
        },
        {
          orden: 2,
          titulo: "Configurar el file",
          videos: [
            v("BAK-M10.030", "Moneda de registro vs. moneda de documento", "4:05"),
            v("BAK-M10.040", "Datos del file: nombre, destino IATA, fechas y segmentación", "3:35"),
            v("BAK-M10.050", "Estados del file: automáticos, manuales y cierre", "3:15"),
          ],
        },
        {
          orden: 3,
          titulo: "Files grupales",
          videos: [
            v("BAK-M10.060", "Salida grupal: vincular files e informe de salida", "4:40"),
          ],
        },
      ],
    },
    {
      id: 20,
      codigo: "BAK-M20",
      titulo: "Entidades: clientes, pasajeros y proveedores",
      resumen: "Quién es quién en el sistema y cómo se cargan las tres entidades.",
      descripcion:
        "Clientes, pasajeros y proveedores son las tres entidades sobre las que se apoya toda la operación. Este módulo aísla la distinción entre cliente y pasajero, que es el concepto que más se confunde, y cierra con la carga masiva desde Excel.",
      planes: TODOS,
      estado: "en-progreso",
      nota: null,
      aprobadoEn: null,
      meetSolicitada: null,
      secciones: [
        {
          orden: 1,
          titulo: "Clientes",
          videos: [
            v("BAK-M20.010", "Cargar un cliente: físico vs. jurídico y autocompletado por ARCA/CUIT", "4:15", 100, true),
            v("BAK-M20.020", "Cliente: solapas de documentación, tarjetas, clasificación y adjuntos", "3:50", 100, true),
          ],
        },
        {
          orden: 2,
          titulo: "Cliente vs. pasajero",
          videos: [
            v("BAK-M20.030", "Cliente vs. pasajero: el concepto que más se confunde", "3:05", 41),
            v("BAK-M20.040", "Cargar un pasajero: pax principal y alta en la base de clientes", "3:40"),
          ],
        },
        {
          orden: 3,
          titulo: "Proveedores y carga masiva",
          videos: [
            v("BAK-M20.050", "Proveedor turístico y no turístico", "2:55"),
            v("BAK-M20.060", "Importar la base de clientes y proveedores desde Excel", "4:30"),
          ],
        },
      ],
    },
    {
      id: 30,
      codigo: "BAK-M30",
      titulo: "Voucher / Servicios",
      resumen: "El corazón operativo: cargar, valorizar y procesar los servicios.",
      descripcion:
        "El voucher es el corazón operativo del sistema: tiene una cara operativa y otra administrativa. Vas a ver cómo cargarlo, cómo se arman sus números —margen e impuestos— y por qué procesarlo es el paso que no se puede saltear.",
      planes: TODOS,
      estado: "bloqueado",
      secciones: [
        {
          orden: 1,
          titulo: "Qué es y cómo se carga",
          videos: [
            v("BAK-M30.010", "Qué es el voucher: perfil operativo y administrativo", "3:45"),
            v("BAK-M30.020", "Cargar un voucher: tipo, subtipo y proveedor", "4:25"),
          ],
        },
        {
          orden: 2,
          titulo: "Los números del voucher",
          videos: [
            v("BAK-M30.030", "Margen: comisión vs. utilidad", "4:00"),
            v("BAK-M30.040", "Conceptos impositivos e IVA: separar aéreo exento de terrestre", "4:50"),
          ],
        },
        {
          orden: 3,
          titulo: "Procesar e impactar",
          videos: [
            v("BAK-M30.050", "Procesar el voucher: impacto en la cuenta del proveedor", "3:30"),
            v("BAK-M30.060", "Estados del voucher y cotización", "3:10"),
          ],
        },
        {
          orden: 4,
          titulo: "Reutilizar",
          videos: [
            v("BAK-M30.070", "Modelos: armar plantillas de venta reutilizables", "3:20"),
          ],
        },
      ],
    },
    {
      id: 40,
      codigo: "BAK-M40",
      titulo: "Cobranzas / Recibos",
      resumen: "Emitir el recibo, registrar los valores y leer la cuenta corriente.",
      descripcion:
        "Cómo se cobra: los modos de recibo, los tipos de valor, el tratamiento de la moneda y la consecuencia de todo eso sobre la cuenta corriente del cliente.",
      planes: TODOS,
      estado: "bloqueado",
      secciones: [
        {
          orden: 1,
          titulo: "Emitir el recibo",
          videos: [
            v("BAK-M40.010", "Recibo: modos indicado, automático y detallado", "4:05"),
            v("BAK-M40.020", "Valores: efectivo, transferencia, tarjeta y de tercero (TR3/TC3)", "4:35"),
          ],
        },
        {
          orden: 2,
          titulo: "Moneda en la cobranza",
          videos: [
            v("BAK-M40.030", "Moneda y tipo de cambio en el recibo", "3:50"),
          ],
        },
        {
          /* Rompe el orden de ID a propósito: la cuenta corriente encuadra la
             devolución, así que va primero aunque su ID sea mayor. */
          orden: 3,
          titulo: "Cuenta corriente y devoluciones",
          videos: [
            v("BAK-M40.050", "Cuenta corriente del cliente y saldos por moneda", "4:10"),
            v("BAK-M40.040", "Devolución y egreso", "3:00"),
          ],
        },
      ],
    },
    {
      id: 50,
      codigo: "BAK-M50",
      titulo: "Facturación",
      resumen: "Emitir la factura, controlar antes de emitir y resolver los ajustes.",
      descripcion:
        "Facturar al pasajero: por servicio o por producto, con la categoría de IVA que corresponda. Incluye el control previo sobre el voucher y los casos que se resuelven después: notas de crédito, facturas parciales y tipo de cambio ponderado.",
      planes: TODOS,
      estado: "bloqueado",
      secciones: [
        {
          orden: 1,
          titulo: "Emitir la factura",
          videos: [
            v("BAK-M50.010", "Factura al pasajero: por servicio vs. por producto", "4:15"),
            v("BAK-M50.020", "Categoría de IVA y factura A/B: ARCA y CAE", "4:40"),
          ],
        },
        {
          orden: 2,
          titulo: "Controlar antes de facturar",
          videos: [
            v("BAK-M50.030", "Verificar el voucher antes de facturar: prestador vs. proveedor", "3:35"),
          ],
        },
        {
          orden: 3,
          titulo: "Ajustes y casos especiales",
          videos: [
            v("BAK-M50.040", "Notas de crédito", "3:25"),
            v("BAK-M50.050", "Factura parcial: dividir entre pasajeros", "3:55"),
            v("BAK-M50.060", "Tipo de cambio promedio ponderado", "4:20"),
          ],
        },
      ],
    },
    {
      id: 60,
      codigo: "BAK-M60",
      titulo: "Pagos a proveedores",
      resumen: "Ordenar el pago, vincular la factura de compra y ajustar saldos.",
      descripcion:
        "La otra punta del circuito: cómo se ordena un pago a proveedor, cómo se vincula con la factura de compra, y cómo se leen y se corrigen los saldos de su cuenta corriente.",
      planes: TODOS,
      estado: "bloqueado",
      secciones: [
        {
          orden: 1,
          titulo: "Ordenar el pago",
          videos: [
            v("BAK-M60.010", "Orden de pago: automática, dividida y manual", "4:10"),
            v("BAK-M60.020", "Vincular la factura de compra y el importador ARCA", "4:00"),
          ],
        },
        {
          orden: 2,
          titulo: "Ajustes y cuenta corriente",
          videos: [
            v("BAK-M60.030", "Saldo a favor, anular y reabrir", "3:20"),
            v("BAK-M60.040", "Cuenta corriente del proveedor", "3:45"),
          ],
        },
      ],
    },
    {
      id: 70,
      codigo: "BAK-M70",
      titulo: "Caja y bancos",
      resumen: "Configurar y operar la caja, registrar movimientos y conciliar bancos.",
      descripcion:
        "Dónde entra y sale el dinero: la estructura de cajas, la apertura y el cierre, los movimientos con su centro de costo, y el circuito bancario con el scan de comprobantes.",
      planes: TODOS,
      estado: "bloqueado",
      secciones: [
        {
          /* Rompe el orden de ID: la estructura de la caja y su operación diaria
             son el mismo concepto, aunque el ID de apertura/cierre sea mayor. */
          orden: 1,
          titulo: "Configurar y operar la caja",
          videos: [
            v("BAK-M70.010", "Caja única vs. caja por vendedor o cajero", "3:30"),
            v("BAK-M70.030", "Apertura y cierre de caja", "3:05"),
          ],
        },
        {
          orden: 2,
          titulo: "Movimientos y asientos",
          videos: [
            v("BAK-M70.020", "Asientos automáticos y manuales, egresos y centro de costo", "4:45"),
          ],
        },
        {
          orden: 3,
          titulo: "Bancos y comprobantes",
          videos: [
            v("BAK-M70.040", "Bancos, transferencias y scan de comprobantes con IA", "4:15"),
          ],
        },
      ],
    },
    {
      id: 80,
      codigo: "BAK-M80",
      titulo: "Informes",
      resumen: "Los informes de uso diario y la mirada de gestión sobre el negocio.",
      descripcion:
        "Qué informe usar para cada pregunta: los operativos, que se miran todos los días, y los de administración y gestión, que se miran para decidir.",
      planes: TODOS,
      estado: "bloqueado",
      secciones: [
        {
          orden: 1,
          titulo: "Informes operativos",
          videos: [
            v("BAK-M80.010", "Informes operativos: saldos, listados y comisiones", "4:00"),
            v("BAK-M80.020", "Informe de vencimientos: cobranzas y pagos", "3:40"),
          ],
        },
        {
          /* Rompe el orden de ID, y además contiene el único video con plan
             propio: el dashboard de KPIs es Business, dentro de un módulo que
             aplica a los dos planes. */
          orden: 2,
          titulo: "Administración y KPIs",
          videos: [
            v("BAK-M80.040", "Informes administrativos: ingresos y egresos", "3:50"),
            v("BAK-M80.030", "Dashboard: KPIs del negocio", "4:25", 0, false, [BUS]),
          ],
        },
      ],
    },
    {
      id: 90,
      codigo: "BAK-M90",
      titulo: "Contable",
      resumen: "Plan de cuentas, libros, balances y cierre de ejercicio.",
      descripcion:
        "El circuito contable completo: cómo se configura el plan de cuentas y los asientos automáticos, qué libros y balances salen del sistema, y cómo se cierra un ejercicio.",
      planes: [BUS],
      estado: "bloqueado",
      secciones: [
        {
          orden: 1,
          titulo: "Configuración contable",
          videos: [
            v("BAK-M90.010", "Plan de cuentas: para qué sirve", "4:05"),
            v("BAK-M90.020", "Asientos automáticos: cómo se configuran", "4:30"),
          ],
        },
        {
          orden: 2,
          titulo: "Libros y balances",
          videos: [
            v("BAK-M90.030", "Libro diario, libro banco y mayor", "4:20"),
            v("BAK-M90.040", "Balance de suma y saldo", "3:55"),
          ],
        },
        {
          orden: 3,
          titulo: "Cierres",
          videos: [
            v("BAK-M90.050", "Ejercicios contables y cierres", "4:10"),
          ],
        },
      ],
    },
    {
      id: 95,
      codigo: "BAK-M95",
      titulo: "Receptivo operador",
      resumen: "Tarifario, itinerarios y el impositivo propio del receptivo.",
      descripcion:
        "El circuito del operador receptivo: el tarifario como base de todo, el armado del itinerario y los modelos multidestino, y el tratamiento impositivo según el prestador sea nacional o internacional.",
      planes: [BUS],
      /* B-nicho del mapa: no es un plan aparte, es Business que además opera
         receptivo. Se marca para poder nombrarlo distinto en el aviso. */
      nicho: true,
      estado: "bloqueado",
      secciones: [
        {
          orden: 1,
          titulo: "El tarifario",
          videos: [
            v("BAK-M95.010", "Tarifario por proveedor: tipo, categoría, vigencia y temporada", "4:45"),
          ],
        },
        {
          orden: 2,
          titulo: "Armar el producto",
          videos: [
            v("BAK-M95.020", "Armar el itinerario con el tarifario", "4:15"),
            v("BAK-M95.030", "Modelos multidestino: paquetes", "4:00"),
          ],
        },
        {
          orden: 3,
          titulo: "Impositivo del receptivo",
          videos: [
            v("BAK-M95.040", "Prestador nacional vs. internacional e impacto impositivo", "3:50"),
          ],
        },
      ],
    },
  ];

  /* -- Bancos de preguntas ---------------------------------------------------
     Uno por módulo, nunca global. `subtema` es SIEMPRE el nombre de una sección
     de ese mismo módulo: alinear las dos taxonomías es lo que después permite
     garantizar cobertura por sección en el sorteo y sugerir los videos de la
     sección fallada.

     En producción son 50 por módulo y el backend sortea 10. Acá alcanza con 12
     para que dos intentos seguidos traigan sets distintos. */
  const bancos = {
    0: [
      {
        subtema: "La lógica del sistema",
        texto: "¿Qué rol cumple SIGMMA dentro de la operación de una agencia?",
        opciones: [
          "Es una herramienta de facturación que se usa solo al cierre del mes.",
          "Es el sistema donde se registra y administra toda la operación de la agencia.",
          "Es un canal de venta al público que reemplaza la web de la agencia.",
          "Es un repositorio de tarifas para consultar antes de cotizar.",
        ],
        correcta: 1,
      },
      {
        subtema: "La lógica del sistema",
        texto: "En el ciclo 360° de la operación turística, ¿qué tres caras se articulan?",
        opciones: [
          "Vendedor, cajero y contador.",
          "Agencia, banco y organismo fiscal.",
          "Cliente, prestador y utilidad.",
          "Cotización, reserva y voucher.",
        ],
        correcta: 2,
      },
      {
        subtema: "La lógica del sistema",
        texto: "¿Qué quiere decir que los procesos del sistema estén atomizados?",
        opciones: [
          "Que cada paso se registra como una unidad propia y trazable.",
          "Que todos los pasos se ejecutan juntos en una sola pantalla.",
          "Que el sistema se divide en instalaciones separadas por sucursal.",
          "Que cada usuario define su propio circuito de trabajo.",
        ],
        correcta: 0,
      },
      {
        subtema: "La lógica del sistema",
        texto:
          "¿Por qué conviene registrar cada movimiento en el sistema y no resolverlo por fuera?",
        opciones: [
          "Porque el sistema no permite cargar movimientos con fecha anterior.",
          "Porque de lo contrario se pierde el descuento del proveedor.",
          "Porque la trazabilidad y los saldos dependen de que todo movimiento quede registrado.",
          "Porque es un requisito para poder acceder a la Academia.",
        ],
        correcta: 2,
      },
      {
        subtema: "La lógica del sistema",
        texto: "¿Cuál de estas afirmaciones describe mejor la relación entre las tres caras del ciclo?",
        opciones: [
          "Son circuitos independientes que no se cruzan entre sí.",
          "La utilidad es la consecuencia de lo que se le cobra al cliente y de lo que se le paga al prestador.",
          "El prestador y el cliente son siempre la misma entidad.",
          "La utilidad se define antes de cargar el cliente.",
        ],
        correcta: 1,
      },
      {
        subtema: "La lógica del sistema",
        texto: "¿Qué implica pensar la operación como un ciclo y no como tareas sueltas?",
        opciones: [
          "Que cada paso condiciona al siguiente y deja rastro en el que viene después.",
          "Que hay que completar todos los pasos el mismo día.",
          "Que el orden de los pasos lo elige cada agencia libremente.",
          "Que un paso mal cargado no afecta a los demás.",
        ],
        correcta: 0,
      },
      {
        subtema: "La lógica del sistema",
        texto: "¿Para qué sirve conocer los principios del sistema antes de operarlo?",
        opciones: [
          "Para poder configurar los permisos de los usuarios.",
          "Para saber de memoria en qué menú está cada botón.",
          "Para entender por qué el sistema pide cada dato y no solo dónde se carga.",
          "Para poder saltear los pasos que no apliquen a la agencia.",
        ],
        correcta: 2,
      },
      {
        subtema: "La lógica del sistema",
        texto: "¿Qué se gana cuando cada tarea queda registrada como un paso propio?",
        opciones: [
          "Se puede saber quién hizo qué y cuándo, sin reconstruirlo de memoria.",
          "Se reduce la cantidad de datos que hay que cargar.",
          "Se pueden eliminar movimientos sin dejar rastro.",
          "Se acelera el cierre contable sin necesidad de revisarlo.",
        ],
        correcta: 0,
      },
      {
        subtema: "Moverse por SIGMMA",
        texto: "¿Qué ofrece el acceso al último file desde la pantalla principal?",
        opciones: [
          "Un listado de todos los files de la agencia ordenado por fecha.",
          "Un atajo para retomar el file en el que se estaba trabajando.",
          "Un informe de los files cerrados en el mes.",
          "Una copia del último file creado, para reutilizarlo.",
        ],
        correcta: 1,
      },
      {
        subtema: "Moverse por SIGMMA",
        texto: "¿Qué comunica la rueda de progreso?",
        opciones: [
          "El porcentaje de la capacitación de la Academia que ya se completó.",
          "El tiempo restante hasta el cierre del período.",
          "El avance de la operación sobre los pasos que le faltan.",
          "La cantidad de usuarios conectados al sistema.",
        ],
        correcta: 2,
      },
      {
        subtema: "Moverse por SIGMMA",
        texto: "¿Cuál es la vía de ingreso al sistema?",
        opciones: [
          "Las credenciales de sigmma.net.",
          "Un código que envía soporte cada mañana.",
          "Un acceso local por equipo, sin usuario.",
          "Las credenciales del organismo fiscal.",
        ],
        correcta: 0,
      },
      {
        subtema: "Moverse por SIGMMA",
        texto: "¿Por qué conviene reconocer la estructura del menú antes de empezar a operar?",
        opciones: [
          "Porque el menú cambia de orden según el día de la semana.",
          "Porque cada agencia tiene que armar su propio menú.",
          "Porque el menú refleja el circuito de la operación, no una lista alfabética.",
          "Porque el menú se oculta después del primer ingreso.",
        ],
        correcta: 2,
      },
    ],
    10: [
      {
        subtema: "Encontrar y crear un file",
        texto: "¿Cuáles son las vías para localizar un file existente?",
        opciones: [
          "Únicamente el número de file.",
          "El número, los filtros de búsqueda y el nombre.",
          "Solo el nombre del pasajero titular.",
          "Solo la fecha de creación.",
        ],
        correcta: 1,
      },
      {
        subtema: "Encontrar y crear un file",
        texto: "Al crear un file, ¿qué definición condiciona cómo se va a operar después?",
        opciones: [
          "El tipo de servicio y si es individual o grupal.",
          "El color de la etiqueta del file.",
          "El vendedor que lo abre.",
          "La cantidad de vouchers que va a tener.",
        ],
        correcta: 0,
      },
      {
        subtema: "Encontrar y crear un file",
        texto: "¿Qué diferencia hay entre un file individual y uno grupal?",
        opciones: [
          "El grupal no admite facturación.",
          "El individual no permite cargar más de un servicio.",
          "El grupal agrupa una salida con varios files vinculados.",
          "No hay diferencia funcional, solo de nombre.",
        ],
        correcta: 2,
      },
      {
        subtema: "Configurar el file",
        texto: "¿Qué distingue la moneda de registro de la moneda de documento?",
        opciones: [
          "La de registro es la del sistema y la de documento es la del comprobante que se emite.",
          "Son sinónimos: el sistema usa una sola moneda por file.",
          "La de registro se define al cerrar el file.",
          "La de documento solo aplica a los files grupales.",
        ],
        correcta: 0,
      },
      {
        subtema: "Configurar el file",
        texto: "¿Por qué la definición de moneda del file no es un dato menor?",
        opciones: [
          "Porque determina el idioma de los comprobantes.",
          "Porque arrastra al resto del circuito: valorización, cobranza y facturación.",
          "Porque define quién puede ver el file.",
          "Porque condiciona la cantidad de pasajeros admitidos.",
        ],
        correcta: 1,
      },
      {
        subtema: "Configurar el file",
        texto: "¿Para qué sirve el destino IATA en los datos del file?",
        opciones: [
          "Para calcular automáticamente la comisión del vendedor.",
          "Para autorizar la emisión del voucher.",
          "Para identificar el destino de forma normalizada y poder segmentar después.",
          "Para determinar la moneda de registro.",
        ],
        correcta: 2,
      },
      {
        subtema: "Configurar el file",
        texto: "Sobre los estados del file, ¿qué afirmación es correcta?",
        opciones: [
          "Hay estados que el sistema resuelve solo y otros que se definen a mano.",
          "Todos los estados se cargan manualmente.",
          "El estado del file lo define el proveedor.",
          "Un file no cambia de estado una vez creado.",
        ],
        correcta: 0,
      },
      {
        subtema: "Configurar el file",
        texto: "¿Qué implica cerrar un file?",
        opciones: [
          "Que se elimina del sistema junto con sus movimientos.",
          "Que se da por terminada su operación y deja de admitir movimientos nuevos.",
          "Que se archiva y no se puede volver a consultar.",
          "Que se transfiere al circuito contable de forma automática.",
        ],
        correcta: 1,
      },
      {
        subtema: "Configurar el file",
        texto: "¿Para qué se usa la segmentación en los datos del file?",
        opciones: [
          "Para dividir el cobro entre pasajeros.",
          "Para separar el file en varios files independientes.",
          "Para clasificar la operación y poder analizarla después en los informes.",
          "Para asignar el file a una caja distinta.",
        ],
        correcta: 2,
      },
      {
        subtema: "Files grupales",
        texto: "En una salida grupal, ¿qué relación se establece entre los files?",
        opciones: [
          "Se vinculan al file de la salida, que los agrupa.",
          "Se fusionan en un único file y los demás se dan de baja.",
          "Se replican con el mismo número de file.",
          "Quedan sueltos: el grupo se controla por fuera del sistema.",
        ],
        correcta: 0,
      },
      {
        subtema: "Files grupales",
        texto: "¿Qué información consolida el informe de salida?",
        opciones: [
          "El estado de las cajas de la agencia.",
          "El detalle de la salida grupal con los files que la componen.",
          "El listado de proveedores con saldo pendiente.",
          "Las comisiones de los vendedores del mes.",
        ],
        correcta: 1,
      },
      {
        subtema: "Files grupales",
        texto: "¿Cuándo conviene trabajar con un file grupal en lugar de files sueltos?",
        opciones: [
          "Cuando la operación se paga en más de una moneda.",
          "Cuando el file lleva más de un voucher.",
          "Cuando varios pasajeros comparten una misma salida y hay que verla como conjunto.",
          "Cuando la venta la hace más de un vendedor.",
        ],
        correcta: 2,
      },
    ],
    20: [
      {
        subtema: "Clientes",
        texto: "Al cargar un cliente, ¿qué determina la distinción entre físico y jurídico?",
        opciones: [
          "El monto de la operación.",
          "Si es una persona o una empresa, con los datos fiscales que corresponden a cada caso.",
          "Si viaja o no viaja.",
          "Si paga en efectivo o con transferencia.",
        ],
        correcta: 1,
      },
      {
        subtema: "Clientes",
        texto: "¿Qué aporta el autocompletado por CUIT al dar de alta un cliente?",
        opciones: [
          "Trae los datos fiscales ya normalizados y evita cargarlos a mano.",
          "Asigna automáticamente el vendedor responsable.",
          "Define la moneda de la operación.",
          "Habilita la cuenta corriente sin necesidad de aprobación.",
        ],
        correcta: 0,
      },
      {
        subtema: "Clientes",
        texto: "¿Qué se resuelve en las solapas de la ficha del cliente?",
        opciones: [
          "El estado de los vouchers asociados.",
          "El cierre de su cuenta corriente.",
          "Documentación, tarjetas, clasificación y adjuntos del cliente.",
          "La emisión de su factura.",
        ],
        correcta: 2,
      },
      {
        subtema: "Clientes",
        texto: "¿Para qué sirve clasificar a un cliente?",
        opciones: [
          "Para bloquearle la posibilidad de operar en cuenta corriente.",
          "Para agruparlo según criterios de la agencia y poder analizarlo después.",
          "Para asignarle un número de file fijo.",
          "Para definir en qué caja se registran sus cobros.",
        ],
        correcta: 1,
      },
      {
        subtema: "Cliente vs. pasajero",
        texto: "¿Cuál es la diferencia entre cliente y pasajero?",
        opciones: [
          "Son la misma entidad con dos nombres según la pantalla.",
          "El cliente es quien viaja y el pasajero es quien paga.",
          "El cliente es quien contrata y el pasajero es quien viaja; pueden coincidir o no.",
          "El pasajero solo existe en los files grupales.",
        ],
        correcta: 2,
      },
      {
        subtema: "Cliente vs. pasajero",
        texto: "Una empresa contrata un viaje para dos de sus empleados. ¿Cómo se registra?",
        opciones: [
          "La empresa como cliente y cada empleado como pasajero.",
          "Cada empleado como cliente, porque son los que viajan.",
          "La empresa como pasajero y los empleados como clientes.",
          "Se abre un file por empleado, sin registrar a la empresa.",
        ],
        correcta: 0,
      },
      {
        subtema: "Cliente vs. pasajero",
        texto: "¿Qué identifica al pax principal dentro de un file?",
        opciones: [
          "Es el pasajero de mayor edad del grupo.",
          "Es el pasajero de referencia de la operación.",
          "Es el pasajero que paga la operación.",
          "Es el primer pasajero que se carga, sin otro efecto.",
        ],
        correcta: 1,
      },
      {
        subtema: "Cliente vs. pasajero",
        texto: "¿Qué permite agregar un pasajero a la base de clientes?",
        opciones: [
          "Convertirlo automáticamente en cliente jurídico.",
          "Habilitarle una cuenta corriente propia de forma automática.",
          "Reutilizar sus datos como cliente en operaciones siguientes.",
          "Facturarle sin necesidad de categoría de IVA.",
        ],
        correcta: 2,
      },
      {
        subtema: "Proveedores y carga masiva",
        texto: "¿Qué distingue a un proveedor turístico de uno no turístico?",
        opciones: [
          "El proveedor turístico presta el servicio que se vende; el no turístico cubre gastos de la agencia.",
          "El no turístico no admite orden de pago.",
          "El turístico se carga como cliente y el no turístico como proveedor.",
          "La diferencia es solo de clasificación, sin efecto en el circuito.",
        ],
        correcta: 0,
      },
      {
        subtema: "Proveedores y carga masiva",
        texto: "¿En qué momento resulta más útil la importación desde Excel?",
        opciones: [
          "En el cierre contable de cada período.",
          "En la migración inicial, para no cargar la base a mano.",
          "Cada vez que se emite un voucher.",
          "Al generar el informe de vencimientos.",
        ],
        correcta: 1,
      },
      {
        subtema: "Proveedores y carga masiva",
        texto: "¿Qué entidades se pueden cargar de forma masiva?",
        opciones: [
          "Solo los clientes.",
          "Solo los proveedores.",
          "Clientes y proveedores.",
          "Clientes, proveedores y vouchers.",
        ],
        correcta: 2,
      },
      {
        subtema: "Proveedores y carga masiva",
        texto: "¿Por qué conviene revisar la base antes de importarla?",
        opciones: [
          "Porque el sistema no admite correcciones posteriores.",
          "Porque la importación bloquea la carga manual durante 24 horas.",
          "Porque un dato mal cargado se replica en todas las operaciones que usen esa entidad.",
          "Porque solo se puede importar una vez por agencia.",
        ],
        correcta: 2,
      },
    ],
    30: [
      {
        subtema: "Qué es y cómo se carga",
        texto: "¿Qué representa el voucher dentro del file?",
        opciones: [
          "El comprobante de cobro al cliente.",
          "El servicio vendido, con su cara operativa y su cara administrativa.",
          "La factura del proveedor.",
          "El resumen de la cuenta corriente del cliente.",
        ],
        correcta: 1,
      },
      {
        subtema: "Qué es y cómo se carga",
        texto: "¿A qué se refiere el perfil operativo del voucher?",
        opciones: [
          "Al detalle del servicio: qué se presta, cuándo y a quién.",
          "Al margen y los impuestos del servicio.",
          "Al estado de la cuenta del proveedor.",
          "Al comprobante que se le entrega al pasajero.",
        ],
        correcta: 0,
      },
      {
        subtema: "Qué es y cómo se carga",
        texto: "Al cargar un voucher, ¿qué define el tipo y el subtipo?",
        opciones: [
          "La moneda en la que se va a cobrar.",
          "El vendedor que percibe la comisión.",
          "La naturaleza del servicio que se está vendiendo.",
          "El estado inicial del file.",
        ],
        correcta: 2,
      },
      {
        subtema: "Los números del voucher",
        texto: "¿Qué diferencia hay entre comisión y utilidad?",
        opciones: [
          "La comisión es lo que reconoce el proveedor; la utilidad es el resultado del servicio para la agencia.",
          "Son sinónimos, cambia el nombre según el tipo de voucher.",
          "La comisión la define la agencia y la utilidad el pasajero.",
          "La utilidad solo existe en los servicios exentos.",
        ],
        correcta: 0,
      },
      {
        subtema: "Los números del voucher",
        texto: "¿Por qué hay que separar el aéreo del terrestre en los conceptos impositivos?",
        opciones: [
          "Porque se cargan en files distintos.",
          "Porque no reciben el mismo tratamiento frente al IVA.",
          "Porque el aéreo no admite comisión.",
          "Porque el terrestre no se puede facturar.",
        ],
        correcta: 1,
      },
      {
        subtema: "Los números del voucher",
        texto: "¿Qué consecuencia tiene cargar mal los conceptos impositivos de un voucher?",
        opciones: [
          "Ninguna: se corrige al facturar.",
          "El voucher no se puede procesar.",
          "Se arrastra el error a la facturación y al resultado del servicio.",
          "El sistema recalcula los impuestos automáticamente al cerrar el file.",
        ],
        correcta: 2,
      },
      {
        subtema: "Los números del voucher",
        texto: "¿Sobre qué se calcula el margen de un servicio?",
        opciones: [
          "Sobre lo que se le cobra al cliente y lo que se le paga al prestador.",
          "Sobre el total facturado en el período.",
          "Sobre el saldo de la cuenta corriente del cliente.",
          "Sobre la comisión del vendedor.",
        ],
        correcta: 0,
      },
      {
        subtema: "Procesar e impactar",
        texto: "¿Qué produce el procesamiento de un voucher?",
        opciones: [
          "La emisión de la factura al pasajero.",
          "El impacto del servicio en la cuenta del proveedor.",
          "El cierre del file.",
          "La generación del recibo de cobro.",
        ],
        correcta: 1,
      },
      {
        subtema: "Procesar e impactar",
        texto: "¿Por qué es el paso que más se olvida?",
        opciones: [
          "Porque el sistema lo pide recién al cierre del período.",
          "Porque lo tiene que hacer el proveedor.",
          "Porque el voucher ya se ve cargado y completo, aunque todavía no impactó.",
          "Porque solo aplica a los servicios en moneda extranjera.",
        ],
        correcta: 2,
      },
      {
        subtema: "Procesar e impactar",
        texto: "¿Qué informa el estado de un voucher?",
        opciones: [
          "En qué punto del circuito está el servicio.",
          "Cuánto se le cobró al cliente.",
          "Qué vendedor lo cargó.",
          "Si el pasajero confirmó su asistencia.",
        ],
        correcta: 0,
      },
      {
        subtema: "Reutilizar",
        texto: "¿Para qué sirven los modelos de venta?",
        opciones: [
          "Para archivar los vouchers de files cerrados.",
          "Para armar plantillas reutilizables de servicios que se venden seguido.",
          "Para exportar los vouchers a Excel.",
          "Para agrupar vouchers de distintos files en una factura.",
        ],
        correcta: 1,
      },
      {
        subtema: "Reutilizar",
        texto: "¿Qué se gana al trabajar con modelos?",
        opciones: [
          "Se puede facturar sin procesar el voucher.",
          "Se elimina la necesidad de cargar el proveedor.",
          "Se reduce el tiempo de carga y la posibilidad de error en ventas repetidas.",
          "Se obtiene una comisión diferencial del proveedor.",
        ],
        correcta: 2,
      },
    ],
  };

  /* -- Banco estructural (relleno de prototipo) ------------------------------
     Los módulos M40 a M95 todavía no tienen banco escrito: son 50 preguntas por
     módulo de trabajo de contenido, no de código. Para que la evaluación se
     pueda recorrer igual, se genera un banco sobre la ESTRUCTURA del módulo —a
     qué sección pertenece cada video, qué videos componen cada sección—. No
     afirma nada sobre el comportamiento del producto, que es justamente lo que
     no se puede inventar. `bancoEstructural` queda marcado en el módulo para
     que la antesala lo pueda avisar. */
  function bancoEstructural(m) {
    const secciones = m.secciones;
    const nombres = secciones.map(function (s) { return s.titulo; });
    /* Solo los videos que el plan de la usuaria habilita: preguntar por uno que
       no ve en la lista sería una pregunta sin respuesta posible. */
    function visibles(s) {
      return s.videos.filter(function (vi) {
        return !vi.planes || vi.planes.indexOf(usuario.perfil) !== -1;
      });
    }
    const pares = secciones.reduce(function (acc, s) {
      return acc.concat(visibles(s).map(function (vi) { return { v: vi, s: s }; }));
    }, []);
    /* Secciones de OTROS módulos, para los distractores de la última forma. */
    const ajenas = modulos
      .filter(function (o) { return o.id !== m.id; })
      .reduce(function (acc, o) {
        return acc.concat(o.secciones.map(function (s) { return s.titulo; }));
      }, []);

    const preguntas = [];

    /* Forma A — video → sección. La correcta rota de posición para que no se
       pueda acertar por costumbre. */
    pares.forEach(function (par) {
      preguntas.push({
        subtema: par.s.titulo,
        texto: "¿A qué parte del módulo corresponde «" + par.v.titulo + "»?",
        opciones: nombres.slice(),
        correcta: nombres.indexOf(par.s.titulo),
      });
    });

    /* Forma B — sección → video. Una sección con más de un video genera más de
       una pregunta de esta forma, así que el enunciado alterna: dos preguntas
       con el mismo texto y distinta respuesta se leen como un error. */
    const ENUNCIADOS = [
      "¿Cuál de estos videos forma parte de «{s}»?",
      "Entre estos videos, ¿cuál corresponde a «{s}»?",
    ];
    pares.forEach(function (par, i) {
      const otros = pares
        .filter(function (o) { return o.s !== par.s; })
        .map(function (o) { return o.v.titulo; })
        .slice(0, 3);
      const opciones = otros.slice();
      const donde = i % (otros.length + 1);
      opciones.splice(donde, 0, par.v.titulo);
      preguntas.push({
        subtema: par.s.titulo,
        texto: ENUNCIADOS[i % ENUNCIADOS.length].replace("{s}", par.s.titulo),
        opciones: opciones,
        correcta: donde,
      });
    });

    /* Forma C — cuántos videos tiene la sección. */
    secciones.forEach(function (s) {
      preguntas.push({
        subtema: s.titulo,
        texto: "¿Cuántos videos tiene la sección «" + s.titulo + "»?",
        opciones: ["1", "2", "3", "4"],
        correcta: visibles(s).length - 1,
      });
    });

    /* Forma D — qué sección agrupa dos videos. Solo para secciones con más de
       un video visible; nombra los videos, así que es única por sección. */
    secciones.forEach(function (s) {
      const vs = visibles(s);
      if (vs.length < 2) return;
      preguntas.push({
        subtema: s.titulo,
        texto:
          "¿Qué sección del módulo agrupa «" + vs[0].titulo + "» y «" + vs[1].titulo + "»?",
        opciones: nombres.slice(),
        correcta: nombres.indexOf(s.titulo),
      });
    });

    /* Forma E — orden de la sección. */
    const ORDINALES = ["Primera", "Segunda", "Tercera", "Cuarta"];
    secciones.forEach(function (s, i) {
      preguntas.push({
        subtema: s.titulo,
        texto:
          "Dentro del recorrido del módulo, ¿en qué lugar va la sección «" + s.titulo + "»?",
        opciones: ORDINALES.slice(0, secciones.length),
        correcta: i,
      });
    });

    /* Forma F — una sola por módulo: distinguir una sección propia de las de
       otros módulos. */
    const propias = ajenas.slice(0, 3);
    const opcionesF = propias.slice();
    opcionesF.splice(1, 0, secciones[0].titulo);
    preguntas.push({
      subtema: secciones[0].titulo,
      texto: "¿Cuál de estas secciones es parte del módulo «" + m.titulo + "»?",
      opciones: opcionesF,
      correcta: 1,
    });

    /* Dedupe por enunciado: dos preguntas con el mismo texto y distinta
       respuesta correcta se leen como un error del banco, no como variedad. */
    const vistos = {};
    return preguntas
      .filter(function (q) {
        if (vistos[q.texto]) return false;
        vistos[q.texto] = true;
        return true;
      })
      .slice(0, 12);
  }

  /* IDs de pregunta estables por módulo: el intento guardado en localStorage
     referencia preguntas por id, así que no pueden depender del orden de render. */
  modulos.forEach(function (m) {
    if (!bancos[m.id]) {
      bancos[m.id] = bancoEstructural(m);
      m.bancoEstructural = true;
    }
    bancos[m.id].forEach(function (q, i) {
      q.id = m.codigo + ".q" + String(i + 1).padStart(2, "0");
      q.moduloId = m.id;
    });
  });

  /* Vista agregada de la agencia. Solo métricas de capacitación: sin datos
     personales sensibles ni respuestas individuales de las evaluaciones. */
  /* `ultimaAprobacion` es el timestamp del módulo aprobado más reciente y es el
     desempate del ranking: entre dos personas con la misma cantidad de módulos,
     va primero la que llegó antes a ese número. Paula y Lucía empatan en 2 a
     propósito, para que el desempate se pueda ver en el prototipo. */
  const empleados = [
    /* Los datos de la usuaria logueada se recalculan abajo desde `modulos`,
       para que las tres pantallas nunca muestren números distintos. */
    {
      id: 1,
      nombre: "Lucía Fernández",
      esVos: true,
      aprobados: 0,
      ultimaAprobacion: null,
      ultimoAccesoISO: isoHoy() + "T10:12:00",
    },
    {
      id: 2,
      nombre: "Martín Ruiz",
      aprobados: 9,
      certificado: true,
      ultimaAprobacion: "2026-07-28T09:41:22",
      ultimoAccesoISO: "2026-07-28T17:03:41",
    },
    {
      id: 3,
      nombre: "Carla Domínguez",
      aprobados: 5,
      ultimaAprobacion: "2026-07-21T15:08:47",
      ultimoAccesoISO: "2026-07-30T11:26:19",
    },
    {
      id: 4,
      nombre: "Diego Sosa",
      aprobados: 3,
      ultimaAprobacion: "2026-07-14T10:33:04",
      ultimoAccesoISO: "2026-07-25T09:12:58",
    },
    {
      id: 5,
      nombre: "Paula Iglesias",
      aprobados: 2,
      ultimaAprobacion: "2026-06-05T18:52:09",
      ultimoAccesoISO: "2026-07-19T14:47:33",
    },
    {
      id: 6,
      nombre: "Nicolás Vera",
      aprobados: 0,
      ultimaAprobacion: null,
      ultimoAccesoISO: null,
    },
  ];

  /* -- Aprobaciones que persisten --------------------------------------------
     El prototipo no tiene backend, pero el desbloqueo secuencial no se puede
     demostrar si aprobar un módulo se olvida al navegar. Se guardan en
     localStorage los módulos que la usuaria aprueba durante el recorrido, y se
     aplican sobre el mock al arrancar. `?reset=1` en cualquier página vuelve
     todo al estado inicial, para arrancar una demo limpia. */
  const CLAVE_APROBADOS = "academia:aprobados";

  function leerAprobados() {
    try {
      const crudo = window.localStorage.getItem(CLAVE_APROBADOS);
      const lista = crudo ? JSON.parse(crudo) : [];
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  }

  function escribirAprobados(lista) {
    try {
      window.localStorage.setItem(CLAVE_APROBADOS, JSON.stringify(lista));
    } catch (e) {
      /* Modo privado sin storage: el avance vive solo en esta pantalla. */
    }
  }

  if (/[?&]reset=1(&|$)/.test(window.location.search)) {
    try {
      window.localStorage.removeItem(CLAVE_APROBADOS);
      Object.keys(window.localStorage)
        .filter(function (k) { return k.indexOf("academia:intento:") === 0; })
        .forEach(function (k) { window.localStorage.removeItem(k); });
    } catch (e) {}
  } else {
    leerAprobados().forEach(function (registro) {
      const m = modulos.find(function (x) { return x.id === Number(registro.id); });
      if (!m || m.estado === "aprobado") return;
      m.estado = "aprobado";
      m.nota = registro.nota;
      m.aprobadoEn = registro.aprobadoEn;
    });
  }

  /* Etiquetas legibles derivadas de las ISO. Se hace acá, una sola vez, y no en
     cada vista: el dato de presentación no se carga a mano en ningún lado. */
  modulos.forEach(function (m) {
    m.fechaAprobacion = fechaCorta(m.aprobadoEn);
  });
  empleados.forEach(function (e) {
    e.ultimoAcceso = etiquetaAcceso(e.ultimoAccesoISO);
  });

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

  const API = {
    usuario,
    modulos,
    empleados,
    soporte,
    quizConfig,
    umbralVisto,

    /* -- Recorrido y plan --------------------------------------------------
       El recorrido de la usuaria son los módulos que su plan incluye, en orden.
       Los que no incluye NO se ocultan: se muestran con candado de plan, porque
       son una superficie comercial además de pedagógica. Pero no entran a la
       cadena de desbloqueo ni a ninguna base de cálculo. */
    aplica(id) {
      const m = this.modulo(id);
      return Boolean(m && m.planes.indexOf(usuario.perfil) !== -1);
    },
    recorrido() {
      return modulos.filter(function (m) {
        return m.planes.indexOf(usuario.perfil) !== -1;
      });
    },
    fueraDePlan() {
      return modulos.filter(function (m) {
        return m.planes.indexOf(usuario.perfil) === -1;
      });
    },
    /* El plan que sí habilita el módulo, para poder nombrarlo en el aviso. */
    planDe(id) {
      const m = this.modulo(id);
      return m ? m.planes[0] : null;
    },

    modulo(id) {
      const n = Number(id);
      return modulos.find(function (m) { return m.id === n; }) || null;
    },

    /* Posición en el recorrido, 1..N. Es el único número de módulo que va a
       pantalla: sobrevive al filtro de plan y nunca deja huecos. `null` para un
       módulo fuera de plan, que no tiene lugar en el recorrido. */
    posicion(id) {
      const i = this.recorrido().findIndex(function (m) { return m.id === Number(id); });
      return i === -1 ? null : i + 1;
    },
    rotulo(id) {
      const p = this.posicion(id);
      return p === null ? null : "Módulo " + String(p).padStart(2, "0");
    },

    /* -- Desbloqueo secuencial -------------------------------------------
       Única fuente de verdad de la regla: un módulo se habilita solo si el
       anterior DEL RECORRIDO tiene la evaluación aprobada. El primero siempre
       está abierto. Se resuelve por posición y no por aritmética sobre el id,
       porque los ids van de 10 en 10 y saltan (95 sigue a 90).
       Toda pantalla que muestre o dé acceso a un módulo tiene que pasar por
       acá — si no, el bloqueo se filtra por algún lado. */
    prerequisito(id) {
      const lista = this.recorrido();
      const i = lista.findIndex(function (m) { return m.id === Number(id); });
      return i > 0 ? lista[i - 1] : null;
    },
    siguienteModulo(id) {
      const lista = this.recorrido();
      const i = lista.findIndex(function (m) { return m.id === Number(id); });
      return i !== -1 && i < lista.length - 1 ? lista[i + 1] : null;
    },
    desbloqueado(id) {
      if (!this.aplica(id)) return false;
      const anterior = this.prerequisito(id);
      if (!anterior) return true; // el primero del recorrido
      return anterior.estado === "aprobado";
    },

    /* Por qué no se puede entrar. Las pantallas de bloqueo no dicen lo mismo en
       los dos casos: "aprobá el anterior" no sirve si el módulo no es parte del
       plan de la agencia. */
    motivoBloqueo(id) {
      if (!this.aplica(id)) return "plan";
      return this.desbloqueado(id) ? null : "secuencia";
    },

    /* Dónde tiene que retomar la usuaria: el primer módulo del recorrido que
       todavía no aprobó. Es el único destino siempre accionable, así que es el
       que ofrecen los CTA de las pantallas de bloqueo. */
    moduloActual() {
      const self = this;
      return (
        this.recorrido().find(function (m) {
          return m.estado !== "aprobado" && self.desbloqueado(m.id);
        }) || null
      );
    },

    /* El `estado` del dato es la intención de contenido; este es el estado que
       corresponde mostrar una vez aplicadas las dos reglas. `plan` gana sobre
       todo lo demás. Después manda la secuencia, en las dos direcciones: un
       módulo marcado "disponible" cuyo anterior no está aprobado se muestra
       bloqueado, y uno marcado "bloqueado" cuyo anterior ya se aprobó pasa a
       estar disponible. */
    estadoEfectivo(id) {
      const m = this.modulo(id);
      if (!m) return null;
      if (!this.aplica(id)) return "plan";
      if (m.estado === "aprobado") return "aprobado";
      if (!this.desbloqueado(m.id)) return "bloqueado";
      return m.estado === "bloqueado" ? "disponible" : m.estado;
    },

    /* Se llama al aprobar una evaluación. Deja el módulo aprobado de forma
       persistente, con lo cual el siguiente queda habilitado en todas las
       pantallas. Idempotente: rehacer una evaluación ya aprobada no duplica. */
    registrarAprobacion(id, nota) {
      const m = this.modulo(id);
      if (!m) return;
      const aprobadoEn = new Date().toISOString().slice(0, 19);
      m.estado = "aprobado";
      m.nota = nota;
      m.aprobadoEn = aprobadoEn;
      m.fechaAprobacion = fechaCorta(aprobadoEn);

      const lista = leerAprobados().filter(function (r) {
        return Number(r.id) !== Number(id);
      });
      lista.push({ id: Number(id), nota: nota, aprobadoEn: aprobadoEn });
      escribirAprobados(lista);
    },

    /* -- Progreso ----------------------------------------------------------
       Base de cálculo: los módulos DEL RECORRIDO, no los 11. Con perfil
       Professional el denominador es 9. */
    aprobados() {
      return this.recorrido().filter(function (m) { return m.estado === "aprobado"; }).length;
    },
    total() {
      return this.recorrido().length;
    },
    progresoGeneral() {
      return Math.round((this.aprobados() / this.total()) * 100);
    },

    /* -- Syllabus ----------------------------------------------------------
       Cada módulo tiene el suyo. `videos` y `vistos` no son campos del módulo:
       se derivan de acá, para que no puedan contradecir al syllabus. */
    secciones(moduloId) {
      const m = this.modulo(moduloId);
      if (!m) return [];
      return m.secciones.slice().sort(function (a, b) { return a.orden - b.orden; });
    },
    /* Todos los videos del módulo, incluidos los que el plan no habilita: la
       lista los muestra con su aviso. Para contar, `videosAplicables`. */
    videosDelModulo(moduloId) {
      return this.secciones(moduloId).reduce(function (acc, s) {
        return acc.concat(s.videos);
      }, []);
    },
    videoAplicable(video) {
      return !video.planes || video.planes.indexOf(usuario.perfil) !== -1;
    },
    videosAplicables(moduloId) {
      const self = this;
      return this.videosDelModulo(moduloId).filter(function (vi) {
        return self.videoAplicable(vi);
      });
    },
    vistosDelModulo(moduloId) {
      const m = this.modulo(moduloId);
      if (m && m.estado === "aprobado") return this.videosAplicables(moduloId).length;
      return this.videosAplicables(moduloId).filter(function (vi) { return vi.visto; }).length;
    },
    progresoModulo(moduloId) {
      const total = this.videosAplicables(moduloId).length;
      if (!total) return 0;
      return Math.round((this.vistosDelModulo(moduloId) / total) * 100);
    },
    /* Progreso de una sección: el módulo lo pide por sección y por módulo. */
    progresoSeccion(seccion, aprobado) {
      const self = this;
      const videos = seccion.videos.filter(function (vi) { return self.videoAplicable(vi); });
      const vistos = aprobado
        ? videos.length
        : videos.filter(function (vi) { return vi.visto; }).length;
      return { vistos: vistos, total: videos.length };
    },
    /* Solo los videos que el plan habilita: si sumara los otros, la sección
       diría "1 de 1 vistos · 8 min" contando minutos que la usuaria no puede ver. */
    duracionSeccion(seccion) {
      const self = this;
      const seg = seccion.videos.reduce(function (a, vi) {
        return self.videoAplicable(vi) ? a + vi.segundos : a;
      }, 0);
      return Math.round(seg / 60) + " min";
    },

    video(videoId) {
      let hallado = null;
      modulos.forEach(function (m) {
        m.secciones.forEach(function (s) {
          s.videos.forEach(function (vi) {
            if (vi.id === videoId) hallado = vi;
          });
        });
      });
      return hallado;
    },
    moduloDeVideo(videoId) {
      let hallado = null;
      modulos.forEach(function (m) {
        m.secciones.forEach(function (s) {
          s.videos.forEach(function (vi) {
            if (vi.id === videoId) hallado = m;
          });
        });
      });
      return hallado;
    },
    seccionDe(videoId) {
      let hallada = null;
      modulos.forEach(function (m) {
        m.secciones.forEach(function (s) {
          s.videos.forEach(function (vi) {
            if (vi.id === videoId) hallada = s;
          });
        });
      });
      return hallada;
    },

    /* -- Banco de preguntas ------------------------------------------------ */
    banco(moduloId) {
      return bancos[Number(moduloId)] || [];
    },
    pregunta(preguntaId) {
      let hallada = null;
      Object.keys(bancos).forEach(function (k) {
        bancos[k].forEach(function (q) {
          if (q.id === preguntaId) hallada = q;
        });
      });
      return hallada;
    },

    /* -- Agencia -----------------------------------------------------------
       Opción C del cotejo: el desbloqueo y el avance son POR USUARIO, y la
       agencia se mira agregada. La regla de agregación de este número es
       explícita y hay que nombrarla en pantalla: promedio de módulos aprobados
       por persona sobre los del recorrido del plan. */
    avanceAgencia() {
      const suma = empleados.reduce(function (acc, e) { return acc + e.aprobados; }, 0);
      return Math.round((suma / (empleados.length * this.total())) * 100);
    },

    /* Ranking de la agencia por completitud del recorrido.

       Criterio, en cascada:
         1. módulos aprobados, descendente
         2. `ultimaAprobacion`, ascendente — llegó antes a ese número

       No hay tercer criterio: con precisión de segundos el empate real es
       despreciable, y `Array.prototype.sort` es estable (ES2019), así que si
       ocurriera el orden no cambia entre renders.

       Quien no aprobó ningún módulo queda fuera de la numeración
       (`posicion: null`) y se ordena alfabéticamente al final: no hay nada que
       comparar entre ellos y numerarlos sería solo señalarlos.

       Recibe `lista` opcional porque `agencia.html` arma una lista alternativa
       para `?state=empty`. Devuelve copias: no muta `empleados`. */
    ranking(lista) {
      const base = (lista || empleados).slice();
      const conAvance = base.filter(function (e) { return e.aprobados > 0; });
      const sinAvance = base.filter(function (e) { return e.aprobados === 0; });

      conAvance.sort(function (a, b) {
        if (a.aprobados !== b.aprobados) return b.aprobados - a.aprobados;
        /* Las ISO se comparan como strings: el orden lexicográfico es el
           cronológico. Sin timestamp va al final del empate, no al principio. */
        const ta = a.ultimaAprobacion || "9999";
        const tb = b.ultimaAprobacion || "9999";
        return ta < tb ? -1 : ta > tb ? 1 : 0;
      });
      sinAvance.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, "es"); });

      return conAvance
        .map(function (e, i) { return Object.assign({}, e, { posicion: i + 1 }); })
        .concat(sinAvance.map(function (e) { return Object.assign({}, e, { posicion: null }); }));
    },

    /* -- Formato ----------------------------------------------------------- */
    fechaCorta,
    etiquetaAcceso,
    ordenFecha,
    ordinal,
    isoHoy,
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

  /* Los datos de la usuaria logueada se derivan del recorrido, para que las tres
     pantallas que los muestran nunca den números distintos. */
  const suyos = API.recorrido().filter(function (m) { return m.estado === "aprobado"; });
  empleados[0].aprobados = suyos.length;
  empleados[0].ultimaAprobacion = suyos.reduce(function (ultimo, m) {
    return !ultimo || m.aprobadoEn > ultimo ? m.aprobadoEn : ultimo;
  }, null);

  return API;
})();
