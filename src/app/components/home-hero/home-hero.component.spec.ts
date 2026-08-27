import { render, screen } from '@testing-library/angular';

import { HomeHeroComponent } from './home-hero.component';

describe('HomeHeroComponent', () => {
	describe('Renderizado del componente', () => {
		it('should carry the page heading', async () => {
			await render(HomeHeroComponent);

			expect(
				screen.getByRole('heading', { level: 1, name: 'Un espacio para explorar y descubrir nuevas obras' }),
			).toBeInTheDocument();
		});

		it('should describe what the site offers', async () => {
			await render(HomeHeroComponent);

			expect(screen.getByText(/relatos organizados en colecciones/)).toBeInTheDocument();
		});

		// El trazo es decoración: aporta la forma del diseño y nada que leer, así que no entra al árbol de
		// accesibilidad ni compite con el encabezado por nombrar la banda.
		it('should draw the background stroke as decoration', async () => {
			await render(HomeHeroComponent);

			expect(screen.getByTestId('hero-weave')).toHaveAttribute('alt', '');
			expect(screen.queryAllByRole('img')).toHaveLength(0);
		});
	});

	describe('Contenido proyectado', () => {
		it('should render what the page projects below the heading', async () => {
			await render('<cuentoneta-home-hero><p>Carrusel de campañas</p></cuentoneta-home-hero>', {
				imports: [HomeHeroComponent],
			});

			expect(screen.getByText('Carrusel de campañas')).toBeInTheDocument();
		});
	});
});
