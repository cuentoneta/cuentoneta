---
name: issue-workflow
description: Orquesta el ciclo completo de resolución de un issue de GitHub en 6 fases — Setup, Plan, Implement, Review, Fix, Ship — a partir de la URL del issue. Invocar con /issue-workflow <issue-url>.
---

# Issue Workflow

Orquesta el ciclo de vida completo para resolver un issue de GitHub en **cuentoneta**. Cada invocación sobrescribe `workspace/PLAN.md` y `workspace/CODE_REVIEW.md` — guardá los artefactos de una sesión previa antes de empezar una nueva. (`workspace/` está gitignoreado.)

> **Issues de release:** para los issues de gestión de release (p. ej. "Generar release para versión X") usá el skill dedicado [`release-workflow`](../release-workflow/SKILL.md), que encodea el checklist determinista del release (bump lockstep, CHANGELOG desde el milestone, gatillo `develop → master`) en vez de este flujo de feature.

## Uso

```
/issue-workflow <issue-url>
```

Ejemplo: `/issue-workflow https://github.com/cuentoneta/cuentoneta/issues/1234`

---

## Fase 1 — Setup

**Propósito:** crear una rama de feature limpia desde `develop` actualizado.

1. `gh issue view <issue-url> --json number,title` para extraer número y título.
2. Derivar el nombre de rama (convención del repo):
   - Formato: **`feat/<number>-<titulo-en-kebab-case>`**.
   - Transformación: minúsculas, espacios y no-alfanuméricos → guiones, colapsar guiones consecutivos, recortar guiones de borde, truncar a ~60 caracteres en un límite de palabra.
3. `git checkout develop && git pull` para asegurar la base actualizada.
4. `git checkout -b feat/<number>-<kebab>`.
5. Reportar al usuario: número, título y nombre de rama.

---

## Fase 2 — Plan

**Propósito:** producir un plan de implementación detallado para aprobación.

1. Delegar al agente **`plan-writer`** pasándole la URL del issue, su descripción y el nombre de rama.
2. El plan-writer produce `workspace/PLAN.md`.
3. Presentar un resumen breve al usuario (objetivo, enfoque, archivos afectados, decisiones clave).

**⏸ PAUSA — requiere aprobación del usuario.**

> El plan está en `workspace/PLAN.md`. Revisalo y respondé **aprobar** para empezar la implementación, o dame feedback para revisarlo.

No avanzar a la Fase 3 sin aprobación explícita.

---

## Fase 3 — Implement

**Propósito:** ejecutar el plan con commits atómicos.

1. Ejecutar los pasos de `workspace/PLAN.md` en orden.
2. Un commit atómico por unidad lógica de trabajo.
3. **CHANGELOG:** cuentoneta mantiene `CHANGELOG.md` **por release/versión** (no por PR), al cerrar un milestone. **No** se exige una entrada por issue en este flujo; el tracking del cambio vive en el issue + su milestone. (Esto reemplaza el gate de CHANGELOG del starter.)

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

**Propósito:** verificar que pasen los gates de CI y correr el agente `code-reviewer`.

1. Correr los **gates de CI** localmente (con `pnpm`, nunca `nx` directo):
   - `pnpm lint` · `pnpm test` · `pnpm stylelint` · `pnpm typecheck` · `pnpm build` · `pnpm storybook:build` · (`pnpm test:e2e` si el cambio toca flujos E2E).
   - Si alguno falla: reportar cuál, diagnosticar, arreglar, commitear el fix (reglas de Fase 3) y re-correr hasta que pasen.
2. Delegar al agente **`code-reviewer`** para revisar todos los cambios de la rama vs. `develop`.
3. El code-reviewer escribe los hallazgos en `workspace/CODE_REVIEW.md`.
4. Presentar la tabla de hallazgos al usuario (Críticos, Advertencias, Sugerencias).

**⏸ PAUSA — requiere decisión del usuario.**

> Review completa en `workspace/CODE_REVIEW.md`. Respondé **proceder** para abordar los hallazgos, o **ship** si no hay nada bloqueante.

---

## Fase 5 — Fix

**Propósito:** abordar los hallazgos con commits atómicos.

1. Abordar cada **Crítico** y **Advertencia** de `workspace/CODE_REVIEW.md` por prioridad (Críticos primero).
2. Tras cada fix, actualizar la columna **Abordado** en `workspace/CODE_REVIEW.md` (Fixed / Discarded / Deferred / Won't Fix).
3. Un commit atómico por fix. El mensaje describe el **cambio real**, nunca referencia el número de hallazgo.
   - ✅ `[#1234] - Acota la constante al cuerpo de la función — estaba a nivel de módulo`
   - ❌ `[#1234] - Arregla el hallazgo #2`
4. Si un hallazgo se **difiere**, crear un issue de GitHub (`gh issue create`) y poner la URL en la columna Abordado.
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
