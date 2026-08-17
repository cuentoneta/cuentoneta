// Core
import { inject, InjectionToken, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Models
import { AuthorProfile, AuthorTeaser } from '@models/author.model';
import { ApiUrl, Endpoints } from './endpoints';

export interface AuthorApi {
	getAll(): Observable<AuthorTeaser[]>;
	getBySlug(slug: string): Observable<AuthorProfile>;
}

@Service()
export class HttpAuthorApi implements AuthorApi {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.Author}`;
	private readonly http = inject(HttpClient);

	public getAll(): Observable<AuthorTeaser[]> {
		return this.http.get<AuthorTeaser[]>(this.url);
	}

	public getBySlug(slug: string): Observable<AuthorProfile> {
		return this.http.get<AuthorProfile>(`${this.url}/${slug}`);
	}
}

export const AuthorApi = new InjectionToken<AuthorApi>('AuthorApi', {
	providedIn: 'root',
	factory: () => inject(HttpAuthorApi),
});
