// Core
import { inject, InjectionToken, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, type Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Models
import { SORTED_AREAS, type Contributor, type ContributorArea } from '@models/contributor.model';
import { Endpoints, type ApiUrl } from './endpoints';

export interface ContributorApi {
	getAll(): Observable<Contributor[]>;
	getAllByArea(): Observable<{ area: ContributorArea; contributors: Contributor[] }[]>;
}

@Service()
export class HttpContributorApi implements ContributorApi {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.Contributor}`;
	private readonly http = inject(HttpClient);

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

export const ContributorApi = new InjectionToken<ContributorApi>('ContributorApi', {
	providedIn: 'root',
	factory: () => inject(HttpContributorApi),
});
