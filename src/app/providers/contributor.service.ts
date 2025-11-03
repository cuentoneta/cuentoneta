import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../environments/environment';
import { ApiUrl, Endpoints } from './endpoints';
import { Contributor, ContributorArea, SORTED_AREAS } from '@models/contributor.model';

@Injectable({
	providedIn: 'root',
})
export class ContributorService {
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
