import { render, screen } from '@testing-library/angular';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule, provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
	const setup = async () =>
		await render(HeaderComponent, {
			componentImports: [CommonModule, NgOptimizedImage, RouterModule],
			providers: [provideRouter([])],
		});

	it('should render Header component', async () => {
		const { container } = await setup();
		expect(container).toBeInTheDocument();
	});

	it('should show the Cuentoneta alt text', async () => {
		await setup();
		expect(screen.getByAltText(/Cuentoneta/)).toBeInTheDocument();
	});

	it('should show the navbar links', async () => {
		await setup();
		expect(screen.getByText(/Inicio/)).toHaveProperty('href', expect.stringMatching(/home/));
		expect(screen.getByText(/Nosotros/)).toHaveProperty('href', expect.stringMatching(/about/));
	});
});
