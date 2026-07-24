---
name: issue-workflow
description: Orquesta el ciclo completo de resolución de un issue de GitHub en 6 fases — Setup, Plan, Implement, Review, Fix, Ship — a partir de la URL del issue. Invocar con /issue-workflow <issue-url>.
---

# Issue Workflow

Orquesta el ciclo de vida completo para resolver un issue de GitHub en **cuentoneta**. Los artefactos de cada sesión viven namespaceados por issue en `workspace/<number>/` — `PLAN.md`, `CODE_REVIEW.md` y, si el diff amerita auditoría de seguridad, `SECURITY_REVIEW.md` — así sesiones de issues distintos no se pisan. Re-invocar el mismo issue pasa por la **Fase 0**, que reanuda o rehace con confirmación, nunca sobrescribe en silencio. Los artefactos sueltos de sesiones previas al namespacing que ya están en `workspace/` no se migran ni se borran. (`workspace/` está gitignoreado.)

> **Issues de release:** para los issues de gestión de release (p. ej. "Generar release para versión X") usá el skill dedicado [`release-workflow`](../release-workflow/SKILL.md), que encodea el checklist determinista del release (bump lockstep, CHANGELOG desde el milestone, gatillo `develop → master`) en vez de este flujo de feature.

## Uso

```
/issue-workflow <issue-url>
```

Ejemplo: `/issue-workflow https://github.com/cuentoneta/cuentoneta/issues/1234`

---

## Fase 0 — Detección de estado

**Propósito:** detectar trabajo previo sobre el issue y reanudar en la fase que corresponda en vez de re-setupear.

Corre siempre, en toda invocación, con el número de issue extraído de la URL. Señales a relevar:

1. `git branch --list 'feat/<number>-*'` — ¿existe la rama?
2. `workspace/<number>/PLAN.md` — ¿existe el plan? Si existe, contar sus marcadores de paso `[ ]` vs. `[x]`.
3. `workspace/<number>/CODE_REVIEW.md` y/o `workspace/<number>/SECURITY_REVIEW.md` — ¿existe la review?
4. Si la rama existe: `git rev-list --count develop..<rama>` — ¿cuántos commits tiene sobre `develop`?
5. Si la rama existe: `gh pr list --head feat/<number>-<kebab> --state open` — ¿hay un PR abierto de esa rama?

| Rama | `PLAN.md`                  | Review | Commits | Interpretación → fase sugerida                                                                                                |
| ---- | -------------------------- | ------ | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| No   | No                         | —      | —       | Sesión nueva (caso normal) → **Fase 1**, sin pausa ni mensaje adicional                                                       |
| Sí   | No                         | —      | 0       | La sesión murió antes de escribir el plan → **Fase 2**                                                                        |
| Sí   | No                         | —      | >0      | Inconsistente (commits sin plan) → pausa con respuestas propias: **reconstruir** / **revisar** (ver abajo)                    |
| Sí   | Sí, todo `[ ]`             | —      | 0       | Plan escrito, sin aprobar/implementar → **Fase 2**, re-presentando el plan existente sin re-delegar en `plan-writer`          |
| Sí   | Sí, algún `[x]` (no todos) | —      | >0      | Implementación en curso → **Fase 3**, retomando en el primer paso `[ ]`                                                       |
| Sí   | Sí, todo `[x]`             | No     | >0      | Implementación terminada, sin review → **Fase 4**                                                                             |
| Sí   | Sí                         | Sí     | >0      | Review ya escrita → **Fase 5**, abordando los hallazgos con Estado pendiente                                                  |
| No   | Sí                         | —      | —       | El plan sobrevivió pero la rama no → recrear la rama (Fase 1) y re-confirmar el plan existente en **Fase 2**, sin regenerarlo |

Si además existe un **PR abierto** para la rama (señal 5), el flujo ya completó la **Fase 6**: reportar la URL del PR y pausar — el trabajo restante, si lo hay, es abordar feedback de ese PR, no re-ejecutar el flujo.

