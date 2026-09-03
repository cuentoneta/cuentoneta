import type { LandingPage } from '@sanity-types';
import { documentReference, documentSystemFields, slugField } from '../document/sanity-document.factory';
import { onoffAuthorDocument } from '../author/author.document.projection';
import { geometriasDelDesveloCollectionDocument } from '../collection/geometrias-del-desvelo.collection.document';
import { inventarioDeLasPasionesCollectionDocument } from '../collection/inventario-de-las-pasiones.collection.document';
import { geometriaLiteraryWorkDocument } from '../literary-work/geometria.literary-work.document';
import { neronLiteraryWorkDocument } from '../literary-work/neron.literary-work.document';
import { coleccionCompletaContentCampaignDocument } from './coleccion-completa-onoff.content-campaign.document';
import { palacioNueveFronterasContentCampaignDocument } from './el-palacio-de-las-nueve-fronteras.content-campaign.document';

// La semana ISO del `SYSTEM_TIMESTAMP` del corpus, para que el elenco siga hablando de un solo momento.
// Va literal y no calculada: el content lake guarda un string, y derivarla al importar metería una
// dependencia de cálculo de fechas en una capa que solo transcribe lo que Sanity tiene guardado.
const week = '1974-24';

// Sin `cards` ni `latestReads` a propósito: referencian agregados que el corpus no modela como documentos,
// y la guarda del generador aborta ante una referencia colgada. El porqué, en el README del corpus.
// Sus reemplazos —`collections` y `latestLiteraryWorks`— sí entran, porque referencian colecciones y
// obras, que el corpus sí modela; igual que `highlightedAuthors`, cuyo autor existe en el dataset.
//
// Las dos obras destacadas se eligen por capacidad, no por título: una con multimedia y una sin, para
// que la fixture ejercite las dos ramas del mapeo de la vista de navegación.
export const onoffLandingPageDocument: LandingPage = {
	...documentSystemFields(`onoff-landing-page-${week}`),
	_type: 'landingPage',
	config: week,
	slug: slugField(week),
	campaigns: [
		{
			_key: 'coleccion-completa-onoff',
			_type: 'reference',
			_ref: coleccionCompletaContentCampaignDocument._id,
		},
		{
			_key: 'el-palacio-de-las-nueve-fronteras',
			_type: 'reference',
			_ref: palacioNueveFronterasContentCampaignDocument._id,
		},
	],
	collections: [
		{ _key: 'geometrias-del-desvelo', ...documentReference(geometriasDelDesveloCollectionDocument._id) },
		{ _key: 'inventario-de-las-pasiones', ...documentReference(inventarioDeLasPasionesCollectionDocument._id) },
	],
	latestLiteraryWorks: [
		{ _key: 'geometria', ...documentReference(geometriaLiteraryWorkDocument._id) },
		{ _key: 'neron', ...documentReference(neronLiteraryWorkDocument._id) },
	],
	highlightedAuthors: [{ _key: 'francois-onoff', ...documentReference(onoffAuthorDocument._id) }],
};
