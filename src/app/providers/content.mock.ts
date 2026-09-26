// Core
import type { EnvironmentProviders } from '@angular/core';
import { makeEnvironmentProviders } from '@angular/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

// Models
import type { LandingPageContent } from '@models/landing-page-content.model';
import { ContentApi } from './content.provider';

// Entrega la landing vacía: cada caso superpone solo las secciones que ejercita, y así lo que no
// declara queda demostrablemente en cero.
export class StubContentApi implements ContentApi {
	public getLandingPageContent(): Observable<LandingPageContent> {
		const landingPageContent: LandingPageContent = {
			_id: '',
			config: '',
			collections: [],
			campaigns: [],
			mostRead: [],
			latestReads: [],
			highlightedAuthors: [],
		};
		return of(landingPageContent);
	}
}

export function provideContentApiMock(api: ContentApi = new StubContentApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: ContentApi, useValue: api }]);
}
