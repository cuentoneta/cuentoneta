// Core
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Interfaces
import { Author, AuthorTeaser } from '@models/author.model';
import { ApiUrl, Endpoints } from './endpoints';

@Injectable({
	providedIn: 'root',
})
export class AuthorService {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.Author}`;
	private http = inject(HttpClient);

	public getAll(): Observable<AuthorTeaser[]> {
		return this.http.get<AuthorTeaser[]>(this.url);
	}

	public getBySlug(slug: string): Observable<Author> {
		return this.http.get<Author>(`${this.url}/${slug}`);
	}
}
