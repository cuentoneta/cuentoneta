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

	// El fondo y la portada comparten una descarga porque piden la misma URL, y nada en el código las
	// ata: el hero elige su ancho por su cuenta. Este caso es el que sostiene esa coincidencia, así que
	// compara lo que renderiza cada una en vez de afirmar la medida que se espera de ambas.
	it('should request the very same image as the foreground cover', async () => {
		await render(LiteraryWorkHeroHeaderComponent, {
			inputs: { literaryWork: { ...literaryWork, coverImage: 'https://cdn.sanity.io/images/x/cover-1024x1536.png' } },
			providers: [provideSanityImageLoader()],
		});

		const background = screen.getByTestId('hero-background');
		const requested = background.getAttribute('src');

		// Control positivo: sin él, dos atributos ausentes se darían por coincidentes.
		expect(requested).toContain('auto=format');
		// Sin variantes por breakpoint: cada una traería la imagen de nuevo a otro ancho, que es
		// justamente lo que se quiere evitar.
		expect(background).not.toHaveAttribute('srcset');
		// La portada sí declara `width`, así que su URL con ancho vive en el `srcset` —el `src` es su
		// fallback— y es la entrada 1× la que tiene que coincidir con la del fondo.
		expect(screen.getByTestId('cover-image').getAttribute('srcset')).toContain(`${requested} 1x`);
	});

	// El canon guarda sus portadas como assets propios del repo, así que este caso es además el que
	// ejercita el guard de origen del loader: una URL que no es del CDN tiene que llegar intacta.
	it('should leave a cover that does not come from the CDN untouched', async () => {
		await render(LiteraryWorkHeroHeaderComponent, {
			inputs: { literaryWork },
			providers: [provideSanityImageLoader()],
		});

		expect(screen.getByTestId('hero-background')).toHaveAttribute('src', literaryWork.coverImage);
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
