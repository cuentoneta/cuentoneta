import { assertEveryReferenceResolves, findDanglingReferences } from './generate-raw-corpus.helpers';

describe('findDanglingReferences', () => {
	it('finds nothing when every reference has its document', () => {
		const dataset = [
			{ _id: 'obra', _type: 'literaryWork', tags: [{ _type: 'reference', _ref: 'tag-amor' }] },
			{ _id: 'tag-amor', _type: 'tag' },
		];

		expect(findDanglingReferences(dataset)).toEqual([]);
	});

	// El caso que el corpus sufre de verdad: la referencia no está en la raíz del documento sino anidada
	// dentro de un array de objetos, que es como Sanity guarda toda relación de cardinalidad múltiple.
	it('finds a reference nested inside an array', () => {
		const dataset = [
			{
				_id: 'coleccion',
				_type: 'collection',
				literaryWorks: [
					{ _key: 'a', _type: 'reference', _ref: 'obra-presente' },
					{ _key: 'b', _type: 'reference', _ref: 'obra-ausente' },
				],
			},
			{ _id: 'obra-presente', _type: 'literaryWork' },
		];

		expect(findDanglingReferences(dataset)).toEqual([{ ref: 'obra-ausente', declaredBy: 'coleccion' }]);
	});

	// `asset->url` es el modo de falla que motiva la guarda: el asset se referencia sin `_type: 'reference'`.
	it('finds an audio asset reference with no document', () => {
		const dataset = [
			{
				_id: 'obra',
				_type: 'literaryWork',
				mediaSources: [{ _type: 'spaceRecording', audioFile: { asset: { _ref: 'file-ausente' } } }],
			},
		];

		expect(findDanglingReferences(dataset)).toEqual([{ ref: 'file-ausente', declaredBy: 'obra' }]);
	});

	it('finds nothing in an empty dataset', () => {
		expect(findDanglingReferences([])).toEqual([]);
	});

	// La contracara del caso del audio: la portada se proyecta como objeto entero, así que su asset no
	// necesita documento. Exigirlo obligaría a inventar doce documentos de imagen que ninguna query lee.
	it('ignores an image asset with no document, which no query dereferences', () => {
		const dataset = [
			{
				_id: 'obra',
				_type: 'literaryWork',
				coverImage: { _type: 'image', asset: { _ref: 'image-abc-236x328-png' } },
			},
		];

		expect(findDanglingReferences(dataset)).toEqual([]);
	});
});

describe('assertEveryReferenceResolves', () => {
	it('stays silent when every reference resolves', () => {
		expect(() => assertEveryReferenceResolves([{ _id: 'obra', _type: 'literaryWork' }])).not.toThrow();
	});

	it('names the missing reference and the document that declares it', () => {
		const dataset = [{ _id: 'obra', _type: 'literaryWork', author: { _type: 'reference', _ref: 'autor-ausente' } }];

		expect(() => assertEveryReferenceResolves(dataset)).toThrow(/"autor-ausente", declarada por "obra"/);
	});
});
