# Prompt de integración — Pedido de Meet por módulo (Academia SIGMMA)

> Pegar este prompt en el agente que trabaja sobre el repositorio del wireframe de alta fidelidad de la Academia.

---

## 0 · Contexto y objetivo

Estás trabajando sobre el repositorio del wireframe de alta fidelidad de la **Academia de Autocapacitación SIGMMA**, una plataforma de aprendizaje asincrónico para agencias de viajes que se integra a sigmma.net vía SSO. El recorrido del usuario-agencia es: módulos → secciones → videos → evaluación del módulo → desbloqueo del módulo siguiente.

Tu tarea es **integrar el flujo de pedido de Meet de soporte por módulo**, respetando el lenguaje visual y las convenciones que ya existen en el repositorio. No estás diseñando un producto nuevo: estás sumando una funcionalidad a un desarrollo en curso, y la consistencia con lo existente tiene prioridad sobre cualquier preferencia propia.

**La lógica del servicio, en una frase:** cuando un usuario aprueba la evaluación de un módulo y le quedó una duda puntual, la deja registrada; las dudas se acumulan en una cola por módulo dentro de la agencia; un usuario designado como **coordinador** agenda una única Meet con Soporte para ese módulo, cuya agenda es esa cola de dudas.

---

## 1 · Antes de escribir una línea de código

No asumas nada sobre el repositorio. Primero relevá y reportá:

1. Stack, framework, versión y estructura de carpetas.
2. Sistema de estilos (tokens, variables, tema, librería de componentes) y cómo se consumen.
3. Inventario de componentes ya existentes que puedas reutilizar: tarjetas, badges de estado, modales, formularios, campos de texto, selects, estados vacíos, banners informativos, listas.
4. Cómo se maneja el estado de la aplicación y de dónde salen los datos hoy (mocks, fixtures, API, store).
5. Cómo están resueltas hoy las pantallas de **detalle de módulo** y de **resultado de evaluación aprobada**, que son los dos puntos donde se engancha esta funcionalidad.
6. Convención de nombres: ¿español o inglés en tipos, props, rutas y archivos?
7. Si existe una capa de internacionalización o los textos están embebidos.

**Reportá este relevamiento antes de implementar** y esperá confirmación si algo de lo que sigue choca con lo que encontraste.

---

## 2 · Alcance — qué SÍ entra en esta tarea

1. **Registro de duda** por parte del usuario que aprobó el módulo, desde dos puntos de entrada: la pantalla de resultado de evaluación aprobada, y la pantalla de detalle del módulo.
2. **Bloque de Meet en el detalle del módulo**, con todos sus estados según el rol del usuario y el estado de la cola y del cupo.
3. **Vista de la cola de dudas del módulo** para el usuario coordinador.
4. **Flujo de agendado**: el coordinador elige un turno entre los disponibles y confirma.
5. **Estado informativo para los usuarios no coordinadores**, que deben entender que la Meet la coordina el coordinador del equipo, sin tener acción disponible.
6. **Todos los estados vacíos y de error** listados en la sección 6.
7. **Datos mockeados** siguiendo la convención que ya use el repositorio, con al menos un escenario por estado para poder navegar todos los casos.

## 3 · Alcance — qué NO entra (no lo implementes, no lo diseñes)

1. **La designación del coordinador.** La define el equipo de backend y llega resuelta. En el frontend es un dato de solo lectura sobre el usuario autenticado. **No construyas ninguna UI para designar, cambiar o transferir el rol.**
2. **La definición de la franja horaria de atención.** Se configura por separado y llega como dato. El frontend solo consume la lista de turnos disponibles que le entreguen.
3. **La creación de la videollamada.** El frontend muestra el turno y, si viene, el enlace. No integra ningún proveedor de videoconferencia.
4. **El cierre de la duda con motivo.** Ocurre en el panel interno de staff SIGMMA, no en la vista de la agencia. Si el repositorio incluye ese panel, dejalo fuera de esta tarea y reportalo como trabajo separado.
5. **Canales alternativos de consulta.** No hay derivación a WhatsApp, mail ni formulario asíncrono en este flujo. No los modeles.
6. **Clasificación de la duda por parte del usuario.** El usuario no elige tipo, prioridad ni canal. Deja la duda y listo.
7. **Validación de las reglas de negocio como fuente de verdad.** Ver sección 5.

