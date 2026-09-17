import { audioPathsIn, isDeclaredAudioPath, onoffAudioAssets, type OnoffAudioAsset } from './onoff-audio-assets.mock';

const assets: [string, OnoffAudioAsset][] = Object.entries(onoffAudioAssets);

function slugOf(asset: OnoffAudioAsset): string {
	const [slug] = (asset.path.split('/').at(-1) ?? '').split('.');
	return slug;
}

function toCamelCase(slug: string): string {
	return slug.replace(/-(.)/g, (_, letter: string) => letter.toUpperCase());
}

function refOf(asset: OnoffAudioAsset): string | undefined {
	return (asset as { ref?: string }).ref;
}

describe('la tabla de assets de audio del corpus', () => {
	// La clave y el archivo dicen lo mismo, y sin esto podrían dejar de decirlo sin que nada se entere.
	it.each(assets)('names the entry "%s" after its own clip', (key, asset) => {
		expect(toCamelCase(slugOf(asset))).toBe(key);
	});

	it('declares a distinct clip per entry', () => {
		const paths = assets.map(([, asset]) => asset.path);

		expect(new Set(paths).size).toBe(paths.length);
	});

	// El `_ref` es lo que el documento declara y la ruta es lo que el dominio sirve: si dejan de nombrar al
	// mismo archivo, el cruce contra el ACL compara dos clips distintos y nadie lo nota.
	it.each(assets.filter(([, asset]) => refOf(asset) !== undefined))(
		'derives the reference of "%s" from its own clip',
		(_key, asset) => {
			expect(refOf(asset)).toBe(`file-${slugOf(asset)}-ogg`);
		},
	);

	describe('audioPathsIn', () => {
		it('finds every clip at any depth, without deduplicating', () => {
			const corpus = { a: [{ url: 'x/one.ogg' }], b: { nested: { url: 'x/one.ogg' } }, c: 'x/two.ogg' };

			expect(audioPathsIn(corpus).sort()).toEqual(['x/one.ogg', 'x/one.ogg', 'x/two.ogg']);
		});

		it('ignores values that are not clips', () => {
			expect(audioPathsIn({ url: 'https://open.spotify.com/embed/episode/x', videoId: null, n: 1 })).toEqual([]);
		});
	});

	describe('isDeclaredAudioPath', () => {
		it.each(assets)('recognizes the clip of "%s"', (_key, asset) => {
			expect(isDeclaredAudioPath(asset.path)).toBe(true);
		});

		it('rejects a path the table does not declare', () => {
			expect(isDeclaredAudioPath('assets/audio/mocks/inventado.ogg')).toBe(false);
		});
	});
});
