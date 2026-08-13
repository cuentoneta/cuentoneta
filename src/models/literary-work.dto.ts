import { z } from 'zod';
import type { Author, AuthorTeaser } from './author.model';
import type { Media } from './media.model';
import type { Resource } from './resource.model';
import type { Tag } from './tag.model';

// Los tipos de dominio anémicos anidados (Author/Tag/Media/Resource) se validan como opacos: se
// verifica que cada elemento sea un objeto, pero no su estructura interna — su contrato de wire
// propio es responsabilidad de sus módulos, no del de LiteraryWork.
const opaqueDomainObject = <T>() => z.custom<T>((value) => value !== null && typeof value === 'object');

export const literaryWorkEpigraphDtoSchema = z.object({
	text: z.string(),
	reference: z.string().optional(),
});

export const literaryWorkSectionDtoSchema = z.object({
	position: z.number(),
	title: z.object({ value: z.string() }).optional(),
	epigraphs: z.array(literaryWorkEpigraphDtoSchema).optional(),
	bodyHtml: z.string(),
	readingTime: z.number(),
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
	badLanguage: z.boolean().optional(),
	originalPublication: z.string(),
	publishedAt: z.string(),
	editorialNote: z.string().optional(),
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
	mediaSources: z.array(opaqueDomainObject<Media>()),
	authors: z.array(opaqueDomainObject<AuthorTeaser>()),
	teaserSection: literaryWorkSectionDtoSchema,
});

export type LiteraryWorkEpigraphDto = z.infer<typeof literaryWorkEpigraphDtoSchema>;
export type LiteraryWorkTeaserDto = z.infer<typeof literaryWorkTeaserDtoSchema>;
export type LiteraryWorkSectionDto = z.infer<typeof literaryWorkSectionDtoSchema>;
export type LiteraryWorkDto = z.infer<typeof literaryWorkDtoSchema>;
