import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';

import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { HomeSeoDirective } from './home-seo.directive';

describe('HomeSeoDirective', () => {
	let meta: HeadMetadataDirective;

	beforeEach(() => {
		clearAllMocks();
		TestBed.configureTestingModule({
			providers: [HomeSeoDirective, HeadMetadataDirective],
		});
		meta = TestBed.inject(HeadMetadataDirective);
	});

	it('should apply the home meta tags', () => {
		const titleSpy = spyOn(meta, 'setExactTitle');
		const descriptionSpy = spyOn(meta, 'setDefaultDescription');
		const keywordsSpy = spyOn(meta, 'setKeywords');
		const canonicalSpy = spyOn(meta, 'setCanonicalUrl');
		const robotsSpy = spyOn(meta, 'setRobots');

		TestBed.runInInjectionContext(() => new HomeSeoDirective());
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith('Cuentos y relatos breves para leer en línea | La Cuentoneta');
		expect(descriptionSpy).toHaveBeenCalled();
		expect(keywordsSpy).toHaveBeenCalledWith(expect.arrayContaining(['relatos breves', 'colecciones de cuentos']));
		expect(canonicalSpy).toHaveBeenCalled();
		expect(robotsSpy).toHaveBeenCalledWith('index, follow');
	});
});
