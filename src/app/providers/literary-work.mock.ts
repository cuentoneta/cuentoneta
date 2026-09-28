// Core
import type { EnvironmentProviders } from '@angular/core';
import { makeEnvironmentProviders } from '@angular/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

// Models
import {
	createLiteraryWorkNavigationTeaser,
	type LiteraryWork,
	type LiteraryWorkNavigationTeaserWithAuthors,
	type LiteraryWorkTeaser,
} from '@models/literary-work.model';
import { LiteraryWorkApi, type LiteraryWorkTeaserFilter } from './literary-work.provider';

// La vista de navegación es el teaser sin el extracto: el doble la proyecta desde lo que ya recibe por
// constructor, así que no necesita una segunda lista cableada en cada spec. La factory hace cumplir
// sus invariantes, igual que el provider real al rehidratar el DTO. La exporta además la story del
// catálogo, que arma sus escenarios sobre teasers.
export function toNavigationTeaser(teaser: LiteraryWorkTeaser): LiteraryWorkNavigationTeaserWithAuthors {
	return createLiteraryWorkNavigationTeaser({
		_id: teaser._id,
		slug: teaser.slug,
		title: teaser.title,
		coverImage: teaser.coverImage,
		totalReadingTime: teaser.totalReadingTime,
		sectionCount: teaser.sectionCount,
		tags: teaser.tags,
		mediaSources: teaser.mediaSources,
		authors: teaser.authors,
	});
}

export class StubLiteraryWorkApi implements LiteraryWorkApi {
	constructor(
		private readonly literaryWork: LiteraryWork,
		private readonly teasers: readonly LiteraryWorkTeaser[] = [],
	) {}

	public getBySlug(): Observable<LiteraryWork> {
		return of(this.literaryWork);
	}

	public getCatalog(): Observable<LiteraryWorkNavigationTeaserWithAuthors[]> {
		return of(this.teasers.map(toNavigationTeaser));
	}

	public getTeasers(filter: LiteraryWorkTeaserFilter): Observable<LiteraryWorkTeaser[]> {
		return of(this.teasers.filter(({ authors }) => authors.some((author) => author.slug === filter.author)));
	}
}

export function provideLiteraryWorkApiMock(api: LiteraryWorkApi): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LiteraryWorkApi, useValue: api }]);
}
