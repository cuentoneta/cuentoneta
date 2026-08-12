# `storylist-to-collection`

Crea una colección publicada por cada storylist publicada. No renombra ni modifica el origen: emite un documento nuevo al lado, con la forma del tipo `collection`.

`storylist` no se toca en ningún momento, así que la página vieja sigue sirviéndose durante toda la convivencia y la reversión es un borrado limpio.

## Prerequisito

**`story-to-literary-work` tiene que estar aplicada con `--no-dry-run` en el mismo dataset.** El reapuntado deriva el identificador de cada obra a partir del de su cuento; si la obra no existe y la referencia es fuerte, el content lake rechaza la transacción entera al escribir.

El dry-run **no** lo detecta: imprime mutaciones sin llegar al servidor. Por eso el censo previo es un paso obligatorio del procedimiento, no una sugerencia.

## Por qué una migración y no un renombre

Sanity no admite patchear `_type`. Renombrar el tipo obligaría igual a crear documentos nuevos y dar de baja los viejos, así que conviene crearlos ya con la forma correcta —sin pestañas, con la descripción en Markdown y agregando obras literarias— en vez de arrastrar la forma vieja y corregirla después.

## Mapeo campo por campo

| Campo destino                                     | Origen        | Regla                                                                                                     |
| ------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------- |
| `_id`                                             | `_id`         | Derivado: `collection-from-storylist-<uuid>`, conservando el prefijo de path del origen y **encabezando** |
| `_type`                                           | —             | `collection`                                                                                              |
| `title`, `slug`                                   | iguales       | Uno a uno; aborta si falta cualquiera                                                                     |
| `description`                                     | `description` | Portable Text convertido a Markdown; aborta si queda vacía                                                |
| `literaryWorks`                                   | `stories`     | Cada referencia reapuntada a su obra migrada, con el `_key` de origen y su fuerza preservada              |
| `featuredImage`, `tags`, `config`, `mediaSources` | iguales       | Viajan sin transformar; la clave se **omite** cuando el origen no la trae, nunca se escribe vacía         |
| `tabs`                                            | —             | **No se lee ni se escribe**: no existe en el tipo destino                                                 |
| `count`                                           | —             | No existe en el schema; se deriva en el mapper como longitud del array                                    |

### El identificador derivado

Sostiene cuatro cosas a la vez sin agregar ningún campo al schema: la **correspondencia** entre cada colección y su storylist, la **idempotencia** (con `createIfNotExists`, re-migrar es un no-op del lado del servidor), la **reversión** (la inversa filtra por el prefijo) y que **nada se publique por accidente**.

Lo último merece su propia línea: Sanity lee `drafts.` como borrador solo cuando **encabeza** el `_id`. Concatenarlo detrás del prefijo de la migración produciría un documento publicado con nombre de borrador, y contenido inédito quedaría en línea sin que nada lo señale.

Se descartó un campo `migratedFrom` en el schema: sería un campo permanente del dominio nuevo para un problema transitorio, y por sí solo no daría idempotencia.

### La fuerza de las referencias

La regla tiene dos mitades, y las dos importan:

1. **`_weak` se copia del miembro de origen cuando está, y no se agrega cuando no está.** La migración no introduce debilidad ni la quita: la integridad referencial de la colección es un espejo exacto de la de su storylist. Sintetizar debilidad donde el origen no la tiene taparía un dataset a medio migrar; quitarla haría que el content lake rechazara la escritura, porque una referencia fuerte exige que el destino exista.

2. **`_strengthenOnPublish` se retraduce, no se copia.** La forma en el corpus lleva **el tipo del documento destino**, y el destino cambió: se emite `{ type: 'literaryWork', template: { id: 'literaryWork' } }`. Copiarla tal cual dejaría una referencia a un `literaryWork` prometiéndole al Studio fortalecerla contra un `story`.

Un caso que la regla **no** cubre, dicho explícitamente: una referencia fuerte cuya obra publicada no existe porque el prerequisito no se cumplió. Eso no es debilidad que inventar, es una violación del prerequisito, y la corrida debe fallar ruidosamente al escribir.

### Las pestañas se descartan sin perder contenido

El tipo destino no tiene `tabs`, y el corpus no tiene ninguna cargada. Medido en los tres datasets:

```groq
count(*[_type == "storylist" && count(tabs) > 0])
```

Resultado: **cero** en `production`, `staging` y `development`. Por eso no se exporta nada antes de descartar el campo.

