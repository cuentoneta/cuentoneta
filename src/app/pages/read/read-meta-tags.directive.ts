import { Directive, inject, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AbstractMetaTagsDirective } from '../../directives/abstract-meta-tags.directive';
import { READ_HOST } from './read-host';

@Directive({
	selector: '[cuentonetaReadMetaTags]',
	hostDirectives: [HeadMetadataDirective],
})
export class ReadMetaTagsDirective extends AbstractMetaTagsDirective {
	private readonly host = inject(READ_HOST);

	protected applyMetaTags(): void {
		const literaryWork = this.host.literaryWork();
		if (!literaryWork) {
			return;
		}
		untracked(() => {
			const byline = literaryWork.authors.map((author) => author.name).join(', ');
			this.head.setTitle(`${literaryWork.title} - ${byline}`);
			this.head.setDescription(
				'Una lectura en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.',
			);
			this.head.setCanonicalUrl(buildCanonicalUrl(`${AppRoutes.Read}/${literaryWork.slug}`));
			this.head.setRobots('index, follow');
			this.head.setKeywords([
				'literatura',
				'cuentos',
				literaryWork.title.toLowerCase(),
				...literaryWork.authors.map((author) => author.name.toLowerCase()),
			]);
			this.head.setAuthor(byline);
		});
	}
}
