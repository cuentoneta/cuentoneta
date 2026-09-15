import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';

// REASON: la regla es un `.js` sin tipos propios; el RuleTester solo necesita el módulo.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import rule from './no-apply-in-host-styles.js';

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

const decorate = (styles: string) =>
	`@Component({ selector: 'x', template: '', styles: ${styles} })\nexport class P {}`;

// `RuleTester.run` declara su propia suite con `describe`/`it`, así que se invoca al
// nivel superior del archivo: anidarlo dentro de un `it` es un error de Vitest.
ruleTester.run('no-apply-in-host-styles', rule, {
	valid: [
		{ code: decorate('`.child { @apply flex; }`'), filename: 'a.ts' },
		// Las tres formas que la regla excluye a propósito: el `@apply` no está directo
		// en el bloque del host pelado.
		{ code: decorate('`:host ::ng-deep { @apply flex; }`'), filename: 'a.ts' },
		{ code: decorate('`:host(.abierto) { @apply flex; }`'), filename: 'a.ts' },
		{ code: decorate('`:host { .child { @apply flex; } }`'), filename: 'a.ts' },
		// Una propiedad homónima en otro objeto no es el `styles` del decorador… pero
		// tampoco tiene `:host { @apply }`, así que acá lo que se afirma es el caso limpio.
		{ code: `const x = { styles: ['.a { color: red; }'] };`, filename: 'a.ts' },
	],
	invalid: [
		{ code: decorate('`:host { @apply flex; }`'), filename: 'a.ts', errors: [{ messageId: 'applyInHost' }] },
		// Las tres formas que puede tomar el valor de `styles`: template literal, string
		// y arreglo. Sin las tres, cambiar `stylesText` podría perder una sin aviso.
		{ code: decorate(`':host { @apply flex; }'`), filename: 'a.ts', errors: [{ messageId: 'applyInHost' }] },
		{ code: decorate('[`:host { @apply flex; }`]'), filename: 'a.ts', errors: [{ messageId: 'applyInHost' }] },
	],
});
