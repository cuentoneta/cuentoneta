import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const SRC_ROOT = join(process.cwd(), 'src');

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
		const openingTags = listTemplateSources(join(SRC_ROOT, 'app')).flatMap(
			(path) => readFileSync(path, 'utf-8').match(/<[a-z][^<>]*\[innerHTML\][^<>]*>/gi) ?? [],
		);

		expect(openingTags.length).toBeGreaterThan(0);
		expect(openingTags.filter((tag) => !tag.includes('data-markdown'))).toEqual([]);
	});
});
