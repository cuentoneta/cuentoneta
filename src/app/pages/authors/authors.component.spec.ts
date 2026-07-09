import { DeferBlockState } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { of } from 'rxjs';

import { restoreAllMocks, spyOn } from '@test-utils';
import AuthorsComponent from './authors.component';
import { InMemoryAuthorApi, provideAuthorApiMock } from '../../providers/author.mock';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';
import { authorTeaserMock } from '@mocks/author.mock';
import { AppRoutes } from '../../app.routes';

describe('AuthorsComponent', () => {
	afterEach(() => restoreAllMocks());

	const defaultProviders = [provideRouter([]), provideAuthorApiMock()];

	it('should set the canonical URL for /authors via buildCanonicalUrl', async () => {
		const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');

		await render(AuthorsComponent, {
			providers: defaultProviders,
		});

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(AppRoutes.Authors));
	});

	it('should display the page title and subtitle', async () => {
		await render(AuthorsComponent, {
			providers: defaultProviders,
		});

		expect(screen.getByRole('heading', { name: 'Autores/as' })).toBeInTheDocument();
		expect(screen.getByText('Explorá el catálogo completo de autores y autoras de La Cuentoneta')).toBeInTheDocument();
	});

	it('should render author teasers when data is available', async () => {
		const { fixture } = await render(AuthorsComponent, {
			providers: defaultProviders,
		});

		const deferBlockFixture = (await fixture.getDeferBlocks())[0];
		await deferBlockFixture.render(DeferBlockState.Complete);

		expect(screen.getByTestId('author-teaser')).toBeInTheDocument();
		expect(screen.getByText(authorTeaserMock.name)).toBeInTheDocument();
	});

	it('should render skeletons in loading state', async () => {
		const { fixture } = await render(AuthorsComponent, {
			providers: defaultProviders,
		});

		const deferBlockFixture = (await fixture.getDeferBlocks())[0];
		await deferBlockFixture.render(DeferBlockState.Loading);

		expect(screen.getAllByTestId('skeleton')).toHaveLength(6);
	});

	it('should show the header without teasers when the list is empty', async () => {
		class EmptyAuthorApi extends InMemoryAuthorApi {
			public override getAll() {
				return of([]);
			}
		}

		await render(AuthorsComponent, {
			providers: [provideRouter([]), provideAuthorApiMock(new EmptyAuthorApi())],
		});

		expect(screen.getByRole('heading', { name: 'Autores/as' })).toBeInTheDocument();
		expect(screen.queryByTestId('author-teaser')).not.toBeInTheDocument();
	});
});
