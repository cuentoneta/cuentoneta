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

Ejemplo: `/issue-workflow https://github.com/cuentoneta/cuentoneta/issues/<id>`

---

## Fase 0 — Detección de estado

**Propósito:** detectar el entorno de trabajo (worktree o raíz) y el trabajo previo sobre el issue, y reanudar en la fase que corresponda en vez de re-setupear.

### Paso 0 — Entorno (worktree o raíz)

Corre siempre, antes de cualquier otra señal:

1. ¿La invocación actual o una directiva vigente de la sesión declaró el entorno ("en un worktree", "en la raíz")? Si sí, usarlo — la declaración tiene prioridad. Si la declaración pide **raíz** pero `git worktree list` ya lista `.claude/worktrees/<number>`, avisar el conflicto y confirmar antes de seguir: la rama y los artefactos del issue pueden vivir en ese worktree.
2. Sin declaración: si `git worktree list` ya lista `.claude/worktrees/<number>`, el entorno es **worktree** — reingresar con `EnterWorktree` (`path: .claude/worktrees/<number>`), sin preguntar. Continuar con "Señales de reanudación" desde ahí.
3. Sin declaración ni worktree previo: pausar con `AskUserQuestion` — ver [Modo worktree](#modo-worktree) → "Cuándo se activa". La respuesta fija el entorno para el resto de la sesión (Fase 1 en adelante).
4. Si el entorno resuelto es worktree y el worktree ya existía (pasos 1-2): evaluar además la señal de limpieza `gh pr list --head feat/<number>-<kebab> --state merged` — ver [Modo worktree](#modo-worktree) → "Ciclo de vida".

### Datos del issue

La Fase 0 corre en **toda** invocación (fresca o reanudación), así que es acá —no en la Fase 1, que se saltea al reanudar a la Fase 2/4/5— donde se recolectan **una sola vez** los datos del issue que las fases posteriores necesitan. No se persisten en `workspace/`: se re-fetchean en cada invocación.

1. Datos base: `gh issue view <issue-url> --json number,title,body,milestone,labels` — número, título, **body** (la descripción que la Fase 2 le pasa al `plan-writer`), `milestone` (objeto → `.milestone.title`) y `labels` (array → `.labels[].name`).
2. Parent epic (para la línea `Parte de #<epic>.` de la Fase 6): vía GraphQL, que es la vía confiable —el campo `.parent` del endpoint REST `repos/{owner}/{repo}/issues/{n}` devuelve `null` (no poblado)—:

   ```bash
   gh api graphql -f query='query { repository(owner:"cuentoneta", name:"cuentoneta") { issue(number:<number>) { parent { number } } } }' --jq '.data.repository.issue.parent.number // empty'
   ```

   El `// empty` garantiza salida **vacía** (no el literal `null`) cuando el issue no tiene parent, para no generar un `Parte de #null.` en la Fase 6.

Estos datos alimentan la Fase 1 (reporte + nombre de rama), la Fase 2 (body → `plan-writer`) y el cierre de la Fase 3, que abre el borrador con ellos (milestone → `--milestone`; labels → `--label`; parent → `Parte de #<epic>.`). La Fase 6 solo verifica que estén.

### Base de la rama (apilado)

Casi todo issue ramifica desde `develop`, pero un **PR apilado** —un issue que depende de una rama todavía sin mergear— ramifica desde esa rama. La base se resuelve **una vez** acá (necesita el body de "Datos del issue" y corre antes del `rev-list` de las señales) y la consumen la Fase 1 (checkout), las señales de reanudación, la delegación a subagentes (Fases 2/4/5) y la Fase 6 (`--base`). Dos nombres:

- **`<rama-base>`** — el nombre de la rama base. Default `develop`; apilado ⇒ `feat/<X>-<kebab>`.
- **`<base>`** — la ref resuelta para todo diff/rev-list: `<rama-base>` en modo raíz, `origin/<rama-base>` en modo worktree.

Resolución por precedencia:

1. **Declaración explícita** en la invocación o una directiva de sesión ("apilado sobre #<X>", "base <rama>") → usarla.
2. **Señal en el body** del issue (menciona depender de / estar apilado sobre #<X>): resolver la rama del issue base con `gh pr list --search "#<X> in:title" --state open --json number,headRefName` (una base sin mergear tiene PR abierto) y **confirmar** con `AskUserQuestion` (`header`: `Base`; `question` que nombre la rama base y su PR abierto; `options` recomendada primero: **Apilar sobre `<rama-base>`** — pasa a ser base del checkout/diff/PR; **Base `develop`** — ignorar la señal; "Other" cubre instrucciones libres).
3. **Sin declaración ni señal** → `develop`, sin pausa.

Con `develop`, `<base>` resuelve a `develop`/`origin/develop` **igual que sin apilado**. La base se re-deriva en cada invocación (no se persiste): si la rama base mergeó entre corridas, la próxima resolución cae a `develop` sola.

### Señales de reanudación

Las sondas van en **dos batches**, no en una llamada por sonda. La línea divisoria está donde está la dependencia real: `git worktree list`, `git branch` y `git rev-list` operan sobre el repo compartido y `gh` sobre el remoto —ninguna depende del cwd—, pero la existencia de los artefactos **sí** depende, porque en modo worktree viven adentro del worktree.

Tres reglas que preservan el diagnóstico:

- **Separar con `;`, nunca con `&&`.** Una sonda que falla —`gh` sin red, por caso— no debe ocultar el resultado de las demás. Cada tramo lleva un marcador de sección para que la salida siga siendo atribuible.
- **El conteo de `[ ]` vs. `[x]` de `PLAN.md` no entra al comando:** se resuelve con la herramienta de búsqueda **en el mismo turno** que el batch 2.
- **La sonda de apilado no se batchea:** depende del body que trae el batch 1, y solo corre ante señal en el body.

Relevar con el número de issue extraído de la URL:

**Batch 1 — antes de `EnterWorktree`.** Junto con los "Datos del issue" de arriba, en una sola llamada:

```bash
git worktree list; echo "--- rama ---"; git branch --list "feat/<number>-*"
echo "--- issue ---"; gh issue view <issue-url> --json number,title,body,milestone,labels
echo "--- parent ---"; gh api graphql -f query='…' --jq '.data.repository.issue.parent.number // empty'
```

**Batch 2 — después de `EnterWorktree`**, con la rama y `<base>` ya resueltas:

```bash
ls workspace/<number> 2>/dev/null; echo "--- commits ---"; git rev-list --count <base>..feat/<number>-<kebab>
echo "--- pr ---"; gh pr list --head feat/<number>-<kebab> --state open --json number,isDraft,url
echo "--- merged ---"; gh pr list --head feat/<number>-<kebab> --state merged --json number
echo "--- worktrees ---"; pnpm worktrees:sweep
```

Lo que cada sonda responde:

1. `git branch --list 'feat/<number>-*'` — ¿existe la rama?
2. `workspace/<number>/PLAN.md` — ¿existe el plan? Si existe, contar sus marcadores de paso `[ ]` vs. `[x]`.
3. `workspace/<number>/CODE_REVIEW.md` y/o `workspace/<number>/SECURITY_REVIEW.md` — ¿existe la review?
4. Si la rama existe: `git rev-list --count <base>..<rama>` — ¿cuántos commits tiene sobre la base? `<base>` es `<rama-base>` en modo raíz y `origin/<rama-base>` en modo worktree, con `<rama-base>` resuelta en "Base de la rama" (default `develop`).
5. Si la rama existe: `gh pr list --head feat/<number>-<kebab> --state open --json number,isDraft,url` — ¿hay un PR abierto de esa rama, y en qué estado?

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

Si además existe un **PR abierto** para la rama (señal 5), el estado del PR distingue dos situaciones muy distintas:

- **`isDraft: false`** → el flujo completó la **Fase 6**: reportar la URL y pausar. El trabajo restante, si lo hay, es abordar feedback de ese PR, no re-ejecutar el flujo.
- **`isDraft: true`** → el flujo llegó al **cierre de la Fase 3** y quedó en Fase 4 o 5. La fase sugerida la sigue dando la tabla de artefactos de arriba; el borrador **no** la overridea. Reportar su URL y que la implementación ya está pusheada.

El borrador mejora la reanudación: una sesión que muere en Fase 4 deja hoy el trabajo solo en el worktree local, y con el borrador queda pusheado y visible.

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

**Propósito:** crear una rama de feature limpia desde `<rama-base>` actualizada (default `develop`, ver Fase 0 → "Base de la rama") — en el entorno resuelto por la Fase 0 (worktree o raíz).

1. Usar el número y el título ya recolectados en la Fase 0 → "Datos del issue" (no re-fetchear).
2. Derivar el nombre de rama (convención del repo):
   - Formato: **`feat/<number>-<titulo-en-kebab-case>`**.
   - Transformación: minúsculas, espacios y no-alfanuméricos → guiones, colapsar guiones consecutivos, recortar guiones de borde, truncar a ~60 caracteres en un límite de palabra.
3. **Modo raíz**:
   - **Precondición — working tree limpio:** `git status --short`. Si el árbol no está limpio, no hacer checkout: pausar con `AskUserQuestion` (`header`: `Working tree`; `question` que enumere los archivos sucios; opciones —recomendada primero— **Detener** —el usuario commitea/stashea/descarta y reinvoca— / **Stashear y seguir** —`git stash` y continuar—; "Other" cubre instrucciones libres). Solo aplica en modo raíz: en modo worktree, `git worktree add … <base>` crea un checkout nuevo sin tocar el árbol principal.
   - `git checkout <rama-base> && git pull` para asegurar la base actualizada.
   - `git checkout -b feat/<number>-<kebab>`. Si la Fase 0 detectó la rama existente y el usuario eligió **rehacer**, confirmar la reutilización y usar `git checkout feat/<number>-<kebab>` (sin `-b`).
4. **Modo worktree:** seguir [Modo worktree](#modo-worktree) → "Mecánica de creación" (`git fetch origin`, `git worktree add`, `EnterWorktree`, `pnpm install` + `pnpm run config`).
5. Reportar al usuario: número, título, **milestone**, **parent epic** (o "sin epic"), nombre de rama, la **base** cuando `<rama-base> ≠ develop` (checkout apilado) y, en modo worktree, la ruta del worktree.

---

## Modo worktree

**Propósito:** todo el flujo (implementación, gates, subagentes, ship) puede correr en un **worktree propio** bajo `.claude/worktrees/<number>` en vez del working tree principal, para eliminar colisiones con sesiones paralelas (root u otros worktrees). Esta sección centraliza la mecánica; las Fases 0, 1, 2, 3, 4 y 6 la referencian en vez de repetirla.

### Cuándo se activa

- **Declarado:** si la invocación actual o una directiva vigente de la sesión ya dice dónde trabajar ("en un worktree", "en la raíz"), se respeta — la declaración tiene prioridad. Si pide raíz habiendo un worktree del issue, la Fase 0 avisa el conflicto y confirma antes de seguir.
- **Reanudación:** sin declaración, si `git worktree list` ya lista un worktree para `.claude/worktrees/<number>`, el entorno es worktree — no se pregunta, se reingresa (Fase 0, Paso 0).
- **Sin declarar y sin worktree previo:** Fase 0 pausa con `AskUserQuestion`:
  - `question`: "¿Dónde corremos el flujo para este issue: en un worktree aislado o en la raíz del repo?"
  - `header`: `Entorno`
  - `options` (recomendada primero): **Worktree (recomendada)** — aísla esta sesión de cualquier otra corriendo en paralelo en la raíz o en otro worktree (un checkout externo a mitad de sesión puede invalidar gates o desviar commits a otra rama); a cambio, requiere un setup propio (`pnpm install` + `pnpm run config`, `node_modules` propio). **Raíz** — sin setup adicional, reusa lo ya instalado; queda expuesta a colisión si hay otra sesión activa en la raíz. La opción **"Other"** (automática) cubre cualquier instrucción libre distinta de estas dos.

### Mecánica de creación (Fase 1, modo worktree)

1. `git fetch origin`.
2. `git worktree add .claude/worktrees/<number> -b feat/<number>-<kebab> <base>`, con `<base> = origin/<rama-base>` (default `origin/develop`, ver Fase 0 → "Base de la rama"). Si es un apilado (`<rama-base> ≠ develop`), tras el `git fetch origin` del paso 1 confirmar que la base existe con `git rev-parse --verify <base>`; si falla, avisar en vez de crear el worktree contra una ref inexistente (una base apilada está pusheada a origin porque tiene un PR abierto). Si la Fase 0 detectó una rama `feat/<number>-*` ya existente en la raíz sin worktree propio (creada por una sesión previa en modo raíz), adjuntar el worktree a esa rama en vez de crear una nueva: `git worktree add .claude/worktrees/<number> feat/<number>-<kebab>` (sin `-b`).
3. Cambiar la sesión al worktree con la herramienta `EnterWorktree` del harness (`path: .claude/worktrees/<number>`). Desde acá el cwd de la sesión —y el de cualquier subagente delegado— ya es el worktree.
4. Setup de dependencias: `pnpm install` seguido de `pnpm run config` (genera `src/app/environments/environment.ts` y `.env`; el hook `postinstall` ya invoca `pnpm run config`, pero se corre explícito para no depender de que dispare en todos los entornos).
5. Reportar al usuario los mismos campos que la Fase 1 paso 5, más la **ruta del worktree**.

En modo raíz, el flujo de Fase 1 queda **igual que hoy**.

### Ajustes transversales en modo worktree

- **Diffs y rev-list contra `<base>` (`origin/<rama-base>`, default `origin/develop`), no la rama base local.** La rama base local del worktree no se actualiza sola durante la sesión y puede quedar stale frente a merges que ocurren en paralelo en otras sesiones. Toda comparación de rango — la señal de commits de la Fase 0, el diff que exploran los subagentes para decidir qué referencias cargar, el diff final que revisa `code-reviewer` — usa `<base>` como base.
- **Gates de Nx con `NX_DAEMON=false`.** En Windows, el daemon de Nx crashea en el teardown de targets corridos desde un worktree — el target reporta "Successfully ran" y el proceso igual sale con código de error (falso rojo). Anteponer la variable a **todo** `pnpm <gate>` de Nx corrido desde el worktree: `NX_DAEMON=false pnpm lint`, y así con `test`, `build`, `test:e2e`, `storybook`, `stylelint`.
- **Typecheck vía `tsc` directo, no `pnpm typecheck`.** `pnpm typecheck` (`nx typecheck`) puede servir un resultado **stale** del daemon aun con `--skip-nx-cache` y aun con las variables de arriba. En modo worktree, correr `pnpm exec tsc -p tsconfig.typecheck.json --noEmit` directamente.
- **Node v26 local (si aplica):** los wrappers de Nx de `pnpm test` y `pnpm storybook:build` pueden reportar "Failed tasks" por un crash de teardown de `libuv` **después** de terminar bien (el proyecto pide `engines: ^24.15.0`). Si un gate de test/storybook reporta rojo pero el log previo dice que el target corrió exitosamente, verificar el resultado real con `npx vitest run` directo antes de reportarlo como fallo.
- **Delegación a subagentes — nota de Modo worktree.** Al delegar en `plan-writer`, `domain-model-advisor`, `architecture-advisor`, `documentation-writer`, `code-reviewer`, `security-auditor` o `test-generator` (Fases 2, 3, 4 y 5), agregar a la instrucción de la delegación:

  > "Esta sesión corre en el worktree `.claude/worktrees/<number>` (cwd ya resuelto — no hace falta `cd`). Tu base de diff es `<base>` (la ref resuelta en la Fase 0, default `origin/develop`), no la rama base local. Los archivos generados/gitignoreados del setup (`src/app/environments/environment.ts`, `.env`) sí existen tras `pnpm install` + `pnpm run config` aunque no estén versionados — antes de reportar una ruta como faltante, verificá con `git check-ignore <ruta>`."

  Sin esta nota, un subagente puede leer del checkout principal en vez del worktree, diffear contra una rama base local stale, o marcar como bloqueante un archivo generado que sí existe.

### Ciclo de vida

- El worktree se **mantiene** al menos hasta que el PR de la Fase 6 mergea — permite reanudar la sesión (Fase 0 lo detecta vía `git worktree list` y reingresa).
- El **merge ocurre fuera de esta sesión** (evento humano posterior en GitHub); el skill no lo espera ni lo automatiza.
- **Barrido, en cada sesión.** El batch 2 de la Fase 0 corre `pnpm worktrees:sweep`, que reporta los worktrees registrados cuya rama ya mergeó y los directorios huérfanos que quedaron sin registro. Es **O(1) por sesión** y limpia lo que dejó cualquiera, no solo la propia — a diferencia de la limpieza al reanudar, que solo cubre el caso en que alguien vuelve sobre un issue ya mergeado, el menos frecuente cuando todo sale bien. Monitorear el PR hasta el merge no sirve como alternativa: el monitor vive dentro de la sesión y muere con ella, y el merge es un evento humano posterior.

  Si el reporte trae candidatos, **pausar con `AskUserQuestion`** (`header`: `Worktrees`; `question` con el conteo de mergeados y huérfanos, y cuáles conservan artefactos; `options`: **Limpiar** — archivar artefactos y remover; **Omitir** — seguir sin tocar nada, que es lo recomendable si el usuario está en medio de otra cosa; "Other" para instrucciones libres). Sin candidatos, el barrido no interrumpe: ocupa una línea.

  **Ningún borrado ocurre sin esa confirmación.** El script remueve worktrees registrados, pero **nunca** borra un directorio huérfano: los enumera con el comando exacto, porque pueden conservar el `workspace/<number>/` de una sesión y el repo prohíbe borrar artefactos autorados aunque estén gitignoreados.

- **Limpieza al reanudar:** cuando la Fase 0 resuelve entorno worktree porque ya existía (reanudación), evalúa además `gh pr list --head feat/<number>-<kebab> --state merged`. Si hay un PR mergeado, pausa con `AskUserQuestion` (`header`: `Limpieza`; `question`: "El PR de este issue ya mergeó. ¿Removemos el worktree?"; opciones **Limpiar (recomendada)** — `git worktree remove .claude/worktrees/<number>` + `git branch -d feat/<number>-<kebab>`; **Mantener** — dejarlo como está y agregar la marca `<!-- worktree: mantener -->` al final de `workspace/<number>/PLAN.md` para no repreguntar en futuras reanudaciones (la señal de limpieza se saltea si esa marca existe); "Other" cubre cualquier instrucción distinta). Cualquiera sea la respuesta, la sesión termina ahí — no hay fase siguiente que ejecutar sobre un issue ya mergeado.
- Los artefactos `workspace/<number>/PLAN.md` / `CODE_REVIEW.md` / `SECURITY_REVIEW.md` **viven dentro del worktree** en modo worktree. Una sesión nueva que reingresa vía `EnterWorktree` los encuentra ahí sin buscarlos en la raíz.

---

## Fase 2 — Plan

**Propósito:** producir un plan de implementación detallado para aprobación.

1. **Determinar si el issue amerita asesoría previa de dominio o de arquitectura** (mismo patrón con el que la Fase 4 decide si convoca al `security-auditor`, pero _antes_ de planificar). A partir del alcance del issue (el body de la Fase 0 + una exploración inicial):
   - **`domain-model-advisor`** si el issue crea o modifica entidades de dominio o value objects (`@models/*`, `src/models/`), mappers del ACL (`src/api/_utils/`), queries GROQ (`src/api/_queries/`) o tipos de dominio compartidos.
   - **`architecture-advisor`** solo ante un cambio **estructuralmente significativo**: módulo nuevo bajo `src/api/modules/<dominio>/`, feature/provider/interfaz `-api` nuevo en el frontend, bounded context nuevo, o cambio de límites de módulo / dirección de dependencias. Un ajuste localizado —UI, copy, estilos, un campo puntual— **no** lo amerita: el `plan-writer` ya carga las mismas referencias según el diff y su pasada basta.
2. **Delegar en paralelo los advisors que matcheen** (ambas delegaciones en el mismo turno si aplican los dos; son independientes y devuelven su evaluación como **texto**, no como archivo — no tienen `Write`). En modo worktree, adjuntar la nota de delegación de [Modo worktree](#modo-worktree) → "Ajustes transversales". Capturar su salida.
3. Delegar al agente **`plan-writer`** pasándole la URL del issue, su descripción (el **body** recolectado en la Fase 0 → "Datos del issue"), el nombre de rama, la ruta de salida completa (`workspace/<number>/PLAN.md`) y **la evaluación de los advisors que corrieron en el paso 2**. Los advisors los corre el orquestador —no el `plan-writer`, que no puede delegar en subagentes— y su aporte entra en el prompt del plan. En modo worktree, adjuntar la nota de delegación. Si la Fase 0 reanudó acá con un plan ya escrito, saltear los pasos 1-3 (los advisors ya corrieron y su aporte vive en el plan) y pasar directo al resumen.

   **Excepción — escribir el plan inline.** El orquestador puede redactar `PLAN.md` él mismo, sin delegar, cuando se cumplen **las cuatro** condiciones:

   1. El alcance declarado del issue no toca `src/**` ni `cms/**` — solo `.claude/**`, `docs/**` o configuración de tooling sin efecto en runtime.
   2. Ningún advisor del paso 1 matcheó.
   3. El issue enumera sus archivos de alcance y el orquestador **ya los leyó en esta sesión**. Es la condición que hace real el ahorro: si hay que abrirlos ahora, el subagente los lee en su propia ventana y delegar sale más barato.
   4. El orquestador ya cargó las mismas referencias que carga el `plan-writer` para ese tipo de cambio.

   El artefacto y la pausa de aprobación **no cambian**: el plan se escribe igual en `workspace/<number>/PLAN.md` y se aprueba igual. Lo que se pierde es la exploración independiente —un segundo par de ojos que no arrastra los supuestos de la sesión—, así que el plan deja constancia de que se escribió inline. Ante la menor duda sobre si una condición se cumple, se delega: el costo de delegar de más es un spin-up, y el de delegar de menos es un plan escrito sobre supuestos no verificados.

4. El plan-writer produce `workspace/<number>/PLAN.md`.
5. Presentar un resumen breve al usuario (objetivo, enfoque, archivos afectados, decisiones clave).

**⏸ PAUSA — decisión vía `AskUserQuestion`.**

- `question`: "El plan está en `workspace/<number>/PLAN.md`. ¿Cómo seguimos?"
- `header`: `Plan`
- `options` (la recomendada primero): **Aprobar** — el plan queda tal cual y se avanza a la Fase 3; **Dar feedback** — el orquestador pide el texto del feedback a continuación. La herramienta exige entre 2 y 4 opciones explícitas — "Aprobar" no puede ir sola. La opción **"Other"** (automática) transporta el feedback directamente en un solo paso y es la vía preferida cuando el usuario ya sabe qué cambiar.

Ramificación tras la respuesta:

- **Aprobar** → avanzar a la Fase 3.
- **Dar feedback** → pedir el texto del feedback al usuario y tratarlo igual que Other.
- **Other** (feedback) → reenviar el texto recibido **a la misma Task del `plan-writer`** delegada en el paso 3 — conserva toda la exploración en contexto — para que revise `workspace/<number>/PLAN.md` en función del feedback y reescriba el plan en el mismo archivo. Los advisors del paso 2 **no** se re-corren: su aporte ya está incorporado al plan. Nunca editar `PLAN.md` a mano desde el orquestador ni relanzar un `plan-writer` de cero mientras la Task siga disponible. Repetir la pausa tras cada revisión, iterando hasta un "Aprobar". Si la Task original ya no está disponible (p. ej. reanudación vía Fase 0 en una sesión nueva), delegar en un `plan-writer` nuevo pasándole el `PLAN.md` existente más el feedback — revisa sobre lo escrito, no re-explora de cero.

No avanzar a la Fase 3 sin una respuesta "Aprobar".

---

## Fase 3 — Implement

**Propósito:** ejecutar el plan con commits atómicos.

1. Ejecutar los pasos de `workspace/<number>/PLAN.md` en orden. Si la Fase 0 reanudó acá, saltear los pasos ya marcados `[x]`.
2. Un commit atómico por unidad lógica de trabajo. Tras cada commit, marcar `[x]` el checkbox del paso correspondiente en `workspace/<number>/PLAN.md`.
3. **Scan de impacto en documentación.** Si el cambio toca tipos, schemas de Sanity/Zod, contratos de API o terminología de dominio, delegar en el agente **`documentation-writer`** la actualización de `docs/`, `CLAUDE.md` y `.claude/references/` (en modo worktree, adjuntar la nota de delegación de [Modo worktree](#modo-worktree) → "Ajustes transversales"), en el **mismo** commit/PR — lo exige la sección [Scan de impacto en documentación](../../../CLAUDE.md#scan-de-impacto-en-documentación) de `CLAUDE.md`. Si el cambio no toca nada de eso, saltear el paso. El `documentation-writer` **no tiene Bash**: escribe los archivos, y el orquestador revisa el diff resultante y lo incluye en el commit de la unidad lógica correspondiente (o en uno propio si la doc es la unidad).
4. **CHANGELOG:** cuentoneta mantiene `CHANGELOG.md` **por release/versión** (no por PR), al cerrar un milestone. **No** se exige una entrada por issue en este flujo; el tracking del cambio vive en el issue + su milestone. (Esto reemplaza el gate de CHANGELOG del starter.)

### Reglas de commit

- Formato del mensaje: `[#<issue>] - <qué cambió y por qué>` (en español).
- Un commit por cambio lógico distinto (p. ej. componente nuevo + spec = un commit; una story es otro commit si es otra preocupación).
- Cada commit debe dejar el código **buildeable** (los gates de CI pasarían). Para no descubrir un commit roto recién en la Fase 4 con todo acumulado, antes de cada commit que toque código TS/runtime correr una **verificación barata** (un subconjunto rápido, **no** la suite ni el resto de gates —eso sigue siendo la Fase 4—):
  Verificación y commit van **encadenados en una sola invocación**, no en tres turnos:

  ```bash
  if out=$(pnpm exec tsc -p tsconfig.typecheck.json --noEmit 2>&1 && pnpm exec vitest related --run $(git diff --name-only --cached) 2>&1); then
    git commit -F workspace/<number>/commit-msg.txt
  else
    echo "$out"
  fi
  ```

  - **La garantía no se pierde:** el `git commit` está dentro de la rama exitosa, así que un commit roto sigue siendo imposible. Se usa `if`/`else` y no `a && b || c` porque en esa forma un fallo del propio `git commit` imprimiría el log de una verificación que estuvo verde.
  - **Silenciado en verde**, igual que la Fase 4: la verificación no vuelca nada al contexto cuando pasa. La salida de `git commit` sí queda visible — es corta y confirma el resultado.
  - **El mensaje va por archivo, nunca `-m`:** `workspace/<number>/commit-msg.txt`, dentro del namespace del issue. Los mensajes en español llevan acentuación normal y `-m` la corrompe en Windows.
  - **Sin `NX_DAEMON=false`:** son `pnpm exec` directos sobre `tsc` y `vitest`, no targets de Nx.
  - **Cuándo no aplica:** los commits **solo-doc / solo-config de tooling** (sin efecto en runtime) saltean la verificación entera y commitean directo. La cadena tampoco aplica si el staging no tiene archivos TS — `vitest related` sin entradas relevantes no debe leerse como un pase.

- Nunca mensajes no descriptivos ("WIP", "fix", "update").
- Nunca `--amend`; crear commits nuevos tras fallos de los hooks de git — hoy son dos: `pre-commit` (formato) y `commit-msg` (rechaza un mensaje que cite un identificador de hallazgo de review).
- **En modo raíz**, antes de cada commit confirmar la rama activa con `git branch --show-current` contra `feat/<number>-<kebab>`; si un subagente con Bash la cambió en el medio, re-checkoutear la rama correcta antes de commitear. En **modo worktree** se omite: `EnterWorktree` fija el cwd/rama del worktree y los subagentes lo heredan (ver [Modo worktree](#modo-worktree)).

### Cierre de la fase — PR en borrador

Terminados los pasos del plan, la fase cierra abriendo el PR **en borrador**, para que la integración continua empiece a correr mientras la Fase 4 revisa, en vez de después.

1. `git push -u origin feat/<number>-<kebab>`.
2. `gh pr create --draft` con los mismos datos que usaría la Fase 6: base `<rama-base>`, `--milestone` y `--label` recolectados en la Fase 0, título `[#<issue>] - <título del issue>`, y cuerpo con la descripción, `Closes #<issue>.`, `Parte de #<epic>.` cuando el issue tenga parent, y el aviso de apilado cuando `<rama-base> ≠ develop`. El **plan de pruebas queda como marcador**: lo completa la Fase 6, cuando ya se sabe qué se verificó.

   Dos restricciones duras del cuerpo rigen desde acá, porque acá es donde se escribe por primera vez:

   - **Termina en el plan de pruebas:** sin leyenda de atribución de agente (`🤖 Generated with …`, `Co-Authored-By: Claude …`, `Claude-Session: …`) y **sin citar un identificador de hallazgo de review** (`R<n>`, `S<n>`), que el gate `check-findings` verifica sobre el cuerpo.
   - **Enlaza su issue de origen:** el cuerpo debe contener un keyword de cierre — `Closes #<issue>` (o `Fixes`/`Resolves`). El prefijo `[#<issue>]` del título **no** crea el enlace.

Qué **no** habilita el borrador, para que no se lea como un atajo:

- **No reemplaza la review local.** La Fase 4 corre igual y completa.
- **No adelanta la Fase 6.** El PR no se marca listo acá: eso pasa recién cuando la review terminó y sus Críticos tienen disposición.
- **No cambia la precondición de merge.** Un borrador bloquea el merge por definición.

La licencia y sus tres condiciones viven en [`coding-agent-policies.md`](../../references/coding-agent-policies.md) Sección 2, que regula la review local por el **pedido de review humana** (`gh pr ready`) y no por la apertura del PR.

### No hacer en esta fase

- Pushear antes de terminar los pasos del plan (el push va en el cierre de la fase, con el borrador).
- Marcar el PR listo para review — eso es Fase 6.
- Saltear tests ante un cambio de comportamiento en runtime.
- Crear barrels (`index.ts` re-export).
- Dejar código comentado.

---

## Fase 4 — Review

**Propósito:** verificar que pasen los gates de CI y correr los agentes de review.

1. Correr **el tier local** de los [gates de CI](../../../CLAUDE.md#comandos-comunes) (con `pnpm`, nunca `nx` directo). Los gates se reparten en dos tiers, porque el borrador que abrió la Fase 3 ya está corriendo los diez en GitHub Actions:

   | Tier                      | Gates                                                       | Por qué                                                                                                                                                                                                                                                         |
   | ------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | **Local, siempre**        | `typecheck`, `lint`, `stylelint`, `test`, `check-agents`    | Baratos (~45s en paralelo) y son el único feedback rápido sobre las reglas ESLint propias del repo, que es donde más reincide un agente.                                                                                                                        |
   | **Delegados al borrador** | `build`, `storybook`, `studio-build`, `e2e`, `guard-config` | Lentos y de salida voluminosa. `e2e` además es el más frágil, porque depende del dataset, y `guard-config` solo tiene efecto en PRs desde forks, así que en local no verifica nada. El borrador los corre igual, sobre el mismo commit, y sin ocupar la sesión. |
   - **Silenciar la salida en verde.** Capturar y emitir solo ante fallo, para no volcar el log completo de un gate que pasó:

     ```bash
     out=$(pnpm lint 2>&1) || echo "$out"
     ```

     Ante rojo el log aparece entero, así que el diagnóstico no pierde nada.

   - **En modo worktree**, anteponer `NX_DAEMON=false` a todo gate de Nx y reemplazar `pnpm typecheck` por `pnpm exec tsc -p tsconfig.typecheck.json --noEmit` — ver [Modo worktree](#modo-worktree) → "Ajustes transversales" (evita falsos rojos de teardown y resultados stale del daemon).
   - **Lanzalos concurrentemente**, no uno tras otro: son independientes entre sí. En serie tardan la **suma**; en paralelo, lo que tarde el más lento.
   - Si alguno falla: reportar cuál, diagnosticar, arreglar, commitear el fix (reglas de Fase 3) y re-correr **solo el que falló** mientras el resto sigue verde; re-correr todo solo si el fix toca superficie compartida.

   **Correr un gate delegado en local es válido** cuando el diff lo toca de lleno y conviene el ciclo corto — p. ej. `storybook` ante un cambio de stories. Lo que la tabla evita es correrlos _por rutina_.

1. **Leer la señal del borrador, sin esperarla.** `gh pr checks <pr>` sobre el PR que abrió la Fase 3 da el estado de los gates delegados, junto con las integraciones externas del repo (los despliegues de Vercel, que el borrador también dispara). Para no bloquear la sesión, vigilarlos en segundo plano (`gh pr checks <pr> --watch --fail-fast`) y seguir con la review: si algo se pone rojo, la notificación llega sola. Si al momento de delegar la review el borrador sigue corriendo, se reporta **en curso** — la Fase 6 verifica el verde final antes de marcar listo.
1. **Determinar si el diff toca superficie de seguridad.** La lista de disparadores es la sección **"Cuándo correr"** del agente `security-auditor`: `src/api/**` (endpoints, GROQ, mappers), manejo de contenido externo (PortableText/HTML del CMS, `bypassSecurityTrust*`, fetch a servicios externos, `localStorage`), variables de entorno / secrets / config de Sanity o Clarity, y dependencias (`package.json` / `pnpm-lock.yaml`). Un diff que no toca nada de eso —solo documentación, estilos o UI sin datos externos— **no** la amerita; el auditor también puede invocarse a demanda si surge una preocupación puntual.
1. **Delegar las reviews — en paralelo si corren ambas.** Si el diff toca superficie de seguridad, lanzar al **`security-auditor`** y al **`code-reviewer`** en el **mismo turno** (ambas delegaciones en una única respuesta, igual que los gates del paso 1): sus reviews son independientes y no comparten archivo de salida. Si no la toca, delegar solo al `code-reviewer`. Cada delegación incluye la ruta de salida completa del agente (ver el paso siguiente); en modo worktree, adjuntar además la nota de delegación de [Modo worktree](#modo-worktree) → "Ajustes transversales" a cada Task delegada. En ambos casos el `code-reviewer` revisa todos los cambios de la rama vs. `<base>` (la ref resuelta en la Fase 0 → "Base de la rama"; default `develop`/`origin/develop`) y recibe **el resultado observado de los gates del paso 1** (qué corriste, con qué resultado, y cuáles omitiste por no aplicar al diff) — sin ese dato los vuelve a correr, que es la parte más cara de la review.
1. Cada agente escribe su propio archivo: el `code-reviewer` en `workspace/<number>/CODE_REVIEW.md` y el `security-auditor` en `workspace/<number>/SECURITY_REVIEW.md`.
1. Presentar la tabla de hallazgos al usuario (Críticos, Advertencias, Sugerencias), combinando ambos archivos cuando corrió el auditor, e indicando si corrió o por qué no correspondía. Al combinar, cada hallazgo se cita con el identificador tal como aparece en su documento de origen: los del `code-reviewer` llevan el prefijo `R` (p. ej. `R6`) y los de seguridad el prefijo `S` (p. ej. `S3`). Ninguno usa `#`, que queda reservado para los issues de GitHub.

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
3. Un commit atómico por fix. El mensaje describe el **cambio real**, nunca referencia el número de hallazgo — la regla ya no es solo convención: un hook local (`commit-msg`) y el gate `check-findings` la verifican y rechazan un mensaje que la incumpla.
   - ✅ `[#<issue>] - Acota la constante al cuerpo de la función — estaba a nivel de módulo`
   - ❌ `[#<issue>] - Arregla el hallazgo R2`
4. Si un hallazgo se **difiere**, proponer el issue al usuario y **esperar su confirmación** antes de crearlo (`gh issue create`); una vez creado, anotar su URL junto al valor **Diferido** en la columna **Estado**. Crear un issue es una acción hacia afuera: la misma política rige en la Fase 6.
   - **Título sin prefijo de categoría** (`[Tooling]`, `[SEO]`, `[#<id>]`, ni variantes con guion o dos puntos): la categoría va en `--label` y la pertenencia a una iniciativa en la relación de sub-issue. Si ningún label existente encaja, proponer su creación al usuario en vez de codificar la categoría en el título. Ver [`coding-agent-policies.md`](../../references/coding-agent-policies.md) Sección 2.
5. Tras abordar Críticos y Advertencias, re-correr **solo los gates del tier local que el diff de los fixes toca**, con el mismo patrón de silenciado en verde de la Fase 4. Arreglar regresiones. Re-correr el tier entero solo si los fixes tocaron superficie compartida.
6. Las **Sugerencias** son opcionales: presentarlas y dejar que el usuario decida.
7. Si un hallazgo es específicamente un **gap de cobertura de tests**, el orquestador **puede** delegar en **`test-generator`** el scaffolding de los specs faltantes (en modo worktree, adjuntar la nota de delegación de [Modo worktree](#modo-worktree) → "Ajustes transversales"). Es un aid opcional, **no** un gate: los tests igual deben existir y pasar; el agente es solo una vía para producirlos.
8. **Pushear al borrador**, como último paso de la fase. Va al final para que también viaje lo que produzcan los pasos 6 y 7: refresca la señal de los gates delegados sobre el commit final, que es la que la Fase 6 verifica antes de marcar listo.

---

## Fase 6 — Ship

**Propósito:** verificar la señal del borrador, completar su cuerpo, marcarlo listo para review y actualizar el issue original. El PR ya existe: lo abrió la Fase 3 en borrador.

**Modo worktree:** el worktree **no se limpia en esta fase** — se mantiene hasta que el PR mergee, para permitir reanudar la sesión (ver [Modo worktree](#modo-worktree) → "Ciclo de vida"). La verificación de los checks y el `gh pr ready` corren igual, con cwd ya resuelto al worktree.

1. **Verificar la señal del borrador.** `gh pr checks <pr>` sobre el PR que abrió la Fase 3. Todos los checks deben estar **verdes** sobre el commit final (el que dejaron los fixes de la Fase 5). Ojo con el conteo: la salida trae más filas que los diez gates requeridos —las integraciones externas, como los despliegues de Vercel—, así que se verifica que **ninguna** esté en rojo o pendiente, en vez de contar contra un número fijo:
   - Alguno **rojo** → no se marca listo: volver a la Fase 5.
   - Alguno **en curso** → esperar acá. Es el único punto del flujo donde esperar tiene sentido, porque ya no queda trabajo en paralelo que hacer.
2. **Completar el cuerpo del PR** con el plan de pruebas ya verificado, que en la Fase 3 quedó como marcador: `gh pr edit <pr> --body-file <archivo>`. Eso emite `pull_request.edited`, así que `check-findings` re-evalúa el cuerpo final sin un paso extra.
   - El resto de los datos —base, `--milestone`, `--label`, título, `Closes #<issue>.`, `Parte de #<epic>.` y el aviso de apilado— ya los fijó la Fase 3: acá solo se verifica que estén.
   - **El cuerpo termina en el plan de pruebas (restricción dura):** sin leyenda de atribución de agente (`🤖 Generated with …`, `Co-Authored-By: Claude …`, `Claude-Session: …`) y **sin citar un identificador de hallazgo de review** (`R<n>`, `S<n>`). Ver [`coding-agent-policies.md`](../../references/coding-agent-policies.md) Sección 2 y Sección 3.
   - **El PR DEBE enlazar su issue de origen (restricción dura):** el cuerpo debe contener un keyword de cierre — `Closes #<issue>` (o `Fixes`/`Resolves`). El prefijo `[#<issue>]` del título **no** crea el enlace.
3. **Marcar listo para review:** `gh pr ready <pr>`. Es el evento que convoca a otra persona, así que sus precondiciones son duras:
   - Ningún Crítico de `workspace/<number>/CODE_REVIEW.md` ni `workspace/<number>/SECURITY_REVIEW.md` sin **disposición** (definida en la pausa de la Fase 4).
   - El `code-reviewer` corrió y sus hallazgos están abordados o dispuestos.
   - Los checks del borrador, verdes (paso 1).

   La licencia del borrador y sus tres condiciones viven en [`coding-agent-policies.md`](../../references/coding-agent-policies.md) Sección 2.

4. Presentar la URL del PR al usuario, ya listo para review.
5. Escanear la sesión por ítems **fuera de alcance** (fixes/hallazgos/mejoras más allá del issue). Si hay:
   - Actualizar la descripción del issue (`gh issue edit`) con una sección "Fuera de alcance (abordado en este PR)".
   - Preguntar al usuario si quiere crear issues separados para follow-ups. Esperar confirmación antes de crearlos. **Nunca crear issues en repos donde el usuario no es contribuidor.**
   - Al crearlos, aplican las mismas reglas de la Fase 5 paso 4: **título sin prefijo de categoría**, categoría en `--label`, y sub-issue del epic cuando el follow-up pertenece a una iniciativa.
6. Presentar el resumen final como **exactamente** esta tabla Item/Valor (renderizar solo después de que el PR quedó listo para review y la edición del issue se completó con artefactos reales):

   ```markdown
   **Workflow completo.**

   | Item                | Valor                                                                 |
   | ------------------- | --------------------------------------------------------------------- |
   | Issue               | [#<número>](issue-url) — <título>                                     |
   | Rama                | `feat/<number>-<kebab>`                                               |
   | PR                  | [#<pr>](pr-url)                                                       |
   | Commits             | <N> commits atómicos                                                  |
   | Hallazgos abordados | <X> críticos · <Y> advertencias · <Z> sugerencias — <disposición>     |
   | Entorno             | `worktree` (`.claude/worktrees/<number>`) / `raíz`                    |
   | CI                  | <tier local: verde/rojo · borrador: todos verdes / N en rojo — <url>> |
   ```

   - `Commits` cuenta solo los de la rama (`git rev-list --count <base>..HEAD`, con `<base>` = `<rama-base>` en modo raíz y `origin/<rama-base>` en modo worktree; default `develop`). Cuando `<rama-base> ≠ develop`, sumar el dato de base apilada bajo la tabla con el aviso de orden de merge (sin alterar la tabla en el caso `develop`).
   - `CI` reporta las **dos puntas**: el tier local corrido en la sesión y el estado de los checks del borrador, con su URL.

---

## Restricciones (todas las fases)

- Usar `pnpm <script>` para ejecutar tareas; no construir variantes de `nx` directas a mano.
- Nunca prefijar comandos git con `cd` — el working dir ya está resuelto (raíz del repo, o del worktree según el entorno); regla completa en [`coding-agent-policies.md`](../../references/coding-agent-policies.md) Sección 8.
- Nunca **marcar listo** (`gh pr ready`) un PR antes de que pasen los gates de CI —el tier local **y** los checks del borrador— y haya corrido el `code-reviewer`. Crear el PR **en borrador** al cerrar la Fase 3 es parte del flujo y no cuenta como abrirlo: la licencia y sus tres condiciones están en [`coding-agent-policies.md`](../../references/coding-agent-policies.md) Sección 2.
- Nunca marcar listo un PR sin el keyword de cierre (`Closes #<issue>`) en el cuerpo enlazando el issue de origen.
- Nunca marcar listo un PR con un Crítico sin disposición confirmada — definición en la pausa de la Fase 4; verificación en la Fase 6.
- En modo worktree (ver [Modo worktree](#modo-worktree)), el cwd de la sesión y de los subagentes delegados ya está resuelto al worktree tras `EnterWorktree`: la regla anti-`cd` sigue rigiendo igual, y toda comparación de rango git usa `<base>` (`origin/<rama-base>`, default `origin/develop`) como base, nunca la rama base local.
- Toda delegación a un subagente que compute un diff de rango (`plan-writer`, advisors, `code-reviewer`, `security-auditor`, `test-generator`, `documentation-writer`) recibe la base `<base>` resuelta en la Fase 0: en worktree via la nota de delegación (que ya la incluye); en modo raíz con base apilada (`<rama-base> ≠ develop`), como una línea explícita en la instrucción. Los cuerpos de los agentes usan `develop...HEAD` como default de invocación standalone; esta instrucción lo overridea.
- Nunca saltear la fase Plan — aun cambios triviales se benefician de un plan breve.
- Aplican siempre las reglas de [`.claude/references/coding-agent-policies.md`](../../references/coding-agent-policies.md): sin framings de mantenedor único, sin "salteá el test por ser chico" (salvo cambios solo-doc), sin diferir la review más allá de pedir la review humana (`gh pr ready`), y sin comentarios redundantes (Sección 3).
