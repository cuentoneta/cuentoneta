import { Component, inject } from '@angular/core';

import { HeaderComponent } from '@components/header/header.component';
import { FooterComponent } from '@components/footer/footer.component';
import { RouterModule } from '@angular/router';
import { environment } from './environments/environment';

// Services
import { AnalyticsService } from './providers/analytics/analytics.service';
import { LayoutService } from './providers/layout.service';

@Component({
	selector: 'cuentoneta-root',
	template: `
		<cuentoneta-header [isVisible]="isHeaderVisible()" />
		<router-outlet />
		<cuentoneta-footer />
	`,
	imports: [FooterComponent, HeaderComponent, RouterModule],
	providers: [AnalyticsService],
})
export class AppComponent {
	private readonly analytics = inject(AnalyticsService);
	private readonly layoutService = inject(LayoutService);

	protected readonly isHeaderVisible = this.layoutService.isHeaderVisible;

	constructor() {
		if (environment.environment === 'production') {
			void this.analytics.init();
		}
	}
}
