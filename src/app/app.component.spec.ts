import { AppComponent } from './app.component';
import { render } from '@testing-library/angular';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMock } from '@testing-library/angular/jest-utils';
import { ContentService } from './providers/content.service';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AnalyticsService } from './providers/analytics.service';

describe('AppComponent', () => {
	const setup = async () => {
		return await render(AppComponent, {
			componentImports: [HeaderComponent, FooterComponent, CommonModule, NgOptimizedImage, RouterTestingModule],
			componentProviders: [provideMock(ContentService), provideMock(AnalyticsService)],
		});
	};

	it('should create the app', async () => {
		const view = setup();
		expect(view).toBeTruthy();
	});
});
