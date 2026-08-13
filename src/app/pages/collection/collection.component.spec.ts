import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideRouter } from '@angular/router';
import { NEVER, Observable, of, throwError } from 'rxjs';

import CollectionComponent from './collection.component';
import {
	onoffCollectionTeasersMock,
	onoffCollectionsMock,
	onoffCollectionsWithRepresentativeImageryMock,
	onoffCollectionsWithSampleImageryMock,
} from '@mocks/onoff-collections.mock';
import { createCollectionTeaser, type Collection, type CollectionTeaser } from '@models/collection.model';
import { provideCollectionApiMock, StubCollectionApi } from '../../providers/collection.mock';
import type { CollectionApi } from '../../providers/collection-api.interface';
import { setMeasuredSize, triggerResize } from '@testing/resize-observer.stub';
import { clearAllMocks } from '@test-utils';

const [collectionWithRepresentativeImagery] = onoffCollectionsWithRepresentativeImageryMock;
const [collectionWithSampleImagery] = onoffCollectionsWithSampleImageryMock;
const otherCollectionTeasers = onoffCollectionTeasersMock.filter(
	(teaser) => teaser.slug !== collectionWithRepresentativeImagery.slug,
);

// El test decide qué responde cada operación: la carga y el error de la colección no son estados que el
// stub del catálogo sepa producir, y el tope de sugeridas necesita un catálogo más largo que el corpus.
class ControllableCollectionApi implements CollectionApi {
	constructor(
		private readonly bySlug: () => Observable<Collection>,
		private readonly all: () => Observable<CollectionTeaser[]> = () => of(onoffCollectionTeasersMock),
	) {}

	public getBySlug(): Observable<Collection> {
		return this.bySlug();
	}

	public getAll(): Observable<CollectionTeaser[]> {
		return this.all();
	}
}

