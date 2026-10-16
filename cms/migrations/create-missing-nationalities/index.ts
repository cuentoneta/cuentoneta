import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { createClient } from '@sanity/client';
import { type AsyncIterableMigration, createIfNotExists, defineMigration, type MigrationContext } from 'sanity/migrate';

import { COUNTRY_BY_FLAG } from './countries';

const FLAGS_DIRECTORY = path.resolve(__dirname, '../../../public/flags');

export interface MissingNationality {
	/** Nombre del archivo de la bandera sin extensión (`hn`, `gb-wls`). */
	flag: string;
	country: string;
}

const normalizeCountry = (country: string) => country.trim().toLocaleLowerCase('es');

/**
 * Las banderas de `flags` cuyo país no figura en `presentCountries`, comparando por nombre sin distinguir
 * mayúsculas: los documentos existentes tienen un `_id` arbitrario, así que el nombre es lo único que los
 * vincula con un archivo. Lanza, sin devolver nada, si alguna bandera no tiene nombre en `COUNTRY_BY_FLAG`:
 * crear el resto dejaría esa bandera sin documento sin que nada lo señale.
 */
export function findMissingNationalities(flags: string[], presentCountries: Iterable<string>): MissingNationality[] {
	const unresolved = flags.filter((flag) => !Object.hasOwn(COUNTRY_BY_FLAG, flag));
	if (unresolved.length > 0) {
		throw new Error(`Banderas sin nombre de país en countries.ts: ${unresolved.join(', ')}`);
	}
	const present = new Set(Array.from(presentCountries, normalizeCountry));
	return flags
		.map((flag) => ({ flag, country: COUNTRY_BY_FLAG[flag] }))
		.filter(({ country }) => !present.has(normalizeCountry(country)));
}

/**
 * El `_id` que Sanity le asigna a una imagen PNG al subirla: deriva del contenido y de las dimensiones, así
 * que permite emitir en un dry-run la misma referencia que tendrá la corrida real sin subir nada.
 */
export function pngAssetId(png: Buffer): string {
	const sha1 = createHash('sha1').update(png).digest('hex');
	// Ancho y alto encabezan el chunk IHDR, que el formato fija como el primero tras la firma.
	return `image-${sha1}-${png.readUInt32BE(16)}x${png.readUInt32BE(20)}-png`;
}

async function uploadFlag(flag: string, png: Buffer, context: MigrationContext): Promise<string> {
	if (context.dryRun) {
		return pngAssetId(png);
	}
	// El cliente de la migración no expone `assets`: se arma uno completo con su misma configuración.
	const client = createClient({ ...context.client.config(), useCdn: false });
	const asset = await client.assets.upload('image', png, { filename: `${flag}.png` });
	return asset._id;
}

const migrate: AsyncIterableMigration = async function* (documents, context) {
	const presentCountries: string[] = [];
	for await (const doc of documents()) {
		if (typeof doc['country'] === 'string') {
			presentCountries.push(doc['country']);
		}
	}
	const flags = readdirSync(FLAGS_DIRECTORY)
		.filter((file) => file.endsWith('.png'))
		.map((file) => file.slice(0, -'.png'.length));

	for (const { flag, country } of findMissingNationalities(flags, presentCountries)) {
		const assetId = await uploadFlag(flag, readFileSync(path.join(FLAGS_DIRECTORY, `${flag}.png`)), context);
		yield createIfNotExists({
			_id: `nationality-${flag}`,
			_type: 'nationality',
			country,
			flag: { _type: 'image', asset: { _type: 'reference', _ref: assetId } },
		});
	}
};

/**
 * Completa el catálogo de nacionalidades con un documento publicado por cada bandera de `public/flags/` cuyo
 * país todavía no tiene uno, para que dar de alta un autor no exija buscar y subir la bandera a mano.
 *
 * No hay documento de origen que recorrer: se recorren las nacionalidades existentes —publicadas y borradores—
 * solo para saber qué países omitir, y las creaciones se emiten aparte. El `_id` deriva del archivo
 * (`nationality-<flag>`), así que una reversión puede filtrar por ese prefijo. Es independiente del código.
 */
export default defineMigration({
	title: 'Crear las nacionalidades faltantes con las banderas de public/flags',
	documentTypes: ['nationality'],
	migrate,
});
