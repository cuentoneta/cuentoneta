import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';

// REASON: la regla es un `.js` sin tipos propios; el RuleTester solo necesita el módulo.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import rule from './component-config-in-class.js';

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

const componentHeader = `import { Component } from '@angular/core';\n`;
const decorate = (body: string, classDeclaration = 'export class Probe {}') =>
	`${componentHeader}${body}\n@Component({ selector: 'x', template: '' })\n${classDeclaration}`;

// `RuleTester.run` declara su propia suite con `describe`/`it`, así que se invoca al
// nivel superior del archivo: anidarlo dentro de un `it` es un error de Vitest.
ruleTester.run('component-config-in-class', rule, {
	valid: [
		// Sin decorador de clase, el `const` de módulo es lo correcto.
		{ code: `const sizeMap = { sm: 'h-4' };\nexport class Plain {}`, filename: 'a.ts' },
		// Exportado: es API compartida, no configuración privada del archivo.
		{ code: decorate(`export const sizeMap = { sm: 'h-4' };`), filename: 'a.ts' },
		// Primitivos y tipos no son configuración.
		{ code: decorate(`const limit = 5;`), filename: 'a.ts' },
		{ code: decorate(`type Foo = { a: number };`), filename: 'a.ts' },
		// Sustituto de `enum`: el tipo homónimo se deriva con `typeof`, así que el
		// `const` no puede vivir en la instancia.
		{
			code: decorate(
				`const VisibilityState = Object.freeze({ Visible: 'visible' } as const);\ntype VisibilityState = (typeof VisibilityState)[keyof typeof VisibilityState];`,
			),
			filename: 'a.ts',
		},
	],
	invalid: [
		{
			code: decorate(`const sizeMap = { sm: 'h-4' };`),
			filename: 'a.ts',
			errors: [{ messageId: 'moduleConfig' }],
		},
		{
			code: decorate(`const widgets = ['a', 'b'];`),
			filename: 'a.ts',
			errors: [{ messageId: 'moduleConfig' }],
		},
		// Los envoltorios que no cambian la naturaleza del literal no eximen.
		{
			code: decorate(`const sizeMap = Object.freeze({ sm: 'h-4' });`),
			filename: 'a.ts',
			errors: [{ messageId: 'moduleConfig' }],
		},
		{
			code: decorate(`const sizeMap = Object.freeze({ sm: 'h-4' } as const);`),
			filename: 'a.ts',
			errors: [{ messageId: 'moduleConfig' }],
		},
		{
			code: decorate(`const sizeMap = { sm: 'h-4' } as const;`),
			filename: 'a.ts',
			errors: [{ messageId: 'moduleConfig' }],
		},
		{
			code: decorate(`const sizeMap = { sm: 'h-4' } satisfies Record<string, string>;`),
			filename: 'a.ts',
			errors: [{ messageId: 'moduleConfig' }],
		},
		// `export default class` declara el decorador igual que `export class`.
		{
			code: decorate(`const sizeMap = { sm: 'h-4' };`, 'export default class Probe {}'),
			filename: 'a.ts',
			errors: [{ messageId: 'moduleConfig' }],
		},
		// Una clase sin decorador no exime al archivo si otra sí lo tiene.
		{
			code: `${componentHeader}const sizeMap = { sm: 'h-4' };\nexport class Helper {}\n@Component({ selector: 'x', template: '' })\nexport class Probe {}`,
			filename: 'a.ts',
			errors: [{ messageId: 'moduleConfig' }],
		},
	],
});
