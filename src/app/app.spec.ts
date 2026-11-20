import { App } from './app';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgOptimizedImage } from '@angular/common';
import { provideRouter, RouterOutlet } from '@angular/router';
import { Header } from '@components/header/header';
import { Footer } from '@components/footer/footer';
import { AnalyticsService } from './providers/analytics/analytics.service';
import { StubAnalyticsService } from './providers/analytics/analytics.mock.service';
import { LayoutService } from './providers/layout.interface';
import { ControllableLayoutService } from './providers/layout.mock';

describe('App', () => {
	let layout: ControllableLayoutService;

	const renderShell = async () => {
		layout = new ControllableLayoutService();
		return await render(App, {
			componentImports: [Header, Footer, NgOptimizedImage, RouterOutlet],
			providers: [
				provideRouter([]),
				{ provide: AnalyticsService, useClass: StubAnalyticsService },
				{ provide: LayoutService, useValue: layout },
			],
		});
	};

	it('should create the app', async () => {
		const view = renderShell();
		expect(view).toBeTruthy();
	});

	describe('landmark principal', () => {
		it('should declare exactly one main landmark for the whole application', async () => {
			await renderShell();

			expect(screen.getAllByRole('main')).toHaveLength(1);
		});

		// Sin `tabindex` el navegador desplaza la página pero deja el foco en la barra.
		it('should expose the landmark as a focusable skip target', async () => {
			await renderShell();

			const main = screen.getByRole('main');
			expect(main).toHaveAttribute('id', 'main-content');
			expect(main).toHaveAttribute('tabindex', '-1');
		});
	});

	describe('skip link', () => {
		it('should point at the main landmark', async () => {
			await renderShell();

			expect(screen.getByRole('link', { name: 'Saltar al contenido principal' })).toHaveAttribute(
				'href',
				'#main-content',
			);
		});

		// La que discrimina el defecto real: uno declarado tras el encabezado pasa las dos anteriores igual.
		it('should be the first tabbable element of the page', async () => {
			await renderShell();
			const user = userEvent.setup();

			await user.tab();

			expect(screen.getByRole('link', { name: 'Saltar al contenido principal' })).toHaveFocus();
		});
	});

	// Sin este cableado, la banda de la página no llega al encabezado: el shell es el único que ve a los dos.
	describe('encabezado sobre la banda', () => {
		it('should hand the band state of the layout to the header', async () => {
			const { detectChanges } = await renderShell();

			layout.isHeaderOverBand.set(true);
			detectChanges();

			expect(screen.getByRole('banner')).not.toHaveClass('bg-neutral-50');
		});
	});
});
