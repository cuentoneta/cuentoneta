import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { elOdioRawLiteraryWork } from './onoff/el-odio.literary-work.raw.mock';
import { elTratadoDeLosPlaceresRawLiteraryWork } from './onoff/el-tratado-de-los-placeres.literary-work.raw.mock';
import { geometriaRawLiteraryWork } from './onoff/geometria.literary-work.raw.mock';
import { lasDosAntorchasRawLiteraryWork } from './onoff/las-dos-antorchas.literary-work.raw.mock';
import { lasEscalerasRawLiteraryWork } from './onoff/las-escaleras.literary-work.raw.mock';
import { losPeldanosRawLiteraryWork } from './onoff/los-peldanos.literary-work.raw.mock';
import { neronRawLiteraryWork } from './onoff/neron.literary-work.raw.mock';
import { palacioNueveFronterasRawLiteraryWork } from './onoff/el-palacio-de-las-nueve-fronteras.literary-work.raw.mock';

// Corpus raw (shape crudo de Sanity, `NonNullable<LiteraryWorkBySlugQueryResult>`) de las obras
// (ficticias) de François Onoff — contraparte cruda de `onoffLiteraryWorksMock`, en el mismo orden.
export const onoffRawLiteraryWorksMock: NonNullable<LiteraryWorkBySlugQueryResult>[] = [
	palacioNueveFronterasRawLiteraryWork,
	geometriaRawLiteraryWork,
	losPeldanosRawLiteraryWork,
	lasEscalerasRawLiteraryWork,
	elOdioRawLiteraryWork,
	elTratadoDeLosPlaceresRawLiteraryWork,
	lasDosAntorchasRawLiteraryWork,
	neronRawLiteraryWork,
];

// Selector por capacidad (contraparte raw de `onoffLiteraryWorksWithEpigraphs`): las obras crudas cuyo
// content trae epígrafes, para ejercitar el mapeo raw→dominio del epígrafe sin conocer un slug concreto.
export const onoffRawLiteraryWorksWithEpigraphs: NonNullable<LiteraryWorkBySlugQueryResult>[] =
	onoffRawLiteraryWorksMock.filter((rawLiteraryWork) =>
		rawLiteraryWork.content.some((section) => section.epigraphs.length > 0),
	);

// Selectores por capacidad de la nota editorial (contraparte raw de `onoffLiteraryWorksWith/WithoutEditorialNote`),
// para ejercitar sus dos ramas en el mapeo sin conocer un slug concreto.
export const onoffRawLiteraryWorksWithEditorialNote: NonNullable<LiteraryWorkBySlugQueryResult>[] =
	onoffRawLiteraryWorksMock.filter((rawLiteraryWork) => rawLiteraryWork.editorialNote !== null);

export const onoffRawLiteraryWorksWithoutEditorialNote: NonNullable<LiteraryWorkBySlugQueryResult>[] =
	onoffRawLiteraryWorksMock.filter((rawLiteraryWork) => rawLiteraryWork.editorialNote === null);

// Obra de dos secciones, con los reading time ya persistidos (materializados). Ejercita la lectura
// de content[] multi-sección y la futura proyección ?section=N.
export const multiSectionRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	...palacioNueveFronterasRawLiteraryWork,
	_id: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras-multi',
	totalReadingTime: 12,
	sectionCount: 2,
	content: [
		{
			_key: 'section-1',
			title: 'La primera frontera',
			epigraphs: [],
			body: palacioNueveFronterasRawLiteraryWork.content[0].body,
			readingTime: 11,
		},
		{
			_key: 'section-2',
			title: 'La novena frontera',
			epigraphs: [],
			body: 'Le faltaba todavía la voz. Para darle una voz tuve que perder la mía.',
			readingTime: 1,
		},
	],
};

// Obra sin reading time persistido (campos en null): ejercita las dos vías que atienden ese estado —
// el fallback puro que deriva el repository en lectura, sin escribir, y el script de backfill, que es
// el único que persiste.
export const unmaterializedRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	...elOdioRawLiteraryWork,
	_id: 'onoff-literary-work-el-odio-sin-materializar',
	totalReadingTime: null,
	content: elOdioRawLiteraryWork.content.map((section) => ({ ...section, readingTime: null })),
};
