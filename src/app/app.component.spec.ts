import { AppComponent } from './app.component';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgOptimizedImage } from '@angular/common';
import { provideRouter, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@components/header/header.component';
import { FooterComponent } from '@components/footer/footer.component';
import { AnalyticsService } from './providers/analytics/analytics.service';
import { AnalyticsMockService } from './providers/analytics/analytics.mock.service';
import { LayoutService } from './providers/layout.interface';
import { ControllableLayoutService } from './providers/layout.mock';

describe('AppComponent', () => {
	const setup = async () => {
		return await render(AppComponent, {
			componentImports: [HeaderComponent, FooterComponent, NgOptimizedImage, RouterOutlet],
			providers: [
				provideRouter([]),
				{ provide: AnalyticsService, useClass: AnalyticsMockService },
				{ provide: LayoutService, useValue: new ControllableLayoutService() },
			],
		});
	};

	it('should create the app', async () => {
		const view = setup();
		expect(view).toBeTruthy();
	});

	describe('landmark principal', () => {
		it('should declare exactly one main landmark for the whole application', async () => {
			await setup();

			expect(screen.getAllByRole('main')).toHaveLength(1);
		});

		// El `tabindex` es lo que hace que el foco acompañe al salto: sin él el navegador desplaza la
		// página pero deja el foco donde estaba, y la próxima tabulación vuelve a la barra.
		it('should let the skip link move focus into it', async () => {
			await setup();

			const main = screen.getByRole('main');
			expect(main).toHaveAttribute('id', 'main-content');
			expect(main).toHaveAttribute('tabindex', '-1');
		});
	});

	describe('skip link', () => {
		it('should point at the main landmark', async () => {
			await setup();

			expect(screen.getByRole('link', { name: 'Saltar al contenido principal' })).toHaveAttribute(
				'href',
				'#main-content',
			);
		});

		// La aserción que discrimina el defecto real: un skip link declarado después del encabezado pasa
		// las dos anteriores y no le ahorra una sola tabulación a nadie.
		it('should be the first tabbable element of the page', async () => {
			await setup();
			const user = userEvent.setup();

			await user.tab();

			expect(screen.getByRole('link', { name: 'Saltar al contenido principal' })).toHaveFocus();
		});
	});
});
