import { embeddedAuthorMock } from '../../author.mock';
import { elOdioRawLiteraryWork } from './el-odio.literary-work.raw.mock';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createAttributedText } from '@models/attributed-text.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createSectionTitle } from '@models/section-title.model';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime } from '@models/reading-time.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import elOdioMdBody from './el-odio.md?raw';
import elOdioEditorialNoteMd from './el-odio.editorial-note.md?raw';
import { elOdioEpigraphReference, elOdioEpigraphText, elOdioSectionTitle } from './el-odio.epigraph';
import { toDomainTags } from '../../onoff-tags.mock';
import { elOdioStoryMock } from '../story/el-odio.story.mock';

const elOdioBody = createMarkdown(elOdioMdBody);

export const elOdioEpigraphMock = createAttributedText({
	text: markdownToSanitizedHtml(createMarkdown(elOdioEpigraphText)),
	reference: markdownToSanitizedHtml(createMarkdown(elOdioEpigraphReference)),
});

export const elOdioLiteraryWorkMock: LiteraryWork = createLiteraryWork({
	_id: 'onoff-literary-work-el-odio',
	slug: elOdioStoryMock.slug,
	title: elOdioStoryMock.title,
	authors: [embeddedAuthorMock],
	coverImage: elOdioStoryMock.coverImage,
	content: [
		createLiteraryWorkSection({
			position: 0,
			title: createSectionTitle(elOdioSectionTitle),
			epigraphs: [elOdioEpigraphMock],
			bodyHtml: markdownToSanitizedHtml(elOdioBody),
			readingTime: createReadingTime(elOdioRawLiteraryWork.content[0].readingTime ?? 0),
		}),
	],
	mediaSources: [],
	resources: elOdioStoryMock.resources,
	badLanguage: elOdioStoryMock.badLanguage,
	tags: toDomainTags(elOdioRawLiteraryWork.tags),
	originalPublication: elOdioStoryMock.originalPublication,
	editorialNote: markdownToSanitizedHtml(createMarkdown(elOdioEditorialNoteMd)),
	publishedAt: createIsoDateTime(elOdioStoryMock.publishedAt),
});
