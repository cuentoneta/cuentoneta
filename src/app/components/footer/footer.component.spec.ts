import { render, screen } from '@testing-library/angular';
import { FooterComponent } from './footer.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('FooterComponent', () => {
	it('should display the logo image correctly', async () => {
		await render(FooterComponent, {
			imports: [RouterTestingModule],
		});

		const logo = screen.getByAltText("Logo de 'La Cuentoneta'");
		expect(logo).toBeInTheDocument();
		expect(logo).toHaveAttribute('src', './assets/svg/logo.svg');
		expect(logo).toHaveAttribute('width', '49');
		expect(logo).toHaveAttribute('height', '26');
	});

	it('should render navigable navLinks', async () => {
		const view = await render(FooterComponent, {
			imports: [RouterTestingModule],
		});

		view.fixture.componentInstance.navLinks.forEach((link) => {
			const navItem = screen.getByRole('link', { name: link.label });
			expect(navItem).toBeInTheDocument();
			expect(screen.getByText(link.label)).toHaveProperty('href', expect.stringMatching(new RegExp(link.path)));
		});
	});

	it('should display social link icons as expected', async () => {
		const view = await render(FooterComponent, {
			imports: [RouterTestingModule],
		});

		view.fixture.componentInstance.socialLinks.forEach((link) => {
			const socialIcon = screen.getByAltText(link.alt);
			expect(socialIcon).toBeInTheDocument();
		});
	});
});
