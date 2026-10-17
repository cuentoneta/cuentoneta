import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { authorMock } from '@mocks/author.mock';
import { onoffImageAssets } from '@mocks/onoff-image-assets.mock';
import type { AuthorProfile } from '@models/author.model';
import { cdnUrlFor } from '@testing/sanity-cdn-url';
import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { buildAuthorMetaDescription } from '@app-utils/meta-description.util';
import { HeadMetadata } from '../../directives/head-metadata.directive';
import { AuthorMetaTags } from './author-meta-tags.directive';
import { AUTHOR_HOST } from './author-host';

describe('AuthorMetaTags', () => {
	const authorSignal = signal<AuthorProfile | undefined>(undefined);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new AuthorMetaTags());
	}

	beforeEach(() => {
		clearAllMocks();
		authorSignal.set(undefined);
		TestBed.configureTestingModule({
			providers: [
				AuthorMetaTags,
				HeadMetadata,
				{ provide: AUTHOR_HOST, useValue: { author: authorSignal.asReadonly() } },
			],
		});
	});

	it('should not set meta tags while the author is undefined', () => {
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).not.toHaveBeenCalled();
	});

	it('should set the title from the author name when it resolves', () => {
		authorSignal.set(authorMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith(expect.stringContaining(authorMock.name));
	});

	it('should set the canonical URL from the author slug via buildCanonicalUrl', () => {
		authorSignal.set(authorMock);
		const canonicalSpy = spyOn(TestBed.inject(HeadMetadata), 'setCanonicalUrl');

		instantiate();
		TestBed.tick();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(`${AppRoutes.Author}/${authorMock.slug}`));
	});

	it('should set the description from the biography', () => {
		authorSignal.set(authorMock);
		const descriptionSpy = spyOn(TestBed.inject(HeadMetadata), 'setDescription');

		instantiate();
		TestBed.tick();

		expect(descriptionSpy).toHaveBeenCalledWith(buildAuthorMetaDescription(authorMock));
	});

	it.each([
		{ portrait: 'large', imageUrl: cdnUrlFor(onoffImageAssets.francoisOnoffPortrait) },
		// Sin piso de tamaño: un retrato chico es mejor señal que la imagen genérica del sitio.
		{ portrait: 'small', imageUrl: cdnUrlFor(onoffImageAssets.franceFlag) },
	])('should set the representative image to the JPG of a $portrait raster portrait', ({ imageUrl }) => {
		authorSignal.set({ ...authorMock, imageUrl });
		const imageSpy = spyOn(TestBed.inject(HeadMetadata), 'setRepresentativeImage');

		instantiate();
		TestBed.tick();

		expect(imageSpy).toHaveBeenCalledWith(`${imageUrl}?fm=jpg`);
	});

	it.each([
		{ portrait: 'an SVG', imageUrl: cdnUrlFor(onoffImageAssets.francoisOnoffPortrait).replace(/\.png$/, '.svg') },
		{ portrait: 'no', imageUrl: '' },
	])('should reset the image to the site default when the author has $portrait portrait', ({ imageUrl }) => {
		authorSignal.set({ ...authorMock, imageUrl });
		const head = TestBed.inject(HeadMetadata);
		const imageSpy = spyOn(head, 'setRepresentativeImage');
		const removeImageSpy = spyOn(head, 'removeImage');

		instantiate();
		TestBed.tick();

		expect(imageSpy).not.toHaveBeenCalled();
		expect(removeImageSpy).toHaveBeenCalled();
	});

	it('should re-apply the meta tags when the author signal changes', () => {
		authorSignal.set(authorMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');
		instantiate();
		TestBed.tick();

		authorSignal.set({ ...authorMock, name: 'Otra Autora' });
		TestBed.tick();

		expect(titleSpy).toHaveBeenLastCalledWith(expect.stringContaining('Otra Autora'));
	});
});
