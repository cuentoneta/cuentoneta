import { clearAllMocks } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { signal } from '@angular/core';

import { onoffHighlightedAuthorsOfLength } from '@mocks/onoff-highlighted-authors.mock';
import { type AuthorTeaser } from '@models/author.model';
import { AuthorsStructuredDataDirective } from './authors-structured-data.directive';
import { AUTHORS_HOST } from './authors-host';

describe('AuthorsStructuredDataDirective', () => {
	const authors = onoffHighlightedAuthorsOfLength(3).map(({ author }) => author);
	const authorsSignal = signal<readonly AuthorTeaser[]>([]);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new AuthorsStructuredDataDirective());
	}

	function emittedSchema(schemaId: string): unknown {
		const script = TestBed.inject(DOCUMENT).head.querySelector(`script[data-schema-id="${schemaId}"]`);
		return JSON.parse(script?.textContent ?? '{}');
	}

	beforeEach(() => {
		clearAllMocks();
		authorsSignal.set([]);
		TestBed.configureTestingModule({
			providers: [
				AuthorsStructuredDataDirective,
				{ provide: AUTHORS_HOST, useValue: { authors: authorsSignal.asReadonly() } },
			],
		});
	});

	afterEach(() => {
		TestBed.inject(DOCUMENT)
			.head.querySelectorAll('script[data-schema-id]')
			.forEach((el) => el.remove());
	});

	it('should not emit JSON-LD while the index is empty', () => {
		instantiate();
		TestBed.tick();

		expect(TestBed.inject(DOCUMENT).head.querySelector('script[data-schema-id="author-catalog"]')).toBeNull();
	});

	it('should emit the CollectionPage and breadcrumb JSON-LD when the index resolves', () => {
		authorsSignal.set(authors);

		instantiate();
		TestBed.tick();

		expect(emittedSchema('author-catalog')).toMatchObject({ '@type': 'CollectionPage' });
		expect(emittedSchema('breadcrumb-author-catalog')).toMatchObject({ '@type': 'BreadcrumbList' });
	});

	it('should list the authors in the order the host exposes them', () => {
		const reversed = [...authors].reverse();
		authorsSignal.set(reversed);

		instantiate();
		TestBed.tick();

		expect(emittedSchema('author-catalog')).toMatchObject({
			mainEntity: { itemListElement: reversed.map((author) => ({ name: author.name })) },
		});
	});

	it('should not emit under the schema ids the author profile page uses', () => {
		authorsSignal.set(authors);

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="profile-page"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-author"]')).toBeNull();
	});

	it('should remove both JSON-LD blocks when destroyed', () => {
		authorsSignal.set(authors);
		instantiate();
		TestBed.tick();
		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="author-catalog"]')).not.toBeNull();

		TestBed.resetTestingModule();

		expect(head.querySelector('script[data-schema-id="author-catalog"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-author-catalog"]')).toBeNull();
	});
});
