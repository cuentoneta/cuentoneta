import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';

// REASON: la regla es un `.js` sin tipos propios; el RuleTester solo necesita el módulo.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import rule from './storybook-source-state.js';

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

const STORIES = 'a.stories.ts';
const shown = `{ parameters: { docs: { canvas: { sourceState: 'shown' } } } }`;

// `RuleTester.run` declara su propia suite con `describe`/`it`, así que se invoca al
// nivel superior del archivo: anidarlo dentro de un `it` es un error de Vitest.
ruleTester.run('storybook-source-state', rule, {
	valid: [
		{ code: `export default ${shown};`, filename: STORIES },
		// El meta por referencia obliga a resolver el identificador contra el scope, que es
		// una vía distinta de la del objeto literal inline.
		{ code: `const meta = ${shown};\nexport default meta;`, filename: STORIES },
		// Un valor que no es objeto literal se saltea a propósito, para no marcar de más sobre
		// parámetros construidos dinámicamente. Los cuatro niveles lo hacen, y cada uno necesita
		// su caso: son salidas silenciosas, así que una que dejara de saltear no se vería.
		{ code: `export default { parameters: buildParams() };`, filename: STORIES },
		{ code: `export default { parameters: { docs: buildDocs() } };`, filename: STORIES },
		{ code: `export default { parameters: { docs: { canvas: buildCanvas() } } };`, filename: STORIES },
		{
			code: `export default { parameters: { docs: { canvas: { sourceState: shownValue } } } };`,
			filename: STORIES,
		},
		// La regla se aplica por nombre de archivo: fuera de `.stories.ts` no opina.
		{ code: `export default {};`, filename: 'a.ts' },
		{ code: `export default {};`, filename: 'a.spec.ts' },
	],
	invalid: [
		{ code: `export default {};`, filename: STORIES, errors: [{ messageId: 'missingParameters' }] },
		{ code: `export default { parameters: {} };`, filename: STORIES, errors: [{ messageId: 'missingDocs' }] },
		{
			code: `export default { parameters: { docs: {} } };`,
			filename: STORIES,
			errors: [{ messageId: 'missingCanvas' }],
		},
		{
			code: `export default { parameters: { docs: { canvas: {} } } };`,
			filename: STORIES,
			errors: [{ messageId: 'missingSourceState' }],
		},
		{
			code: `export default { parameters: { docs: { canvas: { sourceState: 'hidden' } } } };`,
			filename: STORIES,
			errors: [{ messageId: 'wrongSourceState' }],
		},
		// La clave entrecomillada es un Literal y no un Identifier: sin este caso, perder esa
		// rama del matcheo dejaría de marcar un meta perfectamente válido para Storybook.
		{
			code: `export default { 'parameters': { 'docs': { 'canvas': {} } } };`,
			filename: STORIES,
			errors: [{ messageId: 'missingSourceState' }],
		},
		// Por referencia también debe marcar: si la resolución de scope se rompiera, la
		// regla dejaría de ver el meta y este caso pasaría en verde sin reportar nada.
		{
			code: `const meta = { parameters: { docs: { canvas: {} } } };\nexport default meta;`,
			filename: STORIES,
			errors: [{ messageId: 'missingSourceState' }],
		},
	],
});
