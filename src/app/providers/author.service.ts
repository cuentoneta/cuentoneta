// Core
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Interfaces
import { Author } from '@models/author.model';

@Injectable({
	providedIn: 'root',
})
export class AuthorService {
	private readonly prefix = `${environment.apiUrl}api/author`;
	private http = inject(HttpClient);

	public getBySlug(slug: string): Observable<Author> {
		return this.http.get<Author>(`${this.prefix}/${slug}`);
		// .pipe(map((story) => this.parseStoryContent(story)));
	}
}
