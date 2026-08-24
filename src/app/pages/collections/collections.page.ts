import { Component, inject } from '@angular/core';

import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';

import { HeadMetadataDirective } from '../../directives/head-metadata.directive';

@Component({
	selector: 'cuentoneta-collections',
	template: `
		<!-- El encabezado es fijo: sin el margen superior, la página arranca debajo de él. -->
		<main class="mx-auto mt-header-height flex w-full max-w-310 flex-col px-4 pt-8 pb-16">
			<h1 class="font-inter text-2xl leading-8 font-bold text-neutral-900">Colecciones</h1>
		</main>
	`,
	hostDirectives: [HeadMetadataDirective],
})
export default class CollectionsPage {
	private readonly metaTagsDirective = inject(HeadMetadataDirective);

	constructor() {
		this.updateMetaTags();
	}

	// Todavía no hay catálogo que mostrar. Se sirve `noindex` hasta que lo haya, para no gastar rastreo en
	// una página vacía ni arriesgar que quede indexada así; `follow` porque los enlaces que aparezcan sí
	// interesan.
	private updateMetaTags() {
		this.metaTagsDirective.setTitle('Colecciones');
		this.metaTagsDirective.setDefaultDescription();
		this.metaTagsDirective.setCanonicalUrl(buildCanonicalUrl('collection'));
		this.metaTagsDirective.setRobots('noindex, follow');
	}
}
