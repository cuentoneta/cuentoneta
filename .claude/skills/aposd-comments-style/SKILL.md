---
name: aposd-comments-style
description: Reglas para escribir comentarios de código, basadas en "A Philosophy of Software Design" de John Ousterhout (2.ª ed., capítulos 12, 13, 15 y 16). Aplicá esta skill CADA VEZ que se escriba o modifique código en cualquier lenguaje — funciones nuevas, clases, componentes, refactors, corrección de bugs, boilerplate generado — aunque el usuario nunca mencione los comentarios. Gobierna cuándo comentar, cuándo NO comentar, y cómo. Usala también cuando el usuario pida "agregar comentarios", "documentar esta función/clase", o se queje de la calidad de los comentarios.
---

# Comentarios de código (doctrina Ousterhout)

El propósito de los comentarios es capturar información que estaba en la mente del diseñador pero que no pudo representarse en el código. Los comentarios no son decoración: el comentario de interfaz ES la abstracción. Si el lector debe abrir el cuerpo de una función para saber qué hace, la abstracción falló.

## La regla que gobierna todo

**Los comentarios deben describir cosas que no son obvias a partir del código.**

Antes de escribir cualquier comentario, aplicá dos tests:

1. **Test del lector**: ¿podría un lector haber escrito este comentario con solo mirar el código adyacente? Si sí, no lo escribas.
2. **Test del vocabulario**: ¿el comentario reutiliza mayormente las palabras que ya están en el nombre de la función/variable/clase? Si sí, no aporta nada — eliminalo o hacelo decir algo que el nombre no puede decir.

Un comentario debe situarse en un **nivel de detalle distinto al del código**:

- **Nivel más bajo (precisión)** — para declaraciones: unidades, límites inclusivos/exclusivos, semántica de null, propiedad de recursos, invariantes, rangos válidos.
- **Nivel más alto (intuición)** — dentro de los cuerpos: qué logra un bloque y por qué, omitiendo la mecánica.
- **Mismo nivel que el código = reformulación = ruido.** Nunca lo emitas.

## Densidad por defecto

El código bien diseñado necesita pocos comentarios. El default para un método corto con buen nombre es: comentario de interfaz si es público o no obvio, y **cero** comentarios de implementación. No narres. Ante la duda entre un comentario mediocre y ningún comentario, elegí ningún comentario — excepto en interfaces públicas, donde la ausencia es el defecto.

## Comentarios primero (al crear abstracciones nuevas)

Al diseñar una clase o función no trivial, escribí su comentario de interfaz **antes** que el cuerpo. Usalo como canario de diseño:

- Si el comentario resulta difícil de escribir, largo o enrevesado → la abstracción es mala; rediseñá antes de codificar.
- Buena señal de un módulo profundo: el comentario de interfaz es mucho más corto y simple que la implementación.

## Reglas por categoría

### Comentarios de interfaz (sobre clases y funciones públicas/exportadas)

Describen la abstracción desde la **perspectiva del llamador**: comportamiento general, significado de cada parámetro y del valor de retorno, efectos secundarios, excepciones/errores lanzados, y precondiciones.

- **Nunca filtres detalles de implementación** en un comentario de interfaz. Si el llamador no lo necesita, no corresponde ahí. ("Usa búsqueda binaria sobre el índice ordenado" → detalle de implementación, salvo que sea una garantía de performance que forme parte del contrato.)
- En lenguajes tipados (TypeScript, etc.), no repitas lo que la firma ya dice. `@param items - los items` es ruido; `@param items - deben venir pre-ordenados por id; los duplicados se descartan silenciosamente` es un contrato.

### Comentarios de miembros de datos / variables

Comentá el **sustantivo, no el verbo**: qué representa el valor, sus unidades, restricciones e invariantes — no cómo se manipula en otras partes.

```ts
// MAL: se incrementa en processBatch y se resetea en flush
retryCount = 0;

// BIEN: intentos de entrega fallidos consecutivos del mensaje actual;
// vuelve a 0 ante cualquier éxito. La entrega se aborta cuando supera MAX_RETRIES.
retryCount = 0;
```

### Comentarios de implementación (dentro de los cuerpos)

Explicá **qué** logra un bloque y **por qué** — nunca el _cómo_ línea por línea; el código es el cómo. Usos legítimos:

