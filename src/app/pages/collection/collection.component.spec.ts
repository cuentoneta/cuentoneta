import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';

import CollectionComponent from './collection.component';
import {
	geometriasDelDesveloCollectionMock,
	onoffCollectionTeasersMock,
	onoffCollectionsMock,
} from '@mocks/onoff-collections.mock';
import { provideCollectionApiMock, StubCollectionApi } from '../../providers/collection.mock';
import type { CollectionApi } from '../../providers/collection-api.interface';

const collection = geometriasDelDesveloCollectionMock;
const otherCollectionTeasers = onoffCollectionTeasersMock.filter((teaser) => teaser.slug !== collection.slug);

// Doble mínimo para forzar los estados de carga y de error de la colección; el catálogo se mantiene sano
// para que el sidebar siga siendo observable en esos estados.
const apiWith = (getBySlug: CollectionApi['getBySlug']): CollectionApi => ({
	getBySlug,
	getAll: () => of(onoffCollectionTeasersMock),
});

describe('CollectionComponent (blueprint)', () => {
	const setup = (options?: { slug?: string; api?: CollectionApi }) =>
		render(CollectionComponent, {
			inputs: { slug: options?.slug ?? collection.slug },
			providers: [
				provideRouter([]),
				provideCollectionApiMock(options?.api ?? new StubCollectionApi(onoffCollectionsMock)),
			],
		});

	it('should render the route note with the current slug', async () => {
		await setup({ slug: 'miscelaneas-tertulianas' });
		expect(screen.getByText('/collection/miscelaneas-tertulianas')).toBeInTheDocument();
	});

	it('should render one card per literary work of the collection', async () => {
		await setup();
		expect(await screen.findAllByTestId('work-card')).toHaveLength(collection.literaryWorks.length);
		expect(screen.getByText(collection.literaryWorks[0].title)).toBeInTheDocument();
	});

	it('should clamp work excerpts to 3 lines when authors are shown', async () => {
		await setup({ api: apiWith(() => of({ ...collection, config: { showAuthors: true } })) });
		const descriptions = await screen.findAllByTestId('description');
		expect(descriptions[0]).toHaveClass('line-clamp-3');
	});

	it('should clamp work excerpts to 4 lines when authors are hidden', async () => {
		await setup({ api: apiWith(() => of({ ...collection, config: { showAuthors: false } })) });
		const descriptions = await screen.findAllByTestId('description');
		expect(descriptions[0]).toHaveClass('line-clamp-4');
	});

	it('should render the collection tag in the sidebar', async () => {
		await setup();
		expect(await screen.findByTestId('collection-tag')).toHaveTextContent(collection.tags[0].title);
	});

	it('should render the sanitized description in the sidebar and in the drawer', async () => {
		await setup();
		expect(await screen.findByTestId('collection-description')).not.toBeEmptyDOMElement();
		expect(screen.getByTestId('drawer-description')).not.toBeEmptyDOMElement();
	});

	it('should list the other collections of the catalog as suggestions', async () => {
		await setup();
		const suggested = await screen.findAllByTestId('suggested-collection');
		expect(suggested).toHaveLength(otherCollectionTeasers.length);
		expect(suggested[0]).toHaveTextContent(otherCollectionTeasers[0].title);
	});

	it('should not suggest the collection being viewed', async () => {
		await setup();
		await screen.findAllByTestId('suggested-collection');
		const suggestedTitles = screen.getAllByTestId('suggested-collection').map((item) => item.textContent);
		expect(suggestedTitles.some((title) => title?.includes(collection.title))).toBe(false);
	});

	it('should also list the suggested collections inside the drawer', async () => {
		await setup();
		expect(await screen.findAllByTestId('drawer-suggested-collection')).toHaveLength(otherCollectionTeasers.length);
	});

	it('should render the loading skeletons while the collection resolves', async () => {
		await setup({ api: apiWith(() => NEVER) });
		expect(screen.getByTestId('loading')).toBeInTheDocument();
		expect(screen.queryByTestId('work-card')).not.toBeInTheDocument();
	});

	it('should render the not-found state when the collection fetch fails', async () => {
		await setup({ api: apiWith(() => throwError(() => new Error('not found'))) });
		expect(screen.getByTestId('not-found')).toBeInTheDocument();
		expect(screen.queryByTestId('work-card')).not.toBeInTheDocument();
	});
});
