import { render, screen } from '@testing-library/angular';

import { LiteraryWorkHeroHeaderComponent } from './literary-work-hero-header.component';
import { literaryWorkHeroFixtureMock } from './literary-work-hero-header.mock';

describe('LiteraryWorkHeroHeaderComponent', () => {
	const literaryWork = literaryWorkHeroFixtureMock;

	it('should render the literary work title as the heading', async () => {
		await render(LiteraryWorkHeroHeaderComponent, { inputs: { literaryWork } });
		expect(screen.getByRole('heading', { name: literaryWork.title })).toBeInTheDocument();
	});

	it('should render every author of the byline, not just the first one', async () => {
		await render(LiteraryWorkHeroHeaderComponent, { inputs: { literaryWork } });
		// La fixture trae 2 autores para ejercitar la autoría 1..N.
		expect(screen.getAllByTestId('author')).toHaveLength(literaryWork.authors.length);
	});

	it('should link each author block to its profile, exposing just the author name', async () => {
		await render(LiteraryWorkHeroHeaderComponent, { inputs: { literaryWork } });
		// El avatar es decorativo (alt vacío): el único nombre accesible de cada enlace es el del autor.
		for (const author of literaryWork.authors) {
			const link = screen.getByRole('link', { name: author.name });
			expect(link).toHaveAttribute('href', expect.stringContaining(`/author/${author.slug}`));
		}
	});

	it('should render the blurred background from the cover requested at 1920px width', async () => {
		await render(LiteraryWorkHeroHeaderComponent, { inputs: { literaryWork } });
		expect(screen.getByTestId('hero-background')).toHaveAttribute('src', expect.stringContaining('w=1920'));
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
		for (const tag of literaryWork.tags) {
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
