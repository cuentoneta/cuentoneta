import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createLiteraryWorkEpigraph, createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createChapterTitle } from '@models/chapter-title.model';
import { createReadingTime } from '@models/reading-time.model';
import { createSanitizedHtml } from '@models/sanitized-html.model';
import { createIsoDateTime } from '@utils/date.utils';
import { authorMock } from '@mocks/author.mock';
import { tagMock } from '@mocks/tag.mocks';

// Segundo autor derivado del mock completo para ejercitar el byline 1..N del hero.
const coauthorMock = { ...authorMock, _id: 'author_2', slug: 'camille-fournier', name: 'Camille Fournier' };

export const literaryWorkHeroFixtureMock: LiteraryWork = createLiteraryWork({
	_id: 'literaryWork_hero_1',
	slug: 'el-palacio-de-las-nueve-fronteras',
	title: 'El palacio de las nueve fronteras',
	authors: [authorMock, coauthorMock],
	coverImage: 'assets/img/mocks/stories/el-palacio-de-las-nueve-fronteras.png',
	content: [
		createLiteraryWorkSection({
			position: 0,
			chapterTitle: createChapterTitle('La primera frontera'),
			epigraphs: [
				createLiteraryWorkEpigraph({
					text: createSanitizedHtml('<p>Todo palacio es una memoria que se defiende.</p>'),
					reference: createSanitizedHtml('<p>Anónimo</p>'),
				}),
			],
			bodyHtml: createSanitizedHtml(
				'<p>Al cruzar la primera frontera, el visitante olvida el motivo de su viaje y recuerda, en cambio, todos los viajes que no hizo.</p>',
			),
			readingTime: createReadingTime(4),
		}),
		createLiteraryWorkSection({
			position: 1,
			bodyHtml: createSanitizedHtml(
				'<p>La segunda frontera no figura en los planos: se descubre al intentar volver sobre los propios pasos.</p>',
			),
			readingTime: createReadingTime(3),
		}),
	],
	mediaSources: [],
	resources: [],
	tags: [
		{ ...tagMock, title: 'Novela', slug: 'novela' },
		{ ...tagMock, title: 'Metaficción', slug: 'metaficcion' },
	],
	originalPublication: 'Éditions du Méridien (1985)',
	publishedAt: createIsoDateTime('2024-05-20T10:30:00Z'),
});
