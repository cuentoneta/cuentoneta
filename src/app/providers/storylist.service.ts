import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Storylist, StorylistNavigationTeaser } from '@models/storylist.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { ApiUrl, Endpoints } from './endpoints';

@Injectable({
	providedIn: 'root',
})
export class StorylistService {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.StoryList}`;

	// Providers
	private http = inject(HttpClient);

	public get(slug: string, amount: number = 5, ordering: 'asc' | 'desc' = 'asc'): Observable<Storylist> {
		const params = new HttpParams().set('slug', slug).set('amount', amount).set('ordering', ordering);
		return this.http.get<Storylist>(this.url, { params });
	}

	public getStorylistNavigationTeasers(
		slug: string,
		limit: number = 100,
		offset: number = 0,
	): Observable<StorylistNavigationTeaser> {
		const params = new HttpParams().set('limit', limit).set('offset', offset);
		return this.http.get<StorylistNavigationTeaser>(`${this.url}/${slug}/navigation`, { params });
	}
}
