import { render, screen } from '@testing-library/angular';

import { HomeHero } from './home-hero';

describe('HomeHero', () => {
	describe('Renderizado del componente', () => {
		it('should carry the page heading', async () => {
			await render(HomeHero);

			expect(
				screen.getByRole('heading', { level: 1, name: 'Un espacio para explorar y descubrir nuevas obras' }),
			).toBeInTheDocument();
		});

		it('should describe what the site offers', async () => {
			await render(HomeHero);

			expect(screen.getByText(/relatos organizados en colecciones/)).toBeInTheDocument();
		});

		// El trazo es decoración: aporta la forma del diseño y nada que leer, así que no entra al árbol de
		// accesibilidad ni compite con el encabezado por nombrar la banda.
		it('should draw the background stroke as decoration', async () => {
			await render(HomeHero);

			expect(screen.getByTestId('hero-weave')).toHaveAttribute('alt', '');
			expect(screen.queryAllByRole('img')).toHaveLength(0);
		});
	});

	describe('Contenido proyectado', () => {
		it('should render what the page projects below the heading', async () => {
			await render('<cuentoneta-home-hero><p>Carrusel de campañas</p></cuentoneta-home-hero>', {
				imports: [HomeHero],
			});

			expect(screen.getByText('Carrusel de campañas')).toBeInTheDocument();
		});
	});
});
