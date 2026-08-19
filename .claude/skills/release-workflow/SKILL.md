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

Ejemplo: `/release-workflow https://github.com/cuentoneta/cuentoneta/issues/<id>`

## Supuestos

- El issue es de **gestión de release**: su milestone define la **versión target** (p. ej. milestone `2.8.2` → versión `2.8.2`). Debe tener el label **`release`** (lo aplica el template `.github/ISSUE_TEMPLATE/release.md`); el Action `prepare-release-pr` lo usa como gate.
- El release se genera al mergear **`develop → master`**, que dispara el workflow `release.yml` (tag + GitHub Release + deploy de Sanity Studio). Este skill prepara el commit de release en una rama contra `develop`; **no** mergea a master. Tras el merge a `develop`, el workflow `prepare-release-pr` crea/actualiza el PR `develop → master`.

---

## Fase 1 — Pre-flight

**Propósito:** reunir todo lo necesario para el release y detectar pasos manuales, sin commitear todavía.

1. `gh issue view <issue-url> --json number,title,milestone` → número, título y **versión target** (del `milestone.title`). Retener también `milestone.number`: es el identificador con el que la Fase 4 actualiza la descripción del milestone, y no coincide con el número del issue ni con la versión.
2. **Verificar el milestone (criterio de aceptación):** `gh issue list --milestone "<versión>" --state open`. No debe quedar ningún issue abierto **salvo el de release**. Si quedan otros, reportarlos y pausar — el release no está listo.
3. **Rama:** `git checkout develop && git pull --ff-only`, luego `git checkout -b feat/<number>-<kebab>` (convención de `CLAUDE.md`).
4. **Detectar y clasificar las migraciones de Sanity pendientes:** listar `cms/migrations/*/`. Para cada una, evaluar (por el issue que la introdujo y su commit) si ya se corrió contra producción. Las migraciones **mutan datos de producción**, así que **nunca** se corren automáticamente: se listan como **paso manual del usuario** (ver Fase 4). Si el usuario ya confirmó que una se ejecutó, anotarlo.

   **La clasificación no es opcional, porque de ella depende cuándo puede correr** (criterio completo en [`sanity-migrations.md`](../../references/sanity-migrations.md) → "Orden de despliegue"):

   - **Independiente del código** — puebla un campo que nadie lee todavía, purga huérfanos, corrige valores sin cambiar su forma. El orden respecto del deploy es indiferente.
   - **Acoplada al código** — cambia el nombre de un campo o la **forma de su valor**. Ninguna de las dos secuencias simples es segura: migrar antes deja el código viejo con el dato nuevo, y desplegar antes deja el código nuevo con el dato viejo.

   El docblock de la propia migración suele declarar su acoplamiento y su orden de despliegue. **Si contradice a este skill, gana el docblock:** conoce el acoplamiento concreto, y este documento solo puede generalizar.

   Registrar la clase de cada una en `workspace/RELEASE.md`, junto a su estado por dataset.

5. **Chequear versiones en documentación:** contrastar `docs/` (p. ej. `DEVELOPMENT_GUIDE.md`) contra `package.json` (`engines.node`, `packageManager`) y los saltos de versión mayor de la ventana. Solo requiere edición si hay un salto documentable (no por bumps minor/patch de Dependabot).
6. **Reunir el contenido del CHANGELOG:** los issues cerrados del milestone + `git log --oneline <tag-anterior>..develop` para confirmar qué PRs mergearon desde el último tag. Incluir issues sin milestone que hayan shippeado en la ventana (hijos de epics); excluir los que pertenecen a un milestone futuro.
7. **Redactar el borrador de la entrada de CHANGELOG** con lo reunido en el paso anterior: prosa + cambios agrupados por tema, replicando el formato de la sección anterior en `CHANGELOG.md`.
8. **Redactar el borrador de la descripción del milestone.** La descripción es el único resumen de la versión que se lee desde la lista de hitos de GitHub; la entrada de CHANGELOG cuenta la misma historia pero vive en el repositorio. La que trae el milestone se escribió al abrirlo —antes de saber qué iba a entrar—, así que se reemplaza.

   Se **deriva** de la prosa redactada en el paso anterior, condensada a un párrafo: los mismos temas, en el mismo orden, sin los cambios enumerados. Redactarla por separado es trabajo duplicado y la fuente de divergencia que prohíbe **Restricciones (todas las fases)**.

