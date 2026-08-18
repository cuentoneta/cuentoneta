import type { LiteraryWork } from '@models/literary-work.model';
import type { AttributedText } from '@models/attributed-text.model';
import { elOdioLiteraryWorkMock } from './onoff/literary-work/el-odio.literary-work.mock';
import { elTratadoDeLosPlaceresLiteraryWorkMock } from './onoff/literary-work/el-tratado-de-los-placeres.literary-work.mock';
import { geometriaLiteraryWorkMock } from './onoff/literary-work/geometria.literary-work.mock';
import { lasDosAntorchasLiteraryWorkMock } from './onoff/literary-work/las-dos-antorchas.literary-work.mock';
import { lasEscalerasLiteraryWorkMock } from './onoff/literary-work/las-escaleras.literary-work.mock';
import { losPeldanosLiteraryWorkMock } from './onoff/literary-work/los-peldanos.literary-work.mock';
import { neronLiteraryWorkMock } from './onoff/literary-work/neron.literary-work.mock';
import { palacioNueveFronterasLiteraryWorkMock } from './onoff/literary-work/el-palacio-de-las-nueve-fronteras.literary-work.mock';

// Corpus LiteraryWork de las obras (ficticias) de François Onoff — contraparte del corpus Story, con
// el cuerpo en Markdown (./onoff/literary-work/<slug>.md) materializado a bodyHtml por el pipeline del dominio.
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
// Obras de una sola sección: el shape mono-sección que el test de paridad con Story necesita. Hoy todo
// el corpus es mono-sección; el predicado se auto-mantiene si más adelante se incorpora una obra multi-sección.
export const onoffLiteraryWorksSingleSection: LiteraryWork[] = onoffLiteraryWorksMock.filter(
	(literaryWork) => literaryWork.content.length === 1,
);

export const onoffLiteraryWorksWithSectionTitles: LiteraryWork[] = onoffLiteraryWorksMock.filter((literaryWork) =>
	literaryWork.content.some((section) => section.title !== undefined),
);

export const onoffLiteraryWorksWithEpigraphs: LiteraryWork[] = onoffLiteraryWorksMock.filter((literaryWork) =>
	literaryWork.content.some((section) => (section.epigraphs?.length ?? 0) > 0),
);

export const onoffLiteraryWorksWithEditorialNote: LiteraryWork[] = onoffLiteraryWorksMock.filter(
	(literaryWork) => literaryWork.editorialNote !== undefined,
);

export const onoffLiteraryWorksWithoutEditorialNote: LiteraryWork[] = onoffLiteraryWorksMock.filter(
	(literaryWork) => literaryWork.editorialNote === undefined,
);

export const onoffLiteraryWorksWithMediaSources: LiteraryWork[] = onoffLiteraryWorksMock.filter(
	(literaryWork) => literaryWork.mediaSources.length > 0,
);

// Las dos caras que separa el umbral de "hay entre qué elegir": una obra con un solo medio y una con
// varios. Un consumidor que ofrece la elección se comporta distinto a cada lado, y el predicado deja que
// lo afirme sin nombrar la obra que hoy cae de ese lado.
export const onoffLiteraryWorksWithSingleMediaSource: LiteraryWork[] = onoffLiteraryWorksMock.filter(
	(literaryWork) => literaryWork.mediaSources.length === 1,
);

export const onoffLiteraryWorksWithMultipleMediaSources: LiteraryWork[] = onoffLiteraryWorksMock.filter(
	(literaryWork) => literaryWork.mediaSources.length > 1,
);

// Obras cuyo cuerpo cita un texto ajeno al relato: es la construcción que el original marcaba con
// alineación y que Markdown resuelve como cita, así que su tratamiento tipográfico necesita un caso
// del canon donde afirmarse.
export const onoffLiteraryWorksWithBlockquotes: LiteraryWork[] = onoffLiteraryWorksMock.filter((literaryWork) =>
	// Sin el `>` de cierre: el día que el pipeline emita el tag con un atributo, el selector no se vacía
	// en silencio (y un selector vacío revienta al importar, no falla suave).
	literaryWork.content.some((section) => section.bodyHtml.includes('<blockquote')),
);

// Los epígrafes sueltos, para quien necesita el shape { text, reference? } y no la obra que lo
// contiene — los componentes que pintan HTML saneado en sus specs y stories. Se deriva del corpus
// para no mantener una lista en paralelo que se desactualice al enriquecer otra obra.
export const onoffLiteraryWorkEpigraphsMock: AttributedText[] = onoffLiteraryWorksMock.flatMap((literaryWork) =>
	literaryWork.content.flatMap((section) => section.epigraphs ?? []),
);
