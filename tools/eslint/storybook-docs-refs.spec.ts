import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';

import rule from './storybook-docs-refs.js';

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

// La regla resuelve el módulo de entrada por el nombre del archivo y lee el catálogo y las clases Angular
// del árbol, así que los casos apuntan a símbolos reales: `Divider` es una entrada que declara
// `Componentes V3/Divider`, y `TagsOverflowDirective` una directiva sin entrada propia.
const DIVIDER_STORY = 'src/app/components/divider/divider.stories.ts';

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
			code: "const meta = { component: Divider, title: 'Componentes V3/Divider' };",
		},
		// El `title` de los datos de una story no es una entrada del catálogo: no vive junto a `component`.
		{
			filename: DIVIDER_STORY,
			code: "export const Primary = { args: { title: 'Geometrías del desvelo' } };",
		},
		// Fuera de una story la regla no mira nada.
		{
			filename: 'src/app/components/divider/divider.ts',
			code: "const link = './?path=/docs/componentes-v3-divider--docs';",
		},
		// Una clase Angular sin entrada propia, declarada en la tupla.
		{
			filename: DIVIDER_STORY,
			code: "export type DocsSymbols = [TagsOverflowDirective]; const prose = '<p>Recorta <code>TagsOverflowDirective</code>.</p>';",
		},
		// La tupla puede declararse después de la prosa que la necesita.
		{
			filename: DIVIDER_STORY,
			code: "const prose = '<p><strong>TagsOverflowDirective</strong></p>'; type DocsSymbols = [TagsOverflowDirective];",
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
			code: "const prose = '<p>Usa <code>Divider</code>.</p>';",
			errors: [{ messageId: 'literalMention', data: { name: 'Divider' } }],
		},
		{
			filename: DIVIDER_STORY,
			code: "const prose = '<p>Recorta <code>TagsOverflowDirective</code>.</p>';",
			errors: [{ messageId: 'undeclaredSymbol', data: { name: 'TagsOverflowDirective' } }],
		},
		// Los servicios del repo se decoran con `@Service()`, no con `@Injectable()`.
		{
			filename: DIVIDER_STORY,
			code: "const prose = '<p>El estado vive en <code>CarouselStateService</code>.</p>';",
			errors: [{ messageId: 'undeclaredSymbol', data: { name: 'CarouselStateService' } }],
		},
		// Declarar otro símbolo no alcanza: la tupla tiene que nombrar el que la prosa usa.
		{
			filename: DIVIDER_STORY,
			code: "export type DocsSymbols = [Divider]; const prose = '<strong>TagsOverflowDirective</strong>';",
			errors: [{ messageId: 'undeclaredSymbol', data: { name: 'TagsOverflowDirective' } }],
		},
		{
			filename: DIVIDER_STORY,
			code: "const meta = { component: Divider, title: 'Componentes V3/Separador' };",
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
