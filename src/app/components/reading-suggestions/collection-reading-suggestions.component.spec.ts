import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';

import { CollectionReadingSuggestionsComponent } from './collection-reading-suggestions.component';
import { READING_SUGGESTIONS_COUNT } from './pick-reading-suggestions';
import { CollectionApi } from '../../providers/collection.provider';
import type { Collection } from '@models/collection.model';
import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import { clearAllMocks, fn, restoreAllMocks, spyOn } from '@test-utils';

const [collectionMock] = onoffCollectionsMock;

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
	getBySlug: (slug: string) => Observable<Collection>,
	inputs: { collectionSlug?: string; currentWorkSlug?: string } = {},
) => {
	const view = await render(CollectionReadingSuggestionsComponent, {
		inputs: {
			collectionSlug: collectionMock.slug,
			...inputs,
		},
		providers: [provideRouter([]), { provide: CollectionApi, useValue: { getBySlug } }],
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

	it('should fetch the collection carrying its works', async () => {
		const getBySlug = fn<(slug: string) => Observable<Collection>>();
		getBySlug.mockReturnValue(of(collectionMock));

		await setup(getBySlug);

		expect(getBySlug).toHaveBeenCalledWith(collectionMock.slug);
	});

	it('should not fetch when there is no collection slug', async () => {
		const getBySlug = fn<(slug: string) => Observable<Collection>>();
		getBySlug.mockReturnValue(of(collectionMock));

		await setup(getBySlug, { collectionSlug: '' });

		expect(getBySlug).not.toHaveBeenCalled();
	});

	it('should render the works of the collection as suggestions', async () => {
		await setup(() => of(collectionMock));

		for (const work of collectionMock.literaryWorks.slice(0, READING_SUGGESTIONS_COUNT)) {
			expect(screen.getByRole('link', { name: work.title })).toBeInTheDocument();
		}
	});

	it('should suggest as many works as the block renders', async () => {
		await setup(() => of(collectionMock));

		expect(screen.getAllByRole('listitem')).toHaveLength(READING_SUGGESTIONS_COUNT);
	});

	it('should exclude the work being read', async () => {
		const [current] = collectionMock.literaryWorks;

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
		const collection = new Subject<Collection>();

		const view = await setup(() => collection);

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'true');

		collection.next(collectionMock);
		await view.fixture.whenStable();

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'false');
	});

	it('should stay hidden when the collection has no other work to suggest', async () => {
		const [onlyWork] = collectionMock.literaryWorks;

		await setup(() => of({ ...collectionMock, literaryWorks: [onlyWork] }), { currentWorkSlug: onlyWork.slug });

		expect(screen.queryByTestId('reading-suggestions')).not.toBeInTheDocument();
	});

	it('should stay hidden when the fetch fails', async () => {
		await setup(() => throwError(() => new Error('la API no responde')));

		expect(screen.queryByTestId('reading-suggestions')).not.toBeInTheDocument();
	});

	it('should carry the collection context into each suggestion link', async () => {
		await setup(() => of(collectionMock));

		const [suggestion] = collectionMock.literaryWorks;

		expect(screen.getByRole('link', { name: suggestion.title })).toHaveAttribute(
			'href',
			`/read/${suggestion.slug}?navigation=collection&navigationSlug=${collectionMock.slug}`,
		);
	});

	it('should show the author of each suggestion, since a collection can gather several', async () => {
		await setup(() => of(collectionMock));

		expect(screen.getAllByTestId('author')).toHaveLength(READING_SUGGESTIONS_COUNT);
	});

	// El extracto se verifica sobre lo que produce el camino real —proveedor → picker → bloque →
	// tarjeta—, no sobre un texto armado a mano.
	it('should show the excerpt of each suggested work', async () => {
		await setup(() => of(collectionMock));

		const excerpts = screen.getAllByTestId('description');

		expect(excerpts).toHaveLength(READING_SUGGESTIONS_COUNT);
		for (const [index, excerpt] of excerpts.entries()) {
			expect(excerpt.textContent).toContain(excerptWord(collectionMock.literaryWorks[index]));
		}
	});
});
