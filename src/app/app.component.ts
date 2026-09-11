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
		<!--
			Primero en el DOM para ser el primer foco tabulable: después del encabezado, los enlaces de la
			barra irían antes y el salto dejaría de ahorrar nada. Se eleva a la capa floating y no a nav
			porque ante empate con la barra perdería por orden de documento, justamente por estar antes.
		-->
		<a
			class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-floating focus:rounded-md focus:bg-neutral-900 focus:px-4 focus:py-2 focus:font-inter focus:text-sm focus:text-white"
			href="#main-content"
		>
			Saltar al contenido principal
		</a>
		<cuentoneta-header [isVisible]="isHeaderVisible()" />
		<!--
			El encabezado es fijo, así que el contenido lo despeja acá y ninguna página vuelve a hacerlo. Es
			padding y no margen para que el margen negativo con el que una página opta por salirse del despeje
			no dependa del colapso de márgenes.
		-->
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
