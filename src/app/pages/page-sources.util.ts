import { appRoutes } from '../app.routes';

/**
 * El fuente del componente que carga la ruta, relativo a la raíz del repo. Sale del string al que el bundler
 * resuelve el `import(...)` del `loadComponent`. Lanza si la ruta no lo declara.
 */
export function sourceFileForRoute(path: string): string {
	const appRoute = appRoutes.find((route) => route.path === path);
	if (!appRoute?.loadComponent) {
		throw new Error(`Ruta '${path}' no declara un loadComponent en app.routes.ts`);
	}
	const reference = appRoute.loadComponent.toString();
	const match = reference.match(/["']([^"']*pages\/[^"']+\.(?:component|page)\.ts)["']/);
	if (!match) {
		throw new Error(`No se pudo extraer el archivo fuente del loadComponent de la ruta '${path}': ${reference}`);
	}
	const captured = match[1];
	const srcIndex = captured.indexOf('src/');
	return srcIndex >= 0 ? captured.slice(srcIndex) : captured.replace(/^\//, '');
}

/** Las rutas de todas las páginas ruteadas, tengan o no una entrada en `app.routes.server.ts`. */
export function routedPagePaths(): string[] {
	return appRoutes.filter((route) => route.loadComponent && route.path !== undefined).map((route) => route.path ?? '');
}

/** El `.ts` de la página y, si declara un `templateUrl` relativo, el `.html` hermano. */
export function templateSourcesFor(sourceFile: string, source: string): string[] {
	const match = source.match(/templateUrl:\s*['"]\.\/([^'"]+)['"]/);
	if (!match) {
		return [sourceFile];
	}
	const directory = sourceFile.slice(0, sourceFile.lastIndexOf('/'));
	return [sourceFile, `${directory}/${match[1]}`];
}
