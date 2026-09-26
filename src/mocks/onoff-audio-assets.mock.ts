export type OnoffAudioAsset = {
	readonly path: string;
};

export type OnoffAudioFileAsset = OnoffAudioAsset & {
	readonly ref: string;
};

const AUDIO_EXTENSION = 'ogg';

// Más amplio que lo que el corpus produce: la cobertura tiene que ver cualquier formato que un medio declare.
const RECOGNIZED_AUDIO_EXTENSIONS = Object.freeze(['ogg', 'oga', 'opus', 'mp3', 'm4a', 'aac', 'wav', 'flac'] as const);

function audioAsset(slug: string): OnoffAudioAsset {
	return Object.freeze({ path: `assets/audio/mocks/${slug}.${AUDIO_EXTENSION}` });
}

function audioFileAsset(slug: string): OnoffAudioFileAsset {
	return Object.freeze({ ...audioAsset(slug), ref: `file-${slug}-${AUDIO_EXTENSION}` });
}

export const onoffAudioAssets = Object.freeze({
	geometria: audioAsset('geometria'),
	geometriaSpace: audioFileAsset('geometria-space'),
	lasEscaleras: audioAsset('las-escaleras'),
} as const);

const declaredPaths = new Set(Object.values(onoffAudioAssets).map((asset) => asset.path));

// El `path` de un `sanity.fileAsset` es su ubicación interna en Sanity; lo que se sirve es `url`.
function servedEntriesOf(value: object): unknown[] {
	const isFileAsset = (value as { _type?: unknown })._type === 'sanity.fileAsset';
	return Object.entries(value)
		.filter(([key]) => !(isFileAsset && key === 'path'))
		.map(([, entry]) => entry);
}

/** Toda ruta de audio servida en una estructura, a cualquier profundidad. No deduplica. */
export function audioPathsIn(value: unknown): string[] {
	if (typeof value === 'string') {
		return RECOGNIZED_AUDIO_EXTENSIONS.some((extension) => value.endsWith(`.${extension}`)) ? [value] : [];
	}
	if (typeof value !== 'object' || value === null) {
		return [];
	}
	return servedEntriesOf(value).flatMap(audioPathsIn);
}

export function isDeclaredAudioPath(path: string): boolean {
	return declaredPaths.has(path);
}
