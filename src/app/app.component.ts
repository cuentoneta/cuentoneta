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
