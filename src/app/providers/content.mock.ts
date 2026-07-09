// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import { LandingPageContent } from '@models/landing-page-content.model';
import { ContentApi } from './content-api.interface';

export class InMemoryContentApi implements ContentApi {
	public getLandingPageContent(): Observable<LandingPageContent> {
		const landingPageContent: LandingPageContent = {
			_id: '',
			config: '',
			cards: [],
			campaigns: [],
			mostRead: [],
			latestReads: [],
			highlightedAuthors: [],
		};
		return of(landingPageContent);
	}
}

export function provideContentApiMock(api: ContentApi = new InMemoryContentApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: ContentApi, useValue: api }]);
}
