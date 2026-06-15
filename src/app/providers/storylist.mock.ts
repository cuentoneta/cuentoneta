// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import { Storylist, StorylistStoriesNavigationTeasers } from '@models/storylist.model';
import { storylistMock, storylistNavigationTeaserMock } from '@mocks/storylist.mock';
import { StorylistApi } from './storylist-api.interface';

export class InMemoryStorylistApi implements StorylistApi {
	public get(): Observable<Storylist> {
		return of(storylistMock);
	}

	public getStorylistNavigationTeasers(): Observable<StorylistStoriesNavigationTeasers> {
		return of(storylistNavigationTeaserMock);
	}
}

export function provideStorylistApiMock(api: StorylistApi = new InMemoryStorylistApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: StorylistApi, useValue: api }]);
}
