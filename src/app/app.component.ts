import { afterNextRender, Component, inject, OnInit, signal } from '@angular/core';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule } from '@angular/router';
import { environment } from './environments/environment';

// Services
import { AnalyticsService } from './providers/analytics.service';
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
	providers: [AnalyticsService],
})
export class AppComponent implements OnInit {
	private readonly analytics = inject(AnalyticsService);
	private readonly isHeaderVisible$ = inject(LayoutService).isHeaderVisible$.pipe(takeUntilDestroyed());

	readonly isHeaderVisible = signal(true);

	constructor() {
		afterNextRender(() => {
			this.isHeaderVisible$.subscribe((isVisible) => {
				this.isHeaderVisible.set(isVisible);
			});
		});
	}

	async ngOnInit() {
		if (environment.environment !== 'production') {
			return;
		}
		await this.analytics.init();
	}
}
