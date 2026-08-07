import { rawOnoffAuthor } from '../../onoff-raw-author.mock';
import { onoffAuthorDocument } from './author.document.projection';
// El subgrafo se afirma contra lo que realmente entra al dataset, no contra una copia local: comparar
// contra otra derivación del mismo raw pasaría igual con el dataset incompleto.
import {
	onoffNationalityDocumentsMock,
	onoffResourceTypeDocumentsMock,
} from '../document/support-documents.projection';

describe('documento de author', () => {
	it('preserves what the raw carries', () => {
		expect(onoffAuthorDocument._id).toBe(rawOnoffAuthor._id);
		expect(onoffAuthorDocument.name).toBe(rawOnoffAuthor.name);
		expect(onoffAuthorDocument.slug.current).toBe(rawOnoffAuthor.slug);
		expect(onoffAuthorDocument.biography).toBe(rawOnoffAuthor.biography);
		expect(onoffAuthorDocument.image).toEqual(rawOnoffAuthor.image);
	});

	// Una referencia que no resuelve contra el dataset no falla: `groq-js` la deja en null sin avisar.
	// Esta guarda es lo que evita que el dataset quede incompleto sin que ningún test lo note.
	it('emits a document for every reference it points to', () => {
		const emitted = new Set([
			...onoffNationalityDocumentsMock.map((document) => document._id),
			...onoffResourceTypeDocumentsMock.map((document) => document._id),
		]);

		expect(emitted).toContain(onoffAuthorDocument.nationality._ref);
		expect(onoffAuthorDocument.resources?.length).toBeGreaterThan(0);
		(onoffAuthorDocument.resources ?? []).forEach((resource) => {
			expect(emitted).toContain(resource.resourceType._ref);
		});
	});

	it('turns the flattened resource type back into a reference', () => {
		const [resource] = onoffAuthorDocument.resources ?? [];
		const [rawResource] = rawOnoffAuthor.resources ?? [];

		expect(resource?.title).toBe(rawResource?.title);
		expect(resource?.url).toBe(rawResource?.url);
		expect(resource?.resourceType._ref).toBe(onoffResourceTypeDocumentsMock[0]?._id);
	});

	// Cada elemento de un array de Sanity necesita su `_key`, y su ausencia solo se nota al editar en
	// el Studio, no al leer.
	it('keys every array element', () => {
		expect(onoffAuthorDocument.resources?.length).toBeGreaterThan(0);
		(onoffAuthorDocument.resources ?? []).forEach((resource) => expect(resource._key).toBeTruthy());
	});
});
