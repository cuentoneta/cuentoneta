import { afterNextRender, Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';

import { HeaderComponent } from '@components/header/header.component';
import { FooterComponent } from '@components/footer/footer.component';
import { RouterModule } from '@angular/router';
import { environment } from './environments/environment';

// Services
import { AnalyticsService } from './providers/analytics/analytics.service';
import { LayoutService } from './providers/layout.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
	selector: 'cuentoneta-root',
	template: `
		<cuentoneta-header [isVisible]="isHeaderVisible()" />
		<router-outlet />
		<cuentoneta-footer />
	`,
	imports: [FooterComponent, HeaderComponent, RouterModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [AnalyticsService],
})
export class AppComponent {
	private readonly analytics = inject(AnalyticsService);
	private readonly isHeaderVisible$ = inject(LayoutService).isHeaderVisible$.pipe(takeUntilDestroyed());

	protected readonly isHeaderVisible = signal(true);

	constructor() {
		afterNextRender(() => {
			this.isHeaderVisible$.subscribe((isVisible) => {
				this.isHeaderVisible.set(isVisible);
			});
		});

		if (environment.environment === 'production') {
			void this.analytics.init();
		}
	}
}
