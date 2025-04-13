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
		<header cuentoneta-header class="h-16 w-full border-b-1 border-gray-200 bg-white"></header>
		<div class="flex w-full flex-col overflow-y-scroll">
			<div class="mx-5 my-8 w-full flex-1 md:mx-auto md:max-w-screen-md">
				<router-outlet />
			</div>
			<cuentoneta-footer />
		</div>
	`,
	imports: [CommonModule, FooterComponent, HeaderComponent, RouterModule],
	providers: [AnalyticsService],
	styles: `
		:host {
			@apply grid h-svh grid-rows-[65px_1fr] overflow-y-scroll;
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
