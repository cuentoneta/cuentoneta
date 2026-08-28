import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { type LiteraryWork } from '@models/literary-work.model';
import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { LiteraryWorkMetaTagsDirective } from './literary-work-meta-tags.directive';
import { LITERARY_WORK_HOST } from './literary-work-host';

describe('LiteraryWorkMetaTagsDirective', () => {
	const literaryWorkSignal = signal<LiteraryWork | undefined>(undefined);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new LiteraryWorkMetaTagsDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		literaryWorkSignal.set(undefined);
		TestBed.configureTestingModule({
			providers: [
				LiteraryWorkMetaTagsDirective,
				HeadMetadataDirective,
				{ provide: LITERARY_WORK_HOST, useValue: { literaryWork: literaryWorkSignal.asReadonly() } },
			],
		});
	});

	it('no setea meta tags mientras la obra es undefined', () => {
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).not.toHaveBeenCalled();
	});

	it.each(onoffLiteraryWorksMock)('setea el título con el byline para "$slug"', (literaryWork) => {
		literaryWorkSignal.set(literaryWork);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`${literaryWork.title} - ${literaryWork.authors[0].name}`),
		);
	});

	it.each(onoffLiteraryWorksMock)('setea la URL canónica de /read desde el slug de "$slug"', (literaryWork) => {
		literaryWorkSignal.set(literaryWork);
		const canonicalSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setCanonicalUrl');

		instantiate();
		TestBed.tick();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(`${AppRoutes.LiteraryWork}/${literaryWork.slug}`));
	});

	it('marca la página como indexable', () => {
		literaryWorkSignal.set(onoffLiteraryWorksMock[0]);
		const robotsSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setRobots');

		instantiate();
		TestBed.tick();

		expect(robotsSpy).toHaveBeenCalledWith('index, follow');
	});
});
