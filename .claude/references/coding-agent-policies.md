# Políticas de colaboración de agentes de código

> **Audiencia:** cualquier agente de IA que opere sobre este repositorio (Claude Code, Cursor, Aider, GitHub Copilot Chat, etc.) y cualquier persona revisora que evalúe un PR producido por un agente.
>
> **Autoridad:** estas políticas son una restricción dura, al mismo nivel que las convenciones de [`CLAUDE.md`](../../CLAUDE.md). Las violaciones son **bloqueantes para la review**.
>
> **Carga:** este archivo se carga **siempre, al inicio de cada sesión**, antes de generar cualquier recomendación.

---

## Por qué existe este documento

La Cuentoneta es un proyecto **colaborativo y de referencia**: las decisiones de cómo se estructura el trabajo acá sientan precedente para todo lo que viene después. Recomendaciones que cambian rigor por ceremonia —aun con buena intención— marcan el precedente equivocado para quienes copien patrones de este repo y para la cultura de desarrollo del equipo.

Los agentes de código tienen un modo de falla particular: cuando sopesan alternativas, tienden a optimizar el costo percibido por el agente (tiempo, ventana de contexto, llamadas a la API) en vez de la salud del codebase a largo plazo. Este documento codifica las reglas que previenen ese modo de falla.

---

## Sección 1 — La regla "no-solo-maintainer"

### Regla

Cuando recomiendes entre alternativas que cambian rigor por ceremonia —por ejemplo:

- Un PR grande vs. varios PRs chicos
- Un solo commit vs. varios commits atómicos
- Doc inline vs. archivo aparte
- Saltear tests vs. escribirlos
- Saltear la code review vs. correrla
- Hand-wavear un edge case vs. cubrirlo

— **nunca** uses ninguno de estos framings como desempate, pregunta lateral o justificación para ahorrar costo:

- "Si sos el único que mantiene esto..."
- "Si es trabajo en solitario..."
- "Si nadie más va a revisar..."
- "Como sos el contribuidor principal..."
- "Si esto es solo para vos..."
- Cualquier framing equivalente que asuma un mantenedor único.

Tampoco incluyas esas frases como **cláusulas condicionales** en recomendaciones ("si X es verdad entonces esto está bien, si no aquello").

### Por qué

1. **El agente no está en posición de evaluar el contexto de mantenimiento.** Ve el repo en un momento puntual; no ve quién va a leer el código en seis meses, qué review de compliance lo va a tocar, ni qué historia de onboarding le importa al equipo.
2. **Aunque el usuario fuera el único mantenedor**, el precedente existe para futuros colaboradores que copien patrones de este repo a su propio trabajo. La escapatoria del "solo-maintainer" envenena el pozo para todos aguas abajo.
3. **Este es un proyecto colaborativo y de referencia.** Sugerir atajos sobre supuestos de mantenimiento en solitario malinterpreta el contexto real.

### Cómo aplicarla

- **Defaulteá a la opción rigurosa / amigable con la colaboración** y presentala como la recomendación, no como la rama "si son N personas".
- Si una opción más liviana realmente vale la pena mencionarla, framéala como "la opción de menor costo, asumiendo que aceptamos X pérdida de rigor" —nunca como "está bien si sos solo vos".
- Aplicá esto en code reviews, estructuración de planes, estrategia de PRs, decisiones de refactor, decisiones de cobertura de tests, decisiones de documentación y cualquier otro lugar donde el agente pueda tentarse de optimizar para el flujo en solitario.
- Esta política es una regla dura, no una preferencia. Las personas revisoras pueden citar esta sección para bloquear un PR.
- Las convenciones específicas de commits y PRs están en [`CLAUDE.md`](../../CLAUDE.md) (sección "Convenciones de Git"); esta sección gobierna el **framing** de las recomendaciones que tocan esas convenciones, no las convenciones en sí.

### Framing bueno vs. malo

**Malo** (prohibido):

> "La opción A junta todos los cambios en un solo PR. La opción B los separa en varios PRs chicos. **Si sos el único que revisa, A está bien** —es más rápido y te ahorrás la ceremonia del merge. Si no, B es más limpia."

**Bueno** (preferido):

> "La opción A junta todos los cambios en un solo PR. La opción B los separa en varios PRs chicos. **B es la recomendación**: cada PR es revisable, revertible y trazable a su propio issue de forma independiente. A es la opción de menor rigor —se saltea la historia de review por área y concentra el riesgo de merge en un solo evento. Elegí A solo si aceptaste explícitamente esas pérdidas."

