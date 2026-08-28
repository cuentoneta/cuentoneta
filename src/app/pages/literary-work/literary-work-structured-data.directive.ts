import { Directive, inject, untracked } from '@angular/core';

import { environment } from '../../environments/environment';
import { AbstractStructuredDataDirective } from '../../directives/abstract-structured-data.directive';
import { LITERARY_WORK_HOST } from './literary-work-host';
import { buildLiteraryWorkArticleSchema, buildLiteraryWorkBreadcrumb } from './literary-work.schema';

@Directive({
	selector: '[cuentonetaLiteraryWorkStructuredData]',
})
export class LiteraryWorkStructuredDataDirective extends AbstractStructuredDataDirective {
	private readonly host = inject(LITERARY_WORK_HOST);

	protected applyStructuredData(): void {
		const literaryWork = this.host.literaryWork();
		if (!literaryWork) {
			return;
		}
		untracked(() => {
			this.schemaOrg.setPageScopedJsonLd('article', buildLiteraryWorkArticleSchema(literaryWork, environment.website));
			this.schemaOrg.setPageScopedJsonLd(
				'breadcrumb-literary-work',
				buildLiteraryWorkBreadcrumb(literaryWork, environment.website),
			);
		});
	}

	protected removeStructuredData(): void {
		this.schemaOrg.removeJsonLd('article');
		this.schemaOrg.removeJsonLd('breadcrumb-literary-work');
	}
}
