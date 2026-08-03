// Core
import { Component, computed, forwardRef, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// Router
import { AppRoutes } from '../../app.routes';

// Utils
import { ssrBlockingRxResource } from '@app-utils/ssr-resource';
import type { NavigationContext, NavigationParams } from '@app-utils/navigation-params';

// Services
import { StoryApi } from '../../providers/story-api.interface';
import { LayoutService } from '../../providers/layout.interface';

// SEO
import { StoryMetaTagsDirective } from './story-meta-tags.directive';
import { StoryStructuredDataDirective } from './story-structured-data.directive';
import { STORY_HOST, type StoryHost } from './story-host';

// Components
import { ReadingSuggestionsComponent } from '@components/reading-suggestions/reading-suggestions.component';
import { BioSummaryCardComponent } from '@components/bio-summary-card/bio-summary-card.component';
import { ShareContentComponent } from '@components/share-content/share-content.component';
import { EditorialTextBlockComponent } from '@components/editorial-text-block/editorial-text-block.component';
import { MediaResourceComponent } from '@components/media-resource/media-resource.component';
import { PortableTextParserComponent } from '@components/portable-text-parser/portable-text-parser.component';
import { ProgressBarComponent } from '@components/progress-bar/progress-bar.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowRightLong } from '@ng-icons/font-awesome/solid';

@Component({
	selector: 'cuentoneta-story',
	templateUrl: './story.component.html',
	imports: [
		BioSummaryCardComponent,
		CommonModule,
		EditorialTextBlockComponent,
		MediaResourceComponent,
		SkeletonComponent,
		PortableTextParserComponent,
		RouterLink,
		ShareContentComponent,
		ProgressBarComponent,
		ReadingSuggestionsComponent,
		NgIcon,
	],
	providers: [
		provideIcons({ faSolidArrowRightLong }),
		{ provide: STORY_HOST, useExisting: forwardRef(() => StoryComponent) },
	],
	host: { class: 'grid md:grid-rows-[8px_1fr]' },
	hostDirectives: [StoryMetaTagsDirective, StoryStructuredDataDirective],
})
export default class StoryComponent implements StoryHost {
	// Routes
	protected readonly appRoutes = AppRoutes;

	// Providers
	public readonly slug = input.required<string>();
	public readonly navigation = input<NavigationContext>('author');
	public readonly navigationSlug = input<string>();

	private readonly storyService = inject(StoryApi);
	private readonly layoutService = inject(LayoutService);

	// Recursos
	protected readonly dummyList = Array(10);
	private readonly storyResource = ssrBlockingRxResource({
		params: this.slug,
		stream: ({ params }) => this.storyService.getBySlug(params),
		defaultValue: undefined,
	});

	// Propiedades
	public readonly story = computed(() => this.storyResource.value());
	protected readonly sharingRoute = computed(() => `${AppRoutes.Story}/${this.story()?.slug}`);
	protected readonly shareMessage = computed(
		() =>
			`Leí "${this.story()?.title}" de ${this.story()?.author.name} en La Cuentoneta y te lo comparto. Sumate a leer este y otros cuentos en este link:`,
	);
	protected readonly navigationParams = computed<NavigationParams>(() => {
		const navigationSlug = this.navigationSlug();

		if (navigationSlug) {
			return { navigation: this.navigation(), navigationSlug };
		}

		// Sin slug en la ruta solo se puede recurrir al autor de la obra: usarlo como slug de colección
		// pediría una colección inexistente.
		return { navigation: 'author' as const, navigationSlug: this.story()?.author.slug ?? '' };
	});
	// El enlace que se comparte arrastra el mismo contexto con el que se llegó a la obra: si divergiera,
	// quien lo abre entraría con un contexto que no existe.
	protected readonly shareContentParams = this.navigationParams;
	protected readonly headerPosition = computed(() =>
		this.layoutService.biggerThan('xs')
			? 'top-header-height'
			: this.layoutService.isHeaderVisible()
				? 'top-header-height'
				: 'top-0',
	);
}
