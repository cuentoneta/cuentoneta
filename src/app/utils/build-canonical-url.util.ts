import { environment } from '../environments/environment';

/**
 * Arma una URL canónica uniendo el host del sitio con un path relativo, garantizando un único `/`
 * de separación. Evita el doble slash que producía `${environment.website}/${path}` cuando
 * `environment.website` trae `/` final en producción (ver scripts/set-environment.ts).
 *
 * `website` es una costura de test; en producción usa el default de `environment`.
 */
export function buildCanonicalUrl(path: string, website: string = environment.website): string {
	const base = website.replace(/\/+$/, '');
	const normalizedPath = path.replace(/^\/+/, '');
	return `${base}/${normalizedPath}`;
}
