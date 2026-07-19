import { render, screen } from '@testing-library/angular';

import CollectionComponent from './collection.component';

describe('CollectionComponent (blueprint)', () => {
	it('should render the route note with the current slug', async () => {
		await render(CollectionComponent, { inputs: { slug: 'miscelaneas-tertulianas' } });
		expect(screen.getByText('/collection/miscelaneas-tertulianas')).toBeInTheDocument();
	});

	it('should render the static suggested-collections heading', async () => {
		await render(CollectionComponent, { inputs: { slug: 'x' } });
		expect(screen.getByRole('heading', { name: 'Otras colecciones sugeridas' })).toBeInTheDocument();
	});
});
