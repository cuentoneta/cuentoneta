## Fase 3 — Implement

**Propósito:** ejecutar el plan con commits atómicos.

1. **Cargar la doctrina de comentarios.** Si el plan toca código ejecutable —`src/`, `cms/`, `scripts/`, `resources/`, `e2e/` o `tools/`—, invocar la skill [`aposd-comments-style`](../../aposd-comments-style/SKILL.md) con la herramienta `Skill`, **una vez y antes de escribir la primera línea**. El `description` de esa skill pide aplicarla en toda escritura de código, pero eso depende de que el agente la invoque por iniciativa propia, y esa iniciativa no es un mecanismo: acá la carga es un paso del flujo, con la misma forma con la que el paso 4 nombra al `documentation-writer`. Un plan que solo toca documentación o configuración lo saltea — no produce comentarios de código. Lo que la doctrina previene al escribir, la Fase 4 lo audita después sobre el diff: ver la auditoría de comentarios del [`code-reviewer`](../../../agents/code-reviewer.md).
2. Ejecutar los pasos de `workspace/<number>/PLAN.md` en orden. Si la Fase 0 reanudó acá, saltear los pasos ya marcados `[x]`.
3. Un commit atómico por unidad lógica de trabajo. Tras cada commit, marcar `[x]` el checkbox del paso correspondiente en `workspace/<number>/PLAN.md`.
4. **Scan de impacto en documentación.** Si el cambio toca tipos, schemas de Sanity/Zod, contratos de API o terminología de dominio, delegar en el agente **`documentation-writer`** la actualización de `docs/`, `CLAUDE.md` y `.claude/references/` (en modo worktree, adjuntar la nota de delegación de [Modo worktree](modo-worktree.md) → "Ajustes transversales"), en el **mismo** commit/PR — lo exige la sección [Scan de impacto en documentación](../../../../CLAUDE.md#scan-de-impacto-en-documentación) de `CLAUDE.md`. Si el cambio no toca nada de eso, saltear el paso. El `documentation-writer` **no tiene Bash**: escribe los archivos, y el orquestador revisa el diff resultante y lo incluye en el commit de la unidad lógica correspondiente (o en uno propio si la doc es la unidad).
5. **CHANGELOG:** cuentoneta mantiene `CHANGELOG.md` **por release/versión** (no por PR), al cerrar un milestone. **No** se exige una entrada por issue en este flujo; el tracking del cambio vive en el issue + su milestone. (Esto reemplaza el gate de CHANGELOG del starter.)

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
- **En modo raíz**, antes de cada commit confirmar la rama activa con `git branch --show-current` contra `feat/<number>-<kebab>`; si un subagente con Bash la cambió en el medio, re-checkoutear la rama correcta antes de commitear. En **modo worktree** se omite: `EnterWorktree` fija el cwd/rama del worktree y los subagentes lo heredan (ver [Modo worktree](modo-worktree.md)).

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

La licencia y sus tres condiciones viven en [`coding-agent-policies.md`](../../../references/coding-agent-policies.md) Sección 2, que regula la review local por el **pedido de review humana** (`gh pr ready`) y no por la apertura del PR.

### No hacer en esta fase

- Pushear antes de terminar los pasos del plan (el push va en el cierre de la fase, con el borrador).
- Marcar el PR listo para review — eso es Fase 6.
- Saltear tests ante un cambio de comportamiento en runtime.
- Crear barrels (`index.ts` re-export).
- Dejar código comentado.

> **Al terminar esta fase:** abrir [`fase-4-review.md`](fase-4-review.md).
