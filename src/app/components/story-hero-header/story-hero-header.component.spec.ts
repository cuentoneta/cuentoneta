import { render, screen } from '@testing-library/angular';

import type { Story } from '@models/story.model';
import type { Tag } from '@models/tag.model';
import { StoryHeroHeaderComponent } from './story-hero-header.component';
import { palacioNueveFronterasStoryMock } from '../../mocks/onoff/el-palacio-de-las-nueve-fronteras.mock';

describe('StoryHeroHeaderComponent', () => {
	const literaryType: Tag = { title: 'Novela', slug: 'novela', shortDescription: '', description: [] };
	const story: Story = { ...palacioNueveFronterasStoryMock, tags: [literaryType] };

	it('should render the story title as the heading', async () => {
		await render(StoryHeroHeaderComponent, { inputs: { story } });
		expect(screen.getByRole('heading', { name: story.title })).toBeInTheDocument();
	});

	it('should link the author block to the author profile, exposing just the author name', async () => {
		await render(StoryHeroHeaderComponent, { inputs: { story } });
		// El avatar es decorativo (alt vacío): el único nombre accesible del enlace es el del autor.
		const link = screen.getByRole('link', { name: story.author.name });
		expect(link).toHaveAttribute('href', expect.stringContaining(`/author/${story.author.slug}`));
	});

	it('should render the blurred background from the cover requested at 1920px width', async () => {
		await render(StoryHeroHeaderComponent, { inputs: { story } });
		expect(screen.getByTestId('hero-background')).toHaveAttribute('src', expect.stringContaining('w=1920'));
	});

	it('should not render the background when the story has no cover', async () => {
		await render(StoryHeroHeaderComponent, { inputs: { story: { ...story, coverImage: '' } } });
		expect(screen.queryByTestId('hero-background')).not.toBeInTheDocument();
	});

	it('should render the original publication with its prefix', async () => {
		await render(StoryHeroHeaderComponent, { inputs: { story } });
		expect(screen.getByTestId('publication')).toHaveTextContent(`Publicado en: ${story.originalPublication}`);
	});

	it('should render the literary type tag from the first tag', async () => {
		await render(StoryHeroHeaderComponent, { inputs: { story } });
		expect(screen.getByTestId('literary-type')).toHaveTextContent(literaryType.title);
	});

	it('should not render the literary type tag when the story has no tags', async () => {
		await render(StoryHeroHeaderComponent, { inputs: { story: { ...story, tags: [] } } });
		expect(screen.queryByTestId('literary-type')).not.toBeInTheDocument();
	});

	it('should render the foreground cover image when the story has a cover', async () => {
		await render(StoryHeroHeaderComponent, { inputs: { story } });
		expect(screen.getByTestId('cover-image')).toBeInTheDocument();
	});

	it('should render the cover placeholder when the story has no cover', async () => {
		await render(StoryHeroHeaderComponent, { inputs: { story: { ...story, coverImage: '' } } });
		expect(screen.getByTestId('cover-placeholder')).toBeInTheDocument();
	});

	it('should render the skeleton when no story is provided', async () => {
		await render(StoryHeroHeaderComponent);
		expect(screen.getByTestId('skeleton')).toBeInTheDocument();
	});

	it('should not render the skeleton once a story is provided', async () => {
		await render(StoryHeroHeaderComponent, { inputs: { story } });
		expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
	});
});
