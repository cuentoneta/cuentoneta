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

**Propósito:** detectar el entorno de trabajo (worktree o raíz) y el trabajo previo sobre el issue, y reanudar en la fase que corresponda en vez de re-setupear.

### Paso 0 — Entorno (worktree o raíz)

Corre siempre, antes de cualquier otra señal:

1. ¿La invocación actual o una directiva vigente de la sesión declaró el entorno ("en un worktree", "en la raíz")? Si sí, usarlo — la declaración tiene prioridad. Si la declaración pide **raíz** pero `git worktree list` ya lista `.claude/worktrees/<number>`, avisar el conflicto y confirmar antes de seguir: la rama y los artefactos del issue pueden vivir en ese worktree.
2. Sin declaración: si `git worktree list` ya lista `.claude/worktrees/<number>`, el entorno es **worktree** — reingresar con `EnterWorktree` (`path: .claude/worktrees/<number>`), sin preguntar. Continuar con "Señales de reanudación" desde ahí.
3. Sin declaración ni worktree previo: pausar con `AskUserQuestion` — ver [Modo worktree](#modo-worktree) → "Cuándo se activa". La respuesta fija el entorno para el resto de la sesión (Fase 1 en adelante).
4. Si el entorno resuelto es worktree y el worktree ya existía (pasos 1-2): evaluar además la señal de limpieza `gh pr list --head feat/<number>-<kebab> --state merged` — ver [Modo worktree](#modo-worktree) → "Ciclo de vida".

### Señales de reanudación

Con el entorno ya resuelto (y el cwd ya en el worktree si corresponde), relevar con el número de issue extraído de la URL:

1. `git branch --list 'feat/<number>-*'` — ¿existe la rama?
2. `workspace/<number>/PLAN.md` — ¿existe el plan? Si existe, contar sus marcadores de paso `[ ]` vs. `[x]`.
3. `workspace/<number>/CODE_REVIEW.md` y/o `workspace/<number>/SECURITY_REVIEW.md` — ¿existe la review?
4. Si la rama existe: `git rev-list --count <base>..<rama>` — ¿cuántos commits tiene sobre la base? `<base>` es `develop` en modo raíz y **`origin/develop`** en modo worktree (ver [Modo worktree](#modo-worktree) → "Ajustes transversales").
5. Si la rama existe: `gh pr list --head feat/<number>-<kebab> --state open` — ¿hay un PR abierto de esa rama?

| Rama | `PLAN.md`                  | Review | Commits | Interpretación → fase sugerida                                                                                                |
| ---- | -------------------------- | ------ | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| No   | No                         | —      | —       | Sesión nueva (caso normal) → **Fase 1**, sin pausa ni mensaje adicional                                                       |
| Sí   | No                         | —      | 0       | La sesión murió antes de escribir el plan → **Fase 2**                                                                        |
| Sí   | No                         | —      | >0      | Inconsistente (commits sin plan) → pausa con respuestas propias: **Reconstruir** / **Revisar** (ver abajo)                    |
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

**Propósito:** crear una rama de feature limpia desde `develop` actualizado — en el entorno resuelto por la Fase 0 (worktree o raíz).

1. `gh issue view <issue-url> --json number,title` para extraer número y título.
2. Derivar el nombre de rama (convención del repo):
   - Formato: **`feat/<number>-<titulo-en-kebab-case>`**.
   - Transformación: minúsculas, espacios y no-alfanuméricos → guiones, colapsar guiones consecutivos, recortar guiones de borde, truncar a ~60 caracteres en un límite de palabra.
3. **Modo raíz** (sin cambios respecto del flujo previo a #1942):
   - `git checkout develop && git pull` para asegurar la base actualizada.
   - `git checkout -b feat/<number>-<kebab>`. Si la Fase 0 detectó la rama existente y el usuario eligió **rehacer**, confirmar la reutilización y usar `git checkout feat/<number>-<kebab>` (sin `-b`).
4. **Modo worktree:** seguir [Modo worktree](#modo-worktree) → "Mecánica de creación" (`git fetch origin`, `git worktree add`, `EnterWorktree`, `pnpm install` + `pnpm run config`).
5. Reportar al usuario: número, título, nombre de rama y, en modo worktree, la ruta del worktree.

---

## Modo worktree

**Propósito:** desde #1942, todo el flujo (implementación, gates, subagentes, ship) puede correr en un **worktree propio** bajo `.claude/worktrees/<number>` en vez del working tree principal, para eliminar colisiones con sesiones paralelas (root u otros worktrees). Esta sección centraliza la mecánica; las Fases 0, 1, 2, 3, 4 y 6 la referencian en vez de repetirla.

### Cuándo se activa

- **Declarado:** si la invocación actual o una directiva vigente de la sesión ya dice dónde trabajar ("en un worktree", "en la raíz"), se respeta — la declaración tiene prioridad. Si pide raíz habiendo un worktree del issue, la Fase 0 avisa el conflicto y confirma antes de seguir.
- **Reanudación:** sin declaración, si `git worktree list` ya lista un worktree para `.claude/worktrees/<number>`, el entorno es worktree — no se pregunta, se reingresa (Fase 0, Paso 0).
- **Sin declarar y sin worktree previo:** Fase 0 pausa con `AskUserQuestion`:
  - `question`: "¿Dónde corremos el flujo para este issue: en un worktree aislado o en la raíz del repo?"
  - `header`: `Entorno`
  - `options` (recomendada primero): **Worktree (recomendada)** — aísla esta sesión de cualquier otra corriendo en paralelo en la raíz o en otro worktree (elimina la clase de colisión de #1908 y la narrada en #1942); a cambio, requiere un setup propio (`pnpm install` + `pnpm run config`, `node_modules` propio). **Raíz** — sin setup adicional, reusa lo ya instalado; queda expuesta a colisión si hay otra sesión activa en la raíz. La opción **"Other"** (automática) cubre cualquier instrucción libre distinta de estas dos.

### Mecánica de creación (Fase 1, modo worktree)

1. `git fetch origin`.
2. `git worktree add .claude/worktrees/<number> -b feat/<number>-<kebab> origin/develop`. Si la Fase 0 detectó una rama `feat/<number>-*` ya existente en la raíz sin worktree propio (sesión previa a #1942, o modo raíz elegido antes), adjuntar el worktree a esa rama en vez de crear una nueva: `git worktree add .claude/worktrees/<number> feat/<number>-<kebab>` (sin `-b`).
3. Cambiar la sesión al worktree con la herramienta `EnterWorktree` del harness (`path: .claude/worktrees/<number>`). Desde acá el cwd de la sesión —y el de cualquier subagente delegado— ya es el worktree.
4. Setup de dependencias: `pnpm install` seguido de `pnpm run config` (genera `src/app/environments/environment.ts` y `.env`; el hook `postinstall` ya invoca `pnpm run config`, pero se corre explícito para no depender de que dispare en todos los entornos).
5. Reportar al usuario: número, título, rama y **ruta del worktree**.

En modo raíz, el flujo de Fase 1 queda **igual que hoy**.

### Ajustes transversales en modo worktree

- **Diffs y rev-list contra `origin/develop`, no `develop` local.** La `develop` local del worktree no se actualiza sola durante la sesión y puede quedar stale frente a merges que ocurren en paralelo en otras sesiones. Toda comparación de rango — la señal de commits de la Fase 0, el diff que exploran los subagentes para decidir qué referencias cargar, el diff final que revisa `code-reviewer` — usa `origin/develop` como base.
- **Gates de Nx con `NX_NO_CLOUD=true NX_DAEMON=false`.** En Windows, el daemon de Nx y el cliente de Nx Cloud crashean en el teardown de targets corridos desde un worktree — el target reporta "Successfully ran" y el proceso igual sale con código de error (falso rojo); el crash de Nx Cloud además puede pisar el cache compartido (`.nx/cache/cloud/`) del repo principal si hay corridas paralelas. Anteponer ambas variables a **todo** `pnpm <gate>` de Nx corrido desde el worktree: `NX_NO_CLOUD=true NX_DAEMON=false pnpm lint`, y así con `test`, `build`, `test:e2e`, `storybook`, `stylelint`.
- **Typecheck vía `tsc` directo, no `pnpm typecheck`.** `pnpm typecheck` (`nx typecheck`) puede servir un resultado **stale** del daemon aun con `--skip-nx-cache` y aun con las variables de arriba. En modo worktree, correr `pnpm exec tsc -p tsconfig.typecheck.json --noEmit` directamente.
- **Node v26 local (si aplica):** los wrappers de Nx de `pnpm test` y `pnpm storybook:build` pueden reportar "Failed tasks" por un crash de teardown de `libuv` **después** de terminar bien (el proyecto pide `engines: ^22.22.3`). Si un gate de test/storybook reporta rojo pero el log previo dice que el target corrió exitosamente, verificar el resultado real con `npx vitest run` directo antes de reportarlo como fallo.
- **Delegación a subagentes — nota de Modo worktree.** Al delegar en `plan-writer`, `documentation-writer`, `code-reviewer` o `security-auditor` (Fases 2, 3 y 4), agregar a la instrucción de la delegación:

  > "Esta sesión corre en el worktree `.claude/worktrees/<number>` (cwd ya resuelto — no hace falta `cd`). Tu base de diff es `origin/develop`, no `develop` local. Los archivos generados/gitignoreados del setup (`src/app/environments/environment.ts`, `.env`) sí existen tras `pnpm install` + `pnpm run config` aunque no estén versionados — antes de reportar una ruta como faltante, verificá con `git check-ignore <ruta>`."

  Sin esta nota, un subagente puede leer del checkout principal en vez del worktree, diffear contra un `develop` local stale, o marcar como bloqueante un archivo generado que sí existe.

### Ciclo de vida

- El worktree se **mantiene** al menos hasta que el PR de la Fase 6 mergea — permite reanudar la sesión (Fase 0 lo detecta vía `git worktree list` y reingresa).
- El **merge ocurre fuera de esta sesión** (evento humano posterior en GitHub); el skill no lo espera ni lo automatiza.
- **Limpieza:** cuando la Fase 0 resuelve entorno worktree porque ya existía (reanudación), evalúa además `gh pr list --head feat/<number>-<kebab> --state merged`. Si hay un PR mergeado, pausa con `AskUserQuestion` (`header`: `Limpieza`; `question`: "El PR de este issue ya mergeó. ¿Removemos el worktree?"; opciones **Limpiar (recomendada)** — `git worktree remove .claude/worktrees/<number>` + `git branch -d feat/<number>-<kebab>`; **Mantener** — dejarlo como está y agregar la marca `<!-- worktree: mantener -->` al final de `workspace/<number>/PLAN.md` para no repreguntar en futuras reanudaciones (la señal de limpieza se saltea si esa marca existe); "Other" cubre cualquier instrucción distinta). Cualquiera sea la respuesta, la sesión termina ahí — no hay fase siguiente que ejecutar sobre un issue ya mergeado.
- Los artefactos `workspace/<number>/PLAN.md` / `CODE_REVIEW.md` / `SECURITY_REVIEW.md` **viven dentro del worktree** en modo worktree. Una sesión nueva que reingresa vía `EnterWorktree` los encuentra ahí sin buscarlos en la raíz.

---

## Fase 2 — Plan

**Propósito:** producir un plan de implementación detallado para aprobación.

1. Delegar al agente **`plan-writer`** pasándole la URL del issue, su descripción, el nombre de rama y la ruta de salida completa (`workspace/<number>/PLAN.md`). En modo worktree, adjuntar la nota de delegación de [Modo worktree](#modo-worktree) → "Ajustes transversales". Si la Fase 0 reanudó acá con un plan ya escrito, saltear la delegación y pasar directo al resumen.
2. El plan-writer produce `workspace/<number>/PLAN.md`.
3. Presentar un resumen breve al usuario (objetivo, enfoque, archivos afectados, decisiones clave).

**⏸ PAUSA — decisión vía `AskUserQuestion`.**

- `question`: "El plan está en `workspace/<number>/PLAN.md`. ¿Cómo seguimos?"
- `header`: `Plan`
- `options` (la recomendada primero): **Aprobar** — el plan queda tal cual y se avanza a la Fase 3; **Dar feedback** — el orquestador pide el texto del feedback a continuación. La herramienta exige entre 2 y 4 opciones explícitas — "Aprobar" no puede ir sola. La opción **"Other"** (automática) transporta el feedback directamente en un solo paso y es la vía preferida cuando el usuario ya sabe qué cambiar.

Ramificación tras la respuesta:

- **Aprobar** → avanzar a la Fase 3.
- **Dar feedback** → pedir el texto del feedback al usuario y tratarlo igual que Other.
- **Other** (feedback) → reenviar el texto recibido **a la misma Task del `plan-writer`** delegada en el paso 1 — conserva toda la exploración en contexto — para que revise `workspace/<number>/PLAN.md` en función del feedback y reescriba el plan en el mismo archivo. Nunca editar `PLAN.md` a mano desde el orquestador ni relanzar un `plan-writer` de cero mientras la Task siga disponible. Repetir la pausa tras cada revisión, iterando hasta un "Aprobar". Si la Task original ya no está disponible (p. ej. reanudación vía Fase 0 en una sesión nueva), delegar en un `plan-writer` nuevo pasándole el `PLAN.md` existente más el feedback — revisa sobre lo escrito, no re-explora de cero.

No avanzar a la Fase 3 sin una respuesta "Aprobar".

---

## Fase 3 — Implement

**Propósito:** ejecutar el plan con commits atómicos.

1. Ejecutar los pasos de `workspace/<number>/PLAN.md` en orden. Si la Fase 0 reanudó acá, saltear los pasos ya marcados `[x]`.
2. Un commit atómico por unidad lógica de trabajo. Tras cada commit, marcar `[x]` el checkbox del paso correspondiente en `workspace/<number>/PLAN.md`.
3. **Scan de impacto en documentación.** Si el cambio toca tipos, schemas de Sanity/Zod, contratos de API o terminología de dominio, delegar en el agente **`documentation-writer`** la actualización de `docs/`, `CLAUDE.md` y `.claude/references/` (en modo worktree, adjuntar la nota de delegación de [Modo worktree](#modo-worktree) → "Ajustes transversales"), en el **mismo** commit/PR — lo exige la sección [Scan de impacto en documentación](../../../CLAUDE.md#scan-de-impacto-en-documentación) de `CLAUDE.md`. Si el cambio no toca nada de eso, saltear el paso.
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
   - **En modo worktree**, anteponer `NX_NO_CLOUD=true NX_DAEMON=false` a todo gate de Nx y reemplazar `pnpm typecheck` por `pnpm exec tsc -p tsconfig.typecheck.json --noEmit` — ver [Modo worktree](#modo-worktree) → "Ajustes transversales" (evita falsos rojos de teardown y resultados stale del daemon).
   - **Lanzalos concurrentemente**, no uno tras otro: son independientes entre sí y así los corre CI (todos los jobs cuelgan de `setup` y van en runners separados). En serie tardan la **suma**; en paralelo, lo que tarde el más lento. Medido en #1850: 105s → 29s.
   - Si alguno falla: reportar cuál, diagnosticar, arreglar, commitear el fix (reglas de Fase 3) y re-correr **solo el que falló** mientras el resto sigue verde; re-correr todo solo si el fix toca superficie compartida.
2. **Determinar si el diff toca superficie de seguridad.** La lista de disparadores es la sección **"Cuándo correr"** del agente `security-auditor`: `src/api/**` (endpoints, GROQ, mappers), manejo de contenido externo (PortableText/HTML del CMS, `bypassSecurityTrust*`, fetch a servicios externos, `localStorage`), variables de entorno / secrets / config de Sanity o Clarity, y dependencias (`package.json` / `pnpm-lock.yaml`). Un diff que no toca nada de eso —solo documentación, estilos o UI sin datos externos— **no** la amerita; el auditor también puede invocarse a demanda si surge una preocupación puntual.
3. **Delegar las reviews — en paralelo si corren ambas.** Si el diff toca superficie de seguridad, lanzar al **`security-auditor`** y al **`code-reviewer`** en el **mismo turno** (ambas delegaciones en una única respuesta, igual que los gates del paso 1): sus reviews son independientes y no comparten archivo de salida. Si no la toca, delegar solo al `code-reviewer`. Cada delegación incluye la ruta de salida completa del agente (ver paso 4); en modo worktree, adjuntar además la nota de delegación de [Modo worktree](#modo-worktree) → "Ajustes transversales" a cada Task delegada. En ambos casos el `code-reviewer` revisa todos los cambios de la rama vs. `develop` (u `origin/develop` en modo worktree) y recibe **el resultado observado de los gates del paso 1** (qué corriste, con qué resultado, y cuáles omitiste por no aplicar al diff) — sin ese dato los vuelve a correr, que es la parte más cara de la review.
4. Cada agente escribe su propio archivo: el `code-reviewer` en `workspace/<number>/CODE_REVIEW.md` y el `security-auditor` en `workspace/<number>/SECURITY_REVIEW.md`.
5. Presentar la tabla de hallazgos al usuario (Críticos, Advertencias, Sugerencias), combinando ambos archivos cuando corrió el auditor, e indicando si corrió o por qué no correspondía. Al combinar, cada hallazgo se cita con el número tal como aparece en su documento de origen: los de seguridad llevan el prefijo `S` (p. ej. `S3`) y así no se confunden con los del `code-reviewer` (sin prefijo).

**⏸ PAUSA — decisión vía `AskUserQuestion`.**

Antes de armar las `options`, revisar la columna **Estado** de los Críticos en ambos archivos de hallazgos. Un Crítico tiene **disposición** si su Estado es _Corregido_, _Descartado_, _Diferido_ (con el issue ya creado tras confirmación — política de la Fase 5 paso 4) o _No se corrige_ confirmado explícitamente por el usuario; _Detectado_ y _En progreso_ son **sin disposición** (vocabulario canónico: `code-reviewer.md` → "Estados de la columna 'Estado'").

- `question`: "Review completa en `workspace/<number>/CODE_REVIEW.md` (y `workspace/<number>/SECURITY_REVIEW.md` si corrió el auditor). ¿Cómo seguimos?" — incluir el conteo de hallazgos por severidad y, si hay Críticos sin disposición, cuántos son y que "Ship" no está disponible hasta resolverlos.
- `header`: `Review`
- `options` (la recomendada primero), según el estado de los Críticos:
  - **Sin Críticos, o todos con disposición:** **Proceder** — ir a la Fase 5 y abordar los hallazgos por prioridad; **Ship** — no hay nada bloqueante: saltar la Fase 5 e ir directo a la Fase 6.
  - **Algún Crítico sin disposición:** **Proceder** — ir a la Fase 5 y abordarlos; **Disponer y ship** — resolver la disposición de cada Crítico abierto ahí mismo (Diferir —proponiendo el issue y esperando confirmación—, Descartar o No se corrige, actualizando su Estado) y recién entonces saltar a la Fase 6. **"Ship" a secas no se ofrece en esta rama.**
- La opción **"Other"** (automática) cubre instrucciones libres — p. ej. abordar solo un subconjunto de hallazgos, descartar las sugerencias o diferir alguno: el orquestador ejecuta la Fase 5 según lo indicado, respetando igualmente la precondición de disposición para shipear.

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

**Modo worktree:** el worktree **no se limpia en esta fase** — se mantiene hasta que el PR mergee, para permitir reanudar la sesión (ver [Modo worktree](#modo-worktree) → "Ciclo de vida"). Push y creación del PR corren igual, con cwd ya resuelto al worktree.

1. `git push -u origin feat/<number>-<kebab>`.
2. Crear el PR con `gh pr create` (base `develop`, milestone del issue):
   - **Precondición:** ningún Crítico de `workspace/<number>/CODE_REVIEW.md` ni `workspace/<number>/SECURITY_REVIEW.md` sin **disposición** (definida en la pausa de la Fase 4). Si lo hay, no crear el PR: volver a la Fase 5, o a la vía "Disponer y ship" de la Fase 4.
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
   | Entorno             | `worktree` (`.claude/worktrees/<number>`) / `raíz`                |
   | CI local            | <Verde / Rojo — ver <motivo>>                                     |
   ```

   - `Commits` cuenta solo los de la rama (`git rev-list --count <base>..HEAD`, con `<base>` = `develop` en modo raíz y `origin/develop` en modo worktree).
   - `CI local` reporta el resultado de la última corrida de los gates.

---

## Restricciones (todas las fases)

- Usar `pnpm <script>` para ejecutar tareas; no construir variantes de `nx` directas a mano.
- Nunca prefijar comandos git con `cd` — el working dir ya está resuelto (raíz del repo, o del worktree según el entorno).
- Nunca abrir el PR antes de que pasen los gates de CI y haya corrido el `code-reviewer`.
- Nunca abrir el PR sin el keyword de cierre (`Closes #<issue>`) en el cuerpo enlazando el issue de origen.
- Nunca abrir el PR con un Crítico sin disposición confirmada — definición en la pausa de la Fase 4; verificación en la Fase 6 paso 2.
- En modo worktree (ver [Modo worktree](#modo-worktree)), el cwd de la sesión y de los subagentes delegados ya está resuelto al worktree tras `EnterWorktree`: la regla anti-`cd` sigue rigiendo igual, y toda comparación de rango git usa `origin/develop` como base, nunca `develop` local.
- Nunca saltear la fase Plan — aun cambios triviales se benefician de un plan breve.
- Aplican siempre las reglas de [`.claude/references/coding-agent-policies.md`](../../references/coding-agent-policies.md): sin framings de mantenedor único, sin "salteá el test por ser chico" (salvo cambios solo-doc), sin diferir la review más allá de abrir el PR, y sin comentarios redundantes (Sección 3).
