// Core
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { YouTubePlayer } from '@angular/youtube-player';

// 3rd Party modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Router
import { AppRoutes } from '../../app.routes';

// Models
import { Story } from '@models/story.model';
import { Storylist } from '@models/storylist.model';

// Services
import { MacroTaskWrapperService } from '../../providers/macro-task-wrapper.service';
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
import { ThemeService } from '../../providers/theme.service';
import { StorylistNavigationFrameComponent } from '../../components/storylist-navigation-frame/storylist-navigation-frame.component';

@Component({
	selector: 'cuentoneta-story',
	templateUrl: './story.component.html',
	styles: `
		:host {
			@apply grid gap-x-8 md:mt-28 md:grid-cols-[286px_1fr];

			// Se remueve el margen horizontal para viewports xs y sm, aprovechando el espacio en dispositivos móviles
			@apply -mx-5 md:mx-0;
		}

		@keyframes scrollbar {
			to {
				width: 100%;
			}
		}

		.progress-bar {
			transition-timing-function: ease-out;
			transition: width 0.5s;
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
		RouterLink,
		StorylistNavigationFrameComponent,
	],
	hostDirectives: [FetchContentDirective, MetaTagsDirective],
})
export class StoryComponent {
	readonly appRoutes = AppRoutes;
	fetchContentDirective = inject(FetchContentDirective<[Story, Storylist]>);

	// Valores undefined necesarios para poder determinar cuándo mostrar skeletons o la información de story y storylist en el template
	story: Story | undefined;
	storylist: Storylist | undefined;

	dummyList = Array(10);
	shareContentParams: { [key: string]: string } = {};
	shareMessage: string = '';

	private themeService = inject(ThemeService);
	skeletonColor = this.themeService.pickColor('zinc', 300);

	constructor() {
		const platformId = inject(PLATFORM_ID);
		const activatedRoute = inject(ActivatedRoute);
		const metaTagsDirective = inject(MetaTagsDirective);
		const storyService = inject(StoryService);
		const macroTaskWrapperService = inject(MacroTaskWrapperService);

		const fetchObservable$ = this.fetchContentDirective
			.fetchContentWithSourceParams$(
				activatedRoute.params,
				switchMap(({ slug }) => storyService.getBySlug(slug)),
			)
			.pipe(takeUntilDestroyed());

		const content$ = isPlatformBrowser(platformId)
			? fetchObservable$
			: macroTaskWrapperService.wrapMacroTaskObservable<Story>(
					'StoryComponent.fetchData',
					fetchObservable$,
					null,
					'first-emit',
				);

		content$.subscribe((story) => {
			this.story = story;

			metaTagsDirective.setTitle(`${story.title}, de ${story.author.name} en La Cuentoneta`);
			metaTagsDirective.setDescription(
				`"${story.title}", de ${story.author.name} en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`,
			);
			this.shareContentParams = { slug: story.slug };
			this.shareMessage = `Leí "${story.title}" de ${story.author.name} en La Cuentoneta y te lo comparto. Sumate a leer este y otros cuentos en este link:`;
		});
	}
}
