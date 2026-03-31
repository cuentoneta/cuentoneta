import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { ButtonComponent } from './button.component';
describe('ButtonComponent', () => {
	describe('on button element', () => {
		it('should render the component on a button element', async () => {
			const { container } = await render(`<button cuentoneta-button>Click me</button>`, {
				imports: [ButtonComponent],
			});
			expect(container).toBeTruthy();
			expect(screen.getByRole('button')).toBeInTheDocument();
		});
		it('should display the button text', async () => {
			await render(`<button cuentoneta-button>Ver todo</button>`, {
				imports: [ButtonComponent],
			});
			expect(screen.getByText('Ver todo')).toBeInTheDocument();
		});
		it('should apply filled type classes by default', async () => {
			await render(`<button cuentoneta-button>Filled</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('bg-white');
			expect(button).toHaveClass('px-6');
			expect(button).toHaveClass('py-3');
			expect(button).toHaveClass('text-sm');
			expect(button).not.toHaveClass('border');
		});
		it('should apply outline type classes', async () => {
			await render(`<button cuentoneta-button type="outline">Outline</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('bg-white');
			expect(button).toHaveClass('border');
			expect(button).toHaveClass('border-neutral-300');
			expect(button).toHaveClass('px-6');
			expect(button).toHaveClass('py-3');
		});
		it('should apply share type classes', async () => {
			await render(`<button cuentoneta-button type="share">Share</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('bg-neutral-100');
			expect(button).toHaveClass('px-3');
			expect(button).toHaveClass('py-2');
			expect(button).toHaveClass('text-xs');
			expect(button).toHaveClass('gap-1');
		});
	});
	describe('on anchor element', () => {
		const defaultProviders = [provideRouter([])];
		it('should render the component on an anchor element', async () => {
			const { container } = await render(`<a cuentoneta-button href="/test">Link</a>`, {
				imports: [ButtonComponent],
				providers: defaultProviders,
			});
			expect(container).toBeTruthy();
			expect(screen.getByRole('link')).toBeInTheDocument();
		});
		it('should display the link text', async () => {
			await render(`<a cuentoneta-button href="/storylist">Ver todo</a>`, {
				imports: [ButtonComponent],
				providers: defaultProviders,
			});
			expect(screen.getByText('Ver todo')).toBeInTheDocument();
		});
		it('should apply outline type classes on anchor', async () => {
			await render(`<a cuentoneta-button type="outline" href="/test">Outline Link</a>`, {
				imports: [ButtonComponent],
				providers: defaultProviders,
			});
			const link = screen.getByRole('link');
			expect(link).toHaveClass('bg-white');
			expect(link).toHaveClass('border');
			expect(link).toHaveClass('border-neutral-300');
		});
		it('should have no-underline class', async () => {
			await render(`<a cuentoneta-button href="/test">Link</a>`, {
				imports: [ButtonComponent],
				providers: defaultProviders,
			});
			const link = screen.getByRole('link');
			expect(link).toHaveClass('no-underline');
		});
	});
	describe('common styles', () => {
		it('should have rounded-full class', async () => {
			await render(`<button cuentoneta-button>Button</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('rounded-full');
		});
		it('should have font-inter class', async () => {
			await render(`<button cuentoneta-button>Button</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('font-inter');
		});
		it('should have font-semibold class', async () => {
			await render(`<button cuentoneta-button>Button</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('font-semibold');
		});
		it('should have focus-visible ring classes', async () => {
			await render(`<button cuentoneta-button>Button</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('focus-visible:ring-2');
			expect(button).toHaveClass('focus-visible:ring-brand-500');
		});
		it('should have transition classes', async () => {
			await render(`<button cuentoneta-button>Button</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('transition-colors');
			expect(button).toHaveClass('duration-200');
		});
		it('should have disabled state classes', async () => {
			await render(`<button cuentoneta-button>Button</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('disabled:cursor-not-allowed');
			expect(button).toHaveClass('disabled:opacity-50');
		});
	});
	describe('accessibility', () => {
		it('should be focusable', async () => {
			await render(`<button cuentoneta-button>Focusable</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			button.focus();
			expect(button).toHaveFocus();
		});
		it('should support aria-label on button', async () => {
			await render(`<button cuentoneta-button aria-label="Close dialog">X</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button', { name: 'Close dialog' });
			expect(button).toBeInTheDocument();
		});
		it('should support aria-label on anchor', async () => {
			await render(`<a cuentoneta-button href="/test" aria-label="Ver todas las colecciones">Ver todo</a>`, {
				imports: [ButtonComponent],
				providers: [provideRouter([])],
			});
			const link = screen.getByRole('link', { name: 'Ver todas las colecciones' });
			expect(link).toBeInTheDocument();
		});
		it('should support disabled attribute on button', async () => {
			await render(`<button cuentoneta-button disabled>Disabled</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toBeDisabled();
		});
	});
});
