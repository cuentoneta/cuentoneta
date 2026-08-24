import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';

import { AuthorReadingSuggestionsComponent } from './author-reading-suggestions.component';
import { READING_SUGGESTIONS_COUNT } from './pick-reading-suggestions';
import { LiteraryWorkApi } from '../../providers/literary-work.provider';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { authorTeaserMock } from '@mocks/author.mock';
import { cuentoTagMock } from '@mocks/onoff-tags.mock';
import { clearAllMocks, fn, restoreAllMocks, spyOn } from '@test-utils';

// El extracto llega como HTML saneado y se pinta con [innerHTML]: lo comparable del render es una
// palabra larga de su texto plano, que sobrevive igual con o sin tags alrededor.
const excerptWord = (teaser: LiteraryWorkTeaser): string => {
	const [word] = teaser.excerpt.bodyHtml.replace(/<[^>]+>/g, ' ').match(/\p{L}{6,}/gu) ?? [];
	if (word === undefined) {
		throw new Error(`El extracto de "${teaser.slug}" no tiene palabra larga`);
	}
	return word;
};

const setup = async (
	getByAuthorSlug: (slug: string) => Observable<LiteraryWorkTeaser[]>,
	inputs: { authorSlug?: string; currentWorkSlug?: string } = {},
) => {
	const view = await render(AuthorReadingSuggestionsComponent, {
		inputs: {
			authorSlug: authorTeaserMock.slug,
			authorName: authorTeaserMock.name,
			...inputs,
		},
		providers: [provideRouter([]), { provide: LiteraryWorkApi, useValue: { getByAuthorSlug } }],
	});
	view.detectChanges();
	return view;
};

