import type { LiteraryWork } from '@sanity-types';
import { onoffRawLiteraryWorksMock } from '../../onoff-raw-literary-works.mock';
import { onoffTagDocumentsMock } from '../document/support-documents.projection';
import {
	onoffLiteraryWorkAssetDocumentsMock,
	onoffLiteraryWorkDocumentsMock,
} from './literary-work.document.projection';

const [firstDocument] = onoffLiteraryWorkDocumentsMock;
const [firstRaw] = onoffRawLiteraryWorksMock;

// El caso de los medios necesita la obra que los tiene: la primera del canon no declara ninguno, así
// que un bucle sobre ella no correría y el caso pasaría vacío.
const withMediaIndex = onoffRawLiteraryWorksMock.findIndex((work) => (work.mediaSources ?? []).length > 0);
const documentWithMedia = onoffLiteraryWorkDocumentsMock[withMediaIndex];

describe('documento de literaryWork', () => {
	it('keeps the cover image as the image object it is in the document', () => {
		expect(firstDocument?.coverImage).toEqual(firstRaw?.coverImage);
		expect(firstDocument?.coverImage).toMatchObject({ _type: 'image' });
	});

	// La guarda es el `@ts-expect-error`, no un `expect`: si el campo alguna vez admitiera un string, la
	// directiva quedaría sin usar y `tsc` cortaría — el gate de typecheck cubre los spec.
	it('rejects a cover image declared as a path', () => {
		const document: LiteraryWork = {
			...(firstDocument as LiteraryWork),
			// @ts-expect-error la portada es un objeto de imagen en el documento, no una ruta
			coverImage: 'uno.png',
		};

		expect(document._id).toBe(firstDocument?._id);
	});

	it('drops the section count the query computes', () => {
		expect(firstDocument).not.toHaveProperty('sectionCount');
	});

	it('drops the resolved audio url from the media it carries', () => {
		expect(documentWithMedia?.mediaSources?.length).toBeGreaterThan(0);
		documentWithMedia?.mediaSources?.forEach((source) => expect(source).not.toHaveProperty('audioUrl'));
	});

	// Un campo ausente y uno en null no son lo mismo para GROQ, y el raw usa null donde el documento
	// simplemente no trae la clave.
	it('omits the keys the raw carries as null', () => {
		const withoutNoteIndex = onoffRawLiteraryWorksMock.findIndex((work) => work.editorialNote === null);

		expect(withoutNoteIndex).toBeGreaterThanOrEqual(0);
		expect(onoffLiteraryWorkDocumentsMock[withoutNoteIndex]).not.toHaveProperty('editorialNote');
	});

	// Que la referencia exista no alcanza: si apunta a un `_id` que no está en el dataset, la query la
	// resuelve a null sin fallar. Lo que hay que afirmar es que resuelve contra un documento real.
	it('references tags that exist as documents', () => {
		const tagIds = new Set(onoffTagDocumentsMock.map((tag) => tag._id));

		onoffLiteraryWorkDocumentsMock.forEach((document) => {
			expect(document.tags?.length).toBe(
				onoffRawLiteraryWorksMock.find((raw) => raw._id === document._id)?.tags.length,
			);
			document.tags?.forEach((tag) => expect(tagIds).toContain(tag._ref));
		});
	});

	it('keeps every field the query projects, resources included', () => {
		onoffLiteraryWorkDocumentsMock.forEach((document, index) => {
			expect(document.resources ?? []).toHaveLength(onoffRawLiteraryWorksMock[index]?.resources.length ?? 0);
		});
	});

	it('emits an asset document for every space recording', () => {
		const recordings = onoffRawLiteraryWorksMock.flatMap((work) =>
			(work.mediaSources ?? []).filter((source) => source._type === 'spaceRecording'),
		);

		expect(recordings.length).toBeGreaterThan(0);
		expect(onoffLiteraryWorkAssetDocumentsMock.length).toBe(recordings.length);
		onoffLiteraryWorkAssetDocumentsMock.forEach((asset) => expect(asset.url).toBeTruthy());
	});
});
