import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import type { Observable } from 'rxjs';
import { of, Subject, throwError } from 'rxjs';

import { AuthorReadingSuggestions } from './author-reading-suggestions';
import { LiteraryWorkApi } from '../../providers/literary-work.provider';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import type { ReadingSuggestions, ReadingSuggestionsScope } from '@models/reading-suggestions.model';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { authorTeaserMock } from '@mocks/author.mock';
import { cuentoTagMock } from '@mocks/onoff-tags.mock';
import { clearAllMocks, fn, restoreAllMocks } from '@test-utils';
import { firstProseWord } from '@testing/corpus-prose';

// La cantidad la decide el backend: el doble entrega tres, que es el default de la ruta, y lo que se
// afirma del bloque es que dibuja lo que llega.
const suggestionsMock: ReadingSuggestions = {
	title: authorTeaserMock.name,
	suggestions: onoffLiteraryWorkTeasersMock.slice(0, 3),
};

type GetSuggestions = (workSlug: string, scope: ReadingSuggestionsScope) => Observable<ReadingSuggestions>;

const setup = async (
	getSuggestions: GetSuggestions,
	inputs: { authorSlug?: string; currentWorkSlug?: string } = {},
) => {
	const view = await render(AuthorReadingSuggestions, {
		inputs: {
			authorSlug: authorTeaserMock.slug,
			currentWorkSlug: 'la-obra-que-se-lee',
			...inputs,
		},
		providers: [provideRouter([]), { provide: LiteraryWorkApi, useValue: { getSuggestions } }],
	});
	view.detectChanges();
	return view;
};

describe('AuthorReadingSuggestions', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	afterEach(() => {
		restoreAllMocks();
	});

	it('should fetch the suggestions of the author for the work being read', async () => {
		const getSuggestions = fn<GetSuggestions>();
		getSuggestions.mockReturnValue(of(suggestionsMock));

		await setup(getSuggestions);

		expect(getSuggestions).toHaveBeenCalledWith('la-obra-que-se-lee', { author: authorTeaserMock.slug });
	});

	it('should not fetch when there is no author slug', async () => {
		const getSuggestions = fn<GetSuggestions>();
		getSuggestions.mockReturnValue(of(suggestionsMock));

		await setup(getSuggestions, { authorSlug: '' });

		expect(getSuggestions).not.toHaveBeenCalled();
	});

	it('should render the fetched works as suggestions', async () => {
		await setup(() => of(suggestionsMock));

		for (const story of suggestionsMock.suggestions) {
			expect(screen.getByRole('link', { name: story.title })).toBeInTheDocument();
		}
	});

	it('should suggest as many works as the backend returns', async () => {
		await setup(() => of(suggestionsMock));

		expect(screen.getAllByRole('listitem')).toHaveLength(suggestionsMock.suggestions.length);
	});

	// El backend descarta la obra que se lee y elige las del ámbito: lo que llega es lo que se dibuja.
	it('should draw the works of the response, in the order it arrives', async () => {
		await setup(() => of(suggestionsMock));

		expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(
			suggestionsMock.suggestions.map(({ title }) => expect.stringContaining(title)),
		);
	});

	// La resolución es una sola por fetch: una reevaluación del bloque no vuelve a pedir el listado, que es
	// lo que hoy garantiza que las sugerencias no se rebarajen mientras la persona lee.
	it('should ask the backend once per fetch, even when the block re-renders', async () => {
		const getSuggestions = fn<GetSuggestions>();
		getSuggestions.mockReturnValue(of(suggestionsMock));

		const view = await setup(getSuggestions);
		screen.getAllByRole('listitem');
		view.detectChanges();
		await view.fixture.whenStable();

		expect(getSuggestions).toHaveBeenCalledTimes(1);
	});

	it('should resolve them again when the work being read changes', async () => {
		const getSuggestions = fn<GetSuggestions>();
		getSuggestions.mockReturnValue(of(suggestionsMock));

		const view = await setup(getSuggestions);
		await view.rerender({
			inputs: { authorSlug: authorTeaserMock.slug, currentWorkSlug: 'otra-obra' },
		});
		await view.fixture.whenStable();

		expect(getSuggestions).toHaveBeenCalledTimes(2);
		expect(getSuggestions).toHaveBeenLastCalledWith('otra-obra', { author: authorTeaserMock.slug });
	});

	// El encabezado lo arma el bloque con el nombre que devuelve el backend: es el del ámbito con el que
	// se llegó a la obra, que no siempre es el autor principal de la que se lee.
	it('should head the block with the title the backend returns and link to the author', async () => {
		await setup(() => of(suggestionsMock));

		expect(screen.getByRole('heading', { name: `Más obras de ${authorTeaserMock.name}` })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: `Ver más de ${authorTeaserMock.name}` })).toHaveAttribute(
			'href',
			`/author/${authorTeaserMock.slug}`,
		);
	});

	it('should show the loading state until the works arrive', async () => {
		const stories = new Subject<ReadingSuggestions>();

		const view = await setup(() => stories);

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'true');

		stories.next(suggestionsMock);
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

	// El tipo literario que cada obra trae primero entre sus tags tiene que llegar hasta la etiqueta de la
	// tarjeta: es todo el recorrido proveedor → adapter → bloque → tarjeta.
	it('should label each suggestion with the literary type the work carries', async () => {
		const [first, second, third] = onoffLiteraryWorkTeasersMock;
		const tagged: LiteraryWorkTeaser[] = [{ ...first, tags: [cuentoTagMock] }, second, third];

		await setup(() => of({ title: authorTeaserMock.name, suggestions: tagged }));

		// Tres obras y las tres etiquetadas con el mismo tipo: dos ya lo traen del corpus y la primera lo
		// recibe del override. Se afirma la cantidad exacta y no que haya "al menos una", que se cumpliría
		// igual sin que el override llegara a destino.
		expect(screen.getAllByText(cuentoTagMock.title)).toHaveLength(tagged.length);
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

	it('should carry the author context into each suggestion link', async () => {
		await setup(() => of(suggestionsMock));

		const [suggestion] = suggestionsMock.suggestions;

		expect(screen.getByRole('link', { name: suggestion.title })).toHaveAttribute(
			'href',
			`/literary-work/${suggestion.slug}?navigation=author&navigationSlug=${authorTeaserMock.slug}`,
		);
	});

	it('should hide the author of each suggestion, already named in the heading', async () => {
		await setup(() => of(suggestionsMock));

		expect(screen.queryAllByTestId('author')).toHaveLength(0);
	});
});
