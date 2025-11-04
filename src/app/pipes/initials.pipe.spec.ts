import { InitialsPipe } from './initials.pipe';

describe('InitialsPipe', () => {
	let pipe: InitialsPipe;

	beforeEach(() => {
		pipe = new InitialsPipe();
	});

	it('should create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should return the full name if under 20 characters', () => {
		expect(pipe.transform('John Doe')).toBe('John Doe');
	});

	it('should return the full name if exactly 20 characters', () => {
		expect(pipe.transform('Ludwig van Beethoven')).toBe('Ludwig van Beethoven');
	});

	it('should abbreviate names over 22 characters', () => {
		expect(pipe.transform('Johann Sebastian Bach')).toBe('Johann Sebastian Bach');
	});

	it('should abbreviate multi-word names over 22 characters', () => {
		expect(pipe.transform('Wolfgang Amadeus Mozart')).toBe('Wolfgang A. Mozart');
	});

	it('should keep single word names as-is if under 22 characters', () => {
		expect(pipe.transform('Beethoven')).toBe('Beethoven');
	});

	it('should truncate single word names over 22 characters with ellipsis', () => {
		expect(pipe.transform('Verylongauthornamethatexceedstwentytwocharacters')).toBe('Verylongauthornamet...');
	});

	it('should abbreviate names with many words', () => {
		expect(pipe.transform('Jean Claude Jacques Dupont')).toBe('Jean C. Jacques Dupont');
	});

	it('should return empty string for empty input', () => {
		expect(pipe.transform('')).toBe('');
	});

	it('should return empty string for null input', () => {
		expect(pipe.transform(null as any)).toBe('');
	});

	it('should return empty string for undefined input', () => {
		expect(pipe.transform(undefined as any)).toBe('');
	});
});
