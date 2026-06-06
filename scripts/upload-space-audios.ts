/**
 * Sube los audios de los Spaces de X (archivos locales) como assets de Sanity y
 * popula el nuevo schema de `spaceRecording` (audioFile, hostName, hostAvatar, date)
 * en cada historia, quitando los campos obsoletos `postId`/`spaceUrl`.
 *
 * Completar las rutas locales y los datos de anfitrión en OPERATIONS antes de correr.
 * Patchea el documento PUBLICADO directamente (no crea borrador).
 *
 * Uso:
 *   pnpm exec tsx --env-file=.env scripts/upload-space-audios.ts
 *   (prueba sin escribir) DRY_RUN=1 pnpm exec tsx --env-file=.env scripts/upload-space-audios.ts
 */
import { createReadStream } from 'node:fs';
import { basename } from 'node:path';
import { client } from '../src/api/_helpers/sanity-connector';

interface Operation {
	slug: string;
	audioPath: string; // ruta local al archivo de audio (mp4/m4a/mp3)
	hostName: string;
	date: string; // ISO 8601, p.ej. '2024-03-28T01:31:58.000Z'
	avatarPath?: string; // opcional: ruta local a la imagen del avatar
}

// Las 7 historias con un Space (serie "Desde el sótano de la casa de la calle Garay").
// Completar audioPath/hostName/date (y avatarPath opcional) para cada una antes de ejecutar.
const OPERATIONS: Operation[] = [
	{ slug: 'la-casa-de-asterion', audioPath: '', hostName: '', date: '' }, // Encuentro #1
	{ slug: 'el-fin-borges', audioPath: '', hostName: '', date: '' }, // Encuentro #2
	{ slug: 'biografia-de-tadeo-isidoro-cruz', audioPath: '', hostName: '', date: '' }, // Encuentro #3
	{ slug: 'tema-del-traidor-y-del-heroe', audioPath: '', hostName: '', date: '' }, // Encuentro #4
	{ slug: 'la-forma-de-la-espada', audioPath: '', hostName: '', date: '' }, // Encuentro #5
	{ slug: 'tres-versiones-de-judas', audioPath: '', hostName: '', date: '' }, // Encuentro #6
	{ slug: 'el-aleph', audioPath: '', hostName: '', date: '' }, // Encuentro #7
];

const DRY_RUN = process.env['DRY_RUN'] === '1';

interface StoryDoc {
	_id: string;
	mediaSources?: Array<{ _key: string; _type: string }>;
}

async function uploadAsset(kind: 'file' | 'image', path: string): Promise<string> {
	const asset = await client.assets.upload(kind, createReadStream(path), { filename: basename(path) });
	return asset._id;
}

async function run() {
	console.log('='.repeat(60));
	console.log(`Migración de audios de Spaces${DRY_RUN ? ' (DRY RUN)' : ''}`);
	console.log('='.repeat(60));

	let done = 0;
	let skipped = 0;
	for (const op of OPERATIONS) {
		if (!op.audioPath || !op.hostName || !op.date) {
			console.log(`- ${op.slug}: OMITIDO (faltan audioPath/hostName/date)`);
			skipped++;
			continue;
		}

		const doc = await client.fetch<StoryDoc | null>(
			`*[_type == "story" && slug.current == $slug && !(_id in path("drafts.**"))][0]{ _id, mediaSources[]{ _key, _type } }`,
			{ slug: op.slug },
		);
		if (!doc) {
			console.log(`- ${op.slug}: NO ENCONTRADO`);
			skipped++;
			continue;
		}
		const space = (doc.mediaSources ?? []).find((m) => m._type === 'spaceRecording');
		if (!space) {
			console.log(`- ${op.slug}: sin mediaSource spaceRecording`);
			skipped++;
			continue;
		}

		if (DRY_RUN) {
			console.log(`- ${op.slug}: listo para subir "${op.audioPath}" → mediaSources[_key=="${space._key}"]`);
			continue;
		}

		const audioAssetId = await uploadAsset('file', op.audioPath);
		const avatarAssetId = op.avatarPath ? await uploadAsset('image', op.avatarPath) : null;

		const prefix = `mediaSources[_key=="${space._key}"]`;
		const set: Record<string, unknown> = {
			[`${prefix}.audioFile`]: { _type: 'file', asset: { _type: 'reference', _ref: audioAssetId } },
			[`${prefix}.hostName`]: op.hostName,
			[`${prefix}.date`]: op.date,
		};
		if (avatarAssetId) {
			set[`${prefix}.hostAvatar`] = { _type: 'image', asset: { _type: 'reference', _ref: avatarAssetId } };
		}

		await client
			.patch(doc._id)
			.set(set)
			.unset([`${prefix}.postId`, `${prefix}.spaceUrl`])
			.commit();

		console.log(`✓ ${op.slug}: audio + datos cargados (audioAsset=${audioAssetId})`);
		done++;
	}

	console.log(`\nListo. Cargados: ${done} | Omitidos: ${skipped}`);
}

run().catch((err) => {
	console.error('\nLa migración falló:', err);
	process.exit(1);
});
