import { ImageProfileComponent } from './image-profile.component';
import { render, screen } from '@testing-library/angular';

describe('ImageProfileComponent', () => {
	const src = 'https://cdn.sanity.io/images/x/photo.jpg';

	it('should render the image with its alt when src is provided', async () => {
		await render(ImageProfileComponent, { inputs: { src, alt: 'Retrato del autor' } });
		const img = screen.getByRole('img', { name: 'Retrato del autor' });
		expect(img).toHaveAttribute('src', expect.stringContaining('photo.jpg'));
		expect(img).not.toHaveAttribute('src', expect.stringContaining('profile-placeholder.svg'));
	});

	it('should render the placeholder when no src is provided', async () => {
		const { container } = await render(ImageProfileComponent);
		expect(container.querySelector('img')).toHaveAttribute('src', expect.stringContaining('profile-placeholder.svg'));
	});

	it('should render the collection icon for the collection variant (ignoring src)', async () => {
		const { container } = await render(ImageProfileComponent, { inputs: { variant: 'collection', src } });
		const img = container.querySelector('img');
		expect(img).toHaveAttribute('src', expect.stringContaining('collection.svg'));
		expect(img).not.toHaveAttribute('src', expect.stringContaining('photo.jpg'));
	});

	describe('Avatar resize (2x del tamaño de display)', () => {
		it('should request small at 48px', async () => {
			const { container } = await render(ImageProfileComponent, { inputs: { src, size: 'small' } });
			expect(container.querySelector('img')).toHaveAttribute('src', expect.stringContaining('h=48&w=48'));
		});

		it('should request medium at 80px', async () => {
			const { container } = await render(ImageProfileComponent, { inputs: { src, size: 'medium' } });
			expect(container.querySelector('img')).toHaveAttribute('src', expect.stringContaining('h=80&w=80'));
		});

		it('should request large at 240px', async () => {
			const { container } = await render(ImageProfileComponent, { inputs: { src, size: 'large' } });
			expect(container.querySelector('img')).toHaveAttribute('src', expect.stringContaining('h=240&w=240'));
		});
	});
});
