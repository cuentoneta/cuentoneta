import type { Author, AuthorTeaser } from '@models/author.model';
import type {
	LiteraryWork,
	LiteraryWorkNavigationTeaser,
	LiteraryWorkNavigationTeaserWithAuthors,
	LiteraryWorkTeaser,
} from '@models/literary-work.model';
import type { MediaTeaser } from '@models/media.model';
import { createLiteraryWorkExcerpt } from '@models/literary-work-excerpt.model';
import { createMarkdown } from '@models/markdown.model';
import type { SanitizedHtml } from '@models/sanitized-html.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import { embeddedAuthorTeaserMock } from './author.mock';
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
import { elOdioLiteraryWorkMock } from './onoff/literary-work/el-odio.literary-work.mock';
import { elTratadoDeLosPlaceresLiteraryWorkMock } from './onoff/literary-work/el-tratado-de-los-placeres.literary-work.mock';
import { geometriaLiteraryWorkMock } from './onoff/literary-work/geometria.literary-work.mock';
import { lasDosAntorchasLiteraryWorkMock } from './onoff/literary-work/las-dos-antorchas.literary-work.mock';
import { lasEscalerasLiteraryWorkMock } from './onoff/literary-work/las-escaleras.literary-work.mock';
import { losPeldanosLiteraryWorkMock } from './onoff/literary-work/los-peldanos.literary-work.mock';
import { neronLiteraryWorkMock } from './onoff/literary-work/neron.literary-work.mock';
import { palacioNueveFronterasLiteraryWorkMock } from './onoff/literary-work/el-palacio-de-las-nueve-fronteras.literary-work.mock';
import elOdioMd from './onoff/literary-work/el-odio.md?raw';
import elTratadoDeLosPlaceresMd from './onoff/literary-work/el-tratado-de-los-placeres.md?raw';
import geometriaMd from './onoff/literary-work/geometria.md?raw';
import lasDosAntorchasMd from './onoff/literary-work/las-dos-antorchas.md?raw';
import lasEscalerasMd from './onoff/literary-work/las-escaleras.md?raw';
import losPeldanosMd from './onoff/literary-work/los-peldanos.md?raw';
import neronMd from './onoff/literary-work/neron.md?raw';
import palacioNueveFronterasMd from './onoff/literary-work/el-palacio-de-las-nueve-fronteras.md?raw';

// Espeja el recorte que hace la query, para que el corpus de dominio diga lo mismo que produce el
// ACL. Es la heurística de doble salto de línea, con el mismo tratamiento de CRLF: si acá y allá
// divergieran, el spec de alineación lo marcaría — que es justamente para lo que existe.
function toExcerptHtml(markdown: string): SanitizedHtml {
	const firstBlock = markdown.split('\r\n\r\n')[0].split('\n\n')[0];
	return markdownToSanitizedHtml(createMarkdown(firstBlock));
}

// Deriva el teaser desde la obra completa: conserva los campos de la vista base, reemplaza los autores
// por su variante AuthorTeaser y expone el arranque de la sección de apertura como `excerpt`
// — ver LITERARY_WORK_DESIGN.md §2.
function toTeaser(literaryWork: LiteraryWork, markdown: string): LiteraryWorkTeaser {
	return {
		_id: literaryWork._id,
		slug: literaryWork.slug,
		title: literaryWork.title,
		coverImage: literaryWork.coverImage,
		totalReadingTime: literaryWork.totalReadingTime,
		sectionCount: literaryWork.sectionCount,
		tags: literaryWork.tags,
		mediaSources: literaryWork.mediaSources.map(toMediaTeaser),
		authors: [embeddedAuthorTeaserMock],
		excerpt: createLiteraryWorkExcerpt({
			title: literaryWork.content[0].title,
			bodyHtml: toExcerptHtml(markdown),
		}),
	};
}

export const palacioNueveFronterasLiteraryWorkTeaserMock = toTeaser(
	palacioNueveFronterasLiteraryWorkMock,
	palacioNueveFronterasMd,
);
export const geometriaLiteraryWorkTeaserMock = toTeaser(geometriaLiteraryWorkMock, geometriaMd);
export const losPeldanosLiteraryWorkTeaserMock = toTeaser(losPeldanosLiteraryWorkMock, losPeldanosMd);
export const lasEscalerasLiteraryWorkTeaserMock = toTeaser(lasEscalerasLiteraryWorkMock, lasEscalerasMd);
export const elOdioLiteraryWorkTeaserMock = toTeaser(elOdioLiteraryWorkMock, elOdioMd);
export const elTratadoDeLosPlaceresLiteraryWorkTeaserMock = toTeaser(
	elTratadoDeLosPlaceresLiteraryWorkMock,
	elTratadoDeLosPlaceresMd,
);
export const lasDosAntorchasLiteraryWorkTeaserMock = toTeaser(lasDosAntorchasLiteraryWorkMock, lasDosAntorchasMd);
export const neronLiteraryWorkTeaserMock = toTeaser(neronLiteraryWorkMock, neronMd);

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

// Ninguna obra del canon declara recursos multimedia, así que los casos que necesitan ese shape
// —los selectores de multimedia de las tarjetas— lo obtienen de esta variante enriquecida, en vez
// de armarlo cada uno por su cuenta.
// Sale del canon; el YouTube repetido existe para que los consumidores que cuentan medios tengan más
// elementos que tipos distintos.
const mediaSources: MediaTeaser[] = [...onoffMediaMock, ...onoffYouTubeVideosMock].map(toMediaTeaser);

export const withMediaSources = (teaser: LiteraryWorkTeaser): LiteraryWorkTeaser => ({ ...teaser, mediaSources });

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
