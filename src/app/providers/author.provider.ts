// Core
import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Models
import { Author, AuthorTeaser } from '@models/author.model';
import { ApiUrl, Endpoints } from './endpoints';
import { AuthorApi } from './author.interface';

@Injectable({ providedIn: 'root' })
export class HttpAuthorApi implements AuthorApi {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.Author}`;
	private http = inject(HttpClient);

	public getAll(): Observable<AuthorTeaser[]> {
		return this.http.get<AuthorTeaser[]>(this.url);
	}

	public getBySlug(slug: string): Observable<Author> {
		return this.http.get<Author>(`${this.url}/${slug}`);
	}
}

export function provideAuthorApi(): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: AuthorApi, useExisting: HttpAuthorApi }]);
}
