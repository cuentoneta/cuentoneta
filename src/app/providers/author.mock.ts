// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import { AuthorProfile, AuthorTeaser } from '@models/author.model';
import { authorMock, authorTeaserMock } from '@mocks/author.mock';
import { AuthorApi } from './author.provider';

export class StubAuthorApi implements AuthorApi {
	constructor(private readonly author: AuthorProfile = authorMock) {}

	public getAll(): Observable<AuthorTeaser[]> {
		return of([authorTeaserMock]);
	}

	public getBySlug(): Observable<AuthorProfile> {
		return of(this.author);
	}
}

export function provideAuthorApiMock(api: AuthorApi = new StubAuthorApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: AuthorApi, useValue: api }]);
}
