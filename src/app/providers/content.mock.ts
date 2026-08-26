// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import { LandingPageContent } from '@models/landing-page-content.model';
import { contentCampaignMock } from '@mocks/content-campaign.mock';
import { onoffCollectionTeasersMock } from '@mocks/onoff-collections.mock';
import { onoffLiteraryWorkNavigationTeasersWithAuthorsMock } from '@mocks/onoff-literary-work-teasers.mock';
import { ContentApi } from './content.provider';

// Los slots se pueblan desde el canon y no con listas vacías: un doble que devuelve nada hace que toda
// story y todo spec que lo use rendericen el estado de carga y no afirmen nada. Los destacados se
// reparten entre los dos slots para que un cruce entre ellos sea observable.
export class StubContentApi implements ContentApi {
	public getLandingPageContent(): Observable<LandingPageContent> {
		const half = Math.ceil(onoffLiteraryWorkNavigationTeasersWithAuthorsMock.length / 2);
		const landingPageContent: LandingPageContent = {
			_id: 'landing-page-stub',
			config: '1974-24',
			cards: [],
			collections: onoffCollectionTeasersMock,
			campaigns: contentCampaignMock,
			mostRead: [],
			mostReadLiteraryWorks: onoffLiteraryWorkNavigationTeasersWithAuthorsMock.slice(0, half),
			latestReads: [],
			latestLiteraryWorks: onoffLiteraryWorkNavigationTeasersWithAuthorsMock.slice(half),
			highlightedAuthors: [],
		};
		return of(landingPageContent);
	}
}

export function provideContentApiMock(api: ContentApi = new StubContentApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: ContentApi, useValue: api }]);
}
