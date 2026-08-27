import { render, screen } from '@testing-library/angular';

import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
	it('should display the message it receives', async () => {
		await render(EmptyStateComponent, {
			inputs: { message: 'Todavía no hay obras publicadas esta semana' },
		});

		expect(screen.getByText('Todavía no hay obras publicadas esta semana')).toBeInTheDocument();
	});

	// El mensaje es texto de la página, no una alerta: quien llega lo lee en su lugar, y anunciarlo
	// interrumpiría la lectura por algo que no es un cambio de estado.
	it('should announce nothing beyond its text', async () => {
		await render(EmptyStateComponent, {
			inputs: { message: 'Todavía no hay obras publicadas esta semana' },
		});

		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		expect(screen.queryByRole('status')).not.toBeInTheDocument();
	});
});
