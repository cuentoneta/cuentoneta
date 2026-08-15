// REASON: el helper es un `.js` sin tipos propios; el spec solo necesita sus exports.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import {
	globalTokens,
	isAllowedDeclarationValue,
	isAllowedUtility,
	scaleTokens,
	zIndexScale,
} from './z-index-scale.js';

// Afirma contra el `src/tailwind.css` real, no contra un fixture: el valor de este spec es avisar cuando
// alguien borre, renombre o renumere un token del tema, que es la forma en que la escala dejaría de ser
// la fuente única sin que nada lo note.
describe('escala de apilamiento del Design System', () => {
	it('declares the four layers of the scale', () => {
		expect(scaleTokens()).toEqual(['content', 'raised', 'nav', 'floating']);
	});

	it('names the global layers, which are used without isolating', () => {
		expect(globalTokens()).toEqual(['nav', 'floating']);
	});

	// El orden es la invariante que hace utilizable la escala: una capa interna que superara a una global
	// volvería a poner a un componente de página en condiciones de tapar la barra.
	it('keeps every internal layer below every global one, with a free band between them', () => {
		const scale = zIndexScale();
		const globals = globalTokens();
		const internals = scaleTokens().filter((token: string) => !globals.includes(token));

		const highestInternal = Math.max(...internals.map((token: string) => scale.get(token)));
		const lowestGlobal = Math.min(...globals.map((token: string) => scale.get(token)));

		expect(highestInternal).toBeLessThan(lowestGlobal);
		// Franja libre: deja lugar para una capa interna futura sin renumerar las globales.
		expect(lowestGlobal - highestInternal).toBeGreaterThan(1);
	});

	describe('utilidades', () => {
		it('accepts every token of the scale', () => {
			for (const token of scaleTokens()) {
				expect(isAllowedUtility(token)).toBe(true);
			}
		});

		// `z-auto` no necesita token: no eleva nada, y es la forma de volver al valor por defecto.
		it('accepts the native z-auto', () => {
			expect(isAllowedUtility('auto')).toBe(true);
		});

		it('rejects a raw number and a name outside the scale', () => {
			expect(isAllowedUtility('10')).toBe(false);
			expect(isAllowedUtility('50')).toBe(false);
			expect(isAllowedUtility('nvv')).toBe(false);
		});
	});

	describe('valores de una declaración z-index', () => {
		it('accepts a reference to a token of the scale', () => {
			expect(isAllowedDeclarationValue('var(--z-index-nav)')).toBe(true);
			expect(isAllowedDeclarationValue(' var( --z-index-content ) ')).toBe(true);
		});

		it('accepts the CSS-wide keywords', () => {
			expect(isAllowedDeclarationValue('auto')).toBe(true);
			expect(isAllowedDeclarationValue('inherit')).toBe(true);
		});

		it('rejects a raw number and a reference to a token outside the scale', () => {
			expect(isAllowedDeclarationValue('2')).toBe(false);
			expect(isAllowedDeclarationValue('9999')).toBe(false);
			expect(isAllowedDeclarationValue('var(--z-index-nope)')).toBe(false);
		});
	});
});
