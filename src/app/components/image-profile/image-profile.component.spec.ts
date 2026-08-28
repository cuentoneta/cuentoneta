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

	// El componente ya no arma la URL: declara el tamaño de display y el loader deriva de ahí lo que se
	// le pide al CDN. Se ejercita con el loader real —el mismo que la aplicación registra— porque lo que
	// hay que afirmar es el resultado de los dos juntos, no el contrato de cada uno por separado.
	describe('Tamaño solicitado al CDN', () => {
		const renderWithLoader = (size: ImageProfileSize) =>
			render(ImageProfileComponent, {
				inputs: { src, alt, size },
				providers: [provideSanityImageLoader()],
			});

		// Se afirma sobre el `srcset` y no sobre el `src`: NgOptimizedImage deja en `src` la URL sin ancho,
		// como fallback, y son las entradas del `srcset` las que el navegador elige y descarga.
		it.each([
			['small', 24],
			['medium', 40],
			['lg', 80],
			['xl', 120],
		] as const)('should offer %s at its display size (%ipx) and at twice it', async (size, px) => {
			await renderWithLoader(size);

			const srcset = screen.getByRole('img', { name: alt }).getAttribute('srcset');
			expect(srcset).toContain(`${src}?w=${px}&auto=format&q=75 1x`);
			// La densidad la cubre el `srcset`, y por eso el componente dejó de pedir el doble a mano:
			// pedirlo de nuevo duplicaría el parámetro.
			expect(srcset).toContain(`${src}?w=${px * 2}&auto=format&q=75 2x`);
		});

		// El placeholder es un asset propio y no del CDN: el loader tiene que dejarlo intacto.
		it('should leave the local placeholder untouched', async () => {
			await render(ImageProfileComponent, { inputs: { alt }, providers: [provideSanityImageLoader()] });
			expect(screen.getByRole('img', { name: alt })).toHaveAttribute('src', expect.not.stringContaining('auto=format'));
		});
	});
});
