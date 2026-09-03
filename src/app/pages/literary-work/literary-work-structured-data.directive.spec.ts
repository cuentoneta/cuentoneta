import { clearAllMocks } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { signal } from '@angular/core';

import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { type LiteraryWork } from '@models/literary-work.model';
import { LiteraryWorkStructuredDataDirective } from './literary-work-structured-data.directive';
import { LITERARY_WORK_HOST } from './literary-work-host';

describe('LiteraryWorkStructuredDataDirective', () => {
	const literaryWorkSignal = signal<LiteraryWork | undefined>(undefined);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new LiteraryWorkStructuredDataDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		literaryWorkSignal.set(undefined);
		TestBed.configureTestingModule({
			providers: [
				LiteraryWorkStructuredDataDirective,
				{ provide: LITERARY_WORK_HOST, useValue: { literaryWork: literaryWorkSignal.asReadonly() } },
			],
		});
	});

	afterEach(() => {
		TestBed.inject(DOCUMENT)
			.head.querySelectorAll('script[data-schema-id]')
			.forEach((el) => el.remove());
	});

	it('no emite JSON-LD mientras la obra es undefined', () => {
		instantiate();
		TestBed.tick();

		expect(TestBed.inject(DOCUMENT).head.querySelector('script[data-schema-id="article"]')).toBeNull();
	});

	it.each(onoffLiteraryWorksMock)('emite el Article y el breadcrumb cuando resuelve "$slug"', (literaryWork) => {
		literaryWorkSignal.set(literaryWork);

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(JSON.parse(head.querySelector('script[data-schema-id="article"]')?.textContent ?? '{}')).toMatchObject({
			'@type': 'Article',
		});
		expect(
			JSON.parse(head.querySelector('script[data-schema-id="breadcrumb-literary-work"]')?.textContent ?? '{}'),
		).toMatchObject({ '@type': 'BreadcrumbList' });
	});

	it('remueve ambos bloques JSON-LD al destruirse', () => {
		literaryWorkSignal.set(onoffLiteraryWorksMock[0]);
		instantiate();
		TestBed.tick();
		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="article"]')).not.toBeNull();

		TestBed.resetTestingModule();

		expect(head.querySelector('script[data-schema-id="article"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-literary-work"]')).toBeNull();
	});
});
