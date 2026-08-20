import { clearAllMocks } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { signal } from '@angular/core';

import { onoffCollectionTeasersMock } from '@mocks/onoff-collections.mock';
import { type CollectionTeaser } from '@models/collection.model';
import { CollectionsStructuredDataDirective } from './collections-structured-data.directive';
import { COLLECTIONS_HOST } from './collections-host';

describe('CollectionsStructuredDataDirective', () => {
	const collectionsSignal = signal<readonly CollectionTeaser[]>([]);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new CollectionsStructuredDataDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		collectionsSignal.set([]);
		TestBed.configureTestingModule({
			providers: [
				CollectionsStructuredDataDirective,
				{ provide: COLLECTIONS_HOST, useValue: { collections: collectionsSignal.asReadonly() } },
			],
		});
	});

	afterEach(() => {
		TestBed.inject(DOCUMENT)
			.head.querySelectorAll('script[data-schema-id]')
			.forEach((el) => el.remove());
	});

	// Un listado de cero ítems describe un catálogo vacío, que dice algo falso sobre el sitio.
	it('should not emit JSON-LD while the catalogue is empty', () => {
		instantiate();
		TestBed.tick();

		expect(TestBed.inject(DOCUMENT).head.querySelector('script[data-schema-id="collection-catalog"]')).toBeNull();
	});

	it('should emit the CollectionPage and breadcrumb JSON-LD when the catalogue resolves', () => {
		collectionsSignal.set(onoffCollectionTeasersMock);

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(
			JSON.parse(head.querySelector('script[data-schema-id="collection-catalog"]')?.textContent ?? '{}'),
		).toMatchObject({ '@type': 'CollectionPage' });
		expect(
			JSON.parse(head.querySelector('script[data-schema-id="breadcrumb-collection-catalog"]')?.textContent ?? '{}'),
		).toMatchObject({ '@type': 'BreadcrumbList' });
	});

	// Los identificadores de la página de detalle son vecinos cercanos: que no se pisen es lo que permite
	// distinguir los dos bloques al mirar el HTML servido.
	it('should not emit under the schema ids the collection detail page uses', () => {
		collectionsSignal.set(onoffCollectionTeasersMock);

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="collection-page"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-collection"]')).toBeNull();
	});

	it('should remove both JSON-LD blocks when destroyed', () => {
		collectionsSignal.set(onoffCollectionTeasersMock);
		instantiate();
		TestBed.tick();
		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="collection-catalog"]')).not.toBeNull();

		TestBed.resetTestingModule();

		expect(head.querySelector('script[data-schema-id="collection-catalog"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-collection-catalog"]')).toBeNull();
	});
});
