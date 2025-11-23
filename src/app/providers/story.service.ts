// Core
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

// Models
import { Story, StoryNavigationTeaser, StoryTeaser, StoryTeaserWithAuthor } from '@models/story.model';

// tRPC
import { getTRPCClient } from './trpc';

@Injectable({ providedIn: 'root' })
export class StoryService {
	private trpc = getTRPCClient();

	public getBySlug(slug: string): Observable<Story> {
		return from(this.trpc.story.getBySlug.query({ slug }));
	}

	public getByAuthorSlug(slug: string, offset: number = 0, limit: number = 100): Observable<StoryTeaser[]> {
		return from(this.trpc.story.getByAuthorSlug.query({ slug, offset, limit }));
	}

	public getNavigationTeasersByAuthorSlug(
		slug: string,
		offset: number = 0,
		limit: number = 100,
	): Observable<StoryNavigationTeaser[]> {
		return from(this.trpc.story.getNavigationByAuthorSlug.query({ slug, offset, limit }));
	}

	public get(offset: number = 0, limit: number = 100): Observable<StoryTeaserWithAuthor[]> {
		return from(this.trpc.story.getAll.query({ offset, limit }));
	}
}
