import { readFileSync } from 'fs';
import { join } from 'path';

const SRC_ROOT = join(process.cwd(), 'src');

describe('Subrayado de enlaces del HTML de Markdown', () => {
	it('importa la hoja en la capa components, donde le gana al preflight', () => {
		const styles = readFileSync(join(SRC_ROOT, 'styles.css'), 'utf-8');

		expect(styles).toMatch(/@import\s+'\.\/assets\/css\/markdown-links\.css'\s+layer\(components\)/);
	});
});
