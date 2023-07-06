import { render, screen } from '@testing-library/angular';
import { HeaderComponent } from './header.component';
import { ContentService } from 'src/app/providers/content.service';
import { provideMock } from '@testing-library/angular/jest-utils';

describe('HeadercComponent', () => {
  test('should render Header component', async () => {
    await render(HeaderComponent, {
      componentProviders: [provideMock(ContentService)]
    });
    expect(screen).toBeTruthy();
    expect(screen.getByAltText(/Cuentoneta/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveProperty('href', expect.stringMatching(/home/))
    expect(screen.getByRole('link', { name: 'Nosotros' })).toHaveProperty('href', expect.stringMatching(/about/));
  });
});