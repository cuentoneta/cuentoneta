import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { onoffAudioAssets } from '../../src/mocks/onoff-audio-assets.mock';
import { MAX_SECONDS, audioClips, excerptOptions } from './generate-onoff-audio.clips';
import { selectExcerpt } from './generate-onoff-audio.helpers';

describe('la tabla de producción de los clips', () => {
	// Un clip sin fila sería un archivo versionado que nadie puede volver a producir, que es justo lo que
	// el generador existe para evitar.
	it('tiene una fila por cada entrada de la tabla de assets', () => {
		expect(audioClips.map((clip) => clip.asset).sort()).toEqual(Object.keys(onoffAudioAssets).sort());
	});

	it.each(audioClips.map((clip) => [clip.asset, clip] as const))('lee "%s" de una obra que existe', (_key, clip) => {
		expect(existsSync(join(process.cwd(), clip.source))).toBe(true);
	});

	it.each(audioClips.map((clip) => [clip.asset, clip] as const))(
		'deja algo que leer para "%s" después de descartar lo ajeno',
		(_key, clip) => {
			const excerpt = selectExcerpt(readFileSync(join(process.cwd(), clip.source), 'utf8'), {
				...excerptOptions,
				skipSentences: clip.skipSentences,
			});

			expect(excerpt.length).toBeGreaterThan(0);
			expect(excerpt).not.toMatch(/["«»“”]/);
		},
	);

	// Dos clips que leyeran lo mismo dejarían al catálogo sin nada que distinguir entre los dos formatos.
	it('lee un fragmento distinto en cada clip', () => {
		const excerpts = audioClips.map((clip) =>
			selectExcerpt(readFileSync(join(process.cwd(), clip.source), 'utf8'), {
				...excerptOptions,
				skipSentences: clip.skipSentences,
			}),
		);

		expect(new Set(excerpts).size).toBe(excerpts.length);
	});

	it('acota el clip a lo que el corpus admite como fragmento', () => {
		expect(MAX_SECONDS).toBeLessThanOrEqual(25);
	});
});
