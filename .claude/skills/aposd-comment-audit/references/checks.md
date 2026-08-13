# Chequeos de auditoría (Ousterhout, "A Philosophy of Software Design", 2.ª ed.)

Cada chequeo indica: qué detectar, por qué es un defecto, el veredicto a asignar, y ejemplos. Aplicá primero los dos tests universales — resuelven la mayoría de los casos:

- **Test del lector**: ¿podría un lector haber escrito este comentario con solo mirar el código adyacente? → ruido.
- **Test del vocabulario**: ¿el comentario reutiliza mayormente las palabras del nombre del símbolo? → ruido.

## C1 — Narración (veredicto: DELETE)

El comentario reformula la(s) siguiente(s) sentencia(s) en lenguaje natural al mismo nivel de detalle.

```js
// recorremos las órdenes           ← DELETE
for (const order of orders) {
// incrementamos el contador        ← DELETE
count++;
```

Por qué: los comentarios al mismo nivel aportan cero información y quedan obsoletos al primer cambio.

## C2 — Eco de la firma (veredicto: DELETE, o REWRITE si hay un contrato real descubrible)

Doc-comment que reformula el nombre/los tipos sin contrato: sin unidades, sin límites, sin semántica de null, sin efectos secundarios, sin errores.

```ts
/** Obtiene la config. @param key - la clave @returns el valor de config */
getConfig(key: string): ConfigValue
```

Si leer la implementación revela un contrato real (¿lanza error si la clave no existe? ¿devuelve un default? ¿cachea?), el veredicto es REWRITE con el contrato descubierto. Si no, DELETE.

## C3 — Comentarios changelog / de atribución (veredicto: DELETE)

`// bug corregido 2024-03-01`, `// agregado por <nombre/herramienta>`, `// refactorizado desde v1`. La historia pertenece al control de versiones.

Acá este repo **invierte** la excepción del original. Un comentario que referencia un ticket para justificar una decisión no se conserva: la única cita admitida es la de un `TODO` con su issue abierto en la misma línea, o la de una supresión de lint/TS. El veredicto correcto es `REWRITE` — se conserva el porqué, se quita el número:

```ts
// MAL: El orden importa, ver #<issue_id>
// BIEN: El orden importa: el interceptor de auth debe registrarse antes que el de retry.
```

Si la razón se perdió y solo queda el número, el porqué se recupera del historial de git y se escribe en prosa; el hallazgo no se cierra dejando la cita.

## C4 — Código comentado (veredicto: DELETE)

Código muerto en forma de comentario. El control de versiones lo preserva. Excepción: un bloque deliberadamente deshabilitado, explícitamente etiquetado, con una razón y una condición de re-habilitación — marcalo como RELOCATE/REWRITE si no está etiquetado.

## C5 — Filtración de implementación en comentarios de interfaz (veredicto: REWRITE)

El comentario de interfaz describe internals de los que el llamador no debe depender.

```ts
/** Trae los usuarios. Recorre el array de páginas y concatena los
    resultados de cada llamada axios, después filtra con lodash. */
```

Reescribí a la vista del llamador: comportamiento, argumentos, retorno, efectos secundarios, errores, precondiciones. Conservá internals solo cuando forman parte del contrato (garantías de complejidad, comportamiento bloqueante).

## C6 — Vaguedad donde se necesita precisión (veredicto: REWRITE)

Comentarios de declaración que omiten la información que el código no puede expresar: unidades, límites inclusivos/exclusivos, significado de null, propiedad/tiempo de vida, invariantes, rangos válidos.

```ts
// el timeout                ← REWRITE
timeout: number;
// BIEN: timeout de la request en ms; 0 deshabilita el timeout por completo
```

## C7 — Comentarios-verbo en miembros de datos (veredicto: REWRITE)

El comentario del miembro describe cómo/dónde se manipula el campo en vez de qué representa. Reescribí al sustantivo: qué significa el valor, sus restricciones.

## C8 — Falta de justificación en código no obvio (veredicto: ADD)

Código contraintuitivo, dependiente del orden, o workaround sin su _porqué_. Iteración en reversa, sleeps mágicos, ordenamientos específicos, reglas de lint deshabilitadas, constantes raras. Redactá el comentario-porqué faltante; si el porqué no puede determinarse del contexto, marcá "justificación desconocida — preguntar al autor".

## C9 — Interfaz pública sin documentar (veredicto: ADD)

Clase, función o módulo exportado/público sin comentario de interfaz — **salvo** que la abstracción sea tan evidente que nombre + tipos formen el contrato completo (p. ej., `isEmpty(s: string): boolean`). En TypeScript estricto ese caso **no es raro**: la firma ya expresa parámetros, retorno y nulabilidad. Acá `ADD` se reserva para el contrato que el tipo no puede expresar — unidades, límites inclusivos/exclusivos, semántica de una colección vacía, efectos, precondiciones, invariantes, errores lanzados. Un docblock que repita la firma no salda este hallazgo: lo convierte en C2. Redactá el comentario: comportamiento, significado de params más allá de los tipos, efectos secundarios, errores, precondiciones. Si redactarlo con honestidad exige un comentario largo y enrevesado, registrá además un hallazgo de **design smell** (módulo superficial / mala abstracción) — según Ousterhout, difícil-de-comentar significa mal-diseñado.

