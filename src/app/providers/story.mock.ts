// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import { Story, StoryNavigationTeaser, StoryTeaser, StoryTeaserWithAuthor } from '@models/story.model';
import { storyMock, storyNavigationTeaserMock, storyTeaserMock, storyTeaserWithAuthorMock } from '@mocks/story.mock';
import { StoryApi } from './story-api.interface';

export class StubStoryApi implements StoryApi {
	public getBySlug(): Observable<Story> {
		return of(storyMock);
	}

	public getByAuthorSlug(): Observable<StoryTeaser[]> {
		return of([storyTeaserMock]);
	}

	public getNavigationTeasersByAuthorSlug(): Observable<StoryNavigationTeaser[]> {
		return of([storyNavigationTeaserMock]);
	}

	public get(): Observable<StoryTeaserWithAuthor[]> {
		return of([storyTeaserWithAuthorMock]);
	}
}

export function provideStoryApiMock(api: StoryApi = new StubStoryApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: StoryApi, useValue: api }]);
}
