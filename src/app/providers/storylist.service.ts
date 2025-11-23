import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Storylist, StorylistPublicationsNavigationTeasers } from '@models/storylist.model';

// tRPC
import { getTRPCClient } from './trpc';

@Injectable({
	providedIn: 'root',
})
export class StorylistService {
	private trpc = getTRPCClient();

	public get(slug: string, offset: number = 0, ordering: 'asc' | 'desc' = 'asc'): Observable<Storylist> {
		return from(this.trpc.storylist.getBySlug.query({ slug, offset, ordering, limit: 10 }));
	}

	public getStorylistNavigationTeasers(
		slug: string,
		limit: number = 100,
		offset: number = 0,
	): Observable<StorylistPublicationsNavigationTeasers> {
		return from(this.trpc.storylist.getNavigation.query({ slug, limit, offset }));
	}
}
