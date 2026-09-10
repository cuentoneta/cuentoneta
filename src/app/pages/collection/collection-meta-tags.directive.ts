import { Directive, inject, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AbstractMetaTagsDirective } from '../../directives/abstract-meta-tags.directive';
import { COLLECTION_HOST } from './collection-host';
import { buildCollectionDescription } from './collection.schema';

@Directive({
	selector: '[cuentonetaCollectionMetaTags]',
	hostDirectives: [HeadMetadataDirective],
})
export class CollectionMetaTagsDirective extends AbstractMetaTagsDirective {
	private readonly host = inject(COLLECTION_HOST);

	protected applyMetaTags(): void {
		const collection = this.host.collection();
		if (!collection) {
			return;
		}
		untracked(() => {
			this.head.setTitle(collection.title);
			// Sin prosa propia no hay texto que derivar: la frase editorial fija garantiza que el
			// `description` nunca salga vacío.
			this.head.setDescription(
				buildCollectionDescription(collection.description) ??
					'Una colección de La Cuentoneta: una iniciativa que busca fomentar y hacer accesible la lectura digital.',
			);
			this.head.setCanonicalUrl(buildCanonicalUrl(`${AppRoutes.Collection}/${collection.slug}`));
			this.head.setRobots('index, follow');
			this.head.setKeywords([
				'literatura',
				'poemas',
				'cuentos',
				'textos',
				collection.title.toLowerCase(),
				...collection.tags.map((tag) => tag.title.toLowerCase()),
			]);
		});
	}
}
