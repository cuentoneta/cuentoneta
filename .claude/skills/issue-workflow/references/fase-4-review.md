## Fase 4 — Review

**Propósito:** verificar que pasen los gates de CI y correr los agentes de review.

1. Correr **el tier local** de los [gates de CI](../../../../CLAUDE.md#comandos-comunes) (con `pnpm`, nunca `nx` directo). Los gates se reparten en dos tiers, porque el borrador que abrió la Fase 3 ya está corriendo los diez en GitHub Actions:

   | Tier                      | Gates                                                       | Por qué                                                                                                                                                                                                                                                         |
   | ------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | **Local, siempre**        | `typecheck`, `lint`, `stylelint`, `test`, `check-agents`    | Baratos (~45s en paralelo) y son el único feedback rápido sobre las reglas ESLint propias del repo, que es donde más reincide un agente.                                                                                                                        |
   | **Delegados al borrador** | `build`, `storybook`, `studio-build`, `e2e`, `guard-config` | Lentos y de salida voluminosa. `e2e` además es el más frágil, porque depende del dataset, y `guard-config` solo tiene efecto en PRs desde forks, así que en local no verifica nada. El borrador los corre igual, sobre el mismo commit, y sin ocupar la sesión. |
   - **Silenciar la salida en verde.** Capturar y emitir solo ante fallo, para no volcar el log completo de un gate que pasó:

     ```bash
     out=$(pnpm lint 2>&1) || echo "$out"
     ```

     Ante rojo el log aparece entero, así que el diagnóstico no pierde nada.

   - **En modo worktree**, anteponer `NX_DAEMON=false` a todo gate de Nx y reemplazar `pnpm typecheck` por `pnpm exec tsc -p tsconfig.typecheck.json --noEmit` — ver [Modo worktree](modo-worktree.md) → "Ajustes transversales" (evita falsos rojos de teardown y resultados stale del daemon).
   - **Lanzalos concurrentemente**, no uno tras otro: son independientes entre sí. En serie tardan la **suma**; en paralelo, lo que tarde el más lento.
   - Si alguno falla: reportar cuál, diagnosticar, arreglar, commitear el fix (reglas de Fase 3) y re-correr **solo el que falló** mientras el resto sigue verde; re-correr todo solo si el fix toca superficie compartida.

   **Correr un gate delegado en local es válido** cuando el diff lo toca de lleno y conviene el ciclo corto — p. ej. `storybook` ante un cambio de stories. Lo que la tabla evita es correrlos _por rutina_.

1. **Leer la señal del borrador, sin esperarla.** `gh pr checks <pr>` sobre el PR que abrió la Fase 3 da el estado de los gates delegados, junto con las integraciones externas del repo (los despliegues de Vercel, que el borrador también dispara). Para no bloquear la sesión, vigilarlos en segundo plano (`gh pr checks <pr> --watch --fail-fast`) y seguir con la review: si algo se pone rojo, la notificación llega sola. Si al momento de delegar la review el borrador sigue corriendo, se reporta **en curso** — la Fase 6 verifica el verde final antes de marcar listo.

   > **"Sin esperarla" significa seguir trabajando, no cortar.** No bloquear la sesión es lo contrario de terminar el turno: mientras CI corre, la fase sigue —se delega la review, se abordan sus hallazgos—. Anunciar que se espera un resultado y devolver el control es la forma de convertir una optimización en una interrupción.

1. **Determinar si el diff toca superficie de seguridad.** La lista de disparadores es la sección **"Cuándo correr"** del agente `security-auditor`: `src/api/**` (endpoints, GROQ, mappers), manejo de contenido externo (PortableText/HTML del CMS, `bypassSecurityTrust*`, fetch a servicios externos, `localStorage`), variables de entorno / secrets / config de Sanity o Clarity, y dependencias (`package.json` / `pnpm-lock.yaml`). Un diff que no toca nada de eso —solo documentación, estilos o UI sin datos externos— **no** la amerita; el auditor también puede invocarse a demanda si surge una preocupación puntual.
1. **Delegar las reviews — en paralelo si corren ambas.** Si el diff toca superficie de seguridad, lanzar al **`security-auditor`** y al **`code-reviewer`** en el **mismo turno** (ambas delegaciones en una única respuesta, igual que los gates del paso 1): sus reviews son independientes y no comparten archivo de salida. Si no la toca, delegar solo al `code-reviewer`. Cada delegación incluye la ruta de salida completa del agente (ver el paso siguiente); en modo worktree, adjuntar además la nota de delegación de [Modo worktree](modo-worktree.md) → "Ajustes transversales" a cada Task delegada. En ambos casos el `code-reviewer` revisa todos los cambios de la rama vs. `<base>` (la ref resuelta en la Fase 0 → "Base de la rama"; default `develop`/`origin/develop`) y recibe **el resultado observado de los gates del paso 1** (qué corriste, con qué resultado, y cuáles omitiste por no aplicar al diff) — sin ese dato los vuelve a correr, que es la parte más cara de la review.
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
