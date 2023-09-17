import { render, screen } from '@testing-library/angular';
import { HeaderComponent } from './header.component';
import { ContentService } from 'src/app/providers/content.service';
import { provideMock } from '@testing-library/angular/jest-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule, NgOptimizedImage } from '@angular/common';

describe('HeaderComponent', () => {
  test('should render Header component', async () => {
    const component = await render(HeaderComponent, {
      componentImports: [
        CommonModule,
        NgOptimizedImage,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      componentProviders: [provideMock(ContentService)],
    });

    expect(component).toBeTruthy();
    expect(screen.getByAltText(/Cuentoneta/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveProperty('href', expect.stringMatching(/home/))
    expect(screen.getByRole('link', { name: 'Nosotros' })).toHaveProperty('href', expect.stringMatching(/about/));
  });
});
