import { Directive, inject, untracked } from '@angular/core';

import { environment } from '../../environments/environment';
import { AbstractStructuredData } from '../../directives/abstract-structured-data.directive';
import { AUTHOR_HOST } from './author-host';
import { buildAuthorBreadcrumb, buildAuthorProfilePageSchema } from './author.schema';

@Directive({
	selector: '[cuentonetaAuthorStructuredData]',
})
export class AuthorStructuredData extends AbstractStructuredData {
	private readonly host = inject(AUTHOR_HOST);

	protected applyStructuredData(): void {
		const author = this.host.author();
		if (!author) {
			return;
		}
		untracked(() => {
			this.schemaOrg.setPageScopedJsonLd('profile-page', buildAuthorProfilePageSchema(author, environment.website));
			this.schemaOrg.setPageScopedJsonLd('breadcrumb-author', buildAuthorBreadcrumb(author, environment.website));
		});
	}

	protected removeStructuredData(): void {
		this.schemaOrg.removeJsonLd('profile-page');
		this.schemaOrg.removeJsonLd('breadcrumb-author');
	}
}
