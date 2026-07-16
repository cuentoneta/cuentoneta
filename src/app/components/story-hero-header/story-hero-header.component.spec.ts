import { render, screen } from '@testing-library/angular';

import type { Story } from '@models/story.model';
import type { Tag } from '@models/tag.model';
import { StoryHeroHeaderComponent } from './story-hero-header.component';
import { palacioNueveFronterasStoryMock } from '../../mocks/onoff/el-palacio-de-las-nueve-fronteras.mock';

describe('StoryHeroHeaderComponent', () => {
	const genre: Tag = { title: 'Ciencia ficción', slug: 'ciencia-ficcion', shortDescription: '', description: [] };
	const story: Story = { ...palacioNueveFronterasStoryMock, tags: [genre] };
	const avatarName = `Retrato de ${story.author.name}`;

	it('should render the story title as the heading', async () => {
		await render(StoryHeroHeaderComponent, { inputs: { story } });
		expect(screen.getByRole('heading', { name: story.title })).toBeInTheDocument();
	});

	it('should render the author name and avatar linking to the author profile', async () => {
		await render(StoryHeroHeaderComponent, { inputs: { story } });
		expect(screen.getByText(story.author.name)).toBeInTheDocument();
		expect(screen.getByRole('img', { name: avatarName })).toBeInTheDocument();
		expect(screen.getByRole('link')).toHaveAttribute('href', expect.stringContaining(`/author/${story.author.slug}`));
	});

	it('should render the original publication with its prefix', async () => {
		await render(StoryHeroHeaderComponent, { inputs: { story } });
		expect(screen.getByTestId('publication')).toHaveTextContent(`Publicado en: ${story.originalPublication}`);
	});

	it('should render the genre tag from the first tag', async () => {
		await render(StoryHeroHeaderComponent, { inputs: { story } });
		expect(screen.getByTestId('genre')).toHaveTextContent(genre.title);
	});

	it('should not render the genre tag when the story has no tags', async () => {
		await render(StoryHeroHeaderComponent, { inputs: { story: { ...story, tags: [] } } });
		expect(screen.queryByTestId('genre')).not.toBeInTheDocument();
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
