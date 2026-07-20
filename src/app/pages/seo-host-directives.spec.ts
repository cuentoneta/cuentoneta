import { readFileSync } from 'fs';
import { join } from 'path';

import { RenderMode } from '@angular/ssr';

import { appRoutes } from '../app.routes';
import { serverRoutes } from '../app.routes.server';
import { collectSeoViolations } from './seo-host-directives.util';

// Guardrail estructural: garantiza que toda página con una ruta indexable (RenderMode.Server/Prerender, sin
// noindex) declare sus directivas de SEO. Cruza app.routes.server.ts (RenderMode) × app.routes.ts (ruta→fuente)
// × el fuente del componente (hostDirectives) de forma dinámica: descubre las páginas desde las rutas y deriva
// la indexabilidad del propio código, sin registro ni imports de componentes. No usa Angular Testing Library a
// propósito: no hay UI que ejercitar, es un test de convención de código. Ver `angular-state.md` §8.

const INDEXABLE_MODES: readonly RenderMode[] = [RenderMode.Server, RenderMode.Prerender];

// Extrae el archivo fuente del componente desde el `loadComponent` de la ruta. El bundler resuelve el
// `import(...)` a un string con la ruta del módulo (p. ej. `/src/app/pages/home/home.component.ts`), del que se
// toma la parte relativa a la raíz del repo.
function sourceFileForRoute(path: string): string {
	const appRoute = appRoutes.find((route) => route.path === path);
	if (!appRoute?.loadComponent) {
		throw new Error(`Ruta '${path}' está en app.routes.server.ts pero no tiene un loadComponent en app.routes.ts`);
	}
	const reference = appRoute.loadComponent.toString();
	const match = reference.match(/["']([^"']*pages\/[^"']+\.component\.ts)["']/);
	if (!match) {
		throw new Error(`No se pudo extraer el archivo fuente del loadComponent de la ruta '${path}': ${reference}`);
	}
	const captured = match[1];
	const srcIndex = captured.indexOf('src/');
	return srcIndex >= 0 ? captured.slice(srcIndex) : captured.replace(/^\//, '');
}

// Agrupa por archivo fuente (storylist y storylist/:slug comparten componente) las rutas indexable-mode.
const pagesByFile = new Map<string, string[]>();
for (const serverRoute of serverRoutes) {
	if (serverRoute.path === '**' || !INDEXABLE_MODES.includes(serverRoute.renderMode)) {
		continue;
	}
	const sourceFile = sourceFileForRoute(serverRoute.path);
	pagesByFile.set(sourceFile, [...(pagesByFile.get(sourceFile) ?? []), serverRoute.path]);
}
const pages = [...pagesByFile.entries()].map(([sourceFile, paths]) => ({ sourceFile, paths: paths.join(', ') }));

describe('SEO host directives guardrail', () => {
	it('should discover the indexable-mode page routes', () => {
		expect(pages.length).toBeGreaterThan(0);
	});

	describe.each(pages)('$sourceFile', ({ sourceFile, paths }) => {
		it('should declare the SEO host directives that match its indexability', () => {
			const violations = collectSeoViolations(readFileSync(join(process.cwd(), sourceFile), 'utf-8'));
			expect(violations, `Rutas '${paths}' (${sourceFile}): ${violations.join('; ')}`).toEqual([]);
		});
	});
});
