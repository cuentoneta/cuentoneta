import { describe, expect, it } from 'vitest';
import {
	AUTHOR_CORE_GAPS,
	BIOGRAPHY_MIN_CHARS,
	evaluateAuthor,
	evaluateStory,
	groupByGap,
	STORY_GAPS,
	type AuthorAuditInput,
	type StoryAuditInput,
} from './structured-data-completeness';

const completeAuthor = (): AuthorAuditInput => ({
	name: 'Ada Lovelace',
	slug: 'ada-lovelace',
	hasImage: true,
	resourceUrls: ['https://es.wikipedia.org/wiki/Ada_Lovelace'],
	hasNationality: true,
	biographyText: 'x'.repeat(BIOGRAPHY_MIN_CHARS),
	bornOn: '1815-12-10',
	diedOn: '1852-11-27',
});

const completeStory = (): StoryAuditInput => ({
	title: 'Un cuento',
	slug: 'un-cuento',
	hasAuthor: true,
	hasPublishedAt: true,
	originalPublication: 'Revista X, 1920',
	reviewText: 'Resumen del cuento.',
});

describe('evaluateAuthor', () => {
	it('returns no core gaps for a complete author', () => {
		const result = evaluateAuthor(completeAuthor());
		expect(result.coreGaps).toEqual([]);
		expect(result.incompleteness).toBe(0);
	});

	it('flags each missing core field and computes incompleteness', () => {
		const result = evaluateAuthor({
			name: 'Sin ficha',
			slug: null,
			hasImage: false,
			resourceUrls: [],
			hasNationality: false,
			biographyText: '',
			bornOn: null,
			diedOn: null,
		});
		expect(result.coreGaps).toEqual([...AUTHOR_CORE_GAPS]);
		expect(result.gaps).toContain('diedOn');
		expect(result.incompleteness).toBe(1);
	});

	it('treats empty resource urls as missing sameAs', () => {
		const result = evaluateAuthor({
			...completeAuthor(),
			resourceUrls: ['', null, '   '],
		});
		expect(result.coreGaps).toContain('sameAs');
	});

	it('flags short biography under the min length', () => {
		const result = evaluateAuthor({
			...completeAuthor(),
			biographyText: 'corta',
		});
		expect(result.coreGaps).toContain('biography');
	});
});

describe('evaluateStory', () => {
	it('returns no gaps for a complete story', () => {
		const result = evaluateStory(completeStory());
		expect(result.gaps).toEqual([]);
		expect(result.usesCreatedAtFallback).toBe(false);
		expect(result.incompleteness).toBe(0);
	});

	it('marks publishedAt fallback when editorial date is missing', () => {
		const result = evaluateStory({
			...completeStory(),
			hasPublishedAt: false,
		});
		expect(result.usesCreatedAtFallback).toBe(true);
		expect(result.gaps).toContain('publishedAt');
	});

	it('flags missing author, originalPublication and review', () => {
		const result = evaluateStory({
			title: 'T',
			slug: 't',
			hasAuthor: false,
			hasPublishedAt: true,
			originalPublication: null,
			reviewText: null,
		});
		expect(result.gaps).toEqual(expect.arrayContaining(['author', 'originalPublication', 'review']));
	});
});

describe('groupByGap', () => {
	it('counts items per gap', () => {
		const counts = groupByGap([{ gaps: ['slug', 'image'] as const }, { gaps: ['slug'] as const }], [
			'slug',
			'image',
			'sameAs',
		] as const);
		expect(counts.slug).toBe(2);
		expect(counts.image).toBe(1);
		expect(counts.sameAs).toBe(0);
	});

	it('covers all story gap keys', () => {
		const counts = groupByGap([{ gaps: [...STORY_GAPS] }], STORY_GAPS);
		for (const g of STORY_GAPS) {
			expect(counts[g]).toBe(1);
		}
	});
});
