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
});
