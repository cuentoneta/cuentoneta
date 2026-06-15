import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Contributor, ContributorArea } from '@models/contributor.model';

export interface ContributorApi {
	getAll(): Observable<Contributor[]>;
	getAllByArea(): Observable<{ area: ContributorArea; contributors: Contributor[] }[]>;
}

export const ContributorApi = new InjectionToken<ContributorApi>('ContributorApi');
