import * as z from 'zod/mini';
import type { Author, AuthorTeaser } from './author.model';
import type { LiteraryWorkTeaser } from './literary-work.model';
import type { Media, MediaTeaser } from './media.model';
import type { Resource } from './resource.model';
import type { Tag } from './tag.model';
import { createLiteraryWorkExcerpt } from './literary-work-excerpt.model';
import { createReadingTime } from './reading-time.model';
import { createSanitizedHtml } from './sanitized-html.model';
import { createSectionTitle } from './section-title.model';
import { createSlug } from './slug.model';

// Los tipos de dominio anémicos anidados (Author/Tag/Media/Resource) se validan como opacos: se
// verifica que cada elemento sea un objeto, pero no su estructura interna — su contrato de wire
// propio es responsabilidad de sus módulos, no del de LiteraryWork.
const opaqueDomainObject = <T>() => z.custom<T>((value) => value !== null && typeof value === 'object');

export const literaryWorkEpigraphDtoSchema = z.object({
	text: z.string(),
	reference: z.optional(z.string()),
});

export const literaryWorkSectionDtoSchema = z.object({
	position: z.number(),
	title: z.optional(z.object({ value: z.string() })),
	epigraphs: z.optional(z.array(literaryWorkEpigraphDtoSchema)),
	bodyHtml: z.string(),
	readingTime: z.number(),
});

// El extracto de un listado no declara `readingTime` ni `position`: su cuerpo va recortado y no
// puede sostenerlos. Es un schema propio y no una variante del de sección, para que el contrato de
// wire diga lo mismo que el de dominio.
export const literaryWorkExcerptDtoSchema = z.object({
	title: z.optional(z.object({ value: z.string() })),
	bodyHtml: z.string(),
});

export const literaryWorkDtoSchema = z.object({
	_id: z.string(),
	slug: z.string(),
	title: z.string(),
	coverImage: z.string(),
	totalReadingTime: z.number(),
	sectionCount: z.number(),
	tags: z.array(opaqueDomainObject<Tag>()),
	authors: z.array(opaqueDomainObject<Author>()),
	content: z.array(literaryWorkSectionDtoSchema),
	mediaSources: z.array(opaqueDomainObject<Media>()),
	resources: z.array(opaqueDomainObject<Resource>()),
	badLanguage: z.optional(z.boolean()),
	originalPublication: z.string(),
	publishedAt: z.string(),
	editorialNote: z.optional(z.string()),
});

// La vista de teaser: la metadata de tarjeta más una sola sección de apertura. Vive acá y no en el
// módulo que la consume porque su forma la fija el contrato de la obra, no quien la muestre.
export const literaryWorkTeaserDtoSchema = z.object({
	_id: z.string(),
	slug: z.string(),
	title: z.string(),
	coverImage: z.string(),
	totalReadingTime: z.number(),
	sectionCount: z.number(),
	tags: z.array(opaqueDomainObject<Tag>()),
	mediaSources: z.array(opaqueDomainObject<MediaTeaser>()),
	authors: z.array(opaqueDomainObject<AuthorTeaser>()),
	excerpt: literaryWorkExcerptDtoSchema,
});

// El listado se valida por su propio schema en vez de encadenar `.array()` sobre el del teaser: mini
// no expone ese encadenamiento, y declararlo acá mantiene el vocabulario de schemas en el módulo de
// DTO en lugar de repartirlo entre los providers.
export const literaryWorkTeaserListDtoSchema = z.array(literaryWorkTeaserDtoSchema);

export type LiteraryWorkEpigraphDto = z.infer<typeof literaryWorkEpigraphDtoSchema>;
export type LiteraryWorkTeaserDto = z.infer<typeof literaryWorkTeaserDtoSchema>;
export type LiteraryWorkSectionDto = z.infer<typeof literaryWorkSectionDtoSchema>;
export type LiteraryWorkExcerptDto = z.infer<typeof literaryWorkExcerptDtoSchema>;
export type LiteraryWorkDto = z.infer<typeof literaryWorkDtoSchema>;

// La rehidratación del teaser vive junto a su schema y no en un provider: más de uno la necesita
// —el de colección para las obras del agregado, el de obra para el listado por autor— y dejarla
// privada en cada uno es dejar que las dos copias diverjan en silencio. Va acá y no en el modelo de
// dominio porque traduce desde el wire, y el dominio no debe depender de su contrato.
export function toLiteraryWorkTeaser(dto: LiteraryWorkTeaserDto): LiteraryWorkTeaser {
	return {
		...dto,
		slug: createSlug(dto.slug),
		totalReadingTime: createReadingTime(dto.totalReadingTime),
		excerpt: createLiteraryWorkExcerpt({
			title: dto.excerpt.title ? createSectionTitle(dto.excerpt.title.value) : undefined,
			bodyHtml: createSanitizedHtml(dto.excerpt.bodyHtml),
		}),
	};
}
