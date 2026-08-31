import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { renderDeferBlocks } from '@testing/defer-blocks';
import { of } from 'rxjs';

import { ReadingSuggestionsComponent } from './reading-suggestions.component';
import { LiteraryWorkApi } from '../../providers/literary-work.provider';
import { CollectionApi } from '../../providers/collection.provider';
import type { NavigationParams } from '@app-utils/navigation-params';
import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { authorTeaserMock } from '@mocks/author.mock';
import { clearAllMocks, restoreAllMocks, spyOn } from '@test-utils';

const [collectionMock] = onoffCollectionsMock;

const setup = async (navigationParams: NavigationParams) =>
	render(ReadingSuggestionsComponent, {
		inputs: { navigationParams, authorName: authorTeaserMock.name, currentWorkSlug: 'una-obra-cualquiera' },
		providers: [
			provideRouter([]),
			{ provide: LiteraryWorkApi, useValue: { getTeasers: () => of(onoffLiteraryWorkTeasersMock) } },
			{ provide: CollectionApi, useValue: { getBySlug: () => of(collectionMock) } },
		],
	});

describe('ReadingSuggestionsComponent', () => {
	beforeEach(() => {
		clearAllMocks();
		spyOn(Math, 'random').mockReturnValue(0);
	});

	afterEach(() => {
		restoreAllMocks();
	});

	it('should keep the suggestions out of the initial render, deferred until the viewport reaches them', async () => {
		await setup({ navigation: 'author', navigationSlug: authorTeaserMock.slug });

		expect(screen.queryByTestId('reading-suggestions')).not.toBeInTheDocument();
	});

	// Que cada variante viva en su propio bloque diferido —y no un bloque único envolviendo al
	// selector— es lo que hace que se descargue solo el bundle de la que corresponde. Eso es una
	// propiedad del bundle, no observable desde el runtime: acá se fija lo que sí lo es, que solo se
	// instancia una variante; el reparto en chunks se verifica sobre la salida del build.
	it('should mount the author variant, and only that one', async () => {
		const { fixture } = await setup({ navigation: 'author', navigationSlug: authorTeaserMock.slug });

		await renderDeferBlocks(fixture);

		expect(screen.getByRole('heading', { name: `Más obras de ${authorTeaserMock.name}` })).toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: `Más obras de ${collectionMock.title}` })).not.toBeInTheDocument();
	});

	it('should mount the collection variant, and only that one', async () => {
		const { fixture } = await setup({ navigation: 'collection', navigationSlug: collectionMock.slug });

		await renderDeferBlocks(fixture);

		expect(screen.getByRole('heading', { name: `Más obras de ${collectionMock.title}` })).toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: `Más obras de ${authorTeaserMock.name}` })).not.toBeInTheDocument();
	});

	it('should hand the author variant the slug it has to fetch by', async () => {
		const { fixture } = await setup({ navigation: 'author', navigationSlug: authorTeaserMock.slug });

		await renderDeferBlocks(fixture);

		expect(screen.getByRole('link', { name: `Ver más de ${authorTeaserMock.name}` })).toHaveAttribute(
			'href',
			`/author/${authorTeaserMock.slug}`,
		);
	});

	it('should hand the collection variant the slug it has to fetch by', async () => {
		const { fixture } = await setup({ navigation: 'collection', navigationSlug: collectionMock.slug });

		await renderDeferBlocks(fixture);

		expect(screen.getByRole('link', { name: `Ver más de ${collectionMock.title}` })).toHaveAttribute(
			'href',
			`/collection/${collectionMock.slug}`,
		);
	});

	it('should exclude the work being read from whichever variant renders', async () => {
		const [current] = onoffLiteraryWorkTeasersMock;
		const { fixture } = await render(ReadingSuggestionsComponent, {
			inputs: {
				navigationParams: { navigation: 'author', navigationSlug: authorTeaserMock.slug },
				authorName: authorTeaserMock.name,
				currentWorkSlug: current.slug,
			},
			providers: [
				provideRouter([]),
				{
					provide: LiteraryWorkApi,
					useValue: { getTeasers: () => of(onoffLiteraryWorkTeasersMock) },
				},
			],
		});

		await renderDeferBlocks(fixture);

		expect(screen.queryByRole('link', { name: current.title })).not.toBeInTheDocument();
	});
});
