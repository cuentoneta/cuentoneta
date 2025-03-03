// Core
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';

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
	imports: [
		BioSummaryCardComponent,
		CommonModule,
		EpigraphComponent,
		MediaResourceComponent,
		NgxSkeletonLoaderModule,
		PortableTextParserComponent,
		RouterLink,
		ShareContentComponent,
		StoryNavigationBarComponent,
	],
	hostDirectives: [FetchContentDirective, MetaTagsDirective],
})
export class StoryComponent {
	// Routes
	readonly appRoutes = AppRoutes;

	// Providers
	private params = injectParams();
	private storyService = inject(StoryService);
	private themeService = inject(ThemeService);
	private meta = inject(MetaTagsDirective);

	// Recursos
	readonly dummyList = Array(10);
	readonly skeletonColor = this.themeService.pickColor('zinc', 300);
	readonly storyResource = rxResource({
		request: () => this.params(),
		loader: (params) =>
			this.storyService.getBySlug(params.request['slug']).pipe(
				tap((story) => {
					this.updateMetaTags(story);
				}),
			),
	});

	story = computed(() => this.storyResource.value());
	sharingRoute = computed(() => `${AppRoutes.Story}/${this.story()?.slug}`);
	shareContentParams = computed(() => ({ navigationSlug: this.story()?.author.slug ?? '', navigation: 'author' }));
	shareMessage = computed(
		() =>
			`Leí "${this.story()?.title}" de ${this.story()?.author.name} en La Cuentoneta y te lo comparto. Sumate a leer este y otros cuentos en este link:`,
	);

	private updateMetaTags(story: Story) {
		this.meta.setTitle(`${story.title} - ${story.author.name}`);
		this.meta.setDescription(
			`Una lectura en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`,
		);
	}
}
