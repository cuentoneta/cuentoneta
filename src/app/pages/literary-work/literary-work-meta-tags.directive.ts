import { Directive, inject, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { buildLiteraryWorkMetaDescription } from '@app-utils/meta-description.util';
import { resolveSearchImage } from '@utils/sanity-image.utils';
import { HeadMetadata } from '../../directives/head-metadata.directive';
import { AbstractMetaTags } from '../../directives/abstract-meta-tags.directive';
import { LITERARY_WORK_HOST } from './literary-work-host';

@Directive({
	selector: '[cuentonetaLiteraryWorkMetaTags]',
	hostDirectives: [HeadMetadata],
})
export class LiteraryWorkMetaTags extends AbstractMetaTags {
	private readonly host = inject(LITERARY_WORK_HOST);

	protected applyMetaTags(): void {
		const literaryWork = this.host.literaryWork();
		if (!literaryWork) {
			return;
		}
		untracked(() => {
			const byline = literaryWork.authors.map((author) => author.name).join(', ');
			this.head.setTitle(`${literaryWork.title} - ${byline}`);
			this.head.setDescription(buildLiteraryWorkMetaDescription(literaryWork));
			this.applySearchImage(resolveSearchImage(literaryWork.coverImage));
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
