// @vitest-environment node
import stylelint from 'stylelint';

const TOOLTIP_FILE = 'src/app/directives/tooltip.directive.css';

const config = {
	plugins: ['./tools/stylelint/z-index-scale.js'],
	rules: {
		'cuentoneta/z-index-scale': [true, { allowGlobalLayersIn: [TOOLTIP_FILE] }],
	},
	// El config no extiende los presets del repo a propósito: con esta regla como única activa, todo
	// warning que llegue es suyo, y contarlos alcanza para afirmar.
	// REASON: la forma de un config de Stylelint no vale tiparla acá; el spec solo lo pasa como dato.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

async function warningsFor(code: string, codeFilename = 'src/app/components/probe/probe.component.css') {
	const result = await stylelint.lint({ code, codeFilename, config: { ...config, rules: { ...config.rules } } });
	return result.results[0].warnings;
}

describe('cuentoneta/z-index-scale', () => {
	describe('declaraciones z-index', () => {
		it('accepts a reference to a layer of the scale', async () => {
			expect(await warningsFor('.a { z-index: var(--z-index-content); }')).toHaveLength(0);
		});

		it('accepts the CSS-wide keywords', async () => {
			expect(await warningsFor('.a { z-index: auto; }')).toHaveLength(0);
		});

		it('rejects a raw number', async () => {
			const warnings = await warningsFor('.a { z-index: 2; }');
			expect(warnings).toHaveLength(1);
			expect(warnings[0].rule).toBe('cuentoneta/z-index-scale');
		});

		it('rejects a reference to a token outside the scale', async () => {
			expect(await warningsFor('.a { z-index: var(--z-index-nope); }')).toHaveLength(1);
		});
	});

	describe('utilidades en @apply', () => {
		it('accepts a layer of the scale', async () => {
			expect(await warningsFor('.a { @apply absolute z-content; }')).toHaveLength(0);
		});

		it('accepts the native z-auto', async () => {
			expect(await warningsFor('.a { @apply z-auto; }')).toHaveLength(0);
		});

		it('rejects a raw number', async () => {
			expect(await warningsFor('.a { @apply absolute z-50 box-border; }')).toHaveLength(1);
		});

		it('rejects a layer name that does not exist', async () => {
			expect(await warningsFor('.a { @apply z-nvv; }')).toHaveLength(1);
		});

		// La franja alta está reservada: la capa global se admite solo en el archivo que la declara.
		it('rejects a global layer outside the files that declare one', async () => {
			expect(await warningsFor('.a { @apply z-floating; }')).toHaveLength(1);
		});

		it('accepts a global layer in the file that declares it', async () => {
			expect(await warningsFor('.a { @apply z-floating; }', TOOLTIP_FILE)).toHaveLength(0);
		});
	});
});
