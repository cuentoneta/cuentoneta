import type {
	LandingPageContentQueryResult,
	LiteraryWorkNavigationTeasersWithAuthorsQueryResult,
	RotatingContentQueryResult,
} from '@sanity-types';
import {
	createLiteraryWorkNavigationTeaser,
	type LiteraryWorkNavigationTeaserWithAuthors,
} from '@models/literary-work.model';
import { createReadingTime } from '@models/reading-time.model';
import { mapAuthorTeaser, mapTags, urlFor } from '../../_utils/functions';
import { mapMediaTeasers } from '../../_utils/media-sources.functions';

// El ensamblado de la vista de navegación con autores es propiedad de este módulo y no del repository
// que hoy la produce: la landing, el contenido rotativo y el listado sin filtros la necesitan
// idéntica, y una segunda definición haría que la misma obra se construyera por un camino y fallara
// por el otro. El origen es una unión de tipos porque cada query declara su resultado por su lado,
// aunque compartan la proyección: el tipo verifica que sigan alineados.
type SanityNavigationTeaser =
	| NonNullable<LandingPageContentQueryResult>['latestLiteraryWorks'][number]
	| NonNullable<RotatingContentQueryResult>['mostReadLiteraryWorks'][number]
	| LiteraryWorkNavigationTeasersWithAuthorsQueryResult[number];

export function mapNavigationTeaser(raw: SanityNavigationTeaser): LiteraryWorkNavigationTeaserWithAuthors {
	if (raw.totalReadingTime === null) {
		// Sin el total no hay nada que mostrar en la tarjeta: es una obra a la que el backfill todavía
		// no le calculó su tiempo de lectura.
		throw new Error(`LiteraryWorkNavigationTeaser inválido: sin tiempo de lectura (slug "${raw.slug}")`);
	}
	return createLiteraryWorkNavigationTeaser({
		_id: raw._id,
		slug: raw.slug,
		title: raw.title,
		coverImage: raw.coverImage ? urlFor(raw.coverImage) : '',
		totalReadingTime: createReadingTime(raw.totalReadingTime),
		sectionCount: raw.sectionCount,
		tags: mapTags(raw.tags),
		mediaSources: mapMediaTeasers(raw.mediaSources),
		authors: raw.authors.map(mapAuthorTeaser),
	});
}