## C10 — Comentario obsoleto (veredicto: UPDATE — máxima severidad)

El comentario contradice el código actual: lista de parámetros incorrecta, describe comportamiento eliminado, unidades erróneas, referencias muertas. Verificá contra el código antes de marcar; enunciá con precisión qué es falso y proponé el texto corregido.

## C11 — Documentación duplicada (veredicto: RELOCATE)

La misma explicación de diseño pegada en varios lugares. Conservá una copia canónica en la ubicación más natural; reemplazá las demás por una referencia corta. Los casi-duplicados divergentes son simultáneamente candidatos a C10.

## C12 — Comentario distante (veredicto: RELOCATE)

Comentario separado de su sujeto (bloque al tope del archivo describiendo internals de funciones específicas; comentario huérfano tras refactors). Movelo junto al código que describe.

Acotación de este repo: el chequeo aplica al **contrato o al diseño vigente** que debería vivir junto al código. **No** aplica al rationale del cambio —qué reemplaza, por qué se migró, qué contexto histórico lo explica—, que vive en el mensaje de commit **a propósito**. Traerlo al código no es una relocalización: es introducir el comentario changelog que C3 prohíbe.

## C13 — Banners de relleno (veredicto: DELETE)

Separadores `// ==== HELPERS ====` en archivos cortos, divisores ASCII-art, headers boilerplate sin información (excluyendo headers de licencia legalmente requeridos). En archivos genuinamente largos, un banner puede pasar si ayuda a navegar — cuestión de criterio, inclinate por DELETE.

Acotación de este repo: los comentarios de sección de estilo `// Core` / `// Models` **que ya existen se respetan donde están**. La convención es no agregar nuevos, no barrer los viejos; una auditoría no los borra por sí sola. El chequeo queda para los banners que aparezcan de ahora en más.

## C14 — Ritmo comentario-por-línea (veredicto: DELETE la narración, y re-chequear C8)

El cuerpo alterna un comentario / una sentencia. Eliminá la narración en bloque, y después evaluá si el bloque merece UN comentario de nivel más alto que enuncie qué logra como un todo.

## C15 — Censo en el comentario (veredicto: REWRITE, o UPDATE si el número ya es falso)

El comentario declara **cuántas cosas hay**: `// las doce imágenes del corpus`, `// las siete queries que la usan`, `// las ocho portadas`. El conteo es el dato que cambia sin que nadie vuelva a mirar el comentario, y ningún gate lo verifica.

Distinguí **contar el contenido** de **enunciar una regla**. `// el parser exige exactamente cuatro segmentos` es correcto: cuatro es la especificación del parser, no un inventario. `// las ocho portadas` es un censo, aunque hoy sean ocho.

Las **enumeraciones** entran acá igual, y se desactualizan de dos formas a la vez —el número y la composición—, cada una por su lado.

Veredicto: `REWRITE` si el conteo todavía es correcto (se saca igual, porque va a dejar de serlo), y `UPDATE` si ya es falso — ahí además engaña. En los dos casos **no se reemplaza un número por otro**: eso deja el mismo comentario esperando la próxima incorporación.

La doctrina completa vive en [`aposd-comments-style`](../../aposd-comments-style/SKILL.md) → "Cantidades: la regla sí, el censo no".

## Qué explícitamente NO es un hallazgo

- La ausencia de comentarios de implementación en métodos cortos y claros — ese es el estado ideal.
- Un `TODO` que sigue la convención del repo: el issue **abierto** que lo destraba, nombrado en su misma línea. `FIXME` no es una forma en uso acá. Los `TODO` cuyo issue ya cerró van a Patrones o a `REWRITE`, no como hallazgo por línea.
- Headers de licencia, pragmas exigidos por el lint con su justificación enlazada, anotaciones requeridas por el framework, y el `// REASON:` que acompaña obligatoriamente a un `any`.
- Comentarios escritos en español: es la convención del repo, con el código en inglés.
- Comentarios de "intuición" de alto nivel que omiten detalle — omitir detalle es su trabajo; solo marcalos si son falsos (C10) o duplicados (C11).
- **Comentarios en código generado.** Los emite el generador, no una persona: no expresan una decisión de diseño que se pueda evaluar, y remediarlos se pierde en la próxima regeneración. Se excluyen del alcance y se declara la exclusión en el informe, en vez de contarlos como hallazgos ignorados.
- **Anotaciones de unidad en hojas de estilo** — la traducción entre paréntesis del valor que la declaración expresa en otra unidad. No son un censo (C15) ni un eco, porque el valor anotado no está escrito en la línea: le ahorran al lector una conversión mental. Como cualquier otro comentario, **sí son hallazgo si mienten**: una traducción que ya no corresponde a su declaración es `UPDATE`, y de la peor clase, porque nada la verifica.
