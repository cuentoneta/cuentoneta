import { ImageProfileComponent } from './image-profile.component';
import { render, screen } from '@testing-library/angular';

describe('ImageProfileComponent', () => {
	const src = 'https://cdn.sanity.io/images/x/photo.jpg';
	const alt = 'Retrato del autor';

	it('should render the image with its alt when src is provided', async () => {
		await render(ImageProfileComponent, { inputs: { src, alt } });
		const img = screen.getByRole('img', { name: alt });
		expect(img).toHaveAttribute('src', expect.stringContaining('photo.jpg'));
		expect(img).not.toHaveAttribute('src', expect.stringContaining('profile-placeholder.svg'));
	});

	it('should render the placeholder when no src is provided', async () => {
		await render(ImageProfileComponent, { inputs: { alt } });
		expect(screen.getByRole('img', { name: alt })).toHaveAttribute(
			'src',
			expect.stringContaining('profile-placeholder.svg'),
		);
	});

	it('should render the collection icon for the collection variant (ignoring src)', async () => {
		await render(ImageProfileComponent, { inputs: { variant: 'collection', src, alt } });
		const img = screen.getByRole('img', { name: alt });
		expect(img).toHaveAttribute('src', expect.stringContaining('collection.svg'));
		expect(img).not.toHaveAttribute('src', expect.stringContaining('photo.jpg'));
	});

	describe('Avatar resize (2x del tamaño de display)', () => {
		it('should request small at 48px', async () => {
			await render(ImageProfileComponent, { inputs: { src, alt, size: 'small' } });
			expect(screen.getByRole('img', { name: alt })).toHaveAttribute('src', expect.stringContaining('h=48&w=48'));
		});

		it('should request medium at 80px', async () => {
			await render(ImageProfileComponent, { inputs: { src, alt, size: 'medium' } });
			expect(screen.getByRole('img', { name: alt })).toHaveAttribute('src', expect.stringContaining('h=80&w=80'));
		});

		it('should request lg at 160px', async () => {
			await render(ImageProfileComponent, { inputs: { src, alt, size: 'lg' } });
			expect(screen.getByRole('img', { name: alt })).toHaveAttribute('src', expect.stringContaining('h=160&w=160'));
		});

		it('should request xl at 240px', async () => {
			await render(ImageProfileComponent, { inputs: { src, alt, size: 'xl' } });
			expect(screen.getByRole('img', { name: alt })).toHaveAttribute('src', expect.stringContaining('h=240&w=240'));
		});
	});
});
