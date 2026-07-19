import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';

import CollectionComponent from './collection.component';
import { storylistMock } from '@mocks/storylist.mock';

describe('CollectionComponent (blueprint)', () => {
	const setup = (slug = 'geometrias-del-desvelo') =>
		render(CollectionComponent, { inputs: { slug }, providers: [provideRouter([])] });

	it('should render the route note with the current slug', async () => {
		await setup('miscelaneas-tertulianas');
		expect(screen.getByText('/collection/miscelaneas-tertulianas')).toBeInTheDocument();
	});

	it('should render the static suggested-collections heading', async () => {
		await setup();
		expect(screen.getByRole('heading', { name: 'Otras colecciones sugeridas' })).toBeInTheDocument();
	});

	it('should render one story card per collection story', async () => {
		await setup();
		expect(screen.getAllByTestId('story-card')).toHaveLength(storylistMock.stories.length);
		expect(screen.getByText(storylistMock.stories[0].title)).toBeInTheDocument();
	});
});
