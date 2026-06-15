import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Author, AuthorTeaser } from '@models/author.model';

// Interfaz (nombre limpio) + token. La implementación HTTP vive en author.provider.ts; el doble de
// test InMemoryAuthorApi, en author.mock.ts. El token no lleva `providedIn`/`factory`: se cablea vía provideAuthor().
export interface AuthorApi {
	getAll(): Observable<AuthorTeaser[]>;
	getBySlug(slug: string): Observable<Author>;
}

export const AuthorApi = new InjectionToken<AuthorApi>('AuthorApi');
