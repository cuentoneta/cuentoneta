import { render, RenderResult, screen } from '@testing-library/angular';
import { HeaderComponent } from './header.component';
import { ContentService } from 'src/app/providers/content.service';
import { provideMock } from '@testing-library/angular/jest-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule, NgOptimizedImage } from '@angular/common';

xdescribe('HeaderComponent', () => {
	let component: RenderResult<HeaderComponent, HeaderComponent>;

	beforeEach(async () => {
		component = await render(HeaderComponent, {
			componentImports: [CommonModule, NgOptimizedImage, RouterTestingModule, HttpClientTestingModule],
			componentProviders: [provideMock(ContentService)],
		});
	});

	test('should render Header component', async () => {
		expect(component).toBeTruthy();
		expect(screen.getByAltText(/Cuentoneta/)).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Inicio' })).toHaveProperty('href', expect.stringMatching(/home/));
		expect(screen.getByRole('link', { name: 'Nosotros' })).toHaveProperty('href', expect.stringMatching(/about/));
	});
});
