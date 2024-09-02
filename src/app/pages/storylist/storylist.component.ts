// Core
import { Component, effect, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

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

@Component({
	selector: 'cuentoneta-storylist',
	templateUrl: './storylist.component.html',
	standalone: true,
	imports: [CommonModule, StorylistCardDeckComponent, NgxSkeletonLoaderModule],
	hostDirectives: [FetchContentDirective, MetaTagsDirective],
})
export class StorylistComponent {
	// Providers
	fetchContentDirective = inject(FetchContentDirective);
	private params = injectParams();
	private metaTagsDirective = inject(MetaTagsDirective);
	private storylistService = inject(StorylistService);

	storylist!: Storylist | undefined;

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