### Qué construcciones trae la prosa

Medido sobre el corpus, para que el contraste de fidelidad sepa qué buscar:

```groq
{
  "estilos": array::unique(*[_type == "storylist"].description[].style),
  "listItems": array::unique(*[_type == "storylist"].description[].listItem),
  "marcas": array::unique(*[_type == "storylist"].description[].children[].marks[]),
  "tiposMarkDef": array::unique(*[_type == "storylist"].description[].markDefs[]._type)
}
```

Un único estilo de bloque (`normal`), un único tipo de ítem de lista (`bullet`), decoradores `strong` y `em`, y `link` como único tipo de markDef. Sin encabezados, sin `code`, sin listas numeradas: todo cae dentro de lo que el conversor traduce, así que la corrida no se detiene por `UnsupportedPortableTextError`.

**Las listas de viñetas no son un caso de borde:** las traen 8 de las 36 descripciones. `florilegio-50-2025` es la muestra útil para el contraste —un párrafo introductorio y seis ítems, con negritas, enlaces y una cursiva—, porque ejercita todo el inventario de una sola vez.

## Aborta en vez de degradar

Ante un dato del que no se puede derivar una colección válida —sin título, sin slug, sin descripción, con miembros sin `_key`, o con una referencia que apunta a un borrador— el núcleo lanza `UnmigratableStorylistError` y la corrida se detiene identificando el documento.

En el ámbito publicado esa es la única respuesta correcta: una storylist publicada incompleta es un error del dataset, no un estado legítimo. La migración de borradores toma la decisión opuesta, por la razón opuesta; su README lo explica.

## Procedimiento

Cada fase corre **por dataset**, y ningún gate de CI detecta uno sin migrar.

1. **Censar.** Storylists publicadas y en borrador, cuántas tienen pestañas, y —para las que el filtro admite— cuántas referencias quedarían **colgantes** tras el reapuntado. Cualquier valor distinto de cero en esa última columna se resuelve completando la migración de obras, **nunca** migrando con agujeros.
2. **Dry-run**, redirigido a archivo.
3. **Contrastar la fidelidad** de las descripciones sobre una muestra con nombre propio. No alcanza con contar mutaciones: que el dry-run reporte 27 dice que alcanzó 27 documentos, no que no perdió nada.
4. **Aplicar**, primero las publicadas y después los borradores.
5. **Verificar** por GROQ: que ninguna referencia haya cambiado de fuerza, que ningún `_strengthenOnPublish` diga `story`, y que ninguna colección publicada tenga referencias sin resolver.
6. **Repetir** para probar la idempotencia, verificando en el **contenido** y no en el contador de la CLI.
7. **Probar la reversión acotada** y volver a aplicar el lote de borradores.

```bash
pnpm -C cms exec sanity documents query '<groq>' --project-id s4dbqkc5 --dataset <ds> --api-version v2021-06-07
pnpm -C cms exec sanity migration run storylist-to-collection --project s4dbqkc5 --dataset <ds>
pnpm -C cms exec sanity migration run storylist-to-collection --project s4dbqkc5 --dataset <ds> --no-dry-run --no-confirm
```

Dos banderas que no son opcionales:

- **`--api-version v2021-06-07` en las consultas del censo.** La versión que la CLI elige sola usa perspectiva `published` y **los borradores no aparecen**, sin ninguna advertencia.
- **`--no-confirm` al aplicar.** Sin ella la CLI pide confirmación interactiva y la corrida queda esperando.

El contador de la CLI cuenta mutaciones **emitidas**, no aplicadas: una segunda corrida vuelve a reportar 27 aunque no escriba nada. La idempotencia se comprueba en que `_updatedAt` no avanza y en que una edición manual posterior sobrevive.

`development` se borra y reimporta desde `production` por `sync-datasets.yml`: conviene ejecutar la secuencia completa de una sentada.

## Revertir

```bash
pnpm -C cms exec sanity migration run revert-storylist-to-collection --project s4dbqkc5 --dataset <ds> --no-dry-run --no-confirm
```

Borra solo lo que la ida creó, comprobado documento por documento con el mismo predicado que deriva el identificador —no con una segunda noción de "colección migrada", que podría divergir y borrar una creada a mano en el Studio—. Alcanza **también** a las colecciones en borrador.

Para reintentar solo el lote de borradores está `revert-draft-storylist-to-collection`, que no se lleva puestas las publicadas.
