/**
 * Genera los clips de audio del corpus de Onoff: por cada entrada de `onoffAudioAssets`, lee un fragmento
 * de la prosa de su obra, lo sintetiza con el TTS de Windows (SAPI) y lo encodea a Vorbis con ffmpeg.
 *
 * Existe para que los `.ogg` versionados se puedan volver a producir, no para correr en CI: depende de
 * una voz SAPI en español y de ffmpeg en el `PATH`, y ninguna de las dos cosas hay en un runner de Linux.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';

import { MAX_CLIP_SECONDS, onoffAudioAssets } from '../../src/mocks/onoff-audio-assets.mock';
import { audioClips, excerptOptions } from './generate-onoff-audio.clips';
import { encodeArgs, selectExcerpt, synthesisScript } from './generate-onoff-audio.helpers';

const { values } = parseArgs({ options: { force: { type: 'boolean', default: false } } });

function fail(message: string): never {
	process.stderr.write(`${message}\n`);
	process.exit(1);
}

function run(command: string, args: readonly string[]): void {
	const result = spawnSync(command, args, { encoding: 'utf8' });
	if (result.error !== undefined) {
		fail(`No se pudo ejecutar ${command}: ${result.error.message}`);
	}
	if (result.status !== 0) {
		fail(`${command} falló con código ${result.status}:\n${result.stderr}`);
	}
}

if (process.platform !== 'win32') {
	fail('El generador depende del TTS de Windows (SAPI) y solo corre en Windows.');
}
if (spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' }).error !== undefined) {
	fail('No se encontró ffmpeg en el PATH.');
}

const workDirectory = mkdtempSync(join(tmpdir(), 'onoff-audio-'));

try {
	for (const clip of audioClips) {
		const destination = join(process.cwd(), 'src', onoffAudioAssets[clip.asset].path);
		if (existsSync(destination) && !values.force) {
			process.stdout.write(`· ${clip.asset}: ya existe, se conserva (--force lo regenera)\n`);
			continue;
		}

		const excerpt = selectExcerpt(readFileSync(join(process.cwd(), clip.source), 'utf8'), {
			...excerptOptions,
			skipSentences: clip.skipSentences,
		});
		if (excerpt === '') {
			fail(`${clip.source} no dejó ninguna oración propia para leer.`);
		}

		const textFile = join(workDirectory, `${clip.asset}.txt`);
		const wavFile = join(workDirectory, `${clip.asset}.wav`);
		const scriptFile = join(workDirectory, `${clip.asset}.ps1`);
		writeFileSync(textFile, excerpt, 'utf8');
		writeFileSync(scriptFile, synthesisScript({ textFile, wavFile }), 'utf8');

		run('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptFile]);
		mkdirSync(dirname(destination), { recursive: true });
		run('ffmpeg', encodeArgs({ wavFile, oggFile: destination, maxSeconds: MAX_CLIP_SECONDS }));

		process.stdout.write(`✓ ${clip.asset}: ${onoffAudioAssets[clip.asset].path}\n`);
	}
} finally {
	rmSync(workDirectory, { recursive: true, force: true });
}
