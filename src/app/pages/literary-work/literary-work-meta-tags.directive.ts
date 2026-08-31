import { Directive, inject, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AbstractMetaTagsDirective } from '../../directives/abstract-meta-tags.directive';
import { LITERARY_WORK_HOST } from './literary-work-host';

@Directive({
	selector: '[cuentonetaLiteraryWorkMetaTags]',
	hostDirectives: [HeadMetadataDirective],
})
export class LiteraryWorkMetaTagsDirective extends AbstractMetaTagsDirective {
	private readonly host = inject(LITERARY_WORK_HOST);

	protected applyMetaTags(): void {
		const literaryWork = this.host.literaryWork();
		if (!literaryWork) {
			return;
		}
		untracked(() => {
			const byline = literaryWork.authors.map((author) => author.name).join(', ');
			this.head.setTitle(`${literaryWork.title} - ${byline}`);
			// TODO: Revisar textos definitivos a la hora de implementar el issue #1471
			this.head.setDescription(
				'Una lectura en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.',
			);
			this.head.setCanonicalUrl(buildCanonicalUrl(`${AppRoutes.LiteraryWork}/${literaryWork.slug}`));
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
