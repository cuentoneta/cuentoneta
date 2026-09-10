import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import type { Tag } from '@models/tag.model';
import { onoffCollectionTeasersMock } from '@mocks/onoff-collections.mock';
import { colaborativaTagMock, teatroTagMock, tragediaTagMock } from '@mocks/onoff-tags.mock';
import { clearAllMocks, fn } from '@test-utils';

import { CollectionFiltersComponent } from './collection-filters.component';

const collections = onoffCollectionTeasersMock;

// Los conteos se derivan del elenco: sumarle una colección mueve las facetas, y un número escrito a
// mano convertiría ese enriquecimiento en un fallo de este spec.
const countFor = (tag: Tag) =>
	collections.filter((collection) => collection.tags.some((candidate) => candidate.slug === tag.slug)).length;

const distinctTagCount = new Set(collections.flatMap((collection) => collection.tags.map((tag) => tag.slug))).size;

const renderFilters = async (selected: readonly string[] = []) => {
	const toggled = fn();
	const cleared = fn();
	const view = await render(CollectionFiltersComponent, {
		inputs: { collections, selected },
		on: { toggled, cleared },
	});
	return { ...view, toggled, cleared };
};

const facetFor = (tag: Tag) => screen.getByLabelText(`${tag.title} (${countFor(tag)})`);

describe('CollectionFiltersComponent', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	it('should count each tag over the collections it receives', async () => {
		await renderFilters();

		expect(facetFor(colaborativaTagMock)).toBeInTheDocument();
		expect(facetFor(tragediaTagMock)).toBeInTheDocument();
		expect(facetFor(teatroTagMock)).toBeInTheDocument();
	});

	// El nombre no puede salir del `legend`: si contiene un botón, el `fieldset` queda sin nombrar. Este
	// caso fija el cableado, no el cómputo — happy-dom es más permisivo que el navegador y no reprodujo
	// el fallo que se ve en Chrome.
	it('should name the category group', async () => {
		await renderFilters();

		expect(screen.getByRole('group', { name: 'Categoría' })).toBeInTheDocument();
	});

	it('should offer each tag once, however many collections carry it', async () => {
		await renderFilters();

		expect(within(screen.getByRole('group')).getAllByRole('checkbox')).toHaveLength(distinctTagCount);
	});

	it('should emit the tag whose facet is activated', async () => {
		const { toggled } = await renderFilters();

		await userEvent.click(facetFor(tragediaTagMock));

		expect(toggled).toHaveBeenCalledWith(tragediaTagMock);
	});

	it('should check the facets named in the selection', async () => {
		await renderFilters([colaborativaTagMock.slug]);

		expect(facetFor(colaborativaTagMock)).toBeChecked();
		expect(facetFor(tragediaTagMock)).not.toBeChecked();
	});

	describe('filtros en uso', () => {
		it('should show a chip for each selected tag', async () => {
			await renderFilters([colaborativaTagMock.slug]);

			const chips = within(screen.getByTestId('active-filters')).getAllByRole('button');
			expect(chips).toHaveLength(1);
			expect(chips[0]).toHaveAccessibleName(`Quitar el filtro ${colaborativaTagMock.title}`);
		});

		it('should emit the tag whose chip is dismissed', async () => {
			const { toggled } = await renderFilters([colaborativaTagMock.slug]);

			await userEvent.click(screen.getByRole('button', { name: `Quitar el filtro ${colaborativaTagMock.title}` }));

			expect(toggled).toHaveBeenCalledWith(colaborativaTagMock);
		});

		it('should emit once when asked to clear everything', async () => {
			const { cleared } = await renderFilters([colaborativaTagMock.slug, tragediaTagMock.slug]);

			await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

			expect(cleared).toHaveBeenCalledTimes(1);
		});
	});

	it('should offer nothing to clear while nothing is selected', async () => {
		await renderFilters();

		expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
		expect(screen.queryByTestId('active-filters')).not.toBeInTheDocument();
	});

	it('should collapse the category group without losing what is selected', async () => {
		await renderFilters([colaborativaTagMock.slug]);

		await userEvent.click(screen.getByRole('button', { name: /Categoría/ }));

		expect(screen.getByRole('button', { name: /Categoría/ })).toHaveAttribute('aria-expanded', 'false');
		expect(screen.queryByLabelText(`${tragediaTagMock.title} (${countFor(tragediaTagMock)})`)).not.toBeInTheDocument();
		expect(screen.getByTestId('active-filters')).toBeInTheDocument();
	});

	it('should keep its heading when there are no tags to offer', async () => {
		await render(CollectionFiltersComponent, { inputs: { collections: [], selected: [] } });

		expect(screen.getByRole('heading', { name: 'Filtros' })).toBeInTheDocument();
		expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
	});
});
