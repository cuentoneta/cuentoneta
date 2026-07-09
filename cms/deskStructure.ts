import { singletonDocumentListItems } from 'sanity-plugin-singleton-management';

import { activeLandingItem } from './structure/active-landing-item';
import { contentTypeItems } from './structure/content-type-items';

export default (S, context) =>
	S.list()
		.title('Contenido')
		.items([
			// Registros dedicados de un solo documento (resueltos o singleton), planos y arriba del resto.
			activeLandingItem(S, context),
			...singletonDocumentListItems({ S, context }),
			S.divider(),
			// Tipos de documento navegables, sin carpeta intermedia.
			...contentTypeItems(S, context),
		]);
