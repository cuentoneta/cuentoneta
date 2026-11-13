// Core
import type { EnvironmentProviders } from '@angular/core';
import { makeEnvironmentProviders } from '@angular/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

// Models
import type { LiteraryWork, LiteraryWorkCatalogEntry, LiteraryWorkTeaser } from '@models/literary-work.model';
import { LiteraryWorkApi, type LiteraryWorkTeaserFilter } from './literary-work.provider';

export class StubLiteraryWorkApi implements LiteraryWorkApi {
	constructor(
		private readonly literaryWork: LiteraryWork,
		private readonly teasers: readonly LiteraryWorkTeaser[] = [],
		private readonly catalog: readonly LiteraryWorkCatalogEntry[] = [],
	) {}

	public getBySlug(): Observable<LiteraryWork> {
		return of(this.literaryWork);
	}

	public getTeasers(filter: LiteraryWorkTeaserFilter = {}): Observable<LiteraryWorkTeaser[]> {
		return of(
			filter.author
				? this.teasers.filter(({ authors }) => authors.some((author) => author.slug === filter.author))
				: [...this.teasers],
		);
	}

	public getCatalog(): Observable<LiteraryWorkCatalogEntry[]> {
		return of([...this.catalog]);
	}
}

export function provideLiteraryWorkApiMock(api: LiteraryWorkApi): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LiteraryWorkApi, useValue: api }]);
}