9. Escribir `workspace/RELEASE.md` con: versión target, número del milestone, estado del milestone, migraciones de Sanity (pendientes / ya corridas), delta de documentación y los dos borradores de los pasos 7 y 8.

**⏸ PAUSA — decisión vía `AskUserQuestion`.**

- `question`: "El alcance del release, el borrador del CHANGELOG y el de la descripción del milestone están en `workspace/RELEASE.md`. ¿Cómo seguimos?"
- `header`: `Release`
- `options` (la recomendada primero): **Aprobar** — el alcance y ambos borradores quedan tal cual y se avanza a la Fase 2; **Dar feedback** — el orquestador pide el texto del feedback a continuación. La opción **"Other"** (automática) transporta el feedback directamente en un solo paso — la vía preferida cuando el usuario ya sabe qué cambiar (alcance, agrupación, prosa o descripción).

Esta pausa es donde se aprueba el texto de la descripción; la Fase 4 lo aplica sin volver a preguntar.

Ramificación tras la respuesta:

- **Aprobar** → avanzar a la Fase 2.
- **Dar feedback** → pedir el texto del feedback al usuario y tratarlo igual que Other.
- **Other** (feedback) → ajustar `workspace/RELEASE.md` según lo indicado (alcance del release, agrupación/prosa del CHANGELOG, o descripción del milestone) y repetir la pausa, iterando hasta un "Aprobar". Un ajuste de la prosa del CHANGELOG arrastra la descripción, que se deriva de ella.

---

## Fase 2 — Preparar

**Propósito:** materializar el bump de versión y la entrada de CHANGELOG en commits atómicos.

1. **Bump de versión en lockstep:** actualizar la versión target en **`package.json` raíz Y `cms/package.json`**. El versionado app/Studio va en lockstep; omitir `cms/package.json` deja el Studio desincronizado. Commitear (pueden ser uno o dos commits, pero **ambos** archivos deben quedar bumpeados antes del merge).
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

**⏸ PAUSA — decisión vía `AskUserQuestion`.**

- `question`: "Verificación completa en `workspace/RELEASE.md`. ¿Cómo seguimos?"
- `header`: `Verificación`
- `options` (la recomendada primero): **Proceder** — abrir el PR de release y aplicar al milestone la descripción aprobada en la Fase 1 (Fase 4); **Dar feedback** — el orquestador pide el texto del feedback a continuación. La opción **"Other"** (automática) transporta directamente el ajuste pedido.

La opción nombra las dos escrituras hacia afuera de la Fase 4 porque es la única pausa que las autoriza: quien responde tiene que poder leer qué está aprobando.

Ramificación tras la respuesta:

- **Proceder** → avanzar a la Fase 4 (Ship + handoff manual).
- **Dar feedback** → pedir el texto del feedback al usuario y tratarlo igual que Other.
- **Other** (feedback) → aplicar el ajuste indicado sobre la verificación o el contenido preparado (con commit atómico si toca archivos versionados), re-verificar lo afectado y repetir la pausa. Si el ajuste toca la prosa del CHANGELOG, re-derivar la descripción del milestone en `workspace/RELEASE.md`: todavía no se aplicó, y es la última oportunidad de corregirla antes de que la Fase 4 la escriba.

---

## Fase 4 — Ship + handoff manual

**Propósito:** abrir el PR de release, aplicar la descripción del milestone y entregar los pasos manuales que gatillan el release.

1. `git push -u origin feat/<number>-<kebab>`.
2. Crear el PR con `gh pr create` (base **`develop`**, milestone de la versión):
   - Título: `[#<issue>] - <título del issue>`.
   - Cuerpo en español con **`Closes #<issue>`** (restricción dura: el keyword de cierre debe estar en el cuerpo, no basta el prefijo del título).
   - Incluir el bloque de pasos manuales (abajo) para que quede registrado en el PR.
