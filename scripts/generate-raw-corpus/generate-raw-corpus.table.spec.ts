import { readdir } from 'node:fs/promises';
import { basename } from 'node:path';

import { collectDerivations, collectSubstitutions } from './generate-raw-corpus.table';

// Un `load` que devuelve el mismo módulo para cualquier ruta: lo que se ejercita es qué exports enrola
// `collectSubstitutions`, no de qué archivo salen. Los directorios del corpus sí se recorren de verdad.
const moduleWithMixedExports = {
	palacioSecondSectionTitle: 'La novena frontera',
	palacioSecondSectionReadingTime: 1,
	palacioMultiSectionTotalReadingTime: 12,
	geometriaAudioDescription: 'Grabación casera, 1974.',
};

describe('collectSubstitutions', () => {
	// La regresión que ningún gate atrapa: el porqué está en `collectSubstitutions`, junto al filtro.
	it('leaves numeric exports out of the substitution table', async () => {
		const entries = await collectSubstitutions(async () => moduleWithMixedExports, 'src/mocks/onoff/literary-work');

		expect(entries.length).toBeGreaterThan(0);
		expect(entries.filter((entry) => typeof entry.value === 'number')).toEqual([]);
	});

	it('still enrolls the text exports of those same modules', async () => {
		const entries = await collectSubstitutions(async () => moduleWithMixedExports, 'src/mocks/onoff/literary-work');

		expect(entries.map((entry) => entry.substitution.binding)).toContain('palacioSecondSectionTitle');
	});
});

describe('collectDerivations', () => {
	const literaryWorkDirectory = 'src/mocks/onoff/literary-work';

	// Cada fixture expone su slug bajo un binding que lo nombra, para poder afirmar qué archivo originó
	// cada derivación sin cargar el corpus real.
	function bindingFor(path: string): string {
		return `raw_${basename(path, '.ts').replace(/[.-]/g, '_')}`;
	}

	async function stubLoad(path: string): Promise<unknown> {
		if (path.endsWith('derive-raw.ts')) {
			return { literaryWorkCatalogEntryFrom: ({ slug }: { slug: string }) => ({ slug }) };
		}
		return { [bindingFor(path)]: { slug: path } };
	}

	it('derives the catalog entries fixture from every full literary work raw, leaving the teasers out', async () => {
		const fullRaws = (await readdir(literaryWorkDirectory)).filter((file) =>
			file.endsWith('.literary-work.raw.mock.ts'),
		);

		const derivations = await collectDerivations(
			stubLoad,
			`${literaryWorkDirectory}/literary-work-catalog-entries.raw.mock.ts`,
		);

		expect(fullRaws).not.toHaveLength(0);
		expect(derivations.map(({ expression }) => expression).sort()).toEqual(
			fullRaws.map((file) => `literaryWorkCatalogEntryFrom(${bindingFor(`${literaryWorkDirectory}/${file}`)})`).sort(),
		);
	});
});
