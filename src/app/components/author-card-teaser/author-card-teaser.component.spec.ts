import { AuthorCardTeaserComponent } from './author-card-teaser.component';
import { render, screen } from '@testing-library/angular';
import { authorTeaserMock } from '@mocks/author.mock';
import { onoffTagsMock } from '@mocks/onoff-tags.mock';

describe('AuthorCardTeaserComponent', () => {
	const tags = onoffTagsMock.slice(0, 2);
	const avatarName = `Retrato de ${authorTeaserMock.name}`;

	it('should link to the author profile', async () => {
		await render(AuthorCardTeaserComponent, { inputs: { author: authorTeaserMock } });
		expect(screen.getByRole('link', { name: authorTeaserMock.name })).toHaveAttribute(
			'href',
			expect.stringContaining(`/author/${authorTeaserMock.slug}`),
		);
	});

	it('should render the teaser as an article', async () => {
		await render(AuthorCardTeaserComponent, { inputs: { author: authorTeaserMock } });
		expect(screen.getByRole('article')).toBeInTheDocument();
	});

	it('should expose a single link whose accessible name is just the author name', async () => {
		await render(AuthorCardTeaserComponent, { inputs: { author: authorTeaserMock, tags, storyCount: 21 } });
		// Pese al avatar, los tags y el contador, el único enlace es el del nombre (nombre accesible conciso).
		expect(screen.getAllByRole('link')).toHaveLength(1);
		expect(screen.getByRole('link', { name: authorTeaserMock.name })).toBeInTheDocument();
	});

	it('should stretch the author-name link to cover the whole card', async () => {
		await render(AuthorCardTeaserComponent, { inputs: { author: authorTeaserMock } });
		// El contenedor posicionado + el ::after del link es lo que hace clickeable toda la tarjeta.
		expect(screen.getByRole('article')).toHaveClass('relative');
		expect(screen.getByRole('link', { name: authorTeaserMock.name })).toHaveClass('after:absolute', 'after:inset-0');
	});

	it('should render the author name and avatar', async () => {
		await render(AuthorCardTeaserComponent, { inputs: { author: authorTeaserMock } });
		expect(screen.getByText(authorTeaserMock.name)).toBeInTheDocument();
		expect(screen.getByRole('img', { name: avatarName })).toBeInTheDocument();
	});

	it('should render a placeholder when the author has no image', async () => {
		await render(AuthorCardTeaserComponent, { inputs: { author: { ...authorTeaserMock, imageUrl: '' } } });
		expect(screen.getByRole('img', { name: avatarName })).toHaveAttribute(
			'src',
			expect.stringContaining('profile-placeholder.svg'),
		);
	});

	// Lo que esta tarjeta decide es el tamaño del avatar; qué se le pide al CDN a partir de él lo
	// resuelven el loader de imágenes y `ImageProfileComponent`, que tienen sus propios specs.
	it('should mount the avatar at the lg size', async () => {
		await render(AuthorCardTeaserComponent, { inputs: { author: authorTeaserMock } });
		expect(screen.getByRole('img', { name: avatarName })).toHaveAttribute('width', '80');
	});

	it('should render the nationality flag', async () => {
		await render(AuthorCardTeaserComponent, { inputs: { author: authorTeaserMock } });
		expect(screen.getByRole('img', { name: authorTeaserMock.nationality.country })).toBeInTheDocument();
	});

	it('should render the tags', async () => {
		await render(AuthorCardTeaserComponent, { inputs: { author: authorTeaserMock, tags } });
		expect(screen.getByTestId('tags')).toBeInTheDocument();
		tags.forEach((tag) => expect(screen.getByText(tag.title)).toBeInTheDocument());
	});

	it('should render more than two tags', async () => {
		const manyTags = onoffTagsMock.slice(0, 4);
		await render(AuthorCardTeaserComponent, { inputs: { author: authorTeaserMock, tags: manyTags } });
		manyTags.forEach((tag) => expect(screen.getByText(tag.title)).toBeInTheDocument());
	});

	it('should render the story count (plural)', async () => {
		await render(AuthorCardTeaserComponent, { inputs: { author: authorTeaserMock, storyCount: 21 } });
		expect(screen.getByTestId('story-count')).toHaveTextContent('21 historias');
	});

	it('should use the singular for a single story', async () => {
		await render(AuthorCardTeaserComponent, { inputs: { author: authorTeaserMock, storyCount: 1 } });
		expect(screen.getByTestId('story-count')).toHaveTextContent('1 historia');
	});

	it('should not render tags or story count when not provided', async () => {
		await render(AuthorCardTeaserComponent, { inputs: { author: authorTeaserMock } });
		expect(screen.queryByTestId('tags')).not.toBeInTheDocument();
		expect(screen.queryByTestId('story-count')).not.toBeInTheDocument();
	});
});
