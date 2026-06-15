// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import { Contributor, ContributorArea } from '@models/contributor.model';
import { ContributorApi } from './contributor.interface';

// Doble de test en memoria (nunca `Mock*`). Cablear en specs con provideContributorApiMock().
export class InMemoryContributorApi implements ContributorApi {
	public getAll(): Observable<Contributor[]> {
		return of([]);
	}

	public getAllByArea(): Observable<{ area: ContributorArea; contributors: Contributor[] }[]> {
		return of([]);
	}
}

export function provideContributorApiMock(api: ContributorApi = new InMemoryContributorApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: ContributorApi, useValue: api }]);
}
