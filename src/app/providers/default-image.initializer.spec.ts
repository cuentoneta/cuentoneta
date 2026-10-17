import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';

import { applyDefaultImage } from './default-image.initializer';

describe('applyDefaultImage', () => {
	let meta: Meta;
	let document: Document;

	beforeEach(() => {
		meta = TestBed.inject(Meta);
		document = TestBed.inject(DOCUMENT);
	});

	afterEach(() => {
		meta.removeTag('property="og:image"');
		meta.removeTag('property="og:image:alt"');
		meta.removeTag('name="twitter:image"');
	});

	it('should point og:image and twitter:image to the default image on the host serving the build', () => {
		const expectedUrl = 'https://cuentoneta-git-feat-preview.vercel.app/assets/img/og-default.jpg';

		applyDefaultImage(meta, 'https://cuentoneta-git-feat-preview.vercel.app/');

		expect(meta.getTag('property="og:image"')?.content).toBe(expectedUrl);
		expect(meta.getTag('name="twitter:image"')?.content).toBe(expectedUrl);
		expect(meta.getTag('property="og:image:alt"')?.content).toBe('Logo de La Cuentoneta');
	});

	it('should emit a root-relative URL when the build has no absolute host', () => {
		applyDefaultImage(meta, '/');

		expect(meta.getTag('property="og:image"')?.content).toBe('/assets/img/og-default.jpg');
		expect(meta.getTag('name="twitter:image"')?.content).toBe('/assets/img/og-default.jpg');
	});

	it('should keep a single tag of each kind when applied twice', () => {
		applyDefaultImage(meta, 'https://www.cuentoneta.ar/');
		applyDefaultImage(meta, 'https://www.cuentoneta.ar/');

		expect(document.head.querySelectorAll('meta[property="og:image"]')).toHaveLength(1);
		expect(document.head.querySelectorAll('meta[name="twitter:image"]')).toHaveLength(1);
	});
});
