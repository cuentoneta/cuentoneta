import { environment } from '../environments/environment';

/**
 * Arma una URL canónica uniendo el host del sitio con un path relativo, garantizando un único `/`
 * de separación. En producción `environment.website` viene con `/` final (ver scripts/set-environment.ts),
 * por lo que concatenar `${environment.website}/${path}` producía un doble slash en el canonical.
 *
 * El segundo parámetro `website` existe como costura de test para verificar la normalización del host
 * con y sin slash final; en producción se usa el default de `environment`.
 */
export function buildCanonicalUrl(path: string, website: string = environment.website): string {
	const base = website.replace(/\/+$/, '');
	const normalizedPath = path.replace(/^\/+/, '');
	return `${base}/${normalizedPath}`;
}
