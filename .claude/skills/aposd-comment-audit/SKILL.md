---
name: aposd-comment-audit
description: Auditá los comentarios de un codebase completo, un directorio o un conjunto de archivos contra "A Philosophy of Software Design" de John Ousterhout (2.ª ed.) y producí un informe de hallazgos con remediación opcional. Usala siempre que el usuario pida auditar, revisar, limpiar, evaluar o "arreglar los comentarios" de código existente, se queje de la calidad o el ruido de los comentarios en un repo, o quiera encontrar interfaces públicas sin documentar. Es un workflow explícito — no la dispares solo porque se esté escribiendo código (para eso está la skill aposd-comments-style). Auditar los comentarios que un diff agrega o modifica, durante una review, sí es un uso previsto.
---

# Auditoría de comentarios

Evaluá sistemáticamente los comentarios existentes en un codebase — tanto los comentarios que no deberían existir como los que faltan — y luego informá los hallazgos y, opcionalmente, remediá.

La doctrina (reglas y ejemplos de cada chequeo) vive en `references/checks.md`. Leela antes de clasificar hallazgos.

## Modo acotado por diff (desde una review)

El [`code-reviewer`](../../agents/code-reviewer.md) aplica estos chequeos sobre **los comentarios que un diff agrega o modifica**. Es un uso previsto, y no contradice la advertencia del `description` de esta skill: lo que ahí se prohíbe es dispararla **mientras se escribe** código —para eso está [`aposd-comments-style`](../aposd-comments-style/SKILL.md), que la Fase 3 del skill [`issue-workflow`](../issue-workflow/SKILL.md) carga explícitamente—, no auditar un diff ya escrito. Auditar es justamente lo que esta skill hace; lo que cambia es el alcance, no el criterio.

Tres ajustes al workflow de abajo, y solo tres:

- **El alcance no se confirma con el usuario** (paso 1): lo fija el diff. Entran los archivos que el diff toca y **solo las líneas que agrega o modifica** — un comentario preexistente que el diff no tocó no es un hallazgo, aunque incumpla. Auditar el archivo entero convierte la señal en ruido y le atribuye al PR deuda que no contrajo.
- **El inventario se acota a esos archivos** (paso 2): `pnpm comments:inventory` recibe la lista de archivos cambiados, no un directorio. Como devuelve todo comentario del archivo, el recorte por líneas se hace después, cruzando contra el diff. Las estadísticas de base (comentarios por KLOC, cobertura de docs) no aplican — miden un codebase, no un cambio.
- **No hay informe propio** (paso 4): los hallazgos van a las tablas de la review, con el identificador que ésta les asigna. El veredicto (`UPDATE`, `DELETE`, `REWRITE`, `RELOCATE`, `ADD`) se nombra dentro de la descripción del problema.

La remediación (paso 5) tampoco es de esta skill acá: la aplica la Fase 5 del flujo, junto con el resto de los hallazgos de la review.

## Workflow

### 1. Alcance

Confirmá con el usuario antes de escanear:

- Qué rutas entran en el alcance (default: directorios de código fuente; excluir `node_modules`, `dist`, archivos generados, código vendorizado, fixtures de tests).
- Si los archivos de test entran en el alcance (default: sí, pero con expectativas de densidad relajadas).
- Solo informe, o informe + remediación.

### 2. Inventario

Ejecutá `pnpm comments:inventory` con las rutas del alcance para producir un inventario JSON de cada comentario con archivo, línea, tipo (line/block/doc) y texto. Cae en `workspace/`, que está gitignoreado; con `--out` se elige otro destino. El escáner vive en [`scripts/extract-comments/extract-comments.ts`](../../../scripts/extract-comments/extract-comments.ts) y solo cubre las extensiones que este repo contiene — para cualquier otro lenguaje, recurrí a `rg` con su sintaxis de comentarios. Recolectá además el conjunto de **símbolos públicos/exportados sin comentario de documentación** — la documentación faltante es un hallazgo, no solo la documentación mala.

Registrá estadísticas de base: total de comentarios, comentarios por KLOC, cobertura de doc-comments sobre símbolos exportados.

### 3. Clasificá cada hallazgo

Evaluá cada comentario contra los chequeos de `references/checks.md` y etiquetá las violaciones con un veredicto:

| Veredicto  | Significado                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DELETE`   | Ruido puro: narración, eco de la firma, changelog, código comentado, banners de relleno.                                                                            |
| `REWRITE`  | Ubicación correcta, contenido incorrecto: reformulación al mismo nivel, implementación filtrada en un comentario de interfaz, vaguedad donde se necesita precisión. |
| `RELOCATE` | Contenido correcto, lugar incorrecto: lejos del código que describe, duplicado entre archivos, enterrado en el módulo equivocado.                                   |
| `UPDATE`   | Obsoleto: contradice el código actual. Máxima severidad — peor que ningún comentario.                                                                               |
| `ADD`      | Faltante: símbolo exportado/público sin comentario de interfaz, o código complicado sin explicación.                                                                |
| `OK`       | Sin acción. No los listes individualmente; contalos.                                                                                                                |

Para hallazgos `UPDATE`, leé el código circundante lo suficiente para enunciar _qué_ es ahora falso. Para hallazgos `ADD` sobre interfaces, redactá el comentario faltante como parte del hallazgo.

### 4. Informe

Escribí el informe como archivo Markdown bajo `workspace/` (no en el chat), con esta estructura:

```markdown
# Auditoría de comentarios — <repo/alcance> — <fecha>