Si se detecta cualquier señal, pausar con `AskUserQuestion`:

**⏸ PAUSA — decisión vía `AskUserQuestion`.**

- `question`: "Detecté <lo encontrado: rama con N commits / plan con M de T pasos marcados / review existente>. Una sesión previa llegó hasta la Fase <X>. ¿Cómo seguimos?"
- `header`: `Retomar`
- `options` (la recomendada primero): **Reanudar** — continuar en la Fase <X> reusando los artefactos tal cual están; **Rehacer** — empezar de nuevo desde la Fase 1, sin borrar nada. La opción **"Other"** (automática) cubre cualquier instrucción libre distinta.

Semántica de cada respuesta (sin cambios respecto de la tabla):

- **Reanudar** → saltar a la fase sugerida por la tabla, reusando los artefactos existentes sin sobrescribirlos.
- **Rehacer** → flujo normal desde la Fase 1. No borra `workspace/<number>/` ni la rama existente: antes de cada punto que sobrescribiría un artefacto existente (recrear la rama en Fase 1, reescribir `PLAN.md` en Fase 2), confirmar explícitamente con el usuario — nunca pisar en silencio.

El caso **commits sin plan** usa una pregunta propia — ni "reanudar" ni "rehacer" describen esa situación:

- `question`: "Hay <N> commits en la rama pero no existe `workspace/<number>/PLAN.md`. ¿Cómo seguimos?"
- `header`: `Estado`
- `options`: **Reconstruir** — delegar en `plan-writer` la reconstrucción del plan a partir del diff existente y seguir el flujo desde la Fase 2; **Revisar** — tratar los commits como implementación hecha e ir directo a la Fase 4. ("Other" cubre cualquier instrucción distinta de esas dos.)

---

## Fase 1 — Setup

**Propósito:** crear una rama de feature limpia desde `develop` actualizado.

1. `gh issue view <issue-url> --json number,title` para extraer número y título.
2. Derivar el nombre de rama (convención del repo):
   - Formato: **`feat/<number>-<titulo-en-kebab-case>`**.
   - Transformación: minúsculas, espacios y no-alfanuméricos → guiones, colapsar guiones consecutivos, recortar guiones de borde, truncar a ~60 caracteres en un límite de palabra.
3. `git checkout develop && git pull` para asegurar la base actualizada.
4. `git checkout -b feat/<number>-<kebab>`. Si la Fase 0 detectó la rama existente y el usuario eligió **rehacer**, confirmar la reutilización y usar `git checkout feat/<number>-<kebab>` (sin `-b`).
5. Reportar al usuario: número, título y nombre de rama.

---

## Fase 2 — Plan

**Propósito:** producir un plan de implementación detallado para aprobación.

1. Delegar al agente **`plan-writer`** pasándole la URL del issue, su descripción, el nombre de rama y la ruta de salida completa (`workspace/<number>/PLAN.md`). Si la Fase 0 reanudó acá con un plan ya escrito, saltear la delegación y pasar directo al resumen.
2. El plan-writer produce `workspace/<number>/PLAN.md`.
3. Presentar un resumen breve al usuario (objetivo, enfoque, archivos afectados, decisiones clave).

**⏸ PAUSA — decisión vía `AskUserQuestion`.**

- `question`: "El plan está en `workspace/<number>/PLAN.md`. ¿Cómo seguimos?"
- `header`: `Plan`
- `options` (la recomendada primero): **Aprobar** — el plan queda tal cual y se avanza a la Fase 3; **Dar feedback** — el orquestador pide el texto del feedback a continuación. La herramienta exige entre 2 y 4 opciones explícitas — "Aprobar" no puede ir sola. La opción **"Other"** (automática) transporta el feedback directamente en un solo paso y es la vía preferida cuando el usuario ya sabe qué cambiar.

Ramaleo tras la respuesta:

