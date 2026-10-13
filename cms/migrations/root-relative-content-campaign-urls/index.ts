import { at, defineMigration, set } from 'sanity/migrate';

interface ContentCampaignDocument {
	_id: string;
	url?: unknown;
}

/**
 * Lleva a una ruta desde la raíz una URL de campaña escrita relativa a la página que la muestra
 * (`../collection/x`, `collection/x`). Devuelve `undefined` cuando no hay nada que reescribir: la URL ya
 * empieza con `/`, o declara un esquema (`https:`), que no es una ruta del sitio.
 */
export function toRootRelativeUrl(url: string): string | undefined {
	if (url.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(url)) {
		return undefined;
	}
	return `/${url.replace(/^(\.{1,2}\/)+/, '')}`;
}

/**
 * El carrusel de la portada pasa la URL de cada campaña a un `routerLink`, que resuelve una ruta
 * relativa contra la página actual. Escritas relativas a una portada que vivía en `/home`, desde la raíz
 * su `../` sube más allá del primer segmento: el router lanza y el render del servidor sale con los
 * esqueletos de la página. Una ruta desde la raíz resuelve igual sea cual sea la URL de la portada.
 *
 * Es independiente del código: la forma reescrita la sirve tanto la portada en `/home` como en `/`, así
 * que puede correr antes del despliegue. Recorre también los borradores, que al publicarse reemplazan
 * al documento publicado.
 */
export default defineMigration({
	title: 'Reescribir las URLs de campaña como rutas desde la raíz',
	documentTypes: ['contentCampaign'],
	filter: 'defined(url) && !string::startsWith(url, "/")',
	migrate: {
		document(doc: ContentCampaignDocument) {
			// El filtro es una optimización del runner, no la garantía: se revalida sobre el documento.
			if (typeof doc.url !== 'string') {
				return [];
			}
			const rootRelativeUrl = toRootRelativeUrl(doc.url);
			return rootRelativeUrl === undefined ? [] : [at('url', set(rootRelativeUrl))];
		},
	},
});
