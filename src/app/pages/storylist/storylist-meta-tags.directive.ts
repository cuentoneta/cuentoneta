import { Directive, inject, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { environment } from '../../environments/environment';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AbstractMetaTagsDirective } from '../../directives/abstract-meta-tags.directive';
import { STORYLIST_HOST } from './storylist-host';

@Directive({
	selector: '[cuentonetaStorylistMetaTags]',
	hostDirectives: [HeadMetadataDirective],
})
export class StorylistMetaTagsDirective extends AbstractMetaTagsDirective {
	private readonly host = inject(STORYLIST_HOST);

	protected applyMetaTags(): void {
		const storylist = this.host.storylist();
		if (!storylist) {
			return;
		}
		untracked(() => {
			this.head.setTitle(storylist.title);
			this.head.setDescription(
				'Una storylist en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.',
			);
			this.head.setCanonicalUrl(`${environment.website}/${AppRoutes.StoryList}/${storylist.slug}`);
			this.head.setRobots('index, follow');
			this.head.setKeywords(['literatura', 'poemas', 'cuentos', 'textos', storylist.title.toLowerCase()]);
		});
	}
}
