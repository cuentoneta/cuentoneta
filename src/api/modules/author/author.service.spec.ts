import { clearAllMocks, type Mock } from '@test-utils';
import { AuthorNotFoundError } from './author.errors';
import { fetchAuthorBySlug } from './author.repository';
import { getAuthorBySlug } from './author.service';

/* eslint-disable no-restricted-syntax -- vi.mock/vi.fn: mock de módulo del repository; se migra a inyección de dependencias en #1503 */
vi.mock('./author.repository', () => ({ fetchAuthorBySlug: vi.fn(), fetchAllAuthors: vi.fn() }));
/* eslint-enable no-restricted-syntax */

describe('getAuthorBySlug', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	it('throws AuthorNotFoundError with the requested slug when no author carries it', async () => {
		(fetchAuthorBySlug as Mock).mockResolvedValue(null);

		await expect(getAuthorBySlug('sin-autor')).rejects.toEqual(new AuthorNotFoundError('sin-autor'));
		await expect(getAuthorBySlug('sin-autor')).rejects.toBeInstanceOf(AuthorNotFoundError);
	});
});
