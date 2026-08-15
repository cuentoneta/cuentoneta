// @vitest-environment node
// Bajo `happy-dom`, la condición de exportación de Tailwind resuelve a su build de navegador, que no
// expone el compilador.
import { readFileSync } from 'node:fs';
import { compile } from 'tailwindcss';

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

	// Que la escala genere utilidades es un detalle de implementación de Tailwind, no un contrato: la
	// namespace `--z-index-*` la reconoce la versión instalada, y un bump que la renombrara dejaría a cada
	// capa sin emitir CSS **sin romper el build**. Además, Tailwind descarta del CSS emitido los tokens del
	// tema que ninguna utilidad usa, así que una capa consumida solo por `var()` desde una hoja de
	// componente desaparecería sola. Compilar el tema real es lo único que ve las dos cosas.
	describe('compilación del tema', () => {
		async function compiledCss() {
			const compiler = await compile(readFileSync('src/tailwind.css', 'utf-8'), {
				base: process.cwd(),
				loadStylesheet: async (id: string) => {
					const path = id === 'tailwindcss' ? 'node_modules/tailwindcss/index.css' : id;
					return { path, base: 'node_modules/tailwindcss', content: readFileSync(path, 'utf-8') };
				},
			});
			return compiler.build(scaleTokens().map((token: string) => `z-${token}`));
		}

		it('emits a utility and its variable for every layer of the scale', async () => {
			const css = await compiledCss();
			for (const token of scaleTokens()) {
				expect(css, `la capa "${token}" no emite su utilidad`).toContain(`.z-${token}`);
				expect(css, `la capa "${token}" no emite su variable`).toContain(`--z-index-${token}:`);
			}
		});

		// El valor emitido es el que ordena de verdad: si el token cambiara de número sin que nadie lo note,
		// la escala seguiría compilando y el orden entre capas dejaría de ser el declarado.
		it('emits each variable with the value the scale declares', async () => {
			const css = await compiledCss();
			for (const [token, value] of zIndexScale()) {
				expect(css).toContain(`--z-index-${token}: ${value};`);
			}
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
