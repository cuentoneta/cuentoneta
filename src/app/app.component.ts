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
		<header cuentoneta-header class="fixed top-0 z-10 min-h-16 w-full border-b-1 border-gray-200 bg-white"></header>
		<div class="inner-container mx-5 mt-18 md:mx-auto md:mt-32 md:max-w-screen-md">
			<router-outlet />
		</div>
		<cuentoneta-footer />
	`,
	imports: [CommonModule, FooterComponent, HeaderComponent, RouterModule],
	providers: [AnalyticsService],
	styles: `
		.inner-container {
			min-height: calc(100svh - 81px - 98px);
		}
	`,
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