describe('AuthorReadingSuggestionsComponent', () => {
	beforeEach(() => {
		clearAllMocks();
		// Azar determinista: el barajado toma siempre el primer candidato disponible, así las
		// aserciones citan las primeras obras del corpus.
		spyOn(Math, 'random').mockReturnValue(0);
	});

	afterEach(() => {
		restoreAllMocks();
	});

	it('should fetch the native teasers of the author', async () => {
		const getByAuthorSlug = fn<(slug: string) => Observable<LiteraryWorkTeaser[]>>();
		getByAuthorSlug.mockReturnValue(of(onoffLiteraryWorkTeasersMock));

		await setup(getByAuthorSlug);

		expect(getByAuthorSlug).toHaveBeenCalledWith(authorTeaserMock.slug);
	});

	it('should not fetch when there is no author slug', async () => {
		const getByAuthorSlug = fn<(slug: string) => Observable<LiteraryWorkTeaser[]>>();
		getByAuthorSlug.mockReturnValue(of(onoffLiteraryWorkTeasersMock));

		await setup(getByAuthorSlug, { authorSlug: '' });

		expect(getByAuthorSlug).not.toHaveBeenCalled();
	});

	it('should render the fetched works as suggestions', async () => {
		await setup(() => of(onoffLiteraryWorkTeasersMock));

		for (const work of onoffLiteraryWorkTeasersMock.slice(0, READING_SUGGESTIONS_COUNT)) {
			expect(screen.getByRole('link', { name: work.title })).toBeInTheDocument();
		}
	});

	it('should suggest as many works as the block renders', async () => {
		await setup(() => of(onoffLiteraryWorkTeasersMock));

		expect(screen.getAllByRole('listitem')).toHaveLength(READING_SUGGESTIONS_COUNT);
	});

	it('should exclude the work being read', async () => {
		const [current] = onoffLiteraryWorkTeasersMock;

		await setup(() => of(onoffLiteraryWorkTeasersMock), { currentWorkSlug: current.slug });

		expect(screen.queryByRole('link', { name: current.title })).not.toBeInTheDocument();
	});

	it('should draw the suggestions exactly once per fetch', async () => {
		const randomSource = spyOn(Math, 'random').mockReturnValue(0);
		const works = new Subject<LiteraryWorkTeaser[]>();

		const view = await setup(() => works);
		works.next(onoffLiteraryWorkTeasersMock);
		await view.fixture.whenStable();

		// Un sorteo por tarjeta a renderizar, y ninguno más: leer las sugerencias no vuelve a barajar.
		expect(randomSource).toHaveBeenCalledTimes(READING_SUGGESTIONS_COUNT);

		screen.getAllByRole('listitem');
		view.detectChanges();
		await view.fixture.whenStable();

		expect(randomSource).toHaveBeenCalledTimes(READING_SUGGESTIONS_COUNT);
	});

	it('should draw again when the source emits new works', async () => {
		const randomSource = spyOn(Math, 'random').mockReturnValue(0);
		const works = new Subject<LiteraryWorkTeaser[]>();

		const view = await setup(() => works);
		works.next(onoffLiteraryWorkTeasersMock);
		await view.fixture.whenStable();
		works.next(onoffLiteraryWorkTeasersMock);
		await view.fixture.whenStable();

		expect(randomSource).toHaveBeenCalledTimes(READING_SUGGESTIONS_COUNT * 2);
	});

	it('should resolve them again when the work being read changes', async () => {
		const [first, second] = onoffLiteraryWorkTeasersMock;
		const getByAuthorSlug = fn<(slug: string) => Observable<LiteraryWorkTeaser[]>>();
		getByAuthorSlug.mockReturnValue(of(onoffLiteraryWorkTeasersMock));

		const view = await setup(getByAuthorSlug, { currentWorkSlug: first.slug });
		await view.rerender({
			inputs: { authorSlug: authorTeaserMock.slug, authorName: authorTeaserMock.name, currentWorkSlug: second.slug },
		});
		await view.fixture.whenStable();

		expect(getByAuthorSlug).toHaveBeenCalledTimes(2);
		expect(screen.queryByRole('link', { name: second.title })).not.toBeInTheDocument();
	});

	it('should head the block with the author name and link to their listing', async () => {
		await setup(() => of(onoffLiteraryWorkTeasersMock));

		expect(screen.getByRole('heading', { name: `Más obras de ${authorTeaserMock.name}` })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: `Ver más de ${authorTeaserMock.name}` })).toHaveAttribute(
			'href',
			`/author/${authorTeaserMock.slug}`,
		);
	});

	it('should show the loading state until the works arrive', async () => {
		const works = new Subject<LiteraryWorkTeaser[]>();

		const view = await setup(() => works);

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'true');

		works.next(onoffLiteraryWorkTeasersMock);
		await view.fixture.whenStable();

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'false');
	});

	it('should stay hidden when the author has no other work to suggest', async () => {
		const [onlyWork] = onoffLiteraryWorkTeasersMock;

		await setup(() => of([onlyWork]), { currentWorkSlug: onlyWork.slug });

		expect(screen.queryByTestId('reading-suggestions')).not.toBeInTheDocument();
	});

	it('should stay hidden when the fetch fails', async () => {
		await setup(() => throwError(() => new Error('la API no responde')));

		expect(screen.queryByTestId('reading-suggestions')).not.toBeInTheDocument();
	});

	// El tipo literario que el corpus deja primero entre los tags tiene que llegar hasta la etiqueta de
	// la tarjeta: es todo el recorrido proveedor → picker → bloque → tarjeta.
	it('should label each suggestion with the literary type the work carries', async () => {
		const [first, ...rest] = onoffLiteraryWorkTeasersMock;
		const tagged = [{ ...first, tags: [cuentoTagMock] }, ...rest];

		await setup(() => of(tagged));

		// Las tres sugerencias quedan etiquetadas con el mismo tipo: dos ya lo traen del corpus y la
		// primera lo recibe del override. Se afirma la cantidad exacta y no que haya "al menos una",
		// que se cumpliría igual sin que el override llegara a destino.
		expect(screen.getAllByText(cuentoTagMock.title)).toHaveLength(READING_SUGGESTIONS_COUNT);
	});

	// El extracto se verifica sobre lo que produce el camino real —proveedor → picker → bloque →
	// tarjeta—, no sobre un texto armado a mano.
	it('should show the excerpt of each suggested work', async () => {
		await setup(() => of(onoffLiteraryWorkTeasersMock));

		const excerpts = screen.getAllByTestId('description');

		expect(excerpts).toHaveLength(READING_SUGGESTIONS_COUNT);
		for (const [index, excerpt] of excerpts.entries()) {
			expect(excerpt.textContent).toContain(excerptWord(onoffLiteraryWorkTeasersMock[index]));
		}
	});

	it('should carry the author context into each suggestion link', async () => {
		await setup(() => of(onoffLiteraryWorkTeasersMock));

		const [suggestion] = onoffLiteraryWorkTeasersMock;

		expect(screen.getByRole('link', { name: suggestion.title })).toHaveAttribute(
			'href',
			`/read/${suggestion.slug}?navigation=author&navigationSlug=${authorTeaserMock.slug}`,
		);
	});

	it('should hide the author of each suggestion, already named in the heading', async () => {
		await setup(() => of(onoffLiteraryWorkTeasersMock));

		expect(screen.queryAllByTestId('author')).toHaveLength(0);
	});
});
