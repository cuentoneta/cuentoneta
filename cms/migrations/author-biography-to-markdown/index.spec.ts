import { describe, expect, it } from 'vitest';

import migration from './index';

// La migración se define con `defineMigration`, que conserva el objeto tal cual: `migrate.document`
// es la función pura que decide el patch de cada autor, y es lo único que hace falta ejercitar.
const migrateDocument = (doc: { _id: string; biography?: unknown }) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never);
};

const paragraph = (text: string, marks: string[] = []) => ({
	_type: 'block',
	_key: 'b1',
	style: 'normal',
	markDefs: [],
	children: [{ _type: 'span', _key: 's1', text, marks }],
});

describe('author-biography-to-markdown', () => {
	it('alcanza solo a los documentos de autor', () => {
		expect(migration.documentTypes).toEqual(['author']);
	});

	it('convierte la biografía en Portable Text a Markdown', () => {
		const patches = migrateDocument({ _id: 'author-1', biography: [paragraph('Nombre', ['strong'])] });

		expect(patches).toMatchObject([{ path: ['biography'], op: { value: '**Nombre**' } }]);
	});

	// Idempotencia: permite reintentar la migración si una corrida se cortó a mitad de camino.
	it('no vuelve a tocar una biografía ya migrada', () => {
		expect(migrateDocument({ _id: 'author-1', biography: '**Nombre** ya en Markdown' })).toEqual([]);
	});

	it('no toca un autor sin biografía', () => {
		expect(migrateDocument({ _id: 'author-1' })).toEqual([]);
	});

	// El guard compara por contenido: un bloque de solo espacios rinde whitespace, no cadena vacía, y
	// persistirlo dejaría al autor con un valor que el dominio rechaza en cada lectura.
	it('aborta en vez de persistir una biografía sin texto', () => {
		expect(() => migrateDocument({ _id: 'author-1', biography: [paragraph('   ')] })).toThrow(/sin texto/);
	});

	// El conversor se detiene ante lo que no sabe traducir, para no perder contenido en silencio.
	it('aborta ante una construcción que el conversor no soporta', () => {
		const heading = { ...paragraph('Título'), style: 'h1' };

		expect(() => migrateDocument({ _id: 'author-1', biography: [heading] })).toThrow(/Estilo no soportado/);
	});
});
