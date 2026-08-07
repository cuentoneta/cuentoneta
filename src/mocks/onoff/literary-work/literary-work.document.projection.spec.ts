import { onoffRawLiteraryWorksMock } from '../../onoff-raw-literary-works.mock';
import {
	onoffLiteraryWorkAssetDocumentsMock,
	onoffLiteraryWorkDocumentsMock,
} from './literary-work.document.projection';

const [firstDocument] = onoffLiteraryWorkDocumentsMock;
const [firstRaw] = onoffRawLiteraryWorksMock;

describe('documento de literaryWork', () => {
	// Es el bug que motiva la capa: los documentos sintéticos declaraban la portada como string.
	it('keeps the cover image as the image object it is in the document', () => {
		expect(firstDocument?.coverImage).toEqual(firstRaw?.coverImage);
		expect(typeof firstDocument?.coverImage).not.toBe('string');
	});

	// La query los calcula; el documento no los tiene. Invertir una proyección es también descartar
	// lo que ella agrega.
	it('drops what the query computes', () => {
		expect(firstDocument).not.toHaveProperty('sectionCount');
		(firstDocument?.mediaSources ?? []).forEach((source) => expect(source).not.toHaveProperty('audioUrl'));
	});

	// Un campo ausente y uno en null no son lo mismo para GROQ, y el raw usa null donde el documento
	// simplemente no trae la clave.
	it('omits the keys the raw carries as null', () => {
		const withoutNote = onoffLiteraryWorkDocumentsMock.find((document, index) => {
			return onoffRawLiteraryWorksMock[index]?.editorialNote === null && document !== undefined;
		});

		expect(withoutNote).toBeDefined();
		expect(withoutNote).not.toHaveProperty('editorialNote');
	});

	it('turns tags and authors into references', () => {
		expect(firstDocument?.tags?.length).toBe(firstRaw?.tags.length);
		firstDocument?.tags?.forEach((tag) => expect(tag._ref).toBeTruthy());
		firstDocument?.authors.forEach((author) => expect(author._ref).toBeTruthy());
	});

	// Sin el documento de asset en el dataset, `asset->url` resuelve a null sin que nada falle.
	it('emits an asset document for every space recording', () => {
		const recordings = onoffRawLiteraryWorksMock.flatMap((work) =>
			(work.mediaSources ?? []).filter((source) => source._type === 'spaceRecording'),
		);

		expect(onoffLiteraryWorkAssetDocumentsMock.length).toBe(recordings.length);
		onoffLiteraryWorkAssetDocumentsMock.forEach((asset) => expect(asset.url).toBeTruthy());
	});
});
