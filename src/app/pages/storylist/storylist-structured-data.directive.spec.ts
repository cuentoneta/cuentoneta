import { clearAllMocks } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { signal } from '@angular/core';

import { storylistMock } from '@mocks/storylist.mock';
import { type Storylist } from '@models/storylist.model';
import { StorylistStructuredDataDirective } from './storylist-structured-data.directive';
import { STORYLIST_HOST } from './storylist-host';

describe('StorylistStructuredDataDirective', () => {
	const storylistSignal = signal<Storylist | undefined>(undefined);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new StorylistStructuredDataDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		storylistSignal.set(undefined);
		TestBed.configureTestingModule({
			providers: [
				StorylistStructuredDataDirective,
				{ provide: STORYLIST_HOST, useValue: { storylist: storylistSignal.asReadonly() } },
			],
		});
	});

	afterEach(() => {
		TestBed.inject(DOCUMENT)
			.head.querySelectorAll('script[data-schema-id]')
			.forEach((el) => el.remove());
	});

	it('should not emit JSON-LD while the storylist is undefined', () => {
		instantiate();
		TestBed.tick();

		expect(TestBed.inject(DOCUMENT).head.querySelector('script[data-schema-id="collection"]')).toBeNull();
	});

	it('should emit the CollectionPage and breadcrumb JSON-LD when the storylist resolves', () => {
		storylistSignal.set(storylistMock);

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(JSON.parse(head.querySelector('script[data-schema-id="collection"]')?.textContent ?? '{}')).toMatchObject({
			'@type': 'CollectionPage',
		});
		expect(
			JSON.parse(head.querySelector('script[data-schema-id="breadcrumb-storylist"]')?.textContent ?? '{}'),
		).toMatchObject({ '@type': 'BreadcrumbList' });
	});

	it('should remove both JSON-LD blocks when destroyed', () => {
		storylistSignal.set(storylistMock);
		instantiate();
		TestBed.tick();
		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="collection"]')).not.toBeNull();

		TestBed.resetTestingModule();

		expect(head.querySelector('script[data-schema-id="collection"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-storylist"]')).toBeNull();
	});
});
