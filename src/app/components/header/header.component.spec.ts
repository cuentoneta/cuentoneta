import { render, screen } from '@testing-library/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { provideMock } from '@testing-library/angular/jest-utils';

import { HeaderComponent } from './header.component';
import { ContentService } from 'src/app/providers/content.service';

describe('HeaderComponent', () => {
	it('should render Header component', async () => {
		const { container } = await render(HeaderComponent, {
			componentImports: [CommonModule, NgOptimizedImage, RouterTestingModule, HttpClientTestingModule],
			componentProviders: [provideMock(ContentService)],
		});

		expect(container).toBeInTheDocument();
	});

	it('should show the Cuentoneta alt text', async () => {
		await render(HeaderComponent, {
			componentImports: [CommonModule, NgOptimizedImage, RouterTestingModule, HttpClientTestingModule],
			componentProviders: [provideMock(ContentService)],
		});

		expect(screen.getByAltText(/Cuentoneta/)).toBeInTheDocument();
	});

	it('should show the navbar links', async () => {
		await render(HeaderComponent, {
			componentImports: [CommonModule, NgOptimizedImage, RouterTestingModule, HttpClientTestingModule],
			componentProviders: [provideMock(ContentService)],
		});

		expect(screen.getByText(/Inicio/)).toHaveProperty('href', expect.stringMatching(/home/));
		expect(screen.getByText(/Nosotros/)).toHaveProperty('href', expect.stringMatching(/about/));
	});
});
