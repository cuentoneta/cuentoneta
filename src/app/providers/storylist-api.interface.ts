import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Storylist, StorylistStoriesNavigationTeasers } from '@models/storylist.model';

export interface StorylistApi {
	get(slug: string, amount?: number, ordering?: 'asc' | 'desc'): Observable<Storylist>;
	getStorylistNavigationTeasers(
		slug: string,
		limit?: number,
		offset?: number,
	): Observable<StorylistStoriesNavigationTeasers>;
}

export const StorylistApi = new InjectionToken<StorylistApi>('StorylistApi');
