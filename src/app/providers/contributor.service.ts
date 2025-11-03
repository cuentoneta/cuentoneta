import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import { ApiUrl, Endpoints } from './endpoints';
import { Contributor } from '@models/contributor.model';

@Injectable({
	providedIn: 'root',
})
export class ContributorService {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.Contributor}`;
	private http = inject(HttpClient);

	public getAll(): Observable<Contributor[]> {
		return this.http.get<Contributor[]>(this.url);
	}
}
