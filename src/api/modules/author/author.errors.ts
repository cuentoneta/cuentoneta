export class AuthorNotFoundError extends Error {
	constructor(slug: string) {
		super(`Author with slug "${slug}" not found`);
		this.name = 'AuthorNotFoundError';
	}
}
