import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule } from '@angular/router';
import { environment } from './environments/environment';

// Analytics
import Clarity from '@microsoft/clarity';
import { injectSpeedInsights } from '@vercel/speed-insights';

@Component({
	selector: 'cuentoneta-root',
	template: `
		<cuentoneta-header />
		<div class="mx-5 my-0 min-h-screen md:m-auto md:max-w-screen-md">
			<router-outlet />
		</div>
		<cuentoneta-footer />
	`,
	imports: [CommonModule, FooterComponent, HeaderComponent, RouterModule],
})
export class AppComponent implements OnInit {
	ngOnInit(): void {
		if (environment.environment !== 'production') {
			return;
		}

		// Inicializa Speed Insights de Vercel
		injectSpeedInsights();

		if (!environment.clarityProjectId) {
			return;
		}

		// Inicialización Microsoft Clarity para analytics
		Clarity.init(environment.clarityProjectId);
		Clarity.consent();
		console.log(Clarity);
	}
}
