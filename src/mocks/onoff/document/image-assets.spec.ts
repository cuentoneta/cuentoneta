import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createImageUrlBuilder } from '@sanity/image-url';
import { onoffImageAssets, type OnoffImageAsset } from './image-assets';

const assets: [string, OnoffImageAsset][] = Object.entries(onoffImageAssets);

// Las rutas del corpus son relativas a `src/`, que es lo que la app y Storybook publican en `/assets`.
function absolutePathOf(asset: OnoffImageAsset): string {
	return join(process.cwd(), 'src', asset.path);
}

function pngDimensions(bytes: Buffer): string {
	return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
}

// El tamaño de un JPEG vive en el marcador SOFn, que puede estar detrás de una cantidad arbitraria de
// segmentos de metadata: hay que recorrer la cadena en vez de leer un offset fijo como en PNG.
function jpegDimensions(bytes: Buffer): string {
	let offset = 2;
	while (offset < bytes.length - 8) {
		if (bytes[offset] !== 0xff) {
			offset++;
			continue;
		}
		const marker = bytes[offset + 1];
		const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
		if (isStartOfFrame) {
			return `${bytes.readUInt16BE(offset + 7)}x${bytes.readUInt16BE(offset + 5)}`;
		}
		offset += 2 + bytes.readUInt16BE(offset + 2);
	}
	throw new Error('El JPEG no declara un marcador SOF');
}

function dimensionsOf(asset: OnoffImageAsset): string {
	const bytes = readFileSync(absolutePathOf(asset));
	return asset.path.endsWith('.png') ? pngDimensions(bytes) : jpegDimensions(bytes);
}

function refSegmentsOf(asset: OnoffImageAsset): { assetId: string; dimensions: string; extension: string } {
	const [, assetId, dimensions, extension] = asset.ref.split('-');
	return { assetId, dimensions, extension };
}

describe('la tabla de assets de imagen del corpus', () => {
	it.each(assets)('resolves "%s" to a file that exists', (_key, asset) => {
		expect(existsSync(absolutePathOf(asset))).toBe(true);
	});

	// El parser de `_ref` corta por guiones y exige cuatro segmentos, así que un identificador con el slug
	// crudo (`francois-onoff`) lanza en vez de producir una URL. Acá el builder va sin sustituir: es el
	// único spec que ejercita el de verdad.
	it.each(assets)('builds a URL from the reference of "%s"', (_key, asset) => {
		const builder = createImageUrlBuilder({ clientConfig: { projectId: 'p', dataset: 'd' } });

		const url = builder.image({ _type: 'image', asset: { _type: 'reference', _ref: asset.ref } }).url();

		expect(url).toContain(refSegmentsOf(asset).assetId);
	});

	it.each(assets)('declares the real dimensions and extension of "%s"', (_key, asset) => {
		const { dimensions, extension } = refSegmentsOf(asset);

		expect(dimensions).toBe(dimensionsOf(asset));
		expect(asset.path.endsWith(`.${extension}`)).toBe(true);
	});
});
