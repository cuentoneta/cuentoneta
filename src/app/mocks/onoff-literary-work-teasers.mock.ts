import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import { authorTeaserMock } from './author.mock';
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
function toTeaser(work: LiteraryWork): LiteraryWorkTeaser {
	return {
		_id: work._id,
		slug: work.slug,
		title: work.title,
		coverImage: work.coverImage,
		totalReadingTime: work.totalReadingTime,
		sectionCount: work.sectionCount,
		tags: work.tags,
		mediaSources: work.mediaSources,
		authors: [authorTeaserMock],
		teaserSection: work.content[0],
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
