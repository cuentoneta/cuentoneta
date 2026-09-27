import { render, screen } from '@testing-library/angular';
import { provideRouter, RouterLink } from '@angular/router';

import { SectionHeader } from './section-header';
import { Button } from '@components/button/button';

describe('SectionHeader', () => {
	const defaultProviders = [provideRouter([])];
	// `componentImports` reemplaza los imports del componente bajo prueba, no los suma. Sin `RouterLink` el
	// enlace de la acción se renderiza como un `<a>` sin `href` y deja de tener rol de link.
	const defaultImports = [SectionHeader, RouterLink, Button];

	describe('Renderizado del componente', () => {
		it('should display the heading as a level 2 heading', async () => {
			await render(SectionHeader, {
				inputs: { heading: 'Colecciones' },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByRole('heading', { name: 'Colecciones', level: 2 })).toBeInTheDocument();
		});

		it('should display the subtitle when it is provided', async () => {
			await render(SectionHeader, {
				inputs: { heading: 'Colecciones', subtitle: 'Obras agrupadas por temas, estilos y universos en común' },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByText('Obras agrupadas por temas, estilos y universos en común')).toBeInTheDocument();
		});

		// Se parte de la bajada presente para que la ausencia signifique algo: afirmar que un texto que
		// nunca se pasó no está sería verde por construcción.
		it('should omit the subtitle when it is empty', async () => {
			const subtitle = 'Obras agrupadas por temas, estilos y universos en común';
			const { rerender } = await render(SectionHeader, {
				inputs: { heading: 'Colecciones', subtitle },
				providers: defaultProviders,
				componentImports: defaultImports,
			});
			expect(screen.getByText(subtitle)).toBeInTheDocument();

			await rerender({ inputs: { heading: 'Colecciones', subtitle: '' } });

			expect(screen.queryByText(subtitle)).not.toBeInTheDocument();
		});
	});

	describe('Acción hacia el índice de la sección', () => {
		const action = { link: ['/', 'collection'], accessibleSuffix: 'el índice de colecciones' };

		it('should point the action at the destination it receives', async () => {
			await render(SectionHeader, {
				inputs: { heading: 'Colecciones', action },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByRole('link', { name: 'Ver todo el índice de colecciones' })).toHaveAttribute(
				'href',
				'/collection',
			);
		});

		// WCAG 2.5.3: el nombre accesible tiene que contener el texto visible, porque quien usa control por
		// voz dice lo que ve. El sufijo extiende ese texto en vez de reemplazarlo.
		it('should extend the visible label instead of replacing it', async () => {
			await render(SectionHeader, {
				inputs: { heading: 'Colecciones', action },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const link = screen.getByRole('link', { name: 'Ver todo el índice de colecciones' });

			expect(link).toHaveAccessibleName(expect.stringContaining('Ver todo'));
			expect(link).toHaveTextContent('Ver todo');
		});

		it('should render no link when no action is provided', async () => {
			await render(SectionHeader, {
				inputs: { heading: 'Sobre La Cuentoneta' },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.queryAllByRole('link')).toHaveLength(0);
		});
	});
});
