import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Publication, Storylist, StorylistDTO } from '@models/storylist.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { StoryCard } from '@models/story.model';
import { environment } from '../environments/environment';
import { StoryService } from './story.service';
import { DatePipe } from '@angular/common';

@Injectable({
	providedIn: 'root',
})
export class StorylistService {
	private readonly prefix = `${environment.apiUrl}api/storylist`;

	// Providers
	private datePipe = inject(DatePipe);
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
				comingNextLabel: this.mapComingNextLabel(publication, storylist),
				story: this.storyService.parseStoryCardContent(publication.story),
			})) as Publication<StoryCard>[],
		};
	}

	private mapEditionLabel(publication: Publication<StoryCard>, storylist: Storylist): string {
		let result = `${storylist.editionPrefix} ${publication.publishingOrder}`;

		if (storylist.displayDates) {
			const formattedDate = this.datePipe.transform(publication.publishingDate, `dd 'de' MMMM, YYYY`);
			result = result.concat(` - ${formattedDate}`);
		}

		return result;
	}

	private mapComingNextLabel(publication: Publication<StoryCard>, storylist: Storylist): string {
		let result = `${storylist.comingNextLabel}`;

		if (storylist.displayDates) {
			const formattedDate = this.datePipe.transform(publication.publishingDate, `dd 'de' MMMM, YYYY`);
			result = result.concat(` - ${formattedDate}`);
		}

		return result;
	}
}
