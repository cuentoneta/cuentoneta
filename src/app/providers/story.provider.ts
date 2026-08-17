// Core
import { inject, InjectionToken, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Models
import { Story, StoryTeaser, StoryTeaserWithAuthor } from '@models/story.model';
import { ApiUrl, Endpoints } from './endpoints';

export interface StoryApi {
	getBySlug(slug: string): Observable<Story>;
	getByAuthorSlug(slug: string, offset?: number, limit?: number): Observable<StoryTeaser[]>;
	get(offset?: number, limit?: number): Observable<StoryTeaserWithAuthor[]>;
}

@Service()
export class HttpStoryApi implements StoryApi {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.Story}`;
	private readonly http = inject(HttpClient);

	public getBySlug(slug: string): Observable<Story> {
		return this.http.get<Story>(`${this.url}/${slug}`);
	}

	public getByAuthorSlug(slug: string, offset: number = 0, limit: number = 100): Observable<StoryTeaser[]> {
		const params = new HttpParams().set('offset', offset).append('limit', limit);
		return this.http.get<StoryTeaser[]>(`${this.url}/author/${slug}`, { params });
	}

	public get(offset: number = 0, limit: number = 100): Observable<StoryTeaserWithAuthor[]> {
		const params = new HttpParams().set('offset', offset).append('limit', limit);
		return this.http.get<StoryTeaserWithAuthor[]>(this.url, { params });
	}
}

export const StoryApi = new InjectionToken<StoryApi>('StoryApi', {
	providedIn: 'root',
	factory: () => inject(HttpStoryApi),
});