---

## 4 · Contrato de datos asumido

Adaptá los nombres a la convención del repositorio, pero conservá la forma. Si el repo ya tiene tipos equivalentes, extendelos en lugar de duplicarlos.

```ts
// Usuario autenticado
{
  id: string
  nombre: string
  agenciaId: string
  esCoordinadorMeet: boolean   // ← llega del backend, solo lectura
}

// Progreso del usuario en un módulo
{
  moduloId: string
  aprobado: boolean
  nota: number | null           // sobre 10
  fechaAprobacion: string | null // ISO 8601
}

// Duda registrada
{
  id: string
  moduloId: string
  usuarioId: string
  usuarioNombre: string
  videoId: string | null        // video de referencia dentro del módulo
  subTema: string | null
  texto: string
  estado: 'en-cola' | 'en-agenda' | 'cerrada'
  fechaCreacion: string         // ISO 8601
}

// Cupo de Meet — uno por módulo por agencia
{
  moduloId: string
  agenciaId: string
  estado: 'sin-lugares' | 'abierto' | 'agendado' | 'consumido' | 'vencido'
  cantidadDudas: number
  turno: {
    fechaHoraInicio: string     // ISO 8601, zona ART / UTC-3
    duracionMin: number
    enlace: string | null
  } | null
}

// Turno disponible dentro de la franja
{
  fechaHoraInicio: string       // ISO 8601
  duracionMin: number
  disponible: boolean
}
```

**Formatos de presentación:** fechas en pantalla `DD/MM/YYYY`, horarios en formato 24 h, zona horaria **ART (UTC-3) siempre explícita** en cualquier texto que muestre un horario.

---

## 5 · Reglas de negocio a *reflejar*, no a implementar

El backend es la fuente de verdad de todas estas reglas. El frontend debe **renderizar el estado que recibe** y no recalcularlo ni bloquear por su cuenta. Las listamos para que entiendas por qué existe cada estado de la UI:

- Solo puede dejar una duda quien **aprobó la evaluación del módulo con ≥80% (8/10)**.
- Solo el usuario con `esCoordinadorMeet === true` puede agendar.
- El cupo es de **una Meet por módulo por agencia**.
- La cola de un módulo se abre con la primera duda registrada.
- El coordinador puede agendar aunque él mismo no haya aprobado el módulo.
- Si el cupo ya fue consumido, la Meet de ese módulo no se vuelve a habilitar salvo que el módulo reciba contenido nuevo.
- Un usuario puede dejar más de una duda en el mismo módulo, y puede retirar una duda propia mientras esté `en-cola`.

**Visibilidad de las dudas:** cada usuario ve el texto completo de sus propias dudas. El coordinador ve todas las dudas de su agencia para ese módulo, con autor. Un usuario no coordinador ve la **cantidad** de dudas en cola de su equipo, no el texto de las dudas ajenas. Implementá así y reportalo como decisión a confirmar.

---

## 6 · Pantallas y estados

### 6.1 · Pantalla de resultado de evaluación aprobada

Sumar, sin desplazar ni competir con lo que ya comunica la pantalla (nota, desbloqueo del módulo siguiente):

- Bloque secundario con la acción de dejar una duda.
- Si el usuario ya dejó una duda de este módulo en esta sesión, el bloque refleja ese estado en lugar de ofrecer la acción de nuevo.

### 6.2 · Formulario de duda

Modal o panel, según lo que ya use el repositorio. Campos:

| Campo | Tipo | Obligatorio |
|---|---|---|
| Video de referencia | Select con los videos del módulo | No |
| Tema | Select o texto; ver nota de precarga | No |
| Tu duda | Textarea, límite ~500 caracteres con contador | **Sí** |

