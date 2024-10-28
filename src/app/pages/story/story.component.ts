// Core
import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { YouTubePlayer } from '@angular/youtube-player';

// 3rd Party modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { injectParams } from 'ngxtension/inject-params';

// Router
import { AppRoutes } from '../../app.routes';

// Models
import { Story } from '@models/story.model';

// Services
import { StoryService } from '../../providers/story.service';
import { ThemeService } from '../../providers/theme.service';

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
		BioSummaryCardComponent,
		CommonModule,
		EpigraphComponent,
		MediaResourceComponent,
		NgOptimizedImage,
		NgxSkeletonLoaderModule,
		PortableTextParserComponent,
		RouterLink,
		ShareContentComponent,
		StoryNavigationBarComponent,
		YouTubePlayer,
	],
	hostDirectives: [FetchContentDirective, MetaTagsDirective],
})
export class StoryComponent {
	// Routes
	readonly appRoutes = AppRoutes;

	// Providers
	fetchContentDirective = inject(FetchContentDirective);
	private params = injectParams();
	private storyService = inject(StoryService);
	private themeService = inject(ThemeService);
	private metaTagsDirective = inject(MetaTagsDirective);

	dummyList = Array(10);
	shareContentParams: { [key: string]: string } = {};
	shareMessage: string = '';
	skeletonColor = this.themeService.pickColor('zinc', 300);
	story: Story | undefined;

	constructor() {
		effect((cleanUp) => {
			this.story = undefined;
			const { slug } = this.params();
			const subscription = this.story$(slug).subscribe((story) => {
				this.story = story;
				this.updateMetaTags(story);
			});
			cleanUp(() => subscription.unsubscribe());
		});
	}

	private updateMetaTags(story: Story) {
		this.metaTagsDirective.setTitle(`${story.title} - ${story.author.name}`);
		this.metaTagsDirective.setDescription(
			`Una lectura en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`,
		);
		this.shareContentParams = { slug: story.slug };
		this.shareMessage = `Leí "${story.title}" de ${story.author.name} en La Cuentoneta y te lo comparto. Sumate a leer este y otros cuentos en este link:`;
	}

	private story$(slug: string): Observable<Story> {
		return this.fetchContentDirective.fetchContent$<Story>(
			this.storyService.getBySlug(slug).pipe(
				tap((story) => {
					this.updateMetaTags(story);
				}),
			),
		);
	}
}
