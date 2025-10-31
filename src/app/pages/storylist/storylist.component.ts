// Core
import { Component, computed, inject } from '@angular/core';
import { tap } from 'rxjs';
import { CommonModule } from '@angular/common';

// 3rd party modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { injectParams } from 'ngxtension/inject-params';

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
import { ThemeService } from '../../providers/theme.service';
import { rxResource } from '@angular/core/rxjs-interop';
import Tabs from '@components/tabs/tabs.component';
import Tab from '@components/tabs/tab.component';
import { BadgeComponent } from '@components/badge/badge.component';
import { StoryCardTeaserComponent } from '@components/story-card-teaser/story-card-teaser.component';
import { StoryCardTeaserSkeletonComponent } from '@components/story-card-teaser/story-card-teaser-skeleton.component';
import { StoryTeaserWithAuthor } from '@models/story.model';

@Component({
	selector: 'cuentoneta-storylist',
	templateUrl: './storylist.component.html',
	imports: [
		CommonModule,
		NgxSkeletonLoaderModule,
		PortableTextParserComponent,
		Tabs,
		Tab,
		BadgeComponent,
		StoryCardTeaserComponent,
		StoryCardTeaserSkeletonComponent,
	],
	hostDirectives: [MetaTagsDirective],
})
export default class StorylistComponent {
	// Providers
	private params = injectParams();
	private metaTagsDirective = inject(MetaTagsDirective);
	private storylistService = inject(StorylistService);

	// Recursos
	skeletonColor = inject(ThemeService).pickColor('zinc', 300);
	readonly storylistResource = rxResource({
		params: () => this.params(),
		stream: ({ params: request }) =>
			this.storylistService.get(request['slug'], 60, 'asc').pipe(
				tap((storylist) => {
					this.updateMetaTags(storylist);
				}),
			),
		defaultValue: undefined,
	});

	// Propiedades
	// TODO: Implementar uso de imagen alusiva/tapa de libro en la ficha técnica
	readonly featuredImageUrl = computed(
		() => `${this.storylist()?.featuredImage}?h=${256 * 1.5}&w=${192 * 1.5}&auto=format`,
	);
	readonly storylist = computed(() => this.storylistResource.value());
	// TODO: Simplificar estructura de tipo Storylist para evitar estas transformaciones
	readonly stories = computed(() => this.storylist()?.publications.map((p) => p.story as StoryTeaserWithAuthor) || []);

	private updateMetaTags(storylist: Storylist) {
		this.metaTagsDirective.setTitle(`${storylist.title}`);
		this.metaTagsDirective.setDescription(
			`Una storylist en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`,
		);
		this.metaTagsDirective.setCanonicalUrl(`${environment.website}/storylist/${storylist.slug}`);
		this.metaTagsDirective.setRobots('index, follow');
	}
}
