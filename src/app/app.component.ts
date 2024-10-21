import { Component, OnInit } from '@angular/core';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule } from '@angular/router';

@Component({
	standalone: true,
	selector: 'cuentoneta-root',
	template: `
		<cuentoneta-header />
		<div class="mx-5 my-0 min-h-screen md:m-auto md:max-w-screen-md">
			<router-outlet />
		</div>
		<cuentoneta-footer />
	`,
	imports: [CommonModule, FooterComponent, HeaderComponent, NgOptimizedImage, RouterModule],
})
export class AppComponent implements OnInit {
	ngOnInit(): void {
		// Invoca a injectSpeedInsights aquí para asegurarse de que se ejecute en el lado del cliente.
		injectSpeedInsights();
	}
}
