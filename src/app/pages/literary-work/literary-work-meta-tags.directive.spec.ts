import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { onoffImageAssets } from '@mocks/onoff-image-assets.mock';
import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { type LiteraryWork } from '@models/literary-work.model';
import { cdnUrlFor } from '@testing/sanity-cdn-url';
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

	// La portada del corpus, servida desde el CDN como la sirve el ACL.
	function cdnCoverOf(literaryWork: LiteraryWork): string {
		const asset = Object.values(onoffImageAssets).find(({ path }) => path === literaryWork.coverImage);
		if (!asset) {
			throw new Error(`El corpus no declara el asset de la portada de "${literaryWork.slug}"`);
		}
		return cdnUrlFor(asset);
	}

	it.each(onoffLiteraryWorksMock)('setea og:image con el JPG de la portada raster de "$slug"', (literaryWork) => {
		const coverImage = cdnCoverOf(literaryWork);
		literaryWorkSignal.set({ ...literaryWork, coverImage });
		const ogImageSpy = spyOn(TestBed.inject(HeadMetadata), 'setOgImage');

		instantiate();
		TestBed.tick();

		expect(ogImageSpy).toHaveBeenCalledWith(`${coverImage}?fm=jpg`);
	});

	it.each([
		{
			cover: 'una portada SVG',
			toCover: (literaryWork: LiteraryWork) => cdnCoverOf(literaryWork).replace(/\.\w+$/, '.svg'),
		},
		{ cover: 'sin portada', toCover: () => '' },
	])('repone el og:image por defecto con $cover', ({ toCover }) => {
		const [literaryWork] = onoffLiteraryWorksMock;
		literaryWorkSignal.set({ ...literaryWork, coverImage: toCover(literaryWork) });
		const head = TestBed.inject(HeadMetadata);
		const ogImageSpy = spyOn(head, 'setOgImage');
		const removeImageSpy = spyOn(head, 'removeImage');

		instantiate();
		TestBed.tick();

		expect(ogImageSpy).not.toHaveBeenCalled();
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
