import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawAnonimoLiteraryWorkAuthor } from './onoff-raw-author.mock';
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

// Obra recitada (sin autoría real): `totalReadingTime` lo setea el editor a mano (duración del
// medio), distinto de la suma de las secciones — referencia al author "Anónimo" del catálogo.
export const anonymousRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	...elOdioRawLiteraryWork,
	_id: 'onoff-literary-work-cantar-anonimo',
	slug: 'cantar-anonimo',
	title: 'Cantar anónimo',
	coverImage: null,
	totalReadingTime: 40,
	sectionCount: 1,
	authors: [rawAnonimoLiteraryWorkAuthor],
	content: [
		{
			_key: 'section-1',
			title: null,
			epigraphs: [],
			body: 'Nadie firma estas líneas: la voz que las recita vive en otra parte.',
			readingTime: 1,
		},
	],
};

// Obra sin reading time persistido (campos ausentes): ejercita la materialización self-healing —
// el futuro mapper computa `readingTime` por sección y `totalReadingTime`, y los persiste.
export const unmaterializedRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	...elOdioRawLiteraryWork,
	_id: 'onoff-literary-work-el-odio-sin-materializar',
	totalReadingTime: null,
	content: elOdioRawLiteraryWork.content.map((section) => ({ ...section, readingTime: null })),
};
