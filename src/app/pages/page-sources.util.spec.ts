import { readdirSync } from 'fs';
import { join } from 'path';

import { routedPagePaths, sourceFileForRoute, templateSourcesFor } from './page-sources.util';

const PAGES_DIR = 'src/app/pages';

describe('page-sources.util', () => {
	describe('routedPagePaths', () => {
		it('should discover the routed pages', () => {
			expect(routedPagePaths().length).toBeGreaterThan(0);
		});
	});

	describe('sourceFileForRoute', () => {
		it('should resolve a routed path to a source file under src/app/pages', () => {
			expect(sourceFileForRoute(routedPagePaths()[0])).toMatch(/^src\/app\/pages\/.+\.page\.ts$/);
		});

		it('should reject a path that no route declares', () => {
			expect(() => sourceFileForRoute('no-existe')).toThrow(/no declara un loadComponent/);
		});

		// La vuelta de lo anterior: el sufijo `Page` queda reservado a las páginas ruteadas, así que un
		// `.page.ts` que ninguna ruta carga es una página huérfana o un componente mal nombrado.
		it('should load every .page.ts under src/app/pages from some route', () => {
			const pageFiles = readdirSync(join(process.cwd(), PAGES_DIR), { recursive: true, encoding: 'utf-8' })
				.filter((file) => file.endsWith('.page.ts'))
				.map((file) => `${PAGES_DIR}/${file.replaceAll('\\', '/')}`);
			const routedFiles = routedPagePaths().map(sourceFileForRoute);

			expect(new Set(pageFiles)).toEqual(new Set(routedFiles));
		});
	});

	describe('templateSourcesFor', () => {
		it('should add the sibling template when the decorator points at one', () => {
			const source = `@Component({ templateUrl: './author.page.html' })`;

			expect(templateSourcesFor('src/app/pages/author/author.page.ts', source)).toEqual([
				'src/app/pages/author/author.page.ts',
				'src/app/pages/author/author.page.html',
			]);
		});

		it('should return only the source file when the template is inline', () => {
			const source = '@Component({ template: `<div></div>` })';

			expect(templateSourcesFor('src/app/pages/dmca/dmca.page.ts', source)).toEqual([
				'src/app/pages/dmca/dmca.page.ts',
			]);
		});
	});
});
