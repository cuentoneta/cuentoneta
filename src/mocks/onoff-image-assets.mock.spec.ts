import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createImageUrlBuilder } from '@sanity/image-url';
import {
	imageReferencesIn,
	localImagePathForImageSource,
	onoffImageAssets,
	type OnoffImageAsset,
} from './onoff-image-assets.mock';
import { onoffDatasetMock } from './onoff-documents.mock';
import { rawOnoffAuthor, rawOnoffAuthorTeaser } from './onoff-raw-author.mock';
import { onoffRawCollectionsMock, onoffRawCollectionTeasersMock } from './onoff-raw-collections.mock';
import { onoffRawLiteraryWorksMock } from './onoff-raw-literary-works.mock';
import { onoffRawStoriesMock } from './onoff-raw-stories.mock';
import { onoffRawStorylistsMock } from './onoff-raw-storylists.mock';
import { onoffRawContentCampaignsMock } from './onoff-raw-landing-page.mock';

const assets: [string, OnoffImageAsset][] = Object.entries(onoffImageAssets);

// La app publica dos raíces distintas: `src/assets` bajo `/assets` y `public/` bajo la raíz. La ruta
// servida dice de cuál sale, así que el prefijo alcanza para volver a ubicar el archivo en disco.
function absolutePathOf(asset: OnoffImageAsset): string {
	const root = asset.path.startsWith('assets/') ? 'src' : 'public';
	return join(process.cwd(), root, asset.path);
}

// El ancho y el alto de un PNG viven en offsets fijos de la cabecera IHDR, que abre siempre el archivo.
function dimensionsOf(asset: OnoffImageAsset): string {
	const bytes = readFileSync(absolutePathOf(asset));
	return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
}

function refSegmentsOf(asset: OnoffImageAsset): { assetId: string; dimensions: string; extension: string } {
	const [, assetId, dimensions, extension] = asset.ref.split('-');
	return { assetId, dimensions, extension };
}

describe('la tabla de assets de imagen del corpus', () => {
	it.each(assets)('resolves "%s" to a file that exists', (_key, asset) => {
		expect(existsSync(absolutePathOf(asset))).toBe(true);
	});

	// El único spec que ejercita el builder real, sin sustituir: es lo que hace cumplir la restricción del
	// parser que la tabla documenta.
	it.each(assets)('builds a URL from the reference of "%s"', (_key, asset) => {
		const builder = createImageUrlBuilder({ clientConfig: { projectId: 'p', dataset: 'd' } });

		const url = builder.image({ _type: 'image', asset: { _type: 'reference', _ref: asset.ref } }).url();

		expect(url).toContain(refSegmentsOf(asset).assetId);
	});

	// La clave y el identificador dicen lo mismo, y sin esto podrían dejar de decirlo sin que nada se
	// entere. La rama hexadecimal cubre las entradas que la tabla exceptúa, con su porqué.
	it.each(assets)('names the entry "%s" after its own asset identifier', (key, asset) => {
		const { assetId } = refSegmentsOf(asset);

		expect(assetId === key || /^[a-f\d]+$/.test(assetId)).toBe(true);
	});

	it.each(assets)('declares the real dimensions and extension of "%s"', (_key, asset) => {
		const { dimensions, extension } = refSegmentsOf(asset);

		expect(dimensions).toBe(dimensionsOf(asset));
		expect(asset.path.endsWith(`.${extension}`)).toBe(true);
	});

	// Sin esta cobertura la tabla sería un mapa parcial: una referencia nueva que nadie sumara resolvería
	// a cadena vacía en los cruces contra el ACL, que la compararían contra la ruta que el dominio declara.
	it.each([
		['el dataset de documentos', onoffDatasetMock],
		['el corpus crudo de obras', onoffRawLiteraryWorksMock],
		['el corpus crudo de colecciones', [onoffRawCollectionsMock, onoffRawCollectionTeasersMock]],
		['el corpus crudo de historias', [onoffRawStoriesMock, onoffRawStorylistsMock]],
		['el autor crudo', [rawOnoffAuthor, rawOnoffAuthorTeaser]],
		['las campañas de contenido crudas', onoffRawContentCampaignsMock],
	])('covers every image reference declared by %s', (_source, corpus) => {
		const references = [...new Set(imageReferencesIn(corpus))];

		expect(references.length).toBeGreaterThan(0);
		expect(references.filter((reference) => localImagePathForImageSource(reference) === '')).toEqual([]);
	});
});
