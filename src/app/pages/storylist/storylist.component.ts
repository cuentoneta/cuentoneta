// Core
import { Component, computed, effect, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule, NgOptimizedImage } from '@angular/common';

// 3rd party modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { injectParams } from 'ngxtension/inject-params';

// Models
import { Storylist } from '@models/storylist.model';

// Services
import { StorylistService } from '../../providers/storylist.service';

// Directives
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

// Componentes
import { StorylistCardDeckComponent } from 'src/app/components/storylist-card-deck/storylist-card-deck.component';
import { PortableTextParserComponent } from '../../components/portable-text-parser/portable-text-parser.component';
import { ThemeService } from '../../providers/theme.service';

@Component({
	selector: 'cuentoneta-storylist',
	templateUrl: './storylist.component.html',
	imports: [
		CommonModule,
		StorylistCardDeckComponent,
		NgxSkeletonLoaderModule,
		PortableTextParserComponent,
		NgOptimizedImage,
	],
	hostDirectives: [FetchContentDirective, MetaTagsDirective],
})
export class StorylistComponent {
	// Providers
	fetchContentDirective = inject(FetchContentDirective);
	private params = injectParams();
	private metaTagsDirective = inject(MetaTagsDirective);
	private storylistService = inject(StorylistService);

	skeletonColor = inject(ThemeService).pickColor('zinc', 300);
	storylist!: Storylist | undefined;

	featuredImageUrl = computed(() => `${this.storylist?.featuredImage}?h=${256 * 1.5}&w=${192 * 1.5}&auto=format`);

	constructor() {
		effect((cleanUp) => {
			const { slug } = this.params();
			const subscription = this.storylist$(slug).subscribe((storylist) => {
				this.storylist = storylist;
				this.metaTagsDirective.setTitle(`${storylist.title}`);
				this.metaTagsDirective.setDescription(
					`Una storylist en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`,
				);
			});
			cleanUp(() => subscription.unsubscribe());
		});
	}

	private storylist$(slug: string): Observable<Storylist> {
		this.storylist = undefined;
		return this.fetchContentDirective.fetchContent$<Storylist>(this.storylistService.get(slug, 60, 'asc'));
	}
}
