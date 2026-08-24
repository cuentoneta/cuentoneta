import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SchemaOrgService } from './schema-org.service';

const CONTEXT = 'https://schema.org';

describe('SchemaOrgService', () => {
	let service: SchemaOrgService;
	let document: Document;

	const scriptFor = (id: string) => document.head.querySelector<HTMLScriptElement>(`script[data-schema-id="${id}"]`);

	beforeEach(() => {
		service = TestBed.inject(SchemaOrgService);
		document = TestBed.inject(DOCUMENT);
	});

	afterEach(() => {
		document.head.querySelectorAll('script[data-schema-id]').forEach((element) => element.remove());
	});

	it('should insert a JSON-LD script with the schema serialized', () => {
		service.setJsonLd('organization', { '@context': CONTEXT, '@type': 'Organization', name: 'La Cuentoneta' });

		const script = scriptFor('organization');
		expect(script).not.toBeNull();
		expect(script?.type).toBe('application/ld+json');
		expect(JSON.parse(script?.textContent ?? '{}')).toEqual({
			'@context': CONTEXT,
			'@type': 'Organization',
			name: 'La Cuentoneta',
		});
	});

	it('should reuse the same script on repeated calls (idempotent by id)', () => {
		service.setJsonLd('website', { '@context': CONTEXT, '@type': 'WebSite', name: 'A' });
		service.setJsonLd('website', { '@context': CONTEXT, '@type': 'WebSite', name: 'B' });

		expect(document.head.querySelectorAll('script[data-schema-id="website"]')).toHaveLength(1);
		expect(JSON.parse(scriptFor('website')?.textContent ?? '{}')).toEqual({
			'@context': CONTEXT,
			'@type': 'WebSite',
			name: 'B',
		});
	});

	it('should keep separate scripts per id', () => {
		service.setJsonLd('organization', { '@context': CONTEXT, '@type': 'Organization' });
		service.setJsonLd('website', { '@context': CONTEXT, '@type': 'WebSite' });

		expect(document.head.querySelectorAll('script[data-schema-id]')).toHaveLength(2);
	});

	it('should not let one page cleanup remove another page block (per-page ids avoid the navigation race)', () => {
		// Navegación A→B: la ruta entrante setea su breadcrumb (id propio) antes de que la saliente
		// se destruya; el cleanup de la saliente solo borra el suyo, nunca el de la entrante.
		service.setJsonLd('breadcrumb-story', { '@context': CONTEXT, '@type': 'BreadcrumbList' });
		service.setJsonLd('breadcrumb-author', { '@context': CONTEXT, '@type': 'BreadcrumbList' });
		service.removeJsonLd('breadcrumb-story');

		expect(scriptFor('breadcrumb-author')).not.toBeNull();
		expect(scriptFor('breadcrumb-story')).toBeNull();
	});

	it('should remove the script for the given id', () => {
		service.setJsonLd('organization', { '@context': CONTEXT, '@type': 'Organization' });
		service.removeJsonLd('organization');

		expect(scriptFor('organization')).toBeNull();
	});

	it('should not throw when removing a missing id', () => {
		expect(() => service.removeJsonLd('missing')).not.toThrow();
	});

	describe('removePageScopedJsonLd', () => {
		it('should remove blocks set as page-scoped and leave sitewide intact', () => {
			service.setJsonLd('organization', { '@context': CONTEXT, '@type': 'Organization' });
			service.setJsonLd('website', { '@context': CONTEXT, '@type': 'WebSite' });
			service.setPageScopedJsonLd('article', { '@context': CONTEXT, '@type': 'Article' });
			service.setPageScopedJsonLd('collection', { '@context': CONTEXT, '@type': 'CollectionPage' });

			service.removePageScopedJsonLd();

			expect(scriptFor('organization')).not.toBeNull();
			expect(scriptFor('website')).not.toBeNull();
			expect(scriptFor('article')).toBeNull();
			expect(scriptFor('collection')).toBeNull();
		});

		it('should not throw when no page-scoped blocks are present', () => {
			expect(() => service.removePageScopedJsonLd()).not.toThrow();
		});
	});
});