3. **Actualizar la descripción del milestone** con el texto aprobado en la Fase 1, usando el `milestone.number` recolectado en su paso 1:

   ```bash
   gh api -X PATCH repos/cuentoneta/cuentoneta/milestones/<número> -F description=@workspace/milestone-description.txt
   ```

   El texto va **por archivo** (`-F …=@<ruta>`), no interpolado en la línea de comando: es prosa en español redactada por el agente, y una comilla, un `$` o un backtick mutilarían el valor sin que nada lo advierta.

   - **El texto es el aprobado, no uno nuevo.** Redactarlo acá otra vez reintroduce la divergencia con el CHANGELOG que la derivación de la Fase 1 existe para evitar.
   - **Sobrescribe la descripción previa a propósito.** La que trae un milestone se escribió al abrirlo, cuando todavía no se sabía qué iba a entrar.
   - **No lleva confirmación propia:** el texto ya pasó por la pausa de la Fase 1, y la de la Fase 3 autoriza esta escritura por su nombre. A cambio, no puede ser silenciosa: registrar en `workspace/RELEASE.md` la constancia de aplicación —el texto y el resultado del comando—, que es distinto del borrador que la Fase 1 ya asentó ahí.
   - **Verificar el resultado, y no darlo por hecho.** Si el `PATCH` falla —token sin permiso sobre el repositorio, milestone inexistente o cerrado, 404—, reportarlo explícitamente y dejar la descripción **pendiente** en `workspace/RELEASE.md` y en el resumen final. Nunca reportarla como aplicada sin haber visto la respuesta.
   - Ocurre acá, y no en la Fase 2, porque no es un artefacto versionado: no viaja en el diff del PR, y aplicarla antes la expondría a quedar divergente si la pausa de la Fase 3 cambia la prosa. La escritura precede igual al merge que dispara el release: si el release se aborta después, la descripción queda por revertir a mano.

4. Presentar la URL del PR y el **bloque de handoff manual** al usuario:

   ```
   Pasos manuales para completar la release:
   1. Mergear este PR a `develop` (el issue de release debe tener label `release`).
   2. Tras el merge, el workflow `prepare-release-pr` crea/actualiza el PR `develop → master`
      con los pasos manuales y dispara `ci.yml` sobre `develop` (el PR no gatilla checks por sí
      mismo por la anti-recursión del `GITHUB_TOKEN`; la señal de CI está en la corrida sobre
      `develop`). Revisarlo y mergearlo a `master`
      → dispara `release.yml` (tag <x> + GitHub Release + deploy de Sanity Studio).
      El deploy de la app lo cubre Vercel por integración Git nativa.
      Si el milestone no estaba completo, el Action hace skip con warning; re-disparar
      con workflow_dispatch + force si corresponde.
   3. Correr las migraciones de Sanity pendientes contra producción, en el momento que
      corresponda a su clase (ver Fase 1):
        pnpm -C cms exec sanity migration run <nombre> --project "$(node --env-file=cms/.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" --dataset production
        pnpm -C cms exec sanity migration run <nombre> --project "$(node --env-file=cms/.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" --dataset production --no-dry-run --no-confirm
      - Independiente del código: en cualquier momento de esta secuencia.
      - Acoplada al código: NO hay orden simple seguro. Con un lector tolerante ya
        desplegado, corre acá. Sin él, la ventana rota existe igual y hay que elegir
        cuál asumir — decidirlo explícitamente y verificar apenas termina, en vez de
        descubrirla por un reporte.
   4. Verificar post-release: workflow Release verde (jobs `release` y `deploy-studio`),
      Release <x> publicado, Studio con el schema nuevo, app en producción sin regresiones,
      y las superficies que leen lo migrado sirviendo con la forma nueva.
   ```

   Omitir el paso 3 del bloque si no hay migraciones pendientes o el usuario ya las corrió.

5. Presentar el resumen final (versión, rama, PR, commits, resultado de la verificación, y el estado real de la descripción del milestone — aplicada o pendiente con su motivo).

---

## Restricciones (todas las fases)

- Usar `pnpm <script>`; no construir variantes de `nx` a mano.
- Nunca prefijar comandos git con `cd` — el working dir ya está resuelto; regla completa en [`coding-agent-policies.md`](../../references/coding-agent-policies.md) Sección 8.
- Nunca correr migraciones de Sanity automáticamente: mutan producción, son paso manual del usuario.
- Nunca mergear `develop → master` desde el skill: ese es el gatillo del release y lo hace el usuario.
- Nunca abrir el PR sin `Closes #<issue>` en el cuerpo, ni antes de que pasen los gates de CI y la verificación.
- El bump de versión va en **lockstep** (`package.json` + `cms/package.json`).
- Nunca redactar la descripción del milestone por separado de la prosa del CHANGELOG: se deriva de ella, condensada. Dos textos escritos de cero para la misma versión divergen.