---

## Sección 2 — Otros anti-patrones de atajo

Las siguientes recomendaciones están prohibidas. La lista crece con el tiempo a medida que se descubren nuevos modos de falla. **Las adiciones siguen el mismo proceso de enmienda que cualquier cambio:** propuesta vía issue en `cuentoneta/cuentoneta`, con aprobación explícita del usuario.

### "Podemos saltear el test porque es un cambio chico"

Prohibido. Los tests existen por algo; "chico" no es una medida de riesgo. Hasta un bugfix de una línea debe aterrizar con un test de regresión que hubiera atrapado el bug original. El trabajo del agente es escribir el test, no argumentar en contra de escribirlo.

**Alcance:** esta regla aplica a cualquier cambio que modifique comportamiento en runtime —lógica, valores de configuración que la app lee en runtime, schemas (Sanity/Zod) o contratos de API. **Cambios solo de documentación** (Markdown, comentarios sin cambios de código) **y cambios solo de configuración de tooling** (reglas de ESLint/Stylelint, settings de Prettier, YAML de workflows de CI, etc., sin efecto en runtime sobre la app) están **exentos** del requisito de test.

### "Borremos el archivo total está gitignoreado"

Prohibido para artefactos intencionalmente autorados aunque estén gitignoreados —por ejemplo salidas regenerables bajo `tools/` (como `tools/author-bios/` o `tools/story-summaries/`), planes, notas de review o mapas de issues. No borres ese tipo de archivos sin instrucción explícita del usuario, sin importar su estado de gitignore. Antes de borrar/sobrescribir un artefacto generado, verificá que sea **re-generable** (ver "Convenciones de Git" en `CLAUDE.md`). Para archivos fuera de esas rutas, usá criterio: si la existencia del archivo fue pedida o referenciada explícitamente por el usuario en algún archivo commiteado (`CLAUDE.md`, `docs/`, etc.), no lo borres sin confirmar.

### "La code review puede esperar hasta después de abrir el PR"

Prohibido. La review local del agente (p. ej. el agente `code-reviewer` / skill de code review) corre **antes de abrir el PR**, para que quienes revisen el PR vean código ya pulido. Pushear la rama está bien; abrir el PR antes de la review local, no.

### "Documentemos el edge case en un comentario y listo"

Prohibido. Si un edge case se puede enumerar en un comentario, se puede enumerar en un test. Los comentarios documentan la intención; los tests la hacen cumplir. El agente debe escribir el test.

### "El componente es simple, no hace falta la story de Storybook"

Prohibido. Todo componente nuevo en `src/app/components/` lleva su `*.stories.ts` (ver "Testing" en `CLAUDE.md`). La respuesta siempre es escribir la story.

### "El estado de carga ya se ve, no hace falta una story intercambiable"

Prohibido. Si el componente tiene un **estado de carga (skeleton)**, su story debe exponer ese estado de forma **intercambiable**: un control booleano (`loading` / "Cargando") que alterna real↔skeleton en el **mismo slot**, para poder evaluar la transición y la alineación 1:1 entre ambos. Aplica a componentes que se implementen de ahora en más (no es retroactivo sobre legacy que será rediseñado). El patrón vive en [`testing.md`](testing.md); su omisión es bloqueante para la review.

### "Agrego la leyenda de atribución de agente al PR/commit"

Prohibido. Nunca incluir `🤖 Generated with [Claude Code]…`, `Co-Authored-By: Claude …` ni `Claude-Session: …` en un mensaje de commit ni en el cuerpo de un PR (`gh pr create --body`/`--body-file`). El trailer **automático** de commits ya está suprimido por `attribution` en `.claude/settings.json`; el vector que queda es que el agente lo **tipee a mano** en el cuerpo del PR —ese setting no lo borra porque no es un trailer del harness—. La descripción de un PR o commit que lo contenga es bloqueante para la review.

### "Listo los hijos del epic en el cuerpo y queda linkeado igual"

Prohibido. Los issues hijos de un epic se crean **como child issues reales** (relación de sub-issue de GitHub), nunca como una tasklist o una lista de menciones `#<id>` en el cuerpo del epic. Una mención crea una referencia cruzada, no una jerarquía: no aparece en el panel de sub-issues, no aporta progreso agregado y se pierde al reordenar el cuerpo.

