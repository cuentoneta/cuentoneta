import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { renderDeferBlocks } from '@testing/defer-blocks';
import { of } from 'rxjs';

import { ReadingSuggestions } from './reading-suggestions';
import { LiteraryWorkApi } from '../../providers/literary-work.provider';
import type {
	ReadingSuggestions as ReadingSuggestionsModel,
	ReadingSuggestionsScope,
} from '@models/reading-suggestions.model';
import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { authorTeaserMock } from '@mocks/author.mock';
import { clearAllMocks } from '@test-utils';

const [collectionMock] = onoffCollectionsMock;

// El backend resuelve el encabezado y las obras del ámbito, así que el doble responde por contexto: así
// cada variante montada se distingue por la respuesta que le corresponde.
const suggestionsByContext: Record<string, ReadingSuggestionsModel> = {
	author: { title: authorTeaserMock.name, suggestions: onoffLiteraryWorkTeasersMock.slice(0, 3) },
	collection: { title: collectionMock.title, suggestions: collectionMock.literaryWorks.slice(0, 3) },
};

const setup = async (navigationParams: { navigation: 'author' | 'collection'; navigationSlug: string }) =>
	render(ReadingSuggestions, {
		inputs: { navigationParams, currentWorkSlug: 'la-obra-que-se-lee' },
		providers: [
			provideRouter([]),
			{
				provide: LiteraryWorkApi,
				useValue: {
					getSuggestions: (_workSlug: string, scope: ReadingSuggestionsScope) =>
						of('author' in scope ? suggestionsByContext.author : suggestionsByContext.collection),
				},
			},
		],
	});

describe('ReadingSuggestions', () => {
	beforeEach(() => {
		clearAllMocks();
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

	it('should hand the author variant the slug it has to ask by', async () => {
		const { fixture } = await setup({ navigation: 'author', navigationSlug: authorTeaserMock.slug });

		await renderDeferBlocks(fixture);

		expect(screen.getByRole('link', { name: `Ver más de ${authorTeaserMock.name}` })).toHaveAttribute(
			'href',
			`/author/${authorTeaserMock.slug}`,
		);
	});

	it('should hand the collection variant the slug it has to ask by', async () => {
		const { fixture } = await setup({ navigation: 'collection', navigationSlug: collectionMock.slug });

		await renderDeferBlocks(fixture);

		expect(screen.getByRole('link', { name: `Ver más de ${collectionMock.title}` })).toHaveAttribute(
			'href',
			`/collection/${collectionMock.slug}`,
		);
	});
});
