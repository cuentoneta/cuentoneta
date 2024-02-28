// Core
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Models
import { Storylist } from '../../models/storylist.model';
import { StorylistGridSkeletonConfig } from '../../models/content.model';

// Services
import { ContentService } from '../../providers/content.service';
import { MacroTaskWrapperService } from '../../providers/macro-task-wrapper.service';
import { StorylistService } from '../../providers/storylist.service';

// Directives
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { StorylistCardDeckComponent } from 'src/app/components/storylist-card-deck/storylist-card-deck.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
	selector: 'cuentoneta-storylist',
	templateUrl: './storylist.component.html',
	standalone: true,
	imports: [CommonModule, StorylistCardDeckComponent, NgxSkeletonLoaderModule],
	hostDirectives: [FetchContentDirective, MetaTagsDirective],
})
export class StorylistComponent {
	fetchContentDirective = inject(FetchContentDirective<Storylist>);
	storylist!: Storylist | undefined;
	skeletonConfig: StorylistGridSkeletonConfig | undefined;

	constructor() {
		const platformId = inject(PLATFORM_ID);
		const activatedRoute = inject(ActivatedRoute);
		const metaTagsDirective = inject(MetaTagsDirective);
		const storylistService = inject(StorylistService);
		const macroTaskWrapperService = inject(MacroTaskWrapperService);
		const contentService = inject(ContentService);

		const fetchObservable$: Observable<Storylist> = activatedRoute.params.pipe(
			tap(({ slug }) => {
				this.storylist = undefined;
				const decks = [...contentService.contentConfig.cards, ...contentService.contentConfig.previews];
				this.skeletonConfig = decks.find((config) => config.slug === activatedRoute.snapshot.params['slug'])
					?.gridSkeletonConfig;
			}),
			switchMap(() =>
				this.fetchContentDirective.fetchContentWithSourceParams$<Storylist>(
					activatedRoute.params,
					switchMap(({ slug }) => storylistService.get(slug, 60, 'asc')),
				),
			),
			takeUntilDestroyed(),
		);

		// TODO: Mover discriminación entre client-side y server-side a directiva
		// En base a si la plataforma es browser o server, utiliza el wrapper de macro tasks en el segundo caso
		const storylist$ = isPlatformBrowser(platformId)
			? fetchObservable$
			: macroTaskWrapperService.wrapMacroTaskObservable<Storylist>(
					'StorylistComponent.fetchData',
					fetchObservable$,
					null,
					'first-emit',
				);

		storylist$.subscribe((storylist) => {
			this.storylist = storylist;
			metaTagsDirective.setTitle(`"${storylist.title}" en La Cuentoneta`);
			metaTagsDirective.setDescription(
				`Colección "${storylist.title}", una storylist en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`,
			);
		});
	}
}
