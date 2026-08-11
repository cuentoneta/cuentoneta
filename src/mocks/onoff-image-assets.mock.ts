export type OnoffImageAsset = {
	/** El `_ref` que declara la capa de documentos, tal como lo guardaría Sanity. */
	readonly ref: string;
	/** La ruta que sirven la app y Storybook, tal como la declara el corpus de dominio. */
	readonly path: string;
};

// El parser de `_ref` de `@sanity/image-url` corta por guiones y exige exactamente cuatro segmentos
// (`image-<assetId>-<ancho>x<alto>-<ext>`), así que ningún identificador puede llevar el slug crudo. Qué
// alfabeto usa en su lugar lo decide cada entrada, y las que no son camelCase dicen por qué.
function toCamelCase(slug: string): string {
	return slug.replace(/-(.)/g, (_, letter: string) => letter.toUpperCase());
}

function imageAsset(params: { assetId: string; dimensions: string; extension: string; path: string }): OnoffImageAsset {
	return Object.freeze({
		ref: `image-${params.assetId}-${params.dimensions}-${params.extension}`,
		path: params.path,
	});
}

function coverAsset(slug: string): OnoffImageAsset {
	return imageAsset({
		assetId: `${toCamelCase(slug)}Cover`,
		dimensions: '236x328',
		extension: 'png',
		path: `assets/img/mocks/stories/${slug}.png`,
	});
}

// Las dos caras de cada imagen del corpus salen de la misma entrada: la capa de documentos toma `ref` y
// el corpus de dominio toma `path`, así que no pueden divergir por edición. Las medidas y la extensión
// describen el archivo real —no son relleno—: el spec de este módulo las compara contra la cabecera del
// binario, porque un `_ref` que miente se vuelve una URL rota apenas algo lo dereferencie.
export const onoffImageAssets = Object.freeze({
	elPalacioDeLasNueveFronterasCover: coverAsset('el-palacio-de-las-nueve-fronteras'),
	geometriaCover: coverAsset('geometria'),
	losPeldanosCover: coverAsset('los-peldanos'),
	lasEscalerasCover: coverAsset('las-escaleras'),
	elOdioCover: coverAsset('el-odio'),
	elTratadoDeLosPlaceresCover: coverAsset('el-tratado-de-los-placeres'),
	lasDosAntorchasCover: coverAsset('las-dos-antorchas'),
	neronCover: coverAsset('neron'),
	francoisOnoffPortrait: imageAsset({
		assetId: 'francoisOnoffPortrait',
		dimensions: '1254x1254',
		extension: 'png',
		path: 'assets/img/mocks/author/francois-onoff.png',
	}),
	franceFlag: imageAsset({
		assetId: 'franceFlag',
		dimensions: '30x20',
		extension: 'png',
		path: 'assets/img/mocks/flags/fr.png',
	}),
	// La portada editorial de la colección y el `featuredImage` de la storylist homónima son el mismo
	// archivo, así que comparten entrada: sostener dos volvería a meter una mentira en la tabla.
	geometriasDelDesveloCover: imageAsset({
		assetId: 'geometriasDelDesveloCover',
		dimensions: '236x328',
		extension: 'png',
		path: 'assets/img/mocks/collections/geometrias-del-desvelo.png',
	}),
	// El corpus tiene su propio avatar de host y no reusa el de la app: si apuntara al avatar por defecto,
	// la grabación quedaría indistinguible de una sin retrato y este archivo pasaría a depender de un asset
	// de producción, que cambia por razones ajenas al corpus.
	bibliotecaMeridienAvatar: imageAsset({
		assetId: 'bibliotecaMeridienAvatar',
		dimensions: '96x96',
		extension: 'png',
		path: 'assets/img/mocks/media/biblioteca-meridien-avatar.png',
	}),
	// Los banners de campaña son la excepción al identificador legible: el Studio valida ese campo con un
	// patrón que solo admite hexadecimal (`decodeAssetId` en `cms/utils/content-campaign-image.ts`, que
	// lanza ante cualquier otra forma), así que un identificador en camelCase modelaría algo que el CMS
	// rechazaría. La legibilidad vive en la clave de la tabla. Cada viewport es un archivo distinto y por
	// eso lleva su propia entrada: la campaña ocupa un tamaño fijo y el Studio lo valida contra estas medidas.
	coleccionCompletaBannerMobile: imageAsset({
		assetId: '0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
		dimensions: '540x220',
		extension: 'png',
		path: 'assets/img/mocks/banners/banner-coleccion-completa-mobile.png',
	}),
	coleccionCompletaBannerDesktop: imageAsset({
		assetId: '2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d',
		dimensions: '1240x360',
		extension: 'png',
		path: 'assets/img/mocks/banners/banner-coleccion-completa-desktop.png',
	}),
	elPalacioBannerMobile: imageAsset({
		assetId: '1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
		dimensions: '540x220',
		extension: 'png',
		path: 'assets/img/mocks/banners/banner-el-palacio-mobile.png',
	}),
	elPalacioBannerDesktop: imageAsset({
		assetId: '3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
		dimensions: '1240x360',
		extension: 'png',
		path: 'assets/img/mocks/banners/banner-el-palacio-desktop.png',
	}),
} as const);

const pathByRef = new Map(Object.values(onoffImageAssets).map((asset) => [asset.ref, asset.path]));

function referenceOf(source: unknown): string | undefined {
	if (typeof source === 'string') {
		return source;
	}
	if (typeof source !== 'object' || source === null) {
		return undefined;
	}
	const candidate = source as { _ref?: unknown; asset?: { _ref?: unknown } };
	const reference = candidate._ref ?? candidate.asset?._ref;
	return typeof reference === 'string' ? reference : undefined;
}

/**
 * La ruta del asset local que le corresponde a una fuente de imagen de Sanity, o cadena vacía si su
 * referencia no está en la tabla — el mismo valor con el que `urlFor` señala una fuente irresoluble.
 */
export function localImagePathForImageSource(source: unknown): string {
	const reference = referenceOf(source);
	return (reference !== undefined ? pathByRef.get(reference) : undefined) ?? '';
}

/**
 * Toda referencia de imagen que aparezca en una estructura, a cualquier profundidad, reconocida por el
 * prefijo `image-` de su `_ref`. No deduplica: una misma imagen usada por dos documentos sale dos veces.
 */
export function imageReferencesIn(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.flatMap(imageReferencesIn);
	}
	if (typeof value !== 'object' || value === null) {
		return [];
	}
	const reference = (value as { _ref?: unknown })._ref;
	if (typeof reference === 'string' && reference.startsWith('image-')) {
		return [reference];
	}
	return Object.values(value).flatMap(imageReferencesIn);
}
