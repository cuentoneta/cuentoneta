// Core
import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Models
import { Storylist, StorylistStoriesNavigationTeasers } from '@models/storylist.model';
import { ApiUrl, Endpoints } from './endpoints';
import { StorylistApi } from './storylist.interface';

@Injectable({ providedIn: 'root' })
export class HttpStorylistApi implements StorylistApi {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.StoryList}`;
	private http = inject(HttpClient);

	public get(slug: string, amount: number = 5, ordering: 'asc' | 'desc' = 'asc'): Observable<Storylist> {
		const params = new HttpParams().set('amount', amount).set('ordering', ordering);
		return this.http.get<Storylist>(`${this.url}/${slug}`, { params });
	}

	public getStorylistNavigationTeasers(
		slug: string,
		limit: number = 100,
		offset: number = 0,
	): Observable<StorylistStoriesNavigationTeasers> {
		const params = new HttpParams().set('limit', limit).set('offset', offset);
		return this.http.get<StorylistStoriesNavigationTeasers>(`${this.url}/${slug}/navigation`, { params });
	}
}

export function provideStorylistApi(): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: StorylistApi, useExisting: HttpStorylistApi }]);
}
