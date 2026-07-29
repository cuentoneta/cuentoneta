import type { SanityClient } from '@sanity/client';
import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import {
	createLiteraryWorkEpigraph,
	createLiteraryWorkSection,
	type LiteraryWorkEpigraph,
	type LiteraryWorkSection,
} from '@models/literary-work-section.model';
import { createSectionTitle } from '@models/section-title.model';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime, deriveSectionReadingTime } from '@models/reading-time.model';
import { createSlug } from '@models/slug.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import { mapAuthor, mapResources, mapTags, urlFor } from '../../_utils/functions';
import { mapMediaSources } from '../../_utils/media-sources.functions';
import { client as sanityClient } from '../../_helpers/sanity-connector';
import { literaryWorkBySlugQuery } from '../../_queries/literary-work.query';
import type { LiteraryWorkRepository } from './literary-work.repository';

// Shape crudo de Sanity de la query full. El adaptador Sanity es la única frontera que lo conoce:
// traduce a dominio puertas adentro y expone solo `LiteraryWork` — el service recibe dominio ya en el
// formato que necesita, sin una capa de mappers aparte.
type SanityLiteraryWork = NonNullable<LiteraryWorkBySlugQueryResult>;
type SanityLiteraryWorkSection = SanityLiteraryWork['content'][number];
type SanityLiteraryWorkEpigraph = NonNullable<SanityLiteraryWorkSection['epigraphs']>[number];
type SanityLiteraryWorkMetadata = Pick<
	SanityLiteraryWork,
	| '_id'
	| 'slug'
	| 'title'
	| 'authors'
	| 'coverImage'
	| 'mediaSources'
	| 'resources'
	| 'badLanguage'
	| 'tags'
	| 'originalPublication'
	| 'publishedAt'
>;

export class SanityLiteraryWorkRepository implements LiteraryWorkRepository {
	// Seam de `client` para el spy en tests. La persistencia del reading time NO ocurre en lectura: la
	// hace el script de backfill (#1959) on-demand / por cron; acá solo se lee y se traduce a dominio.
	constructor(private readonly client: SanityClient = sanityClient) {}

	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		const raw = await this.client.fetch(literaryWorkBySlugQuery, { slug });
		return raw ? this.mapWork(raw) : null;
	}

	// ───────────────────────── Traducción raw → dominio (ACL del adaptador) ─────────────────────────
	// La anti-corruption vive acá, no en una capa de mappers aparte: el adaptador es la única frontera
	// que conoce el shape de Sanity y entrega dominio listo. Reusa los sub-mappers transversales
	// (`mapAuthor`/`mapTags`/…, compartidos con otros dominios) como building blocks.

	private mapWork(raw: SanityLiteraryWork): LiteraryWork {
		const work = createLiteraryWork({
			...this.mapMetadata(raw),
			content: raw.content.map((section, index) => this.mapSection(section, index)),
		});
		// El total persistido es autoritativo (obras recitadas: la duración del medio ≠ la suma del texto):
		// la factory deriva un default de las secciones y el ACL lo sobrescribe con el valor persistido
		// cuando está presente.
		return raw.totalReadingTime !== null
			? Object.freeze({ ...work, totalReadingTime: createReadingTime(raw.totalReadingTime) })
			: work;
	}

	// Las invariantes de título/autores las corre `createLiteraryWork` (único camino de construcción).
	private mapMetadata(raw: SanityLiteraryWorkMetadata) {
		return {
			_id: raw._id,
			slug: createSlug(raw.slug),
			title: raw.title,
			authors: raw.authors.map(mapAuthor),
			coverImage: raw.coverImage ? urlFor(raw.coverImage) : '',
			mediaSources: mapMediaSources(raw.mediaSources),
			resources: mapResources(raw.resources),
			badLanguage: raw.badLanguage,
			tags: mapTags(raw.tags),
			originalPublication: raw.originalPublication,
			publishedAt: createIsoDateTime(raw.publishedAt),
		};
	}

	private mapSection(raw: SanityLiteraryWorkSection, index: number): LiteraryWorkSection {
		const body = createMarkdown(raw.body);
		return createLiteraryWorkSection({
			position: index,
			title: raw.title ? createSectionTitle(raw.title) : undefined,
			epigraphs: raw.epigraphs.map((epigraph) => this.mapEpigraph(epigraph)),
			bodyHtml: markdownToSanitizedHtml(body),
			// Prefiere el readingTime persistido; deriva como fallback puro cuando falta (obra aún no
			// backfilleada por el script). Es cómputo de lectura sin escritura: sirve un valor válido; el
			// script #1959 persiste el campo aparte.
			readingTime: raw.readingTime !== null ? createReadingTime(raw.readingTime) : deriveSectionReadingTime(body),
		});
	}

	// `raw.text ?? ''` deja que createMarkdown lance ante un epígrafe sin texto: dato editorial inválido
	// que debe fallar en la frontera, no propagarse silenciado.
	private mapEpigraph(raw: SanityLiteraryWorkEpigraph): LiteraryWorkEpigraph {
		return createLiteraryWorkEpigraph({
			text: markdownToSanitizedHtml(createMarkdown(raw.text ?? '')),
			reference: raw.reference ? markdownToSanitizedHtml(createMarkdown(raw.reference)) : undefined,
		});
	}
}
