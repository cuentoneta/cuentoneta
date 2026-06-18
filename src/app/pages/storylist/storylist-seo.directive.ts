import { Directive, inject, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { environment } from '../../environments/environment';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { AbstractPageSeoDirective } from '../../directives/abstract-page-seo.directive';
import { STORYLIST_SEO_HOST } from './storylist-seo-host';
import { buildStorylistBreadcrumb, buildStorylistCollectionSchema } from './storylist.schema';

@Directive({
	selector: '[cuentonetaStorylistSeo]',
	hostDirectives: [MetaTagsDirective],
})
export class StorylistSeoDirective extends AbstractPageSeoDirective {
	private readonly host = inject(STORYLIST_SEO_HOST);

	protected applySeoTags(): void {
		const storylist = this.host.storylist();
		if (!storylist) {
			return;
		}
		untracked(() => {
			this.meta.setTitle(storylist.title);
			this.meta.setDescription(
				'Una storylist en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.',
			);
			this.meta.setCanonicalUrl(`${environment.website}/${AppRoutes.StoryList}/${storylist.slug}`);
			this.meta.setRobots('index, follow');
			this.meta.setKeywords(['literatura', 'poemas', 'cuentos', 'textos', storylist.title.toLowerCase()]);
			this.schemaOrg.setJsonLd('collection', buildStorylistCollectionSchema(storylist, environment.website));
			this.schemaOrg.setJsonLd('breadcrumb-storylist', buildStorylistBreadcrumb(storylist, environment.website));
		});
	}

	protected override removeStructuredData(): void {
		this.schemaOrg.removeJsonLd('collection');
		this.schemaOrg.removeJsonLd('breadcrumb-storylist');
	}
}
