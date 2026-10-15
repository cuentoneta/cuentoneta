// Core
import type { EnvironmentProviders } from '@angular/core';
import { makeEnvironmentProviders } from '@angular/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

// Models
import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import { EMPTY_READING_SUGGESTIONS, type ReadingSuggestions } from '@models/reading-suggestions.model';
import { LiteraryWorkApi, type LiteraryWorkTeaserFilter } from './literary-work.provider';

export class StubLiteraryWorkApi implements LiteraryWorkApi {
	// Sin bloque cargado devuelve el vacío, que es el estado del que el consumidor no se pinta; los specs
	// que necesitan verlo le pasan el suyo.
	constructor(
		private readonly literaryWork: LiteraryWork,
		private readonly teasers: readonly LiteraryWorkTeaser[] = [],
		private readonly suggestions: ReadingSuggestions = EMPTY_READING_SUGGESTIONS,
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

	public getSuggestions(): Observable<ReadingSuggestions> {
		return of(this.suggestions);
	}
}

export function provideLiteraryWorkApiMock(api: LiteraryWorkApi): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LiteraryWorkApi, useValue: api }]);
}
