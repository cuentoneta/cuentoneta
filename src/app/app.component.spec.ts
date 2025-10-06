import { AppComponent } from './app.component';
import { render } from '@testing-library/angular';
import { NgOptimizedImage } from '@angular/common';
import { provideRouter, RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AnalyticsService } from './providers/analytics/analytics.service';
import { AnalyticsMockService } from './providers/analytics/analytics.mock.service';

describe('AppComponent', () => {
	const setup = async () => {
		return await render(AppComponent, {
			componentImports: [HeaderComponent, FooterComponent, NgOptimizedImage, RouterModule],
			providers: [provideRouter([]), { provide: AnalyticsService, useClass: AnalyticsMockService }],
		});
	};

	it('should create the app', async () => {
		const view = setup();
		expect(view).toBeTruthy();
	});
});
