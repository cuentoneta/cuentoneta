import { Component, inject } from '@angular/core';

import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';

import { AppRoutes } from '../../app.routes';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';

@Component({
	selector: 'cuentoneta-literary-works',
	template: `
		<main class="mx-auto mt-header-height flex w-full max-w-310 flex-col gap-12 px-4 pt-8 pb-16">
			<h1 class="font-inter text-2xl leading-8 font-bold text-neutral-900">Obras</h1>
		</main>
	`,
	hostDirectives: [HeadMetadataDirective],
})
export default class LiteraryWorksPage {
	private readonly headMetadata = inject(HeadMetadataDirective);

	constructor() {
		this.headMetadata.setTitle('Obras');
		this.headMetadata.setDescription(
			'Explorá todas las obras publicadas en La Cuentoneta: cuentos, poemas y relatos breves para leer en línea.',
		);
		this.headMetadata.setCanonicalUrl(buildCanonicalUrl(AppRoutes.LiteraryWork));
		this.headMetadata.setRobots('noindex, follow');
	}
}
