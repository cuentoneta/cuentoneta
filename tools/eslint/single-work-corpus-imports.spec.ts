import { ESLint } from 'eslint';

// La restricción bajo test no es una regla propia: es `@typescript-eslint/no-restricted-imports`
// configurada en el bloque `no-single-work-corpus-imports` del flat config. `RuleTester` no puede
// ejercitar un flat config —solo una regla suelta—, así que se corre ESLint entero contra el
// `eslint.config.mjs` real, que es lo único que prueba que la restricción rige de verdad.
//
// El config se resuelve desde el `cwd` del proceso de Vitest (la raíz del repo): pasar una ruta
// absoluta ataría el caso a la máquina donde se escribió.
const eslint = new ESLint({
	// `projectService` está activo para `src/**`, y un archivo virtual no pertenece a ningún programa.
	// Se apaga junto con las dos reglas tipadas que dependen de él; la restricción bajo test no lo usa.
	overrideConfig: {
		languageOptions: { parserOptions: { projectService: false, project: null } },
		rules: { '@angular-eslint/no-uncalled-signals': 'off', '@typescript-eslint/prefer-readonly': 'off' },
	},
});

const RESTRICTION = '@typescript-eslint/no-restricted-imports';

async function restrictionErrors(code: string, filePath: string): Promise<string[]> {
	const [result] = await eslint.lintText(code, { filePath, warnIgnored: false });
	return result.messages.filter((message) => message.ruleId === RESTRICTION).map((message) => message.message);
}

const importFrom = (source: string) => `import { x } from '${source}';\nexport const y = x;\n`;

describe('la restricción de imports del corpus', () => {
	// Las dos mitades del patrón: el alias y la forma relativa, que es por donde se colaría un archivo
	// que no usa `@mocks`.
	it.each([
		['por alias, desde el frontend', '@mocks/onoff/literary-work/geometria.literary-work.mock', 'src/app/probe.ts'],
		[
			'por alias, desde el backend',
			'@mocks/onoff/collection/geometrias-del-desvelo.collection.mock',
			'src/api/probe.ts',
		],
		['por ruta relativa', '../../mocks/onoff/literary-work/geometria.literary-work.mock', 'src/app/pages/probe.ts'],
	])('marca el import de una obra puntual %s', async (_caso, source, filePath) => {
		expect(await restrictionErrors(importFrom(source), filePath)).toHaveLength(1);
	});

	// Los handles por identidad viven acá desde que dejaron de exportarse por los agregadores. Sin este
	// caso, lo único verificado sería el glob genérico, y una reubicación a otra carpeta pasaría inadvertida.
	it.each([
		['de obras', '@mocks/onoff/literary-work/literary-work-teasers.mock'],
		['de colecciones', '@mocks/onoff/collection/collections.mock'],
	])('marca el import del módulo de handles por identidad %s', async (_caso, source) => {
		expect(await restrictionErrors(importFrom(source), 'src/app/probe.ts')).toHaveLength(1);
	});

	it('deja pasar el mismo import desde dentro del corpus', async () => {
		const source = '@mocks/onoff/literary-work/literary-work-teasers.mock';

		expect(await restrictionErrors(importFrom(source), 'src/mocks/probe.mock.ts')).toHaveLength(0);
	});

	it.each([
		['de obras', '@mocks/onoff-literary-work-teasers.mock'],
		['de colecciones', '@mocks/onoff-collections.mock'],
	])('deja pasar el agregador %s desde el frontend', async (_caso, source) => {
		expect(await restrictionErrors(importFrom(source), 'src/app/probe.ts')).toHaveLength(0);
	});
});
