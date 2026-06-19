import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthorProfile, AuthorTeaser } from '@models/author.model';

export interface AuthorApi {
	getAll(): Observable<AuthorTeaser[]>;
	getBySlug(slug: string): Observable<AuthorProfile>;
}

export const AuthorApi = new InjectionToken<AuthorApi>('AuthorApi');
