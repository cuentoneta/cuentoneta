import { palacioNueveFronterasRawLiteraryWork } from './el-palacio-de-las-nueve-fronteras.literary-work.raw.mock';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createAttributedText } from '@models/attributed-text.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createSectionTitle } from '@models/section-title.model';
import { createMarkdown } from '@models/markdown.model';
import { deriveSectionReadingTime } from '@models/reading-time.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import palacioNueveFronterasMdBody from './el-palacio-de-las-nueve-fronteras.md?raw';
import elPalacioDeLasNueveFronterasEditorialNoteMd from './el-palacio-de-las-nueve-fronteras.editorial-note.md?raw';
import {
	palacioNueveFronterasEpigraphReference,
	palacioNueveFronterasEpigraphText,
	palacioNueveFronterasSectionTitle,
} from './el-palacio-de-las-nueve-fronteras.epigraph';
import { toDomainTags } from '../../onoff-tags.mock';
import { palacioNueveFronterasStoryMock } from '../story/el-palacio-de-las-nueve-fronteras.story.mock';

const palacioNueveFronterasBody = createMarkdown(palacioNueveFronterasMdBody);

export const palacioNueveFronterasEpigraphMock = createAttributedText({
	text: markdownToSanitizedHtml(createMarkdown(palacioNueveFronterasEpigraphText)),
	reference: markdownToSanitizedHtml(createMarkdown(palacioNueveFronterasEpigraphReference)),
});

export const palacioNueveFronterasLiteraryWorkMock: LiteraryWork = createLiteraryWork({
	_id: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras',
	slug: palacioNueveFronterasStoryMock.slug,
	title: palacioNueveFronterasStoryMock.title,
	authors: [palacioNueveFronterasStoryMock.author],
	coverImage: palacioNueveFronterasStoryMock.coverImage,
	content: [
		createLiteraryWorkSection({
			position: 0,
			title: createSectionTitle(palacioNueveFronterasSectionTitle),
			epigraphs: [palacioNueveFronterasEpigraphMock],
			bodyHtml: markdownToSanitizedHtml(palacioNueveFronterasBody),
			readingTime: deriveSectionReadingTime(palacioNueveFronterasBody),
		}),
	],
	mediaSources: [],
	resources: palacioNueveFronterasStoryMock.resources,
	badLanguage: palacioNueveFronterasStoryMock.badLanguage,
	tags: toDomainTags(palacioNueveFronterasRawLiteraryWork.tags),
	originalPublication: palacioNueveFronterasStoryMock.originalPublication,
	editorialNote: markdownToSanitizedHtml(createMarkdown(elPalacioDeLasNueveFronterasEditorialNoteMd)),
	publishedAt: createIsoDateTime(palacioNueveFronterasStoryMock.publishedAt),
});
