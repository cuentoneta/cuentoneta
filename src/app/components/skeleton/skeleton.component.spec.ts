import { render, screen } from '@testing-library/angular';

import { SkeletonAppearance, SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
	it('should expose role="status" and aria-busy without an accessible name', async () => {
		await render(SkeletonComponent);
		const bar = screen.getByRole('status');
		expect(bar).toHaveAttribute('aria-busy', 'true');
		expect(bar).not.toHaveAttribute('aria-label');
	});

	it('should not expose an accessible name on any bar when rendered multiple times', async () => {
		await render('<cuentoneta-skeleton /><cuentoneta-skeleton /><cuentoneta-skeleton />', {
			imports: [SkeletonComponent],
		});
		const bars = screen.getAllByRole('status');
		expect(bars).toHaveLength(3);
		for (const bar of bars) {
			expect(bar).not.toHaveAttribute('aria-label');
		}
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
