// Core
import { Component, computed, inject, input } from '@angular/core';
import { tap } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

// 3rd party modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Models
import { Storylist } from '@models/storylist.model';

// Services
import { StorylistService } from '../../providers/storylist.service';
import { ThemeService } from '../../providers/theme.service';

// Directives
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

// Environment
import { environment } from '../../environments/environment';

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
	hostDirectives: [MetaTagsDirective],
})
export default class StorylistComponent {
	// Route inputs
	readonly slug = input.required<string>();
	readonly activeTab = input<'stories' | 'about' | string>('stories');

	// Providers
	private metaTagsDirective = inject(MetaTagsDirective);
	private storylistService = inject(StorylistService);

	// Recursos
	skeletonColor = inject(ThemeService).pickColor('zinc', 300);
	readonly storylistResource = rxResource({
		params: this.slug,
		stream: ({ params }) =>
			this.storylistService.get(params, 60, 'asc').pipe(
				tap((storylist) => {
					this.updateMetaTags(storylist);
				}),
			),
		defaultValue: undefined,
	});

	// Propiedades
	// TODO: Implementar uso de imagen alusiva/tapa de libro en la ficha técnica
	readonly featuredImageUrl = computed(
		() => `${this.storylistResource.value()?.featuredImage}?h=${256 * 1.5}&w=${192 * 1.5}&auto=format`,
	);
	// TODO: Simplificar estructura de tipo Storylist para evitar estas transformaciones
	readonly stories = computed(() => this.storylistResource.value()?.stories.map((story) => story) || []);

	// Computed properties for tabs and media
	readonly tabs = computed(() => this.storylistResource.value()?.tabs || []);
	readonly media = computed(() => this.storylistResource.value()?.media || []);
	readonly hasMedia = computed(() => this.media().length > 0);

	private updateMetaTags(storylist: Storylist) {
		this.metaTagsDirective.setTitle(`${storylist.title}`);
		this.metaTagsDirective.setDescription(
			`Una storylist en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`,
		);
		this.metaTagsDirective.setCanonicalUrl(`${environment.website}/storylist/${storylist.slug}`);
		this.metaTagsDirective.setRobots('index, follow');
		this.metaTagsDirective.setKeywords(['literatura', 'poemas', 'cuentos', 'textos', storylist.title.toLowerCase()]);
	}
}
