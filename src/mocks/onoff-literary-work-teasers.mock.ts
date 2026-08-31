import type { Author, AuthorTeaser } from '@models/author.model';
import type {
	LiteraryWork,
	LiteraryWorkNavigationTeaser,
	LiteraryWorkNavigationTeaserWithAuthors,
	LiteraryWorkTeaser,
} from '@models/literary-work.model';
import type { MediaTeaser } from '@models/media.model';
import { onoffMediaMock, onoffYouTubeVideosMock, toMediaTeaser } from './onoff-media.mock';
import { onoffLiteraryWorksMock } from './onoff-literary-works.mock';

// Proyecta el Author de dominio a su variante AuthorTeaser (misma base, sin biografía y con recursos
// vaciados), para derivar los autores de una vista de listado desde los autores propios de cada obra del canon.
function toAuthorTeaser(author: Author): AuthorTeaser {
	return {
		_id: author._id,
		slug: author.slug,
		name: author.name,
		imageUrl: author.imageUrl,
		nationality: author.nationality,
		tags: author.tags,
		bornOn: author.bornOn,
		diedOn: author.diedOn,
		bornOnYear: author.bornOnYear,
		diedOnYear: author.diedOnYear,
		resources: [],
	};
}
// Los teasers por obra viven bajo `onoff/literary-work/`, junto a las obras de las que derivan: es la
// ruta que la restricción de imports alcanza, y este agregador es uno de los consumidores que la
// convención sí admite.
import {
	elOdioLiteraryWorkTeaserMock,
	elTratadoDeLosPlaceresLiteraryWorkTeaserMock,
	geometriaLiteraryWorkTeaserMock,
	lasDosAntorchasLiteraryWorkTeaserMock,
	lasEscalerasLiteraryWorkTeaserMock,
	losPeldanosLiteraryWorkTeaserMock,
	neronLiteraryWorkTeaserMock,
	palacioNueveFronterasLiteraryWorkTeaserMock,
} from './onoff/literary-work/literary-work-teasers.mock';

export const onoffLiteraryWorkTeasersMock: LiteraryWorkTeaser[] = [
	palacioNueveFronterasLiteraryWorkTeaserMock,
	geometriaLiteraryWorkTeaserMock,
	losPeldanosLiteraryWorkTeaserMock,
	lasEscalerasLiteraryWorkTeaserMock,
	elOdioLiteraryWorkTeaserMock,
	elTratadoDeLosPlaceresLiteraryWorkTeaserMock,
	lasDosAntorchasLiteraryWorkTeaserMock,
	neronLiteraryWorkTeaserMock,
];

// El conjunto que `withMediaSources` inyecta sale del canon; el YouTube repetido existe para que los
// consumidores que cuentan medios tengan más elementos que tipos distintos.
const mediaSources: MediaTeaser[] = [...onoffMediaMock, ...onoffYouTubeVideosMock].map(toMediaTeaser);

export const withMediaSources = (teaser: LiteraryWorkTeaser): LiteraryWorkTeaser => ({ ...teaser, mediaSources });

// Enriquece **todo** el canon, así que sirve a un caso que necesita el shape sobre cualquier obra.
// El otro, `onoffLiteraryWorkTeasersWithMediaSources`, conserva solo las obras cuyo propio canon
// declara medios. Los nombres se parecen y los conjuntos no: elegir por el predicado.
export const onoffLiteraryWorkTeasersWithMediaSourcesMock: LiteraryWorkTeaser[] =
	onoffLiteraryWorkTeasersMock.map(withMediaSources);

// Los teasers de navegación proyectan solo la vista base (LiteraryWorkBase): las vistas de navegación
// no muestran el paratexto editorial, el cuerpo ni la sección de apertura. La variante sin autores deja
// `authors` vacío (Array<never>); la variante con autores lo resume a AuthorTeaser — ver
// LITERARY_WORK_DESIGN.md §2 y las interfaces en literary-work.model.ts.
function toNavigationTeaser(literaryWork: LiteraryWork): LiteraryWorkNavigationTeaser {
	return {
		_id: literaryWork._id,
		slug: literaryWork.slug,
		title: literaryWork.title,
		coverImage: literaryWork.coverImage,
		totalReadingTime: literaryWork.totalReadingTime,
		sectionCount: literaryWork.sectionCount,
		tags: literaryWork.tags,
		mediaSources: literaryWork.mediaSources.map(toMediaTeaser),
		authors: [],
	};
}

function toNavigationTeaserWithAuthors(literaryWork: LiteraryWork): LiteraryWorkNavigationTeaserWithAuthors {
	return { ...toNavigationTeaser(literaryWork), authors: literaryWork.authors.map(toAuthorTeaser) };
}

export const onoffLiteraryWorkNavigationTeasersMock: LiteraryWorkNavigationTeaser[] =
	onoffLiteraryWorksMock.map(toNavigationTeaser);

export const onoffLiteraryWorkNavigationTeasersWithAuthorsMock: LiteraryWorkNavigationTeaserWithAuthors[] =
	onoffLiteraryWorksMock.map(toNavigationTeaserWithAuthors);

export const onoffLiteraryWorkTeasersWithMediaSources: LiteraryWorkTeaser[] = onoffLiteraryWorkTeasersMock.filter(
	(teaser) => teaser.mediaSources.length > 0,
);

// El tipo exige `excerpt`, pero no que su cuerpo traiga algo: una obra cuya sección de apertura
// arranque vacía lo satisface igual. El predicado va sobre el cuerpo, que es lo que la tarjeta pinta.
export const onoffLiteraryWorkTeasersWithExcerptMock: LiteraryWorkTeaser[] = onoffLiteraryWorkTeasersMock.filter(
	(teaser) => teaser.excerpt.bodyHtml !== '',
);
