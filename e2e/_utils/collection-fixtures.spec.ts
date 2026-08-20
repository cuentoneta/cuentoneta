import { descriptionText, pickMostDescriptiveCollection, type CollectionCatalogEntry } from './collection-fixtures';

function entry(slug: string, description: string): CollectionCatalogEntry {
	return { slug, title: slug, description };
}

describe('descriptionText', () => {
	it('quita el marcado y deja el texto legible', () => {
		expect(descriptionText('<p>Una <strong>colección</strong> de verano</p>')).toBe('Una colección de verano');
	});

	it('colapsa los espacios que deja el marcado quitado', () => {
		expect(descriptionText('<p>Uno</p>\n\n<p>Dos</p>')).toBe('Uno Dos');
	});

	it('devuelve cadena vacía con una descripción sin texto', () => {
		expect(descriptionText('<p></p>')).toBe('');
	});
});

describe('pickMostDescriptiveCollection', () => {
	it('devuelve undefined con un catálogo vacío', () => {
		expect(pickMostDescriptiveCollection([])).toBeUndefined();
	});

	it('elige la de descripción más larga', () => {
		const catalog = [entry('corta', '<p>Breve</p>'), entry('larga', '<p>Una descripción bastante más extensa</p>')];

		expect(pickMostDescriptiveCollection(catalog)?.slug).toBe('larga');
	});

	// El desempate estable es lo que hace que el spec lea siempre la misma página: sin él, la elección
	// dependería del orden en que el CMS devolvió el catálogo.
	it('desempata por slug ante descripciones del mismo largo', () => {
		const catalog = [entry('otono', '<p>Mismo largo</p>'), entry('invierno', '<p>Mismo largo</p>')];

		expect(pickMostDescriptiveCollection(catalog)?.slug).toBe('invierno');
		expect(pickMostDescriptiveCollection([...catalog].reverse())?.slug).toBe('invierno');
	});

	// El largo se mide sobre el texto y no sobre el marcado: una descripción envuelta en más etiquetas
	// no es una descripción más larga.
	it('mide el texto y no el marcado', () => {
		const catalog = [
			entry('marcada', '<div><p><strong><em>Corta</em></strong></p></div>'),
			entry('extensa', '<p>Bastante más texto que la otra</p>'),
		];

		expect(pickMostDescriptiveCollection(catalog)?.slug).toBe('extensa');
	});
});
