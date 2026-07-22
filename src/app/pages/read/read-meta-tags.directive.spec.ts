import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { literaryWorkMock } from '@mocks/literary-work.mock';
import { type LiteraryWork } from '@models/literary-work.model';
import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { ReadMetaTagsDirective } from './read-meta-tags.directive';
import { READ_HOST } from './read-host';

describe('ReadMetaTagsDirective', () => {
	const literaryWorkSignal = signal<LiteraryWork | undefined>(undefined);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new ReadMetaTagsDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		literaryWorkSignal.set(undefined);
		TestBed.configureTestingModule({
			providers: [
				ReadMetaTagsDirective,
				HeadMetadataDirective,
				{ provide: READ_HOST, useValue: { literaryWork: literaryWorkSignal.asReadonly() } },
			],
		});
	});

	it('should not set meta tags while the literary work is undefined', () => {
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).not.toHaveBeenCalled();
	});

	it('should set the title with the multi-author byline when the work resolves', () => {
		literaryWorkSignal.set(literaryWorkMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`${literaryWorkMock.title} - ${literaryWorkMock.authors[0].name}`),
		);
	});

	it('should set the canonical URL of /read from the work slug', () => {
		literaryWorkSignal.set(literaryWorkMock);
		const canonicalSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setCanonicalUrl');

		instantiate();
		TestBed.tick();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(`${AppRoutes.Read}/${literaryWorkMock.slug}`));
	});

	it('should mark the page as indexable', () => {
		literaryWorkSignal.set(literaryWorkMock);
		const robotsSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setRobots');

		instantiate();
		TestBed.tick();

		expect(robotsSpy).toHaveBeenCalledWith('index, follow');
	});
});
