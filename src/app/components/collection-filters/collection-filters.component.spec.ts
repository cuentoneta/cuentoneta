import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { createCollectionTeaser, type CollectionTeaser } from '@models/collection.model';
import type { Tag } from '@models/tag.model';
import { onoffCollectionTeasersMock } from '@mocks/onoff-collections.mock';
import { colaborativaTagMock, cuentoTagMock, surrealismoTagMock } from '@mocks/onoff-tags.mock';
import { clearAllMocks, fn } from '@test-utils';

import { CollectionFiltersComponent } from './collection-filters.component';

const [canonical] = onoffCollectionTeasersMock;
const conEtiquetas = (slug: string, tags: readonly Tag[]): CollectionTeaser =>
	createCollectionTeaser({
		_id: `${canonical._id}-${slug}`,
		slug,
		title: slug,
		description: canonical.description,
		imagery: canonical.imagery,
		tags,
		config: canonical.config,
		mediaSources: canonical.mediaSources,
		count: canonical.count,
	});

const collections = [
	conEtiquetas('una', [colaborativaTagMock, surrealismoTagMock]),
	conEtiquetas('otra', [colaborativaTagMock]),
	conEtiquetas('tercera', [colaborativaTagMock, cuentoTagMock]),
];

const renderFilters = async (selected: readonly string[] = []) => {
	const toggled = fn();
	const cleared = fn();
	const view = await render(CollectionFiltersComponent, {
		inputs: { collections, selected },
		on: { toggled, cleared },
	});
	return { ...view, toggled, cleared };
};

const facetFor = (tag: Tag, count: number) => screen.getByLabelText(`${tag.title} (${count})`);

describe('CollectionFiltersComponent', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	it('should count each tag over the collections it receives', async () => {
		await renderFilters();

		expect(facetFor(colaborativaTagMock, 3)).toBeInTheDocument();
		expect(facetFor(surrealismoTagMock, 1)).toBeInTheDocument();
		expect(facetFor(cuentoTagMock, 1)).toBeInTheDocument();
	});

	it('should offer each tag once, however many collections carry it', async () => {
		await renderFilters();

		expect(within(screen.getByRole('group')).getAllByRole('checkbox')).toHaveLength(3);
	});

	it('should emit the tag whose facet is activated', async () => {
		const { toggled } = await renderFilters();

		await userEvent.click(facetFor(surrealismoTagMock, 1));

		expect(toggled).toHaveBeenCalledWith(surrealismoTagMock);
	});

	it('should check the facets named in the selection', async () => {
		await renderFilters([colaborativaTagMock.slug]);

		expect(facetFor(colaborativaTagMock, 3)).toBeChecked();
		expect(facetFor(surrealismoTagMock, 1)).not.toBeChecked();
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
			const { cleared } = await renderFilters([colaborativaTagMock.slug, surrealismoTagMock.slug]);

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
		expect(screen.queryByLabelText(`${surrealismoTagMock.title} (1)`)).not.toBeInTheDocument();
		expect(screen.getByTestId('active-filters')).toBeInTheDocument();
	});

	it('should keep its heading when there are no tags to offer', async () => {
		await render(CollectionFiltersComponent, { inputs: { collections: [], selected: [] } });

		expect(screen.getByRole('heading', { name: 'Filtros' })).toBeInTheDocument();
		expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
	});
});
