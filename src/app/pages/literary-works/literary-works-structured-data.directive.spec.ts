import { clearAllMocks } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { signal } from '@angular/core';

import { onoffLiteraryWorkCatalogEntriesMock } from '@mocks/onoff-literary-work-catalog-entries.mock';
import type { LiteraryWorkCatalogEntry } from '@models/literary-work.model';
import { LiteraryWorksStructuredData } from './literary-works-structured-data.directive';
import { LITERARY_WORKS_HOST } from './literary-works-host';

describe('LiteraryWorksStructuredData', () => {
	const entriesSignal = signal<readonly LiteraryWorkCatalogEntry[]>([]);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new LiteraryWorksStructuredData());
	}

	beforeEach(() => {
		clearAllMocks();
		entriesSignal.set([]);
		TestBed.configureTestingModule({
			providers: [
				LiteraryWorksStructuredData,
				{ provide: LITERARY_WORKS_HOST, useValue: { entries: entriesSignal.asReadonly() } },
			],
		});
	});

	afterEach(() => {
		TestBed.inject(DOCUMENT)
			.head.querySelectorAll('script[data-schema-id]')
			.forEach((el) => el.remove());
	});

	it('should emit the breadcrumb but not the CollectionPage while the catalogue is empty', () => {
		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="literary-work-catalog"]')).toBeNull();
		expect(
			JSON.parse(head.querySelector('script[data-schema-id="breadcrumb-literary-work-catalog"]')?.textContent ?? '{}'),
		).toMatchObject({ '@type': 'BreadcrumbList' });
	});

	it('should emit the CollectionPage and breadcrumb JSON-LD when the catalogue resolves', () => {
		entriesSignal.set(onoffLiteraryWorkCatalogEntriesMock);

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(
			JSON.parse(head.querySelector('script[data-schema-id="literary-work-catalog"]')?.textContent ?? '{}'),
		).toMatchObject({ '@type': 'CollectionPage' });
		expect(
			JSON.parse(head.querySelector('script[data-schema-id="breadcrumb-literary-work-catalog"]')?.textContent ?? '{}'),
		).toMatchObject({ '@type': 'BreadcrumbList' });
	});

	// El catálogo llega después de la instanciación al navegar dentro de la aplicación. Si la lectura
	// del host quedara dentro del `untracked()`, el efecto no volvería a correr y la página se serviría
	// sin JSON-LD, con el resto de los casos igual de verdes.
	it('should emit once the catalogue resolves after it was instantiated', () => {
		instantiate();
		TestBed.tick();
		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="literary-work-catalog"]')).toBeNull();

		entriesSignal.set(onoffLiteraryWorkCatalogEntriesMock);
		TestBed.tick();

		expect(head.querySelector('script[data-schema-id="literary-work-catalog"]')).not.toBeNull();
	});

	it('should not emit under the schema ids the collection catalogue uses', () => {
		entriesSignal.set(onoffLiteraryWorkCatalogEntriesMock);

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="collection-catalog"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-collection-catalog"]')).toBeNull();
	});

	it('should remove both JSON-LD blocks when destroyed', () => {
		entriesSignal.set(onoffLiteraryWorkCatalogEntriesMock);
		instantiate();
		TestBed.tick();
		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="literary-work-catalog"]')).not.toBeNull();

		TestBed.resetTestingModule();

		expect(head.querySelector('script[data-schema-id="literary-work-catalog"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-literary-work-catalog"]')).toBeNull();
	});
});
