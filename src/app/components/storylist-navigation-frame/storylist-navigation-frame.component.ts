import { Component, EventEmitter, inject, Input, Output, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { combineLatest, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, UrlTree } from '@angular/router';

// Directives
import { FetchContentDirective } from '../../directives/fetch-content.directive';

// Componentes
import { NavigablePublicationTeaserComponent } from '../navigable-publication-teaser/navigable-publication-teaser.component';

// Providers
import { StorylistService } from '../../providers/storylist.service';
import { MacroTaskWrapperService } from '../../providers/macro-task-wrapper.service';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
// Models
import { Story, StoryCard } from '@models/story.model';
import { Publication, Storylist } from '@models/storylist.model';

// Routes
import { AppRoutes } from '../../app.routes';

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
					[selected]="selectedStorySlug === publication.story.slug"
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
export class StorylistNavigationFrameComponent {
	@Input() selectedStorySlug: string = '';

	@Output() isLoading = new EventEmitter<boolean>();
	@Output() loaded = new EventEmitter<NavigationBarConfig>();

	readonly appRoutes = AppRoutes;

	displayedPublications: Publication<StoryCard>[] = [];
	dummyList: null[] = Array(9);
	fetchContentDirective = inject(FetchContentDirective<[Story, Storylist]>);
	storylist: Storylist | undefined;

	constructor() {
		const router = inject(Router);
		const platformId = inject(PLATFORM_ID);
		const activatedRoute = inject(ActivatedRoute);
		const storylistService = inject(StorylistService);
		const macroTaskWrapperService = inject(MacroTaskWrapperService);

		const fetchObservable$ = this.fetchContentDirective
			.fetchContentWithSourceParams$(
				activatedRoute.queryParams,
				switchMap(({ slug }) => storylistService.get(slug, 9)),
			)
			.pipe(
				tap(() => this.isLoading.emit(true)),
				takeUntilDestroyed(),
			);

		const content$ = isPlatformBrowser(platformId)
			? fetchObservable$
			: macroTaskWrapperService.wrapMacroTaskObservable<Storylist>(
					'StorylistNavigationFrameComponent.fetchData',
					fetchObservable$,
					null,
					'first-emit',
				);

		content$.subscribe((storylist) => {
			this.storylist = storylist;
			this.sliceDisplayedPublications(storylist.publications);
			this.loaded.emit({
				headerTitle: storylist.title,
				footerTitle: 'Ver más...',
				navigationRoute: router.createUrlTree([this.appRoutes.StoryList, storylist.slug]),
				showFooter: true,
			});
			this.isLoading.emit(false);
		});
	}

	/**
	 * Este método se encarga de mostrar la lista de publicaciones de la navbar en base a la story actualmente en vista.
	 * Si la storylist tiene más de 10 publicaciones, se muestran las 10 publicaciones más cercanas a la story actualmente
	 * en vista tomando las 5 publicaciones anteriores y las 5 siguientes en el caso por defecto y ajustando los límites en
	 * caso de que la story actualmente en vista sea una de las primeras o de las últimas.
	 * @author Ramiro Olivencia <ramiro@olivencia.com.ar>
	 */
	sliceDisplayedPublications(publications: Publication<StoryCard>[]): void {
		if (!this.storylist) {
			return;
		}

		const numberOfDisplayedPublications = 9;

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
