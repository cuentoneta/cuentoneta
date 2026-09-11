import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// El despeje del encabezado tiene que derivar de `--spacing-header-height` en todos sus consumidores, y este
// es el único que vive en CSS crudo: happy-dom no aplica el CSS del build, así que leer el archivo es la
// única forma de afirmar la relación en el tier de tests unitarios.
describe('layout.css', () => {
	const source = readFileSync(join(process.cwd(), 'src/assets/css/layout.css'), 'utf-8');

	it('should offset anchor jumps by the header height token', () => {
		const declaration = source.match(/scroll-padding-top:([^;]+);/);

		expect(declaration).not.toBeNull();
		expect(declaration?.[1]).toContain('var(--spacing-header-height)');
	});
});
