import { createSlug } from './slug.model';

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
