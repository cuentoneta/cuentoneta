import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { DeferBlockState, type ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';

import { ReadingSuggestionsComponent } from './reading-suggestions.component';
import { StoryApi } from '../../providers/story-api.interface';
import { StorylistApi } from '../../providers/storylist.provider';
import type { NavigationParams } from '@app-utils/navigation-params';
import type { Storylist } from '@models/storylist.model';
import { storylistMock } from '@mocks/storylist.mock';
import { onoffStoryTeasersMock, onoffStoryNavigationTeasersWithAuthorMock } from '@mocks/onoff-story-teasers.mock';
import { authorTeaserMock } from '@mocks/author.mock';
import { clearAllMocks, restoreAllMocks, spyOn } from '@test-utils';

const collectionMock: Storylist = {
	...storylistMock,
	stories: onoffStoryNavigationTeasersWithAuthorMock,
};

const setup = async (navigationParams: NavigationParams) =>
	render(ReadingSuggestionsComponent, {
		inputs: { navigationParams, authorName: authorTeaserMock.name, currentWorkSlug: 'una-obra-cualquiera' },
		providers: [
			provideRouter([]),
			{ provide: StoryApi, useValue: { getByAuthorSlug: () => of(onoffStoryTeasersMock) } },
			{ provide: StorylistApi, useValue: { get: () => of(collectionMock) } },
		],
	});

const renderDeferBlocks = async (fixture: ComponentFixture<ReadingSuggestionsComponent>) => {
	for (const deferBlock of await fixture.getDeferBlocks()) {
		await deferBlock.render(DeferBlockState.Complete);
	}
};

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
		const { fixture } = await setup({ navigation: 'storylist', navigationSlug: collectionMock.slug });

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
		const { fixture } = await setup({ navigation: 'storylist', navigationSlug: collectionMock.slug });

		await renderDeferBlocks(fixture);

		expect(screen.getByRole('link', { name: `Ver más de ${collectionMock.title}` })).toHaveAttribute(
			'href',
			`/storylist/${collectionMock.slug}`,
		);
	});

	it('should exclude the work being read from whichever variant renders', async () => {
		const [current] = onoffStoryTeasersMock;
		const { fixture } = await render(ReadingSuggestionsComponent, {
			inputs: {
				navigationParams: { navigation: 'author', navigationSlug: authorTeaserMock.slug },
				authorName: authorTeaserMock.name,
				currentWorkSlug: current.slug,
			},
			providers: [
				provideRouter([]),
				{
					provide: StoryApi,
					useValue: { getByAuthorSlug: () => of(onoffStoryTeasersMock) },
				},
			],
		});

		await renderDeferBlocks(fixture);

		expect(screen.queryByRole('link', { name: current.title })).not.toBeInTheDocument();
	});
});
