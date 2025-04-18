import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule } from '@angular/router';
import { environment } from './environments/environment';

// Analytics
import { AnalyticsService } from './providers/analytics.service';

@Component({
	selector: 'cuentoneta-root',
	template: `
		<cuentoneta-header />
		<router-outlet />
		<cuentoneta-footer />
	`,
	imports: [CommonModule, FooterComponent, HeaderComponent, RouterModule],
	providers: [AnalyticsService],
})
export class AppComponent implements OnInit {
	analytics = inject(AnalyticsService);

	async ngOnInit() {
		if (environment.environment !== 'production') {
			return;
		}

		await this.analytics.init();
	}
}
