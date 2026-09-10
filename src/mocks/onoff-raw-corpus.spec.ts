/**
 * Lo que las fixtures generadas **no** tienen que escribir.
 *
 * El emisor sustituye por valor serializado: cuando una proyección se aparta de la que produjo el handle,
 * el objeto deja de coincidir y el literal vuelve a escribirse entero, sin que falle nada. El corpus se
 * infla de a un bloque por vez y nadie se entera hasta que alguien lee un diff de cientos de líneas.
 *
 * Estos casos son esa señal. No verifican que la sustitución sea correcta —de eso se ocupa el cruce contra
 * las queries reales—, sino que siga ocurriendo.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { rawOnoffAuthor } from './onoff-raw-author.mock';

const CORPUS_ROOT = 'src/mocks/onoff';

async function generatedFixturesIn(...directories: string[]): Promise<{ file: string; source: string }[]> {
	const files = await Promise.all(
		directories.map(async (directory) =>
			(await readdir(join(CORPUS_ROOT, directory)))
				.filter((file) => file.endsWith('.raw.mock.ts'))
				.map((file) => join(CORPUS_ROOT, directory, file)),
		),
	);

	return Promise.all(files.flat().map(async (file) => ({ file, source: await readFile(file, 'utf8') })));
}

describe('fixtures generadas del corpus', () => {
	it('references the author instead of writing it out', async () => {
		const fixtures = await generatedFixturesIn('literary-work', 'collection', 'landing-page');

		expect(fixtures).not.toHaveLength(0);
		fixtures.forEach(({ file, source }) => {
			expect(source, file).not.toContain(`name: '${rawOnoffAuthor.name}'`);
		});
	});

	// La obra que embebe una colección sale de la misma proyección que su teaser generado, así que la
	// fixture la referencia. El discriminante es `sectionCount`: lo proyecta el teaser de obra y nada más,
	// así que su presencia dice que hay una obra escrita entera, sin confundirse con un título que se
	// repita por otro motivo —una campaña de la landing lleva el de la obra que promociona—.
	//
	// La landing queda afuera a propósito: proyecta la obra **sin** `excerpt`, así que lo que escribe no
	// es el teaser y referenciarlo afirmaría que la query devuelve un campo que no devuelve.
	it('references the literary work teaser instead of embedding the work', async () => {
		const fixtures = await generatedFixturesIn('collection');

		expect(fixtures).not.toHaveLength(0);
		fixtures.forEach(({ file, source }) => {
			expect(source, file).not.toContain('sectionCount:');
		});
	});
});
