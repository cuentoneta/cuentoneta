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

type SanityLiteraryWork = NonNullable<LiteraryWorkBySlugQueryResult>;
type SanityLiteraryWorkSection = SanityLiteraryWork['content'][number];
type SanityLiteraryWorkEpigraph = NonNullable<SanityLiteraryWorkSection['epigraphs']>[number];
type SanityLiteraryWorkMetadata = Omit<SanityLiteraryWork, 'content'>;

export class SanityLiteraryWorkRepository implements LiteraryWorkRepository {
	constructor(private readonly client: SanityClient = sanityClient) {}

	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		const raw = await this.client.fetch(literaryWorkBySlugQuery, { slug });
		if (!raw) {
			return null;
		}
		return this.mapLiteraryWork(raw);
	}

	private mapLiteraryWork(raw: SanityLiteraryWork): LiteraryWork {
		const literaryWork = createLiteraryWork({
			...this.mapMetadata(raw),
			content: raw.content.map((section, index) => this.mapSection(section, index)),
		});
		return raw.totalReadingTime !== null
			? Object.freeze({ ...literaryWork, totalReadingTime: createReadingTime(raw.totalReadingTime) })
			: literaryWork;
	}

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
			editorialNote: raw.editorialNote ? markdownToSanitizedHtml(createMarkdown(raw.editorialNote)) : undefined,
		};
	}

	private mapSection(raw: SanityLiteraryWorkSection, index: number): LiteraryWorkSection {
		const body = createMarkdown(raw.body);
		return createLiteraryWorkSection({
			position: index,
			title: raw.title ? createSectionTitle(raw.title) : undefined,
			epigraphs: raw.epigraphs.map((epigraph) => this.mapEpigraph(epigraph)),
			bodyHtml: markdownToSanitizedHtml(body),
			readingTime: raw.readingTime !== null ? createReadingTime(raw.readingTime) : deriveSectionReadingTime(body),
		});
	}

	private mapEpigraph(raw: SanityLiteraryWorkEpigraph): LiteraryWorkEpigraph {
		// `raw.text ?? ''` deja que createMarkdown lance ante un epígrafe sin texto, en vez de silenciarlo.
		return createLiteraryWorkEpigraph({
			text: markdownToSanitizedHtml(createMarkdown(raw.text ?? '')),
			reference: raw.reference ? markdownToSanitizedHtml(createMarkdown(raw.reference)) : undefined,
		});
	}
}
