import { Component, OnInit } from '@angular/core';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'cuentoneta-root',
	template: `
		<cuentoneta-header />
		<div class="inner-container mx-5 my-0 md:m-auto md:max-w-screen-md">
			<router-outlet />
		</div>
		<cuentoneta-footer />
	`,
	imports: [CommonModule, FooterComponent, HeaderComponent, RouterModule],
	styles: `
		.inner-container {
			min-height: calc(100svh - 81px - 98px);
		}
	`,
})
export class AppComponent implements OnInit {
	ngOnInit(): void {
		// Invoca a injectSpeedInsights aquí para asegurarse de que se ejecute en el lado del cliente.
		injectSpeedInsights();
	}
}
