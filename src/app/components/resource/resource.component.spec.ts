import { render, screen } from '@testing-library/angular';
import { faSolidMedal } from '@ng-icons/font-awesome/solid';
import { ResourceComponent } from './resource.component';
import { resourceMock } from '@mocks/resource.mock';

// Los íconos de @ng-icons son el SVG completo como string; el `path` es lo que los distingue entre sí.
function pathOf(icon: string): string {
	const [, path] = /d="([^"]+)"/.exec(icon) ?? [];
	return path;
}

describe('ResourceComponent', () => {
	const regexTitle = new RegExp(resourceMock.title, 'i');
	const url = resourceMock.url;

	const setup = async () => {
		return await render(ResourceComponent, {
			inputs: {
				resource: resourceMock,
			},
		});
	};

	it('should render the component', async () => {
		const { container } = await setup();

		expect(container).toBeInTheDocument();
	});

	it('should render title', async () => {
		await setup();
		const titleResourceElement = screen.getByTitle(regexTitle);

		expect(titleResourceElement).toBeInTheDocument();
	});

	it('should confirm the URL of the link', async () => {
		await setup();
		const linkResourceElement = screen.getByRole('link');

		expect(linkResourceElement).toHaveAttribute('href', url);
	});

	// El destino es una URL del CMS que se abre en otra pestaña: sin el `rel`, esa pestaña conserva una
	// referencia a la nuestra y puede reescribir su ubicación.
	it('should deny the opened tab a reference back', async () => {
		await setup();

		expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
	});

	// El tamaño es un eje del primitivo, no una variante de quien lo monta: la columna de perfil de la
	// página de autor reserva 40 px y el resto del sitio usa los 48 del default.
	it('should render at the default size', async () => {
		await setup();

		expect(screen.getByRole('link')).toHaveClass('h-12', 'w-12');
	});

	it('should render at the reduced size when asked for it', async () => {
		await render(ResourceComponent, { inputs: { resource: resourceMock, size: 'sm' } });

		expect(screen.getByRole('link')).toHaveClass('h-10', 'w-10');
	});

	// El slug `recurso-original` mapea a `faSolidMedal` en iconMappers. Que el SVG del DOM sea exactamente
	// ese ícono es lo que prueba de qué lado sale, e impide reconectar el componente a un campo del CMS.
	// Se consulta con `hidden: true` porque el ícono es decorativo (`aria-hidden`).
	it('should resolve the icon from the resource type slug, not from the icon shipped by the CMS', async () => {
		await setup();

		const renderedIcon = screen.getByRole('img', { hidden: true });

		expect(renderedIcon.innerHTML).toContain(pathOf(faSolidMedal));
	});
});
