// Core
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// 3rd party modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Models
import { Storylist } from '@models/storylist.model';
import { StorylistGridSkeletonConfig } from '@models/content.model';

// Services
import { ContentService } from '../../providers/content.service';
import { StorylistService } from '../../providers/storylist.service';

// Directives
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

// Componentes
import { StorylistCardDeckComponent } from 'src/app/components/storylist-card-deck/storylist-card-deck.component';

@Component({
	selector: 'cuentoneta-storylist',
	templateUrl: './storylist.component.html',
	standalone: true,
	imports: [CommonModule, StorylistCardDeckComponent, NgxSkeletonLoaderModule],
	hostDirectives: [FetchContentDirective, MetaTagsDirective],
})
export class StorylistComponent {
	fetchContentDirective = inject(FetchContentDirective);
	storylist!: Storylist | undefined;
	skeletonConfig: StorylistGridSkeletonConfig | undefined;

	constructor() {
		const activatedRoute = inject(ActivatedRoute);
		const metaTagsDirective = inject(MetaTagsDirective);
		const storylistService = inject(StorylistService);
		const contentService = inject(ContentService);

		activatedRoute.params
			.pipe(
				takeUntilDestroyed(),
				switchMap(({ slug }) =>
					this.fetchContentDirective.fetchContent$<Storylist>(storylistService.get(slug, 60, 'asc')),
				),
				tap(() => {
					this.storylist = undefined;
					const decks = [...contentService.contentConfig.cards, ...contentService.contentConfig.previews];
					this.skeletonConfig = decks.find(
						(config) => config.slug === activatedRoute.snapshot.params['slug'],
					)?.gridSkeletonConfig;
				}),
			)
			.subscribe((storylist) => {
				this.storylist = storylist;
				metaTagsDirective.setTitle(`"${storylist.title}" en La Cuentoneta`);
				metaTagsDirective.setDescription(
					`Colección "${storylist.title}", una storylist en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`,
				);
			});
	}
}
