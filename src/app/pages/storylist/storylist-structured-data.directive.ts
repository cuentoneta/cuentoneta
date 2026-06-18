import { Directive, inject, untracked } from '@angular/core';

import { environment } from '../../environments/environment';
import { AbstractStructuredDataDirective } from '../../directives/abstract-structured-data.directive';
import { STORYLIST_HOST } from './storylist-host';
import { buildStorylistBreadcrumb, buildStorylistCollectionSchema } from './storylist.schema';

@Directive({
	selector: '[cuentonetaStorylistStructuredData]',
})
export class StorylistStructuredDataDirective extends AbstractStructuredDataDirective {
	private readonly host = inject(STORYLIST_HOST);

	protected applyStructuredData(): void {
		const storylist = this.host.storylist();
		if (!storylist) {
			return;
		}
		untracked(() => {
			this.schemaOrg.setJsonLd('collection', buildStorylistCollectionSchema(storylist, environment.website));
			this.schemaOrg.setJsonLd('breadcrumb-storylist', buildStorylistBreadcrumb(storylist, environment.website));
		});
	}

	protected removeStructuredData(): void {
		this.schemaOrg.removeJsonLd('collection');
		this.schemaOrg.removeJsonLd('breadcrumb-storylist');
	}
}
