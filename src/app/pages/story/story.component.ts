// Core
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { YouTubePlayer } from '@angular/youtube-player';

// 3rd Party modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Router
import { APP_ROUTE_TREE } from '../../app.routes';

// Models
import { Story } from '@models/story.model';
import { Storylist } from '@models/storylist.model';

// Services
import { MacroTaskWrapperService } from '../../providers/macro-task-wrapper.service';
import { StorylistService } from '../../providers/storylist.service';
import { StoryService } from '../../providers/story.service';

// Directives
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

// Components
import { StoryNavigationBarComponent } from '../../components/story-navigation-bar/story-navigation-bar.component';
import { BioSummaryCardComponent } from '../../components/bio-summary-card/bio-summary-card.component';
import { ShareContentComponent } from '../../components/share-content/share-content.component';
import { EpigraphComponent } from '../../components/epigraph/epigraph.component';
import { MediaResourceComponent } from '../../components/media-resource/media-resource.component';
import { PortableTextParserComponent } from '../../components/portable-text-parser/portable-text-parser.component';

@Component({
	selector: 'cuentoneta-story',
	templateUrl: './story.component.html',
	styles: `
		:host {
			@apply md:grid md:mt-28 gap-x-8 md:grid-cols-[286px_1fr];
		}

		@keyframes scrollbar {
			to {width: 100%;}
		}

		.progress-container {
			@apply bg-primary-100 w-full h-2;
			overflow: hidden;
			position: sticky;
			top: 0;
		}

		.progress-bar {
			@apply bg-primary-400 h-full w-0;
			transition-timing-function: ease-out;
			transition: width .5s;
			animation: scrollbar linear;
			animation-timeline: scroll(root);
		}
	`,
	standalone: true,
	imports: [
		CommonModule,
		NgOptimizedImage,
		NgxSkeletonLoaderModule,
		StoryNavigationBarComponent,
		BioSummaryCardComponent,
		ShareContentComponent,
		EpigraphComponent,
		YouTubePlayer,
		MediaResourceComponent,
		PortableTextParserComponent,
	],
	hostDirectives: [FetchContentDirective, MetaTagsDirective],
})
export class StoryComponent {
	readonly appRouteTree = APP_ROUTE_TREE;
	fetchContentDirective = inject(FetchContentDirective<[Story, Storylist]>);

	// Valores undefined necesarios para poder determinar cuándo mostrar skeletons o la información de story y storylist en el template
	story: Story | undefined;
	storylist: Storylist | undefined;

	dummyList = Array(10);
	shareContentParams: { [key: string]: string } = {};
	shareMessage: string = '';

	storyWithTransformedvideoUrl(story: Story) {
		if (story.videoUrl) {
			const videoUrl = new URL(story.videoUrl);
			return {
				...story,
				videoUrl: videoUrl.pathname.split('/')[2],
			};
		}

		return story;
	}

	constructor() {
		const platformId = inject(PLATFORM_ID);
		const activatedRoute = inject(ActivatedRoute);
		const metaTagsDirective = inject(MetaTagsDirective);
		const storylistService = inject(StorylistService);
		const storyService = inject(StoryService);
		const macroTaskWrapperService = inject(MacroTaskWrapperService);

		const fetchObservable$ = this.fetchContentDirective
			.fetchContentWithSourceParams$(
				activatedRoute.params,
				switchMap(({ slug, list }) => combineLatest([storyService.getBySlug(slug), storylistService.get(list, 10)])),
			)
			.pipe(takeUntilDestroyed());

		const content$ = isPlatformBrowser(platformId)
			? fetchObservable$
			: macroTaskWrapperService.wrapMacroTaskObservable<[Story, Storylist]>(
					'StoryComponent.fetchData',
					fetchObservable$,
					null,
					'first-emit',
				);

		content$.subscribe(([story, storylist]) => {
			this.story = this.storyWithTransformedvideoUrl(story);
			this.storylist = storylist;

			metaTagsDirective.setTitle(`${story.title}, de ${story.author.name} en La Cuentoneta`);
			metaTagsDirective.setDescription(
				`"${story.title}", de ${story.author.name}. Parte de la colección "${storylist.title}" en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`,
			);
			this.shareContentParams = { slug: story.slug, list: storylist.slug };
			this.shareMessage = `Leí "${story.title}" de ${story.author.name} en La Cuentoneta y te lo comparto. Sumate a leer este y otros cuentos de la colección "${storylist.title}" en este link:`;
		});
	}
}
