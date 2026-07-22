---
name: release-workflow
description: Orquesta la generación de un release de La Cuentoneta en 4 fases — Pre-flight, Preparar, Verificar, Ship — a partir de la URL del issue de release. Invocar con /release-workflow <issue-url>.
---

# Release Workflow

Orquesta la generación de un **release** de La Cuentoneta a partir del issue de gestión correspondiente (p. ej. "Generar release para versión 2.8.2"). A diferencia de [`issue-workflow`](../issue-workflow/SKILL.md), un release **no es un feature de código** sino un **checklist determinista**: sus pasos son fijos y lo único que varía es qué se completa (los issues del milestone en el CHANGELOG, si hay migraciones de Sanity pendientes). Por eso este skill encodea el checklist en vez de reusar el flujo de feature (sin `plan-writer`, sin `code-reviewer` genérico).

Cada invocación sobrescribe `workspace/RELEASE.md` — guardá el artefacto de una sesión previa antes de empezar una nueva. (`workspace/` está gitignoreado.)

Aplican siempre las reglas de [`CLAUDE.md`](../../../CLAUDE.md) y [`coding-agent-policies.md`](../../references/coding-agent-policies.md).

## Uso

```
/release-workflow <issue-url>
```

Ejemplo: `/release-workflow https://github.com/cuentoneta/cuentoneta/issues/1672`

## Supuestos

- El issue es de **gestión de release**: su milestone define la **versión target** (p. ej. milestone `2.8.2` → versión `2.8.2`). Debe tener el label **`release`** (lo aplica el template `.github/ISSUE_TEMPLATE/release.md`); el Action `prepare-release-pr` lo usa como gate.
- El release se genera al mergear **`develop → master`**, que dispara el workflow `release.yml` (tag + GitHub Release + deploy de Sanity Studio). Este skill prepara el commit de release en una rama contra `develop`; **no** mergea a master. Tras el merge a `develop`, el workflow `prepare-release-pr` crea/actualiza el PR `develop → master`.

---

## Fase 1 — Pre-flight

**Propósito:** reunir todo lo necesario para el release y detectar pasos manuales, sin commitear todavía.

1. `gh issue view <issue-url> --json number,title,milestone` → número, título y **versión target** (del `milestone.title`).
2. **Verificar el milestone (criterio de aceptación):** `gh issue list --milestone "<versión>" --state open`. No debe quedar ningún issue abierto **salvo el de release**. Si quedan otros, reportarlos y pausar — el release no está listo.
3. **Rama:** `git checkout develop && git pull --ff-only`, luego `git checkout -b feat/<number>-<kebab>` (convención de `CLAUDE.md`).
4. **Detectar migraciones de Sanity pendientes:** listar `cms/migrations/*/`. Para cada una, evaluar (por el issue que la introdujo y su commit) si ya se corrió contra producción. Las migraciones **mutan datos de producción**, así que **nunca** se corren automáticamente: se listan como **paso manual del usuario** (ver Fase 4). Si el usuario ya confirmó que una se ejecutó, anotarlo.
5. **Chequear versiones en documentación:** contrastar `docs/` (p. ej. `DEVELOPMENT_GUIDE.md`) contra `package.json` (`engines.node`, `packageManager`) y los saltos de versión mayor de la ventana. Solo requiere edición si hay un salto documentable (no por bumps minor/patch de Dependabot).
6. **Reunir el contenido del CHANGELOG:** los issues cerrados del milestone + `git log --oneline <tag-anterior>..develop` para confirmar qué PRs mergearon desde el último tag. Incluir issues sin milestone que hayan shippeado en la ventana (hijos de epics); excluir los que pertenecen a un milestone futuro.
7. Escribir `workspace/RELEASE.md` con: versión target, estado del milestone, migraciones de Sanity (pendientes / ya corridas), delta de documentación, y el **borrador de la entrada de CHANGELOG** (prosa + cambios agrupados por tema, replicando el formato de la sección anterior en `CHANGELOG.md`).

**⏸ PAUSA — requiere aprobación del usuario.**

> El alcance del release y el borrador del CHANGELOG están en `workspace/RELEASE.md`. Revisalo y respondé **aprobar**, o dame feedback sobre la agrupación/prosa.

---

## Fase 2 — Preparar

**Propósito:** materializar el bump de versión y la entrada de CHANGELOG en commits atómicos.

