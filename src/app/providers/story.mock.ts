// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import { Story, StoryNavigationTeaser, StoryTeaser, StoryTeaserWithAuthor } from '@models/story.model';
import { storyMock, storyNavigationTeaserMock, storyTeaserMock, storyTeaserWithAuthorMock } from '@mocks/story.mock';
import { StoryApi } from './story-api.interface';

export class InMemoryStoryApi implements StoryApi {
	public getBySlug(_slug: string): Observable<Story> {
		return of(storyMock);
	}

	public getByAuthorSlug(_slug: string, _offset?: number, _limit?: number): Observable<StoryTeaser[]> {
		return of([storyTeaserMock]);
	}

	public getNavigationTeasersByAuthorSlug(
		_slug: string,
		_offset?: number,
		_limit?: number,
	): Observable<StoryNavigationTeaser[]> {
		return of([storyNavigationTeaserMock]);
	}

	public get(_offset?: number, _limit?: number): Observable<StoryTeaserWithAuthor[]> {
		return of([storyTeaserWithAuthorMock]);
	}
}

export function provideStoryApiMock(api: StoryApi = new InMemoryStoryApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: StoryApi, useValue: api }]);
}
