import { render, screen } from '@testing-library/angular';

import { CoverImageComponent } from './cover-image.component';

describe('CoverImageComponent', () => {
	it('should render the image when a src is provided', async () => {
		await render(CoverImageComponent, { inputs: { src: 'https://example.com/cover.jpg' } });
		expect(screen.getByTestId('cover-image')).toBeInTheDocument();
		expect(screen.queryByTestId('cover-placeholder')).not.toBeInTheDocument();
	});

	it('should render the placeholder when no src is provided', async () => {
		await render(CoverImageComponent);
		expect(screen.getByTestId('cover-placeholder')).toBeInTheDocument();
		expect(screen.queryByTestId('cover-image')).not.toBeInTheDocument();
	});

	it('should render the cover at the fixed 118×164 dimensions', async () => {
		await render(CoverImageComponent, { inputs: { src: 'https://example.com/cover.jpg' } });
		const image = screen.getByTestId('cover-image');
		expect(image).toHaveAttribute('width', '118');
		expect(image).toHaveAttribute('height', '164');
	});
});
