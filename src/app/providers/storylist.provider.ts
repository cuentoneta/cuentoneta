// Core
import { EnvironmentProviders, inject, makeEnvironmentProviders, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Models
import { Storylist } from '@models/storylist.model';
import { ApiUrl, Endpoints } from './endpoints';
import { StorylistApi } from './storylist-api.interface';

@Service()
export class HttpStorylistApi implements StorylistApi {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.StoryList}`;
	private readonly http = inject(HttpClient);

	public get(slug: string, amount: number = 5, ordering: 'asc' | 'desc' = 'asc'): Observable<Storylist> {
		const params = new HttpParams().set('amount', amount).set('ordering', ordering);
		return this.http.get<Storylist>(`${this.url}/${slug}`, { params });
	}
}

export function provideStorylistApi(): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: StorylistApi, useExisting: HttpStorylistApi }]);
}
