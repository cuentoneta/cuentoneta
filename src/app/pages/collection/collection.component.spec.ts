import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';

import CollectionComponent from './collection.component';
import { storylistMock } from '@mocks/storylist.mock';
import { provideStorylistApiMock } from '../../providers/storylist.mock';
import { StorylistApi } from '../../providers/storylist-api.interface';

// Doble mínimo para forzar los estados de carga/sin-resultados (el CollectionPage solo llama a `get`).
const apiWith = (get: StorylistApi['get']): StorylistApi => ({
	get,
	getStorylistNavigationTeasers: () => NEVER,
});

describe('CollectionComponent (blueprint)', () => {
	const setup = (options?: { slug?: string; api?: StorylistApi }) =>
		render(CollectionComponent, {
			inputs: { slug: options?.slug ?? 'geometrias-del-desvelo' },
			providers: [provideRouter([]), provideStorylistApiMock(options?.api)],
		});

	it('should render the route note with the current slug', async () => {
		await setup({ slug: 'miscelaneas-tertulianas' });
		expect(screen.getByText('/collection/miscelaneas-tertulianas')).toBeInTheDocument();
	});

	it('should render one story card per collection story', async () => {
		await setup();
		expect(await screen.findAllByTestId('story-card')).toHaveLength(storylistMock.stories.length);
		expect(screen.getByText(storylistMock.stories[0].title)).toBeInTheDocument();
	});

	it('should clamp story excerpts to 3 lines when authors are shown', async () => {
		await setup({ api: apiWith(() => of({ ...storylistMock, config: { showAuthors: true } })) });
		const descriptions = await screen.findAllByTestId('description');
		expect(descriptions[0]).toHaveClass('line-clamp-3');
	});

	it('should clamp story excerpts to 4 lines when authors are hidden', async () => {
		await setup({ api: apiWith(() => of({ ...storylistMock, config: { showAuthors: false } })) });
		const descriptions = await screen.findAllByTestId('description');
		expect(descriptions[0]).toHaveClass('line-clamp-4');
	});

	it('should render the collection tag in the sidebar', async () => {
		await setup();
		expect(await screen.findByTestId('collection-tag')).toHaveTextContent(storylistMock.tags[0].title);
	});

	it('should render the full description inside the drawer', async () => {
		await setup();
		expect(await screen.findByTestId('drawer-description')).toBeInTheDocument();
	});

	it('should render the suggested collections list in the sidebar', async () => {
		await setup();
		expect(await screen.findAllByTestId('suggested-collection')).toHaveLength(3);
		// El título del sample aparece en el sidebar y también dentro del drawer.
		expect(screen.getAllByText('El inventario de las pasiones').length).toBeGreaterThanOrEqual(1);
	});

	it('should also list the suggested collections inside the drawer', async () => {
		await setup();
		expect(await screen.findAllByTestId('drawer-suggested-collection')).toHaveLength(3);
	});

	it('should render the loading skeletons while the collection resolves', async () => {
		await setup({ api: apiWith(() => NEVER) });
		expect(screen.getByTestId('loading')).toBeInTheDocument();
		expect(screen.queryByTestId('story-card')).not.toBeInTheDocument();
	});

	it('should render the not-found state when the collection fetch fails', async () => {
		await setup({ api: apiWith(() => throwError(() => new Error('not found'))) });
		expect(screen.getByTestId('not-found')).toBeInTheDocument();
		expect(screen.queryByTestId('story-card')).not.toBeInTheDocument();
	});
});
