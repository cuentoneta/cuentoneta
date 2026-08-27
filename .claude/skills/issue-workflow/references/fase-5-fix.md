## Fase 5 — Fix

**Propósito:** abordar los hallazgos con commits atómicos.

1. Abordar cada **Crítico** y **Advertencia** de `workspace/<number>/CODE_REVIEW.md` — y de `workspace/<number>/SECURITY_REVIEW.md` si corrió el auditor — por prioridad (Críticos primero).
2. Tras cada fix, actualizar la columna **Estado** en el archivo al que pertenece el hallazgo (`CODE_REVIEW.md` o `SECURITY_REVIEW.md`), con los valores canónicos del `code-reviewer` (Detectado / En progreso / Corregido / Descartado / Diferido / No se corrige / Requiere test E2E).
3. Un commit atómico por fix. El mensaje describe el **cambio real**, nunca referencia el número de hallazgo — la regla ya no es solo convención: un hook local (`commit-msg`) y el gate `check-findings` la verifican y rechazan un mensaje que la incumpla.
   - ✅ `[#<issue>] - Acota la constante al cuerpo de la función — estaba a nivel de módulo`
   - ❌ `[#<issue>] - Arregla el hallazgo R2`
4. Si un hallazgo se **difiere**, proponer el issue al usuario y **esperar su confirmación** antes de crearlo (`gh issue create`); una vez creado, anotar su URL junto al valor **Diferido** en la columna **Estado**. Crear un issue es una acción hacia afuera: la misma política rige en la Fase 6.
   - **Título sin prefijo de categoría** (`[Tooling]`, `[SEO]`, `[#<id>]`, ni variantes con guion o dos puntos): la categoría va en `--label` y la pertenencia a una iniciativa en la relación de sub-issue. Si ningún label existente encaja, proponer su creación al usuario en vez de codificar la categoría en el título. Ver [`coding-agent-policies.md`](../../../references/coding-agent-policies.md) Sección 2.
5. Tras abordar Críticos y Advertencias, re-correr **solo los gates del tier local que el diff de los fixes toca**, con el mismo patrón de silenciado en verde de la Fase 4. Arreglar regresiones. Re-correr el tier entero solo si los fixes tocaron superficie compartida.
6. Las **Sugerencias** son opcionales: presentarlas y dejar que el usuario decida.
7. Si un hallazgo es específicamente un **gap de cobertura de tests**, el orquestador **puede** delegar en **`test-generator`** el scaffolding de los specs faltantes (en modo worktree, adjuntar la nota de delegación de [Modo worktree](modo-worktree.md) → "Ajustes transversales"). Es un aid opcional, **no** un gate: los tests igual deben existir y pasar; el agente es solo una vía para producirlos.
8. **Pushear al borrador**, como último paso de la fase. Va al final para que también viaje lo que produzcan los pasos 6 y 7: refresca la señal de los gates delegados sobre el commit final, que es la que la Fase 6 verifica antes de marcar listo.

> **Al terminar esta fase:** abrir [`fase-6-ship.md`](fase-6-ship.md).
