import { Component, inject } from '@angular/core';

import { HeaderComponent } from '@components/header/header.component';
import { FooterComponent } from '@components/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { environment } from './environments/environment';

// Services
import { AnalyticsService } from './providers/analytics/analytics.service';
import { LayoutService } from './providers/layout.interface';

@Component({
	selector: 'cuentoneta-root',
	template: `
		<!-- Primero en el DOM para ser el primer foco tabulable, y por eso mismo en floating y no en nav:
		     ante empate con la barra perdería por orden de documento. -->
		<a
			class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-floating focus:rounded-md focus:bg-neutral-900 focus:px-4 focus:py-2 focus:font-inter focus:text-sm focus:text-white"
			href="#main-content"
		>
			Saltar al contenido principal
		</a>
		<cuentoneta-header [isVisible]="isHeaderVisible()" />
		<!-- Padding y no margen: el opt-out de una página depende de eso — ver angular-components.md,
		     "Layout del shell". -->
		<main id="main-content" class="pt-header-height" tabindex="-1">
			<router-outlet />
		</main>
		@defer (hydrate on viewport) {
			<cuentoneta-footer />
		} @placeholder {
			<div></div>
		}
	`,
	imports: [FooterComponent, HeaderComponent, RouterOutlet],
	providers: [AnalyticsService],
})
export class AppComponent {
	private readonly analytics = inject(AnalyticsService);
	protected readonly isHeaderVisible = inject(LayoutService).isHeaderVisible;

	constructor() {
		if (environment.environment === 'production') {
			void this.analytics.init();
		}
	}
}