## Resumen

<2-4 oraciones: salud general, modos de falla dominantes, números principales>

## Métricas

| Métrica                                               | Valor    |
| ----------------------------------------------------- | -------- |
| Archivos escaneados / comentarios encontrados         |          |
| Cobertura de docs sobre símbolos exportados           | n/m (x%) |
| Hallazgos: UPDATE / DELETE / REWRITE / RELOCATE / ADD |          |

## Hallazgos por severidad

### UPDATE (obsoletos — corregir primero)

- `ruta/archivo.ts:41` — el comentario dice X; el código ahora hace Y. Corrección sugerida: <texto>

### ADD (docs de interfaz faltantes)

- `ruta/api.ts:12 exportedFn` — borrador: <comentario propuesto>

### DELETE / REWRITE / RELOCATE

<agrupados, una línea cada uno, con texto de reemplazo sugerido para REWRITE>

## Patrones y recomendaciones

<hábitos recurrentes que vale la pena corregir en el origen: p. ej., "ecos de JSDoc en cada método de servicio Angular — probablemente una regla de lint que fuerza docs vacías">
```

Orden de severidad: `UPDATE` → `ADD` → `REWRITE` → `RELOCATE` → `DELETE`. Los comentarios obsoletos engañan activamente; el ruido solo hace perder tiempo.

### 5. Remediación (solo si se pide)

- Aplicá en orden de severidad, una categoría por lote, para que el diff sea revisable.
- Los lotes `DELETE` son seguros y pueden aplicarse en bloque tras la confirmación del usuario.
- `REWRITE`/`UPDATE`/`ADD` cambian el significado: mostrá el texto propuesto en el informe primero; aplicá tras aprobación.
- **Nunca alteres código ejecutable** durante una auditoría de comentarios — si un comentario es inescribible porque la abstracción es mala (haría falta un comentario de interfaz largo y enrevesado), reportalo como hallazgo de _design smell_ en vez de refactorizar.

## Calibración

- No fabriques hallazgos para parecer exhaustivo. Un archivo sano puede arrojar cero hallazgos; decilo.
- Comentarios escasos en código limpio son lo correcto, no un déficit. Solo marcá `ADD` donde las reglas de Ousterhout lo exigen (interfaces públicas, código genuinamente no obvio).
- Respetá las convenciones intencionales del proyecto (headers de licencia, pragmas exigidos por el lint) — anotalas una vez en Patrones, no marques cada instancia.

## Reglas propias de este repositorio

La doctrina de qué comentar y qué no es canónica en [`aposd-comments-style`](../aposd-comments-style/SKILL.md); esta skill audita contra ella. Donde los chequeos importados y las convenciones de La Cuentoneta no coincidan, mandan estas.

- **La forma del `TODO` es la del repo**, no `TODO(owner)`: `// TODO(#<issue_id>): …` o `// TODO: … (ver #<issue_id>)`, con el número del issue **abierto** en esa misma línea. Es una de las dos únicas formas en que un comentario puede citar un issue; la otra es la justificación de una supresión de lint/TS. Todo lo demás está prohibido y lo verifican hooks y gates — la política vive en [`coding-agent-policies.md`](../../references/coding-agent-policies.md) (Sección 3).
- **Un `TODO` cuyo issue ya cerró pierde la excepción**: el veredicto es `REWRITE` (enunciar la condición que lo destraba, sin el número) o `DELETE` si el trabajo ya se hizo. Detectarlo exige consultar el estado real en GitHub; el sweep programado (`pnpm issue-refs:sweep`) ya lo hace, así que conviene leer su reporte antes de marcar estos hallazgos a mano.
- **`// REASON:` junto a un `any` nunca es un hallazgo**: lo exige [`CLAUDE.md`](../../../CLAUDE.md#restricciones-duras-hard-constraints).
- **Los identificadores de hallazgo son efímeros.** Los que emitan las reviews (`R<n>`, `S<n>`) viven en `workspace/` y mueren con su sesión: no se citan desde un comentario, ni desde un mensaje de commit, ni desde el cuerpo de un PR. Los veredictos de esta skill (`UPDATE`, `ADD`, `REWRITE`…) tampoco — la remediación escribe el comentario corregido, no su clasificación.
- **Los comentarios pueden ir en español**; el código y los identificadores, en inglés. Un comentario en español no es un hallazgo.
