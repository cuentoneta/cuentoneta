import {
	createLiteraryWork,
	type LiteraryWork,
	type LiteraryWorkNavigationTeaserWithAuthors,
	type LiteraryWorkTeaser,
} from '@models/literary-work.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createMarkdown } from '@models/markdown.model';
import { countWords, deriveReadingTime } from '@models/reading-time.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import { authorMock, authorTeaserMock } from './author.mock';

// Fixture canónico genérico de LiteraryWork (análogo a story.mock.ts): lo consumen los casos base
// de los specs/stories de las tarjetas LiteraryWork*. El corpus temático real vive en onoff/.
const body = createMarkdown(
	'Una obra de prueba con un **párrafo** en *Markdown* para ejercitar el pipeline.\n\nUn segundo párrafo que aporta cuerpo suficiente para derivar un tiempo de lectura.',
);

const section = createLiteraryWorkSection({
	position: 0,
	bodyHtml: markdownToSanitizedHtml(body),
	readingTime: deriveReadingTime(countWords(body)),
});

export const literaryWorkMock: LiteraryWork = createLiteraryWork({
	_id: 'literary-work-mock',
	slug: 'obra-de-prueba',
	title: 'Obra de prueba',
	authors: [authorMock],
	coverImage: 'assets/img/mocks/stories/el-odio.png',
	content: [section],
	mediaSources: [],
	resources: [],
	badLanguage: false,
	tags: [],
	originalPublication: 'Ediciones de Prueba (2020)',
	publishedAt: createIsoDateTime('2020-01-01T00:00:00Z'),
});

export const literaryWorkTeaserMock: LiteraryWorkTeaser = {
	_id: literaryWorkMock._id,
	slug: literaryWorkMock.slug,
	title: literaryWorkMock.title,
	coverImage: literaryWorkMock.coverImage,
	totalReadingTime: literaryWorkMock.totalReadingTime,
	sectionCount: literaryWorkMock.sectionCount,
	tags: literaryWorkMock.tags,
	mediaSources: literaryWorkMock.mediaSources,
	authors: [authorTeaserMock],
	teaserSection: literaryWorkMock.content[0],
};

export const literaryWorkNavigationTeaserWithAuthorsMock: LiteraryWorkNavigationTeaserWithAuthors = {
	_id: literaryWorkMock._id,
	slug: literaryWorkMock.slug,
	title: literaryWorkMock.title,
	coverImage: literaryWorkMock.coverImage,
	totalReadingTime: literaryWorkMock.totalReadingTime,
	sectionCount: literaryWorkMock.sectionCount,
	tags: literaryWorkMock.tags,
	mediaSources: literaryWorkMock.mediaSources,
	authors: [authorTeaserMock],
};
