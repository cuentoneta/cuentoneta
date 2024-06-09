// Core
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

// Environment
import { environment } from '../environments/environment';

// Models
import { Story, StoryCard, StoryDTO } from '@models/story.model';
import { ApiUrl, Endpoints } from './endpoints';

@Injectable({ providedIn: 'root' })
export class StoryService {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.Story}`;
	constructor(private http: HttpClient) {}
	public getBySlug(slug: string): Observable<Story> {
		const params = new HttpParams().set('slug', slug);

		return this.http.get<StoryDTO>(this.url, { params }).pipe(map((story) => this.parseStoryContent(story)));
	}

	public getByAuthorSlug(slug: string, offset: number = 0, limit: number = 20): Observable<StoryCard[]> {
		const params = new HttpParams().set('offset', offset).append('limit', limit);
		return this.http
			.get<StoryDTO[]>(`${this.url}/author/${slug}`, { params })
			.pipe(map((stories) => stories.map((story) => this.parseStoryCardContent(story))));
	}

	public parseStoryCardContent(story: StoryDTO): StoryCard {
		const card = {
			...story,
			paragraphs: story?.paragraphs ?? [],
			media: story.media ?? [],
			originalPublication: story.originalPublication ?? [],
		};

		if (story.author) {
			card.author = {
				...story.author,
				imageUrl: this.parseAvatarImageUrl(story.author.imageUrl),
			};
		}
		return card;
	}

	private parseStoryContent(story: StoryDTO): Story {
		return {
			...story,
			epigraphs: story.epigraphs ?? [],
			paragraphs: story?.paragraphs ?? [],
			summary: story?.summary ?? [],
			author: {
				...story.author,
				imageUrl: this.parseAvatarImageUrl(story.author.imageUrl),
				biography: story.author.biography ?? [],
			},
			media: story.media ?? [],
		};
	}

	private parseAvatarImageUrl(imageUrl: string | undefined): string {
		return imageUrl ?? 'assets/img/default-avatar.jpg';
	}
}
