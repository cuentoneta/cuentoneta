import { AuthorTeaserV3Component } from './author-teaser-v3.component';
import { render, screen } from '@testing-library/angular';
import { authorTeaserMock } from '../../mocks/author.mock';
import { Tag } from '@models/tag.model';

describe('AuthorTeaserV3Component', () => {
	const tags: Tag[] = [
		{ title: 'Surrealismo', slug: 'surrealismo', shortDescription: '', description: [] },
		{ title: 'Fantástico', slug: 'fantastico', shortDescription: '', description: [] },
	];
	const avatarName = `Retrato de ${authorTeaserMock.name}`;

	it('should link to the author profile', async () => {
		await render(AuthorTeaserV3Component, { inputs: { author: authorTeaserMock } });
		expect(screen.getByRole('link')).toHaveAttribute(
			'href',
			expect.stringContaining(`/author/${authorTeaserMock.slug}`),
		);
	});

	it('should render the author name and avatar', async () => {
		await render(AuthorTeaserV3Component, { inputs: { author: authorTeaserMock } });
		expect(screen.getByText(authorTeaserMock.name)).toBeInTheDocument();
		expect(screen.getByRole('img', { name: avatarName })).toBeInTheDocument();
	});

	it('should render a placeholder when the author has no image', async () => {
		await render(AuthorTeaserV3Component, { inputs: { author: { ...authorTeaserMock, imageUrl: '' } } });
		expect(screen.queryByRole('img', { name: avatarName })).not.toBeInTheDocument();
		expect(screen.getByTestId('author')).toBeInTheDocument();
	});

	it('should request the avatar at 2x of 80px (HiDPI)', async () => {
		await render(AuthorTeaserV3Component, { inputs: { author: authorTeaserMock } });
		expect(screen.getByRole('img', { name: avatarName })).toHaveAttribute(
			'src',
			expect.stringContaining('h=160&w=160'),
		);
	});

	it('should render the nationality flag', async () => {
		await render(AuthorTeaserV3Component, { inputs: { author: authorTeaserMock } });
		expect(screen.getByRole('img', { name: authorTeaserMock.nationality.country })).toBeInTheDocument();
	});

	it('should render the tags', async () => {
		await render(AuthorTeaserV3Component, { inputs: { author: authorTeaserMock, tags } });
		expect(screen.getByTestId('tags')).toBeInTheDocument();
		expect(screen.getByText('Surrealismo')).toBeInTheDocument();
		expect(screen.getByText('Fantástico')).toBeInTheDocument();
	});

	it('should render more than two tags', async () => {
		const manyTags: Tag[] = [
			...tags,
			{ title: 'Memoria', slug: 'memoria', shortDescription: '', description: [] },
			{ title: 'Histórico', slug: 'historico', shortDescription: '', description: [] },
		];
		await render(AuthorTeaserV3Component, { inputs: { author: authorTeaserMock, tags: manyTags } });
		manyTags.forEach((tag) => expect(screen.getByText(tag.title)).toBeInTheDocument());
	});

	it('should render the story count (plural)', async () => {
		await render(AuthorTeaserV3Component, { inputs: { author: authorTeaserMock, storyCount: 21 } });
		expect(screen.getByTestId('story-count')).toHaveTextContent('21 historias');
	});

	it('should use the singular for a single story', async () => {
		await render(AuthorTeaserV3Component, { inputs: { author: authorTeaserMock, storyCount: 1 } });
		expect(screen.getByTestId('story-count')).toHaveTextContent('1 historia');
	});

	it('should not render tags or story count when not provided', async () => {
		await render(AuthorTeaserV3Component, { inputs: { author: authorTeaserMock } });
		expect(screen.queryByTestId('tags')).not.toBeInTheDocument();
		expect(screen.queryByTestId('story-count')).not.toBeInTheDocument();
	});
});