- Anunciar el objetivo de un bloque o bucle importante como un todo ("Fusionamos rangos sucios adyacentes para emitir una sola escritura por región").
- Explicar código no obvio o contraintuitivo ("Iteramos en reversa: hacer splice hacia adelante invalida los índices").
- Registrar una razón que de otro modo se perdería ("El orden importa: el interceptor de auth debe registrarse antes que el de retry").

Los métodos cortos y claros no necesitan ninguno de estos.

### Comentarios inter-módulo

Cuando una decisión de diseño atraviesa varios archivos, documentala **una sola vez** en un lugar central y descubrible —en este repo, `docs/` o una referencia de `.claude/references/`— y referencíala desde los demás sitios. Nunca pegues la misma explicación en varios archivos.

## Anti-patrones — nunca produzcas esto

1. **Narración**: `// recorremos los usuarios`, `// llamamos a la API`, `// devolvemos el resultado`.
2. **Eco de la firma**: un JSDoc/docstring que reformula el nombre y los tipos sin agregar contrato.
3. **Comentarios changelog**: `// actualizado para arreglar el null`, `// agregado por Claude`. La historia vive en el control de versiones, no en el código.
4. **Banners de sección para código trivial**: `// ===== HELPERS =====` desperdigados en un archivo de 60 líneas.
5. **Código comentado** abandonado después de una edición.
6. **Filtración de implementación** en comentarios de interfaz.
7. **Ritmo comentario-por-línea**: alternar un comentario / una sentencia a lo largo de un cuerpo.
8. **Comentarios de disculpa/incertidumbre** en código entregado: `// esto es medio hacky pero funciona`. O lo arreglás, o documentás la restricción que fuerza el tradeoff.
9. **Censos**: `// las doce imágenes del corpus`, `// las siete queries que la usan`. Contar el contenido se pudre — ver [Cantidades](#cantidades-la-regla-sí-el-censo-no).

## Mantener los comentarios al modificar código

- Al cambiar código, **actualizá sus comentarios en la misma edición**. Antes de terminar, releé el diff y revisá cada comentario cercano por obsolescencia.
- Mantené cada comentario lo más cerca posible del código que describe; si una edición aleja el código de su comentario, mové también el comentario.
- Nunca dupliques documentación: si el dato ya está documentado en un lugar natural, referencialo en vez de reformularlo.
- No elimines un comentario preexistente que simplemente te parezca redundante mientras hacés una tarea no relacionada — esa es una decisión de auditoría, no un efecto secundario. (Excepción: el comentario se volvió falso por tu cambio; entonces corregilo o eliminalo.)

## Reglas propias de este repositorio

Donde la doctrina de arriba y las convenciones de La Cuentoneta no coincidan, mandan estas.

- **El rationale del cambio va al commit, no al comentario.** Qué reemplaza, por qué se migró, qué contexto histórico lo explica: eso vive en el mensaje de commit y en la descripción del PR. Lo que sí va al comentario es el porqué que **sigue rigiendo hoy** — la restricción externa, el orden que importa, la sutileza de timing. La distinción es entre una razón vigente y la crónica de cómo se llegó a ella.
- **Un comentario no cita un issue.** Las dos únicas excepciones —un `TODO` que nombra en su misma línea el issue abierto que lo destraba, y la justificación de una supresión de lint/TS— y la prohibición de citar un identificador de hallazgo de review están definidas en [`coding-agent-policies.md`](../../references/coding-agent-policies.md) (Sección 3), con hooks y gates que las verifican. Esta skill no reenuncia esa política: remite a ella.
- **`// REASON:` junto a un `any` es obligatorio.** Lo exige [`CLAUDE.md`](../../../CLAUDE.md#restricciones-duras-hard-constraints). Ahí el comentario no es ruido: es la condición que habilita el tipo.
- **En TypeScript estricto, la firma suele agotar el contrato.** La regla general dice que en una interfaz pública la ausencia de comentario es el defecto; acá esa ausencia **no** es un defecto cuando el nombre y los tipos ya dicen todo. El comentario de interfaz se exige para lo que el tipo **no puede** decir: unidades, límites inclusivos/exclusivos, qué significa una colección vacía, efectos, precondiciones, invariantes, errores lanzados. Un docblock que repita la firma no salda esa deuda — la convierte en eco.
- **Idioma:** el código y los identificadores van en inglés; los comentarios pueden ir en español.

### Cuatro formas de ruido que este repo produce seguido

Son casos del test del lector, pero con un giro propio: acá el comentario no reformula el código de al lado, reformula una **convención ya escrita en otro archivo**. El efecto es el mismo —cero información— y además se desincroniza cuando la convención cambia. Si el dato ya vive en `CLAUDE.md` o en una referencia de `.claude/references/`, referencialo en vez de repetirlo: es el principio de los comentarios inter-módulo aplicado a la documentación del proyecto.

- **Restatear una convención ya documentada.** ❌ `// doble de test, nunca Mock*` · ❌ `// el token no lleva providedIn/factory`. La convención vive en `clean-architecture.md`.
- **Navegación / estructura obvia.** ❌ `// la implementación HTTP vive en x.provider.ts` · ❌ `// API providers (patrón provideX)`. Los imports y los nombres de archivo ya lo muestran.
- **Justificar una visibilidad que la convención ya fija.** ❌ `// public porque es la API imperativa` sobre un `input()`/`output()`/signal expuesta. Si el miembro **es** la API pública, su visibilidad ya la dicta `angular-components.md`; el modificador es autoexplicativo.
- **Anotar un reemplazo canónico.** ❌ `// reemplaza ngOnDestroy` sobre un `effect((onCleanup) => …)`. El mapeo lifecycle hook → primitiva reactiva es la regla por defecto (`angular-components.md`).

### Cantidades: la regla sí, el censo no

Un comentario **no declara cuántas cosas hay**. El conteo es justo el dato que cambia sin que nadie vuelva a mirar el comentario, y no hay gate que lo verifique: comparar prosa contra la realidad del código es lo que ningún check estático hace.

No es "nunca un número". La distinción es entre **contar el contenido** y **enunciar una regla**:

| ❌ Censo — se pudre                            | ✅ Regla — no se pudre                            |
| ---------------------------------------------- | ------------------------------------------------- |
| `// las doce imágenes del corpus`              | `// el parser exige exactamente cuatro segmentos` |
| `// las ocho portadas comparten formato`       | `// la campaña ocupa un tamaño fijo por viewport` |
| `// idéntica en las siete queries que la usan` | `// idéntica en todas las queries que la usan`    |

"Cuatro" en la columna derecha es la especificación del parser de `_ref` de `@sanity/image-url`: no cambia porque el corpus crezca. "Doce" cambia, y cambia sin aviso.

**Las enumeraciones tienen el mismo problema con un disfraz mejor.** Parecen auto-verificables —el número va seguido de la lista—, pero rotan de dos formas a la vez: el conteo y la composición, cada uno por su lado.

Al corregir uno de estos, **no se reemplaza un número por otro**: eso deja el mismo comentario esperando la próxima incorporación. Lo que se saca es el conteo.

### Comentarios de sección

Los de estilo `// Core` / `// Models` que **ya existen** en el repo se respetan donde están. No se agregan nuevos salvo que aporten navegación real en un archivo grande. Es la acotación local del anti-patrón de banners: la convención es no sumar, no barrer los viejos.

## Ejemplo trabajado

```ts
// MAL (narración + eco, sin contrato)
/**
 * Obtiene las preferencias del usuario.
 * @param userId - el id del usuario
 * @returns las preferencias
 */
async getPreferences(userId: string): Promise<Prefs> {
  // primero revisamos la caché
  const cached = this.cache.get(userId);
  // si está, la devolvemos
  if (cached) return cached;
  // si no, la buscamos en la API
  return this.fetch(userId);
}

// BIEN (solo contrato; el cuerpo no necesita nada)
/**
 * Devuelve las preferencias del usuario, con fallback a los defaults de la
 * organización para toda clave no seteada. El resultado puede tener hasta 60s
 * de staleness; llamá a invalidate() después de una escritura si necesitás
 * read-your-writes. Rechaza con NotFoundError para usuarios desconocidos o
 * desactivados.
 */
async getPreferences(userId: string): Promise<Prefs> {
  const cached = this.cache.get(userId);
  if (cached) return cached;
  return this.fetch(userId);
}
```
