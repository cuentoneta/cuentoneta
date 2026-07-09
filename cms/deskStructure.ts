import { activeLandingItem } from './structure/active-landing-item';
import { configurationItem } from './structure/configuration-item';
import { contentItem } from './structure/content-item';

export default (S, context) =>
	S.list()
		.title('Content')
		.items([
			// Registros dedicados (resueltos por query, no listados crudos): arriba y separados del resto.
			activeLandingItem(S, context),
			S.divider(),
			// Gestión de contenido.
			configurationItem(S, context),
			contentItem(S, context),
		]);