El cuerpo del epic **puede** incluir una tabla de hijos como resumen legible, pero eso **no reemplaza** el vínculo: cada hijo debe quedar además enlazado como sub-issue.

```bash
# El endpoint toma el id numérico interno del issue (`.id`), no su número (`.number`).
id=$(gh api repos/<owner>/<repo>/issues/<hijo> --jq .id)
gh api repos/<owner>/<repo>/issues/<epic>/sub_issues -X POST -F sub_issue_id="$id"
```

Un epic cuyos hijos figuren solo como menciones es bloqueante para la review. Si la API de GitHub falla al vincular, **reportarlo explícitamente** y dejar el vínculo pendiente: no darlo por hecho ni sustituirlo por una tasklist.

---

## Sección 3 — Disciplina de comentarios

Los comentarios explican el **porqué no obvio**, nunca el **qué**. Si el código, los tipos, los nombres o una referencia de `.claude/references/` ya lo dicen, **no se comenta**. El **rationale de un cambio** (por qué se hizo, qué reemplaza, contexto histórico) va al **mensaje de commit / descripción del PR**, no inline.

**No comentar** (es ruido y se desincroniza; review-blocking si solo agrega ruido):

- **Restatear una convención ya documentada.** ❌ `// doble de test, nunca Mock*` · ❌ `// el token no lleva providedIn/factory`. La convención vive en `clean-architecture.md`; repetirla en cada archivo es ruido.
- **Rationale histórico / de cambio inline.** ❌ `// Rediseñado en #1499: la versión previa usaba .toPromise()…` · ❌ `// sin consumidores al momento del cambio`. Eso va al commit/PR.
- **Navegación / estructura obvia.** ❌ `// la implementación HTTP vive en x.provider.ts` · ❌ `// API providers (patrón provideX)`. Los imports y los nombres de archivo ya lo muestran.
- **Parafrasear la línea siguiente.** ❌ `// inyecta el HttpClient` encima de `inject(HttpClient)`.
- **Justificar una visibilidad que la convención ya fija.** ❌ `// public porque es la API imperativa` sobre un `input()`/`output()`/signal expuesta. Si el miembro **es** la API pública, su visibilidad ya la dicta `angular-components.md`; el modificador es autoexplicativo.
- **Anotar un reemplazo canónico.** ❌ `// reemplaza ngOnDestroy` sobre un `effect((onCleanup) => …)`. El mapeo lifecycle hook → primitiva reactiva es la regla por defecto (`angular-components.md`); nombrarlo inline es restatear la convención.

**Sí comentar:**

- Un **porqué** que no se deduce del código: una decisión no obvia, un workaround con su causa, una restricción externa, una sutileza de orden/timing (idealmente con enlace al issue/PR).
- Una **invariante** o precondición que el tipo no captura.

**Antes de escribir un comentario, preguntarse:** ¿esto ya lo dice el código, un nombre, un tipo o una referencia? ¿es contexto de cambio que debería ir al PR? Si la respuesta a cualquiera es "sí", no se escribe.

Los comentarios de sección de estilo `// Core` / `// Models` que ya existen en el repo se respetan donde están, pero **no se agregan nuevos** salvo que aporten navegación real en un archivo grande.

---

## Sección 4 — Preguntas aclaratorias

Los agentes pueden hacer preguntas aclaratorias cuando la instrucción del usuario es genuinamente ambigua. No pueden hacer preguntas cuya respuesta cambiaría qué opción recomienda el agente sobre el eje rigor / ceremonia. En concreto:

- ✅ "¿El nuevo input del componente debería ser `required`?" — ambigüedad sustantiva, preguntá.
- ✅ "¿La entrada del changelog va bajo Added o Changed?" — ambigüedad sustantiva, preguntá.
- ✅ "¿El componente nuevo soporta light y dark desde el día uno, o aterriza solo light y el dark va en un follow-up?" — pregunta de producto sustantiva, preguntá.
- ❌ "¿Sos la única persona que va a revisar esto?" — prohibida, nunca preguntar.
- ❌ "¿Qué tan importante es que los tests cubran este edge case?" — prohibida **como forma de pedir permiso para saltear el test**. La pregunta solo es aceptable si aclara _qué_ debe afirmar el test, no _si_ escribirlo. Si te encontrás queriendo preguntar esto para evitar escribir el test, escribí el test.
- ❌ "¿Está bien si me salteo la code review para este PR chico?" — prohibida, nunca preguntar.
- ❌ "¿Está bien saltear la story de Storybook porque el componente es simple?" — prohibida, nunca preguntar. La respuesta siempre es escribir la story.

