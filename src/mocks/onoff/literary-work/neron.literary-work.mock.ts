import { neronRawLiteraryWork } from './neron.literary-work.raw.mock';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createMarkdown } from '@models/markdown.model';
import { deriveSectionReadingTime } from '@models/reading-time.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import neronMdBody from './neron.md?raw';
import { toDomainTags } from '../../onoff-tags.mock';
import { neronStoryMock } from '../neron.mock';

const neronBody = createMarkdown(neronMdBody);

export const neronLiteraryWorkMock: LiteraryWork = createLiteraryWork({
	_id: 'onoff-literary-work-neron',
	slug: neronStoryMock.slug,
	title: neronStoryMock.title,
	authors: [neronStoryMock.author],
	coverImage: neronStoryMock.coverImage,
	content: [
		createLiteraryWorkSection({
			position: 0,
			bodyHtml: markdownToSanitizedHtml(neronBody),
			readingTime: deriveSectionReadingTime(neronBody),
		}),
	],
	mediaSources: [],
	resources: neronStoryMock.resources,
	badLanguage: neronStoryMock.badLanguage,
	tags: toDomainTags(neronRawLiteraryWork.tags),
	originalPublication: neronStoryMock.originalPublication,
	publishedAt: createIsoDateTime(neronStoryMock.publishedAt),
});
