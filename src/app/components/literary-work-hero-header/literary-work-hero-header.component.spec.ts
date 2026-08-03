import { render, screen } from '@testing-library/angular';

import type { LiteraryWork } from '@models/literary-work.model';
import { LiteraryWorkHeroHeaderComponent } from './literary-work-hero-header.component';
import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { onoffTagsMock } from '@mocks/onoff-tags.mock';

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
