import {
	createLiteraryWorkCatalogEntry,
	type LiteraryWork,
	type LiteraryWorkCatalogEntry,
} from '@models/literary-work.model';
import { onoffLiteraryWorksMock } from './onoff-literary-works.mock';

function toCatalogEntry(literaryWork: LiteraryWork): LiteraryWorkCatalogEntry {
	return createLiteraryWorkCatalogEntry({
		slug: literaryWork.slug,
		title: literaryWork.title,
		authors: literaryWork.authors,
		totalReadingTime: literaryWork.totalReadingTime,
		tags: literaryWork.tags,
	});
}

// Por punto de código y no con `localeCompare`: espeja el orden de bytes en que GROQ ordena los slugs, así
// que el corpus queda en el mismo orden que entrega la query.
function bySlug(a: LiteraryWorkCatalogEntry, b: LiteraryWorkCatalogEntry): number {
	if (a.slug === b.slug) {
		return 0;
	}
	return a.slug < b.slug ? -1 : 1;
}

// Las entradas del catálogo de obras del canon de Onoff, una por obra, en el orden en que las entrega la
// query.
export const onoffLiteraryWorkCatalogEntriesMock: LiteraryWorkCatalogEntry[] = onoffLiteraryWorksMock
	.map(toCatalogEntry)
	.sort(bySlug);
