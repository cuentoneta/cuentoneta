// Core
import { Component, computed, inject, signal, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';

// 3rd Party modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Router
import { AppRoutes } from '../../app.routes';

// Environment
import { environment } from '../../environments/environment';

// Models
import { Story } from '@models/story.model';

// Services
import { StoryService } from '../../providers/story.service';
import { LayoutService } from '../../providers/layout.service';
import { ThemeService } from '../../providers/theme.service';

// Directives
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

// Components
import { StoryNavigationBarComponent } from '@components/story-navigation-bar/story-navigation-bar.component';
import { BioSummaryCardComponent } from '@components/bio-summary-card/bio-summary-card.component';
import { ShareContentComponent } from '@components/share-content/share-content.component';
import { EpigraphComponent } from '@components/epigraph/epigraph.component';
import { MediaResourceComponent } from '@components/media-resource/media-resource.component';
import { PortableTextParserComponent } from '@components/portable-text-parser/portable-text-parser.component';
import { ProgressBarComponent } from '@components/progress-bar/progress-bar.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowRightLong } from '@ng-icons/font-awesome/solid';

@Component({
	selector: 'cuentoneta-story',
	templateUrl: './story.component.html',
	styles: `
		:host {
			@apply grid;
			@apply md:grid-rows-[8px_1fr];
		}

		.content {
			@apply grid grid-cols-1 md:mx-auto md:grid-cols-[286px_1fr] md:gap-x-8;
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
		ProgressBarComponent,
		NgIcon,
	],
	providers: [provideIcons({ faSolidArrowRightLong }), LayoutService],
	hostDirectives: [MetaTagsDirective],
})
export default class StoryComponent {
	// Routes
	readonly appRoutes = AppRoutes;

	// Providers
	readonly slug = input.required<string>();
	readonly navigation = input<'author' | 'storylist'>('author');
	readonly navigationSlug = input<string>();

	private storyService = inject(StoryService);
	private themeService = inject(ThemeService);
	private layoutService = inject(LayoutService);
	private metaTagsDirective = inject(MetaTagsDirective);
	private isHeaderVisible$ = inject(LayoutService).isHeaderVisible$.pipe(takeUntilDestroyed());

	// Recursos
	readonly dummyList = Array(10);
	readonly skeletonColor = this.themeService.pickColor('zinc', 300);
	readonly storyResource = rxResource({
		params: this.slug,
		stream: ({ params }) =>
			this.storyService.getBySlug(params).pipe(
				tap((story) => {
					this.updateMetaTags(story);
				}),
			),
		defaultValue: undefined,
	});

	// Propiedades
	readonly story = computed(() => this.storyResource.value());
	readonly sharingRoute = computed(() => `${AppRoutes.Story}/${this.story()?.slug}`);
	readonly shareContentParams = computed(() => ({
		navigationSlug: this.story()?.author.slug ?? '',
		navigation: 'author',
	}));
	readonly shareMessage = computed(
		() =>
			`Leí "${this.story()?.title}" de ${this.story()?.author.name} en La Cuentoneta y te lo comparto. Sumate a leer este y otros cuentos en este link:`,
	);
	readonly navigationParams = computed(() => {
		const navigation = this.navigation();
		let navigationSlug = this.navigationSlug();

		if (!navigationSlug) {
			navigationSlug = this.story()?.author.slug ?? '';
		}

		return { navigation, navigationSlug };
	});
	readonly headerPosition = signal('top-header-height');

	constructor() {
		this.isHeaderVisible$.subscribe((isVisible) => {
			if (this.layoutService.biggerThan('xs')) {
				this.headerPosition.set('top-header-height');
				return;
			}
			this.headerPosition.set(isVisible ? 'top-header-height' : 'top-0');
		});
	}

	private updateMetaTags(story: Story) {
		this.metaTagsDirective.setTitle(`${story.title} - ${story.author.name}`);
		this.metaTagsDirective.setDescription(
			`Una lectura en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`,
		);
		this.metaTagsDirective.setCanonicalUrl(`${environment.website}/${AppRoutes.Story}/${story.slug}`);
		this.metaTagsDirective.setRobots('index, follow');
		this.metaTagsDirective.setKeywords([
			'literatura',
			'poemas',
			'cuentos',
			story.title.toLowerCase(),
			story.author.name.toLowerCase(),
		]);
	}
}
