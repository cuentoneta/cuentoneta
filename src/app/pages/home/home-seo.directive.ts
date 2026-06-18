import { Directive, effect, inject } from '@angular/core';

import { environment } from '../../environments/environment';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

@Directive({
	selector: '[cuentonetaHomeSeo]',
	hostDirectives: [MetaTagsDirective],
})
export class HomeSeoDirective {
	private readonly meta = inject(MetaTagsDirective);

	private readonly applyStaticSeo = effect(() => {
		this.meta.setExactTitle('Cuentos y relatos breves para leer en línea | La Cuentoneta');
		this.meta.setDefaultDescription();
		this.meta.setKeywords([
			'cuentos',
			'relatos breves',
			'literatura',
			'poemas',
			'narraciones',
			'lectura digital',
			'cuentos para leer',
			'literatura breve',
			'colecciones de cuentos',
			'leer en línea',
		]);
		this.meta.setCanonicalUrl(`${environment.website}`);
		this.meta.setRobots('index, follow');
	});
}
