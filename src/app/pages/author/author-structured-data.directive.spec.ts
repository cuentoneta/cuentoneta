import { clearAllMocks } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { signal } from '@angular/core';

import { authorMock } from '@mocks/author.mock';
import { type AuthorProfile } from '@models/author.model';
import { AuthorStructuredDataDirective } from './author-structured-data.directive';
import { AUTHOR_HOST } from './author-host';

describe('AuthorStructuredDataDirective', () => {
	const authorSignal = signal<AuthorProfile | undefined>(undefined);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new AuthorStructuredDataDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		authorSignal.set(undefined);
		TestBed.configureTestingModule({
			providers: [
				AuthorStructuredDataDirective,
				{ provide: AUTHOR_HOST, useValue: { author: authorSignal.asReadonly() } },
			],
		});
	});

	afterEach(() => {
		TestBed.inject(DOCUMENT)
			.head.querySelectorAll('script[data-schema-id]')
			.forEach((el) => el.remove());
	});

	it('should not emit JSON-LD while the author is undefined', () => {
		instantiate();
		TestBed.tick();

		expect(TestBed.inject(DOCUMENT).head.querySelector('script[data-schema-id="profile-page"]')).toBeNull();
	});

	it('should emit the ProfilePage and breadcrumb JSON-LD when the author resolves', () => {
		authorSignal.set(authorMock);

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(JSON.parse(head.querySelector('script[data-schema-id="profile-page"]')?.textContent ?? '{}')).toMatchObject({
			'@type': 'ProfilePage',
		});
		expect(
			JSON.parse(head.querySelector('script[data-schema-id="breadcrumb-author"]')?.textContent ?? '{}'),
		).toMatchObject({ '@type': 'BreadcrumbList' });
	});

	it('should remove both JSON-LD blocks when destroyed', () => {
		authorSignal.set(authorMock);
		instantiate();
		TestBed.tick();
		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="profile-page"]')).not.toBeNull();

		TestBed.resetTestingModule();

		expect(head.querySelector('script[data-schema-id="profile-page"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-author"]')).toBeNull();
	});
});
