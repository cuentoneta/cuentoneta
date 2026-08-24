import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { absurdoTagMock, colaborativaTagMock, surrealismoTagMock } from '@mocks/onoff-tags.mock';
import { clearAllMocks, fn } from '@test-utils';

import { CollectionFiltersComponent, type CollectionFacet } from './collection-filters.component';

const facet = (tag: CollectionFacet['tag'], count: number, selected = false): CollectionFacet => ({
	tag,
	count,
	selected,
});

const facets: readonly CollectionFacet[] = [
	facet(colaborativaTagMock, 8),
	facet(surrealismoTagMock, 3),
	facet(absurdoTagMock, 1),
];

const renderFilters = (given: readonly CollectionFacet[] = facets) => {
	const toggled = fn();
	const cleared = fn();
	return render(CollectionFiltersComponent, {
		inputs: { facets: given },
		on: { toggled, cleared },
	}).then((result) => ({ ...result, toggled, cleared }));
};

describe('CollectionFiltersComponent', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	it('should offer every facet with its count', async () => {
		await renderFilters();

		expect(screen.getByLabelText(`${colaborativaTagMock.title} (8)`)).toBeInTheDocument();
		expect(screen.getByLabelText(`${surrealismoTagMock.title} (3)`)).toBeInTheDocument();
		expect(screen.getByLabelText(`${absurdoTagMock.title} (1)`)).toBeInTheDocument();
	});

	it('should emit the tag whose facet is activated', async () => {
		const { toggled } = await renderFilters();

		await userEvent.click(screen.getByLabelText(`${surrealismoTagMock.title} (3)`));

		expect(toggled).toHaveBeenCalledWith(surrealismoTagMock);
	});

	it('should check the facets marked as selected', async () => {
		await renderFilters([facet(colaborativaTagMock, 8, true), facet(surrealismoTagMock, 3)]);

		expect(screen.getByLabelText(`${colaborativaTagMock.title} (8)`)).toBeChecked();
		expect(screen.getByLabelText(`${surrealismoTagMock.title} (3)`)).not.toBeChecked();
	});

	describe('filtros en uso', () => {
		const conSeleccion = () => renderFilters([facet(colaborativaTagMock, 8, true), facet(surrealismoTagMock, 3)]);

		it('should show a chip for each selected facet', async () => {
			await conSeleccion();

			const chips = within(screen.getByTestId('active-filters')).getAllByRole('button');
			expect(chips).toHaveLength(1);
			expect(chips[0]).toHaveAccessibleName(`Quitar el filtro ${colaborativaTagMock.title}`);
		});

		it('should emit the tag whose chip is dismissed', async () => {
			const { toggled } = await conSeleccion();

			await userEvent.click(screen.getByRole('button', { name: `Quitar el filtro ${colaborativaTagMock.title}` }));

			expect(toggled).toHaveBeenCalledWith(colaborativaTagMock);
		});

		it('should emit once when asked to clear everything', async () => {
			const { cleared } = await conSeleccion();

			await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

			expect(cleared).toHaveBeenCalledTimes(1);
		});
	});

	it('should offer nothing to clear while no facet is selected', async () => {
		await renderFilters();

		expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
		expect(screen.queryByTestId('active-filters')).not.toBeInTheDocument();
	});

	it('should collapse the category group without losing what is selected', async () => {
		await renderFilters([facet(colaborativaTagMock, 8, true), facet(surrealismoTagMock, 3)]);

		await userEvent.click(screen.getByRole('button', { name: /Categoría/ }));

		expect(screen.getByRole('button', { name: /Categoría/ })).toHaveAttribute('aria-expanded', 'false');
		expect(screen.queryByLabelText(`${surrealismoTagMock.title} (3)`)).not.toBeInTheDocument();
		expect(screen.getByTestId('active-filters')).toBeInTheDocument();
	});
});
