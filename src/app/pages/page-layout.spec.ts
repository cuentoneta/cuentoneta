import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { collectPageLayoutViolations } from './page-layout.util';
import { routedPagePaths, sourceFileForRoute, templateSourcesFor } from './page-sources.util';

// Guardrail estructural: el landmark principal y el despeje del encabezado fijo son del shell, y una página
// no vuelve a declararlos. Es lo que convierte esa convención en algo verificable, en lugar de un comentario
// repetido en cada plantilla. Descubre las páginas desde las rutas y afirma sobre su fuente, sin registro ni
// imports de componentes. No usa Angular Testing Library a propósito: no hay UI que ejercitar.

const SHELL_FILE = 'src/app/app.component.ts';
const COMPONENTS_DIR = 'src/app/components';

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf-8');

const pages = routedPagePaths().map((path) => {
	const sourceFile = sourceFileForRoute(path);
	return { path, sourceFile, files: templateSourcesFor(sourceFile, read(sourceFile)) };
});

describe('guardrail de layout de páginas', () => {
	it('should discover the routed pages', () => {
		expect(pages.length).toBeGreaterThan(0);
	});

	describe.each(pages)('$sourceFile', ({ path, files }) => {
		it('should leave the main landmark and the header clearance to the shell', () => {
			const violations = files.flatMap((file) => collectPageLayoutViolations(read(file)).map((v) => `${file}: ${v}`));

			expect(violations, `Ruta '${path}': ${violations.join('; ')}`).toEqual([]);
		});
	});
});

// La contracara positiva: sin esto, borrar el `<main>` del shell dejaría el guardrail de arriba en verde y la
// aplicación sin landmark principal.
describe('landmark principal del shell', () => {
	const shell = read(SHELL_FILE);

	it('should declare exactly one main landmark', () => {
		expect(shell.match(/<main[\s>]/g)).toHaveLength(1);
	});

	it('should expose the landmark as the skip link target', () => {
		expect(shell).toMatch(/<main[^>]*id="main-content"/);
	});

	it('should derive the header clearance from the token instead of a literal', () => {
		expect(shell).toMatch(/<main[^>]*class="[^"]*pt-header-height/);
	});
});

// Cierra la vía por la que el landmark podría reaparecer fuera de `pages/`: un componente que lo declare
// termina anidado dentro del `<main>` del shell.
describe('componentes del catálogo', () => {
	const componentFiles = readdirSync(join(process.cwd(), COMPONENTS_DIR), { recursive: true, encoding: 'utf-8' })
		.filter((file) => /\.(ts|html)$/.test(file) && !/\.spec\.ts$/.test(file))
		.map((file) => `${COMPONENTS_DIR}/${file.replaceAll('\\', '/')}`);

	it('should find the component sources', () => {
		expect(componentFiles.length).toBeGreaterThan(0);
	});

	it('should not declare a main landmark in any component', () => {
		const offenders = componentFiles.filter((file) => /<main[\s>]/.test(read(file)));

		expect(offenders).toEqual([]);
	});
});
