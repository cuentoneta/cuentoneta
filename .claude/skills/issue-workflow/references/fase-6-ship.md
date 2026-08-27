## Fase 6 — Ship

**Propósito:** verificar la señal del borrador, completar su cuerpo, marcarlo listo para review y actualizar el issue original. El PR ya existe: lo abrió la Fase 3 en borrador.

**Modo worktree:** el worktree **no se limpia en esta fase** — se mantiene hasta que el PR mergee, para permitir reanudar la sesión (ver [Modo worktree](modo-worktree.md) → "Ciclo de vida"). La verificación de los checks y el `gh pr ready` corren igual, con cwd ya resuelto al worktree.

1. **Verificar la señal del borrador.** `gh pr checks <pr>` sobre el PR que abrió la Fase 3. Todos los checks deben estar **verdes** sobre el commit final (el que dejaron los fixes de la Fase 5). Ojo con el conteo: la salida trae más filas que los diez gates requeridos —las integraciones externas, como los despliegues de Vercel—, así que se verifica que **ninguna** esté en rojo o pendiente, en vez de contar contra un número fijo:
   - Alguno **rojo** → no se marca listo: volver a la Fase 5.
   - Alguno **en curso** → esperar acá. Es el único punto del flujo donde esperar tiene sentido, porque ya no queda trabajo en paralelo que hacer. Esperar es **volver a consultar** hasta tener el resultado, no devolver el control anunciando que se espera: el flujo llega hasta `gh pr ready` en la misma corrida.
2. **Completar el cuerpo del PR** con el plan de pruebas ya verificado, que en la Fase 3 quedó como marcador: `gh pr edit <pr> --body-file <archivo>`. Eso emite `pull_request.edited`, así que `check-findings` re-evalúa el cuerpo final sin un paso extra.
   - El resto de los datos —base, `--milestone`, `--label`, título, `Closes #<issue>.`, `Parte de #<epic>.` y el aviso de apilado— ya los fijó la Fase 3: acá solo se verifica que estén.
   - **El cuerpo termina en el plan de pruebas (restricción dura):** sin leyenda de atribución de agente (`🤖 Generated with …`, `Co-Authored-By: Claude …`, `Claude-Session: …`) y **sin citar un identificador de hallazgo de review** (`R<n>`, `S<n>`). Ver [`coding-agent-policies.md`](../../../references/coding-agent-policies.md) Sección 2 y Sección 3.
   - **El PR DEBE enlazar su issue de origen (restricción dura):** el cuerpo debe contener un keyword de cierre — `Closes #<issue>` (o `Fixes`/`Resolves`). El prefijo `[#<issue>]` del título **no** crea el enlace.
3. **Marcar listo para review:** `gh pr ready <pr>`. Es el evento que convoca a otra persona, así que sus precondiciones son duras:
   - Ningún Crítico de `workspace/<number>/CODE_REVIEW.md` ni `workspace/<number>/SECURITY_REVIEW.md` sin **disposición** (definida en la pausa de la Fase 4).
   - El `code-reviewer` corrió y sus hallazgos están abordados o dispuestos.
   - Los checks del borrador, verdes (paso 1).

   La licencia del borrador y sus tres condiciones viven en [`coding-agent-policies.md`](../../../references/coding-agent-policies.md) Sección 2.

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

> **Al terminar esta fase:** el flujo termina acá; no hay fase siguiente.
