import {
	createLiteraryWork,
	type LiteraryWork,
	type LiteraryWorkNavigationTeaserWithAuthors,
	type LiteraryWorkTeaser,
} from '@models/literary-work.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createReadingTime } from '@models/reading-time.model';
import { createSanitizedHtml } from '@models/sanitized-html.model';
import { createIsoDateTime } from '@utils/date.utils';
import { authorTeaserMock } from '@mocks/author.mock';
import { tagMock } from '@mocks/tag.mocks';

// Segundo autor derivado del teaser estable para ejercitar el byline 1..N de la tarjeta.
export const coauthorTeaserMock = {
	...authorTeaserMock,
	_id: 'author_2',
	slug: 'camille-fournier',
	name: 'Camille Fournier',
};

// Proyección de los campos comunes de las vistas de teaser (LiteraryWorkBase) desde una obra
// completa construida con las factories del dominio: las vistas no tienen invariantes propias.
function toTeaserBase(work: LiteraryWork) {
	return {
		_id: work._id,
		slug: work.slug,
		title: work.title,
		coverImage: work.coverImage,
		totalReadingTime: work.totalReadingTime,
		sectionCount: work.sectionCount,
		tags: work.tags,
	};
}

const palacioNueveFronteras = createLiteraryWork({
	_id: 'literaryWork_home_1',
	slug: 'el-palacio-de-las-nueve-fronteras',
	title: 'El palacio de las nueve fronteras',
	authors: [authorTeaserMock],
	coverImage: 'assets/img/mocks/stories/el-palacio-de-las-nueve-fronteras.png',
	content: [
		createLiteraryWorkSection({
			position: 0,
			bodyHtml: createSanitizedHtml(
				'<p>Al cruzar la primera frontera, el visitante olvida el motivo de su viaje y recuerda, en cambio, todos los viajes que no hizo.</p>',
			),
			readingTime: createReadingTime(7),
		}),
	],
	mediaSources: [],
	resources: [],
	tags: [tagMock],
	originalPublication: 'Éditions du Méridien (1985)',
	publishedAt: createIsoDateTime('2024-05-20T10:30:00Z'),
});

const espejoDelTiempo = createLiteraryWork({
	_id: 'literaryWork_home_2',
	slug: 'el-espejo-del-tiempo',
	title: 'El espejo del tiempo',
	authors: [authorTeaserMock, coauthorTeaserMock],
	coverImage: '',
	content: [
		createLiteraryWorkSection({
			position: 0,
			bodyHtml: createSanitizedHtml(
				'<p>El espejo no refleja el presente: devuelve, con un instante de retraso, la imagen de quien uno estaba a punto de dejar de ser.</p>',
			),
			readingTime: createReadingTime(5),
		}),
	],
	mediaSources: [],
	resources: [],
	tags: [tagMock],
	originalPublication: 'Éditions du Méridien (1987)',
	publishedAt: createIsoDateTime('2024-06-11T09:00:00Z'),
});

export const literaryWorkTeaserFixtureMock: LiteraryWorkTeaser = Object.freeze({
	...toTeaserBase(palacioNueveFronteras),
	authors: [authorTeaserMock],
	teaserSection: palacioNueveFronteras.content[0],
});

export const literaryWorkNavigationTeaserWithAuthorsFixtureMock: LiteraryWorkNavigationTeaserWithAuthors =
	Object.freeze({
		...toTeaserBase(espejoDelTiempo),
		authors: [authorTeaserMock, coauthorTeaserMock],
	});
