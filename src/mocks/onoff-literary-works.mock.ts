import type { LiteraryWork } from '@models/literary-work.model';
import { elOdioLiteraryWorkMock } from './onoff/el-odio.mock';
import { elTratadoDeLosPlaceresLiteraryWorkMock } from './onoff/el-tratado-de-los-placeres.mock';
import { geometriaLiteraryWorkMock } from './onoff/geometria.mock';
import { lasDosAntorchasLiteraryWorkMock } from './onoff/las-dos-antorchas.mock';
import { lasEscalerasLiteraryWorkMock } from './onoff/las-escaleras.mock';
import { losPeldanosLiteraryWorkMock } from './onoff/los-peldanos.mock';
import { neronLiteraryWorkMock } from './onoff/neron.mock';
import { palacioNueveFronterasLiteraryWorkMock } from './onoff/el-palacio-de-las-nueve-fronteras.mock';

// Corpus LiteraryWork de las obras (ficticias) de François Onoff — contraparte del corpus Story, con
// el cuerpo en Markdown (./onoff/<slug>.md) materializado a bodyHtml por el pipeline del dominio.
export const onoffLiteraryWorksMock: LiteraryWork[] = [
	palacioNueveFronterasLiteraryWorkMock,
	geometriaLiteraryWorkMock,
	losPeldanosLiteraryWorkMock,
	lasEscalerasLiteraryWorkMock,
	elOdioLiteraryWorkMock,
	elTratadoDeLosPlaceresLiteraryWorkMock,
	lasDosAntorchasLiteraryWorkMock,
	neronLiteraryWorkMock,
];

// Selectores por capacidad, derivados por predicado: un spec declara el shape que necesita (obras con
// título de sección / con epígrafes) en vez de conocer un slug concreto. Se auto-mantienen al crecer el
// corpus o al enriquecer más obras, sin tocar los specs.
export const onoffLiteraryWorksWithSectionTitles: LiteraryWork[] = onoffLiteraryWorksMock.filter((literaryWork) =>
	literaryWork.content.some((section) => section.title !== undefined),
);

export const onoffLiteraryWorksWithEpigraphs: LiteraryWork[] = onoffLiteraryWorksMock.filter((literaryWork) =>
	literaryWork.content.some((section) => (section.epigraphs?.length ?? 0) > 0),
);
