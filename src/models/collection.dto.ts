import * as z from 'zod/mini';
import type { Media } from './media.model';
import type { Tag } from './tag.model';
import { literaryWorkTeaserDtoSchema } from './literary-work.dto';

// Mismo criterio que el DTO de obra literaria: los tipos de dominio anémicos anidados se validan como
// opacos, porque su contrato de wire es responsabilidad de sus propios módulos.
const opaqueDomainObject = <T>() => z.custom<T>((value) => value !== null && typeof value === 'object');

// La unión discriminada viaja tal cual: validarla acá es lo que evita que un abanico incompleto o un
// `kind` desconocido llegue al componente que lo discrimina.
export const collectionImageryDtoSchema = z.discriminatedUnion('kind', [
	z.object({ kind: z.literal('representative'), image: z.string() }),
	z.object({ kind: z.literal('sample'), images: z.tuple([z.string(), z.string(), z.string()]) }),
]);

const collectionBaseDtoSchema = z.object({
	_id: z.string(),
	slug: z.string(),
	title: z.string(),
	description: z.string(),
	imagery: collectionImageryDtoSchema,
	tags: z.array(opaqueDomainObject<Tag>()),
	config: z.object({ showAuthors: z.boolean() }),
	mediaSources: z.array(opaqueDomainObject<Media>()),
	count: z.number(),
});

export const collectionDtoSchema = z.extend(collectionBaseDtoSchema, {
	literaryWorks: z.array(literaryWorkTeaserDtoSchema),
});

// El teaser no transporta obras, y el `count` que sí transporta es lo que la factory usa en su lugar.
export const collectionTeaserDtoSchema = collectionBaseDtoSchema;

// El listado se valida por su propio schema en vez de encadenar `.array()` sobre el del teaser: mini
// no expone ese encadenamiento, y declararlo acá mantiene el vocabulario de schemas en el módulo de
// DTO en lugar de repartirlo entre los providers.
export const collectionTeaserListDtoSchema = z.array(collectionTeaserDtoSchema);

export type CollectionImageryDto = z.infer<typeof collectionImageryDtoSchema>;
export type CollectionDto = z.infer<typeof collectionDtoSchema>;
export type CollectionTeaserDto = z.infer<typeof collectionTeaserDtoSchema>;
