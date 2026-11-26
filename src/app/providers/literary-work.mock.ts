// Core
import type { EnvironmentProviders } from '@angular/core';
import { makeEnvironmentProviders } from '@angular/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

// Models
import type { LiteraryWork, LiteraryWorkCatalogEntry, LiteraryWorkTeaser } from '@models/literary-work.model';
import { type Catalog, createCatalog } from '@models/catalog.model';
import { LiteraryWorkApi, type LiteraryWorkTeaserFilter } from './literary-work.provider';

interface StubLiteraryWorkApiOptions {
	readonly literaryWork: LiteraryWork;
	readonly teasers?: readonly LiteraryWorkTeaser[];
	readonly catalogEntries?: readonly LiteraryWorkCatalogEntry[];
}

export class StubLiteraryWorkApi implements LiteraryWorkApi {
	private readonly literaryWork: LiteraryWork;
	private readonly teasers: readonly LiteraryWorkTeaser[];
	private readonly catalogEntries: readonly LiteraryWorkCatalogEntry[];

	constructor(options: StubLiteraryWorkApiOptions) {
		this.literaryWork = options.literaryWork;
		this.teasers = options.teasers ?? [];
		this.catalogEntries = options.catalogEntries ?? [];
	}

	// Canned en el orden recibido: el orden del catálogo lo decide el servidor, y el doble no lo simula.
	public getCatalog(): Observable<Catalog<LiteraryWorkCatalogEntry>> {
		return of(createCatalog(this.catalogEntries, this.catalogEntries.length));
	}

	public getBySlug(): Observable<LiteraryWork> {
		return of(this.literaryWork);
	}

	public getTeasers(filter: LiteraryWorkTeaserFilter): Observable<LiteraryWorkTeaser[]> {
		return of(this.teasers.filter(({ authors }) => authors.some((author) => author.slug === filter.author)));
	}

	public getListing(): Observable<LiteraryWorkTeaser[]> {
		return of([...this.teasers]);
	}
}

export function provideLiteraryWorkApiMock(api: LiteraryWorkApi): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LiteraryWorkApi, useValue: api }]);
}
