import { type OnoffImageAsset, onoffImageAssets } from '@mocks/onoff-image-assets.mock';

/**
 * URL del CDN de Sanity que serviría un asset del corpus, armada desde su `_ref`
 * (`image-<assetId>-<ancho>x<alto>-<ext>`) con un proyecto y un dataset ficticios. El corpus de dominio
 * expone rutas locales, y las reglas que deciden por formato y tamaño solo aplican a URLs del CDN.
 */
export function cdnUrlFor(asset: OnoffImageAsset): string {
	const [, assetId, dimensions, extension] = asset.ref.split('-');
	return `https://cdn.sanity.io/images/test-project/test-dataset/${assetId}-${dimensions}.${extension}`;
}

/** Como `cdnUrlFor`, a partir de la ruta local que el corpus de dominio declara para la imagen. */
export function cdnUrlForCorpusPath(path: string): string {
	const asset = Object.values(onoffImageAssets).find((candidate) => candidate.path === path);
	if (!asset) {
		throw new Error(`El corpus no declara un asset con la ruta "${path}"`);
	}
	return cdnUrlFor(asset);
}
