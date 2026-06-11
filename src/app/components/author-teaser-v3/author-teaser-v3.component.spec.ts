import { AuthorTeaserV3Component } from './author-teaser-v3.component';
import { render, screen } from '@testing-library/angular';
import { authorTeaserMock } from '../../mocks/author.mock';

describe('AuthorTeaserV3Component', () => {
	it('should render the author name', async () => {
		await render(AuthorTeaserV3Component, { inputs: { author: authorTeaserMock } });
		expect(screen.getByText(authorTeaserMock.name)).toBeInTheDocument();
	});

	it('should render the avatar with an alt describing the author', async () => {
		await render(AuthorTeaserV3Component, { inputs: { author: authorTeaserMock } });
		expect(screen.getByRole('img', { name: `Retrato de ${authorTeaserMock.name}` })).toBeInTheDocument();
	});

	it('should request the avatar resized for HiDPI', async () => {
		await render(AuthorTeaserV3Component, { inputs: { author: authorTeaserMock } });
		expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('h=48&w=48'));
	});

	it('should link to the author profile', async () => {
		await render(AuthorTeaserV3Component, { inputs: { author: authorTeaserMock } });
		expect(screen.getByRole('link')).toHaveAttribute(
			'href',
			expect.stringContaining(`/author/${authorTeaserMock.slug}`),
		);
	});

	it('should render a placeholder when the author has no image', async () => {
		await render(AuthorTeaserV3Component, { inputs: { author: { ...authorTeaserMock, imageUrl: '' } } });
		expect(screen.queryByRole('img')).not.toBeInTheDocument();
		expect(screen.getByTestId('author')).toBeInTheDocument();
	});
});
