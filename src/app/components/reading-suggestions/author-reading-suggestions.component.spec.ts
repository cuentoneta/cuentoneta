import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';

import { AuthorReadingSuggestionsComponent } from './author-reading-suggestions.component';
import { READING_SUGGESTIONS_COUNT } from './pick-reading-suggestions';
import { StoryApi } from '../../providers/story.provider';
import type { StoryTeaser } from '@models/story.model';
import { onoffStoryTeasersMock } from '@mocks/onoff-story-teasers.mock';
import { authorTeaserMock } from '@mocks/author.mock';
import { cuentoTagMock } from '@mocks/onoff-tags.mock';
import { clearAllMocks, fn, restoreAllMocks, spyOn } from '@test-utils';

const setup = async (
	getByAuthorSlug: (slug: string) => Observable<StoryTeaser[]>,
	inputs: { authorSlug?: string; currentWorkSlug?: string } = {},
) => {
	const view = await render(AuthorReadingSuggestionsComponent, {
		inputs: {
			authorSlug: authorTeaserMock.slug,
			authorName: authorTeaserMock.name,
			...inputs,
		},
		providers: [provideRouter([]), { provide: StoryApi, useValue: { getByAuthorSlug } }],
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

	it('should fetch the navigation teasers of the author', async () => {
		const getByAuthorSlug = fn<(slug: string) => Observable<StoryTeaser[]>>();
		getByAuthorSlug.mockReturnValue(of(onoffStoryTeasersMock));

		await setup(getByAuthorSlug);

		expect(getByAuthorSlug).toHaveBeenCalledWith(authorTeaserMock.slug);
	});

	it('should not fetch when there is no author slug', async () => {
		const getByAuthorSlug = fn<(slug: string) => Observable<StoryTeaser[]>>();
		getByAuthorSlug.mockReturnValue(of(onoffStoryTeasersMock));

		await setup(getByAuthorSlug, { authorSlug: '' });

		expect(getByAuthorSlug).not.toHaveBeenCalled();
	});

	it('should render the fetched works as suggestions', async () => {
		await setup(() => of(onoffStoryTeasersMock));

		for (const story of onoffStoryTeasersMock.slice(0, READING_SUGGESTIONS_COUNT)) {
			expect(screen.getByRole('link', { name: story.title })).toBeInTheDocument();
		}
	});

	it('should suggest as many works as the block renders', async () => {
		await setup(() => of(onoffStoryTeasersMock));

		expect(screen.getAllByRole('listitem')).toHaveLength(READING_SUGGESTIONS_COUNT);
	});

	it('should exclude the work being read', async () => {
		const [current] = onoffStoryTeasersMock;

		await setup(() => of(onoffStoryTeasersMock), { currentWorkSlug: current.slug });

		expect(screen.queryByRole('link', { name: current.title })).not.toBeInTheDocument();
	});

	it('should draw the suggestions exactly once per fetch', async () => {
		const randomSource = spyOn(Math, 'random').mockReturnValue(0);
		const stories = new Subject<StoryTeaser[]>();

		const view = await setup(() => stories);
		stories.next(onoffStoryTeasersMock);
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
		const stories = new Subject<StoryTeaser[]>();

		const view = await setup(() => stories);
		stories.next(onoffStoryTeasersMock);
		await view.fixture.whenStable();
		stories.next(onoffStoryTeasersMock);
		await view.fixture.whenStable();

		expect(randomSource).toHaveBeenCalledTimes(READING_SUGGESTIONS_COUNT * 2);
	});

	it('should resolve them again when the work being read changes', async () => {
		const [first, second] = onoffStoryTeasersMock;
		const getByAuthorSlug = fn<(slug: string) => Observable<StoryTeaser[]>>();
		getByAuthorSlug.mockReturnValue(of(onoffStoryTeasersMock));

		const view = await setup(getByAuthorSlug, { currentWorkSlug: first.slug });
		await view.rerender({
			inputs: { authorSlug: authorTeaserMock.slug, authorName: authorTeaserMock.name, currentWorkSlug: second.slug },
		});
		await view.fixture.whenStable();

		expect(getByAuthorSlug).toHaveBeenCalledTimes(2);
		expect(screen.queryByRole('link', { name: second.title })).not.toBeInTheDocument();
	});

	it('should head the block with the author name and link to their listing', async () => {
		await setup(() => of(onoffStoryTeasersMock));

		expect(screen.getByRole('heading', { name: `Más obras de ${authorTeaserMock.name}` })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: `Ver más de ${authorTeaserMock.name}` })).toHaveAttribute(
			'href',
			`/author/${authorTeaserMock.slug}`,
		);
	});

	it('should show the loading state until the works arrive', async () => {
		const stories = new Subject<StoryTeaser[]>();

		const view = await setup(() => stories);

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'true');

		stories.next(onoffStoryTeasersMock);
		await view.fixture.whenStable();

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'false');
	});

	it('should stay hidden when the author has no other work to suggest', async () => {
		const [onlyWork] = onoffStoryTeasersMock;

		await setup(() => of([onlyWork]), { currentWorkSlug: onlyWork.slug });

		expect(screen.queryByTestId('reading-suggestions')).not.toBeInTheDocument();
	});

	it('should stay hidden when the fetch fails', async () => {
		await setup(() => throwError(() => new Error('la API no responde')));

		expect(screen.queryByTestId('reading-suggestions')).not.toBeInTheDocument();
	});

	// El tipo literario que el corpus deja primero entre los tags tiene que llegar hasta la etiqueta de
	// la tarjeta: es todo el recorrido proveedor → adapter → bloque → tarjeta.
	it('should label each suggestion with the literary type the work carries', async () => {
		const [first, ...rest] = onoffStoryTeasersMock;
		const tagged = [{ ...first, tags: [cuentoTagMock] }, ...rest];

		await setup(() => of(tagged));

		// Las tres sugerencias quedan etiquetadas con el mismo tipo: dos ya lo traen del corpus y la
		// primera lo recibe del override. Se afirma la cantidad exacta y no que haya "al menos una",
		// que se cumpliría igual sin que el override llegara a destino.
		expect(screen.getAllByText(cuentoTagMock.title)).toHaveLength(READING_SUGGESTIONS_COUNT);
	});

	// El extracto se verifica sobre lo que produce el camino real —proveedor → picker → adapter → bloque
	// → tarjeta—, no sobre un teaser del corpus armado a mano.
	it('should show the excerpt of each suggested work', async () => {
		await setup(() => of(onoffStoryTeasersMock));

		const excerpts = screen.getAllByTestId('description');

		expect(excerpts).toHaveLength(READING_SUGGESTIONS_COUNT);
		for (const [index, excerpt] of excerpts.entries()) {
			const [firstParagraph] = onoffStoryTeasersMock[index].paragraphs;
			expect(excerpt.textContent).toContain(firstParagraph.children[0].text);
		}
	});

	// La regresión que dejó la capacidad muerta sin que ningún test se enterara: con una proyección sin
	// cuerpo hay tarjetas pero no hay extracto, y el bloque se ve igual de completo.
	it('should render no excerpt when the projection carries no body', async () => {
		const withoutBody = onoffStoryTeasersMock.map((story) => ({ ...story, paragraphs: [] }));

		await setup(() => of(withoutBody));

		expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
		expect(screen.queryAllByTestId('description')).toHaveLength(0);
	});

	it('should carry the author context into each suggestion link', async () => {
		await setup(() => of(onoffStoryTeasersMock));

		const [suggestion] = onoffStoryTeasersMock;

		expect(screen.getByRole('link', { name: suggestion.title })).toHaveAttribute(
			'href',
			`/story/${suggestion.slug}?navigation=author&navigationSlug=${authorTeaserMock.slug}`,
		);
	});

	it('should hide the author of each suggestion, already named in the heading', async () => {
		await setup(() => of(onoffStoryTeasersMock));

		expect(screen.queryAllByTestId('author')).toHaveLength(0);
	});
});
