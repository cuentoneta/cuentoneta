import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { LiteraryWorksMetaTagsDirective } from './literary-works-meta-tags.directive';

describe('LiteraryWorksMetaTagsDirective', () => {
	function instantiate(): void {
		TestBed.runInInjectionContext(() => new LiteraryWorksMetaTagsDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		TestBed.configureTestingModule({
			providers: [LiteraryWorksMetaTagsDirective, HeadMetadataDirective],
		});
	});

	it('should set the title without waiting for any data', () => {
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith(expect.stringContaining('Obras'));
	});

	it('should set the canonical URL of the catalogue', () => {
		const canonicalSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setCanonicalUrl');

		instantiate();
		TestBed.tick();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(AppRoutes.LiteraryWork));
	});

	it('should declare the page as indexable', () => {
		const robotsSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setRobots');

		instantiate();
		TestBed.tick();

		expect(robotsSpy).toHaveBeenCalledWith('index, follow');
	});

	it('should set a description of its own', () => {
		const descriptionSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setDescription');

		instantiate();
		TestBed.tick();

		expect(descriptionSpy).toHaveBeenCalledWith(expect.stringContaining('obras'));
	});

	it('should set keywords', () => {
		const keywordsSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setKeywords');

		instantiate();
		TestBed.tick();

		expect(keywordsSpy).toHaveBeenCalledWith(expect.arrayContaining(['obras']));
	});
});
