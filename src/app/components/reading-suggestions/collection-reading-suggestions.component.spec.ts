import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import type { Observable } from 'rxjs';
import { of, Subject, throwError } from 'rxjs';

import { CollectionReadingSuggestionsComponent } from './collection-reading-suggestions.component';
import { READING_SUGGESTIONS_COUNT } from './pick-reading-suggestions';
import { StorylistApi } from '../../providers/storylist.provider';
import type { Storylist } from '@models/storylist.model';
import { storylistMock } from '@mocks/storylist.mock';
import { onoffStoryTeasersMock } from '@mocks/onoff-story-teasers.mock';
import { clearAllMocks, fn, restoreAllMocks, spyOn } from '@test-utils';

// Las obras salen de la proyección de teaser, que es la que el componente consume: trae el cuerpo
// recortado del que se deriva el extracto.
const collectionMock: Storylist = {
	...storylistMock,
	stories: onoffStoryTeasersMock,
};

const setup = async (
	get: (slug: string) => Observable<Storylist>,
	inputs: { collectionSlug?: string; currentWorkSlug?: string } = {},
) => {
	const view = await render(CollectionReadingSuggestionsComponent, {
		inputs: {
			collectionSlug: collectionMock.slug,
			...inputs,
		},
		providers: [provideRouter([]), { provide: StorylistApi, useValue: { get } }],
	});
	view.detectChanges();
	return view;
};

describe('CollectionReadingSuggestionsComponent', () => {
	beforeEach(() => {
		clearAllMocks();
		// Azar determinista: el barajado toma siempre el primer candidato disponible, así las
		// aserciones citan las primeras obras del corpus.
		spyOn(Math, 'random').mockReturnValue(0);
	});

	afterEach(() => {
		restoreAllMocks();
	});

	it('should fetch the navigation teasers of the collection', async () => {
		const get = fn<(slug: string) => Observable<Storylist>>();
		get.mockReturnValue(of(collectionMock));

		await setup(get);

		expect(get).toHaveBeenCalledWith(collectionMock.slug);
	});

	it('should not fetch when there is no collection slug', async () => {
		const get = fn<(slug: string) => Observable<Storylist>>();
		get.mockReturnValue(of(collectionMock));

		await setup(get, { collectionSlug: '' });

		expect(get).not.toHaveBeenCalled();
	});

	it('should render the works of the collection as suggestions', async () => {
		await setup(() => of(collectionMock));

		for (const story of collectionMock.stories.slice(0, READING_SUGGESTIONS_COUNT)) {
			expect(screen.getByRole('link', { name: story.title })).toBeInTheDocument();
		}
	});

	it('should suggest as many works as the block renders', async () => {
		await setup(() => of(collectionMock));

		expect(screen.getAllByRole('listitem')).toHaveLength(READING_SUGGESTIONS_COUNT);
	});

	it('should exclude the work being read', async () => {
		const [current] = collectionMock.stories;

		await setup(() => of(collectionMock), { currentWorkSlug: current.slug });

		expect(screen.queryByRole('link', { name: current.title })).not.toBeInTheDocument();
	});

	it('should head the block with the collection title and link to it', async () => {
		await setup(() => of(collectionMock));

		expect(screen.getByRole('heading', { name: `Más obras de ${collectionMock.title}` })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: `Ver más de ${collectionMock.title}` })).toHaveAttribute(
			'href',
			`/collection/${collectionMock.slug}`,
		);
	});

	it('should show the loading state until the collection arrives', async () => {
		const collection = new Subject<Storylist>();

		const view = await setup(() => collection);

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'true');

		collection.next(collectionMock);
		await view.fixture.whenStable();

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'false');
	});

	it('should stay hidden when the collection has no other work to suggest', async () => {
		const [onlyWork] = collectionMock.stories;

		await setup(() => of({ ...collectionMock, stories: [onlyWork] }), { currentWorkSlug: onlyWork.slug });

		expect(screen.queryByTestId('reading-suggestions')).not.toBeInTheDocument();
	});

	it('should stay hidden when the fetch fails', async () => {
		await setup(() => throwError(() => new Error('la API no responde')));

		expect(screen.queryByTestId('reading-suggestions')).not.toBeInTheDocument();
	});

	it('should carry the collection context into each suggestion link', async () => {
		await setup(() => of(collectionMock));

		const [suggestion] = collectionMock.stories;

		expect(screen.getByRole('link', { name: suggestion.title })).toHaveAttribute(
			'href',
			`/read/${suggestion.slug}?navigation=collection&navigationSlug=${collectionMock.slug}`,
		);
	});

	it('should show the author of each suggestion, since a collection can gather several', async () => {
		await setup(() => of(collectionMock));

		expect(screen.getAllByTestId('author')).toHaveLength(READING_SUGGESTIONS_COUNT);
	});

	// El extracto se verifica sobre lo que produce el camino real —proveedor → picker → adapter → bloque
	// → tarjeta—, no sobre un teaser del corpus armado a mano.
	it('should show the excerpt of each suggested work', async () => {
		await setup(() => of(collectionMock));

		const excerpts = screen.getAllByTestId('description');

		expect(excerpts).toHaveLength(READING_SUGGESTIONS_COUNT);
		for (const [index, excerpt] of excerpts.entries()) {
			const [firstParagraph] = collectionMock.stories[index].paragraphs;
			expect(excerpt.textContent).toContain(firstParagraph.children[0].text);
		}
	});

	// La regresión que dejó la capacidad muerta sin que ningún test se enterara: con una proyección sin
	// cuerpo hay tarjetas pero no hay extracto, y el bloque se ve igual de completo.
	it('should render no excerpt when the projection carries no body', async () => {
		const withoutBody = collectionMock.stories.map((story) => ({ ...story, paragraphs: [] }));

		await setup(() => of({ ...collectionMock, stories: withoutBody }));

		expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
		expect(screen.queryAllByTestId('description')).toHaveLength(0);
	});
});
