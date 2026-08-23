import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';

// REASON: la regla es un `.js` sin tipos propios; el RuleTester solo necesita el módulo.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import rule from './declare-close-to-use.js';

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

// `RuleTester.run` declara su propia suite con `describe`/`it`, así que se invoca al
// nivel superior del archivo: anidarlo dentro de un `it` es un error de Vitest.
ruleTester.run('declare-close-to-use', rule, {
	valid: [
		// Ya vive junto a su único consumidor: nada a nivel de módulo.
		{ code: `function local() {\n\tconst pageSize = 10;\n\treturn pageSize;\n}\nlocal();`, filename: 'a.ts' },
		// Dos funciones la leen: es compartida dentro del archivo y se queda en el módulo.
		{
			code: `const scale = 2;\nfunction width() {\n\treturn 10 * scale;\n}\nfunction height() {\n\treturn 20 * scale;\n}\nwidth();\nheight();`,
			filename: 'a.ts',
		},
		// `export const` es API declarada compartible: el proxy de "compartido" evaluable en un solo archivo.
		{
			code: `export const PAGE_SIZE = 10;\nfunction total(count: number) {\n\treturn Math.ceil(count / PAGE_SIZE);\n}\ntotal(1);`,
			filename: 'a.ts',
		},
		// El patrón canónico de Storybook: la lectura de `meta` pasa por `export default`, que ocurre a nivel de módulo.
		{ code: `const meta = { title: 'X' };\nexport default meta;`, filename: 'a.stories.ts' },
		// Instancia construida: hoistearla evita reconstruirla por llamada.
		{
			code: `const pattern = new RegExp('^a$');\nfunction matches(value: string) {\n\treturn pattern.test(value);\n}\nmatches('a');`,
			filename: 'a.ts',
		},
		// Fábrica local: la construcción deliberada de un cache no se empuja hacia adentro.
		{
			code: `function buildEngine() {\n\treturn { start() {} };\n}\nconst engine = buildEngine();\nfunction drive() {\n\tengine.start();\n}\ndrive();`,
			filename: 'a.ts',
		},
		// Cadena fluida de construcción: un método de dominio sobre otra llamada configura
		// una instancia que mover reconstruiría por llamada.
		{
			code: `declare function unified(): { use(p: unknown): unknown };\ndeclare const remarkParse: unknown;\nconst pipeline = unified().use(remarkParse);\nfunction render(md: string) {\n\treturn pipeline;\n}\nrender('x');`,
			filename: 'a.ts',
		},
		// Método que muta su receptor: moverla re-mutaría el original en cada llamada.
		{
			code: `const segments = ['b', 'a'];\nconst ordered = segments.reverse();\nfunction first() {\n\treturn ordered[0];\n}\nfirst();`,
			filename: 'a.ts',
		},
		// Construcción envuelta en literal: misma exención que su equivalente desnudo.
		{
			code: `const patterns = Object.freeze({ slug: new RegExp('^[a-z]+$') });\nfunction matches(value: string) {\n\treturn patterns.slug.test(value);\n}\nmatches('a');`,
			filename: 'a.ts',
		},
		// Lecturas solo a nivel de módulo (una constante alimentando otra): moverlas rompería su consumo.
		{
			code: `const base = { limit: 2 };\nconst config = { ...base, extra: 1 };\nconsole.log(config.limit);`,
			filename: 'a.ts',
		},
		// Un `let` puede reasignarse: moverlo cambia la semántica.
		{
			code: `let counter = 0;\nfunction bump() {\n\tcounter += 1;\n}\nbump();`,
			filename: 'a.ts',
		},
		// Destructuring fuera de alcance en v1: el id no es renombrable como bloque.
		{
			code: `const config = { length: 2 };\nconst { length } = config;\nfunction measure() {\n\treturn length * 2;\n}\nmeasure();`,
			filename: 'a.ts',
		},
		// Inicialización async deliberada (top-level await en scripts).
		{
			code: `declare function loadConfig(): Promise<{ a: number }>;\nconst config = await loadConfig();\nfunction use() {\n\treturn config.a;\n}\nuse();`,
			filename: 'scripts/example.ts',
		},
		// Re-exportada por nombre: la referencia desde `export {}` también es una lectura a nivel de módulo.
		{
			code: `const threshold = 5;\nexport { threshold };\nfunction over(value: number) {\n\treturn value > threshold;\n}\nover(1);`,
			filename: 'a.ts',
		},
	],
	invalid: [
		{
			code: `const pageSize = 10;\nfunction fetchPage() {\n\treturn Array.from({ length: pageSize });\n}\nfetchPage();`,
			filename: 'a.ts',
			errors: [{ messageId: 'movable' }],
		},
		// Helper flecha llamado por una sola función: entra en la misma regla.
		{
			code: `const format = (value: number) => value.toFixed(2);\nfunction render() {\n\tconsole.log(format(1));\n}\nrender();`,
			filename: 'a.ts',
			errors: [{ messageId: 'movable' }],
		},
		// El grafo de referencias no mira casing: SCREAMING_SNAKE de consumidor único es local mal escrita.
		{
			code: `const MAX_RETRIES = 3;\nfunction attempt() {\n\treturn MAX_RETRIES > 0;\n}\nattempt();`,
			filename: 'a.ts',
			errors: [{ messageId: 'movable' }],
		},
		// Computación trivial con método nativo: sí se reporta, no es instancia cacheada.
		{
			code: `const isDryRun = process.argv.includes('--no-dry-run');\nfunction apply() {\n\tif (isDryRun) return;\n}\napply();`,
			filename: 'scripts/backfill.ts',
			errors: [{ messageId: 'movable' }],
		},
		// Cadena de transformación pura de la stdlib: deriva datos por llamada, no configura instancia.
		{
			code: `const slugsOverride = (process.env['SLUGS'] ?? '')\n\t.split(',')\n\t.map((path) => path.trim())\n\t.filter(Boolean);\nfunction run() {\n\treturn slugsOverride.length;\n}\nrun();`,
			filename: 'a.ts',
			errors: [{ messageId: 'movable' }],
		},
		// Llamada importada: no es fábrica local, es computación.
		{
			code: `import { parseRoutes } from './router';\nconst routes = parseRoutes(source);\nfunction resolve(path: string) {\n\treturn routes[path];\n}\nresolve('/');`,
			filename: 'a.ts',
			errors: [{ messageId: 'movable' }],
		},
		// Tabla congelada: los envoltorios no cambian la naturaleza del dato.
		{
			code: `const sizeMap = Object.freeze({ sm: 'h-4' } as const);\nfunction classFor(size: string) {\n\treturn sizeMap[size];\n}\nclassFor('sm');`,
			filename: 'a.ts',
			errors: [{ messageId: 'movable' }],
		},
		{
			code: `const limits = { min: 1 } satisfies Record<string, number>;\nfunction check(value: number) {\n\treturn value >= limits.min;\n}\ncheck(1);`,
			filename: 'a.ts',
			errors: [{ messageId: 'movable' }],
		},
		// Dos lecturas en callbacks anidados distintos bajo la misma función convergen en un solo dueño.
		{
			code: `const retries = 3;\nfunction handler() {\n\tqueueMicrotask(() => console.log(retries));\n\tel.addEventListener('done', () => console.log(retries));\n}\nhandler();`,
			filename: 'a.ts',
			errors: [{ messageId: 'movable' }],
		},
		// Llamada diferida dentro del cuerpo de una arrow: no corre al evaluar el literal, así que es dato movible.
		{
			code: `const api = { load: (id: string) => client.fetch(id) };\nfunction use() {\n\treturn api.load('1');\n}\nuse();`,
			filename: 'a.ts',
			errors: [{ messageId: 'movable' }],
		},
	],
});
