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

	// El slug `recurso-original` mapea a `faSolidMedal` en iconMappers. Que el SVG del DOM sea exactamente
	// ese ícono es lo que prueba de qué lado sale, e impide reconectar el componente a un campo del CMS.
	// Se consulta con `hidden: true` porque el ícono es decorativo (`aria-hidden`).
	it('should resolve the icon from the resource type slug, not from the icon shipped by the CMS', async () => {
		await setup();

		const renderedIcon = screen.getByRole('img', { hidden: true });

		expect(renderedIcon.innerHTML).toContain(pathOf(faSolidMedal));
	});
});
