import { render, screen } from '@testing-library/angular';
import { clearAllMocks } from '@test-utils';
import { ImageProfileSkeletonComponent } from './image-profile-skeleton.component';
import type { ImageProfileSize } from './image-profile.component';

describe('ImageProfileSkeletonComponent', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	it('renders a loading status', async () => {
		await render(ImageProfileSkeletonComponent);

		expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando');
	});

	describe('size classes', () => {
		it.each([
			['small', 'size-6'],
			['medium', 'size-10'],
			['lg', 'size-20'],
			['xl', 'size-30'],
		] as [ImageProfileSize, string][])('applies the size class for "%s"', async (size, expectedClass) => {
			await render(ImageProfileSkeletonComponent, { inputs: { size } });

			expect(screen.getByRole('status')).toHaveClass(expectedClass);
		});

		it('defaults to medium (size-10) when no size is provided', async () => {
			await render(ImageProfileSkeletonComponent);

			expect(screen.getByRole('status')).toHaveClass('size-10');
		});
	});
});
