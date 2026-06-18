import { Directive, inject, untracked } from '@angular/core';

import { environment } from '../../environments/environment';
import { AbstractStructuredDataDirective } from '../../directives/abstract-structured-data.directive';
import { AUTHOR_HOST } from './author-host';
import { buildAuthorBreadcrumb, buildAuthorProfilePageSchema } from './author.schema';

@Directive({
	selector: '[cuentonetaAuthorStructuredData]',
})
export class AuthorStructuredDataDirective extends AbstractStructuredDataDirective {
	private readonly host = inject(AUTHOR_HOST);

	protected applyStructuredData(): void {
		const author = this.host.author();
		if (!author) {
			return;
		}
		untracked(() => {
			this.schemaOrg.setJsonLd('profile-page', buildAuthorProfilePageSchema(author, environment.website));
			this.schemaOrg.setJsonLd('breadcrumb-author', buildAuthorBreadcrumb(author, environment.website));
		});
	}

	protected removeStructuredData(): void {
		this.schemaOrg.removeJsonLd('profile-page');
		this.schemaOrg.removeJsonLd('breadcrumb-author');
	}
}
