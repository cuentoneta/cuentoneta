export type OnoffAudioAsset = {
	/** La ruta que sirven la app y Storybook, tal como la declaran el documento y el corpus de dominio. */
	readonly path: string;
};

/** La forma de los clips que Sanity modela como `sanity.fileAsset`, dereferenciables por `_ref`. */
export type OnoffAudioFileAsset = OnoffAudioAsset & {
	readonly ref: string;
};

const AUDIO_EXTENSION = 'ogg';

function audioAsset(slug: string): OnoffAudioAsset {
	return Object.freeze({ path: `assets/audio/mocks/${slug}.${AUDIO_EXTENSION}` });
}

// A diferencia de las imágenes, el `_ref` de un archivo no lo parsea nadie: `@sanity/image-url` no
// interviene y el ACL dereferencia por igualdad contra el `_id` del asset. Por eso el identificador
// conserva el slug con guiones en vez de camelizarlo.
function audioFileAsset(slug: string): OnoffAudioFileAsset {
	return Object.freeze({ ...audioAsset(slug), ref: `file-${slug}-${AUDIO_EXTENSION}` });
}

// Las dos caras de cada clip salen de la misma entrada, igual que en la tabla de imágenes. La diferencia
// es que acá ambas capas declaran **el mismo** valor: el ACL pasa la URL tal cual, así que el documento y
// el modelo de dominio tienen que coincidir carácter a carácter o los cruces contra el ACL cortan.
export const onoffAudioAssets = Object.freeze({
	geometria: audioAsset('geometria'),
	geometriaSpace: audioFileAsset('geometria-space'),
	lasEscaleras: audioAsset('las-escaleras'),
} as const);

const declaredPaths = new Set(Object.values(onoffAudioAssets).map((asset) => asset.path));

/**
 * Toda ruta de audio que aparezca en una estructura, a cualquier profundidad, reconocida por la extensión
 * del formato. No deduplica: un mismo clip usado por dos medios sale dos veces.
 */
export function audioPathsIn(value: unknown): string[] {
	if (typeof value === 'string') {
		return value.endsWith(`.${AUDIO_EXTENSION}`) ? [value] : [];
	}
	if (typeof value !== 'object' || value === null) {
		return [];
	}
	return Object.values(value).flatMap(audioPathsIn);
}

/** Si la ruta la declara la tabla — o sea, si resuelve a un clip versionado y no a un destino inventado. */
export function isDeclaredAudioPath(path: string): boolean {
	return declaredPaths.has(path);
}
