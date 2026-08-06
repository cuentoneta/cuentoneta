import { lasEscalerasRawLiteraryWork } from './las-escaleras.literary-work.raw.mock';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createMarkdown } from '@models/markdown.model';
import { deriveSectionReadingTime } from '@models/reading-time.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import lasEscalerasMdBody from './las-escaleras.md?raw';
import lasEscalerasEditorialNoteMd from './las-escaleras.editorial-note.md?raw';
import { toDomainTags } from '../../onoff-tags.mock';
import { lasEscalerasStoryMock } from '../las-escaleras.mock';

const lasEscalerasBody = createMarkdown(lasEscalerasMdBody);

export const lasEscalerasLiteraryWorkMock: LiteraryWork = createLiteraryWork({
	_id: 'onoff-literary-work-las-escaleras',
	slug: lasEscalerasStoryMock.slug,
	title: lasEscalerasStoryMock.title,
	authors: [lasEscalerasStoryMock.author],
	coverImage: lasEscalerasStoryMock.coverImage,
	content: [
		createLiteraryWorkSection({
			position: 0,
			bodyHtml: markdownToSanitizedHtml(lasEscalerasBody),
			readingTime: deriveSectionReadingTime(lasEscalerasBody),
		}),
	],
	mediaSources: [],
	resources: lasEscalerasStoryMock.resources,
	badLanguage: lasEscalerasStoryMock.badLanguage,
	tags: toDomainTags(lasEscalerasRawLiteraryWork.tags),
	originalPublication: lasEscalerasStoryMock.originalPublication,
	editorialNote: markdownToSanitizedHtml(createMarkdown(lasEscalerasEditorialNoteMd)),
	publishedAt: createIsoDateTime(lasEscalerasStoryMock.publishedAt),
});
