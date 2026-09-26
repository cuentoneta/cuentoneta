// Core
import type { EnvironmentProviders } from '@angular/core';
import { makeEnvironmentProviders } from '@angular/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

// Models
import type { Contributor, ContributorArea } from '@models/contributor.model';
import { ContributorApi } from './contributor.provider';

export class StubContributorApi implements ContributorApi {
	public getAll(): Observable<Contributor[]> {
		return of([]);
	}

	public getAllByArea(): Observable<{ area: ContributorArea; contributors: Contributor[] }[]> {
		return of([]);
	}
}

export function provideContributorApiMock(api: ContributorApi = new StubContributorApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: ContributorApi, useValue: api }]);
}
