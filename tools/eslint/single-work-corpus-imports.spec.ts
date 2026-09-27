import { spawn } from 'node:child_process';

// La restricción bajo test no es una regla propia: es `@typescript-eslint/no-restricted-imports`
// configurada en el bloque `no-single-work-corpus-imports` del flat config. `RuleTester` no puede
// ejercitar un flat config —solo una regla suelta—, así que se corre ESLint entero contra el
// `eslint.config.mjs` real, que es lo único que prueba que la restricción rige de verdad.
//
// Ese ESLint corre en un proceso aparte, no acá: el config no se puede cargar dentro de un worker de
// Vitest. El porqué, y el contrato del runner, están en `lint-fixtures.js`.
const RESTRICTION = '@typescript-eslint/no-restricted-imports';

const importFrom = (source: string) => `import { x } from '${source}';\nexport const y = x;\n`;

// Cero errores de la restricción no alcanza por sí solo: un archivo que ESLint no linteara daría cero
// igual. El enum es el testigo de que sí se lintea, porque lo prohíbe otra regla que acá no está
// exenta. Con los dos, el cero solo puede venir del `ignores`.
const WITNESS = 'enum Probe { A }\n';

const CASES = [
	// Las dos mitades del patrón: el alias y la forma relativa, que es por donde se colaría un archivo
	// que no usa `@mocks`.
	{
		id: 'alias-frontend',
		source: '@mocks/onoff/literary-work/geometria.literary-work.mock',
		filePath: 'src/app/probe.ts',
	},
	{
		id: 'alias-backend',
		source: '@mocks/onoff/collection/geometrias-del-desvelo.collection.raw.mock',
		filePath: 'src/api/probe.ts',
	},
	{
		id: 'relativo',
		source: '../../mocks/onoff/literary-work/geometria.literary-work.mock',
		filePath: 'src/app/pages/probe.ts',
	},
	// Los handles por identidad viven bajo `@mocks/onoff/<entidad>/`. Sin estos casos, lo único
	// verificado sería el glob genérico, y una reubicación a otra carpeta pasaría inadvertida.
	{
		id: 'handles-obras',
		source: '@mocks/onoff/literary-work/literary-work-teasers.mock',
		filePath: 'src/app/probe.ts',
	},
	{ id: 'handles-colecciones', source: '@mocks/onoff/collection/collections.mock', filePath: 'src/app/probe.ts' },
	{
		id: 'dentro-del-corpus',
		source: '@mocks/onoff/literary-work/literary-work-teasers.mock',
		filePath: 'src/mocks/probe.mock.ts',
		witness: true,
	},
	{ id: 'agregador-obras', source: '@mocks/onoff-literary-work-teasers.mock', filePath: 'src/app/probe.ts' },
	{ id: 'agregador-colecciones', source: '@mocks/onoff-collections.mock', filePath: 'src/app/probe.ts' },
];

type LintedCase = { id: string; messages: { ruleId: string | null; message: string }[] };

const messagesByCase = new Map<string, LintedCase['messages']>();

const restrictionErrors = (id: string) =>
	(messagesByCase.get(id) ?? []).filter((message) => message.ruleId === RESTRICTION);

function lintOutOfProcess(payload: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath, ['tools/eslint/lint-fixtures.js']);
		let stdout = '';
		let stderr = '';

		child.stdout.on('data', (chunk) => (stdout += chunk));
		child.stderr.on('data', (chunk) => (stderr += chunk));
		child.on('error', reject);
		child.on('close', (code) => (code === 0 ? resolve(stdout) : reject(new Error(stderr || `código ${code}`))));

		child.stdin.end(payload);
	});
}

// El proceso hijo paga la resolución del flat config y la carga perezosa del parser de TypeScript y
// de todos los plugins; se arranca una sola vez para toda la suite y por eso declara su propio plazo.
describe('la restricción de imports del corpus', () => {
	beforeAll(async () => {
		const cases = CASES.map(({ id, source, filePath, witness }) => ({
			id,
			filePath,
			code: witness ? `${importFrom(source)}${WITNESS}` : importFrom(source),
		}));

		const stdout = await lintOutOfProcess(JSON.stringify({ cases }));

		for (const { id, messages } of (JSON.parse(stdout) as { results: LintedCase[] }).results) {
			messagesByCase.set(id, messages);
		}
	}, 30_000);

	it.each([
		['por alias, desde el frontend', 'alias-frontend'],
		['por alias, desde el backend', 'alias-backend'],
		['por ruta relativa', 'relativo'],
	])('marca el import de una obra puntual %s', (_caso, id) => {
		expect(restrictionErrors(id)).toHaveLength(1);
	});

	it.each([
		['de obras', 'handles-obras'],
		['de colecciones', 'handles-colecciones'],
	])('marca el import del módulo de handles por identidad %s', (_caso, id) => {
		expect(restrictionErrors(id)).toHaveLength(1);
	});

	it('deja pasar el mismo import desde dentro del corpus', () => {
		const messages = messagesByCase.get('dentro-del-corpus') ?? [];

		expect(messages.map((message) => message.ruleId)).toContain('no-restricted-syntax');
		expect(restrictionErrors('dentro-del-corpus')).toHaveLength(0);
	});

	it.each([
		['de obras', 'agregador-obras'],
		['de colecciones', 'agregador-colecciones'],
	])('deja pasar el agregador %s desde el frontend', (_caso, id) => {
		expect(restrictionErrors(id)).toHaveLength(0);
	});
});
