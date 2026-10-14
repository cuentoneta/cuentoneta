import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { HeadMetadata } from '../../directives/head-metadata.directive';
import { AuthorsMetaTags } from './authors-meta-tags.directive';

describe('AuthorsMetaTags', () => {
	function instantiate(): void {
		TestBed.runInInjectionContext(() => new AuthorsMetaTags());
	}

	beforeEach(() => {
		clearAllMocks();
		TestBed.configureTestingModule({
			providers: [AuthorsMetaTags, HeadMetadata],
		});
	});

	it('should set the title without waiting for any data', () => {
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith(expect.stringContaining('Autores'));
	});

	it('should set the canonical URL of the index', () => {
		const canonicalSpy = spyOn(TestBed.inject(HeadMetadata), 'setCanonicalUrl');

		instantiate();
		TestBed.tick();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(AppRoutes.Authors));
	});

	it('should declare the page as indexable', () => {
		const robotsSpy = spyOn(TestBed.inject(HeadMetadata), 'setRobots');

		instantiate();
		TestBed.tick();

		expect(robotsSpy).toHaveBeenCalledWith('index, follow');
	});

	it('should set a description of its own', () => {
		const descriptionSpy = spyOn(TestBed.inject(HeadMetadata), 'setDescription');

		instantiate();
		TestBed.tick();

		expect(descriptionSpy).toHaveBeenCalledWith(expect.stringContaining('autores'));
	});

	it('should set keywords', () => {
		const keywordsSpy = spyOn(TestBed.inject(HeadMetadata), 'setKeywords');

		instantiate();
		TestBed.tick();

		expect(keywordsSpy).toHaveBeenCalledWith(expect.arrayContaining(['autores']));
	});
});
