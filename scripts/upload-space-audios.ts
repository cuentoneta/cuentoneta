/**
 * Sube los audios de los Spaces de X (archivos locales) como assets de Sanity y
 * popula el nuevo schema de `spaceRecording` (audioFile, hostName, hostAvatar, date)
 * en cada historia. Solo aditivo: deja intactos los campos obsoletos `postId`/`spaceUrl`.
 *
 * Completar las rutas locales y los datos de anfitrión en OPERATIONS antes de correr.
 * Patchea el documento PUBLICADO directamente (no crea borrador).
 *
 * Uso:
 *   pnpm exec tsx --env-file=.env scripts/upload-space-audios.ts
 *   (prueba sin escribir) DRY_RUN=1 pnpm exec tsx --env-file=.env scripts/upload-space-audios.ts
 */
import { createReadStream, existsSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { client } from '../src/api/_helpers/sanity-connector';

// Las rutas locales (audioPath/avatarPath) se resuelven relativas a esta carpeta (scripts/),
// salvo que sean absolutas. Coloca los audios en scripts/ o usa rutas absolutas.
const FILES_DIR = import.meta.dirname;

interface Operation {
	slug: string;
	audioPath: string; // ruta local al archivo de audio (mp4/m4a/mp3)
	hostName: string;
	date: string; // ISO 8601, p.ej. '2024-03-28T01:31:58.000Z'
	avatarPath?: string; // opcional: ruta local a la imagen del avatar
	avatarUrl?: string; // opcional: URL de la imagen del avatar (se descarga y sube)
}

// Avatar usado cuando una entrada no define avatarPath/avatarUrl propios. Útil cuando
// varios Spaces comparten el mismo host: se sube una sola vez (ver dedup más abajo).
// Puede ser una URL (se descarga) — dejar '' para no asignar avatar por defecto.
const DEFAULT_AVATAR_URL = 'https://pbs.twimg.com/profile_images/1968092947057905664/QM6BF2ua_400x400.jpg';

// Las 7 historias con un Space (serie "Desde el sótano de la casa de la calle Garay").
// Completar audioPath/hostName/date para cada una antes de ejecutar.
// Avatar (opcional): por entrada con `avatarUrl` (URL, se descarga) o `avatarPath` (archivo
// local), o globalmente con DEFAULT_AVATAR_URL. Se sube una sola vez aunque se repita.
const OPERATIONS: Operation[] = [
	{
		slug: 'la-casa-de-asterion',
		audioPath: 'la-casa-de-asterion.mp4',
		hostName: '@ladrondesabado',
		date: '2023-12-18',
	}, // Encuentro #1
	{ slug: 'el-fin-borges', audioPath: 'el-fin-borges.mp4', hostName: '@ladrondesabado', date: '2023-12-23' }, // Encuentro #2
	{
		slug: 'biografia-de-tadeo-isidoro-cruz',
		audioPath: 'biografia-de-tadeo-isidoro-cruz.m4a',
		hostName: '@ladrondesabado',
		date: '2023-12-26',
	}, // Encuentro #3
	{
		slug: 'tema-del-traidor-y-del-heroe',
		audioPath: 'tema-del-traidor-y-del-heroe.m4a',
		hostName: '@ladrondesabado',
		date: '2023-12-30',
	}, // Encuentro #4
	{
		slug: 'la-forma-de-la-espada',
		audioPath: 'la-forma-de-la-espada.m4a',
		hostName: '@ladrondesabado',
		date: '2024-01-09',
	}, // Encuentro #5
	{
		slug: 'tres-versiones-de-judas',
		audioPath: 'tres-versiones-de-judas.m4a',
		hostName: '@ladrondesabado',
		date: '2024-03-27',
	}, // Encuentro #6
	{ slug: 'el-aleph', audioPath: 'el-aleph.m4a', hostName: '@ladrondesabado', date: '2024-11-26' }, // Encuentro #7
];

const DRY_RUN = process.env['DRY_RUN'] === '1';
// Con FORCE=1 se sobreescriben las entradas que ya tienen audioFile (por defecto se saltan).
const FORCE = process.env['FORCE'] === '1';

interface StoryDoc {
	_id: string;
	mediaSources?: Array<{ _key: string; _type: string; hasAudio?: boolean }>;
}

async function uploadAsset(kind: 'file' | 'image', path: string): Promise<string> {
	const fullPath = resolve(FILES_DIR, path);
	const asset = await client.assets.upload(kind, createReadStream(fullPath), { filename: basename(fullPath) });
	return asset._id;
}

async function uploadImageFromUrl(url: string): Promise<string> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`No se pudo descargar el avatar (${res.status}): ${url}`);
	const buffer = Buffer.from(await res.arrayBuffer());
	const filename = basename(new URL(url).pathname) || 'avatar';
	const asset = await client.assets.upload('image', buffer, { filename });
	return asset._id;
}

