// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import { LandingPageContent } from '@models/landing-page-content.model';
import { ContentApi } from './content-api.interface';

export class StubContentApi implements ContentApi {
	public getLandingPageContent(): Observable<LandingPageContent> {
		const landingPageContent: LandingPageContent = {
			_id: '',
			config: '',
			cards: [],
			campaigns: [],
			mostRead: [],
			latestReads: [],
		};
		return of(landingPageContent);
	}
}

export function provideContentApiMock(api: ContentApi = new StubContentApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: ContentApi, useValue: api }]);
}
