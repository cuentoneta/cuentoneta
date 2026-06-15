// Core
import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Models
import { LandingPageContent } from '@models/landing-page-content.model';
import { ContentApi } from './content-api.interface';

@Injectable({ providedIn: 'root' })
export class HttpContentApi implements ContentApi {
	private readonly prefix = `${environment.apiUrl}api/content`;
	private http = inject(HttpClient);

	public getLandingPageContent(): Observable<LandingPageContent> {
		return this.http.get<LandingPageContent>(`${this.prefix}/landing-page`);
	}
}

export function provideContentApi(): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: ContentApi, useExisting: HttpContentApi }]);
}
