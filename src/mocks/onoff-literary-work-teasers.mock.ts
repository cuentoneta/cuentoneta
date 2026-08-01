import type {
	LiteraryWork,
	LiteraryWorkNavigationTeaser,
	LiteraryWorkNavigationTeaserWithAuthors,
	LiteraryWorkTeaser,
} from '@models/literary-work.model';
import { authorTeaserMock } from './author.mock';
import { onoffLiteraryWorksMock } from './onoff-literary-works.mock';
import { elOdioLiteraryWorkMock } from './onoff/el-odio.mock';
import { elTratadoDeLosPlaceresLiteraryWorkMock } from './onoff/el-tratado-de-los-placeres.mock';
import { geometriaLiteraryWorkMock } from './onoff/geometria.mock';
import { lasDosAntorchasLiteraryWorkMock } from './onoff/las-dos-antorchas.mock';
import { lasEscalerasLiteraryWorkMock } from './onoff/las-escaleras.mock';
import { losPeldanosLiteraryWorkMock } from './onoff/los-peldanos.mock';
import { neronLiteraryWorkMock } from './onoff/neron.mock';
import { palacioNueveFronterasLiteraryWorkMock } from './onoff/el-palacio-de-las-nueve-fronteras.mock';

// Deriva el teaser desde la obra completa: conserva los campos de la vista base, reemplaza los autores
// por su variante AuthorTeaser y expone la primera sección como `teaserSection` (el teaser de
// LiteraryWork no vacía el contenido: muestra la sección de apertura — ver LITERARY_WORK_DESIGN.md §2).
function toTeaser(literaryWork: LiteraryWork): LiteraryWorkTeaser {
	return {
		_id: literaryWork._id,
		slug: literaryWork.slug,
		title: literaryWork.title,
		coverImage: literaryWork.coverImage,
		totalReadingTime: literaryWork.totalReadingTime,
		sectionCount: literaryWork.sectionCount,
		tags: literaryWork.tags,
		mediaSources: literaryWork.mediaSources,
		authors: [authorTeaserMock],
		teaserSection: literaryWork.content[0],
	};
}

export const palacioNueveFronterasLiteraryWorkTeaserMock = toTeaser(palacioNueveFronterasLiteraryWorkMock);
export const geometriaLiteraryWorkTeaserMock = toTeaser(geometriaLiteraryWorkMock);
export const losPeldanosLiteraryWorkTeaserMock = toTeaser(losPeldanosLiteraryWorkMock);
export const lasEscalerasLiteraryWorkTeaserMock = toTeaser(lasEscalerasLiteraryWorkMock);
export const elOdioLiteraryWorkTeaserMock = toTeaser(elOdioLiteraryWorkMock);
export const elTratadoDeLosPlaceresLiteraryWorkTeaserMock = toTeaser(elTratadoDeLosPlaceresLiteraryWorkMock);
export const lasDosAntorchasLiteraryWorkTeaserMock = toTeaser(lasDosAntorchasLiteraryWorkMock);
export const neronLiteraryWorkTeaserMock = toTeaser(neronLiteraryWorkMock);

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
		mediaSources: literaryWork.mediaSources,
		authors: [],
	};
}

function toNavigationTeaserWithAuthors(literaryWork: LiteraryWork): LiteraryWorkNavigationTeaserWithAuthors {
	return { ...toNavigationTeaser(literaryWork), authors: [authorTeaserMock] };
}

export const onoffLiteraryWorkNavigationTeasersMock: LiteraryWorkNavigationTeaser[] =
	onoffLiteraryWorksMock.map(toNavigationTeaser);

export const onoffLiteraryWorkNavigationTeasersWithAuthorsMock: LiteraryWorkNavigationTeaserWithAuthors[] =
	onoffLiteraryWorksMock.map(toNavigationTeaserWithAuthors);
