import { onoffRawTagsMock } from '../../onoff-raw-tags.mock';
import { rawOnoffAuthor } from '../../onoff-raw-author.mock';
import { createFileAssetDocument, asDraft, documentSystemFields } from './sanity-document.factory';
import {
	onoffNationalityDocumentsMock,
	onoffResourceTypeDocumentsMock,
	onoffTagDocumentsMock,
	tagDocumentId,
} from './support-documents.projection';

describe('documentos de soporte', () => {
	it('derives one tag document per raw tag, preserving its prose', () => {
		expect(onoffTagDocumentsMock).toHaveLength(onoffRawTagsMock.length);

		onoffTagDocumentsMock.forEach((document, index) => {
			const raw = onoffRawTagsMock[index];

			expect(document.title).toBe(raw?.title);
			expect(document.slug.current).toBe(raw?.slug);
			expect(document.description).toBe(raw?.description);
		});
	});

	// El `_id` no viaja en el raw —la query no lo proyecta—, así que se deriva del slug. Que sea único
	// es lo que permite que una referencia resuelva contra un solo documento del dataset.
	it('derives a unique id for every tag', () => {
		const ids = onoffTagDocumentsMock.map((document) => document._id);

		expect(new Set(ids).size).toBe(ids.length);
	});

	it('derives the resource type documents the author references', () => {
		const slugs = (rawOnoffAuthor.resources ?? []).map((resource) => resource.resourceType.slug);

		expect(onoffResourceTypeDocumentsMock.map((document) => document.slug.current)).toEqual(slugs);
	});

	// La query dereferencia la nacionalidad sin proyectarla, así que el raw ya trae el documento entero.
	it('keeps the nationality document as the raw carries it', () => {
		expect(onoffNationalityDocumentsMock[0]).toEqual(rawOnoffAuthor.nationality);
	});
});

describe('factory de documentos', () => {
	// Una fecha variable haría fallar al azar el caso de una obra sin `publishedAt`, que la query
	// resuelve con `coalesce(publishedAt, _createdAt)`.
	it('stamps a stable timestamp', () => {
		expect(documentSystemFields('x')).toEqual(documentSystemFields('x'));
	});

	it('marks a draft with the path prefix Sanity uses', () => {
		expect(asDraft({ _id: 'onoff-collection-geometrias' })._id).toBe('drafts.onoff-collection-geometrias');
	});

	// Es lo que permite que `asset->url` resuelva sin red: la url es un campo del documento de asset.
	it('carries the url the raw transports for the asset', () => {
		const asset = createFileAssetDocument({ ref: 'file-abc', url: 'https://cdn.example.org/onoff/geometria.ogg' });

		expect(asset.url).toBe('https://cdn.example.org/onoff/geometria.ogg');
		expect(asset._id).toBe('file-abc');
		expect(asset.extension).toBe('ogg');
	});
});
