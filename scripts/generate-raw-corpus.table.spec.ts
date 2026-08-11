import { collectSubstitutions } from './generate-raw-corpus.table';

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
