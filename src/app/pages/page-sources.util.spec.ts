import { routedPagePaths, sourceFileForRoute, templateSourcesFor } from './page-sources.util';

describe('page-sources.util', () => {
	describe('routedPagePaths', () => {
		it('should discover the routed pages', () => {
			expect(routedPagePaths().length).toBeGreaterThan(0);
		});
	});

	describe('sourceFileForRoute', () => {
		it('should resolve a routed path to a source file under src/app/pages', () => {
			expect(sourceFileForRoute(routedPagePaths()[0])).toMatch(/^src\/app\/pages\/.+\.(component|page)\.ts$/);
		});

		it('should reject a path that no route declares', () => {
			expect(() => sourceFileForRoute('no-existe')).toThrow(/no declara un loadComponent/);
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

			expect(templateSourcesFor('src/app/pages/dmca/dmca.component.ts', source)).toEqual([
				'src/app/pages/dmca/dmca.component.ts',
			]);
		});
	});
});
