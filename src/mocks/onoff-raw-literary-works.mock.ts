import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { palacioNueveFronterasSectionTitle } from './onoff/literary-work/el-palacio-de-las-nueve-fronteras.epigraph';
import {
	palacioFirstSectionReadingTime,
	palacioMultiSectionTotalReadingTime,
	palacioSecondSectionBody,
	palacioSecondSectionReadingTime,
	palacioSecondSectionTitle,
} from './onoff/literary-work/el-palacio-de-las-nueve-fronteras.multi-section';
import { elOdioRawLiteraryWork } from './onoff/literary-work/el-odio.literary-work.raw.mock';
import { elTratadoDeLosPlaceresRawLiteraryWork } from './onoff/literary-work/el-tratado-de-los-placeres.literary-work.raw.mock';
import { geometriaRawLiteraryWork } from './onoff/literary-work/geometria.literary-work.raw.mock';
import { lasDosAntorchasRawLiteraryWork } from './onoff/literary-work/las-dos-antorchas.literary-work.raw.mock';
import { lasEscalerasRawLiteraryWork } from './onoff/literary-work/las-escaleras.literary-work.raw.mock';
import { losPeldanosRawLiteraryWork } from './onoff/literary-work/los-peldanos.literary-work.raw.mock';
import { neronRawLiteraryWork } from './onoff/literary-work/neron.literary-work.raw.mock';
import { palacioNueveFronterasRawLiteraryWork } from './onoff/literary-work/el-palacio-de-las-nueve-fronteras.literary-work.raw.mock';

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

// Las obras crudas con algún epígrafe cortado en varias líneas: es el seam donde el salto viaja del
// Markdown del origen al HTML del dominio, así que el mapeo necesita un caso del canon que lo declare.
export const onoffRawLiteraryWorksWithMultilineEpigraphs: NonNullable<LiteraryWorkBySlugQueryResult>[] =
	onoffRawLiteraryWorksMock.filter((rawLiteraryWork) =>
		rawLiteraryWork.content.some((section) =>
			section.epigraphs.some((epigraph) => epigraph.text?.includes('\n') ?? false),
		),
	);

// Selectores por capacidad de la nota editorial (contraparte raw de `onoffLiteraryWorksWith/WithoutEditorialNote`),
// para ejercitar sus dos ramas en el mapeo sin conocer un slug concreto.
export const onoffRawLiteraryWorksWithEditorialNote: NonNullable<LiteraryWorkBySlugQueryResult>[] =
	onoffRawLiteraryWorksMock.filter((rawLiteraryWork) => rawLiteraryWork.editorialNote !== null);

export const onoffRawLiteraryWorksWithoutEditorialNote: NonNullable<LiteraryWorkBySlugQueryResult>[] =
	onoffRawLiteraryWorksMock.filter((rawLiteraryWork) => rawLiteraryWork.editorialNote === null);

// Selector por capacidad de las etiquetas, para ejercitar el mapeo de tags del repository con datos
// reales sin conocer un slug concreto.
export const onoffRawLiteraryWorksWithTags: NonNullable<LiteraryWorkBySlugQueryResult>[] =
	onoffRawLiteraryWorksMock.filter((rawLiteraryWork) => rawLiteraryWork.tags.length > 0);

// Toda obra del canon declara su tipo literario, así que la rama del mapeo que devuelve una lista de
// etiquetas vacía no tiene dónde ejercitarse contra el corpus. Se construye a propósito, como el resto
// de los escenarios de borde: dejar una obra sin tags para cubrirla le quitaría al canon la cobertura
// de las etiquetas que solo ella carga.
export const untaggedRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	...palacioNueveFronterasRawLiteraryWork,
	_id: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras-untagged',
	tags: [],
};

export const onoffRawLiteraryWorksWithoutTags: NonNullable<LiteraryWorkBySlugQueryResult>[] = [untaggedRawLiteraryWork];

// Selector por capacidad de multimedia, para ejercitar el mapeo de medios del repository con datos
// reales sin conocer un slug concreto.
export const onoffRawLiteraryWorksWithMediaSources: NonNullable<LiteraryWorkBySlugQueryResult>[] =
	onoffRawLiteraryWorksMock.filter((rawLiteraryWork) => rawLiteraryWork.mediaSources.length > 0);

// Obra de dos secciones, con los reading time ya persistidos (materializados). Ejercita la lectura
// de content[] multi-sección y la futura proyección ?section=N.
export const multiSectionRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	...palacioNueveFronterasRawLiteraryWork,
	_id: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras-multi',
	totalReadingTime: palacioMultiSectionTotalReadingTime,
	sectionCount: 2,
	content: [
		{
			_key: 'section-1',
			title: palacioNueveFronterasSectionTitle,
			epigraphs: [],
			body: palacioNueveFronterasRawLiteraryWork.content[0].body,
			readingTime: palacioFirstSectionReadingTime,
		},
		{
			_key: 'section-2',
			title: palacioSecondSectionTitle,
			epigraphs: [],
			body: palacioSecondSectionBody,
			readingTime: palacioSecondSectionReadingTime,
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

// Obra de dos secciones con materialización mixta: la primera sección con reading time persistido y la
// segunda en null, con el total sin persistir. Ejercita el fallback por sección coexistiendo con un
// valor ya materializado dentro de la misma obra.
export const mixedMaterializationRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	...multiSectionRawLiteraryWork,
	_id: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras-mixta',
	totalReadingTime: null,
	content: [
		{ ...multiSectionRawLiteraryWork.content[0], readingTime: 7 },
		{ ...multiSectionRawLiteraryWork.content[1], readingTime: null },
	],
};
