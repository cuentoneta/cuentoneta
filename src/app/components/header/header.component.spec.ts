import { render, screen } from '@testing-library/angular';
import { HeaderComponent } from './header.component';
import { ContentService } from 'src/app/providers/content.service';
import { provideMock } from '@testing-library/angular/jest-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule, NgOptimizedImage } from '@angular/common';

xdescribe('HeaderComponent', () => {
	const setup = async () => {
		return await render(HeaderComponent, {
			componentImports: [CommonModule, NgOptimizedImage, RouterTestingModule, HttpClientTestingModule],
			componentProviders: [provideMock(ContentService)],
		});
	};

	test('should render Header component', async () => {
		const view = setup();
		expect(view).toBeTruthy();
		expect(screen.getByAltText(/Cuentoneta/)).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Inicio' })).toHaveProperty('href', expect.stringMatching(/home/));
		expect(screen.getByRole('link', { name: 'Nosotros' })).toHaveProperty('href', expect.stringMatching(/about/));
	});
});
