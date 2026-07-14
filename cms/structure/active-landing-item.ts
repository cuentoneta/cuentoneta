import { StarIcon } from '@sanity/icons';

import { LandingPageListPane } from '../components/LandingPageListPane';
import { API_VERSION, resolveActiveLandingId } from '../utils/landing-page';

// Abre directo la landing activa (misma resolución que sirve producción);
// ante error o ausencia, cae al pane, que muestra su propio estado.
export const activeLandingItem = (S, context) =>
	S.listItem()
		.title('Landing activa')
		.id('active-landing')
		.icon(StarIcon)
		.child(() =>
			resolveActiveLandingId(context.getClient({ apiVersion: API_VERSION }))
				.then((id) =>
					id
						? S.document().documentId(id).schemaType('landingPage').title('Landing activa')
						: S.component(LandingPageListPane).title('Landing activa').id('active-landing-empty'),
				)
				.catch(() => S.component(LandingPageListPane).title('Landing activa').id('active-landing-error')),
		);
