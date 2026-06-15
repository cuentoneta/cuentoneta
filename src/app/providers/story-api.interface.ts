import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Story, StoryNavigationTeaser, StoryTeaser, StoryTeaserWithAuthor } from '@models/story.model';

export interface StoryApi {
	getBySlug(slug: string): Observable<Story>;
	getByAuthorSlug(slug: string, offset?: number, limit?: number): Observable<StoryTeaser[]>;
	getNavigationTeasersByAuthorSlug(slug: string, offset?: number, limit?: number): Observable<StoryNavigationTeaser[]>;
	get(offset?: number, limit?: number): Observable<StoryTeaserWithAuthor[]>;
}

export const StoryApi = new InjectionToken<StoryApi>('StoryApi');
