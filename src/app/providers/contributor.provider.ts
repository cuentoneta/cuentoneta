// Core
import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Models
import { Contributor, ContributorArea, SORTED_AREAS } from '@models/contributor.model';
import { ApiUrl, Endpoints } from './endpoints';
import { ContributorApi } from './contributor-api.interface';

@Injectable({ providedIn: 'root' })
export class HttpContributorApi implements ContributorApi {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.Contributor}`;
	private http = inject(HttpClient);

	public getAll(): Observable<Contributor[]> {
		return this.http.get<Contributor[]>(this.url);
	}

	public getAllByArea(): Observable<{ area: ContributorArea; contributors: Contributor[] }[]> {
		return this.getAll().pipe(
			map((contributors) =>
				contributors.reduce((accum, value) => {
					const area = accum.find((a) => a.area.slug === value.area.slug);

					if (area) {
						area.contributors.push(value);
					}
					return accum;
				}, SORTED_AREAS),
			),
		);
	}
}

export function provideContributorApi(): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: ContributorApi, useExisting: HttpContributorApi }]);
}
