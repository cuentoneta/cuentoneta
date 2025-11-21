import { AuthorTeaserComponent } from './author-teaser.component';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { render, screen } from '@testing-library/angular';
import { authorTeaserMock } from '../../mocks/author.mock';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import userEvent from '@testing-library/user-event';

@Component({
	template: '<p>Mock Author Page</p>',
})
class MockAuthorPageComponent {}

describe('AuthorTeaserComponent', () => {
	const mockRoutes = [{ path: 'author/:slug', component: MockAuthorPageComponent }];

	const setup = async (variant: 'sm' | 'md' = 'sm') => {
		return await render(AuthorTeaserComponent, {
			componentImports: [CommonModule, NgOptimizedImage, RouterModule],
			providers: [provideRouter(mockRoutes)],
			inputs: {
				author: authorTeaserMock,
				variant,
			},
		});
	};

	test('should render', async () => {
		const view = await setup();
		expect(view).toBeTruthy();
	});

	test("should display the author's name", async () => {
		await setup();
		expect(screen.getByText(authorTeaserMock.name)).toBeInTheDocument();
	});

	test("should display the author's image with correct alt text", async () => {
		await setup();
		const img = screen.getByAltText(`Retrato de ${authorTeaserMock.name}`);
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('src', expect.stringContaining(authorTeaserMock.imageUrl));
	});

	test('should display the nationality flag and country name if available', async () => {
		await setup();
		const flag = screen.getByAltText(`Bandera de ${authorTeaserMock.nationality.country}`);
		expect(flag).toBeInTheDocument();
		expect(screen.getByText(authorTeaserMock.nationality.country)).toBeInTheDocument();
	});

	test('should apply correct styles for "sm" variant', async () => {
		await setup('sm');
		const img = screen.getByAltText(`Retrato de ${authorTeaserMock.name}`);
		expect(img).toHaveClass('h-[40px] w-[40px] rounded-sm');
	});

	test('should apply correct styles for "md" variant', async () => {
		await setup('md');
		const img = screen.getByAltText(`Retrato de ${authorTeaserMock.name}`);
		expect(img).toHaveClass('h-[64px] w-[64px] rounded-md');
	});

	test('should navigate to the correct route when clicked', async () => {
		const { fixture } = await setup();
		const router = fixture.debugElement.injector.get(Router);
		const navigateSpy = jest.spyOn(router, 'navigateByUrl');

		const link = screen.getByRole('link');
		await userEvent.click(link);
		await fixture.whenStable();

		expect(navigateSpy).toHaveBeenCalled();

		// Se obtiene el argumento de la llamada a navigateByUrl
		const calledWith = navigateSpy.mock.calls[0][0];

		// Serializa el UrlTree a string
		const url = typeof calledWith === 'string' ? calledWith : router.serializeUrl(calledWith);

		expect(url).toBe(`/author/${authorTeaserMock.slug}`);
	});
});
