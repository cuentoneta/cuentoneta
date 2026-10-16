import { readdirSync } from 'node:fs';
import path from 'node:path';

import type { AsyncIterableMigration, MigrationContext } from 'sanity/migrate';
import { describe, expect, it } from 'vitest';

import { COUNTRY_BY_FLAG } from './countries';
import migration, { findMissingNationalities, pngAssetId } from './index';

interface CreatedNationality {
	_id: string;
	_type: string;
	country: string;
	flag: { asset: { _ref: string } };
}

const dryRunContext = { dryRun: true } as MigrationContext;

type Documents = Parameters<AsyncIterableMigration>[0];

const nationality = (_id: string, country: string) => ({ _id, _type: 'nationality', country });

const runDry = async (existing: ReturnType<typeof nationality>[]) => {
	const documents = async function* () {
		yield* existing;
	} as unknown as Documents;
	const created: CreatedNationality[] = [];
	for await (const mutation of (migration.migrate as AsyncIterableMigration)(documents, dryRunContext)) {
		created.push((mutation as { document: CreatedNationality }).document);
	}
	return created;
};

const flagFiles = readdirSync(path.resolve(__dirname, '../../../public/flags'))
	.filter((file) => file.endsWith('.png'))
	.map((file) => file.slice(0, -'.png'.length));

describe('create-missing-nationalities', () => {
	it('tiene un nombre de país, sin repetir, para cada bandera de public/flags', () => {
		const countries = flagFiles.map((flag) => COUNTRY_BY_FLAG[flag]);

		expect(countries.every((country) => typeof country === 'string')).toBe(true);
		expect(new Set(countries).size).toBe(countries.length);
	});

	it('crea una nacionalidad publicada por bandera, con su id derivado y la referencia a su imagen', async () => {
		const created = await runDry([]);

		expect(created).toHaveLength(flagFiles.length);
		expect(created).toContainEqual({
			_id: 'nationality-hn',
			_type: 'nationality',
			country: 'Honduras',
			flag: {
				_type: 'image',
				asset: { _type: 'reference', _ref: expect.stringMatching(/^image-[\da-f]{40}-\d+x\d+-png$/) },
			},
		});
	});

	it('omite los países que ya tienen documento, publicado o borrador, sin distinguir mayúsculas', async () => {
		const created = await runDry([
			nationality('110a23ed', 'Argentina'),
			nationality('drafts.ca7fb173', 'Honduras'),
			nationality('5ae8f8cb', ' inglaterra '),
		]);

		const countries = created.map(({ country }) => country);

		for (const present of ['Argentina', 'Honduras', 'Inglaterra']) {
			expect(countries).not.toContain(present);
		}
		expect(created).toHaveLength(flagFiles.length - 3);
	});

	// Una segunda corrida encuentra los países creados por la primera y no emite nada.
	it('es idempotente', async () => {
		const created = await runDry([]);

		expect(await runDry(created.map(({ _id, country }) => nationality(_id, country)))).toEqual([]);
	});

	it('aborta sin crear nada si una bandera no tiene nombre de país', () => {
		expect(() => findMissingNationalities(['ar', 'zz', 'xx-yy'], [])).toThrow(/zz, xx-yy/);
	});

	it('deriva el id de la imagen del contenido y de las dimensiones del PNG', () => {
		const png = Buffer.alloc(24);
		png.writeUInt32BE(640, 16);
		png.writeUInt32BE(480, 20);

		expect(pngAssetId(png)).toMatch(/^image-[\da-f]{40}-640x480-png$/);
	});
});
