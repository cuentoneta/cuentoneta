import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const SRC_ROOT = join(process.cwd(), 'src');

// Un valor entre comillas puede contener `<` y `>` (`[class]="n() > 1 ? 'a' : 'b'"`): por eso los
// atributos se recorren respetando las comillas y no con una clase de caracteres.
const ATTRIBUTE_CHARS = String.raw`(?:[^<>"']|"[^"]*"|'[^']*')*`;
const INNER_HTML_OPENING_TAG = new RegExp(
	String.raw`<[a-z][\w-]*${ATTRIBUTE_CHARS}?(?:\[innerHTML\]|bind-innerHTML)${ATTRIBUTE_CHARS}>`,
	'gi',
);

function innerHtmlOpeningTags(source: string): string[] {
	return source.match(INNER_HTML_OPENING_TAG) ?? [];
}

function listTemplateSources(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return listTemplateSources(path);
		const isSource = /\.(ts|html)$/.test(entry.name) && !/\.(spec|stories)\.ts$/.test(entry.name);
		return isSource ? [path] : [];
	});
}

describe('Subrayado de enlaces del HTML de Markdown', () => {
	it('importa la hoja en la capa components, donde le gana al preflight', () => {
		const styles = readFileSync(join(SRC_ROOT, 'styles.css'), 'utf-8');

		expect(styles).toMatch(/@import\s+'\.\/assets\/css\/markdown-links\.css'\s+layer\(components\)/);
	});

	it('marca con data-markdown todo contenedor de un [innerHTML]', () => {
		const openingTags = listTemplateSources(join(SRC_ROOT, 'app')).flatMap((path) =>
			innerHtmlOpeningTags(readFileSync(path, 'utf-8')),
		);

		expect(openingTags.length).toBeGreaterThan(0);
		expect(openingTags.filter((tag) => !tag.includes('data-markdown'))).toEqual([]);
	});

	describe('detección de contenedores de [innerHTML]', () => {
		it.each([
			['un binding simple', `<div [innerHTML]="html()"></div>`],
			['un `>` en el valor de un atributo previo', `<div [class]="n() > 1 ? 'a' : 'b'" [innerHTML]="html()"></div>`],
			['un `=>` en un handler previo', `<div (click)="run(() => 1)" [innerHTML]="html()"></div>`],
			['un `<` en el valor de un atributo previo', `<div [hidden]="a < b" [innerHTML]="html()"></div>`],
			['una etiqueta en varias líneas', `<div\n\t[class]="classes()"\n\t[innerHTML]="html()"\n></div>`],
			['la forma bind-innerHTML', `<div bind-innerHTML="html()"></div>`],
		])('encuentra el contenedor con %s', (_description, template) => {
			expect(innerHtmlOpeningTags(template)).toHaveLength(1);
		});

		it('ignora las etiquetas sin [innerHTML]', () => {
			expect(innerHtmlOpeningTags(`<div [class]="classes()"></div><span>texto</span>`)).toEqual([]);
		});

		it('devuelve la etiqueta de apertura completa, con sus atributos posteriores', () => {
			const [tag] = innerHtmlOpeningTags(`<div [innerHTML]="html()" data-markdown data-testid="x"></div>`);

			expect(tag).toContain('data-markdown');
		});
	});
});
