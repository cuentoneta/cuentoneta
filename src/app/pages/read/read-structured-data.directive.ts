import { Directive, inject, untracked } from '@angular/core';

import { environment } from '../../environments/environment';
import { AbstractStructuredDataDirective } from '../../directives/abstract-structured-data.directive';
import { READ_HOST } from './read-host';
import { buildLiteraryWorkArticleSchema, buildLiteraryWorkBreadcrumb } from './read.schema';

@Directive({
	selector: '[cuentonetaReadStructuredData]',
})
export class ReadStructuredDataDirective extends AbstractStructuredDataDirective {
	private readonly host = inject(READ_HOST);

	protected applyStructuredData(): void {
		const literaryWork = this.host.literaryWork();
		if (!literaryWork) {
			return;
		}
		untracked(() => {
			this.schemaOrg.setPageScopedJsonLd('article', buildLiteraryWorkArticleSchema(literaryWork, environment.website));
			this.schemaOrg.setPageScopedJsonLd(
				'breadcrumb-read',
				buildLiteraryWorkBreadcrumb(literaryWork, environment.website),
			);
		});
	}

	protected removeStructuredData(): void {
		this.schemaOrg.removeJsonLd('article');
		this.schemaOrg.removeJsonLd('breadcrumb-read');
	}
}
