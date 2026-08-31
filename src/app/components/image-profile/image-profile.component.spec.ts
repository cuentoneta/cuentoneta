import { ImageProfileComponent, type ImageProfileSize } from './image-profile.component';
import { render, screen } from '@testing-library/angular';

import { provideSanityImageLoader } from '../../providers/sanity-image-loader';

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

	// El componente declara el tamaño de display y el loader deriva de ahí lo que se le pide al CDN. Se
	// ejercita con el loader real porque lo que importa es el resultado de los dos juntos.
	describe('Tamaño solicitado al CDN', () => {
		const renderWithLoader = (size: ImageProfileSize) =>
			render(ImageProfileComponent, {
				inputs: { src, alt, size },
				providers: [provideSanityImageLoader()],
			});

		// Sobre el `srcset`, que es de donde el navegador elige; el `src` queda sin ancho, como fallback.
		it.each([
			['small', 24],
			['medium', 40],
			['lg', 80],
			['xl', 120],
		] as const)('should offer %s at its display size (%ipx) and at twice it', async (size, px) => {
			await renderWithLoader(size);

			const srcset = screen.getByRole('img', { name: alt }).getAttribute('srcset');
			expect(srcset).toContain(`${src}?w=${px}&auto=format&q=75 1x`);
			// La densidad la cubre el `srcset`: pedir el doble a mano duplicaría el parámetro.
			expect(srcset).toContain(`${src}?w=${px * 2}&auto=format&q=75 2x`);
		});

		// El placeholder es un asset propio y no del CDN: el loader tiene que dejarlo intacto.
		it('should leave the local placeholder untouched', async () => {
			await render(ImageProfileComponent, { inputs: { alt }, providers: [provideSanityImageLoader()] });
			expect(screen.getByRole('img', { name: alt })).toHaveAttribute('src', expect.not.stringContaining('auto=format'));
		});
	});
});
