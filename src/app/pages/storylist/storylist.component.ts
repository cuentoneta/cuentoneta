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

// Componentes
import { StorylistCardDeckComponent } from 'src/app/components/storylist-card-deck/storylist-card-deck.component';
import { PortableTextParserComponent } from '../../components/portable-text-parser/portable-text-parser.component';
import { ThemeService } from '../../providers/theme.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
	selector: 'cuentoneta-storylist',
	templateUrl: './storylist.component.html',
	imports: [CommonModule, StorylistCardDeckComponent, NgxSkeletonLoaderModule, PortableTextParserComponent],
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
		request: () => this.params(),
		loader: (params) =>
			this.storylistService.get(params.request['slug'], 60, 'asc').pipe(
				tap((storylist) => {
					this.updateMetaTags(storylist);
				}),
			),
	});

	// Propiedades
	readonly featuredImageUrl = computed(
		() => `${this.storylist()?.featuredImage}?h=${256 * 1.5}&w=${192 * 1.5}&auto=format`,
	);
	readonly storylist = computed(() => this.storylistResource.value());

	private updateMetaTags(storylist: Storylist) {
		this.metaTagsDirective.setTitle(`${storylist.title}`);
		this.metaTagsDirective.setDescription(
			`Una storylist en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`,
		);
	}
}