- **Aprobar** → avanzar a la Fase 3.
- **Dar feedback** → pedir el texto del feedback al usuario y tratarlo igual que Other.
- **Other** (feedback) → reenviar el texto recibido **a la misma Task del `plan-writer`** delegada en el paso 1 — conserva toda la exploración en contexto — para que revise `workspace/<number>/PLAN.md` en función del feedback y reescriba el plan en el mismo archivo. Nunca editar `PLAN.md` a mano desde el orquestador ni relanzar un `plan-writer` de cero mientras la Task siga disponible. Repetir la pausa tras cada revisión, iterando hasta un "Aprobar". Si la Task original ya no está disponible (p. ej. reanudación vía Fase 0 en una sesión nueva), delegar en un `plan-writer` nuevo pasándole el `PLAN.md` existente más el feedback — revisa sobre lo escrito, no re-explora de cero.

No avanzar a la Fase 3 sin una respuesta "Aprobar".

---

## Fase 3 — Implement

**Propósito:** ejecutar el plan con commits atómicos.

1. Ejecutar los pasos de `workspace/<number>/PLAN.md` en orden. Si la Fase 0 reanudó acá, saltear los pasos ya marcados `[x]`.
2. Un commit atómico por unidad lógica de trabajo. Tras cada commit, marcar `[x]` el checkbox del paso correspondiente en `workspace/<number>/PLAN.md`.
3. **Scan de impacto en documentación.** Si el cambio toca tipos, schemas de Sanity/Zod, contratos de API o terminología de dominio, delegar en el agente **`documentation-writer`** la actualización de `docs/`, `CLAUDE.md` y `.claude/references/`, en el **mismo** commit/PR — lo exige la sección [Scan de impacto en documentación](../../../CLAUDE.md#scan-de-impacto-en-documentación) de `CLAUDE.md`. Si el cambio no toca nada de eso, saltear el paso.
4. **CHANGELOG:** cuentoneta mantiene `CHANGELOG.md` **por release/versión** (no por PR), al cerrar un milestone. **No** se exige una entrada por issue en este flujo; el tracking del cambio vive en el issue + su milestone. (Esto reemplaza el gate de CHANGELOG del starter.)

### Reglas de commit

- Formato del mensaje: `[#<issue>] - <qué cambió y por qué>` (en español).
- Un commit por cambio lógico distinto (p. ej. componente nuevo + spec = un commit; una story es otro commit si es otra preocupación).
- Cada commit debe dejar el código **buildeable** (los gates de CI pasarían).
- Nunca mensajes no descriptivos ("WIP", "fix", "update").
- Nunca `--amend`; crear commits nuevos tras fallos del hook de pre-commit.

### No hacer en esta fase

- Pushear.
- Saltear tests ante un cambio de comportamiento en runtime.
- Crear barrels (`index.ts` re-export).
- Dejar código comentado.

---

## Fase 4 — Review

**Propósito:** verificar que pasen los gates de CI y correr los agentes de review.

1. Correr localmente (con `pnpm`, nunca `nx` directo) los **gates de CI** definidos en la sección [Comandos comunes](../../../CLAUDE.md#comandos-comunes) de `CLAUDE.md` (párrafo **Gates de CI**). `test:e2e` y `studio-build` son costosos de correr en cada iteración: corré `test:e2e` si el cambio toca flujos E2E y `studio-build` si toca `cms/`; el resto, siempre.
   - **Lanzalos concurrentemente**, no uno tras otro: son independientes entre sí y así los corre CI (todos los jobs cuelgan de `setup` y van en runners separados). En serie tardan la **suma**; en paralelo, lo que tarde el más lento. Medido en #1850: 105s → 29s.
   - Si alguno falla: reportar cuál, diagnosticar, arreglar, commitear el fix (reglas de Fase 3) y re-correr **solo el que falló** mientras el resto sigue verde; re-correr todo solo si el fix toca superficie compartida.
2. **Determinar si el diff toca superficie de seguridad.** La lista de disparadores es la sección **"Cuándo correr"** del agente `security-auditor`: `src/api/**` (endpoints, GROQ, mappers), manejo de contenido externo (PortableText/HTML del CMS, `bypassSecurityTrust*`, fetch a servicios externos, `localStorage`), variables de entorno / secrets / config de Sanity o Clarity, y dependencias (`package.json` / `pnpm-lock.yaml`). Un diff que no toca nada de eso —solo documentación, estilos o UI sin datos externos— **no** la amerita; el auditor también puede invocarse a demanda si surge una preocupación puntual.
3. **Delegar las reviews — en paralelo si corren ambas.** Si el diff toca superficie de seguridad, lanzar al **`security-auditor`** y al **`code-reviewer`** en el **mismo turno** (ambas delegaciones en una única respuesta, igual que los gates del paso 1): sus reviews son independientes y no comparten archivo de salida. Si no la toca, delegar solo al `code-reviewer`. Cada delegación incluye la ruta de salida completa del agente (ver paso 4). En ambos casos el `code-reviewer` revisa todos los cambios de la rama vs. `develop` y recibe **el resultado observado de los gates del paso 1** (qué corriste, con qué resultado, y cuáles omitiste por no aplicar al diff) — sin ese dato los vuelve a correr, que es la parte más cara de la review.
4. Cada agente escribe su propio archivo: el `code-reviewer` en `workspace/<number>/CODE_REVIEW.md` y el `security-auditor` en `workspace/<number>/SECURITY_REVIEW.md`.
5. Presentar la tabla de hallazgos al usuario (Críticos, Advertencias, Sugerencias), combinando ambos archivos cuando corrió el auditor, e indicando si corrió o por qué no correspondía. Al combinar, cada hallazgo se cita con el número tal como aparece en su documento de origen: los de seguridad llevan el prefijo `S` (p. ej. `S3`) y así no se confunden con los del `code-reviewer` (sin prefijo).

**⏸ PAUSA — decisión vía `AskUserQuestion`.**

- `question`: "Review completa en `workspace/<number>/CODE_REVIEW.md` (y `workspace/<number>/SECURITY_REVIEW.md` si corrió el auditor). ¿Cómo seguimos?" — si hay Críticos abiertos, incluir cuántos en el texto de la pregunta.
- `header`: `Review`
- `options` (la recomendada primero): **Proceder** — ir a la Fase 5 y abordar los hallazgos por prioridad (Críticos primero); **Ship** — no hay nada bloqueante: saltar la Fase 5 e ir directo a la Fase 6.

> Nota: bloquear "Ship" mecánicamente ante Críticos abiertos es un cambio aparte (#1919, pendiente) — hoy la pausa solo los hace visibles en la pregunta; cuando #1919 se implemente, este es el punto donde aplicaría el bloqueo.

---

## Fase 5 — Fix

**Propósito:** abordar los hallazgos con commits atómicos.

1. Abordar cada **Crítico** y **Advertencia** de `workspace/<number>/CODE_REVIEW.md` — y de `workspace/<number>/SECURITY_REVIEW.md` si corrió el auditor — por prioridad (Críticos primero).
2. Tras cada fix, actualizar la columna **Estado** en el archivo al que pertenece el hallazgo (`CODE_REVIEW.md` o `SECURITY_REVIEW.md`), con los valores canónicos del `code-reviewer` (Detectado / En progreso / Corregido / Descartado / Diferido / No se corrige / Requiere test E2E).
3. Un commit atómico por fix. El mensaje describe el **cambio real**, nunca referencia el número de hallazgo.
   - ✅ `[#1234] - Acota la constante al cuerpo de la función — estaba a nivel de módulo`
   - ❌ `[#1234] - Arregla el hallazgo #2`
4. Si un hallazgo se **difiere**, proponer el issue al usuario y **esperar su confirmación** antes de crearlo (`gh issue create`); una vez creado, anotar su URL junto al valor **Diferido** en la columna **Estado**. Crear un issue es una acción hacia afuera: la misma política rige en la Fase 6.
5. Tras abordar Críticos y Advertencias, re-correr los gates de CI. Arreglar regresiones.
6. Las **Sugerencias** son opcionales: presentarlas y dejar que el usuario decida.

---

## Fase 6 — Ship

**Propósito:** pushear, crear el PR y actualizar el issue original.

1. `git push -u origin feat/<number>-<kebab>`.
2. Crear el PR con `gh pr create` (base `develop`, milestone del issue):
   - Título: `[#<issue>] - <título del issue>`.
   - Cuerpo (en **español**):

     ```
     ## Descripción
     <1-3 bullets>

     Closes #<issue>.

     ## Plan de pruebas
     [checklist de lo verificado]
     ```

   - **El cuerpo termina en el plan de pruebas (restricción dura):** sin leyenda de atribución de agente (`🤖 Generated with …`, `Co-Authored-By: Claude …`, `Claude-Session: …`). Ver [`coding-agent-policies.md`](../../references/coding-agent-policies.md) Sección 2.
   - **El PR DEBE enlazar su issue de origen (restricción dura):** el cuerpo debe contener un keyword de cierre — `Closes #<issue>` (o `Fixes`/`Resolves`). El prefijo `[#<issue>]` del título **no** crea el enlace; el keyword en el cuerpo es obligatorio.
   - Si el issue es **hijo de un epic**, agregar además una línea `Parte de #<epic>.` (sin keyword de cierre) para cross-linkear el epic sin auto-cerrarlo.

3. Presentar la URL del PR al usuario.
4. Escanear la sesión por ítems **fuera de alcance** (fixes/hallazgos/mejoras más allá del issue). Si hay:
   - Actualizar la descripción del issue (`gh issue edit`) con una sección "Fuera de alcance (abordado en este PR)".
   - Preguntar al usuario si quiere crear issues separados para follow-ups. Esperar confirmación antes de crearlos. **Nunca crear issues en repos donde el usuario no es contribuidor.**
5. Presentar el resumen final como **exactamente** esta tabla Item/Valor (renderizar solo después de que push + PR + edición del issue se completaron con artefactos reales):

   ```markdown
   **Workflow completo.**

   | Item                | Valor                                                             |
   | ------------------- | ----------------------------------------------------------------- |
   | Issue               | [#<número>](issue-url) — <título>                                 |
   | Rama                | `feat/<number>-<kebab>`                                           |
   | PR                  | [#<pr>](pr-url)                                                   |
   | Commits             | <N> commits atómicos                                              |
   | Hallazgos abordados | <X> críticos · <Y> advertencias · <Z> sugerencias — <disposición> |
   | CI local            | <Verde / Rojo — ver <motivo>>                                     |
   ```

   - `Commits` cuenta solo los de la rama (`git rev-list --count develop..HEAD`).
   - `CI local` reporta el resultado de la última corrida de los gates.

---

## Restricciones (todas las fases)

- Usar `pnpm <script>` para ejecutar tareas; no construir variantes de `nx` directas a mano.
- Nunca prefijar comandos git con `cd` — el working dir ya está en la raíz.
- Nunca abrir el PR antes de que pasen los gates de CI y haya corrido el `code-reviewer`.
- Nunca abrir el PR sin el keyword de cierre (`Closes #<issue>`) en el cuerpo enlazando el issue de origen.
- Nunca saltear la fase Plan — aun cambios triviales se benefician de un plan breve.
- Aplican siempre las reglas de [`.claude/references/coding-agent-policies.md`](../../references/coding-agent-policies.md): sin framings de mantenedor único, sin "salteá el test por ser chico" (salvo cambios solo-doc), sin diferir la review más allá de abrir el PR, y sin comentarios redundantes (Sección 3).
