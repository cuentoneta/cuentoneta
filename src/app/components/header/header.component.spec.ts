import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule, provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
	// El input queda sin fijar cuando el caso no lo necesita, para que el valor por defecto siga siendo
	// el que se ejercita en la mayoría de los casos.
	const renderHeader = async (isVisible?: boolean) =>
		await render(HeaderComponent, {
			componentImports: [CommonModule, NgOptimizedImage, RouterModule],
			providers: [provideRouter([])],
			...(isVisible === undefined ? {} : { inputs: { isVisible } }),
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
		expect(screen.getByText(/Obras/)).toHaveProperty('href', expect.stringMatching(/\/literary-work$/));
		expect(screen.getByText(/Colecciones/)).toHaveProperty('href', expect.stringMatching(/\/collection$/));
		expect(screen.getByText(/Autores/)).toHaveProperty('href', expect.stringMatching(/\/authors$/));
	});

	// Toda la navegación queda expuesta: getByRole descarta lo marcado aria-hidden, así que
	// encontrar cada entrada prueba que ninguna quedó fuera del árbol de accesibilidad.
	it('should expose every navbar link to assistive tech', async () => {
		await renderHeader();

		for (const label of ['Inicio', 'Obras', 'Colecciones', 'Autores', 'Nosotros']) {
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
	// de verdad no lo cubre ninguna suite: se comprueba en un navegador, hoy a mano sobre la story.
	describe('collapse', () => {
		// Sin fijar el input: el default del componente es el estado expandido, que es como se sirve en
		// toda página antes del primer scroll.
		it('should keep the header expanded while visible', async () => {
			await renderHeader();

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

		// La barra vuelve por el mismo camino, y es la dirección que gobierna `ease-in`: sin este caso, una
		// inversión del mapa solo se notaría mirando la animación.
		it('should expand the header again when it turns visible', async () => {
			const { rerender } = await renderHeader(false);

			await rerender({ inputs: { isVisible: true } });

			const banner = screen.getByRole('banner');
			expect(banner).toHaveClass('h-header-height', 'translate-y-0', 'opacity-100', 'ease-in');
			expect(banner).not.toHaveClass('h-0');
		});

		it('should close the mobile menu when the header hides', async () => {
			const user = userEvent.setup();
			const { rerender } = await renderHeader(true);
			await user.click(screen.getByRole('button'));
			expect(screen.getAllByRole('link', { name: 'Obras' })).toHaveLength(2);

			await rerender({ inputs: { isVisible: false } });

			// Vuelve a quedar solo el de escritorio: el del menú desplegable se fue con él. Se espera con
			// `waitFor` porque el effect cierra el menú dentro del ciclo del cambio de input y el template
			// lo refleja en la pasada siguiente.
			await waitFor(() => expect(screen.getAllByRole('link', { name: 'Obras' })).toHaveLength(1));
		});
	});

	// Lo que las clases de colapso no expresan: una barra que la interfaz declara ausente tampoco puede
	// existir para el teclado. `happy-dom` consulta los ancestros `inert` al enfocar, así que acá se afirma
	// comportamiento y no solo el atributo emitido; el clic y el árbol de accesibilidad los decide el
	// navegador y quedan para el e2e.
	describe('interaction while hidden', () => {
		it('should keep the brand link out of reach while hidden', async () => {
			await renderHeader(false);

			const brandLink = screen.getByRole('link', { name: 'La Cuentoneta — Inicio' });
			brandLink.focus();

			expect(brandLink).not.toHaveFocus();
		});

		// Sin este control, el caso de arriba pasaría igual con un componente que no deja enfocar nunca.
		it('should let the brand link take focus while visible', async () => {
			await renderHeader(true);

			const brandLink = screen.getByRole('link', { name: 'La Cuentoneta — Inicio' });
			brandLink.focus();

			expect(brandLink).toHaveFocus();
		});

		// El otro control alcanzable en `xs`, que es el único ancho donde la barra llega a ocultarse: ahí
		// los enlaces de escritorio están en `display: none` y el menú se abre por este botón.
		it('should keep the menu toggler out of reach while hidden', async () => {
			await renderHeader(false);

			const toggler = screen.getByRole('button');
			toggler.focus();

			expect(toggler).not.toHaveFocus();
		});

		// El clic y la exclusión del árbol de accesibilidad los decide el navegador, no happy-dom: acá se
		// afirma que el estado queda declarado, y el e2e comprueba lo que ese atributo produce de verdad.
		// Se afirma sobre el ancestro y no sobre la franja que colapsa: lo inerte es el componente entero,
		// que es el alcance que incluye también al menú desplegable y a su backdrop.
		it('should mark the whole component inert while hidden', async () => {
			const { fixture } = await renderHeader(false);

			expect(fixture.nativeElement).toHaveAttribute('inert');
		});

		it('should leave the component interactive while visible', async () => {
			const { fixture } = await renderHeader(true);

			expect(fixture.nativeElement).not.toHaveAttribute('inert');
		});

		// El foco que ya estaba adentro cuando la barra se oculta lo suelta el navegador, y solo él:
		// `happy-dom` consulta los ancestros inertes al enfocar, pero no reevalúa un foco ya puesto. Ese
		// caso vive en el e2e.
	});
});