**Precarga inteligente:** si el usuario aprobó con menos de 10/10, hay preguntas que falló y por lo tanto sub-temas candidatos. Si el mock trae esos sub-temas, sugerilos en el campo Tema. Si el dato no está disponible, dejá el campo libre y no inventes la sugerencia.

### 6.3 · Bloque de Meet en el detalle del módulo — matriz de estados

Este es el corazón de la tarea. Cada fila es un estado distinto de la UI.

| # | Usuario | Módulo aprobado | Cupo | Qué se muestra |
|---|---|---|---|---|
| 1 | cualquiera | no | cualquiera | Bloque informativo: la Meet requiere aprobar la evaluación primero. Sin acción |
| 2 | no coordinador | sí | `sin-lugares` | Acción de dejar duda + aviso de que el coordinador agenda la Meet |
| 3 | no coordinador | sí | `abierto` | Cantidad de dudas en cola + su propia duda si la dejó + aviso de que el coordinador agenda |
| 4 | no coordinador | sí | `agendado` | Fecha, hora y zona del turno. Enlace si vino. Sin acción de agendar |
| 5 | no coordinador | sí | `consumido` | La Meet de este módulo ya se realizó. Sin acción |
| 6 | **coordinador** | cualquiera | `sin-lugares` | Estado vacío: nadie dejó dudas todavía. Sin acción de agendar |
| 7 | **coordinador** | cualquiera | `abierto` | Cola de dudas visible + acción **Coordinar Meet** habilitada |
| 8 | **coordinador** | cualquiera | `agendado` | Datos del turno + acción de cancelar o reprogramar |
| 9 | **coordinador** | cualquiera | `consumido` | Resumen de la Meet realizada. Sin acción |
| 10 | **coordinador** | cualquiera | `abierto`, sin turnos libres | Cola visible + aviso de que no hay turnos disponibles. Acción deshabilitada con explicación |
| 11 | cualquiera | sí | `vencido` | La ventana se cerró sin agendar. Sin acción. Mensaje que no culpe al usuario |

### 6.4 · Vista de la cola (coordinador)

Lista de las dudas del módulo: autor, video de referencia, tema, fecha de registro y texto. Ordenada por fecha de registro. Debe soportar de 1 a ~15 elementos sin romperse.

### 6.5 · Flujo de agendado

1. El coordinador abre la acción de coordinar.
2. Ve los turnos disponibles agrupados por día, con horario y zona ART.
3. Ve la lista de asistentes precargada con quienes dejaron dudas; puede incluirse a sí mismo.
4. Confirma. El cupo pasa a `agendado`.
5. Pantalla o estado de confirmación con los datos del turno.

Casos a cubrir: sin turnos disponibles, error al confirmar, y confirmación de cancelación con paso de verificación.

### 6.6 · Estados de error y vacío obligatorios

Sin turnos disponibles en la franja · error al registrar la duda · error al confirmar el turno · cola vacía para el coordinador · usuario sin módulos aprobados que entra al bloque · pérdida de conexión al enviar el formulario.

---

## 7 · Microcopy (español rioplatense, tono profesional y directo)

Ajustá al registro que ya use el repositorio. No uses signos de exclamación ni emojis. Nunca uses "$" sin aclarar moneda (no aplica acá, pero es convención de la casa).

