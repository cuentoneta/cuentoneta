import { Directive, effect, inject } from '@angular/core';

import { environment } from '../../environments/environment';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { SchemaOrgService } from '../../providers/schema-org.service';
import { STORYLIST_SEO_HOST } from './storylist-seo-host';
import { buildStorylistBreadcrumb, buildStorylistCollectionSchema } from './storylist.schema';

@Directive({
	selector: '[cuentonetaStorylistSeo]',
	hostDirectives: [MetaTagsDirective],
})
export class StorylistSeoDirective {
	private readonly host = inject(STORYLIST_SEO_HOST);
	private readonly meta = inject(MetaTagsDirective);
	private readonly schemaOrg = inject(SchemaOrgService);

	private readonly applySeo = effect((onCleanup) => {
		const storylist = this.host.storylist();
		if (!storylist) {
			return;
		}
		this.meta.setTitle(storylist.title);
		this.meta.setDescription(
			'Una storylist en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.',
		);
		this.meta.setCanonicalUrl(`${environment.website}/storylist/${storylist.slug}`);
		this.meta.setRobots('index, follow');
		this.meta.setKeywords(['literatura', 'poemas', 'cuentos', 'textos', storylist.title.toLowerCase()]);
		this.schemaOrg.setJsonLd('collection', buildStorylistCollectionSchema(storylist, environment.website));
		this.schemaOrg.setJsonLd('breadcrumb-storylist', buildStorylistBreadcrumb(storylist, environment.website));
		onCleanup(() => {
			this.schemaOrg.removeJsonLd('collection');
			this.schemaOrg.removeJsonLd('breadcrumb-storylist');
		});
	});
}
