// Core
import { Component, computed, forwardRef, inject, input } from '@angular/core';

// Services
import { StorylistApi } from '../../providers/storylist-api.interface';
import { ssrBlockingRxResource } from '@utils/ssr-resource';

// SEO
import { StorylistMetaTagsDirective } from './storylist-meta-tags.directive';
import { StorylistStructuredDataDirective } from './storylist-structured-data.directive';
import { STORYLIST_HOST, type StorylistHost } from './storylist-host';

// Componentes
import { PortableTextParserComponent } from '@components/portable-text-parser/portable-text-parser.component';
import Tabs from '@components/tabs/tabs.component';
import Tab from '@components/tabs/tab.component';
import { StorylistTitle } from './storylist-title/storylist-title';
import { StoryCardTeaserComponent } from '@components/story-card-teaser/story-card-teaser.component';
import { StoryCardTeaserSkeletonComponent } from '@components/story-card-teaser/story-card-teaser-skeleton.component';
import { MediaResourceComponent } from '@components/media-resource/media-resource.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';

@Component({
	selector: 'cuentoneta-storylist',
	templateUrl: './storylist.component.html',
	imports: [
		SkeletonComponent,
		PortableTextParserComponent,
		Tabs,
		Tab,
		StoryCardTeaserComponent,
		StoryCardTeaserSkeletonComponent,
		StorylistTitle,
		MediaResourceComponent,
	],
	providers: [{ provide: STORYLIST_HOST, useExisting: forwardRef(() => StorylistComponent) }],
	hostDirectives: [StorylistMetaTagsDirective, StorylistStructuredDataDirective],
})
export default class StorylistComponent implements StorylistHost {
	// Route inputs
	public readonly slug = input.required<string>();
	public readonly activeTab = input<'stories' | 'about' | string>('stories');

	// Cantidad de líneas del skeleton de la descripción mientras carga
	protected readonly descriptionSkeletonLines = Array.from({ length: 10 });

	// Providers
	private storylistService = inject(StorylistApi);

	// Recursos
	protected readonly storylistResource = ssrBlockingRxResource({
		params: this.slug,
		stream: ({ params }) => this.storylistService.get(params, 60, 'asc'),
		defaultValue: undefined,
	});
	public readonly storylist = computed(() => this.storylistResource.value());

	// TODO: Simplificar estructura de tipo Storylist para evitar estas transformaciones
	protected readonly stories = computed(() => this.storylistResource.value()?.stories.map((story) => story) || []);

	// Computed properties for tabs and media
	protected readonly tabs = computed(() => this.storylistResource.value()?.tabs || []);
	protected readonly media = computed(() => this.storylistResource.value()?.media || []);
	protected readonly hasMedia = computed(() => this.media().length > 0);
}
