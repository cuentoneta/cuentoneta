import type { CollectionsQueryResult } from '@sanity-types';
import {
	onoffRawCollectionTeasersWithFeaturedImage,
	onoffRawCollectionTeasersWithoutFeaturedImage,
} from '@mocks/onoff-raw-collections.mock';
import { mapSanityCollectionTeaser } from './collection-teaser.acl';
import { MalformedCollectionError } from './collection.errors';

// Se piden por capacidad y no por nombre: el caso necesita "una con portada editorial", no una
// colección puntual del canon.
type RawCollectionTeaser = CollectionsQueryResult[number];
const [withFeaturedImage] = onoffRawCollectionTeasersWithFeaturedImage;
const [withoutFeaturedImage] = onoffRawCollectionTeasersWithoutFeaturedImage;

describe('mapSanityCollectionTeaser imagery', () => {
	it('uses the editorial cover when the collection declares one', () => {
		const teaser = mapSanityCollectionTeaser(withFeaturedImage);

		expect(teaser.imagery.kind).toBe('representative');
	});

	it('falls back to the fan of the first three work covers', () => {
		const teaser = mapSanityCollectionTeaser(withoutFeaturedImage);

		expect(teaser.imagery).toEqual({
			kind: 'sample',
			images: expect.arrayContaining([expect.any(String)]),
		});
		expect(teaser.imagery.kind === 'sample' && teaser.imagery.images).toHaveLength(3);
	});

	// Rellenar el abanico dejaría una imagen rota en la interfaz, así que el dato incompleto tumba el
	// mapeo en la frontera.
	it('rejects a collection whose fan cannot be completed', () => {
		const shortFan: RawCollectionTeaser = {
			...withoutFeaturedImage,
			literaryWorkCoverImages: withoutFeaturedImage.literaryWorkCoverImages.slice(0, 2),
		};

		expect(() => mapSanityCollectionTeaser(shortFan)).toThrow(MalformedCollectionError);
	});
});

describe('mapSanityCollectionTeaser guards', () => {
	it('rejects a collection without prose', () => {
		const descriptionless: RawCollectionTeaser = { ...withFeaturedImage, description: '' };

		expect(() => mapSanityCollectionTeaser(descriptionless)).toThrow();
	});

	// Es la invariante "al menos una obra" traducida a lo único que el teaser transporta.
	it('rejects a collection with no works', () => {
		const empty: RawCollectionTeaser = { ...withFeaturedImage, count: 0 };

		expect(() => mapSanityCollectionTeaser(empty)).toThrow();
	});
});

describe('mapSanityCollectionTeaser prose', () => {
	// El teaser se pinta dentro de una tarjeta que ya es un enlace, así que su prosa va sin enlaces
	// propios: anidarlos produce marcado inválido.
	it('strips links from the description', () => {
		const linked: RawCollectionTeaser = {
			...withFeaturedImage,
			description: 'Una colección con [un enlace propio](https://www.cuentoneta.ar/about) en la prosa.',
		};

		const teaser = mapSanityCollectionTeaser(linked);

		expect(teaser.description).not.toContain('<a');
		expect(teaser.description).toContain('un enlace propio');
	});
});
