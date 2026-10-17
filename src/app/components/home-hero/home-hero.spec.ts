import { render, screen } from '@testing-library/angular';

import { installIntersectionObserverStub } from '@testing/intersection-observer.stub';
import { LayoutService } from '../../providers/layout.interface';
import { ControllableLayoutService } from '../../providers/layout.mock';
import { HomeHero } from './home-hero';

let layout: ControllableLayoutService;

function setup(template = '<cuentoneta-home-hero />') {
	layout = new ControllableLayoutService();
	return render(template, {
		imports: [HomeHero],
		providers: [{ provide: LayoutService, useValue: layout }],
	});
}

describe('HomeHero', () => {
	beforeEach(() => installIntersectionObserverStub());

	describe('Declaración ante el layout', () => {
		// El hero declara que la barra fija lo cubre: sin su `HeaderBand` en `hostDirectives`, la barra no
		// soltaría el fondo y solo lo notaría el e2e, que necesita build y server.
		it('should declare itself as the band the header sits over', async () => {
			await setup();

			expect(layout.isHeaderOverBand()).toBe(true);
		});
	});

	describe('Renderizado del componente', () => {
		it('should carry the page heading', async () => {
			await setup();

			expect(
				screen.getByRole('heading', { level: 1, name: 'Un espacio para explorar y descubrir nuevas obras' }),
			).toBeInTheDocument();
		});

		it('should describe what the site offers', async () => {
			await setup();

			expect(screen.getByText(/relatos organizados en colecciones/)).toBeInTheDocument();
		});

		// El trazo es decoración: aporta la forma del diseño y nada que leer, así que no entra al árbol de
		// accesibilidad ni compite con el encabezado por nombrar la banda.
		it('should draw the background stroke as decoration', async () => {
			await setup();

			expect(screen.getByTestId('hero-weave')).toHaveAttribute('alt', '');
			expect(screen.queryAllByRole('img')).toHaveLength(0);
		});
	});

	describe('Contenido proyectado', () => {
		it('should render what the page projects below the heading', async () => {
			await setup('<cuentoneta-home-hero><p>Carrusel de campañas</p></cuentoneta-home-hero>');

			expect(screen.getByText('Carrusel de campañas')).toBeInTheDocument();
		});
	});
});
