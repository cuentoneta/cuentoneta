import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Story, StoryNavigationTeaser, StoryTeaser, StoryTeaserWithAuthor } from '@models/story.model';

// Interfaz (nombre limpio) + token. La implementación HTTP vive en story.provider.ts; el doble de
// test InMemoryStoryApi, en story.mock.ts. El token no lleva `providedIn`/`factory`: se cablea vía provideStory().
export interface StoryApi {
	getBySlug(slug: string): Observable<Story>;
	getByAuthorSlug(slug: string, offset?: number, limit?: number): Observable<StoryTeaser[]>;
	getNavigationTeasersByAuthorSlug(slug: string, offset?: number, limit?: number): Observable<StoryNavigationTeaser[]>;
	get(offset?: number, limit?: number): Observable<StoryTeaserWithAuthor[]>;
}

export const StoryApi = new InjectionToken<StoryApi>('StoryApi');
