// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import { Story, StoryTeaserWithAuthor } from '@models/story.model';
import { storyMock, storyTeaserWithAuthorMock } from '@mocks/story.mock';
import { StoryApi } from './story.provider';

export class StubStoryApi implements StoryApi {
	public getBySlug(): Observable<Story> {
		return of(storyMock);
	}

	public get(): Observable<StoryTeaserWithAuthor[]> {
		return of([storyTeaserWithAuthorMock]);
	}
}

export function provideStoryApiMock(api: StoryApi = new StubStoryApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: StoryApi, useValue: api }]);
}
