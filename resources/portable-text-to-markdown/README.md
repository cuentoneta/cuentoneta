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

| Portable Text                          | Markdown             |
| -------------------------------------- | -------------------- |
| Bloque `block` con `style: 'normal'`   | Párrafo              |
| Marca `em`                             | `*texto*`            |
| Marca `strong`                         | `**texto**`          |
| Marca resuelta por un `markDef` `link` | `[texto](href)`      |
| Varios bloques                         | Separados por `\n\n` |

Cuando un span lleva énfasis **y** enlace, el enlace queda por fuera (`[*texto*](url)`): deja el marcado del enlace afuera del énfasis, que se lee mejor en el editor del CMS — que es donde alguien va a mantener ese texto después de migrado.

Los caracteres que Markdown interpretaría como marcado (`\`, `*`, `_`, `[`, `]`) se escapan. No se escapa el conjunto completo de CommonMark a propósito: sobre-escapar prosa la vuelve ilegible para quien la edite.

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
