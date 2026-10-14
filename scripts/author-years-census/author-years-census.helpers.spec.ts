import {
	changesServedValue,
	classifyAuthorYear,
	countByClass,
	entriesOf,
	formatCensusReport,
	type AuthorYearRow,
} from './author-years-census.helpers';

const row = (overrides: Partial<AuthorYearRow>): AuthorYearRow => ({
	slug: 'un-autor',
	bornOn: null,
	bornOnYear: null,
	diedOn: null,
	diedOnYear: null,
	...overrides,
});

describe('classifyAuthorYear', () => {
	it.each([
		['agrees', '1948-01-01', 1948],
		['diverges', '1948-01-01', 1950],
		['derived-only', '1948-01-01', null],
		['manual-only', null, 1500],
		['none', null, null],
		['invalid-date', '1948-1-1', 1950],
		['invalid-date', '2101-01-01', null],
	] as const)('classifies as %s the date %j with persisted year %j', (expected, date, persisted) => {
		expect(classifyAuthorYear(date, persisted)).toBe(expected);
	});

	it('compares BCE years with the historical numbering', () => {
		expect(classifyAuthorYear('-0043-03-20', -43)).toBe('agrees');
		expect(classifyAuthorYear('-0043-03-20', 43)).toBe('diverges');
	});
});

describe('entriesOf', () => {
	it('emits one entry per field with the year the ACL would derive', () => {
		const entries = entriesOf(row({ bornOn: '1948-01-01', bornOnYear: 1948, diedOn: '1994-12-31', diedOnYear: 1990 }));

		expect(entries.map(({ field, kind, derived }) => ({ field, kind, derived }))).toEqual([
			{ field: 'bornOnYear', kind: 'agrees', derived: 1948 },
			{ field: 'diedOnYear', kind: 'diverges', derived: 1994 },
		]);
	});
});

describe('changesServedValue', () => {
	it.each([
		['diverges', true],
		['derived-only', true],
		['agrees', false],
		['manual-only', false],
		['none', false],
		['invalid-date', false],
	] as const)('is %s -> %s', (kind, expected) => {
		const [entry] = entriesOf(row({}));
		expect(changesServedValue({ ...entry, kind })).toBe(expected);
	});
});

describe('countByClass', () => {
	it('counts every class, including the empty ones', () => {
		const entries = entriesOf(row({ bornOn: '1948-01-01', bornOnYear: 1948 }));

		expect(countByClass(entries)).toEqual({
			agrees: 1,
			diverges: 0,
			'derived-only': 0,
			'manual-only': 0,
			none: 1,
			'invalid-date': 0,
		});
	});
});

describe('formatCensusReport', () => {
	it('states that nothing changes when every author agrees', () => {
		const report = formatCensusReport(entriesOf(row({ bornOn: '1948-01-01', bornOnYear: 1948 })));

		expect(report).toContain('Ningún autor cambia de valor.');
	});

	it('lists the authors whose served value changes', () => {
		const report = formatCensusReport(entriesOf(row({ slug: 'cortazar', bornOn: '1914-08-26', bornOnYear: 1915 })));

		expect(report).toContain('Cambian de valor al desplegar:');
		expect(report).toContain('cortazar bornOnYear: fecha 1914-08-26, persistido 1915, derivado 1914');
	});
});
