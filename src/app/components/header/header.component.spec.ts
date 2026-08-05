import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule, provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('HeaderComponent', () => {
	const renderHeader = async () =>
		await render(HeaderComponent, {
			componentImports: [CommonModule, NgOptimizedImage, RouterModule],
			providers: [provideRouter([]), provideNoopAnimations()],
		});

	it('should render Header component', async () => {
		const { container } = await renderHeader();
		expect(container).toBeInTheDocument();
	});

	it('should show the Cuentoneta alt text', async () => {
		await renderHeader();
		expect(screen.getByAltText(/Cuentoneta/)).toBeInTheDocument();
	});

	it('should show the navbar links', async () => {
		await renderHeader();
		expect(screen.getByText(/Inicio/)).toHaveProperty('href', expect.stringMatching(/home/));
		expect(screen.getByText(/Nosotros/)).toHaveProperty('href', expect.stringMatching(/about/));
	});

	it('should link the catalog pages from the navbar', async () => {
		await renderHeader();
		expect(screen.getByText(/Obras/)).toHaveProperty('href', expect.stringMatching(/\/story$/));
		expect(screen.getByText(/Autores/)).toHaveProperty('href', expect.stringMatching(/\/authors$/));
	});

	// Toda la navegación queda expuesta: getByRole descarta lo marcado aria-hidden, así que
	// encontrar las cuatro entradas prueba que ninguna quedó fuera del árbol de accesibilidad.
	it('should expose every navbar link to assistive tech', async () => {
		await renderHeader();

		for (const label of ['Inicio', 'Obras', 'Autores', 'Nosotros']) {
			expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
		}
	});

	// El logo lleva a la home igual que la entrada 'Inicio', pero su contenido lee
	// "Logo de 'La Cuentoneta' La Cuentoneta", que no dice a dónde va.
	it('should give the brand link an accessible name that states its destination', async () => {
		await renderHeader();

		expect(screen.getByRole('link', { name: 'La Cuentoneta — Inicio' })).toHaveProperty(
			'href',
			expect.stringMatching(/home$/),
		);
	});

	it('should show the catalog links in the mobile menu', async () => {
		const user = userEvent.setup();
		await renderHeader();

		await user.click(screen.getByRole('button'));

		// Dos por enlace: el de escritorio (presente en el DOM, oculto solo por CSS) y el del menú.
		expect(screen.getAllByRole('link', { name: 'Obras' })).toHaveLength(2);
		expect(screen.getAllByRole('link', { name: 'Autores' })).toHaveLength(2);
	});
});
