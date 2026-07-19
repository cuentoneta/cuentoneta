import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { applySiteSchema, buildOrganizationSchema, buildWebSiteSchema } from './schema-org.initializer';
import { SchemaOrgService } from './schema-org.service';

describe('schema-org builders', () => {
	// `environment.website` llega con barra final en producción; los builders deben normalizarla.
	const websiteUrl = 'https://www.cuentoneta.ar/';

	describe('buildOrganizationSchema', () => {
		it('should build an Organization normalizing the trailing slash into clean url and logo', () => {
			const schema = buildOrganizationSchema(websiteUrl);

			expect(schema).toMatchObject({
				'@context': 'https://schema.org',
				'@type': 'Organization',
				name: 'La Cuentoneta',
				url: 'https://www.cuentoneta.ar',
				logo: 'https://www.cuentoneta.ar/assets/svg/logo.svg',
			});
		});

		it('should expose the official social profiles (matching the footer) in sameAs', () => {
			expect(buildOrganizationSchema(websiteUrl)).toMatchObject({
				sameAs: [
					'https://twitter.com/cuentoneta',
					'https://www.instagram.com/cuentoneta',
					'https://www.facebook.com/cuentoneta',
				],
			});
		});
	});

	describe('buildWebSiteSchema', () => {
		it('should build a WebSite entity in es-AR with a normalized url', () => {
			expect(buildWebSiteSchema(websiteUrl)).toMatchObject({
				'@context': 'https://schema.org',
				'@type': 'WebSite',
				name: 'La Cuentoneta',
				url: 'https://www.cuentoneta.ar',
				inLanguage: 'es-AR',
			});
		});
	});
});

describe('applySiteSchema', () => {
	let service: SchemaOrgService;
	let document: Document;

	beforeEach(() => {
		service = TestBed.inject(SchemaOrgService);
		document = TestBed.inject(DOCUMENT);
	});

	afterEach(() => {
		document.head.querySelectorAll('script[data-schema-id]').forEach((element) => element.remove());
	});

	it('should inject the organization and website blocks into the head', () => {
		applySiteSchema(service, 'https://cuentoneta.ar/');

		const ids = Array.from(document.head.querySelectorAll('script[data-schema-id]')).map((element) =>
			element.getAttribute('data-schema-id'),
		);
		expect(ids).toEqual(['organization', 'website']);
	});

	it('should remain idempotent when applied twice (app-shell renders AppComponent twice)', () => {
		applySiteSchema(service, 'https://cuentoneta.ar/');
		applySiteSchema(service, 'https://cuentoneta.ar/');

		expect(document.head.querySelectorAll('script[data-schema-id]')).toHaveLength(2);
	});
});
