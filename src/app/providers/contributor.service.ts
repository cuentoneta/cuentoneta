import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';

import { Contributor, ContributorArea, SORTED_AREAS } from '@models/contributor.model';

// tRPC
import { getTRPCClient } from './trpc';

@Injectable({
	providedIn: 'root',
})
export class ContributorService {
	private trpc = getTRPCClient();

	public getAll(): Observable<Contributor[]> {
		return from(this.trpc.contributor.getAll.query());
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
