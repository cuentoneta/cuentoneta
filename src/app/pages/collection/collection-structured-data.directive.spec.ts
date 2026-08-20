import { clearAllMocks } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { signal } from '@angular/core';

import { geometriasDelDesveloCollectionMock } from '@mocks/onoff-collections.mock';
import { type Collection } from '@models/collection.model';
import { CollectionStructuredDataDirective } from './collection-structured-data.directive';
import { COLLECTION_HOST } from './collection-host';

describe('CollectionStructuredDataDirective', () => {
	const collectionSignal = signal<Collection | undefined>(undefined);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new CollectionStructuredDataDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		collectionSignal.set(undefined);
		TestBed.configureTestingModule({
			providers: [
				CollectionStructuredDataDirective,
				{ provide: COLLECTION_HOST, useValue: { collection: collectionSignal.asReadonly() } },
			],
		});
	});

	afterEach(() => {
		TestBed.inject(DOCUMENT)
			.head.querySelectorAll('script[data-schema-id]')
			.forEach((el) => el.remove());
	});

	it('should not emit JSON-LD while the collection is undefined', () => {
		instantiate();
		TestBed.tick();

		expect(TestBed.inject(DOCUMENT).head.querySelector('script[data-schema-id="collection-page"]')).toBeNull();
	});

	it('should emit the CollectionPage and breadcrumb JSON-LD when the collection resolves', () => {
		collectionSignal.set(geometriasDelDesveloCollectionMock);

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(
			JSON.parse(head.querySelector('script[data-schema-id="collection-page"]')?.textContent ?? '{}'),
		).toMatchObject({ '@type': 'CollectionPage' });
		expect(
			JSON.parse(head.querySelector('script[data-schema-id="breadcrumb-collection"]')?.textContent ?? '{}'),
		).toMatchObject({ '@type': 'BreadcrumbList' });
	});

	// La página de storylist emite su propio bloque bajo `collection`. Que los ids no se pisen es lo
	// que permite distinguirlos mientras las dos rutas convivan.
	it('should not emit under the schema id the storylist page uses', () => {
		collectionSignal.set(geometriasDelDesveloCollectionMock);

		instantiate();
		TestBed.tick();

		expect(TestBed.inject(DOCUMENT).head.querySelector('script[data-schema-id="collection"]')).toBeNull();
	});

	it('should remove both JSON-LD blocks when destroyed', () => {
		collectionSignal.set(geometriasDelDesveloCollectionMock);
		instantiate();
		TestBed.tick();
		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="collection-page"]')).not.toBeNull();

		TestBed.resetTestingModule();

		expect(head.querySelector('script[data-schema-id="collection-page"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-collection"]')).toBeNull();
	});
});
