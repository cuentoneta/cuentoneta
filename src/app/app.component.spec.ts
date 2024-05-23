import { AppComponent } from './app.component';
import { render, RenderResult } from '@testing-library/angular';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMock } from '@testing-library/angular/jest-utils';
import { ContentService } from './providers/content.service';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

describe('AppComponent', () => {
	let component: RenderResult<AppComponent, AppComponent>;

	beforeEach(async () => {
		component = await render(AppComponent, {
			componentImports: [HeaderComponent, FooterComponent, CommonModule, NgOptimizedImage, RouterTestingModule],
			componentProviders: [provideMock(ContentService)],
		});
	});

	it('should create the app', () => {
		expect(component).toBeTruthy();
	});
});
