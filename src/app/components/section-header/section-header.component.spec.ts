import { render, screen } from '@testing-library/angular';
import { provideRouter, RouterLink } from '@angular/router';

import { SectionHeaderComponent } from './section-header.component';
import { ButtonComponent } from '@components/button/button.component';

describe('SectionHeaderComponent', () => {
	const defaultProviders = [provideRouter([])];
	// `componentImports` reemplaza los imports del componente bajo prueba, no los suma. Sin `RouterLink` el
	// enlace de la acción se renderiza como un `<a>` sin `href` y deja de tener rol de link.
	const defaultImports = [SectionHeaderComponent, RouterLink, ButtonComponent];

	describe('Renderizado del componente', () => {
		it('should display the heading as a level 2 heading', async () => {
			await render(SectionHeaderComponent, {
				inputs: { heading: 'Colecciones' },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByRole('heading', { name: 'Colecciones', level: 2 })).toBeInTheDocument();
		});

		it('should display the subtitle when it is provided', async () => {
			await render(SectionHeaderComponent, {
				inputs: { heading: 'Colecciones', subtitle: 'Obras agrupadas por temas, estilos y universos en común' },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByText('Obras agrupadas por temas, estilos y universos en común')).toBeInTheDocument();
		});

		it('should omit the subtitle when it is empty', async () => {
			const { container } = await render(SectionHeaderComponent, {
				inputs: { heading: 'Sobre La Cuentoneta' },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(container.textContent?.trim()).toBe('Sobre La Cuentoneta');
		});
	});

	describe('Acción hacia el índice de la sección', () => {
		it('should expose the accessible name and destination of the action', async () => {
			await render(SectionHeaderComponent, {
				inputs: {
					heading: 'Colecciones',
					actionLink: ['/', 'collection'],
					actionAriaLabel: 'Ver todas las colecciones',
				},
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByRole('link', { name: 'Ver todas las colecciones' })).toHaveAttribute('href', '/collection');
		});

		it('should keep the visible label fixed regardless of the accessible name', async () => {
			await render(SectionHeaderComponent, {
				inputs: {
					heading: 'Colecciones',
					actionLink: ['/', 'collection'],
					actionAriaLabel: 'Ver todas las colecciones',
				},
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByRole('link', { name: 'Ver todas las colecciones' })).toHaveTextContent('Ver todo');
		});

		it('should render no link when no destination is provided', async () => {
			await render(SectionHeaderComponent, {
				inputs: { heading: 'Sobre La Cuentoneta' },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.queryAllByRole('link')).toHaveLength(0);
		});
	});
});
