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
- **Node v26 local (si aplica):** los wrappers de Nx de `pnpm test` y `pnpm storybook:build` pueden reportar "Failed tasks" por un crash de teardown de `libuv` **después** de terminar bien (el proyecto pide `engines: ^24.18.0`). Si un gate de test/storybook reporta rojo pero el log previo dice que el target corrió exitosamente, verificar el resultado real con `npx vitest run` directo antes de reportarlo como fallo.
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

> **Esta sección es transversal:** no tiene fase siguiente propia — al terminar de consultarla, volver a la fase que la trajo.
