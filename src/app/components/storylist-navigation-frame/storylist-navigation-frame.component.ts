import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UrlTree } from '@angular/router';

// Componentes
import { NavigablePublicationTeaserComponent } from '../navigable-publication-teaser/navigable-publication-teaser.component';

// Providers
import { StorylistService } from '../../providers/storylist.service';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
// Models
import { StoryPreview } from '@models/story.model';
import { Publication, Storylist } from '@models/storylist.model';

// Routes
import { AppRoutes } from '../../app.routes';
import { NavigationFrameComponent } from '@models/navigation-frame.component';

export type NavigationBarConfig = {
	headerTitle: string;
	footerTitle: string;
	navigationRoute: UrlTree | string;
	showFooter: boolean;
};

@Component({
	selector: 'cuentoneta-storylist-navigation-frame',
	standalone: true,
	imports: [CommonModule, NavigablePublicationTeaserComponent, NgxSkeletonLoaderModule],
	template: ` @if (!!storylist) {
			@for (publication of displayedPublications; track $index) {
				<cuentoneta-navigable-publication-teaser
					[publication]="publication"
					[selected]="selectedStorySlug() === publication.story.slug"
					[storylist]="storylist"
				/>
			}
		} @else {
			@for (skeleton of dummyList; track $index) {
				<article [attr.aria-busy]="true" class="bg-gray-50 px-7 py-5">
					<ngx-skeleton-loader count="2" appearance="line"></ngx-skeleton-loader>
				</article>
			}
		}`,
	styles: `
		:host {
			@apply grid grid-cols-1 gap-y-0.5 rounded-xl bg-gray-200 shadow-lg;
		}
	`,
})
export class StorylistNavigationFrameComponent extends NavigationFrameComponent {
	readonly appRoutes = AppRoutes;

	displayedPublications: Publication<StoryPreview>[] = [];
	dummyList: null[] = Array(9);
	storylist: Storylist | undefined;

	constructor() {
		super();

		const storylistService = inject(StorylistService);

		this.activatedRoute.queryParams
			.pipe(
				takeUntilDestroyed(),
				switchMap(({ navigationSlug }) =>
					this.fetchContentDirective.fetchContent$<Storylist>(storylistService.get(navigationSlug, 9)),
				),
			)
			.subscribe((storylist) => {
				this.storylist = storylist;
				this.sliceDisplayedPublications(storylist.publications);
				this.config.set({
					headerTitle: storylist.title,
					footerTitle: 'Ver más...',
					navigationRoute: this.router.createUrlTree([this.appRoutes.StoryList, storylist.slug]),
					showFooter: true,
				});
			});
	}

	/**
	 * Este método se encarga de mostrar la lista de publicaciones de la navbar en base a la story actualmente en vista.
	 * Si la storylist tiene más de 10 publicaciones, se muestran las 10 publicaciones más cercanas a la story actualmente
	 * en vista tomando las 5 publicaciones anteriores y las 5 siguientes en el caso por defecto y ajustando los límites en
	 * caso de que la story actualmente en vista sea una de las primeras o de las últimas.
	 * @author Ramiro Olivencia <ramiro@olivencia.com.ar>
	 */
	sliceDisplayedPublications(publications: Publication<StoryPreview>[]): void {
		if (!this.storylist) {
			return;
		}

		const numberOfDisplayedPublications = 9;

		if (publications.length <= numberOfDisplayedPublications) {
			this.displayedPublications = publications;
			return;
		}

		const selectedStoryIndex = publications.findIndex(
			(publication) => publication.story.slug === this.selectedStorySlug(),
		);

		const lowerIndex =
			selectedStoryIndex - numberOfDisplayedPublications / 2 < 0
				? 0
				: selectedStoryIndex - Math.floor(numberOfDisplayedPublications / 2);
		const upperIndex =
			selectedStoryIndex + numberOfDisplayedPublications / 2 > publications.length
				? publications.length
				: Math.ceil(selectedStoryIndex + numberOfDisplayedPublications / 2);

		this.displayedPublications = this.storylist.publications.slice(
			upperIndex === publications.length ? publications.length - numberOfDisplayedPublications : lowerIndex,
			lowerIndex === 0 ? numberOfDisplayedPublications : upperIndex,
		);
	}
}
