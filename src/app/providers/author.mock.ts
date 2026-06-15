// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import { Author, AuthorTeaser } from '@models/author.model';
import { authorMock, authorTeaserMock } from '@mocks/author.mock';
import { AuthorApi } from './author-api.interface';

export class InMemoryAuthorApi implements AuthorApi {
	public getAll(): Observable<AuthorTeaser[]> {
		return of([authorTeaserMock]);
	}

	public getBySlug(): Observable<Author> {
		return of(authorMock);
	}
}

export function provideAuthorApiMock(api: AuthorApi = new InMemoryAuthorApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: AuthorApi, useValue: api }]);
}
