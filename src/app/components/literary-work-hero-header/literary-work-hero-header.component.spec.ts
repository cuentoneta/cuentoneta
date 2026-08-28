import { render, screen } from '@testing-library/angular';

import type { LiteraryWork } from '@models/literary-work.model';
import { LiteraryWorkHeroHeaderComponent } from './literary-work-hero-header.component';
import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { onoffTagsMock } from '@mocks/onoff-tags.mock';
import { provideSanityImageLoader } from '../../providers/sanity-image-loader';

describe('LiteraryWorkHeroHeaderComponent', () => {
	const tags = onoffTagsMock.slice(0, 2);
	const literaryWork: LiteraryWork = { ...onoffLiteraryWorksMock[0], tags };
	const [author] = literaryWork.authors;

	it('should render the literary work title as the heading', async () => {
		await render(LiteraryWorkHeroHeaderComponent, { inputs: { literaryWork } });
		expect(screen.getByRole('heading', { name: literaryWork.title })).toBeInTheDocument();
	});

	it('should link the author block to the author profile, exposing just the author name', async () => {
		await render(LiteraryWorkHeroHeaderComponent, { inputs: { literaryWork } });
		// El avatar es decorativo (alt vacío): el único nombre accesible del enlace es el del autor.
		const link = screen.getByRole('link', { name: author.name });
		expect(link).toHaveAttribute('href', expect.stringContaining(`/author/${author.slug}`));
	});

	// El fondo va con `fill` + `sizes="100vw"`, así que el loader recibe un ancho por breakpoint en vez de
	// uno fijo. Se afirma sobre el `srcset` porque es de donde el navegador elige; el `src` queda como
	// fallback sin ancho.
	it('should render the blurred background offering a width per breakpoint', async () => {
		const coverImage = 'https://cdn.sanity.io/images/x/cover-1024x1536.png';
		await render(LiteraryWorkHeroHeaderComponent, {
			inputs: { literaryWork: { ...literaryWork, coverImage } },
			providers: [provideSanityImageLoader()],
		});

		const srcset = screen.getByTestId('hero-background').getAttribute('srcset');
		expect(srcset).toContain(`${coverImage}?w=640&auto=format&q=75 640w`);
		expect(srcset).toContain(`${coverImage}?w=1920&auto=format&q=75 1920w`);
	});

	// El canon guarda sus portadas como assets propios del repo, así que este caso es además el que
	// ejercita el guard de origen del loader: una URL que no es del CDN tiene que llegar intacta.
	it('should leave a cover that does not come from the CDN untouched', async () => {
		await render(LiteraryWorkHeroHeaderComponent, {
			inputs: { literaryWork },
			providers: [provideSanityImageLoader()],
		});

		expect(screen.getByTestId('hero-background').getAttribute('srcset')).not.toContain('auto=format');
	});

	it('should not render the background when the literary work has no cover', async () => {
		await render(LiteraryWorkHeroHeaderComponent, { inputs: { literaryWork: { ...literaryWork, coverImage: '' } } });
		expect(screen.queryByTestId('hero-background')).not.toBeInTheDocument();
	});

	it('should render the original publication with its prefix', async () => {
		await render(LiteraryWorkHeroHeaderComponent, { inputs: { literaryWork } });
		expect(screen.getByTestId('publication')).toHaveTextContent(`Publicado en: ${literaryWork.originalPublication}`);
	});

	it('should render all the literary work tags', async () => {
		await render(LiteraryWorkHeroHeaderComponent, { inputs: { literaryWork } });
		for (const tag of tags) {
			expect(screen.getByText(tag.title)).toBeInTheDocument();
		}
	});

	it('should render the foreground cover image when the literary work has a cover', async () => {
		await render(LiteraryWorkHeroHeaderComponent, { inputs: { literaryWork } });
		expect(screen.getByTestId('cover-image')).toBeInTheDocument();
	});

	it('should render the cover placeholder when the literary work has no cover', async () => {
		await render(LiteraryWorkHeroHeaderComponent, { inputs: { literaryWork: { ...literaryWork, coverImage: '' } } });
		expect(screen.getByTestId('cover-placeholder')).toBeInTheDocument();
	});

	it('should render the skeleton when no literary work is provided', async () => {
		await render(LiteraryWorkHeroHeaderComponent);
		expect(screen.getByTestId('skeleton')).toBeInTheDocument();
	});

	it('should not render the skeleton once a literary work is provided', async () => {
		await render(LiteraryWorkHeroHeaderComponent, { inputs: { literaryWork } });
		expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
	});
});
