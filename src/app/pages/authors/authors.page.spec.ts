import { render, screen } from '@testing-library/angular';
import { restoreAllMocks, spyOn } from '@test-utils';
import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';

import AuthorsPage from './authors.page';
import type { AuthorApi } from '../../providers/author.provider';
import { provideAuthorApiMock } from '../../providers/author.mock';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { AppRoutes } from '../../app.routes';

import type { AuthorProfile, AuthorTeaser } from '@models/author.model';
import { onoffHighlightedAuthorsOfLength } from '@mocks/onoff-highlighted-authors.mock';

class StubIndexAuthorApi implements AuthorApi {
	constructor(private readonly teasers: readonly AuthorTeaser[]) {}

	public getAll(): Observable<AuthorTeaser[]> {
		return of([...this.teasers]);
	}

	public getBySlug(): Observable<AuthorProfile> {
		return throwError(() => new Error('StubIndexAuthorApi: el índice no consulta por slug'));
	}
}

class FailingAuthorApi implements AuthorApi {
	public getAll(): Observable<AuthorTeaser[]> {
		return throwError(() => new Error('sin índice'));
	}

	public getBySlug(): Observable<AuthorProfile> {
		return throwError(() => new Error('sin índice'));
	}
}

const renderPage = (api?: AuthorApi) =>
	render(AuthorsPage, {
		providers: [provideRouter([]), provideAuthorApiMock(api)],
	});

const emittedCatalog = (): HTMLScriptElement | null =>
	TestBed.inject(DOCUMENT).head.querySelector('script[data-schema-id="author-catalog"]');

describe('AuthorsPage', () => {
	afterEach(() => {
		restoreAllMocks();
		TestBed.inject(DOCUMENT)
			.head.querySelectorAll('script[data-schema-id]')
			.forEach((el) => el.remove());
	});

	it('should set the canonical URL of the index', async () => {
		const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');

		await renderPage();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(AppRoutes.Authors));
	});

	it('should list the authors in the JSON-LD in the same order the page shows them', async () => {
		// El API los entrega en orden inverso al alfabético, así que el ItemList solo coincide con los
		// enlaces si sale del listado que la página ya ordenó.
		const authors = onoffHighlightedAuthorsOfLength(3)
			.map(({ author }) => author)
			.reverse();

		await renderPage(new StubIndexAuthorApi(authors));

		const visibleNames = screen.getAllByRole('link').map((link) => link.textContent?.trim());
		const catalog = JSON.parse(emittedCatalog()?.textContent ?? '{}');
		const listedNames = catalog.mainEntity.itemListElement.map((item: { name: string }) => item.name);
		expect(listedNames).toEqual(visibleNames);
	});

	it('should render without emitting the index JSON-LD when the API fails', async () => {
		await renderPage(new FailingAuthorApi());

		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
		expect(emittedCatalog()).toBeNull();
	});
});
