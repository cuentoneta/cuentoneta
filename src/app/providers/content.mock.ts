// Core
import type { EnvironmentProviders } from '@angular/core';
import { makeEnvironmentProviders } from '@angular/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

// Models
import type { LandingPageContent } from '@models/landing-page-content.model';
import { ContentApi } from './content.provider';

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
