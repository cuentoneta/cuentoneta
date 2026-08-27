## Fase 2 — Plan

**Propósito:** producir un plan de implementación detallado para aprobación.

1. **Determinar si el issue amerita asesoría previa de dominio o de arquitectura** (mismo patrón con el que la Fase 4 decide si convoca al `security-auditor`, pero _antes_ de planificar). A partir del alcance del issue (el body de la Fase 0 + una exploración inicial):
   - **`domain-model-advisor`** si el issue crea o modifica entidades de dominio o value objects (`@models/*`, `src/models/`), mappers del ACL (`src/api/_utils/`), queries GROQ (`src/api/_queries/`) o tipos de dominio compartidos.
   - **`architecture-advisor`** solo ante un cambio **estructuralmente significativo**: módulo nuevo bajo `src/api/modules/<dominio>/`, feature/provider/interfaz `-api` nuevo en el frontend, bounded context nuevo, o cambio de límites de módulo / dirección de dependencias. Un ajuste localizado —UI, copy, estilos, un campo puntual— **no** lo amerita: el `plan-writer` ya carga las mismas referencias según el diff y su pasada basta.
2. **Delegar en paralelo los advisors que matcheen** (ambas delegaciones en el mismo turno si aplican los dos; son independientes y devuelven su evaluación como **texto**, no como archivo — no tienen `Write`). En modo worktree, adjuntar la nota de delegación de [Modo worktree](modo-worktree.md) → "Ajustes transversales". Capturar su salida.
3. Delegar al agente **`plan-writer`** pasándole la URL del issue, su descripción (el **body** recolectado en la Fase 0 → "Datos del issue"), el nombre de rama, la ruta de salida completa (`workspace/<number>/PLAN.md`) y **la evaluación de los advisors que corrieron en el paso 2**. Los advisors los corre el orquestador —no el `plan-writer`, que no puede delegar en subagentes— y su aporte entra en el prompt del plan. En modo worktree, adjuntar la nota de delegación. Si la Fase 0 reanudó acá con un plan ya escrito, saltear los pasos 1-3 (los advisors ya corrieron y su aporte vive en el plan) y pasar directo al resumen.

   **Excepción — escribir el plan inline.** El orquestador puede redactar `PLAN.md` él mismo, sin delegar, cuando se cumplen **las cuatro** condiciones:

   1. El alcance declarado del issue no toca código ejecutable — ni `src/**`, ni `cms/**`, ni `scripts/**`, ni `tools/**`. Solo `.claude/**`, `docs/**` o configuración de tooling.
   2. Ningún advisor del paso 1 matcheó.
   3. El issue enumera sus archivos de alcance y el orquestador **ya los leyó en esta sesión**. Es la condición que hace real el ahorro: si hay que abrirlos ahora, el subagente los lee en su propia ventana y delegar sale más barato.
   4. El orquestador ya leyó `coding-agent-policies.md` en esta sesión, que es la única referencia que el `plan-writer` carga siempre.

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
