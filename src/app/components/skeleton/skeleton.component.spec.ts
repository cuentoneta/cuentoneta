import { render, screen } from '@testing-library/angular';

import { SkeletonComponent } from './skeleton.component';

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
		expect(bar).not.toHaveClass('rounded-full', 'rounded-sm');
	});

	it('should render a fully rounded square bar for the circle appearance', async () => {
		await render(SkeletonComponent, { inputs: { appearance: 'circle' } });
		expect(screen.getByRole('status')).toHaveClass('rounded-full', 'aspect-square');
	});

	it('should render a slightly rounded bar for the square appearance', async () => {
		await render(SkeletonComponent, { inputs: { appearance: 'square' } });
		const bar = screen.getByRole('status');
		expect(bar).toHaveClass('rounded-sm');
		expect(bar).not.toHaveClass('rounded-full', 'aspect-square');
	});
});
