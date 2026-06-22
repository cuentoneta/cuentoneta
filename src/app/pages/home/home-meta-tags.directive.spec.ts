import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';

import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { HomeMetaTagsDirective } from './home-meta-tags.directive';

describe('HomeMetaTagsDirective', () => {
	let head: HeadMetadataDirective;

	beforeEach(() => {
		clearAllMocks();
		TestBed.configureTestingModule({
			providers: [HomeMetaTagsDirective, HeadMetadataDirective],
		});
		head = TestBed.inject(HeadMetadataDirective);
	});

	it('should apply the static home meta tags', () => {
		const titleSpy = spyOn(head, 'setExactTitle');
		const descriptionSpy = spyOn(head, 'setDefaultDescription');
		const keywordsSpy = spyOn(head, 'setKeywords');
		const canonicalSpy = spyOn(head, 'setCanonicalUrl');
		const robotsSpy = spyOn(head, 'setRobots');

		TestBed.runInInjectionContext(() => new HomeMetaTagsDirective());
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith('Cuentos y relatos breves para leer en línea | La Cuentoneta');
		expect(descriptionSpy).toHaveBeenCalled();
		expect(keywordsSpy).toHaveBeenCalledWith(expect.arrayContaining(['relatos breves', 'colecciones de cuentos']));
		expect(canonicalSpy).toHaveBeenCalled();
		expect(robotsSpy).toHaveBeenCalledWith('index, follow');
	});
});
