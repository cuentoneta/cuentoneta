// @vitest-environment node
import stylelint from 'stylelint';
import type { Config } from 'stylelint';

// El config no extiende los presets del repo a propósito: con esta regla como única activa, todo
// warning que llegue es suyo, y contarlos alcanza para afirmar.
const config = {
	plugins: ['./tools/stylelint/no-apply-in-host.js'],
	rules: {
		'cuentoneta/no-apply-in-host': true,
	},
} satisfies Config;

async function warningsFor(code: string, codeFilename = 'src/app/components/probe/probe.component.css') {
	const result = await stylelint.lint({ code, codeFilename, config });
	return result.results[0].warnings;
}

describe('cuentoneta/no-apply-in-host', () => {
	it('marca el @apply cuyo padre directo es un :host pelado', async () => {
		expect(await warningsFor(':host { @apply flex; }')).toHaveLength(1);
	});

	// El selector agrupado cuenta como `:host` pelado si alguna de sus partes lo es.
	it('marca el :host dentro de un selector agrupado', async () => {
		expect(await warningsFor(':host, .otro { @apply flex; }')).toHaveLength(1);
	});

	// Las tres formas que la regla excluye a propósito. Sin estos casos, ampliar el
	// matcheo del selector dejaría de ser una decisión visible.
	it('deja pasar :host ::ng-deep', async () => {
		expect(await warningsFor(':host ::ng-deep { @apply flex; }')).toHaveLength(0);
	});

	it('deja pasar :host con clase', async () => {
		expect(await warningsFor(':host(.abierto) { @apply flex; }')).toHaveLength(0);
	});

	it('deja pasar el @apply anidado en un selector hijo', async () => {
		expect(await warningsFor(':host { .child { @apply flex; } }')).toHaveLength(0);
	});

	it('deja pasar el @apply fuera de :host', async () => {
		expect(await warningsFor('.child { @apply flex; }')).toHaveLength(0);
	});
});
