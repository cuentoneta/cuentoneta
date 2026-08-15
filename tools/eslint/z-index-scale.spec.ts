import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import * as angular from 'angular-eslint';

import rule from './z-index-scale.js';

const tsRuleTester = new RuleTester({ languageOptions: { parser: tsParser } });
// La rama de plantillas corre bajo el parser de plantillas de Angular, que es el que ESLint usa para los
// `.html` del proyecto: probarla con el parser de TS no ejercitaría el mismo camino.
const templateRuleTester = new RuleTester({ languageOptions: { parser: angular.templateParser } });

const HEADER_FILE = 'src/app/components/header/header.component.ts';
const allowHeader = [{ allowGlobalLayersIn: [HEADER_FILE] }];

const decorate = (hostClass: string) =>
	`import { Component } from '@angular/core';\n@Component({ selector: 'x', template: '', host: { class: '${hostClass}' } })\nexport class Probe {}`;

// `RuleTester.run` declara su propia suite con `describe`/`it`, así que se invoca al nivel superior del
// archivo: anidarlo dentro de un `it` es un error de Vitest.
tsRuleTester.run('z-index-scale (.ts)', rule, {
	valid: [
		{ code: decorate('relative isolate z-content'), filename: 'a.ts' },
		{ code: decorate('z-raised'), filename: 'a.ts' },
		{ code: decorate('md:z-content hover:z-raised'), filename: 'a.ts' },
		{ code: decorate('sm:hover:z-content'), filename: 'a.ts' },
		// Plantilla inline con acento invertido, que es la forma real del repo: la cubre la rama de
		// plantillas vía el procesador de Angular, así que acá no se reporta.
		{
			code: `import { Component } from '@angular/core';\n@Component({ selector: 'x', template: \`<div class="z-10"></div>\` })\nexport class Probe {}`,
			filename: 'a.ts',
		},
		// `z-auto` es la utilidad nativa: no eleva nada.
		{ code: decorate('z-auto'), filename: 'a.ts' },
		// Una clase que apenas empieza igual no es una utilidad de apilamiento.
		{ code: decorate('zoom-in z-content'), filename: 'a.ts' },
		// Un mapa de clases es la otra forma en que las utilidades viajan en un `.ts`.
		{ code: `const classes = ['absolute z-raised', 'absolute z-content'];`, filename: 'a.ts' },
		// Estilos inline: la declaración referencia una capa de la escala.
		{
			code: `const styles = ['.overlay { z-index: var(--z-index-content); }'];`,
			filename: 'a.ts',
		},
		{ code: `const styles = ['.overlay { z-index: auto; }'];`, filename: 'a.ts' },
		// La plantilla inline la cubre la rama de plantillas, vía el procesador de Angular: mirarla también
		// acá duplicaría el reporte.
		{
			code: `import { Component } from '@angular/core';\n@Component({ selector: 'x', template: '<div class="z-10"></div>' })\nexport class Probe {}`,
			filename: 'a.ts',
		},
		// Las capas globales, habilitadas en el archivo que las declara.
		{ code: decorate('fixed top-0 z-nav'), filename: HEADER_FILE, options: allowHeader },
	],
	invalid: [
		{ code: decorate('z-10'), filename: 'a.ts', errors: [{ messageId: 'utility' }] },
		// Con variante: el prefijo no exime, y la reserva de la franja alta tampoco se elude con él.
		{ code: decorate('md:z-50'), filename: 'a.ts', errors: [{ messageId: 'utility' }] },
		{ code: decorate('sm:hover:z-20'), filename: 'a.ts', errors: [{ messageId: 'utility' }] },
		{ code: decorate('hover:z-[999]'), filename: 'a.ts', errors: [{ messageId: 'utility' }] },
		{ code: decorate('md:-z-content'), filename: 'a.ts', errors: [{ messageId: 'utility' }] },
		{ code: decorate('md:z-nav'), filename: 'a.ts', options: allowHeader, errors: [{ messageId: 'globalLayer' }] },
		{ code: decorate('z-50'), filename: 'a.ts', errors: [{ messageId: 'utility' }] },
		{ code: decorate('z-[999]'), filename: 'a.ts', errors: [{ messageId: 'utility' }] },
		// Un negativo no pertenece a la escala aunque nombre una capa.
		{ code: decorate('-z-content'), filename: 'a.ts', errors: [{ messageId: 'utility' }] },
		// El caso que ningún gate de compilación puede atrapar: no emite CSS y no falla el build.
		{ code: decorate('z-nvv'), filename: 'a.ts', errors: [{ messageId: 'utility' }] },
		{
			code: `const classes = ['absolute z-20'];`,
			filename: 'a.ts',
			errors: [{ messageId: 'utility' }],
		},
		{
			code: `const styles = ['.overlay { z-index: 3; }'];`,
			filename: 'a.ts',
			errors: [{ messageId: 'declaration' }],
		},
		{
			code: `const styles = ['.overlay { z-index: var(--z-index-nope); }'];`,
			filename: 'a.ts',
			errors: [{ messageId: 'declaration' }],
		},
		// La reserva rige en las dos formas: lo que `z-nav` prohíbe no lo puede conceder la declaración.
		{
			code: `const styles = ['.overlay { z-index: var(--z-index-nav); }'];`,
			filename: 'a.ts',
			options: allowHeader,
			errors: [{ messageId: 'globalLayer' }],
		},
		// Literales de plantilla: es la forma con que el repo escribe `styles`, y la que ejercita el
		// visitor de `TemplateElement`.
		{
			code: 'const styles = [`.overlay { z-index: 3; }`];',
			filename: 'a.ts',
			errors: [{ messageId: 'declaration' }],
		},
		{ code: 'const classes = [`absolute z-10`];', filename: 'a.ts', errors: [{ messageId: 'utility' }] },
		// La posición señala la violación, no el principio del archivo: es lo que vuelve accionable el
		// mensaje en un componente largo.
		{
			code: `import { Component } from '@angular/core';\n\nconst first = 'z-10';\n\nconst second = 'z-20';`,
			filename: 'a.ts',
			errors: [
				{ messageId: 'utility', line: 3, column: 16 },
				{ messageId: 'utility', line: 5, column: 17 },
			],
		},
		// La franja alta está reservada: en un archivo cualquiera, una capa global se rechaza aunque
		// pertenezca a la escala.
		{ code: decorate('z-nav'), filename: 'a.ts', options: allowHeader, errors: [{ messageId: 'globalLayer' }] },
		{ code: decorate('z-floating'), filename: 'a.ts', options: allowHeader, errors: [{ messageId: 'globalLayer' }] },
	],
});

templateRuleTester.run('z-index-scale (plantillas)', rule, {
	valid: [
		{ code: `<div class="relative z-content"></div>`, filename: 'a.html' },
		{ code: `<div class="z-auto"></div>`, filename: 'a.html' },
		{ code: `<div [class]="wrapperClasses()"></div>`, filename: 'a.html' },
	],
	invalid: [
		{ code: `<div class="z-10"></div>`, filename: 'a.html', errors: [{ messageId: 'utility' }] },
		{ code: `<div class="z-[999]"></div>`, filename: 'a.html', errors: [{ messageId: 'utility' }] },
		{
			code: `<div class="z-nav"></div>`,
			filename: 'a.html',
			options: allowHeader,
			errors: [{ messageId: 'globalLayer' }],
		},
		// Dos violaciones en la misma plantilla se reportan por separado, cada una en su posición.
		{
			code: `<div class="z-10">\n\t<span class="z-20"></span>\n</div>`,
			filename: 'a.html',
			errors: [
				{ messageId: 'utility', line: 1 },
				{ messageId: 'utility', line: 2 },
			],
		},
	],
});
