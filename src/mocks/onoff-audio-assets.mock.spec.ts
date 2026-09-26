import { existsSync } from 'node:fs';
import { join } from 'node:path';

import {
	audioPathsIn,
	isDeclaredAudioPath,
	onoffAudioAssets,
	type OnoffAudioAsset,
	type OnoffAudioFileAsset,
} from './onoff-audio-assets.mock';
import { onoffDatasetMock } from './onoff-documents.mock';
import { onoffRawCollectionsMock } from './onoff-raw-collections.mock';
import { onoffRawLiteraryWorksMock } from './onoff-raw-literary-works.mock';
import { onoffMediaMock } from './onoff-media.mock';
import { onoffCollectionsMock } from './onoff-collections.mock';

const assets: [string, OnoffAudioAsset | OnoffAudioFileAsset][] = Object.entries(onoffAudioAssets);

function hasReference(asset: OnoffAudioAsset | OnoffAudioFileAsset): asset is OnoffAudioFileAsset {
	return 'ref' in asset;
}

function slugOf(asset: OnoffAudioAsset): string {
	const [slug] = (asset.path.split('/').at(-1) ?? '').split('.');
	return slug;
}

function toCamelCase(slug: string): string {
	return slug.replace(/-(.)/g, (_, letter: string) => letter.toUpperCase());
}

describe('la tabla de assets de audio del corpus', () => {
	it.each(assets)('names the entry "%s" after its own clip', (key, asset) => {
		expect(toCamelCase(slugOf(asset))).toBe(key);
	});

	it.each(assets)('resolves "%s" to a file that exists', (_key, asset) => {
		expect(existsSync(join(process.cwd(), 'src', asset.path))).toBe(true);
	});

	it('declares a distinct clip per entry', () => {
		const paths = assets.map(([, asset]) => asset.path);

		expect(new Set(paths).size).toBe(paths.length);
	});

	it.each(assets.filter((entry): entry is [string, OnoffAudioFileAsset] => hasReference(entry[1])))(
		'derives the reference of "%s" from its own clip',
		(_key, asset) => {
			expect(asset.ref).toBe(`file-${slugOf(asset)}-ogg`);
		},
	);

	describe('audioPathsIn', () => {
		it('finds every clip at any depth, without deduplicating', () => {
			const corpus = { a: [{ url: 'x/one.ogg' }], b: { nested: { url: 'x/one.ogg' } }, c: 'x/two.ogg' };

			expect(audioPathsIn(corpus).sort()).toEqual(['x/one.ogg', 'x/one.ogg', 'x/two.ogg']);
		});

		it('ignores the internal storage path of a file asset, which is not what gets served', () => {
			const asset = { _type: 'sanity.fileAsset', path: 'files/onoff/x.ogg', url: 'assets/audio/mocks/x.ogg' };

			expect(audioPathsIn(asset)).toEqual(['assets/audio/mocks/x.ogg']);
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

	it.each([
		['el dataset de documentos', onoffDatasetMock],
		['el corpus crudo de obras', onoffRawLiteraryWorksMock],
		['el corpus crudo de colecciones', onoffRawCollectionsMock],
		['los medios de dominio', onoffMediaMock],
		['las colecciones de dominio', onoffCollectionsMock],
	])('covers every audio path declared by %s', (_source, corpus) => {
		const paths = [...new Set(audioPathsIn(corpus))];

		expect(paths.length).toBeGreaterThan(0);
		expect(paths.filter((path) => !isDeclaredAudioPath(path))).toEqual([]);
	});
});
