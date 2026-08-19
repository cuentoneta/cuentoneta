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
	});

	describe('appearance axis', () => {
		it.each([
			['filled', 'bg-white'],
			['outline', 'bg-white'],
			['subtle', 'bg-neutral-100'],
		])('should apply the background of the %s appearance', async (type, background) => {
			await render(`<button cuentoneta-button type="${type}">Botón</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass(background);
			expect(button).toHaveClass('text-neutral-900');
		});

		it('should draw a border only on the outline appearance', async () => {
			await render(`<button cuentoneta-button type="outline">Outline</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('border');
			expect(button).toHaveClass('border-neutral-300');
		});

		it.each(['filled', 'subtle'])('should not draw a visible border on the %s appearance', async (type) => {
			await render(`<button cuentoneta-button type="${type}">Botón</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).not.toHaveClass('border-neutral-300');
			expect(button).toHaveClass('border-transparent');
		});

		// La aserción que prueba que la apariencia no aporta geometría: el padding y el tamaño de
		// fuente los fija el eje `size`, no la apariencia elegida.
		it('should leave the geometry to the size axis', async () => {
			await render(`<button cuentoneta-button type="subtle">Compartir</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('px-6');
			expect(button).toHaveClass('py-3');
			expect(button).toHaveClass('text-sm');
			expect(button).not.toHaveClass('px-3');
			expect(button).not.toHaveClass('text-xs');
		});

		it('should default to the filled appearance', async () => {
			await render(`<button cuentoneta-button>Filled</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('bg-white');
			expect(button).not.toHaveClass('border-neutral-300');
		});

		// El ancho del borde es de la caja y no de la apariencia: las tres lo reservan, así que
		// cambiar de apariencia no mueve el layout.
		it.each(['filled', 'outline', 'subtle'])('should reserve the border width on the %s appearance', async (type) => {
			await render(`<button cuentoneta-button type="${type}">Botón</button>`, {
				imports: [ButtonComponent],
			});
			expect(screen.getByRole('button')).toHaveClass('border');
		});
	});

	describe('size axis', () => {
		it.each([
			['md', ['px-6', 'py-3', 'text-sm', 'gap-2']],
			['xs', ['px-3', 'py-2', 'text-xs', 'gap-1']],
		])('should apply the geometry of the %s size', async (size, classes) => {
			await render(`<button cuentoneta-button size="${size}">Botón</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			classes.forEach((className) => expect(button).toHaveClass(className));
		});

		it('should default to the md size', async () => {
			await render(`<button cuentoneta-button>Botón</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('px-6');
			expect(button).toHaveClass('py-3');
		});

		// La invariancia que falla si alguien vuelve a meter geometría dentro de una apariencia.
		it('should keep the outline appearance intact in the xs size', async () => {
			await render(`<button cuentoneta-button type="outline" size="xs">Botón</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('bg-white');
			expect(button).toHaveClass('border-neutral-300');
			expect(button).toHaveClass('px-3');
		});

		it('should keep the subtle appearance intact in the md size', async () => {
			await render(`<button cuentoneta-button type="subtle" size="md">Botón</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('bg-neutral-100');
			expect(button).toHaveClass('px-6');
		});
	});

	describe('active state', () => {
		it.each(['filled', 'outline', 'subtle'])(
			'should invert the contrast of the %s appearance when active',
			async (type) => {
				await render(`<button cuentoneta-button type="${type}" [active]="true">Botón</button>`, {
					imports: [ButtonComponent],
				});
				const button = screen.getByRole('button');
				expect(button).toHaveClass('bg-neutral-900');
				expect(button).toHaveClass('text-neutral-50');
				expect(button).not.toHaveClass('border-neutral-300');
			},
		);

		// Marcar vigente a un botón `outline` no puede achicarle la caja: en un grupo de opciones,
		// elegir una haría reflowear la fila entera.
		it('should keep the box intact when an outline button becomes active', async () => {
			await render(`<button cuentoneta-button type="outline" [active]="true">Botón</button>`, {
				imports: [ButtonComponent],
			});
			expect(screen.getByRole('button')).toHaveClass('border');
		});

		it('should not alter the geometry', async () => {
			await render(`<button cuentoneta-button size="xs" [active]="true">Botón</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('px-3');
			expect(button).toHaveClass('py-2');
			expect(button).toHaveClass('text-xs');
			expect(button).toHaveClass('gap-1');
		});

		it('should default to inactive, preserving the chosen appearance', async () => {
			await render(`<button cuentoneta-button type="subtle">Botón</button>`, {
				imports: [ButtonComponent],
			});
			const button = screen.getByRole('button');
			expect(button).toHaveClass('bg-neutral-100');
			expect(button).not.toHaveClass('bg-neutral-900');
		});

		// Anunciar la elección es del contenedor que coordina el grupo, no del botón que se pinta.
		it('should not announce the choice with aria-pressed', async () => {
			await render(`<button cuentoneta-button [active]="true">Botón</button>`, {
				imports: [ButtonComponent],
			});
			expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
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
			await render(`<a cuentoneta-button href="/collection">Ver todo</a>`, {
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
