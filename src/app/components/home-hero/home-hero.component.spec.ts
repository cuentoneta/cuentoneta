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
	});

	describe('Portadas ilustrativas', () => {
		const covers = ['https://cdn.sanity.io/uno.jpg', 'https://cdn.sanity.io/dos.jpg'];

		it('should render one cover per image it receives', async () => {
			await render(HomeHeroComponent, { inputs: { covers } });

			expect(screen.getAllByTestId('cover-image')).toHaveLength(covers.length);
		});

		// Son decorativas: el enlace y el nombre los aporta el contenido, no la banda.
		it('should leave the covers out of the accessibility tree', async () => {
			await render(HomeHeroComponent, { inputs: { covers } });

			screen.getAllByTestId('cover-image').forEach((cover) => expect(cover).toHaveAttribute('alt', ''));
			expect(screen.queryAllByRole('img')).toHaveLength(0);
		});

		// Sin portadas no queda un contenedor vacío ocupando su lugar en la fila.
		it('should render no cover strip when there are no images', async () => {
			await render(HomeHeroComponent);

			expect(screen.queryByTestId('hero-covers')).not.toBeInTheDocument();
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
