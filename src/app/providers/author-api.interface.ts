import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Author, AuthorTeaser } from '@models/author.model';

export interface AuthorApi {
	getAll(): Observable<AuthorTeaser[]>;
	getBySlug(slug: string): Observable<Author>;
}

export const AuthorApi = new InjectionToken<AuthorApi>('AuthorApi');
