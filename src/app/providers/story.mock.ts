// Core
import type { EnvironmentProviders } from '@angular/core';
import { makeEnvironmentProviders } from '@angular/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

// Models
import type { Story, StoryTeaser, StoryTeaserWithAuthor } from '@models/story.model';
import { storyMock, storyTeaserMock, storyTeaserWithAuthorMock } from '@mocks/story.mock';
import { StoryApi } from './story.provider';

export class StubStoryApi implements StoryApi {
	public getBySlug(): Observable<Story> {
		return of(storyMock);
	}

	public getByAuthorSlug(): Observable<StoryTeaser[]> {
		return of([storyTeaserMock]);
	}

	public get(): Observable<StoryTeaserWithAuthor[]> {
		return of([storyTeaserWithAuthorMock]);
	}
}

export function provideStoryApiMock(api: StoryApi = new StubStoryApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: StoryApi, useValue: api }]);
}
