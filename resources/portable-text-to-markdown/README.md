# Conversor de Portable Text a Markdown

Utilidad compartida por las migraciones que llevan contenido de `blockContent` (Portable Text) a `markdown` en el CMS. Vive fuera de `src/` porque no es código de la aplicación: **ninguna superficie de runtime lo importa**. Lo consumen las migraciones de `cms/migrations/`, que corren a mano contra el dataset.

## Uso

```typescript
import {
	portableTextToMarkdown,
	UnsupportedPortableTextError,
} from '../../resources/portable-text-to-markdown/portable-text-to-markdown';

const markdown = portableTextToMarkdown(document.description);
```

Dentro de una migración de Sanity, envuelto para que un bloque no soportado detenga la corrida con el documento identificado:

```typescript
import { at, defineMigration, set } from 'sanity/migrate';
import { portableTextToMarkdown } from '../../../resources/portable-text-to-markdown/portable-text-to-markdown';

export default defineMigration({
	title: 'Migrar la descripción de multimedia a Markdown',
	documentTypes: ['story'],
	migrate: {
		document(doc) {
			return (doc.mediaSources ?? []).map((mediaSource, index) =>
				at(`mediaSources[${index}].description`, set(portableTextToMarkdown(mediaSource.description))),
			);
		},
	},
});
```

## Qué traduce

| Portable Text                                     | Markdown                          |
| ------------------------------------------------- | --------------------------------- |
| Bloque `block` con `style: 'normal'`              | Párrafo                           |
| `style: 'h1'` … `'h6'`                            | `#` … `######`                    |
| `style: 'blockquote'`                             | `> texto`                         |
| `listItem: 'bullet'` / `'number'`                 | `- texto` / `1. texto`            |
| `level` de un ítem de lista                       | Sangría de dos espacios por nivel |
| Bloque cuyo texto es una tirada de `*`, `-` o `_` | `---` (separador temático)        |
| Marca `em`                                        | `*texto*`                         |
| Marca `strong`                                    | `**texto**`                       |
| Marcas `left`, `center`, `right`, `justify`       | Se ignoran, el texto queda        |
| Marca resuelta por un `markDef` `link`            | `[texto](href)`                   |
| Varios bloques                                    | Separados por `\n\n`              |

Cuando un span lleva énfasis **y** enlace, el enlace queda por fuera (`[*texto*](url)`): deja el marcado del enlace afuera del énfasis, que se lee mejor en el editor del CMS — que es donde alguien va a mantener ese texto después de migrado.

**Alineación.** Markdown no la tiene, y el pipeline de la app descarta el HTML crudo: emitir `<p align="center">` no perdería el centrado, perdería el texto entero. Por eso los cuatro decoradores de alineación se traducen conservando el texto y descartando la marca.

**Separadores de escena.** El corpus los escribe como una tirada de asteriscos centrada, porque el editor viejo no tenía un separador propio. Markdown sí, así que se traduce al que corresponde en vez de dejar los asteriscos como texto. Solo aplica al bloque **sin marcador propio**: una cita o un ítem de lista cuyo texto fuera `***` perdería su marcador al traducirse como separador.

## Escapes

Se escapan los caracteres que Markdown interpretaría como marcado (`\`, `*`, `_`, `[`, `]`, `<`, `` ` ``, y el `&` que abre una entidad) y, **al inicio de cada línea**, los marcadores de bloque (`-`, `+`, `*`, `>`, `1.`, `1)`, `#`, `~~~`). No se escapa el conjunto completo de CommonMark a propósito: sobre-escapar prosa la vuelve ilegible para quien la edite.

Varios de esos escapes salieron de encontrar pérdida real de contenido al correr el conversor contra el corpus y contra el pipeline de la app:

- **El diálogo en español abre con guion.** Sin escape, `- ¿Cómo te va?` se vuelve un ítem de lista: el guion desaparece y el texto queda dentro de un `<ul>`.
- **El corpus usa `<<…>>` como comilla angular.** Markdown lo lee como apertura de etiqueta HTML y el saneamiento se lleva el texto de adentro.
- **El escape va por línea, no por bloque.** El dataset guarda saltos de línea dentro del texto de un mismo span, así que un marcador puede quedar al inicio de una línea que no es la primera.
- **El numeral, el backtick y la entidad desaparecen al releer.** `# No es un título` sale como `<h1>` sin su numeral, `` `x` `` como `<code>` sin sus backticks, y `&copy;` decodificado.

