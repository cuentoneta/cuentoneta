import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Publication, Storylist } from '@models/storylist.model';
import { Story } from '@models/story.model';
import { APP_ROUTE_TREE } from '../../app.routes';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, CommonModule } from '@angular/common';

@Component({
	selector: 'cuentoneta-story-navigation-bar',
	templateUrl: './story-navigation-bar.component.html',
	standalone: true,
	imports: [CommonModule, NgxSkeletonLoaderModule, NgIf, NgFor, RouterLink, StoryEditionDateLabelComponent],
})
export class StoryNavigationBarComponent implements OnChanges {
	@Input() displayedPublications: Publication<Story>[] = [];
	@Input() selectedStorySlug: string = '';
	@Input() storylist: Storylist | undefined;

	readonly appRouteTree = APP_ROUTE_TREE;
	dummyList: null[] = Array(10);

	ngOnChanges(changes: SimpleChanges) {
		const storylist: Storylist = changes['storylist'].currentValue;
		if (!!storylist) {
			this.sliceDisplayedPublications(storylist.publications);
		}
	}

	/**
	 * Este método se encarga de mostrar la lista de publicaciones de la navbar en base a la story actualmente en vista.
	 * Si la storylist tiene más de 10 publicaciones, se muestran las 10 publicaciones más cercanas a la story actualmente
	 * en vista tomando las 5 publicaciones anteriores y las 5 siguientes en el caso por defecto y ajustando los límites en
	 * caso de que la story actualmente en vista sea una de las primeras o de las últimas.
	 * @author Ramiro Olivencia <ramiro@olivencia.com.ar>
	 */
	sliceDisplayedPublications(publications: Publication<Story>[]): void {
		if (!this.storylist) {
			return;
		}

		const numberOfDisplayedPublications = 10;

		if (publications.length <= numberOfDisplayedPublications) {
			this.displayedPublications = publications;
			return;
		}

		const selectedStoryIndex = publications.findIndex(
			(publication) => publication.story.slug === this.selectedStorySlug,
		);

		const lowerIndex =
			selectedStoryIndex - numberOfDisplayedPublications / 2 < 0
				? 0
				: selectedStoryIndex - numberOfDisplayedPublications / 2;
		const upperIndex =
			selectedStoryIndex + numberOfDisplayedPublications / 2 > publications.length
				? publications.length
				: selectedStoryIndex + numberOfDisplayedPublications / 2;

		this.displayedPublications = this.storylist.publications.slice(
			upperIndex === publications.length ? publications.length - numberOfDisplayedPublications : lowerIndex,
			lowerIndex === 0 ? numberOfDisplayedPublications : upperIndex,
		);
	}

	// ToDo: Separar card de cada cuento de la lista en su propio componente, para evitar usar un método en el template
	getEditionLabel(publication: Publication<Story>, editionIndex: number = 0): string {
		if (!this.storylist) {
			return '';
		}

		return `${this.storylist?.editionPrefix} ${editionIndex} ${
			this.storylist?.displayDates ? ' - ' + publication.publishingDate : ''
		}`;
	}
}
