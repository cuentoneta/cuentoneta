// @vitest-environment node
import { ESLint } from 'eslint';

// Lo que se verifica acá no es la regla —es de un tercero y trae sus propios tests— sino que el flat
// config del repo la tenga activa. Un `RuleTester` sobre la regla suelta no distingue ese caso: daría
// verde con el bloque borrado de `eslint.config.mjs`. De ahí que corra ESLint entero contra el config
// real, resuelto desde el `cwd` del proceso de Vitest (la raíz del repo): una ruta absoluta ataría el
// spec a la máquina donde se escribió.
//
// La verificación importa más que en una regla cualquiera porque la deuda preexistente es de un solo
// caso: con el árbol limpio, un `files` mal escrito o un bloque perdido en un merge dejan el gate en
// verde, indistinguible de la regla haciendo su trabajo.
const eslint = new ESLint();

const RULE = 'unicorn/prefer-smaller-scope';

// El ejemplo que la documentación de la regla marca como incorrecto. El sumidero reemplaza al
// `console.log` del original, que el repo prohíbe.
const DECLARATIONS = 'declare const condition: boolean;\ndeclare function getValue(): string;\n';
const SINK = 'declare function sink(value: string): void;\n';
const TOO_WIDE = `${DECLARATIONS}${SINK}export function run() {\n\tlet value;\n\twhile (condition) {\n\t\tvalue = getValue();\n\t\tsink(value);\n\t}\n}\n`;
const NARROW = `${DECLARATIONS}${SINK}export function run() {\n\twhile (condition) {\n\t\tconst value = getValue();\n\t\tsink(value);\n\t}\n}\n`;

// Una ruta fuera de `src/**` evita el `projectService` del bloque `typed-linting`: un archivo virtual
// no pertenece a ningún programa de TypeScript, y las reglas tipadas fallarían al resolverlo.
const PROBE_PATH = 'scripts/probe.ts';

// El primer `lintText` del proceso paga la resolución del flat config y la carga perezosa del parser
// de TypeScript y de todos los plugins; los siguientes cuestan órdenes de magnitud menos. El costo es
// del proceso y no del caso que vaya primero, así que el timeout se declara para la suite entera: con
// los specs repartidos en paralelo y coverage encendido, el default de Vitest no alcanza.
describe('la regla prefer-smaller-scope en el flat config', { timeout: 20_000 }, () => {
	// Cada raíz que recibe el target `eslint:lint`, más las dos extensiones que un glob `**/*.ts` no
	// matchearía: el `.tsx` del Studio y los `.js` de las reglas propias.
	it.each([
		['el frontend', 'src/app/probe.ts'],
		['los e2e', 'e2e/probe.spec.ts'],
		['el Studio', 'cms/probe.tsx'],
		['los scripts', 'scripts/probe.ts'],
		['las reglas propias', 'tools/eslint/probe.js'],
	])('rige en %s', async (_caso, filePath) => {
		const config = await eslint.calculateConfigForFile(filePath);

		// `calculateConfigForFile` normaliza la severidad a su forma numérica.
		expect(config.rules?.[RULE]).toEqual([2]);
	});

	// El issue adopta el plugin por esta regla sola: su config `recommended` no está evaluado. Afirmarlo
	// sobre el config resuelto es lo que vuelve verificable ese límite — y no depende de qué otra regla
	// del plugin se elija como testigo, que es lo que haría vacua la alternativa de lintear un snippet.
	it('no arrastra ninguna otra regla del plugin', async () => {
		const config = await eslint.calculateConfigForFile(PROBE_PATH);
		// `calculateConfigForFile` devuelve el config resuelto sin tipar sus entradas de reglas.
		const rules = (config.rules ?? {}) as Record<string, [number, ...unknown[]]>;
		const enabled = Object.entries(rules)
			.filter(([ruleId, [severity]]) => ruleId.startsWith('unicorn/') && severity !== 0)
			.map(([ruleId]) => ruleId);

		expect(enabled).toEqual([RULE]);
	});

	it('marca la declaración que puede vivir en el bloque que la usa', async () => {
		const [result] = await eslint.lintText(TOO_WIDE, { filePath: PROBE_PATH, warnIgnored: false });

		expect(result.messages.filter((message) => message.ruleId === RULE)).toHaveLength(1);
	});

	it('deja pasar la misma función con la declaración ya adentro del bloque', async () => {
		// Cero mensajes de la regla no alcanza por sí solo: un archivo que ESLint no linteara daría cero
		// igual. El enum es el testigo de que sí se lintea, porque lo prohíbe otra regla vigente en esta
		// ruta. Con los dos, el cero solo puede venir de la regla bajo test.
		const code = `${NARROW}enum Probe {\n\tA,\n}\n`;

		const [result] = await eslint.lintText(code, { filePath: PROBE_PATH, warnIgnored: false });

		expect(result.messages.map((message) => message.ruleId)).toContain('no-restricted-syntax');
		expect(result.messages.filter((message) => message.ruleId === RULE)).toHaveLength(0);
	});
});
