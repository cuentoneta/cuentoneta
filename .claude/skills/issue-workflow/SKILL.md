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
3. Sin declaración ni worktree previo: pausar con `AskUserQuestion` — ver [Modo worktree](references/modo-worktree.md) → "Cuándo se activa". La respuesta fija el entorno para el resto de la sesión (Fase 1 en adelante).
4. Si el entorno resuelto es worktree y el worktree ya existía (pasos 1-2): evaluar además la señal de limpieza `gh pr list --head feat/<number>-<kebab> --state merged` — ver [Modo worktree](references/modo-worktree.md) → "Ciclo de vida".

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

| Rama | `PLAN.md`                  | Review | Commits | Interpretación → fase sugerida                                                                                                | Reference a abrir                                         |
| ---- | -------------------------- | ------ | ------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| No   | No                         | —      | —       | Sesión nueva (caso normal) → **Fase 1**, sin pausa ni mensaje adicional                                                       | `fase-1-setup.md`                                         |
| Sí   | No                         | —      | 0       | La sesión murió antes de escribir el plan → **Fase 2**                                                                        | `fase-2-plan.md`                                          |
| Sí   | No                         | —      | >0      | Inconsistente (commits sin plan) → pausa con respuestas propias: **Reconstruir** / **Revisar** (ver abajo)                    | `fase-2-plan.md` o `fase-4-review.md`, según la respuesta |
| Sí   | Sí, todo `[ ]`             | —      | 0       | Plan escrito, sin aprobar/implementar → **Fase 2**, re-presentando el plan existente sin re-delegar en `plan-writer`          | `fase-2-plan.md`                                          |
| Sí   | Sí, algún `[x]` (no todos) | —      | >0      | Implementación en curso → **Fase 3**, retomando en el primer paso `[ ]`                                                       | `fase-3-implement.md`                                     |
| Sí   | Sí, todo `[x]`             | No     | >0      | Implementación terminada, sin review → **Fase 4**                                                                             | `fase-4-review.md`                                        |
| Sí   | Sí                         | Sí     | >0      | Review ya escrita → **Fase 5**, abordando los hallazgos con Estado pendiente                                                  | `fase-5-fix.md`                                           |
| No   | Sí                         | —      | —       | El plan sobrevivió pero la rama no → recrear la rama (Fase 1) y re-confirmar el plan existente en **Fase 2**, sin regenerarlo | `fase-1-setup.md`, luego `fase-2-plan.md`                 |

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

## Carga por fase

Las fases 1 a 6 y el modo worktree viven en `references/`, un archivo por fase. **Se lee el archivo al entrar a la fase, no antes:** el cuerpo alcanza para que la Fase 0 decida dónde entrar, y cargar por adelantado las fases que la sesión no va a ejecutar es justamente el costo que esta separación evita. La Fase 0 y las restricciones se quedan acá porque rigen en toda invocación.

| Fase                            | Archivo                                                            | Propósito en una línea                                                                   |
| ------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| **Fase 1 — Setup**              | [`references/fase-1-setup.md`](references/fase-1-setup.md)         | Crear la rama de feature desde la base actualizada, en el entorno que resolvió la Fase 0 |
| **Fase 2 — Plan**               | [`references/fase-2-plan.md`](references/fase-2-plan.md)           | Producir el plan de implementación y pausar hasta su aprobación                          |
| **Fase 3 — Implement**          | [`references/fase-3-implement.md`](references/fase-3-implement.md) | Ejecutar el plan con commits atómicos y cerrar abriendo el PR en borrador                |
| **Fase 4 — Review**             | [`references/fase-4-review.md`](references/fase-4-review.md)       | Correr el tier local de gates y delegar las reviews                                      |
| **Fase 5 — Fix**                | [`references/fase-5-fix.md`](references/fase-5-fix.md)             | Abordar los hallazgos por prioridad y pushear al borrador                                |
| **Fase 6 — Ship**               | [`references/fase-6-ship.md`](references/fase-6-ship.md)           | Verificar la señal del borrador, completar su cuerpo y marcarlo listo para review        |
| **Modo worktree** (transversal) | [`references/modo-worktree.md`](references/modo-worktree.md)       | Mecánica y ajustes del worktree; **solo** si la Fase 0 resolvió ese entorno              |

`modo-worktree.md` es transversal pero **condicional**: lo consultan las fases 1 a 4 y la 6, y solo cuando el entorno resuelto es worktree. En modo raíz no se carga.

---

## Restricciones (todas las fases)

- Usar `pnpm <script>` para ejecutar tareas; no construir variantes de `nx` directas a mano.
- Nunca prefijar comandos git con `cd` — el working dir ya está resuelto (raíz del repo, o del worktree según el entorno); regla completa en [`coding-agent-policies.md`](../../references/coding-agent-policies.md) Sección 8.
- Nunca **marcar listo** (`gh pr ready`) un PR antes de que pasen los gates de CI —el tier local **y** los checks del borrador— y haya corrido el `code-reviewer`. Crear el PR **en borrador** al cerrar la Fase 3 es parte del flujo y no cuenta como abrirlo: la licencia y sus tres condiciones están en [`coding-agent-policies.md`](../../references/coding-agent-policies.md) Sección 2.
- Nunca marcar listo un PR sin el keyword de cierre (`Closes #<issue>`) en el cuerpo enlazando el issue de origen.
- Nunca marcar listo un PR con un Crítico sin disposición confirmada — definición en la pausa de la Fase 4; verificación en la Fase 6.
- En modo worktree (ver [Modo worktree](references/modo-worktree.md)), el cwd de la sesión y de los subagentes delegados ya está resuelto al worktree tras `EnterWorktree`: la regla anti-`cd` sigue rigiendo igual, y toda comparación de rango git usa `<base>` (`origin/<rama-base>`, default `origin/develop`) como base, nunca la rama base local.
- Toda delegación a un subagente que compute un diff de rango (`plan-writer`, advisors, `code-reviewer`, `security-auditor`, `test-generator`, `documentation-writer`) recibe la base `<base>` resuelta en la Fase 0: en worktree via la nota de delegación (que ya la incluye); en modo raíz con base apilada (`<rama-base> ≠ develop`), como una línea explícita en la instrucción. Los cuerpos de los agentes usan `develop...HEAD` como default de invocación standalone; esta instrucción lo overridea.
- Nunca saltear la fase Plan — aun cambios triviales se benefician de un plan breve.
- Aplican siempre las reglas de [`.claude/references/coding-agent-policies.md`](../../references/coding-agent-policies.md): sin framings de mantenedor único, sin "salteá el test por ser chico" (salvo cambios solo-doc), sin diferir la review más allá de pedir la review humana (`gh pr ready`), y sin comentarios redundantes (Sección 3).
