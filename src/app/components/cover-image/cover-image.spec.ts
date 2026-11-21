import { render, screen } from '@testing-library/angular';

import { CoverImage } from './cover-image';
import { provideSanityImageLoader } from '../../providers/sanity-image-loader';

describe('CoverImage', () => {
	it('should render the image when a src is provided', async () => {
		await render(CoverImage, { inputs: { src: 'https://example.com/cover.jpg' } });
		expect(screen.getByTestId('cover-image')).toBeInTheDocument();
		expect(screen.queryByTestId('cover-placeholder')).not.toBeInTheDocument();
	});

	it('should render the placeholder when no src is provided', async () => {
		await render(CoverImage);
		expect(screen.getByTestId('cover-placeholder')).toBeInTheDocument();
		expect(screen.queryByTestId('cover-image')).not.toBeInTheDocument();
	});

	it('should keep 118×164 as the reserved dimensions of the image', async () => {
		await render(CoverImage, { inputs: { src: 'https://example.com/cover.jpg' } });
		const image = screen.getByTestId('cover-image');
		expect(image).toHaveAttribute('width', '118');
		expect(image).toHaveAttribute('height', '164');
	});

	// El ancho de la caja depende de la imagen, así que se pide por alto: por ancho, una apaisada
	// llegaría con menos resolución de la que se pinta.
	it('should request the image by height at both densities', async () => {
		await render(CoverImage, {
			inputs: { src: 'https://cdn.sanity.io/images/x/cover-1024x1536.png' },
			providers: [provideSanityImageLoader()],
		});

		const srcset = screen.getByTestId('cover-image').getAttribute('srcset');
		expect(srcset).toContain('h=164');
		expect(srcset).toContain('h=328');
		expect(srcset).not.toContain('w=');
	});

	// Se afirman las clases y no el estilo computado: happy-dom no carga las hojas de estilo ni mide
	// layout, así que el ancho que resulta de cada proporción solo se ve en Storybook.
	describe('box sizing', () => {
		it('should fix the height of the image and let its width follow the proportions', async () => {
			await render(CoverImage, { inputs: { src: 'https://example.com/cover.jpg' } });
			const image = screen.getByTestId('cover-image');
			expect(image).toHaveClass('h-full', 'w-auto', 'object-cover', 'max-w-full');
			for (const removed of ['h-auto', 'w-full', 'size-full']) {
				expect(image).not.toHaveClass(removed);
			}
		});

		it('should fix the height of the box and fit its width to the image up to a maximum', async () => {
			await render('<cuentoneta-cover-image data-testid="cover" src="https://example.com/cover.jpg" />', {
				imports: [CoverImage],
			});
			expect(screen.getByTestId('cover')).toHaveClass('h-41', 'w-fit', 'max-w-33');
		});

		it('should give the placeholder the default cover width', async () => {
			await render(CoverImage);
			expect(screen.getByTestId('cover-placeholder')).toHaveClass('w-29.5');
		});
	});
});
