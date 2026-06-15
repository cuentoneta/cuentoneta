// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import { Storylist, StorylistStoriesNavigationTeasers } from '@models/storylist.model';
import { storylistMock, storylistNavigationTeaserMock } from '@mocks/storylist.mock';
import { StorylistApi } from './storylist.interface';

// Doble de test en memoria (nunca `Mock*`). Cablear en specs con provideStorylistMock().
export class InMemoryStorylistApi implements StorylistApi {
	public get(_slug: string, _amount?: number, _ordering?: 'asc' | 'desc'): Observable<Storylist> {
		return of(storylistMock);
	}

	public getStorylistNavigationTeasers(
		_slug: string,
		_limit?: number,
		_offset?: number,
	): Observable<StorylistStoriesNavigationTeasers> {
		return of(storylistNavigationTeaserMock);
	}
}

export function provideStorylistMock(api: StorylistApi = new InMemoryStorylistApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: StorylistApi, useValue: api }]);
}
