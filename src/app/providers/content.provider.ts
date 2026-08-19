// Core
import { inject, InjectionToken, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Models
import type { LandingPageContent } from '@models/landing-page-content.model';

export interface ContentApi {
	getLandingPageContent(): Observable<LandingPageContent>;
}

@Service()
export class HttpContentApi implements ContentApi {
	private readonly prefix = `${environment.apiUrl}api/content`;
	private readonly http = inject(HttpClient);

	public getLandingPageContent(): Observable<LandingPageContent> {
		return this.http.get<LandingPageContent>(`${this.prefix}/landing-page`);
	}
}

export const ContentApi = new InjectionToken<ContentApi>('ContentApi', {
	providedIn: 'root',
	factory: () => inject(HttpContentApi),
});
