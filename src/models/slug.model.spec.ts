import { createSlug, isSlug } from './slug.model';

describe('isSlug', () => {
	it.each(['el-aleph', 'cuento-123', 'a', 'que-seria-yo-sin-ti'])('accepts %j', (value) => {
		expect(isSlug(value)).toBe(true);
	});

	it.each(['IcyFox', '-el-aleph', 'el-aleph-', 'el--aleph', 'el aleph', 'capítulo-uno', 'foo_bar', ''])(
		'rejects %j',
		(value) => {
			expect(isSlug(value)).toBe(false);
		},
	);

	it.each([undefined, null, 42, { current: 'el-aleph' }])('rejects the non-string %j', (value) => {
		expect(isSlug(value)).toBe(false);
	});
});

describe('createSlug', () => {
	it('returns the value branded as Slug when the format is valid', () => {
		expect(createSlug('el-aleph')).toBe('el-aleph');
		expect(createSlug('cuento-123')).toBe('cuento-123');
		expect(createSlug('a')).toBe('a');
	});

	it('throws on uppercase characters', () => {
		expect(() => createSlug('El-Aleph')).toThrow('Slug inválido: "El-Aleph"');
	});

	it('throws on leading, trailing or consecutive hyphens', () => {
		expect(() => createSlug('-el-aleph')).toThrow('Slug inválido: "-el-aleph"');
		expect(() => createSlug('el-aleph-')).toThrow('Slug inválido: "el-aleph-"');
		expect(() => createSlug('el--aleph')).toThrow('Slug inválido: "el--aleph"');
	});

	it('throws on characters outside [a-z0-9-]', () => {
		expect(() => createSlug('el aleph')).toThrow('Slug inválido: "el aleph"');
		expect(() => createSlug('capítulo-uno')).toThrow('Slug inválido: "capítulo-uno"');
	});

	it('throws on an empty string', () => {
		expect(() => createSlug('')).toThrow('Slug inválido: ""');
	});
});
