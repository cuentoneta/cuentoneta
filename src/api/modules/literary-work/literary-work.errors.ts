export class LiteraryWorkNotFoundError extends Error {
	constructor(slug: string) {
		super(`LiteraryWork with slug "${slug}" not found`);
		this.name = 'LiteraryWorkNotFoundError';
	}
}

export class LiteraryWorkSectionNotFoundError extends Error {
	constructor(slug: string, section: number) {
		super(`LiteraryWork "${slug}" has no section at position ${section}`);
		this.name = 'LiteraryWorkSectionNotFoundError';
	}
}
