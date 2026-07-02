import { Directive, effect, inject, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AbstractMetaTagsDirective } from '../../directives/abstract-meta-tags.directive';
import { STORYLIST_HOST } from './storylist-host';

@Directive({
	selector: '[cuentonetaStorylistMetaTags]',
	hostDirectives: [HeadMetadataDirective],
})
export class StorylistMetaTagsDirective extends AbstractMetaTagsDirective {
	private readonly host = inject(STORYLIST_HOST);

	// El canonical/og:url se deriva solo del slug (disponible sync desde el primer render), desacoplado
	// del gate en la entidad, para que la página nunca quede sin canonical aunque el fetch no haya resuelto.
	private readonly syncCanonicalEffect = effect(() => {
		this.head.setCanonicalUrl(buildCanonicalUrl(`${AppRoutes.StoryList}/${this.host.slug()}`));
	});

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
			this.head.setRobots('index, follow');
			this.head.setKeywords(['literatura', 'poemas', 'cuentos', 'textos', storylist.title.toLowerCase()]);
		});
	}
}
