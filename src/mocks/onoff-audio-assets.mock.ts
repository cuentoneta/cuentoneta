export type OnoffAudioAsset = {
	/** La ruta que sirven la app y Storybook, tal como la declaran el documento y el corpus de dominio. */
	readonly path: string;
};

/** La forma de los clips que Sanity modela como `sanity.fileAsset`, dereferenciables por `_ref`. */
export type OnoffAudioFileAsset = OnoffAudioAsset & {
	readonly ref: string;
};

const AUDIO_EXTENSION = 'ogg';

// Los formatos que un `<audio>` puede servir. El corpus produce un solo formato, pero el recorrido
// reconoce todos: con uno solo, un medio que declarara otra extensión quedaría fuera de la cobertura en
// silencio, que es el modo de falla que la tabla existe para cerrar.
const RECOGNIZED_AUDIO_EXTENSIONS = Object.freeze(['ogg', 'oga', 'opus', 'mp3', 'm4a', 'aac', 'wav', 'flac'] as const);

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

// El `path` de un `sanity.fileAsset` es la ubicación interna del archivo en el almacenamiento de Sanity,
// no algo que el navegador pida: lo servido es `url`. Recorrerlo reportaría como destino inventado a un
// campo que ningún reproductor toca.
function servedEntriesOf(value: object): unknown[] {
	const isFileAsset = (value as { _type?: unknown })._type === 'sanity.fileAsset';
	return Object.entries(value)
		.filter(([key]) => !(isFileAsset && key === 'path'))
		.map(([, entry]) => entry);
}

/**
 * Toda ruta de audio **servida** que aparezca en una estructura, a cualquier profundidad, reconocida por
 * su extensión. No deduplica: un mismo clip usado por dos medios sale dos veces.
 */
export function audioPathsIn(value: unknown): string[] {
	if (typeof value === 'string') {
		return RECOGNIZED_AUDIO_EXTENSIONS.some((extension) => value.endsWith(`.${extension}`)) ? [value] : [];
	}
	if (typeof value !== 'object' || value === null) {
		return [];
	}
	return servedEntriesOf(value).flatMap(audioPathsIn);
}

/** Si la ruta la declara la tabla — o sea, si resuelve a un clip versionado y no a un destino inventado. */
export function isDeclaredAudioPath(path: string): boolean {
	return declaredPaths.has(path);
}
