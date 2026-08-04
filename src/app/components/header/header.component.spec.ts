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

	it('should expose the catalog links to assistive tech and keyboard navigation', async () => {
		await renderHeader();

		// getByRole descarta lo marcado aria-hidden: que los encuentre prueba que están expuestos.
		expect(screen.getByRole('link', { name: 'Obras' })).toHaveAttribute('tabindex', '0');
		expect(screen.getByRole('link', { name: 'Autores' })).toHaveAttribute('tabindex', '0');
	});

	// Fija que la excepción del enlace que duplica al logo depende de una propiedad y no de la
	// etiqueta: renombrar 'Inicio' no debe reexponerlo, ni ocultar una entrada nueva por accidente.
	it('should keep the brand-duplicating link visible but out of the accessibility tree', async () => {
		await renderHeader();

		expect(screen.queryByRole('link', { name: 'Inicio' })).toBeNull();
		expect(screen.getByText(/Inicio/)).toBeInTheDocument();
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
