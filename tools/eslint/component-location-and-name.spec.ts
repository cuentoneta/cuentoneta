import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';

import rule from './component-location-and-name.js';

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

const component = (className: string, metadata = '') =>
	`@Component({ selector: 'cuentoneta-x'${metadata ? `, ${metadata}` : ''} }) export class ${className} {}`;

const page = (className: string, metadata = '') =>
	`@Component({ selector: 'cuentoneta-x'${metadata ? `, ${metadata}` : ''} }) export default class ${className} {}`;

// `RuleTester.run` declara su propia suite con `describe`/`it`, así que se invoca al
// nivel superior del archivo: anidarlo dentro de un `it` es un error de Vitest.
ruleTester.run('component-location-and-name', rule, {
	valid: [
		{ code: component('Tag'), filename: 'src/app/components/tag/tag.ts' },
		{ code: component('TagSkeleton'), filename: 'src/app/components/tag/tag-skeleton.ts' },
		{ code: page('AboutPage'), filename: 'src/app/pages/about/about.page.ts' },
		// Un componente de `pages/` que no es una ruta sigue la convención de `components/`.
		{
			code: component('LiteraryWorkPageSkeleton'),
			filename: 'src/app/pages/literary-work/literary-work-page-skeleton.ts',
		},
		{ code: component('App'), filename: 'src/app/app.ts' },
		// `src/testing/` está exento de ubicación y de nombre ↔ archivo, no del sufijo.
		{
			code: '@Component({}) class CatalogEmbedPlaceholders {}',
			filename: 'src/testing/storybook-embed-placeholders.ts',
		},
		// Los specs y las stories quedan afuera enteros: sus hosts son andamiaje de un solo archivo.
		{ code: '@Component({}) class HostComponent {}', filename: 'src/app/directives/tooltip.directive.spec.ts' },
		{
			code: '@Component({}) class ButtonGroupStoryHostComponent {}',
			filename: 'src/app/components/button-group/button-group.stories.ts',
		},
		{
			code: component('Carousel', `templateUrl: './carousel.html', styleUrl: './carousel.css'`),
			filename: 'src/app/components/carousel/carousel.ts',
		},
		{
			code: component('Carousel', `styleUrls: ['./carousel.css']`),
			filename: 'src/app/components/carousel/carousel.ts',
		},
		// Fuera de alcance: otros decoradores y clases sin decorador, en cualquier ubicación.
		{ code: '@Directive({}) export class TooltipDirective {}', filename: 'src/app/directives/tooltip.directive.ts' },
		{ code: 'export class AnyComponent {}', filename: 'src/app/utils/any.ts' },
	],
	invalid: [
		{
			code: component('ButtonComponent'),
			filename: 'src/app/components/button/button.component.ts',
			errors: [
				{ messageId: 'componentSuffix', data: { name: 'ButtonComponent', expected: 'Button' } },
				{ messageId: 'nameMismatch', data: { name: 'ButtonComponent', expectedFile: 'button.ts' } },
			],
		},
		{
			code: component('ButtonComponent'),
			filename: 'src/app/components/button/button.ts',
			errors: [{ messageId: 'componentSuffix' }, { messageId: 'nameMismatch' }],
		},
		// Un stem con `.component` nunca coincide, aunque la clase ya no lleve el sufijo.
		{
			code: component('Button'),
			filename: 'src/app/components/button/button.component.ts',
			errors: [{ messageId: 'nameMismatch', data: { name: 'Button', expectedFile: 'button.ts' } }],
		},
		{
			code: component('Tooltip'),
			filename: 'src/app/directives/tooltip.ts',
			errors: [{ messageId: 'misplaced', data: { path: 'src/app/directives/tooltip.ts' } }],
		},
		// La raíz se exime por ruta exacta, no por carpeta.
		{ code: component('Foo'), filename: 'src/app/foo.ts', errors: [{ messageId: 'misplaced' }] },
		{
			code: component('FooComponent'),
			filename: 'src/testing/foo.ts',
			errors: [{ messageId: 'componentSuffix' }],
		},
		{
			code: page('XPage'),
			filename: 'src/app/components/x/x.page.ts',
			errors: [{ messageId: 'pageOutsidePages' }],
		},
		{
			code: component('AboutPage'),
			filename: 'src/app/pages/about/about.ts',
			errors: [{ messageId: 'pageSuffixReserved', data: { name: 'AboutPage', expectedFile: 'about.page.ts' } }],
		},
		// Coincidir con el archivo no alcanza: el sufijo sigue reservado a los `.page.ts`.
		{
			code: component('AboutPage'),
			filename: 'src/app/pages/about/about-page.ts',
			errors: [{ messageId: 'pageSuffixReserved' }],
		},
		{
			code: page('About'),
			filename: 'src/app/pages/about/about.page.ts',
			errors: [{ messageId: 'nameMismatch', data: { name: 'About', expectedFile: 'about.ts' } }],
		},
		{
			code: component('Carousel', `templateUrl: './carousel.component.html', styleUrls: ['./other.css']`),
			filename: 'src/app/components/carousel/carousel.ts',
			errors: [
				{
					messageId: 'siblingMismatch',
					data: { actual: './carousel.component.html', expected: './carousel.html' },
				},
				{ messageId: 'siblingMismatch', data: { actual: './other.css', expected: './carousel.css' } },
			],
		},
	],
});
