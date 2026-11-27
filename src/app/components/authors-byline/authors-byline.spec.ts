import { render, screen } from '@testing-library/angular';

import { AuthorsByline } from './authors-byline';
import { embeddedAuthorTeaserMock, secondAuthorTeaserMock } from '@mocks/author.mock';

describe('AuthorsByline', () => {
	const author = embeddedAuthorTeaserMock;

	it('should link a single author to their profile, exposing just the author name', async () => {
		await render(AuthorsByline, { inputs: { authors: [author] } });
		// El avatar es decorativo (alt vacío): el único nombre accesible del enlace es el del autor.
		const link = screen.getByRole('link', { name: author.name });
		expect(link).toHaveAttribute('href', expect.stringContaining(`/author/${author.slug}`));
	});

	it('should render the avatar of the first author only', async () => {
		// El avatar es decorativo (alt vacío): su role accesible es "presentation", no "img".
		await render(AuthorsByline, { inputs: { authors: [author, secondAuthorTeaserMock] } });
		expect(screen.getAllByRole('presentation')).toHaveLength(1);
	});

	it('should join two authors with "y", each with their own accessible link', async () => {
		const { container } = await render(AuthorsByline, { inputs: { authors: [author, secondAuthorTeaserMock] } });

		// El texto queda partido entre los <a> de cada autor y el literal " y ": se compara el
		// textContent completo del bloque, no un único nodo de texto.
		expect(container).toHaveTextContent(`${author.name} y ${secondAuthorTeaserMock.name}`);
		expect(screen.getByRole('link', { name: author.name })).toHaveAttribute(
			'href',
			expect.stringContaining(`/author/${author.slug}`),
		);
		expect(screen.getByRole('link', { name: secondAuthorTeaserMock.name })).toHaveAttribute(
			'href',
			expect.stringContaining(`/author/${secondAuthorTeaserMock.slug}`),
		);
	});

	it('should join three or more authors with commas and a trailing "y"', async () => {
		const thirdAuthor = { ...secondAuthorTeaserMock, slug: 'tercer-autor', name: 'Tercer Autor' };
		const { container } = await render(AuthorsByline, {
			inputs: { authors: [author, secondAuthorTeaserMock, thirdAuthor] },
		});

		expect(container).toHaveTextContent(`${author.name}, ${secondAuthorTeaserMock.name} y ${thirdAuthor.name}`);
	});
});
