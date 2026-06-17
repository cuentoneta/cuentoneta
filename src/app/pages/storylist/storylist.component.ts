// Core
import { Component, computed, forwardRef, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

// 3rd party modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Services
import { StorylistApi } from '../../providers/storylist-api.interface';

// SEO
import { StorylistSeoDirective } from './storylist-seo.directive';
import { STORYLIST_SEO_HOST, type StorylistSeoHost } from './storylist-seo-host';

// Componentes
import { PortableTextParserComponent } from '@components/portable-text-parser/portable-text-parser.component';
import Tabs from '@components/tabs/tabs.component';
import Tab from '@components/tabs/tab.component';
import { StorylistTitle } from './storylist-title/storylist-title';
import { StoryCardTeaserComponent } from '@components/story-card-teaser/story-card-teaser.component';
import { StoryCardTeaserSkeletonComponent } from '@components/story-card-teaser/story-card-teaser-skeleton.component';
import { MediaResourceComponent } from '@components/media-resource/media-resource.component';

@Component({
	selector: 'cuentoneta-storylist',
	templateUrl: './storylist.component.html',
	imports: [
		NgxSkeletonLoaderModule,
		PortableTextParserComponent,
		Tabs,
		Tab,
		StoryCardTeaserComponent,
		StoryCardTeaserSkeletonComponent,
		StorylistTitle,
		MediaResourceComponent,
	],
	providers: [{ provide: STORYLIST_SEO_HOST, useExisting: forwardRef(() => StorylistComponent) }],
	hostDirectives: [StorylistSeoDirective],
	styles: `
		@reference '#tailwind-theme';

		:host ::ng-deep .description-skeleton .skeleton-loader {
			@apply bg-neutral-300;
		}
	`,
})
export default class StorylistComponent implements StorylistSeoHost {
	// Route inputs
	public readonly slug = input.required<string>();
	public readonly activeTab = input<'stories' | 'about' | string>('stories');

	// Providers
	private storylistService = inject(StorylistApi);

	// Recursos
	protected readonly storylistResource = rxResource({
		params: this.slug,
		stream: ({ params }) => this.storylistService.get(params, 60, 'asc'),
		defaultValue: undefined,
	});
	public readonly storylist = computed(() => this.storylistResource.value());

	// Propiedades
	// TODO: Implementar uso de imagen alusiva/tapa de libro en la ficha técnica
	private readonly featuredImageUrl = computed(
		() => `${this.storylistResource.value()?.featuredImage}?h=${256 * 1.5}&w=${192 * 1.5}&auto=format`,
	);
	// TODO: Simplificar estructura de tipo Storylist para evitar estas transformaciones
	protected readonly stories = computed(() => this.storylistResource.value()?.stories.map((story) => story) || []);

	// Computed properties for tabs and media
	protected readonly tabs = computed(() => this.storylistResource.value()?.tabs || []);
	protected readonly media = computed(() => this.storylistResource.value()?.media || []);
	protected readonly hasMedia = computed(() => this.media().length > 0);
}