1. **Bump de versión en lockstep:** actualizar la versión target en **`package.json` raíz Y `cms/package.json`**. El versionado app/Studio va en lockstep (convención del release #1641); omitir `cms/package.json` deja el Studio desincronizado. Commitear (pueden ser uno o dos commits, pero **ambos** archivos deben quedar bumpeados antes del merge).
2. **Entrada de CHANGELOG:** insertar la sección `## Versión <x> (<fecha-de-hoy>)` sobre la anterior, con la prosa y los cambios aprobados en la Fase 1. Commit aparte.

Formato de commit: `[#<issue>] - <qué cambió>` (español). Cada commit deja el repo buildeable.

---

## Fase 3 — Verificar

**Propósito:** confirmar que el release no rompe el pipeline automático.

1. Correr los **gates de CI** (con `pnpm`) definidos en la sección [Comandos comunes](../../../CLAUDE.md#comandos-comunes) de `CLAUDE.md` (párrafo **Gates de CI**), incluido `studio-build` — el bump lockstep de la Fase 2 toca `cms/package.json`. Un bump + CHANGELOG no toca runtime, pero se corren igual por política. `test:e2e` es opcional acá (sin cambios de flujo de usuario). El `build` confirma de paso la versión (`@cuentoneta/app@<x>` en el `postbuild`).
2. **Dry-run de la extracción de notas de `release.yml`:** el workflow extrae con `awk` el cuerpo entre `## Versión <x>` y el próximo `## Versión`. Simularlo y confirmar que devuelve una sección **no vacía** (si falta, el job del release falla):

   ```bash
   awk -v ver="<x>" '
     BEGIN { header = "## Versión " ver }
     index($0, header) == 1 { after = substr($0, length(header)+1, 1); if (after=="" || after==" ") { found=1; next } }
     found && index($0, "## Versión ") == 1 { exit }
     found { print }
   ' CHANGELOG.md
   ```

3. **Chequeo de lockstep:** confirmar que `package.json` y `cms/package.json` tienen la **misma** versión target.
4. **Issues citados ↔ shipped:** verificar que cada issue citado en el CHANGELOG corresponda a un PR mergeado en `<tag-anterior>..develop`, y que ningún cambio relevante de la ventana quede sin citar (salvo los diferidos a un milestone futuro).

Anotar los resultados en `workspace/RELEASE.md`. Si algo falla: diagnosticar, arreglar con un commit atómico y re-verificar.

**⏸ PAUSA — requiere decisión del usuario.**

> Verificación completa en `workspace/RELEASE.md`. Respondé **proceder** para abrir el PR, o dame feedback.

---

## Fase 4 — Ship + handoff manual

**Propósito:** abrir el PR de release y entregar los pasos manuales que gatillan el release.

1. `git push -u origin feat/<number>-<kebab>`.
2. Crear el PR con `gh pr create` (base **`develop`**, milestone de la versión):
   - Título: `[#<issue>] - <título del issue>`.
   - Cuerpo en español con **`Closes #<issue>`** (restricción dura: el keyword de cierre debe estar en el cuerpo, no basta el prefijo del título).
   - Incluir el bloque de pasos manuales (abajo) para que quede registrado en el PR.
3. Presentar la URL del PR y el **bloque de handoff manual** al usuario:

   ```
   Pasos manuales para completar la release:
   1. Correr las migraciones de Sanity pendientes contra producción (si aplica):
        cd cms
        pnpm exec sanity migration run <nombre> --project <id> --dataset production          # dry-run
        pnpm exec sanity migration run <nombre> --project <id> --dataset production --no-dry-run
   2. Mergear este PR a `develop` (el issue de release debe tener label `release`).
   3. Tras el merge, el workflow `prepare-release-pr` crea/actualiza el PR `develop → master`
      con los pasos manuales y dispara `ci.yml` sobre `develop` (el PR no gatilla checks por sí
      mismo por la anti-recursión del `GITHUB_TOKEN`; la señal de CI está en la corrida sobre
      `develop`). Revisarlo y mergearlo a `master`
      → dispara `release.yml` (tag <x> + GitHub Release + deploy de Sanity Studio).
      El deploy de la app lo cubre Vercel por integración Git nativa.
      Si el milestone no estaba completo, el Action hace skip con warning; re-disparar
      con workflow_dispatch + force si corresponde.
   4. Verificar post-release: workflow Release verde (jobs `release` y `deploy-studio`),
      Release <x> publicado, Studio con el schema nuevo, app en producción sin regresiones.
   ```

   Omitir el paso 1 si no hay migraciones pendientes o el usuario ya las corrió.

4. Presentar el resumen final (versión, rama, PR, commits, resultado de la verificación).

---

## Restricciones (todas las fases)

- Usar `pnpm <script>`; no construir variantes de `nx` a mano.
- Nunca prefijar comandos git con `cd` — el working dir ya está en la raíz.
- Nunca correr migraciones de Sanity automáticamente: mutan producción, son paso manual del usuario.
- Nunca mergear `develop → master` desde el skill: ese es el gatillo del release y lo hace el usuario.
- Nunca abrir el PR sin `Closes #<issue>` en el cuerpo, ni antes de que pasen los gates de CI y la verificación.
- El bump de versión va en **lockstep** (`package.json` + `cms/package.json`).
