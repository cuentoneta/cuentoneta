import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Publication, Storylist, StorylistDTO } from '@models/storylist.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { StoryCard } from '@models/story.model';
import { environment } from '../environments/environment';
import { StoryService } from './story.service';

@Injectable({
	providedIn: 'root',
})
export class StorylistService {
	private readonly prefix = `${environment.apiUrl}api/storylist`;
	private http = inject(HttpClient);
	private storyService = inject(StoryService);

	public get(slug: string, amount: number = 5, ordering: 'asc' | 'desc' = 'asc'): Observable<Storylist> {
		const params = new HttpParams().set('slug', slug).set('amount', amount).set('ordering', ordering);
		return this.http
			.get<StorylistDTO>(`${this.prefix}`, { params })
			.pipe(map((storylist) => this.mapStorylist(storylist)));
	}

	public mapStorylist(storylist: StorylistDTO): Storylist {
		return {
			...storylist,
			publications: (storylist?.publications ?? []).map((publication) => ({
				...publication,
				editionLabel: this.mapEditionLabel(publication, storylist),
				story: this.storyService.parseStoryCardContent(publication.story),
			})) as Publication<StoryCard>[],
		};
	}

	private mapEditionLabel(publication: Publication<StoryCard>, storylist: Storylist): string {
		if (!storylist) {
			return '';
		}

		let result = `${storylist.editionPrefix} ${publication.publishingOrder}`;

		if (storylist.displayDates) {
			result = result.concat(` - ${publication.publishingDate}`);
		}

		return result;
	}
}