---

## Sección 5 — Repos externos: política de issues

Cuando trabajés contra repos donde el usuario **no es contribuidor** (p. ej. dependencias upstream, el starter de referencia, librerías de terceros):

- **No crees issues, PRs ni comentarios** en esos repos en nombre del usuario.
- Si detectás algo que ameritaría un issue upstream, **informalo al usuario** con el detalle suficiente (repo, descripción, reproducción) y dejá que **él lo cree** si decide hacerlo.
- Está bien **leer** esos repos (vía `gh api`, clonado, etc.) para inspirarse o portar patrones, siempre que el resultado aterrice en `cuentoneta/cuentoneta`.

El repo propio donde sí se crean issues/PRs es `cuentoneta/cuentoneta` (usar `gh`).

---

## Sección 6 — Retención de memoria

Este agente usa el **sistema de memoria de Claude Code** (archivos en `.claude/projects/<project-id>/memory/` indexados desde `MEMORY.md`). Debe guardar un registro de feedback que codifique estas reglas, para que sobrevivan a la pérdida de contexto entre sesiones.

La memoria local **no reemplaza** este documento: el documento es la versión autoritativa que las personas revisoras y otros agentes pueden citar, y es portable entre proveedores de agentes. La memoria local es el refuerzo táctico para el comportamiento de un agente entre sus propias sesiones.

El principio: **el documento es canónico; la memoria es refuerzo**. Si los dos alguna vez se contradicen, gana el documento y se actualiza la memoria.

> **Específico de Claude Code:** la memoria de este proyecto vive en `.claude/projects/C--Users-ramir-WebstormProjects-cuentoneta/memory/` y se indexa desde `MEMORY.md`. Otros agentes (Cursor, Aider, Copilot Chat, etc.) deberían usar su mecanismo de persistencia equivalente o —si no tienen ninguno— cargar este documento al inicio de cada sesión vía el mecanismo de inclusión de contexto del proyecto (`.cursorrules`, `.aiderrules`, etc.).

---

## Sección 7 — Enforcement

### Para agentes

- Leé este documento al inicio de sesión, **cada** sesión, sin condiciones.
- Si una recomendación violaría cualquier regla de arriba, **revisá la recomendación antes de presentarla** en vez de presentar la violación con un caveat.
- Si una instrucción del usuario forzaría una violación (p. ej. "salteá los tests para este"), explicitá el conflicto: "Esto violaría `coding-agent-policies.md` Sección 2. Confirmá que querés que avance igual."

### Para personas revisoras

- Una descripción de PR que contenga cualquiera de los framings prohibidos es bloqueante. Pedí cambios citando este documento por sección.
- Un PR que omite tests sobre la base de "es chico" es bloqueante. Pedí los tests faltantes.
- Un PR abierto sin la pasada de review local (cuando el flujo la especifica) es bloqueante. Pedí la pasada antes de mergear.
- Un componente nuevo sin su `*.stories.ts` es bloqueante. Pedí la story.

### Gates de CI

Independientemente de lo anterior, todo PR debe dejar verdes los gates de CI definidos en la sección [Comandos comunes](../../CLAUDE.md#comandos-comunes) de `CLAUDE.md` (párrafo **Gates de CI**). Que un gate sea "molesto" o "lento" no es justificación para saltearlo o deshabilitarlo.

### Enmiendas

Proponé cambios vía issue en `cuentoneta/cuentoneta`. Las enmiendas requieren aprobación explícita del usuario antes de mergear al documento. Cada PR que modifique este archivo debe actualizar la fecha de "Última actualización" del pie de página.

---

_Última actualización: 2026-07-20. Versión inicial en #1495 (CLAUDE.md + archivos de referencia); Sección 3 (Disciplina de comentarios) agregada en #1499 y ampliada en #1542 (visibilidad de API y reemplazos canónicos); regla de story intercambiable para estados de carga agregada en #1581; regla de child issues reales en epics agregada en #1843; "Gates de CI" convertida a remisión a CLAUDE.md en #1844._
