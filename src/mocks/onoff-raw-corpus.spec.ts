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

	// Ninguna fixture que embeba obras escribe sus campos: la colección referencia el teaser generado, y
	// la landing y el contenido rotativo lo estrechan con `landingLiteraryWorkFrom`, porque proyectan la
	// obra sin su extracto. El discriminante es `sectionCount`, que solo aparece en esa proyección.
	it('derives the embedded literary works instead of writing them out', async () => {
		const fixtures = await generatedFixturesIn('collection', 'landing-page');

		expect(fixtures).not.toHaveLength(0);
		fixtures.forEach(({ file, source }) => {
			expect(source, file).not.toContain('sectionCount:');
		});
	});

	// Cada derivación que el generador declara tiene que haberse aplicado. La coincidencia es por valor,
	// así que una proyección que se aparta no rompe nada: deja de coincidir y el objeto vuelve a escribirse
	// entero. Estos casos son la única señal de que eso pasó.
	it.each([
		['literary-work', 'literaryWorkTeaserFrom'],
		['collection', 'collectionTeaserFrom'],
		['landing-page', 'landingLiteraryWorkFrom'],
	])('derives every generated fixture of %s with %s', async (directory, derivation) => {
		const fixtures = (await generatedFixturesIn(directory)).filter(({ source }) => source.includes('derive-raw'));

		expect(fixtures).not.toHaveLength(0);
		fixtures.forEach(({ file, source }) => expect(source, file).toContain(`${derivation}(`));
	});
});
