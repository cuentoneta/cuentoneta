import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { HeadMetadata } from '../../directives/head-metadata.directive';
import { LiteraryWorksMetaTags } from './literary-works-meta-tags.directive';

describe('LiteraryWorksMetaTags', () => {
	function instantiate(): void {
		TestBed.runInInjectionContext(() => new LiteraryWorksMetaTags());
	}

	beforeEach(() => {
		clearAllMocks();
		TestBed.configureTestingModule({
			providers: [LiteraryWorksMetaTags, HeadMetadata],
		});
	});

	it('should set the title without waiting for any data', () => {
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith(expect.stringContaining('Obras'));
	});

	it('should set the canonical URL of the catalogue', () => {
		const canonicalSpy = spyOn(TestBed.inject(HeadMetadata), 'setCanonicalUrl');

		instantiate();
		TestBed.tick();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(AppRoutes.LiteraryWork));
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

		expect(descriptionSpy).toHaveBeenCalledWith(expect.stringContaining('obras'));
	});

	it('should set keywords', () => {
		const keywordsSpy = spyOn(TestBed.inject(HeadMetadata), 'setKeywords');

		instantiate();
		TestBed.tick();

		expect(keywordsSpy).toHaveBeenCalledWith(expect.arrayContaining(['obras']));
	});
});
