// Core
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

// Environment
import { environment } from '../environments/environment';

// Models
import { Story, StoryTeaser } from '@models/story.model';
import { ApiUrl, Endpoints } from './endpoints';

@Injectable({ providedIn: 'root' })
export class StoryService {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.Story}`;
	private http = inject(HttpClient);

	public getBySlug(slug: string): Observable<Story> {
		const params = new HttpParams().set('slug', slug);
		return this.http.get<Story>(`${this.url}/read`, { params });
	}

	public getByAuthorSlug(slug: string, offset: number = 0, limit: number = 20): Observable<StoryTeaser[]> {
		const params = new HttpParams().set('offset', offset).append('limit', limit);
		return this.http.get<StoryTeaser[]>(`${this.url}/author/${slug}`, { params });
	}
}