// Cache para subir el mismo avatar (por ruta o URL) una sola vez.
const avatarAssetCache = new Map<string, string>();

async function getCachedAsset(key: string, upload: () => Promise<string>): Promise<string> {
	const cached = avatarAssetCache.get(key);
	if (cached) return cached;
	const assetId = await upload();
	avatarAssetCache.set(key, assetId);
	return assetId;
}

async function resolveAvatarAssetId(op: Operation): Promise<string | null> {
	const { avatarPath } = op;
	if (avatarPath) {
		return getCachedAsset(avatarPath, () => uploadAsset('image', avatarPath));
	}
	const url = op.avatarUrl ?? DEFAULT_AVATAR_URL;
	if (url) {
		return getCachedAsset(url, () => uploadImageFromUrl(url));
	}
	return null;
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
			`*[_type == "story" && slug.current == $slug && !(_id in path("drafts.**"))][0]{ _id, mediaSources[]{ _key, _type, "hasAudio": defined(audioFile) } }`,
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

		if (space.hasAudio && !FORCE) {
			console.log(`- ${op.slug}: YA MIGRADO (tiene audioFile) — se omite (usa FORCE=1 para sobreescribir)`);
			skipped++;
			continue;
		}

		if (!existsSync(resolve(FILES_DIR, op.audioPath))) {
			console.log(`- ${op.slug}: FALTA archivo "${op.audioPath}" en scripts/ — se omite`);
			skipped++;
			continue;
		}

		if (DRY_RUN) {
			console.log(`- ${op.slug}: listo para subir "${op.audioPath}" → mediaSources[_key=="${space._key}"]`);
			continue;
		}

		const audioAssetId = await uploadAsset('file', op.audioPath);
		const avatarAssetId = await resolveAvatarAssetId(op);

		const prefix = `mediaSources[_key=="${space._key}"]`;
		const set: Record<string, unknown> = {
			[`${prefix}.audioFile`]: { _type: 'file', asset: { _type: 'reference', _ref: audioAssetId } },
			[`${prefix}.hostName`]: op.hostName,
			[`${prefix}.date`]: op.date,
		};
		if (avatarAssetId) {
			set[`${prefix}.hostAvatar`] = { _type: 'image', asset: { _type: 'reference', _ref: avatarAssetId } };
		}

		// Solo aditivo: NO se borran postId/spaceUrl para no romper la app vieja durante
		// la transición (siguen leyendo postId vía rettiwt hasta que se despliegue la app
		// nueva). Quedan como campos obsoletos inertes; se pueden limpiar luego del deploy.
		await client.patch(doc._id).set(set).commit();

		console.log(`✓ ${op.slug}: audio + datos cargados (audioAsset=${audioAssetId})`);
		done++;
	}

	console.log(`\nListo. Cargados: ${done} | Omitidos: ${skipped}`);
}

run().catch((err) => {
	console.error('\nLa migración falló:', err);
	process.exit(1);
});
