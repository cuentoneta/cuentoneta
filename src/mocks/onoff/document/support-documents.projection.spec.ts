import { onoffRawTagsMock } from '../../onoff-raw-tags.mock';
import { rawOnoffAuthor } from '../../onoff-raw-author.mock';
import { createAudioAssetDocument, asDraft, documentSystemFields } from './sanity-document.factory';
import {
	onoffNationalityDocumentsMock,
	onoffResourceTypeDocumentsMock,
	onoffTagDocumentsMock,
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

	it('carries the nationality as a document Sanity would store', () => {
		const [nationality] = onoffNationalityDocumentsMock;

		expect(nationality?._type).toBe('nationality');
		expect(nationality?.country).toBe(rawOnoffAuthor.nationality.country);
		expect(nationality?._id).toBeTruthy();
	});
});

describe('factory de documentos', () => {
	// Comparar dos llamadas entre sí no distingue una fecha fija de `new Date()`; que no sea la de hoy, sí.
	it('stamps a timestamp that is not the current date', () => {
		const stamped = new Date(documentSystemFields('x')._createdAt);

		expect(stamped.getFullYear()).toBeLessThan(new Date().getFullYear());
	});

	it('marks a draft with the path prefix Sanity uses', () => {
		expect(asDraft({ _id: 'onoff-collection-geometrias' })._id).toBe('drafts.onoff-collection-geometrias');
	});

	it('carries the url the raw transports for the asset', () => {
		const asset = createAudioAssetDocument({ ref: 'file-abc', url: 'https://cdn.example.org/onoff/geometria.ogg' });

		expect(asset.url).toBe('https://cdn.example.org/onoff/geometria.ogg');
		expect(asset._id).toBe('file-abc');
		expect(asset.extension).toBe('ogg');
	});
});
