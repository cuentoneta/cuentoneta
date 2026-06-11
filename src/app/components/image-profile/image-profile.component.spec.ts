import { ImageProfileComponent } from './image-profile.component';
import { render, screen } from '@testing-library/angular';

describe('ImageProfileComponent', () => {
	const src = 'https://cdn.sanity.io/images/x/photo.jpg';

	it('should render the image with its alt when src is provided', async () => {
		await render(ImageProfileComponent, { inputs: { src, alt: 'Retrato del autor' } });
		expect(screen.getByRole('img', { name: 'Retrato del autor' })).toBeInTheDocument();
		expect(screen.queryByTestId('placeholder')).not.toBeInTheDocument();
	});

	it('should render the placeholder when no src is provided', async () => {
		await render(ImageProfileComponent);
		expect(screen.getByTestId('placeholder')).toBeInTheDocument();
		expect(screen.queryByTestId('image')).not.toBeInTheDocument();
	});

	it('should render the collection icon for the collection variant (ignoring src)', async () => {
		await render(ImageProfileComponent, { inputs: { variant: 'collection', src } });
		expect(screen.getByTestId('collection-icon')).toBeInTheDocument();
		expect(screen.queryByTestId('image')).not.toBeInTheDocument();
		expect(screen.queryByTestId('placeholder')).not.toBeInTheDocument();
	});

	describe('Avatar resize (2x del tamaño de display)', () => {
		it('should request small at 48px', async () => {
			await render(ImageProfileComponent, { inputs: { src, size: 'small' } });
			expect(screen.getByTestId('image')).toHaveAttribute('src', expect.stringContaining('h=48&w=48'));
		});

		it('should request medium at 80px', async () => {
			await render(ImageProfileComponent, { inputs: { src, size: 'medium' } });
			expect(screen.getByTestId('image')).toHaveAttribute('src', expect.stringContaining('h=80&w=80'));
		});

		it('should request large at 240px', async () => {
			await render(ImageProfileComponent, { inputs: { src, size: 'large' } });
			expect(screen.getByTestId('image')).toHaveAttribute('src', expect.stringContaining('h=240&w=240'));
		});
	});
});
