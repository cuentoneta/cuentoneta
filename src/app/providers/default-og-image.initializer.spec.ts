import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';

import { applyDefaultOgImage } from './default-og-image.initializer';

describe('applyDefaultOgImage', () => {
	let meta: Meta;
	let document: Document;

	beforeEach(() => {
		meta = TestBed.inject(Meta);
		document = TestBed.inject(DOCUMENT);
	});

	afterEach(() => {
		meta.removeTag('property="og:image"');
		meta.removeTag('property="og:image:alt"');
	});

	it('should point og:image to the default image on the host serving the build', () => {
		applyDefaultOgImage(meta, 'https://cuentoneta-git-feat-preview.vercel.app/');

		expect(meta.getTag('property="og:image"')?.content).toBe(
			'https://cuentoneta-git-feat-preview.vercel.app/assets/img/og-default.jpg',
		);
		expect(meta.getTag('property="og:image:alt"')?.content).toBe('Logo de La Cuentoneta');
	});

	it('should emit a root-relative URL when the build has no absolute host', () => {
		applyDefaultOgImage(meta, '/');

		expect(meta.getTag('property="og:image"')?.content).toBe('/assets/img/og-default.jpg');
	});

	it('should keep a single og:image when applied twice', () => {
		applyDefaultOgImage(meta, 'https://www.cuentoneta.ar/');
		applyDefaultOgImage(meta, 'https://www.cuentoneta.ar/');

		expect(document.head.querySelectorAll('meta[property="og:image"]')).toHaveLength(1);
	});
});
