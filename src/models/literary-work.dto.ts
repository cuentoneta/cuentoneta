import { z } from 'zod';
import type { Author } from './author.model';
import type { Media } from './media.model';
import type { Resource } from './resource.model';
import type { Tag } from './tag.model';

// Contrato de wire del agregado LiteraryWork: el shape JSON que el endpoint emite (agregado
// serializado — brands y métodos no cruzan; SectionTitle llega como { value } sin toAnchor()).
// Fuente única del tipo (inferido) y de la validación en runtime: el provider hace `.parse()` en
// la frontera antes de rehidratar, así el cast `HttpClient.get<T>` deja de ser una promesa sin
// chequear. Vive en el kernel (neutral, sin Angular) para poder compartirse con el backend.
//
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
});

export type LiteraryWorkEpigraphDto = z.infer<typeof literaryWorkEpigraphDtoSchema>;
export type LiteraryWorkSectionDto = z.infer<typeof literaryWorkSectionDtoSchema>;
export type LiteraryWorkDto = z.infer<typeof literaryWorkDtoSchema>;
