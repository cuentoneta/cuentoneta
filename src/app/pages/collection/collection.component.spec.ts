import { render, screen } from '@testing-library/angular';

import CollectionComponent from './collection.component';

describe('CollectionComponent (blueprint)', () => {
	it('should render the route note with the current slug', async () => {
		await render(CollectionComponent, { inputs: { slug: 'miscelaneas-tertulianas' } });
		expect(screen.getByText('/collection/miscelaneas-tertulianas')).toBeInTheDocument();
	});

	it('should render the suggested-collections section', async () => {
		await render(CollectionComponent, { inputs: { slug: 'x' } });
		expect(screen.getByText(/Otras colecciones sugeridas/)).toBeInTheDocument();
	});
});
