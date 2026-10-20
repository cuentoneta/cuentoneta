import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import type { Observable } from 'rxjs';
import { of, Subject, throwError } from 'rxjs';

import { CollectionReadingSuggestions } from './collection-reading-suggestions';
import { LiteraryWorkApi } from '../../providers/literary-work.provider';
import type { ReadingSuggestions, ReadingSuggestionsScope } from '@models/reading-suggestions.model';
import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';
import { clearAllMocks, fn, restoreAllMocks } from '@test-utils';
import { firstProseWord } from '@testing/corpus-prose';

// La colección se toma del canon: es la que el backend devuelve como encabezado, con sus obras ya
// elegidas.
const [collectionMock] = onoffCollectionsMock;
const suggestionsMock: ReadingSuggestions = {
	title: collectionMock.title,
	suggestions: collectionMock.literaryWorks.slice(0, 3),
};

type GetSuggestions = (workSlug: string, scope: ReadingSuggestionsScope) => Observable<ReadingSuggestions>;

const setup = async (
	getSuggestions: GetSuggestions,
	inputs: { collectionSlug?: string; currentWorkSlug?: string } = {},
) => {
	const view = await render(CollectionReadingSuggestions, {
		inputs: {
			collectionSlug: collectionMock.slug,
			currentWorkSlug: 'la-obra-que-se-lee',
			...inputs,
		},
		providers: [provideRouter([]), { provide: LiteraryWorkApi, useValue: { getSuggestions } }],
	});
	view.detectChanges();
	return view;
};

describe('CollectionReadingSuggestions', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	afterEach(() => {
		restoreAllMocks();
	});

	it('should fetch the suggestions of the collection for the work being read', async () => {
		const getSuggestions = fn<GetSuggestions>();
		getSuggestions.mockReturnValue(of(suggestionsMock));

		await setup(getSuggestions);

		expect(getSuggestions).toHaveBeenCalledWith('la-obra-que-se-lee', { collection: collectionMock.slug });
	});

	it('should not fetch when there is no collection slug', async () => {
		const getSuggestions = fn<GetSuggestions>();
		getSuggestions.mockReturnValue(of(suggestionsMock));

		await setup(getSuggestions, { collectionSlug: '' });

		expect(getSuggestions).not.toHaveBeenCalled();
	});

	it('should render the works of the response as suggestions', async () => {
		await setup(() => of(suggestionsMock));

		for (const story of suggestionsMock.suggestions) {
			expect(screen.getByRole('link', { name: story.title })).toBeInTheDocument();
		}
	});

	it('should suggest as many works as the backend returns', async () => {
		await setup(() => of(suggestionsMock));

		expect(screen.getAllByRole('listitem')).toHaveLength(suggestionsMock.suggestions.length);
	});

	// El recorte y el descarte de la obra que se lee los hace el backend: acá no se filtra nada, y el
	// caso lo fija un listado que ya viene sin ella.
	it('should draw the works of the response, in the order it arrives', async () => {
		await setup(() => of(suggestionsMock));

		expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(
			suggestionsMock.suggestions.map(({ title }) => expect.stringContaining(title)),
		);
	});

	it('should resolve them again when the work being read changes', async () => {
		const getSuggestions = fn<GetSuggestions>();
		getSuggestions.mockReturnValue(of(suggestionsMock));

		const view = await setup(getSuggestions);
		await view.rerender({
			inputs: { collectionSlug: collectionMock.slug, currentWorkSlug: 'otra-obra' },
		});
		await view.fixture.whenStable();

		expect(getSuggestions).toHaveBeenCalledTimes(2);
		expect(getSuggestions).toHaveBeenLastCalledWith('otra-obra', { collection: collectionMock.slug });
	});

	it('should head the block with the title the backend returns and link to the collection', async () => {
		await setup(() => of(suggestionsMock));

		expect(screen.getByRole('heading', { name: `Más obras de ${collectionMock.title}` })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: `Ver más de ${collectionMock.title}` })).toHaveAttribute(
			'href',
			`/collection/${collectionMock.slug}`,
		);
	});

	it('should show the loading state until the suggestions arrive', async () => {
		const suggestions = new Subject<ReadingSuggestions>();

		const view = await setup(() => suggestions);

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'true');

		suggestions.next(suggestionsMock);
		await view.fixture.whenStable();

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'false');
	});

	it('should stay hidden when the scope has no works to suggest', async () => {
		await setup(() => of({ title: '', suggestions: [] }));

		expect(screen.queryByTestId('reading-suggestions')).not.toBeInTheDocument();
	});

	it('should stay hidden when the fetch fails', async () => {
		await setup(() => throwError(() => new Error('la API no responde')));

		expect(screen.queryByTestId('reading-suggestions')).not.toBeInTheDocument();
	});

	it('should carry the collection context into each suggestion link', async () => {
		await setup(() => of(suggestionsMock));

		const [suggestion] = suggestionsMock.suggestions;

		expect(screen.getByRole('link', { name: suggestion.title })).toHaveAttribute(
			'href',
			`/literary-work/${suggestion.slug}?navigation=collection&navigationSlug=${collectionMock.slug}`,
		);
	});

	it('should show the author of each suggestion, since a collection can gather several', async () => {
		await setup(() => of(suggestionsMock));

		expect(screen.getAllByTestId('author')).toHaveLength(suggestionsMock.suggestions.length);
	});

	// El extracto se verifica sobre lo que produce el camino real —proveedor → adapter → bloque →
	// tarjeta—, no sobre un teaser del corpus armado a mano. Con la fuente nativa el extracto viaja
	// dentro del teaser, así que la palabra a buscar se deriva de su propio HTML saneado.
	it('should show the excerpt of each suggested work', async () => {
		await setup(() => of(suggestionsMock));

		const excerpts = screen.getAllByTestId('description');

		expect(excerpts).toHaveLength(suggestionsMock.suggestions.length);
		for (const [index, excerpt] of excerpts.entries()) {
			expect(excerpt.textContent).toContain(firstProseWord(suggestionsMock.suggestions[index].excerpt.bodyHtml));
		}
	});
});