describe('CollectionComponent (blueprint)', () => {
	beforeEach(() => clearAllMocks());

	const setup = (options?: { slug?: string; api?: CollectionApi }) =>
		render(CollectionComponent, {
			inputs: { slug: options?.slug ?? collectionWithRepresentativeImagery.slug },
			providers: [
				provideRouter([]),
				provideCollectionApiMock(options?.api ?? new StubCollectionApi(onoffCollectionsMock)),
			],
		});

	it('should render the route note with the current slug', async () => {
		await setup({ slug: 'miscelaneas-tertulianas' });
		expect(screen.getByText('/collection/miscelaneas-tertulianas')).toBeInTheDocument();
	});

	it('should render the collection title as the page heading', async () => {
		await setup();
		expect(
			await screen.findByRole('heading', { level: 1, name: collectionWithRepresentativeImagery.title }),
		).toBeInTheDocument();
	});

	it('should render one card per literary work of the collection', async () => {
		await setup();
		const works = collectionWithRepresentativeImagery.literaryWorks;
		expect(await screen.findAllByTestId('work-card')).toHaveLength(works.length);
		expect(screen.getByText(works[0].title)).toBeInTheDocument();
	});

	it('should clamp work excerpts to 3 lines when the collection shows authors', async () => {
		await setup({ api: new ControllableCollectionApi(() => of(collectionWithRepresentativeImagery)) });
		expect(collectionWithRepresentativeImagery.config.showAuthors).toBe(true);
		const descriptions = await screen.findAllByTestId('description');
		expect(descriptions[0]).toHaveClass('line-clamp-3');
	});

	it('should clamp work excerpts to 4 lines when the collection hides authors', async () => {
		const hidingAuthors = onoffCollectionsMock.find((candidate) => !candidate.config.showAuthors);
		if (!hidingAuthors) {
			throw new Error('El corpus no tiene ninguna colección que oculte los autores');
		}
		await setup({ api: new ControllableCollectionApi(() => of(hidingAuthors)) });
		const descriptions = await screen.findAllByTestId('description');
		expect(descriptions[0]).toHaveClass('line-clamp-4');
	});

	it('should render the collection tag in the sidebar', async () => {
		await setup();
		expect(await screen.findByTestId('collection-tag')).toHaveTextContent(
			collectionWithRepresentativeImagery.tags[0].title,
		);
	});

	it('should render the sanitized description in the sidebar and in the drawer', async () => {
		await setup();
		expect(await screen.findByTestId('collection-description')).not.toBeEmptyDOMElement();
		expect(screen.getByTestId('drawer-description')).not.toBeEmptyDOMElement();
	});

	it('should render a single editorial cover when the collection has one', async () => {
		await setup({ api: new ControllableCollectionApi(() => of(collectionWithRepresentativeImagery)) });
		await screen.findByTestId('collection-tag');
		expect(screen.queryByTestId('cover-fan')).not.toBeInTheDocument();
	});

	it('should fan out the works covers when the collection has no editorial cover', async () => {
		await setup({ api: new ControllableCollectionApi(() => of(collectionWithSampleImagery)) });
		// El abanico se repite en el sidebar y en el drawer; alcanza con verificar el del sidebar.
		const [fan] = await screen.findAllByTestId('cover-fan');
		expect(within(fan).getAllByTestId('cover-image')).toHaveLength(3);
	});

	it('should not suggest the collection being viewed', async () => {
		await setup();
		const suggested = await screen.findAllByTestId('suggested-collection');
		expect(suggested).toHaveLength(otherCollectionTeasers.length);
		expect(suggested.some((item) => item.textContent?.includes(collectionWithRepresentativeImagery.title))).toBe(false);
	});

	it('should cap the suggestions at three even when the catalog is longer', async () => {
		const catalog = Array.from({ length: 6 }, (_, index) =>
			createCollectionTeaser({
				...onoffCollectionTeasersMock[0],
				_id: `catalog-${index}`,
				slug: `coleccion-${index}`,
				title: `Colección ${index}`,
			}),
		);
		await setup({
			api: new ControllableCollectionApi(
				() => of(collectionWithRepresentativeImagery),
				() => of(catalog),
			),
		});
		expect(await screen.findAllByTestId('suggested-collection')).toHaveLength(3);
	});

	it('should also list the suggested collections inside the drawer', async () => {
		await setup();
		expect(await screen.findAllByTestId('drawer-suggested-collection')).toHaveLength(otherCollectionTeasers.length);
	});

	it('should offer "Leer más" only when the description overflows its clamp', async () => {
		const view = await setup();
		const description = await screen.findByTestId('collection-description');
		expect(screen.queryByTestId('read-more')).not.toBeInTheDocument();

		setMeasuredSize(description, { scrollHeight: 400, clientHeight: 160 });
		triggerResize();
		await view.fixture.whenStable();

		expect(screen.getByTestId('read-more')).toBeInTheDocument();
	});

	it('should open the drawer with the full description from "Leer más"', async () => {
		const view = await setup();
		setMeasuredSize(await screen.findByTestId('collection-description'), { scrollHeight: 400, clientHeight: 160 });
		triggerResize();
		await view.fixture.whenStable();

		await userEvent.click(screen.getByTestId('read-more'));

		expect(screen.getByRole('dialog', { name: collectionWithRepresentativeImagery.title })).toBeInTheDocument();
	});

	it('should render the loading skeletons while the collection resolves', async () => {
		await setup({ api: new ControllableCollectionApi(() => NEVER) });
		expect(screen.getByTestId('loading')).toBeInTheDocument();
		expect(screen.queryByTestId('work-card')).not.toBeInTheDocument();
	});

	it('should render the not-found state when the collection fetch fails', async () => {
		await setup({ api: new ControllableCollectionApi(() => throwError(() => new Error('not found'))) });
		expect(screen.getByTestId('not-found')).toBeInTheDocument();
		expect(screen.queryByTestId('work-card')).not.toBeInTheDocument();
	});

	it('should still render the collection when the catalog of suggestions fails', async () => {
		await setup({
			api: new ControllableCollectionApi(
				() => of(collectionWithRepresentativeImagery),
				() => throwError(() => new Error('catalog down')),
			),
		});
		expect(await screen.findAllByTestId('work-card')).not.toHaveLength(0);
		expect(screen.queryByTestId('suggested-collection')).not.toBeInTheDocument();
	});
});
