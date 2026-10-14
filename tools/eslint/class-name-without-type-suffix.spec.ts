import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';

import rule from './class-name-without-type-suffix.js';

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

// `RuleTester.run` declara su propia suite con `describe`/`it`, así que se invoca al
// nivel superior del archivo: anidarlo dentro de un `it` es un error de Vitest.
ruleTester.run('class-name-without-type-suffix', rule, {
	valid: [
		{ code: '@Directive({}) export class Tooltip {}', filename: 'src/app/directives/tooltip.directive.ts' },
		{ code: '@Directive() export abstract class AbstractMetaTags {}', filename: 'src/app/directives/x.directive.ts' },
		{ code: "@Pipe({ name: 'repeat' }) export class Repeat {}", filename: 'src/app/pipes/repeat.pipe.ts' },
		// Una clase anónima no tiene un nombre que comparar.
		{ code: '@Directive() export default class {}', filename: 'src/app/directives/x.directive.ts' },
		// Una clase que se llama exactamente como el sufijo no tiene un nombre del que derivar el otro.
		{ code: '@Directive({}) export class Directive {}', filename: 'src/app/directives/x.directive.ts' },
		// Los componentes los cubre `component-location-and-name`: acá no se duplica el reporte.
		{ code: '@Component({}) export class FooComponent {}', filename: 'src/app/components/foo/foo.ts' },
		// Fuera de alcance: los servicios llevan un rol de arquitectura, y los prefijos de Qualified
		// Implementation no son sufijos de tipo.
		{ code: '@Injectable() export class FooService {}', filename: 'src/app/services/foo.service.ts' },
		{ code: '@Service() export class WindowLayoutService {}', filename: 'src/app/providers/layout.service.ts' },
		{ code: '@Service() export class HttpAuthorApi {}', filename: 'src/app/providers/author.provider.ts' },
		{ code: '@Injectable() export class ControllableLayoutService {}', filename: 'src/testing/layout.ts' },
		// Sin decorador no hay nada que repetir.
		{ code: 'export class FooDirective {}', filename: 'src/app/utils/foo.ts' },
		// Un decorador ajeno al mapa no cuenta, aunque el nombre termine igual.
		{ code: '@Custom() export class FooDirective {}', filename: 'src/app/utils/foo.ts' },
		// Los specs y las stories quedan afuera enteros.
		{ code: '@Directive({}) class HostDirective {}', filename: 'src/app/directives/tooltip.directive.spec.ts' },
		{ code: '@Pipe({ name: "x" }) class XPipe {}', filename: 'src/app/pipes/x.stories.ts' },
		// Cada decorador repite solo su propio sufijo: el de otro tipo no cuenta.
		{ code: '@Pipe({ name: "x" }) export class PipeDirective {}', filename: 'src/app/pipes/x.pipe.ts' },
		{ code: '@Directive({}) export class FooPipe {}', filename: 'src/app/directives/foo.directive.ts' },
	],
	invalid: [
		{
			code: '@Directive({}) export class TooltipDirective {}',
			filename: 'src/app/directives/tooltip.directive.ts',
			errors: [
				{ messageId: 'typeSuffix', data: { name: 'TooltipDirective', suffix: 'Directive', expected: 'Tooltip' } },
			],
		},
		{
			code: '@Directive() export abstract class AbstractMetaTagsDirective {}',
			filename: 'src/app/directives/abstract-meta-tags.directive.ts',
			errors: [
				{
					messageId: 'typeSuffix',
					data: { name: 'AbstractMetaTagsDirective', suffix: 'Directive', expected: 'AbstractMetaTags' },
				},
			],
		},
		{
			code: "@Pipe({ name: 'repeat' }) export class RepeatPipe {}",
			filename: 'src/app/pipes/repeat.pipe.ts',
			errors: [{ messageId: 'typeSuffix', data: { name: 'RepeatPipe', suffix: 'Pipe', expected: 'Repeat' } }],
		},
		{
			code: '@Directive({}) export default class TagsOverflowDirective {}',
			filename: 'src/app/components/tags-list/tags-overflow.directive.ts',
			errors: [
				{
					messageId: 'typeSuffix',
					data: { name: 'TagsOverflowDirective', suffix: 'Directive', expected: 'TagsOverflow' },
				},
			],
		},
		// El decorador sin llamada también cuenta.
		{
			code: '@Directive export class FooDirective {}',
			filename: 'src/app/directives/foo.directive.ts',
			errors: [{ messageId: 'typeSuffix', data: { name: 'FooDirective', suffix: 'Directive', expected: 'Foo' } }],
		},
		// Con varios decoradores, alcanza con que uno esté en el mapa.
		{
			code: '@Custom() @Directive({}) export class DrawerPanelDirective {}',
			filename: 'src/app/components/drawer/drawer-panel.directive.ts',
			errors: [
				{
					messageId: 'typeSuffix',
					data: { name: 'DrawerPanelDirective', suffix: 'Directive', expected: 'DrawerPanel' },
				},
			],
		},
	],
});
