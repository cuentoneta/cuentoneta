import type { LiteraryWorkBySlugQueryResult } from '../sanity/types';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import {
	createLiteraryWorkEpigraph,
	createLiteraryWorkSection,
	type LiteraryWorkEpigraph,
	type LiteraryWorkSection,
} from '@models/literary-work-section.model';
import { createChapterTitle } from '@models/chapter-title.model';
import { createMarkdown } from '@models/markdown.model';
import { countWords, createReadingTime, deriveReadingTime } from '@models/reading-time.model';
import { createIsoDateTime } from '@utils/date.utils';
import { mapAuthor, mapResources, mapTags, urlFor } from './functions';
import { mapMediaSources } from './media-sources.functions';
import { markdownToSanitizedHtml } from './markdown-pipeline.functions';

export type SanityLiteraryWork = NonNullable<LiteraryWorkBySlugQueryResult>;
type SanityLiteraryWorkSection = SanityLiteraryWork['content'][number];
type SanityLiteraryWorkEpigraph = NonNullable<SanityLiteraryWorkSection['epigraphs']>[number];

export function mapLiteraryWork(raw: SanityLiteraryWork): LiteraryWork {
	return createLiteraryWork({
		_id: raw._id,
		slug: raw.slug,
		title: raw.title,
		authors: raw.authors.map(mapAuthor),
		coverImage: raw.coverImage ? urlFor(raw.coverImage) : '',
		content: raw.content.map(mapLiteraryWorkSection),
		mediaSources: mapMediaSources(raw.mediaSources),
		resources: mapResources(raw.resources),
		badLanguage: raw.badLanguage,
		tags: mapTags(raw.tags),
		originalPublication: raw.originalPublication,
		publishedAt: createIsoDateTime(raw.publishedAt),
		readingTimeOverride: raw.readingTimeOverride ? createReadingTime(raw.readingTimeOverride) : undefined,
	});
}

function mapLiteraryWorkSection(raw: SanityLiteraryWorkSection, index: number): LiteraryWorkSection {
	const body = createMarkdown(raw.body);
	return createLiteraryWorkSection({
		position: index,
		chapterTitle: raw.chapterTitle ? createChapterTitle(raw.chapterTitle) : undefined,
		epigraphs: raw.epigraphs.map(mapLiteraryWorkEpigraph),
		bodyHtml: markdownToSanitizedHtml(body),
		readingTime: deriveReadingTime(countWords(body)),
	});
}

// `raw.text ?? ''` deja que createMarkdown lance ante un epígrafe sin texto: dato editorial
// inválido que debe fallar en la frontera, no propagarse silenciado.
function mapLiteraryWorkEpigraph(raw: SanityLiteraryWorkEpigraph): LiteraryWorkEpigraph {
	return createLiteraryWorkEpigraph({
		text: markdownToSanitizedHtml(createMarkdown(raw.text ?? '')),
		reference: raw.reference ? markdownToSanitizedHtml(createMarkdown(raw.reference)) : undefined,
	});
}