| Contexto | Texto |
|---|---|
| CTA registrar duda | `Me quedó una duda de este módulo` |
| Título del formulario | `Dejá tu duda` |
| Label video | `¿Sobre qué video?` |
| Label tema | `¿Sobre qué tema?` |
| Label texto | `Contanos tu duda` |
| Placeholder texto | `Describí lo más puntual posible qué no te quedó claro.` |
| Botón enviar | `Dejar la duda` |
| Confirmación | `Tu duda quedó en la cola de este módulo. El coordinador del equipo va a agendar una Meet con Soporte.` |
| Estado 1 (sin aprobar) | `Para dejar una duda y acceder a la Meet de soporte, primero tenés que aprobar la evaluación del módulo.` |
| Estado 2 (no coord., sin cola) | `Si te quedó alguna duda de este módulo, dejala acá. El coordinador del equipo agenda una Meet con Soporte cuando haya dudas registradas.` |
| Estado 3 (no coord., con cola) | `Hay {n} duda(s) de este módulo en la cola de tu equipo. El coordinador agenda la Meet con Soporte.` |
| Estado 4 (no coord., agendado) | `La Meet de este módulo está agendada para el {DD/MM/YYYY} a las {HH:mm} (ART).` |
| Estado 5 (consumido) | `La Meet de este módulo ya se realizó.` |
| Estado 6 (coord., sin cola) | `Todavía nadie de tu equipo dejó dudas de este módulo. Cuando haya al menos una, vas a poder agendar la Meet con Soporte.` |
| Estado 7 (coord., con cola) | `{n} duda(s) pendientes de este módulo.` + CTA `Coordinar Meet` |
| Estado 10 (sin turnos) | `Por ahora no hay turnos disponibles. Las dudas siguen en la cola y vas a poder agendar cuando se libere un turno.` |
| Estado 11 (vencido) | `La ventana para agendar la Meet de este módulo se cerró. Las dudas quedaron registradas para Soporte.` |
| Retirar duda | `Retirar mi duda` |
| Confirmación de cancelación | `¿Querés cancelar la Meet agendada? Las dudas vuelven a la cola.` |
| Error genérico | `No pudimos guardar tu duda. Probá de nuevo en un momento.` |

---

## 8 · Requisitos de diseño

1. **Consistencia por encima de todo.** Reutilizá los componentes, tokens, espaciados, tipografía, radios y estados de foco que ya existen. No introduzcas una librería nueva, un ícono de otra familia ni un patrón de modal distinto al que ya se usa.
2. **Jerarquía correcta.** La Meet es soporte opcional, no el objetivo del módulo. No debe competir visualmente con los videos ni con la evaluación. Bloque secundario, al pie del módulo.
3. **Nunca un callejón sin salida.** Todo estado sin acción disponible tiene que explicar por qué y qué sigue.
4. **Accesibilidad:** contraste AA, foco visible, formulario navegable por teclado, errores asociados a su campo, y los cambios de estado anunciados a lectores de pantalla.
5. **Responsive** según los breakpoints que ya defina el repositorio.
6. La terminología del producto se respeta tal como está en el resto de la app: *file*, *pax*, *voucher*, *cuenta corriente*, *módulo*, *evaluación*. No inventes sinónimos.

---

## 9 · Criterios de aceptación

- [ ] Se pueden navegar los **once estados** de la matriz 6.3 con los datos mockeados.
- [ ] Un usuario sin el módulo aprobado no tiene forma de dejar una duda ni de agendar.
- [ ] Un usuario con `esCoordinadorMeet === false` no ve en ningún estado una acción de agendar.
- [ ] El coordinador ve la cola completa con autor; el no coordinador ve solo la cantidad y sus propias dudas.
- [ ] El coordinador puede agendar incluso sin haber aprobado el módulo.
- [ ] Todo horario mostrado incluye la zona (ART) y usa formato 24 h; las fechas son `DD/MM/YYYY`.
- [ ] Existe estado explícito para "no hay turnos disponibles".
- [ ] Se puede retirar una duda propia mientras está `en-cola`.
- [ ] No se agregó ninguna UI de designación de coordinador ni de configuración de franja horaria.
- [ ] No se introdujeron componentes, dependencias ni patrones visuales ajenos a los del repositorio.
- [ ] Los textos coinciden con la tabla de microcopy salvo ajustes de registro, que deben reportarse.

---

## 10 · Antes de asumir, preguntá

Si algo de esto no encaja con el repositorio, **no improvises: reportá y consultá.** En particular: si ya existe un concepto de rol o permiso sobre el usuario al que convenga colgar `esCoordinadorMeet`; si el detalle de módulo no tiene un lugar natural para un bloque secundario; si la app ya resuelve turnos o agendas en algún otro flujo que convenga reutilizar; y si el manejo de fechas y zonas horarias ya está centralizado en algún utilitario.

Al terminar, entregá un resumen de los archivos tocados, los componentes nuevos creados, los escenarios de mock agregados y las decisiones que tomaste que convenga revisar.