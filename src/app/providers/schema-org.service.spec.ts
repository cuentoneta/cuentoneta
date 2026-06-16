import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SchemaOrgService } from './schema-org.service';

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
		service.setJsonLd('organization', { '@type': 'Organization', name: 'La Cuentoneta' });

		const script = scriptFor('organization');
		expect(script).not.toBeNull();
		expect(script?.type).toBe('application/ld+json');
		expect(JSON.parse(script?.textContent ?? '{}')).toEqual({ '@type': 'Organization', name: 'La Cuentoneta' });
	});

	it('should reuse the same script on repeated calls (idempotent by id)', () => {
		service.setJsonLd('website', { '@type': 'WebSite', name: 'A' });
		service.setJsonLd('website', { '@type': 'WebSite', name: 'B' });

		expect(document.head.querySelectorAll('script[data-schema-id="website"]')).toHaveLength(1);
		expect(JSON.parse(scriptFor('website')?.textContent ?? '{}')).toEqual({ '@type': 'WebSite', name: 'B' });
	});

	it('should keep separate scripts per id', () => {
		service.setJsonLd('organization', { '@type': 'Organization' });
		service.setJsonLd('website', { '@type': 'WebSite' });

		expect(document.head.querySelectorAll('script[data-schema-id]')).toHaveLength(2);
	});

	it('should remove the script for the given id', () => {
		service.setJsonLd('organization', { '@type': 'Organization' });
		service.removeJsonLd('organization');

		expect(scriptFor('organization')).toBeNull();
	});

	it('should not throw when removing a missing id', () => {
		expect(() => service.removeJsonLd('missing')).not.toThrow();
	});
});
