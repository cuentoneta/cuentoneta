import { embeddedAuthorMock } from '../../author.mock';
import { lasDosAntorchasRawLiteraryWork } from './las-dos-antorchas.literary-work.raw.mock';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime } from '@models/reading-time.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import lasDosAntorchasMdBody from './las-dos-antorchas.md?raw';
import lasDosAntorchasEditorialNoteMd from './las-dos-antorchas.editorial-note.md?raw';
import { toDomainTags } from '../../onoff-tags.mock';
import { lasDosAntorchasStoryMock } from '../story/las-dos-antorchas.story.mock';

const lasDosAntorchasBody = createMarkdown(lasDosAntorchasMdBody);

export const lasDosAntorchasLiteraryWorkMock: LiteraryWork = createLiteraryWork({
	_id: 'onoff-literary-work-las-dos-antorchas',
	slug: lasDosAntorchasStoryMock.slug,
	title: lasDosAntorchasStoryMock.title,
	authors: [embeddedAuthorMock],
	coverImage: lasDosAntorchasStoryMock.coverImage,
	content: [
		createLiteraryWorkSection({
			position: 0,
			epigraphs: [],
			bodyHtml: markdownToSanitizedHtml(lasDosAntorchasBody),
			readingTime: createReadingTime(lasDosAntorchasRawLiteraryWork.content[0].readingTime ?? 0),
		}),
	],
	mediaSources: [],
	resources: lasDosAntorchasStoryMock.resources,
	badLanguage: lasDosAntorchasStoryMock.badLanguage,
	tags: toDomainTags(lasDosAntorchasRawLiteraryWork.tags),
	originalPublication: lasDosAntorchasStoryMock.originalPublication,
	editorialNote: markdownToSanitizedHtml(createMarkdown(lasDosAntorchasEditorialNoteMd)),
	publishedAt: createIsoDateTime(lasDosAntorchasStoryMock.publishedAt),
});
