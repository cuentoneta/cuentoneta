import { appRoutes } from '../app.routes';

/**
 * Devuelve el archivo fuente del componente que carga la ruta, relativo a la raíz del repo. El bundler
 * resuelve el `import(...)` del `loadComponent` a un string con la ruta del módulo, de la que se toma la
 * parte a partir de `src/`. Lanza si la ruta no existe en `app.routes.ts` o no declara un `loadComponent`.
 */
export function sourceFileForRoute(path: string): string {
	const appRoute = appRoutes.find((route) => route.path === path);
	if (!appRoute?.loadComponent) {
		throw new Error(`Ruta '${path}' está en app.routes.server.ts pero no tiene un loadComponent en app.routes.ts`);
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

/**
 * Los archivos que componen la vista de una página: su `.ts` y, cuando el decorador declara un
 * `templateUrl` relativo, el `.html` hermano. Una plantilla inline vive en el `.ts` y no agrega un archivo.
 * Las rutas son relativas a la raíz del repo, igual que la que recibe.
 */
export function templateSourcesFor(sourceFile: string, source: string): string[] {
	const match = source.match(/templateUrl:\s*['"]\.\/([^'"]+)['"]/);
	if (!match) {
		return [sourceFile];
	}
	const directory = sourceFile.slice(0, sourceFile.lastIndexOf('/'));
	return [sourceFile, `${directory}/${match[1]}`];
}
