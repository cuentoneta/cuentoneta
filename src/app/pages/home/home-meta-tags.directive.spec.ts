import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { HeadMetadata } from '../../directives/head-metadata.directive';
import { HomeMetaTags } from './home-meta-tags.directive';

describe('HomeMetaTags', () => {
	let head: HeadMetadata;

	beforeEach(() => {
		clearAllMocks();
		TestBed.configureTestingModule({
			providers: [HomeMetaTags, HeadMetadata],
		});
		head = TestBed.inject(HeadMetadata);
	});

	it('should apply the static home meta tags', () => {
		const titleSpy = spyOn(head, 'setExactTitle');
		const descriptionSpy = spyOn(head, 'setDefaultDescription');
		const keywordsSpy = spyOn(head, 'setKeywords');
		const canonicalSpy = spyOn(head, 'setCanonicalUrl');
		const robotsSpy = spyOn(head, 'setRobots');

		TestBed.runInInjectionContext(() => new HomeMetaTags());
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith('Cuentos y relatos breves para leer en línea | La Cuentoneta');
		expect(descriptionSpy).toHaveBeenCalled();
		expect(keywordsSpy).toHaveBeenCalledWith(expect.arrayContaining(['relatos breves', 'colecciones de cuentos']));
		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(AppRoutes.Home));
		expect(robotsSpy).toHaveBeenCalledWith('index, follow');
	});
});
