// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import { LiteraryWorkApi, type LiteraryWorkTeaserFilter } from './literary-work.provider';

export class StubLiteraryWorkApi implements LiteraryWorkApi {
	constructor(
		private readonly literaryWork: LiteraryWork,
		private readonly teasers: readonly LiteraryWorkTeaser[] = [],
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
}

export function provideLiteraryWorkApiMock(api: LiteraryWorkApi): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LiteraryWorkApi, useValue: api }]);
}
