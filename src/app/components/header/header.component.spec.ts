import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule, provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
	const renderHeader = async (isVisible = true) =>
		await render(HeaderComponent, {
			componentImports: [CommonModule, NgOptimizedImage, RouterModule],
			providers: [provideRouter([])],
			inputs: { isVisible },
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

	// El colapso de la barra se expresa en clases y no en estilos computados: happy-dom no aplica CSS,
	// así que el seam disponible en unitario es la clase que el binding emite. Que la transición corra
	// de verdad lo verifican la story y el e2e de apilamiento, que sí montan un navegador.
	describe('collapse', () => {
		// La curva parece cruzada y no lo está: la que gobierna una transición es la del estado destino,
		// así que la de mostrarse (`ease-in`) vive en el estado visible y la de ocultarse en el oculto.
		it('should keep the header expanded while visible', async () => {
			await renderHeader(true);

			expect(screen.getByRole('banner')).toHaveClass('h-header-height', 'translate-y-0', 'opacity-100', 'ease-in');
		});

		it('should collapse the header when it turns hidden', async () => {
			const { rerender } = await renderHeader(true);

			await rerender({ inputs: { isVisible: false } });

			const banner = screen.getByRole('banner');
			expect(banner).toHaveClass('h-0', '-translate-y-full', 'opacity-0', 'ease-out');
			expect(banner).not.toHaveClass('h-header-height');
		});

		// Sin esto, un colapso que salta de golpe pasaría igual: los dos casos de arriba solo miran el
		// estado final. La propiedad que se transiciona es `translate` y no `transform` porque es la que
		// Tailwind v4 usa para `-translate-y-full`; nombrar `transform` deja el desplazamiento sin animar.
		it('should animate the collapse instead of snapping', async () => {
			await renderHeader(true);

			expect(screen.getByRole('banner')).toHaveClass(
				'transition-[height,opacity,translate]',
				'duration-200',
				'motion-reduce:transition-none',
			);
		});

		it('should close the mobile menu when the header hides', async () => {
			const user = userEvent.setup();
			const { rerender, fixture } = await renderHeader(true);
			await user.click(screen.getByRole('button'));
			expect(screen.getAllByRole('link', { name: 'Obras' })).toHaveLength(2);

			await rerender({ inputs: { isVisible: false } });
			// El effect cierra el menú recién dentro del ciclo que dispara el cambio de input, así que el
			// template lo refleja en la pasada siguiente: sin esperar la estabilidad se lee el DOM anterior.
			await fixture.whenStable();

			// Vuelve a quedar solo el de escritorio: el del menú desplegable se fue con él.
			expect(screen.getAllByRole('link', { name: 'Obras' })).toHaveLength(1);
		});
	});
});
