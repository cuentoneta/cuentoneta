import { lasDosAntorchasRawLiteraryWork } from './las-dos-antorchas.literary-work.raw.mock';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createMarkdown } from '@models/markdown.model';
import { deriveSectionReadingTime } from '@models/reading-time.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import lasDosAntorchasMdBody from './las-dos-antorchas.md?raw';
import lasDosAntorchasEditorialNoteMd from './las-dos-antorchas.editorial-note.md?raw';
import { toDomainTags } from '../../onoff-tags.mock';
import { lasDosAntorchasStoryMock } from '../las-dos-antorchas.mock';

const lasDosAntorchasBody = createMarkdown(lasDosAntorchasMdBody);

export const lasDosAntorchasLiteraryWorkMock: LiteraryWork = createLiteraryWork({
	_id: 'onoff-literary-work-las-dos-antorchas',
	slug: lasDosAntorchasStoryMock.slug,
	title: lasDosAntorchasStoryMock.title,
	authors: [lasDosAntorchasStoryMock.author],
	coverImage: lasDosAntorchasStoryMock.coverImage,
	content: [
		createLiteraryWorkSection({
			position: 0,
			bodyHtml: markdownToSanitizedHtml(lasDosAntorchasBody),
			readingTime: deriveSectionReadingTime(lasDosAntorchasBody),
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