En la lista numerada se escapa el signo y no el dígito (`1\.`, no `\1.`): CommonMark solo reconoce el escape sobre puntuación ASCII, así que la otra forma dejaría la barra invertida a la vista del lector.

Dos construcciones no se resuelven escapando, porque el escape no las alcanza:

- **El subrayado setext.** Una tirada de `-` o `=` en línea propia, pegada a una línea con texto, convierte esa prosa en encabezado y se come la tirada. Se escapa **solo en ese caso**: con una línea en blanco de por medio, la misma tirada es un separador temático legítimo y se traduce como tal.
- **La sangría de bloque de código.** Cuatro espacios o un tabulador al abrir un bloque lo vuelven `<pre><code>`. La sangría no es puntuación y no se puede escapar, así que se quita: es presentación del editor viejo, y Markdown no la conserva de ninguna manera.

**El destino de un enlace no se escapa** —no es prosa—, así que lo que no se puede emitir sin romperlo detiene la corrida: un esquema fuera de `http`/`https`/`mailto` (el saneamiento lo descartaría, y el enlace se perdería recién en la página) o un `<`/`>` adentro, que desbarata la forma delimitada de CommonMark. Un destino relativo, sin esquema, es válido.

## Limitación conocida

Cuando dos spans **adyacentes** comparten una marca de énfasis y difieren en otra —por ejemplo `strong+em`, luego `em`, luego `strong+em`—, el conversor emite tiradas de énfasis separadas y alguna puede quedar sin cerrar, dejando asteriscos a la vista. Medido sobre el corpus completo: **15 caracteres sobrantes en 7 campos de unos 1300**, sin pérdida de texto en ninguno. Es cosmético y está documentado en vez de resuelto; si alguna vez molesta, el arreglo es fusionar los spans contiguos por marca antes de renderizar. El comportamiento está fijado con un test, para que un cambio futuro no lo empeore en silencio.

## Qué NO traduce, y por qué falla en vez de descartar

Ante cualquier construcción fuera de ese subconjunto —listas, encabezados, citas, bloques que no sean `block`, `markDef` que no sea `link`, o una marca que ningún `markDef` resuelva— lanza `UnsupportedPortableTextError` con la clave del bloque.

Es deliberado. Una migración que descarta en silencio lo que no supo traducir **pierde contenido sin dejar rastro**, y el dato original no se recupera salvo por el historial de Sanity. Preferimos que la corrida se detenga y que una persona decida qué hacer con ese caso.

## Cómo crecer

El subconjunto soportado hoy no es una definición de "lo que Markdown puede expresar": es **lo que el dataset usa**. Se relevó antes de escribirlo, sobre las 142 descripciones de multimedia de `development` (una por documento), y no había una sola construcción fuera de párrafo con énfasis, negrita y enlaces.

Las migraciones que siguen tocan campos de prosa más larga —la biografía de un autor, la descripción de una colección, y sobre todo el cuerpo de las obras— donde es esperable que sí aparezcan listas o encabezados. Cuando eso pase:

1. **Relevá el campo antes de escribir código.** El censo se hace con GROQ contra el dataset, no se deduce del schema. Filtrá los documentos primero (`*[_type == 'x' && count(campo) > 0]`): aplanar arrays anidados sobre todos los documentos mete nulos que contaminan las cuentas.
2. **Agregá el caso acá**, con su prueba, no en la migración que lo encontró. La migración lo consume; el conversor lo define.
3. **Mantené la regla de fallar.** Cada construcción nueva que se soporte sale del conjunto que lanza; ninguna debe pasar a descartarse.
4. **Verificá fidelidad, no cobertura.** Que el dry-run reporte N parches solo dice que alcanzó N documentos, no que no perdió nada. El contraste que sí lo dice es el **total de caracteres de texto plano**: `math::sum(...{"n": length(pt::text(campo))}.n)` en el origen contra la suma de los resultados del dry-run con el marcado quitado. Si el conversor descartó un span, una marca o un `href`, ese total no cierra. Conviene contrastar también las cuentas por construcción (documentos con enlace, con énfasis) — pero cuidado al detectar énfasis por regex sobre el Markdown: un span con `em` **y** `strong` rinde `***texto***`, que un patrón ingenuo de un solo asterisco no matchea.

## Tests

`pnpm exec vitest run resources/portable-text-to-markdown`

Corren en el gate `test` y el código entra en `typecheck`: ambos globs incluyen `resources/**` justamente para que esta utilidad no quede fuera de la red.
