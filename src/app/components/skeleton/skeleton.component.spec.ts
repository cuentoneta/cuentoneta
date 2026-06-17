import { render, screen } from '@testing-library/angular';

import { SkeletonAppearance, SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
	it('should expose role="status" with the loading label for assistive technology', async () => {
		await render(SkeletonComponent);
		expect(screen.getByRole('status', { name: 'Cargando' })).toHaveAttribute('aria-busy', 'true');
	});

	it('should animate with animate-pulse on the host', async () => {
		await render(SkeletonComponent);
		expect(screen.getByRole('status')).toHaveClass('block', 'animate-pulse');
	});

	it('should render a rounded bar for the line appearance (default)', async () => {
		await render(SkeletonComponent);
		const bar = screen.getByRole('status');
		expect(bar).toHaveClass('rounded');
		expect(bar).not.toHaveClass('rounded-full', 'aspect-square');
	});

	it('should render a fully rounded square bar for the circle appearance', async () => {
		await render(SkeletonComponent, { inputs: { appearance: SkeletonAppearance.Circle } });
		expect(screen.getByRole('status')).toHaveClass('rounded-full', 'aspect-square');
	});

	it('should leave the radius to the consumer for the square appearance', async () => {
		await render(SkeletonComponent, { inputs: { appearance: SkeletonAppearance.Square } });
		const bar = screen.getByRole('status');
		expect(bar).not.toHaveClass('rounded', 'rounded-full', 'aspect-square');
	});
});
