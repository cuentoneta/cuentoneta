import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Contributor, ContributorArea } from '@models/contributor.model';

// Interfaz (nombre limpio) + token. La implementación HTTP vive en contributor.provider.ts; el doble de
// test InMemoryContributorApi, en contributor.mock.ts. El token no lleva `providedIn`/`factory`: se cablea vía provideContributorApi().
export interface ContributorApi {
	getAll(): Observable<Contributor[]>;
	getAllByArea(): Observable<{ area: ContributorArea; contributors: Contributor[] }[]>;
}

export const ContributorApi = new InjectionToken<ContributorApi>('ContributorApi');
