export class LiteraryWorkSectionNotFoundError extends Error {
	constructor(slug: string, section: number) {
		super(`LiteraryWork "${slug}" has no section at position ${section}`);
		this.name = 'LiteraryWorkSectionNotFoundError';
	}
}
