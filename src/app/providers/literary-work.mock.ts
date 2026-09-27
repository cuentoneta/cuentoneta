// Core
import type { EnvironmentProviders } from '@angular/core';
import { makeEnvironmentProviders } from '@angular/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

// Models
import {
	toCatalogEntry,
	type LiteraryWork,
	type LiteraryWorkCatalogEntry,
	type LiteraryWorkTeaser,
} from '@models/literary-work.model';
import { LiteraryWorkApi, type LiteraryWorkTeaserFilter } from './literary-work.provider';

export class StubLiteraryWorkApi implements LiteraryWorkApi {
	constructor(
		private readonly literaryWork: LiteraryWork,
		private readonly teasers: readonly LiteraryWorkTeaser[] = [],
	) {}

	public getBySlug(): Observable<LiteraryWork> {
		return of(this.literaryWork);
	}

	// Proyecta los teasers que ya recibe por constructor: la entrada del catálogo es la misma obra sin
	// la tarjeta, así que el doble no necesita una segunda lista cableada en cada spec.
	public getCatalog(): Observable<LiteraryWorkCatalogEntry[]> {
		return of(this.teasers.map(toCatalogEntry));
	}

	public getTeasers(filter: LiteraryWorkTeaserFilter): Observable<LiteraryWorkTeaser[]> {
		return of(this.teasers.filter(({ authors }) => authors.some((author) => author.slug === filter.author)));
	}
}

export function provideLiteraryWorkApiMock(api: LiteraryWorkApi): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LiteraryWorkApi, useValue: api }]);
}
