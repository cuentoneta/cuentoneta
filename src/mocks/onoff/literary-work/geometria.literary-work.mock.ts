import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createAttributedText } from '@models/attributed-text.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createSectionTitle } from '@models/section-title.model';
import { createMarkdown } from '@models/markdown.model';
import { deriveSectionReadingTime } from '@models/reading-time.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import geometriaMdBody from './geometria.md?raw';
import geometriaEditorialNoteMd from './geometria.editorial-note.md?raw';
import { geometriaEpigraphReference, geometriaEpigraphText, geometriaSectionTitle } from './geometria.epigraph';
import { toDomainTags } from '../../onoff-tags.mock';
import { geometriaRawLiteraryWork } from './geometria.literary-work.raw.mock';
import { geometriaMediaMock } from '../media/geometria.media.mock';
import { geometriaStoryMock } from '../geometria.mock';

const geometriaBody = createMarkdown(geometriaMdBody);

export const geometriaEpigraphMock = createAttributedText({
	text: markdownToSanitizedHtml(createMarkdown(geometriaEpigraphText)),
	reference: markdownToSanitizedHtml(createMarkdown(geometriaEpigraphReference)),
});

export const geometriaLiteraryWorkMock: LiteraryWork = createLiteraryWork({
	_id: 'onoff-literary-work-geometria',
	slug: geometriaStoryMock.slug,
	title: geometriaStoryMock.title,
	authors: [geometriaStoryMock.author],
	coverImage: geometriaStoryMock.coverImage,
	content: [
		createLiteraryWorkSection({
			position: 0,
			title: createSectionTitle(geometriaSectionTitle),
			epigraphs: [geometriaEpigraphMock],
			bodyHtml: markdownToSanitizedHtml(geometriaBody),
			readingTime: deriveSectionReadingTime(geometriaBody),
		}),
	],
	mediaSources: geometriaMediaMock,
	resources: geometriaStoryMock.resources,
	badLanguage: geometriaStoryMock.badLanguage,
	tags: toDomainTags(geometriaRawLiteraryWork.tags),
	originalPublication: geometriaStoryMock.originalPublication,
	editorialNote: markdownToSanitizedHtml(createMarkdown(geometriaEditorialNoteMd)),
	publishedAt: createIsoDateTime(geometriaStoryMock.publishedAt),
});
