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
	styles: `
		:host ::ng-deep .description-skeleton .skeleton-loader {
			@apply bg-neutral-300;
		}
	`,
})
export default class StorylistComponent {
	// Route inputs
	readonly slug = input.required<string>();
	readonly activeTab = input<'stories' | 'about' | string>('stories');

	// Providers
	private metaTagsDirective = inject(MetaTagsDirective);
	private storylistService = inject(StorylistService);

	// Recursos
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
		// Título
		this.metaTagsDirective.setTitle(`${storylist.title}`);

		// Descripción personalizada con count
		const storyCount = storylist.count;
		const tagNames = storylist.tags.slice(0, 3).map((t) => t.name).join(', ');
		const tagText = tagNames ? ` Temáticas: ${tagNames}.` : '';

		this.metaTagsDirective.setDescription(
			`Explorá ${storyCount} ${storyCount === 1 ? 'historia' : 'historias'} seleccionadas en esta colección de La Cuentoneta.${tagText} Literatura breve curada para disfrutar.`,
		);

		// URL canónica
		const canonicalUrl = `${environment.website}/storylist/${storylist.slug}`;
		this.metaTagsDirective.setCanonicalUrl(canonicalUrl);
		this.metaTagsDirective.setUrl(canonicalUrl);

		// Tipo de contenido
		this.metaTagsDirective.setType('website');

		// Imagen OG dinámica
		const ogImageUrl = `${environment.website}/api/og/storylist/${storylist.slug}`;
		this.metaTagsDirective.setImage(ogImageUrl);

		// Indexación
		this.metaTagsDirective.setRobots('index, follow');

		// Keywords
		this.metaTagsDirective.setKeywords([
			'literatura',
			'cuentos',
			'colección',
			'storylist',
			storylist.title.toLowerCase(),
			...storylist.tags.map((t) => t.name.toLowerCase()),
		]);
	}
}
