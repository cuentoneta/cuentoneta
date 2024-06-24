// Core
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

// Environment
import { environment } from '../environments/environment';

// Models
import { Story, StoryPreview } from '@models/story.model';
import { ApiUrl, Endpoints } from './endpoints';

@Injectable({ providedIn: 'root' })
export class StoryService {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.Story}`;
	private http = inject(HttpClient);

	public getBySlug(slug: string): Observable<Story> {
		const params = new HttpParams().set('slug', slug);

		return this.http.get<Story>(`${this.url}/read`, { params }).pipe(map((story) => this.parseStoryContent(story)));
	}

	public getByAuthorSlug(slug: string, offset: number = 0, limit: number = 20): Observable<StoryPreview[]> {
		const params = new HttpParams().set('offset', offset).append('limit', limit);
		return this.http
			.get<StoryPreview[]>(`${this.url}/author/${slug}`, { params })
			.pipe(map((stories) => stories.map((story) => this.parseStoryCardContent(story))));
	}

	public parseStoryCardContent(story: StoryPreview): StoryPreview {
		const card = {
			...story,
			paragraphs: story?.paragraphs ?? [],
			media: story.media ?? [],
			originalPublication: story.originalPublication ?? '',
		};

		if (story.author) {
			card.author = {
				...story.author,
			};
		}
		return card;
	}

	private parseStoryContent(story: Story): Story {
		return {
			...story,
			epigraphs: story.epigraphs ?? [],
			paragraphs: story?.paragraphs ?? [],
			summary: story?.summary ?? [],
			author: {
				...story.author,
				biography: story.author.biography ?? [],
			},
			media: story.media ?? [],
		};
	}
}
