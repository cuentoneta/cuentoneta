import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import type { LiteraryWork } from '@models/literary-work.model';
import { cdnUrlForCorpusPath } from '@testing/sanity-cdn-url';
import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { buildLiteraryWorkMetaDescription } from '@app-utils/meta-description.util';
import { HeadMetadata } from '../../directives/head-metadata.directive';
import { LiteraryWorkMetaTags } from './literary-work-meta-tags.directive';
import { LITERARY_WORK_HOST } from './literary-work-host';

describe('LiteraryWorkMetaTags', () => {
	const literaryWorkSignal = signal<LiteraryWork | undefined>(undefined);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new LiteraryWorkMetaTags());
	}

	beforeEach(() => {
		clearAllMocks();
		literaryWorkSignal.set(undefined);
		TestBed.configureTestingModule({
			providers: [
				LiteraryWorkMetaTags,
				HeadMetadata,
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

	it.each(onoffLiteraryWorksMock)('setea la URL canónica de la obra desde el slug de "$slug"', (literaryWork) => {
		literaryWorkSignal.set(literaryWork);
		const canonicalSpy = spyOn(TestBed.inject(HeadMetadata), 'setCanonicalUrl');

		instantiate();
		TestBed.tick();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(`${AppRoutes.LiteraryWork}/${literaryWork.slug}`));
	});

	it.each(onoffLiteraryWorksMock)('setea la descripción desde el cuerpo de "$slug"', (literaryWork) => {
		literaryWorkSignal.set(literaryWork);
		const descriptionSpy = spyOn(TestBed.inject(HeadMetadata), 'setDescription');

		instantiate();
		TestBed.tick();

		expect(descriptionSpy).toHaveBeenCalledWith(buildLiteraryWorkMetaDescription(literaryWork));
	});

	it.each(onoffLiteraryWorksMock)('setea la imagen representativa con el JPG de la portada raster de "$slug"', (literaryWork) => {
		const coverImage = cdnUrlForCorpusPath(literaryWork.coverImage);
		literaryWorkSignal.set({ ...literaryWork, coverImage });
		const imageSpy = spyOn(TestBed.inject(HeadMetadata), 'setRepresentativeImage');

		instantiate();
		TestBed.tick();

		expect(imageSpy).toHaveBeenCalledWith(`${coverImage}?fm=jpg`);
	});

	it.each([
		{
			cover: 'una portada SVG',
			toCover: (literaryWork: LiteraryWork) => cdnUrlForCorpusPath(literaryWork.coverImage).replace(/\.\w+$/, '.svg'),
		},
		{ cover: 'sin portada', toCover: () => '' },
	])('repone la imagen por defecto con $cover', ({ toCover }) => {
		const [literaryWork] = onoffLiteraryWorksMock;
		literaryWorkSignal.set({ ...literaryWork, coverImage: toCover(literaryWork) });
		const head = TestBed.inject(HeadMetadata);
		const imageSpy = spyOn(head, 'setRepresentativeImage');
		const removeImageSpy = spyOn(head, 'removeImage');

		instantiate();
		TestBed.tick();

		expect(imageSpy).not.toHaveBeenCalled();
		expect(removeImageSpy).toHaveBeenCalled();
	});

	it('marca la página como indexable', () => {
		literaryWorkSignal.set(onoffLiteraryWorksMock[0]);
		const robotsSpy = spyOn(TestBed.inject(HeadMetadata), 'setRobots');

		instantiate();
		TestBed.tick();

		expect(robotsSpy).toHaveBeenCalledWith('index, follow');
	});
});
