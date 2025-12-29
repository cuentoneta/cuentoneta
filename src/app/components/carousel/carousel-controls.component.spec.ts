// Librería de pruebas
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

// Componentes
import { CarouselControlsComponent } from './carousel-controls.component';

describe('CarouselControlsComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(CarouselControlsComponent, {
			inputs: { type: 'left' },
		});
		expect(container).toBeInTheDocument();
	});

	it('should render left control with correct icon', async () => {
		await render(CarouselControlsComponent, {
			inputs: { type: 'left' },
		});

		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('aria-label', 'Previous slide');

		// Verificar que el icono de chevron izquierdo está presente
		const icon = button.querySelector('ng-icon');
		expect(icon).toBeInTheDocument();
	});

	it('should render right control with correct icon', async () => {
		await render(CarouselControlsComponent, {
			inputs: { type: 'right' },
		});

		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('aria-label', 'Next slide');

		// Verificar que el icono de chevron derecho está presente
		const icon = button.querySelector('ng-icon');
		expect(icon).toBeInTheDocument();
	});

	it('should emit controlClick event when clicked', async () => {
		const user = userEvent.setup();
		const { fixture } = await render(CarouselControlsComponent, {
			inputs: { type: 'left' },
		});

		let clickEmitted = false;
		fixture.componentInstance.controlClick.subscribe(() => {
			clickEmitted = true;
		});

		const button = screen.getByRole('button');
		await user.click(button);

		expect(clickEmitted).toBe(true);
	});

	it('should be disabled when disabled input is true', async () => {
		await render(CarouselControlsComponent, {
			inputs: {
				type: 'left',
				disabled: true,
			},
		});

		const button = screen.getByRole('button');
		expect(button).toBeDisabled();
	});

	it('should apply left-specific classes when type is left', async () => {
		await render(CarouselControlsComponent, {
			inputs: { type: 'left' },
		});

		const button = screen.getByRole('button');
		expect(button).toHaveClass('left');
	});

	it('should apply right-specific classes when type is right', async () => {
		await render(CarouselControlsComponent, {
			inputs: { type: 'right' },
		});

		const button = screen.getByRole('button');
		expect(button).toHaveClass('right');
	});
});
