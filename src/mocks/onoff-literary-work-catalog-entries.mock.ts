import {
	createLiteraryWorkCatalogEntry,
	type LiteraryWork,
	type LiteraryWorkCatalogEntry,
} from '@models/literary-work.model';
import { compareSlugs } from '@models/slug.model';
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

// Las entradas del catálogo de obras del canon de Onoff, una por obra, en el orden en que las entrega la
// query.
export const onoffLiteraryWorkCatalogEntriesMock: LiteraryWorkCatalogEntry[] = onoffLiteraryWorksMock
	.map(toCatalogEntry)
	.sort((a, b) => compareSlugs(a.slug, b.slug));
