import { spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';

import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { HomeSeoDirective } from './home-seo.directive';

describe('HomeSeoDirective', () => {
	let meta: MetaTagsDirective;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [HomeSeoDirective, MetaTagsDirective],
		});
		meta = TestBed.inject(MetaTagsDirective);
	});

	it('should apply the home meta tags on construction', () => {
		const titleSpy = spyOn(meta, 'setTitle');
		const descriptionSpy = spyOn(meta, 'setDefaultDescription');
		const keywordsSpy = spyOn(meta, 'setKeywords');
		const canonicalSpy = spyOn(meta, 'setCanonicalUrl');
		const robotsSpy = spyOn(meta, 'setRobots');

		TestBed.runInInjectionContext(() => new HomeSeoDirective());

		expect(titleSpy).toHaveBeenCalledWith('Cuentos y relatos breves para leer en línea | La Cuentoneta', false);
		expect(descriptionSpy).toHaveBeenCalled();
		expect(keywordsSpy).toHaveBeenCalledWith(expect.arrayContaining(['relatos breves', 'colecciones de cuentos']));
		expect(canonicalSpy).toHaveBeenCalled();
		expect(robotsSpy).toHaveBeenCalledWith('index, follow');
	});
});
