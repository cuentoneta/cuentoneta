import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';

import rule from './storybook-docs-refs.js';

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

// La regla resuelve el módulo de entrada por el nombre del archivo y lee el catálogo del árbol, así que
// los casos apuntan a una story real: `Divider` existe y su entrada declara `Componentes V3/Divider`.
const DIVIDER_STORY = 'src/app/components/divider/divider.component.stories.ts';

// `RuleTester.run` declara su propia suite con `describe`/`it`, así que se invoca al nivel superior del
// archivo: anidarlo dentro de un `it` es un error de Vitest.
ruleTester.run('storybook-docs-refs', rule, {
	valid: [
		// La prosa referencia por la entrada: el `kind-id` no aparece escrito en ningún lado.
		{
			filename: DIVIDER_STORY,
			code: 'const prose = `<p>Ver ${docsRef(dividerDocs)} y ${docsMention(tagDocs)}.</p>`;',
		},
		// Una palabra en prosa que casualmente está en PascalCase no coincide con ningún title.
		{
			filename: DIVIDER_STORY,
			code: 'const prose = `<p><strong>Playground</strong> y <strong>OnGray</strong>.</p>`;',
		},
		// El `title` del meta coincide con el de su entrada.
		{
			filename: DIVIDER_STORY,
			code: "const meta = { component: DividerComponent, title: 'Componentes V3/Divider' };",
		},
		// El `title` de los datos de una story no es una entrada del catálogo: no vive junto a `component`.
		{
			filename: DIVIDER_STORY,
			code: "export const Primary = { args: { title: 'Geometrías del desvelo' } };",
		},
		// Fuera de una story la regla no mira nada.
		{
			filename: 'src/app/components/divider/divider.component.ts',
			code: "const link = './?path=/docs/componentes-v3-divider--docs';",
		},
	],
	invalid: [
		{
			filename: DIVIDER_STORY,
			code: 'const prose = `<a href="./?path=/docs/componentes-v3-tag--docs" target="_top">Tag</a>`;',
			errors: [{ messageId: 'literalKindId' }],
		},
		{
			filename: DIVIDER_STORY,
			code: "const prose = '<p>El <strong>Divider</strong> separa.</p>';",
			errors: [{ messageId: 'literalMention', data: { name: 'Divider' } }],
		},
		{
			filename: DIVIDER_STORY,
			code: "const meta = { component: DividerComponent, title: 'Componentes V3/Separador' };",
			errors: [{ messageId: 'titleMismatch' }],
		},
		// Sin módulo de entrada no hay de dónde derivar el nombre ni el enlace de esta story.
		{
			filename: 'src/app/components/inexistente/inexistente.stories.ts',
			code: "const meta = { component: X, title: 'Componentes V3/Inexistente' };",
			errors: [{ messageId: 'missingEntry' }],
		},
	],
});
