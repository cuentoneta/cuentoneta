import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import { createLiteraryWorkExcerpt } from '@models/literary-work-excerpt.model';
import { createMarkdown } from '@models/markdown.model';
import type { SanitizedHtml } from '@models/sanitized-html.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

import { embeddedAuthorTeaserMock } from '../../author.mock';
import { toMediaTeaser } from '../../onoff-media.mock';

import { elOdioLiteraryWorkMock } from './el-odio.literary-work.mock';
import { elTratadoDeLosPlaceresLiteraryWorkMock } from './el-tratado-de-los-placeres.literary-work.mock';
import { geometriaLiteraryWorkMock } from './geometria.literary-work.mock';
import { lasDosAntorchasLiteraryWorkMock } from './las-dos-antorchas.literary-work.mock';
import { lasEscalerasLiteraryWorkMock } from './las-escaleras.literary-work.mock';
import { losPeldanosLiteraryWorkMock } from './los-peldanos.literary-work.mock';
import { neronLiteraryWorkMock } from './neron.literary-work.mock';
import { palacioNueveFronterasLiteraryWorkMock } from './el-palacio-de-las-nueve-fronteras.literary-work.mock';
import elOdioMd from './el-odio.md?raw';
import elTratadoDeLosPlaceresMd from './el-tratado-de-los-placeres.md?raw';
import geometriaMd from './geometria.md?raw';
import lasDosAntorchasMd from './las-dos-antorchas.md?raw';
import lasEscalerasMd from './las-escaleras.md?raw';
import losPeldanosMd from './los-peldanos.md?raw';
import neronMd from './neron.md?raw';
import palacioNueveFronterasMd from './el-palacio-de-las-nueve-fronteras.md?raw';

// Espeja el recorte de la query, para que el corpus de dominio diga lo mismo que produce el ACL. El
// cruce ACL↔dominio detecta una divergencia solo sobre las formas que el canon tiene: ninguna obra
// arranca hoy con un renglón en blanco, así que ese caso lo sostiene únicamente que las dos
// implementaciones se toquen juntas.
function toExcerptHtml(markdown: string): SanitizedHtml {
	const blocks = markdown.split('\r\n\r\n')[0].split('\n\n');
	const firstBlock = blocks.find((block) => block !== '') ?? '';
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
