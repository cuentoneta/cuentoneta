export type OnoffImageAsset = {
	/** El `_ref` que declara la capa de documentos, tal como lo guardaría Sanity. */
	readonly ref: string;
	/** La ruta que sirven la app y Storybook, tal como la declara el corpus de dominio. */
	readonly path: string;
};

// El parser de `_ref` de `@sanity/image-url` corta por guiones y exige exactamente cuatro segmentos
// (`image-<assetId>-<ancho>x<alto>-<ext>`), así que el identificador no puede ser el slug: se camelCasea.
function toCamelCase(slug: string): string {
	return slug.replace(/-(.)/g, (_, letter: string) => letter.toUpperCase());
}

function imageAsset(assetId: string, dimensions: string, extension: string, path: string): OnoffImageAsset {
	return Object.freeze({ ref: `image-${assetId}-${dimensions}-${extension}`, path });
}

// Las ocho portadas comparten directorio, medida y formato, así que el slug aparece una sola vez.
function coverAsset(slug: string): OnoffImageAsset {
	return imageAsset(`${toCamelCase(slug)}Cover`, '236x328', 'png', `assets/img/mocks/stories/${slug}.png`);
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
	francoisOnoffPortrait: imageAsset(
		'francoisOnoffPortrait',
		'1254x1254',
		'png',
		'assets/img/mocks/author/francois-onoff.png',
	),
	franceFlag: imageAsset('franceFlag', '30x20', 'png', 'assets/img/mocks/flags/fr.png'),
	// La portada editorial de la colección y el `featuredImage` de la storylist homónima son el mismo
	// archivo, así que comparten entrada: sostener dos volvería a meter una mentira en la tabla.
	geometriasDelDesveloCover: imageAsset(
		'geometriasDelDesveloCover',
		'236x328',
		'png',
		'assets/img/mocks/collections/geometrias-del-desvelo.png',
	),
	// El host de la grabación no tiene retrato; el corpus muestra el avatar por defecto que la app ya sirve.
	defaultAvatar: imageAsset('defaultAvatar', '360x360', 'jpg', 'assets/img/default-avatar.jpg'),
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

/** Toda referencia de imagen que aparezca en una estructura, sin importar a qué profundidad. */
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
