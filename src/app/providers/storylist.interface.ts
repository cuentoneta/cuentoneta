import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Storylist, StorylistStoriesNavigationTeasers } from '@models/storylist.model';

// Interfaz (nombre limpio) + token. La implementación HTTP vive en storylist.provider.ts; el doble de
// test InMemoryStorylistApi, en storylist.mock.ts. El token no lleva `providedIn`/`factory`: se cablea vía provideStorylist().
export interface StorylistApi {
	get(slug: string, amount?: number, ordering?: 'asc' | 'desc'): Observable<Storylist>;
	getStorylistNavigationTeasers(
		slug: string,
		limit?: number,
		offset?: number,
	): Observable<StorylistStoriesNavigationTeasers>;
}

export const StorylistApi = new InjectionToken<StorylistApi>('StorylistApi');
