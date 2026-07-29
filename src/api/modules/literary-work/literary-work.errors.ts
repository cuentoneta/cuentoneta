export class LiteraryWorkNotFoundError extends Error {
	constructor(slug: string) {
		super(`LiteraryWork with slug "${slug}" not found`);
		this.name = 'LiteraryWorkNotFoundError';
	}
}
