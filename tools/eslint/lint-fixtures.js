import { ESLint } from 'eslint';

/**
 * Lintea fragmentos de código contra el `eslint.config.mjs` real y devuelve sus mensajes.
 *
 * Existe como proceso aparte porque el config no se puede cargar dentro de un worker de Vitest: el
 * pool que fija `@analogjs/vite-plugin-angular` corre cada spec en un contexto de `vm`, y un módulo
 * JSON importado con `with { type: 'json' }` no enlaza entre ese contexto y el grafo nativo. La
 * cadena de `eslint-plugin-unicorn` usa esa forma en todos sus caminos, así que cualquier spec que
 * instancie ESLint contra el config real muere al resolverlo.
 *
 * Contrato: lee `{ cases: [{ id, code, filePath }] }` de stdin y escribe
 * `{ results: [{ id, messages: [{ ruleId, message }] }] }` en stdout. Va por stdin y no por argv
 * para no depender del límite de longitud de la línea de comandos.
 */

async function readStdin() {
	const chunks = [];

	for await (const chunk of process.stdin) {
		chunks.push(chunk);
	}

	return Buffer.concat(chunks).toString('utf8');
}

const eslint = new ESLint({
	// `projectService` está activo para `src/**`, y un archivo virtual no pertenece a ningún programa.
	// Se apaga junto con las dos reglas tipadas que dependen de él.
	overrideConfig: {
		languageOptions: { parserOptions: { projectService: false, project: null } },
		rules: { '@angular-eslint/no-uncalled-signals': 'off', '@typescript-eslint/prefer-readonly': 'off' },
	},
});

const { cases } = JSON.parse(await readStdin());
const results = [];

for (const { id, code, filePath } of cases) {
	const [result] = await eslint.lintText(code, { filePath, warnIgnored: false });

	results.push({
		id,
		messages: result.messages.map(({ ruleId, message }) => ({ ruleId, message })),
	});
}

process.stdout.write(JSON.stringify({ results }));
