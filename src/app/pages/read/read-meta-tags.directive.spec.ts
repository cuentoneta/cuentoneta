import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { elOdioLiteraryWorkMock } from '@mocks/onoff/el-odio.mock';
import { type LiteraryWork } from '@models/literary-work.model';
import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
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

	it('no setea meta tags mientras la obra es undefined', () => {
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).not.toHaveBeenCalled();
	});

	it('setea el título con el byline multi-autor cuando la obra resuelve', () => {
		literaryWorkSignal.set(elOdioLiteraryWorkMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`${elOdioLiteraryWorkMock.title} - ${elOdioLiteraryWorkMock.authors[0].name}`),
		);
	});

	it('setea la URL canónica de /read desde el slug de la obra', () => {
		literaryWorkSignal.set(elOdioLiteraryWorkMock);
		const canonicalSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setCanonicalUrl');

		instantiate();
		TestBed.tick();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(`${AppRoutes.Read}/${elOdioLiteraryWorkMock.slug}`));
	});

	it('marca la página como indexable', () => {
		literaryWorkSignal.set(elOdioLiteraryWorkMock);
		const robotsSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setRobots');

		instantiate();
		TestBed.tick();

		expect(robotsSpy).toHaveBeenCalledWith('index, follow');
	});
});
