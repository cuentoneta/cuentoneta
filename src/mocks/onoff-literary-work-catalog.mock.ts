import type { LiteraryWork, LiteraryWorkCatalogEntry } from '@models/literary-work.model';
import { onoffLiteraryWorksMock } from './onoff-literary-works.mock';

function toCatalogEntry(literaryWork: LiteraryWork): LiteraryWorkCatalogEntry {
	return {
		slug: literaryWork.slug,
		title: literaryWork.title,
		totalReadingTime: literaryWork.totalReadingTime,
		authors: literaryWork.authors.map(({ slug, name }) => ({ slug, name })),
	};
}

export const onoffLiteraryWorkCatalogMock: LiteraryWorkCatalogEntry[] = onoffLiteraryWorksMock.map(toCatalogEntry);
