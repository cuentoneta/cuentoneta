import { clearAllMocks } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { signal } from '@angular/core';

import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { type LiteraryWorkTeaser } from '@models/literary-work.model';
import { LiteraryWorksStructuredDataDirective } from './literary-works-structured-data.directive';
import { LITERARY_WORKS_HOST } from './literary-works-host';

describe('LiteraryWorksStructuredDataDirective', () => {
	const literaryWorksSignal = signal<readonly LiteraryWorkTeaser[]>([]);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new LiteraryWorksStructuredDataDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		literaryWorksSignal.set([]);
		TestBed.configureTestingModule({
			providers: [
				LiteraryWorksStructuredDataDirective,
				{ provide: LITERARY_WORKS_HOST, useValue: { literaryWorks: literaryWorksSignal.asReadonly() } },
			],
		});
	});

	afterEach(() => {
		TestBed.inject(DOCUMENT)
			.head.querySelectorAll('script[data-schema-id]')
			.forEach((el) => el.remove());
	});

	it('should not emit JSON-LD while the catalogue is empty', () => {
		instantiate();
		TestBed.tick();

		expect(TestBed.inject(DOCUMENT).head.querySelector('script[data-schema-id="literary-work-catalog"]')).toBeNull();
	});

	it('should emit the CollectionPage and breadcrumb JSON-LD when the catalogue resolves', () => {
		literaryWorksSignal.set(onoffLiteraryWorkTeasersMock);

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

	it('should not emit under the schema ids the collection catalogue uses', () => {
		literaryWorksSignal.set(onoffLiteraryWorkTeasersMock);

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="collection-catalog"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-collection-catalog"]')).toBeNull();
	});

	it('should remove both JSON-LD blocks when destroyed', () => {
		literaryWorksSignal.set(onoffLiteraryWorkTeasersMock);
		instantiate();
		TestBed.tick();
		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="literary-work-catalog"]')).not.toBeNull();

		TestBed.resetTestingModule();

		expect(head.querySelector('script[data-schema-id="literary-work-catalog"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-literary-work-catalog"]')).toBeNull();
	});
});
