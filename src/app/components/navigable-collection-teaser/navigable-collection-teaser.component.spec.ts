import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';

import { NavigableCollectionTeaserComponent } from './navigable-collection-teaser.component';
import { geometriasDelDesveloCollectionTeaserMock } from '@mocks/onoff-collections.mock';
import { createCollectionTeaser } from '@models/collection.model';

describe('NavigableCollectionTeaserComponent', () => {
	const collection = geometriasDelDesveloCollectionTeaserMock;
	// Las variantes pasan por la factory y no por spread: el teaser tiene invariantes propias (título no
	// vacío, al menos una obra) y un doble armado a mano se las saltearía.
	const variantOf = (overrides: Partial<Parameters<typeof createCollectionTeaser>[0]>) =>
		createCollectionTeaser({ ...collection, slug: collection.slug, ...overrides });

	const setup = (teaser = collection) =>
		render(NavigableCollectionTeaserComponent, { inputs: { collection: teaser }, providers: [provideRouter([])] });

	it('should render the collection title', async () => {
		await setup();
		expect(screen.getByText(collection.title)).toBeInTheDocument();
	});

	it('should render the category tag when the collection has tags', async () => {
		await setup();
		expect(screen.getByText(collection.tags[0].title)).toBeInTheDocument();
	});

	it('should not render a category tag when the collection has no tags', async () => {
		await setup(variantOf({ tags: [] }));
		expect(screen.queryByText(collection.tags[0].title)).not.toBeInTheDocument();
	});

	it('should render the pluralized story count', async () => {
		await setup(variantOf({ count: 5 }));
		expect(screen.getByText('5 historias')).toBeInTheDocument();
	});

	it('should render the singular story count', async () => {
		await setup(variantOf({ count: 1 }));
		expect(screen.getByText('1 historia')).toBeInTheDocument();
	});

	it('should link to the collection exposing just the title as the accessible name', async () => {
		await setup();
		// El ícono es decorativo (alt vacío) y el enlace envuelve solo el título, así que el nombre accesible
		// del link es el título de la colección.
		const link = screen.getByRole('link', { name: collection.title });
		expect(link).toHaveAttribute('href', expect.stringContaining(`/collection/${collection.slug}`));
	});
});
